#!/usr/bin/env node
// 将固定输入分别交给两个已提交 checkout；保留机器回执，视觉结论由审查者填写。
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const help = `用法：
  node generate-evidence.mjs --check-inputs <checkout>
  node generate-evidence.mjs --base <checkout> --base-sha <完整 SHA> \\
    --candidate <checkout> --candidate-sha <完整 SHA> \\
    --chrome <Chrome 可执行文件> --run-dir <不存在的输出目录> \\
    [--extra-input <额外固定 lifecycle JSON>] [--side both|before|after]

使用当前 Node 执行两个 checkout 的公开 deliver/visual-check 命令。
必须使用 Node 22；每个 checkout 必须干净且 HEAD 与给定 SHA 一致。
默认两个输入保持原始字节；额外输入也只复制，不改写。
每个 HTML 自动截图 light/dark 的 1440×900 和 2048×1320。
机器检查通过不会自动标注感知视觉通过。`;
const args = process.argv.slice(2);
if (!args.length || args.includes('--help')) { console.log(help); process.exit(0); }
const opts = { extra: [] };
for (let i = 0; i < args.length; i += 2) {
  const key = args[i], value = args[i + 1];
  if (!value || value.startsWith('--')) throw new Error(`参数缺少值: ${key}`);
  if (key === '--extra-input') opts.extra.push(path.resolve(value));
  else if (['--base', '--base-sha', '--candidate', '--candidate-sha', '--chrome', '--run-dir', '--check-inputs', '--side'].includes(key)) {
    if (Object.hasOwn(opts, key)) throw new Error(`重复参数: ${key}`);
    opts[key] = value;
  } else throw new Error(`未知参数: ${key}`);
}
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
function run(command, argv, cwd, timeout = 180_000) {
  const result = spawnSync(command, argv, {
    cwd, encoding: 'utf8', timeout, maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, ARCHIFY_UPDATE_CHECK_DISABLED: '1', ARCHIFY_CHROME: opts['--chrome'] || process.env.ARCHIFY_CHROME },
  });
  return { command: [command, ...argv], cwd, exitCode: result.status, signal: result.signal,
    error: result.error?.message ?? null, stdout: result.stdout || '', stderr: result.stderr || '' };
}
function checked(command, argv, cwd) {
  const result = run(command, argv, cwd, 30_000);
  if (result.exitCode !== 0) throw new Error(`${argv.join(' ')}\n${result.stderr || result.error}`);
  return result.stdout.trim();
}
function checkoutInfo(checkout, expected) {
  const directory = fs.realpathSync(path.resolve(checkout));
  const sha = checked('git', ['rev-parse', 'HEAD'], directory);
  if (!/^[a-f\d]{40}$/.test(expected) || sha !== expected) throw new Error(`HEAD 不匹配: ${directory} 实际 ${sha}，要求 ${expected}`);
  const dirty = checked('git', ['status', '--porcelain'], directory);
  if (dirty) throw new Error(`checkout 存在未提交文件，不能绑定提交证据: ${directory}\n${dirty}`);
  return { directory, sha };
}
const cases = JSON.parse(fs.readFileSync(path.join(root, 'cases.json'), 'utf8')).map(entry => {
  const source = path.join(root, entry.input);
  const bytes = fs.readFileSync(source);
  if (digest(bytes) !== entry.sha256) throw new Error(`固定输入摘要改变: ${source}`);
  return { ...entry, source, bytes };
});
for (const [index, source] of opts.extra.entries()) {
  const bytes = fs.readFileSync(source);
  cases.push({ id: `extra-${index + 1}-${path.basename(source).replace(/\.json$/, '').replace(/[^a-zA-Z\d_-]/g, '-')}`,
    source, bytes, sha256: digest(bytes), description: '修订时新增的固定回归输入' });
}
async function schemaResults(directory) {
  const { validateSchema } = await import(pathToFileURL(path.join(directory, 'archify/renderers/shared/validator.mjs')));
  return cases.map(entry => {
    const input = JSON.parse(entry.bytes.toString('utf8'));
    validateSchema('lifecycle', input);
    return { id: entry.id, sha256: entry.sha256, schema: 'pass', states: input.states.length,
      transitions: input.transitions.length, startMarkers: input.states.filter(x => x.type === 'start').length,
      labelCoverage: { laneTitles: input.lanes.length, nodeLabels: input.states.length,
        transitionLabels: input.transitions.filter(x => Boolean(x.label)).length } };
  });
}
if (opts['--check-inputs']) {
  const directory = fs.realpathSync(path.resolve(opts['--check-inputs']));
  console.log(JSON.stringify({ checkout: directory, sha: checked('git', ['rev-parse', 'HEAD'], directory),
    node: process.versions.node, cases: await schemaResults(directory) }, null, 2));
  process.exit(0);
}
const side = opts['--side'] || 'both';
if (!['both', 'before', 'after'].includes(side)) throw new Error('--side 只能是 both、before 或 after');
const required = ['--chrome', '--run-dir', ...(side !== 'after' ? ['--base', '--base-sha'] : []),
  ...(side !== 'before' ? ['--candidate', '--candidate-sha'] : [])];
for (const key of required) {
  if (!opts[key]) throw new Error(`缺少必填参数: ${key}\n${help}`);
}
if (Number(process.versions.node.split('.')[0]) !== 22) throw new Error('请使用已核验的 Node 22 可执行文件运行本脚本');
const base = side !== 'after' ? checkoutInfo(opts['--base'], opts['--base-sha']) : null;
const candidate = side !== 'before' ? checkoutInfo(opts['--candidate'], opts['--candidate-sha']) : null;
const revisions = [['before', base], ['after', candidate]].filter(([, checkout]) => checkout);
const schemaChecks = Object.fromEntries(await Promise.all(revisions.map(async ([name, checkout]) => [name, await schemaResults(checkout.directory)])));
fs.accessSync(opts['--chrome'], fs.constants.X_OK);
const chromeVersion = checked(opts['--chrome'], ['--version'], root);
const runDir = path.resolve(opts['--run-dir']);
if (fs.existsSync(runDir)) throw new Error(`输出目录已存在；请使用新目录避免混用旧证据: ${runDir}`);
fs.mkdirSync(runDir, { recursive: true });
fs.mkdirSync(path.join(runDir, 'inputs'));
const manifest = { createdAt: new Date().toISOString(), side, base, candidate,
  runtime: { executable: process.execPath, node: process.versions.node, zlib: process.versions.zlib,
    chrome: opts['--chrome'], chromeVersion },
  settings: { primaryViewport: [1440, 900], supplementalViewport: [2048, 1320],
    themes: ['light', 'dark'], deviceScaleFactor: 1, browserZoom: '100%',
    detailLevel: 'read', motion: 'still', pageState: 'fresh navigation; no focus, hover, search or zoom interaction',
    notes: 'visual-check 采用全新临时 Chrome profile，等待字体与布局稳定；不改写输入或输出 HTML' },
  schemaChecks, cases: [], stages: [], perceptualReview: 'pending' };
for (const entry of cases) {
  const input = path.join(runDir, 'inputs', `${entry.id}.lifecycle.json`);
  fs.writeFileSync(input, entry.bytes);
  manifest.cases.push({ id: entry.id, input: path.relative(runDir, input), source: entry.source,
    sha256: entry.sha256, description: entry.description });
}
writeJson(path.join(runDir, 'manifest.json'), manifest);
for (const entry of manifest.cases) {
  const input = path.join(runDir, entry.input);
  for (const [side, checkout] of revisions) {
    console.log(`${entry.id} / ${side}: ${checkout.sha}`);
    const directory = path.join(runDir, entry.id, side);
    fs.mkdirSync(directory, { recursive: true });
    const artifact = path.join(directory, `${entry.id}.${side}.html`);
    const cli = path.join(checkout.directory, 'archify/bin/archify.mjs');
    const commands = [['deliver', [cli, 'deliver', 'lifecycle', input, artifact, '--quality', 'showcase', '--json']]];
    for (const [stage, argv] of commands) {
      const result = run(process.execPath, argv, checkout.directory);
      fs.writeFileSync(path.join(directory, `${stage}.stdout.json`), result.stdout);
      fs.writeFileSync(path.join(directory, `${stage}.stderr.log`), result.stderr);
      const { stdout, stderr, ...status } = result;
      manifest.stages.push({ case: entry.id, side, stage, ...status });
    }
    if (fs.existsSync(artifact)) {
      const result = run(process.execPath, [cli, 'visual-check', artifact, '--summary', '--require-provenance',
        '--out-dir', path.join(directory, 'screenshots')], checkout.directory);
      fs.writeFileSync(path.join(directory, 'visual-check.stdout.json'), result.stdout);
      fs.writeFileSync(path.join(directory, 'visual-check.stderr.log'), result.stderr);
      const { stdout, stderr, ...status } = result;
      manifest.stages.push({ case: entry.id, side, stage: 'visual-check', ...status,
        artifactSha256: digest(fs.readFileSync(artifact)) });
    } else manifest.stages.push({ case: entry.id, side, stage: 'visual-check', exitCode: null,
      error: 'deliver 未生成 HTML；保留原失败，未改用较弱 renderer 绕过' });
    if (digest(fs.readFileSync(input)) !== entry.sha256) throw new Error(`生成过程中输入改变: ${input}`);
    checkoutInfo(checkout.directory, checkout.sha);
    writeJson(path.join(runDir, 'manifest.json'), manifest);
  }
}
const failures = manifest.stages.filter(stage => stage.exitCode !== 0);
writeJson(path.join(runDir, 'summary.json'), { automatedFailures: failures,
  generatedCases: manifest.cases.length, perceptualReview: 'pending', manifest: 'manifest.json' });
console.log(`生成结束：${runDir}；机器失败阶段 ${failures.length}；感知视觉审查仍待进行。`);
process.exitCode = failures.some(stage => stage.side === 'after') ? 1 : 0;
