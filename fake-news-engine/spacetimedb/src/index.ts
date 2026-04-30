import { schema, table, t, SenderError } from 'spacetimedb/server';
import { TimeDuration } from 'spacetimedb';

const ArticleMetadata = table(
  { name: 'article_metadata', public: true },
  {
    id:           t.u64().primaryKey().autoInc(),
    source_url:   t.string().unique(),
    domain:       t.string().index('btree'),
    headline:     t.string(),
    published_at: t.timestamp(),
    ingested_at:  t.timestamp(),
  }
);

const DetectionInference = table(
  { name: 'detection_inference', public: true },
  {
    article_id:           t.u64().unique(),
    is_processed:         t.bool(),
    classification:       t.string(),  // enum: "Real" | "Fake" | "Unverified"
    confidence_score:     t.f32(),
    model_version:        t.string(),
    flagged_by_newsguard: t.bool(),
  }
);

const SystemUser = table(
  { name: 'system_user', public: true },
  {
    identity:   t.identity().primaryKey(),
    role:       t.string(),  // enum: "Admin" | "Analyst" | "API_Agent"
    created_at: t.timestamp(),
  }
);

const fakeNewsSchema = schema({
  ArticleMetadata,
  DetectionInference,
  SystemUser,
});

export const ingest_news_article = fakeNewsSchema.reducer(
  {
    source_url:     t.string(),
    domain:         t.string(),
    headline:       t.string(),
    published_time: t.timestamp(),
  },
  (ctx, { source_url, domain, headline, published_time }) => {
    const user = ctx.db.SystemUser.identity.find(ctx.sender);
    if (!user || user.role !== 'API_Agent') {
      throw new SenderError("Unauthorized: caller is not an API_Agent.");
    }

    if (ctx.db.ArticleMetadata.source_url.find(source_url)) return;

    const article = ctx.db.ArticleMetadata.insert({
      id:           0n,
      source_url,
      domain,
      headline,
      published_at: published_time,
      ingested_at:  ctx.timestamp,
    });

    ctx.db.DetectionInference.insert({
      article_id:           article.id,
      is_processed:         false,
      classification:       "Unverified",
      confidence_score:     0.0,
      model_version:        "pending",
      flagged_by_newsguard: false,
    });
  }
);

export const finalize_inference = fakeNewsSchema.reducer(
  {
    article_id:     t.u64(),
    classification: t.string(),
    confidence:     t.f32(),
    model_version:  t.string(),
  },
  (ctx, { article_id, classification, confidence, model_version }) => {
    const record = ctx.db.DetectionInference.article_id.find(article_id);
    if (!record) throw new SenderError(`No inference record for article_id ${article_id}.`);

    const safeClass = ["Real", "Fake", "Unverified"].includes(classification)
      ? classification
      : "Unverified";

    ctx.db.DetectionInference.article_id.delete(article_id);
    ctx.db.DetectionInference.insert({
      ...record,
      is_processed:    true,
      classification:  safeClass,
      confidence_score: confidence,
      model_version,
    });
  }
);

const NLP_SYSTEM_PROMPT = `You are a fact-checking classifier for a real-time disinformation detection system.
Analyze the provided news headline for credibility signals.
Respond ONLY with a single valid JSON object — no preamble, no markdown, no explanation:
{"predicted_class":"Real"|"Fake"|"Unverified","confidence_score":0.0-1.0,"model_version":"claude-sonnet-4-20250514"}`;

export const trigger_nlp_analysis = fakeNewsSchema.procedure(
  { article_id: t.u64(), text_payload: t.string() },
  t.unit(),
  (ctx, { article_id, text_payload }) => {
    try {
      const response = ctx.http.fetch(process.env.NLP_ENDPOINT!, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "x-api-key":     process.env.ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 128,
          system:     NLP_SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Classify: "${text_payload}"` }],
        }),
        timeout: TimeDuration.fromMillis(8000),
      });

      if (response.status !== 200) {
        console.error(`NLP endpoint returned ${response.status} for article_id ${article_id}`);
        return {};
      }

      const raw = response.json();
      const textBlock = raw?.content?.find((b: any) => b.type === "text")?.text ?? "";

      let parsed: any;
      try {
        parsed = JSON.parse(textBlock);
      } catch {
        console.error(`Failed to parse NLP JSON for article_id ${article_id}: ${textBlock}`);
        return {};
      }

      ctx.withTx((txCtx) => {
        finalize_inference(txCtx, {
          article_id,
          classification: parsed.predicted_class ?? "Unverified",
          confidence:     parsed.confidence_score ?? 0.0,
          model_version:  parsed.model_version   ?? "unknown",
        });
      });

    } catch (e) {
      console.error(`trigger_nlp_analysis failed for article_id ${article_id}:`, e);
    }

    return {};
  }
);

export const override_classification = fakeNewsSchema.reducer(
  {
    article_id:     t.u64(),
    classification: t.string(),
    rationale:      t.string(),
  },
  (ctx, { article_id, classification, rationale }) => {
    const user = ctx.db.SystemUser.identity.find(ctx.sender);
    if (!user || !["Admin", "Analyst"].includes(user.role)) {
      throw new SenderError("Unauthorized: override requires Admin or Analyst role.");
    }

    const safeClass = ["Real", "Fake", "Unverified"].includes(classification)
      ? classification
      : "Unverified";

    const record = ctx.db.DetectionInference.article_id.find(article_id);
    if (!record) throw new SenderError(`No inference record for article_id ${article_id}.`);

    ctx.db.DetectionInference.article_id.delete(article_id);
    ctx.db.DetectionInference.insert({
      ...record,
      classification:  safeClass,
      model_version:   `manual-override:${user.identity}`,
      is_processed:    true,
    });

    console.log(`[OVERRIDE] article_id=${article_id} → ${safeClass} | reason: ${rationale}`);
  }
);

export const seed_user = fakeNewsSchema.reducer({}, (ctx) => {
  const existing = ctx.db.SystemUser.identity.find(ctx.sender);
  if (!existing) {
    ctx.db.SystemUser.insert({
      identity: ctx.sender,
      role: "API_Agent",
      created_at: ctx.timestamp
    });
  }
});

export default fakeNewsSchema;
