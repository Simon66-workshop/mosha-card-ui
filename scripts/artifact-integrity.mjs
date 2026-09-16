import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

/** Sorted byte-level manifest. Do not follow links out of a release directory. */
export async function snapshotDirectory(root, relative = '') {
  const out = [];
  for (const entry of (await readdir(path.join(root, relative), { withFileTypes: true })).sort((a,b)=>a.name.localeCompare(b.name,'en'))) {
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    assert.ok(!entry.isSymbolicLink(), `Symlink forbidden in release: ${name}`);
    if (entry.isDirectory()) out.push(...await snapshotDirectory(root, name));
    else if (entry.isFile()) {
      const bytes = await readFile(path.join(root, name));
      out.push({ path: name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    } else throw new Error(`Unsupported release entry: ${name}`);
  }
  return out;
}

export function validateAudit(report) {
  assert.ok(report && !report.error && report.metadata?.vulnerabilities, 'Dependency audit unavailable');
  for (const key of ['info','low','moderate','high','critical','total']) assert.equal(report.metadata.vulnerabilities[key], 0, `Dependency finding: ${key}`);
  assert.ok(report.vulnerabilities && Object.keys(report.vulnerabilities).length === 0, 'Dependency entries remain');
}
function complete(report, count, source, countKey = 'checked') {
  assert.equal(report.source, source, 'Report source mismatch');
  assert.equal(report[countKey], count, 'Incomplete case count');
  assert.equal(report.passed, count); assert.equal(report.failed, 0);
  assert.ok(Array.isArray(report.results)); assert.equal(report.results.length, count);
  const names = report.results.map(r => { assert.equal(r.pass,true); assert.equal(typeof r.name,'string'); assert.ok(r.name.trim()); return r.name; });
  assert.equal(new Set(names).size, count, 'Duplicate test case');
}
/** Reject stale, incomplete or tampered reports; this is not proof of outside review. */
export function validateRelease(input) {
  const { source, contracts, edges, browser, audits, recordedFiles, actualFiles, captureHashes } = input;
  assert.match(source, /^[0-9a-f]{40}$/, 'Expected an exact source SHA');
  complete(contracts,15,source); complete(edges,6,source); complete(browser,16,source,'tests');
  assert.equal(browser.status,'PASS');
  for (const key of ['errors','consoleErrors','assetFailures','externalFailures']) assert.deepEqual(browser[key], [], `Browser failures: ${key}`);
  assert.ok(browser.results.some(r => r.name === 'release dist stays byte-identical during browser checks'), 'Missing artifact isolation check');
  assert.equal(audits.length,2); audits.forEach(validateAudit);
  assert.ok(Array.isArray(recordedFiles) && recordedFiles.length > 0, 'Empty release');
  const paths = recordedFiles.map(f => {
    assert.equal(typeof f.path,'string'); assert.ok(!f.path.startsWith('/') && !f.path.split('/').includes('..') && !f.path.includes('\\'), 'Invalid artifact path');
    assert.match(f.sha256,/^[0-9a-f]{64}$/);assert.ok(Number.isSafeInteger(f.bytes)&&f.bytes>=0);return f.path;
  });
  assert.equal(new Set(paths).size,paths.length,'Duplicate artifact path');
  assert.ok(paths.includes('index.html') && paths.includes('BUILD.json'),'Release entrypoint/identity missing');
  assert.ok(!paths.some(p => p.startsWith('react/') || p.includes('hostile.html') || p.split('/').some(part=>part.startsWith('.env'))),'Test or private file in release');
  assert.deepEqual(actualFiles,recordedFiles,'Release changed after build');
  assert.ok(Array.isArray(browser.captures));assert.equal(browser.captures.length,4);
  const shotNames=new Set();
  for(const c of browser.captures){
    assert.match(c.file,/^[a-zA-Z0-9_-]+\.png$/);assert.ok(!shotNames.has(c.file),'Duplicate capture');shotNames.add(c.file);
    assert.match(c.sha256,/^[0-9a-f]{64}$/);assert.equal(captureHashes[c.file],c.sha256,'Screenshot hash mismatch');
  }
  return {status:'PASS',source,contracts:15,edgeCases:6,browserChecks:16,captures:4,releaseFiles:paths.length};
}
