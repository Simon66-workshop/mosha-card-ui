import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
const server = await createServer({configFile:false,optimizeDeps:{noDiscovery:true},server:{middlewareMode:true},logLevel:'error'});
const results=[];
function check(name,run){try{run();results.push({name,pass:true});console.log('PASS',name);}catch(error){results.push({name,pass:false,error:error.message});console.error('FAIL',name,error.message);}}
try {
  const {sanitizeParams,normalizeColor}=await server.ssrLoadModule('/src/lib/mosha/validation.ts');
  check('sparse arrays become complete cards',()=>{
    const p=sanitizeParams({cards:new Array(3)});
    assert.equal(p.cards.length,3);
    assert.equal(p.cards.filter(c=>typeof c.title==='string'&&typeof c.code==='string'&&typeof c.description==='string').length,3);
  });
  check('truncating a title preserves Unicode pairs',()=>{
    const p=sanitizeParams({cards:[{title:'a'.repeat(119)+'😀'},{title:'two'}]});
    assert.ok(p.cards[0].title.length<=120);
    assert.ok(!/[\uD800-\uDBFF]$/.test(p.cards[0].title),'dangling high surrogate at title limit');
  });
  check('mixed malformed card values recover',()=>{
    const p=sanitizeParams({cards:[null,42,[],false,'text',{}]});
    assert.equal(p.cards.length,6);assert.ok(p.cards.every(c=>typeof c.title==='string'));
  });
  check('all invalid color syntax is rejected',()=>{
    for(const v of ['red','url(https://invalid.example)','var(--secret)','#ffffff; color:red','#12',null,{},Infinity])assert.equal(normalizeColor(v),null);
    assert.equal(normalizeColor(' #AbC '),'#aabbcc');
  });
  check('primitive parameter input recovers',()=>{
    for(const v of [null,undefined,3,'text',[],false]){const p=sanitizeParams(v);assert.equal(p.cards.length,4);assert.ok(Number.isFinite(p.fan.cardW));}
  });
  check('normalizing settings does not mutate caller data',()=>{
    const input={cards:[{id:'same',title:'one'},{id:'same',title:'two'}],bg:'#AbC'};
    const before=JSON.stringify(input);const p=sanitizeParams(input);
    assert.equal(JSON.stringify(input),before);assert.notEqual(p.cards[0].id,p.cards[1].id);
  });
} finally {
  await server.close();mkdirSync('evidence',{recursive:true});
  const failed=results.filter(r=>!r.pass).length;
  writeFileSync('evidence/edge-cases.json',JSON.stringify({source:process.env.GITHUB_SHA??process.env.SOURCE_SHA??'local',checked:results.length,passed:results.length-failed,failed,results},null,2));
  if(failed||results.length!==6)process.exitCode=1;
}
