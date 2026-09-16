import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { validateAudit } from './artifact-integrity.mjs';
mkdirSync('evidence',{recursive:true});
for(const [file,args] of [['audit-all.json',['audit','--json']],['audit-production.json',['audit','--omit=dev','--json']]]){
 const run=spawnSync('npm',args,{encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
 writeFileSync(`evidence/${file}`,run.stdout||JSON.stringify({error:{message:run.error?.message??'No audit output'}}));
 if(run.error||run.signal)throw new Error(`Audit execution failed: ${file}`);
 const report=JSON.parse(run.stdout);validateAudit(report);
 if(run.status!==0)throw new Error(`Audit exited ${run.status}: ${file}`);
 console.log(file,JSON.stringify(report.metadata.vulnerabilities));
}
