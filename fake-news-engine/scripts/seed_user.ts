import { execSync } from 'child_process';

const DB_NAME = process.env.SPACETIME_DB_NAME || 'fake-news-engine';

try {
  console.log("Seeding API_Agent user...");
  execSync(`spacetime call ${DB_NAME} seed_user`);
  console.log("Successfully seeded API_Agent user.");
} catch (e: any) {
  console.error("Error seeding user:", e.message);
  if (e.stdout) console.log(e.stdout.toString());
  if (e.stderr) console.error(e.stderr.toString());
}
