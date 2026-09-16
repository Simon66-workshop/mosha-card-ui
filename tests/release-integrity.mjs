// Synthetic fixtures test rejection behavior; they are not application evidence.
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { snapshotDirectory, validateRelease } from '../scripts/artifact-integrity.mjs';
const source='a'.repeat(40),hash='b'.repeat(64);
const cases=(n)=>({source,checked:n,passed:n,failed:0,results:Array.from({length:n},(_,i)=>({name:`synthetic case ${i}`,pass:true}))});
function fixture(){
 const browser={...cases(16),tests:16,status:'PASS',errors:[],consoleErrors:[],assetFailures:[],externalFailures:[],captures:Array.from({length:4},(_,i)=>({file:`shot-${i}.png`,sha256:hash}))};
 browser.results[15].name='release dist stays byte-identical during browser checks';
 const files=[{path:'BUILD.json',bytes:1,sha256:hash},{path:'index.html',bytes:1,sha256:hash}];
 const audit={vulnerabilities:{},metadata:{vulnerabilities:{info:0,low:0,moderate:0,high:0,critical:0,total:0}}};
 return {source,contracts:cases(15),edges:cases(6),browser,audits:[structuredClone(audit),structuredClone(audit)],recordedFiles:files,actualFiles:structuredClone(files),captureHashes:Object.fromEntries(browser.captures.map(c=>[c.file,c.sha256]))};
}
const results=[];
async function check(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS',name);}catch(error){results.push({name,pass:false,error:error.message});console.error('FAIL',name,error.message);}}
await check('complete synthetic receipt accepted',()=>assert.equal(validateRelease(fixture()).status,'PASS'));
const mutations=[
 ['stale source rejected',x=>x.browser.source='c'.repeat(40)],
 ['missing case rejected',x=>x.browser.results.pop()],
 ['duplicate case rejected',x=>x.contracts.results[1].name=x.contracts.results[0].name],
 ['false case rejected',x=>x.edges.results[0].pass=false],
 ['forged aggregate rejected',x=>x.contracts.passed=14],
 ['missing isolation check rejected',x=>x.browser.results[15].name='something else'],
 ['console error rejected',x=>x.browser.consoleErrors.push('broken')],
 ['missing audit rejected',x=>x.audits.pop()],
 ['unavailable audit rejected',x=>x.audits[0]={error:{message:'offline'}}],
 ['nonzero advisory rejected',x=>x.audits[0].metadata.vulnerabilities.high=1],
 ['changed release rejected',x=>x.actualFiles[0].bytes=2],
 ['test fixture in release rejected',x=>{x.recordedFiles[0].path='examples/hostile.html';x.actualFiles=structuredClone(x.recordedFiles);}],
 ['duplicate artifact rejected',x=>{x.recordedFiles.push(x.recordedFiles[0]);x.actualFiles=structuredClone(x.recordedFiles);}],
 ['tampered screenshot rejected',x=>x.captureHashes['shot-0.png']='d'.repeat(64)],
 ['duplicate screenshot rejected',x=>x.browser.captures[1]=x.browser.captures[0]],
 ['invalid source rejected',x=>x.source='local'],
];
for(const [name,mutate] of mutations)await check(name,()=>{const x=fixture();mutate(x);assert.throws(()=>validateRelease(x));});
await check('manifest detects bytes and rejects symlinks',async()=>{
 const dir=await mkdtemp(path.join(os.tmpdir(),'mosha-manifest-'));
 try{await writeFile(path.join(dir,'a.txt'),'one');const a=await snapshotDirectory(dir);await writeFile(path.join(dir,'a.txt'),'two');assert.notDeepEqual(await snapshotDirectory(dir),a);await symlink('a.txt',path.join(dir,'link'));await assert.rejects(snapshotDirectory(dir));}finally{await rm(dir,{recursive:true,force:true});}
});
await mkdir('evidence',{recursive:true});const failed=results.filter(r=>!r.pass).length;
await writeFile('evidence/release-tests.json',JSON.stringify({source:process.env.GITHUB_SHA??process.env.SOURCE_SHA??'local',kind:'synthetic validator mutation tests',checked:results.length,passed:results.length-failed,failed,results},null,2));
if(failed||results.length!==18)process.exitCode=1;
