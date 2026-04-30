import 'dotenv/config';
import Groq from 'groq-sdk';
import { execSync } from 'child_process';
import { DbConnection } from '../src/module_bindings';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const DB_NAME = process.env.SPACETIME_DB_NAME || 'fake-news-engine';
const GROQ_MODEL = process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
const BATCH_SIZE = Math.max(1, Number.parseInt(process.env.GROQ_BATCH_SIZE || '5', 10));
const BATCH_DELAY_MS = Math.max(0, Number.parseInt(process.env.GROQ_BATCH_DELAY_MS || '1200', 10));
const MAX_RETRIES = Math.max(0, Number.parseInt(process.env.GROQ_MAX_RETRIES || '4', 10));
const RETRY_BASE_DELAY_MS = Math.max(100, Number.parseInt(process.env.GROQ_RETRY_BASE_DELAY_MS || '1500', 10));

type Classification = 'Real' | 'Unverified' | 'Fake';

interface ArticleForAnalysis {
  articleId: bigint;
  headline: string;
}

interface AnalysisResult {
  articleId: bigint;
  classification: Classification;
  confidence: number;
}

function getIdentityFromToml(): string | null {
  const tomlPath = path.join(os.homedir(), 'AppData', 'Local', 'SpacetimeDB', 'config', 'cli.toml');
  if (!fs.existsSync(tomlPath)) return null;
  const content = fs.readFileSync(tomlPath, 'utf8');
  const tokenMatch = content.match(/spacetimedb_token\s*=\s*"([^"]+)"/);
  return tokenMatch ? tokenMatch[1] : null;
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(err: unknown): boolean {
  const error = err as { status?: number; response?: { status?: number }; message?: string };
  const status = error?.status ?? error?.response?.status;
  const message = (error?.message || '').toLowerCase();
  return status === 429 || message.includes('rate limit') || message.includes('too many requests');
}

function normalizeClassification(value: unknown): Classification {
  if (value === 'Real' || value === 'Unverified' || value === 'Fake') {
    return value;
  }
  return 'Unverified';
}

function normalizeConfidence(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0.5;
  }
  return Math.max(0, Math.min(1, value));
}

function splitIntoBatches<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

function extractJsonArray(raw: string): unknown[] {
  const trimmed = raw.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Continue and try extracting from text wrappers.
  }

  const match = trimmed.match(/\[[\s\S]*\]/);
  if (!match) {
    throw new Error('Groq response did not contain a JSON array.');
  }
  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed)) {
    throw new Error('Groq response JSON was not an array.');
  }
  return parsed;
}

async function analyzeBatch(articles: ArticleForAnalysis[]): Promise<AnalysisResult[]> {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.startsWith('gsk_dummy')) {
    throw new Error("Missing or invalid real GROQ_API_KEY in .env");
  }

  if (articles.length === 0) {
    return [];
  }

  const batchPayload = articles.map((article) => ({
    articleId: article.articleId.toString(),
    headline: article.headline,
  }));

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    max_tokens: 600,
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content: "You are a factual accuracy analyzer. Return ONLY valid JSON array. For each input item, return an object with fields: articleId (string), classification (exactly 'Real', 'Unverified', or 'Fake'), confidence (number from 0 to 1). Do not include markdown or extra text."
      },
      {
        role: "user",
        content: `Analyze these article headlines and classify each item:\n${JSON.stringify(batchPayload)}`
      }
    ]
  });

  const content = response.choices[0]?.message?.content || '[]';
  const parsedRows = extractJsonArray(content);
  const resultMap = new Map<string, AnalysisResult>();

  for (const row of parsedRows) {
    const rowObj = row as { articleId?: unknown; classification?: unknown; confidence?: unknown };
    if (typeof rowObj.articleId !== 'string') {
      continue;
    }

    const articleId = BigInt(rowObj.articleId);
    resultMap.set(rowObj.articleId, {
      articleId,
      classification: normalizeClassification(rowObj.classification),
      confidence: normalizeConfidence(rowObj.confidence),
    });
  }

  return articles.map((article) => {
    const key = article.articleId.toString();
    return (
      resultMap.get(key) || {
        articleId: article.articleId,
        classification: 'Unverified',
        confidence: 0.5,
      }
    );
  });
}

async function analyzeBatchWithRetry(articles: ArticleForAnalysis[]): Promise<AnalysisResult[]> {
  let attempt = 0;
  while (true) {
    try {
      return await analyzeBatch(articles);
    } catch (error) {
      if (!isRateLimitError(error) || attempt >= MAX_RETRIES) {
        throw error;
      }
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      console.warn(`Rate limited by Groq. Retrying batch in ${delay}ms (attempt ${attempt + 1}/${MAX_RETRIES}).`);
      await sleep(delay);
      attempt++;
    }
  }
}

async function main() {
  const token = getIdentityFromToml();
  if (!token) throw new Error("Could not find auth token in cli.toml");

  const db = DbConnection.builder()
    .withUri('http://localhost:3000')
    .withDatabaseName(DB_NAME)
    .withToken(token)
    .build();

  await new Promise<void>((resolve, reject) => {
    (db as any).onConnect(() => {
      console.log("Connected to SpacetimeDB for Analysis.");
      resolve();
    });
    (db as any).onConnectError((err: any) => reject(err));
  });

  console.log("Starting initial analysis sweep...");

  const inferencesOutput = execSync(`spacetime sql ${DB_NAME} "SELECT i.article_id, m.headline FROM detection_inference i JOIN article_metadata m ON i.article_id = m.id WHERE i.is_processed = false"`, { encoding: 'utf8' });
  console.log("SQL Output:", inferencesOutput);
  
  const unprocessedArticles: ArticleForAnalysis[] = [];
  const articleRegex = /^\s*(\d+)\s*\|\s*(.+)$/;
  for (const line of inferencesOutput.split('\n')) {
    const match = line.match(articleRegex);
    if (match) {
      unprocessedArticles.push({
        articleId: BigInt(match[1]),
        headline: match[2].trim().replace(/^"|"$/g, '')
      });
    }
  }

  console.log(`Found ${unprocessedArticles.length} unprocessed articles.`);

  const batches = splitIntoBatches(unprocessedArticles, BATCH_SIZE);
  console.log(`Sending ${batches.length} Groq request batch(es) with batch size ${BATCH_SIZE}.`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Analyzing batch ${i + 1}/${batches.length} (${batch.length} article(s))...`);
    const batchStart = Date.now();

    const results = await analyzeBatchWithRetry(batch);
    const latency = Date.now() - batchStart;
    console.log(`[Batch Result] ${i + 1}/${batches.length} processed in ${latency}ms`);

    for (const result of results) {
      console.log(`[Result] ID ${result.articleId}: ${result.classification} (Confidence: ${result.confidence})`);
      db.reducers.finalizeInference({
        articleId: result.articleId,
        classification: result.classification,
        confidence: result.confidence,
        modelVersion: "groq-llama-4-scout-17b"
      });
    }

    if (i < batches.length - 1 && BATCH_DELAY_MS > 0) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log("Finished sweep. Exiting.");
  setTimeout(() => {
    db.disconnect();
    process.exit(0);
  }, 1000);
}

main().catch(console.error);
