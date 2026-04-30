import 'dotenv/config';
import { DbConnection, reducers } from '../src/module_bindings';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const DB_NAME = process.env.SPACETIME_DB_NAME || 'fake-news-engine';

function getIdentityFromToml(): string | null {
  const tomlPath = path.join(os.homedir(), 'AppData', 'Local', 'SpacetimeDB', 'config', 'cli.toml');
  if (!fs.existsSync(tomlPath)) return null;
  const content = fs.readFileSync(tomlPath, 'utf8');
  const tokenMatch = content.match(/spacetimedb_token\s*=\s*"([^"]+)"/);
  return tokenMatch ? tokenMatch[1] : null;
}

// Topics to rotate through — each run picks a different one for variety
const QUERY_TOPICS = [
  'politics', 'technology', 'climate change', 'economy', 'health',
  'AI artificial intelligence', 'elections', 'war conflict', 'science',
  'cryptocurrency', 'social media', 'cybersecurity', 'misinformation',
  'energy', 'immigration', 'trade', 'pandemic', 'space exploration',
];

async function fetchArticles() {
  const apiKey = process.env.NEWS_API_AI_KEY;
  if (!apiKey || apiKey.startsWith('dummy-')) {
    console.log("Using mock articles due to missing real NEWS_API_AI_KEY");
    const ts = Date.now();
    const mock = [];
    for(let i=1; i<=50; i++) {
       mock.push({ url: `https://mock.example/article-${ts}-${i}`, source: { uri: "mock.example" }, title: `Mock Article ${ts}-${i}`, dateTimePub: new Date().toISOString() });
    }
    return mock;
  }

  // Pick a random topic and page so each run fetches different articles
  const topic = QUERY_TOPICS[Math.floor(Math.random() * QUERY_TOPICS.length)];
  const page = Math.floor(Math.random() * 3) + 1; // pages 1–3
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(topic)}&pageSize=50&page=${page}&sortBy=publishedAt&apiKey=${apiKey}`;

  console.log(`Fetching from NewsAPI.org — topic="${topic}", page=${page}...`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    // Map newsapi.org format to the expected format
    return (data?.articles || []).map((article: any) => ({
      url: article.url,
      source: { uri: article.source?.name },
      title: article.title,
      dateTimePub: article.publishedAt
    }));
  } catch (e) {
    console.error("News API failed, falling back to mock", e);
    const ts = Date.now();
    const mock = [];
    for(let i=1; i<=50; i++) {
       mock.push({ url: `https://mock.example/article-${ts}-${i}`, source: { uri: "mock.example" }, title: `Mock Article ${ts}-${i}`, dateTimePub: new Date().toISOString() });
    }
    return mock;
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
      console.log("Connected to SpacetimeDB.");
      resolve();
    });
    (db as any).onConnectError((err: any) => reject(err));
  });

  const articles = await fetchArticles();
  let ingested = 0;

  for (const article of articles) {
    if (!article.url || !article.source || !article.title) {
      console.log(`[SKIP] missing field: url, source, or title`);
      continue;
    }
    const publishedTime = article.dateTimePub ? BigInt(new Date(article.dateTimePub).getTime() * 1000) : 0n;
    
    db.reducers.ingestNewsArticle({
      sourceUrl: article.url,
      domain: article.source.uri || "unknown",
      headline: article.title,
      publishedTime: { __timestamp_micros_since_unix_epoch__: publishedTime } as any
    });
    ingested++;
  }

  console.log(`Called ingest_news_article for ${ingested} articles.`);
  
  // Wait a moment for messages to flush
  setTimeout(() => {
    db.disconnect();
    process.exit(0);
  }, 1000);
}

main().catch(console.error);
