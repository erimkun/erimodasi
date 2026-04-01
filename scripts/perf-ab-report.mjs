import fs from 'node:fs';
import path from 'node:path';

const perfDir = path.join(process.cwd(), 'perf-results');
const reportPath = path.join(process.cwd(), 'performance-ab-report.md');

function getSummary(fileName) {
  const raw = fs.readFileSync(path.join(perfDir, fileName), 'utf8');
  const json = JSON.parse(raw);
  return json.summary || null;
}

function findLatestByTag(tag) {
  const files = fs
    .readdirSync(perfDir)
    .filter((f) => f.startsWith(`fps-playwright-${tag}-`) && f.endsWith('.json'))
    .sort();

  if (files.length === 0) return null;
  return files[files.length - 1];
}

function pct(newVal, oldVal) {
  if (!oldVal) return 0;
  return ((newVal - oldVal) / oldVal) * 100;
}

const standardFile = findLatestByTag('standard');
const boostFile = findLatestByTag('boost');

if (!standardFile || !boostFile) {
  console.error('A/B files not found. Expected fps-playwright-standard-*.json and fps-playwright-boost-*.json');
  process.exit(1);
}

const standard = getSummary(standardFile);
const boost = getSummary(boostFile);

if (!standard || !boost) {
  console.error('Could not read summary fields from perf JSON files.');
  process.exit(1);
}

const avgDelta = pct(boost.avg, standard.avg);
const p1Delta = pct(boost.p1Low, standard.p1Low);
const freezeDelta = pct(boost.freezeCount, standard.freezeCount || 1);
const callsDelta = pct(boost.avgRenderCalls, standard.avgRenderCalls || 1);

const markdown = `# Performance A/B Report\n\n## Scenario\n- Standard profile: \`${standardFile}\`\n- Boost profile: \`${boostFile}\`\n\n## Metrics\n| Metric | Standard | Boost | Delta |\n|---|---:|---:|---:|\n| Avg FPS | ${standard.avg} | ${boost.avg} | ${avgDelta.toFixed(2)}% |\n| 1% Low FPS | ${standard.p1Low} | ${boost.p1Low} | ${p1Delta.toFixed(2)}% |\n| Freeze Count | ${standard.freezeCount} | ${boost.freezeCount} | ${freezeDelta.toFixed(2)}% |\n| Avg Render Calls | ${standard.avgRenderCalls} | ${boost.avgRenderCalls} | ${callsDelta.toFixed(2)}% |\n\n## Short Conclusion\nBoost profile improves visual quality (higher DPR + shadow map) and should be accepted if FPS impact stays within expected tolerance on your target devices.\n`;

fs.writeFileSync(reportPath, markdown, 'utf8');
console.log(`A/B report written: ${reportPath}`);
