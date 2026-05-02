import 'dotenv/config';
import { spawn } from 'child_process';
// ─── Configuration ───────────────────────────────────────────────────
const CYCLE_INTERVAL_MIN = Number(process.env.PIPELINE_INTERVAL_MIN || '5'); // minutes between cycles
const MAX_CYCLES = Number(process.env.PIPELINE_MAX_CYCLES || '0'); // 0 = infinite
const INGEST_SCRIPT = 'scripts/ingest.ts';
const ANALYZE_SCRIPT = 'scripts/analyze.ts';
// ─── Helpers ─────────────────────────────────────────────────────────
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function timestamp() {
    return new Date().toLocaleTimeString('en-US', { hour12: false });
}
function runScript(script) {
    return new Promise((resolve) => {
        const chunks = [];
        const child = spawn('npx', ['tsx', script], {
            stdio: ['ignore', 'pipe', 'pipe'],
            shell: true,
        });
        child.stdout.on('data', (data) => {
            const text = data.toString();
            chunks.push(text);
            process.stdout.write(text);
        });
        child.stderr.on('data', (data) => {
            const text = data.toString();
            chunks.push(text);
            process.stderr.write(text);
        });
        child.on('close', (code) => {
            resolve({ code: code ?? 1, output: chunks.join('') });
        });
    });
}
// ─── Main Loop ───────────────────────────────────────────────────────
async function main() {
    const intervalMs = CYCLE_INTERVAL_MIN * 60 * 1000;
    let cycle = 0;
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║   FAKE NEWS ENGINE — CONTINUOUS PIPELINE            ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log(`║  Interval:   ${CYCLE_INTERVAL_MIN} minute(s) between cycles`);
    console.log(`║  Max cycles: ${MAX_CYCLES === 0 ? '∞ (infinite)' : MAX_CYCLES}`);
    console.log(`║  Press Ctrl+C to stop                               ║`);
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    while (MAX_CYCLES === 0 || cycle < MAX_CYCLES) {
        cycle++;
        console.log(`\n${'═'.repeat(56)}`);
        console.log(`▶ CYCLE ${cycle} — ${timestamp()}`);
        console.log(`${'═'.repeat(56)}`);
        // ── Step 1: Ingest ──
        console.log(`\n[${timestamp()}] 📥 Ingesting new articles...`);
        const ingestResult = await runScript(INGEST_SCRIPT);
        if (ingestResult.code !== 0) {
            console.error(`[${timestamp()}] ❌ Ingestion failed (exit ${ingestResult.code}). Skipping analysis this cycle.`);
        }
        else {
            console.log(`[${timestamp()}] ✅ Ingestion complete.`);
            // Small gap between ingest and analyze to let SpacetimeDB settle
            await sleep(2000);
            // ── Step 2: Analyze ──
            console.log(`\n[${timestamp()}] 🧠 Analyzing unprocessed articles...`);
            const analyzeResult = await runScript(ANALYZE_SCRIPT);
            if (analyzeResult.code !== 0) {
                console.error(`[${timestamp()}] ❌ Analysis failed (exit ${analyzeResult.code}).`);
            }
            else {
                console.log(`[${timestamp()}] ✅ Analysis complete.`);
            }
        }
        // ── Wait for next cycle ──
        if (MAX_CYCLES !== 0 && cycle >= MAX_CYCLES)
            break;
        console.log(`\n[${timestamp()}] ⏳ Sleeping ${CYCLE_INTERVAL_MIN} minute(s) until next cycle...`);
        await sleep(intervalMs);
    }
    console.log(`\n✅ Pipeline finished after ${cycle} cycle(s).`);
}
// Graceful shutdown on Ctrl+C
process.on('SIGINT', () => {
    console.log('\n\n🛑 Pipeline stopped by user.');
    process.exit(0);
});
main().catch((err) => {
    console.error('💥 Pipeline crashed:', err);
    process.exit(1);
});
