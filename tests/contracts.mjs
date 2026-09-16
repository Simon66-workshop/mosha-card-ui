import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { createServer } from 'vite';

mkdirSync('evidence', { recursive: true });
const server = await createServer({ configFile: false, logLevel: 'error', server: { middlewareMode: true } });
const results = [];
function check(name, run) { try { run(); results.push({ name, pass: true }); console.log('PASS', name); } catch (error) { results.push({ name, pass: false, error: error.message }); console.error('FAIL', name, error.message); } }
try {
  const { defaultParams } = await server.ssrLoadModule('/src/lib/mosha/defaults.ts');
  const exp = await server.ssrLoadModule('/src/lib/mosha/export.ts');
  const { generateMoshaCss } = await server.ssrLoadModule('/src/lib/mosha/recipe.ts');
  const { useStudio } = await server.ssrLoadModule('/src/lib/mosha/store.ts');
  const marker = '</style><script>globalThis.__MOSHA_INJECT__=1</script>';
  const params = () => structuredClone(defaultParams());
  check('default exports contain four cards', () => assert.equal((exp.generateSnippet(params(), 'fan').match(/class="mosha-card"/g) ?? []).length, 4));
  check('HTML text is escaped', () => { const p = params(); p.cards[0].title = '<em>literal & text</em>'; assert.ok(exp.generatePage(p, 'fan').includes('&lt;em&gt;literal &amp; text&lt;/em&gt;')); });
  check('HTML background cannot terminate a style element', () => { const p = params(); p.bg = marker; assert.ok(!exp.generatePage(p, 'fan').includes(marker)); });
  check('HTML tint cannot create an event attribute', () => { const p = params(); p.cards[0].tint = '#000000" onclick="globalThis.__MOSHA_INJECT__=1'; assert.ok(!exp.generateSnippet(p, 'fan').includes('onclick="globalThis.__MOSHA_INJECT__')); });
  check('CSS color rejects declaration injection', () => { const p = params(); p.bg = 'red; background-image:url(https://invalid.example/tracker)'; assert.ok(!generateMoshaCss(p).includes('invalid.example')); });
  check('nonfinite numeric values never reach exported CSS', () => { const p = params(); p.fan.cardW = Infinity; assert.ok(!generateMoshaCss(p).includes('Infinity')); });
  check('generated React accepts JSX-significant literal text', () => {
    const p = params(); p.cards[0].code = 'A "quoted" & <x>';
    p.cards[0].title = '中文 <b> & {notAVariable} " \\ ` ${text}';
    p.cards[0].description = 'line one\nline two </p> {literal}';
    const dir = '.contract-tmp'; mkdirSync(dir, { recursive: true });
    const file = path.resolve(dir, 'MoshaHand.tsx'); writeFileSync(file, exp.generateReactSnippet(p, 'fan'));
    const program = ts.createProgram([file], { noEmit: true, strict: true, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, esModuleInterop: true, skipLibCheck: true });
    const errors = ts.getPreEmitDiagnostics(program).filter(d => d.category === ts.DiagnosticCategory.Error);
    rmSync(dir, { recursive: true, force: true });
    assert.equal(errors.length, 0, errors.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n'));
  });
  check('React export supports keyboard focus', () => assert.ok(exp.generateReactSnippet(params(), 'fan').includes('onFocus')));
  check('HTML export supports keyboard focus', () => assert.match(exp.generatePage(params(), 'fan'), /focusin|addEventListener\(["']focus["']/));
  const restore = (data) => { globalThis.window = { localStorage: { getItem: () => JSON.stringify(data), setItem() {} } }; useStudio.getState().hydrate(); return useStudio.getState(); };
  check('malformed restored cards cannot omit required text', () => { const p = params(); p.cards = p.cards.map(c => ({ id: c.id, title: c.title, tint: c.tint })); assert.equal(typeof restore(p).cards[0].code, 'string'); });
  check('restored card count is capped at six', () => { const p = params(); p.cards = Array.from({length: 50}, (_,i) => ({...p.cards[0], id: 'c'+i})); assert.ok(restore(p).cards.length <= 6); });
  check('invalid restored symbols are normalized', () => { const p = params(); p.cards[0].symbol = 'not-a-symbol'; assert.ok(['diamond','star','club','spade','heart'].includes(restore(p).cards[0].symbol)); });
  check('invalid restored numeric strings are normalized', () => { const p = params(); p.fan.cardW = 'bad'; assert.equal(typeof restore(p).fan.cardW, 'number'); });
  check('restored background is a bounded hex color', () => { const p = params(); p.bg = marker; assert.match(restore(p).bg, /^#[0-9a-f]{6}$/i); });
  check('deleting an earlier card preserves selected identity', () => { useStudio.getState().reset(); useStudio.getState().setSelected(2); const id = useStudio.getState().cards[2].id; useStudio.getState().removeCard(0); const s = useStudio.getState(); assert.equal(s.cards[s.selectedIndex].id, id); });
} finally {
  delete globalThis.window; await server.close();
  const failed = results.filter(r => !r.pass).length;
  writeFileSync('evidence/contracts.json', JSON.stringify({ checked: results.length, passed: results.length-failed, failed, results }, null, 2));
  if (failed || results.length !== 15) process.exitCode = 1;
}
