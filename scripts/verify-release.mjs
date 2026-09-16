import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { snapshotDirectory, validateRelease } from './artifact-integrity.mjs';
await mkdir('evidence',{recursive:true});
const json=async file=>JSON.parse(await readFile(file,'utf8'));
try {
 const source=process.env.GITHUB_SHA??process.env.SOURCE_SHA;
 const input=await json('evidence/release-input.json');
 const build=await json('dist/BUILD.json');
 assert.equal(input.source,source,'Manifest source mismatch');assert.equal(build.source,source,'Build source mismatch');
 assert.equal((await readFile('evidence/HEAD.txt','utf8')).trim(),source,'HEAD mismatch');
 const browser=await json('evidence/browser.json'),captureHashes={};
 for(const c of browser.captures){
  assert.match(c.file,/^[a-zA-Z0-9_-]+\.png$/);
  captureHashes[c.file]=createHash('sha256').update(await readFile(`evidence/screenshots/${c.file}`)).digest('hex');
 }
 const result=validateRelease({source,contracts:await json('evidence/contracts.json'),edges:await json('evidence/edge-cases.json'),browser,
  audits:[await json('evidence/audit-all.json'),await json('evidence/audit-production.json')],recordedFiles:input.files,actualFiles:await snapshotDirectory('dist'),captureHashes});
 const own=await json('evidence/release-tests.json');
 assert.equal(own.source,source);assert.equal(own.checked,18);assert.equal(own.passed,18);assert.equal(own.failed,0);
 assert.equal(own.results.length,18);assert.equal(new Set(own.results.map(r=>r.name)).size,18);assert.ok(own.results.every(r=>r.pass===true));
 result.validatorMutationTests=18;result.checkedAt=new Date().toISOString();result.deployment='NOT_PROVEN_BY_THIS_GATE';
 await writeFile('evidence/RELEASE_GATE.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
} catch(error){
 await writeFile('evidence/RELEASE_GATE.json',JSON.stringify({status:'FAIL',error:error.message,checkedAt:new Date().toISOString()},null,2));
 console.error(error);process.exitCode=1;
}
