import assert from 'node:assert/strict';
import { createServer as httpServer } from 'node:http';
import { readFile, writeFile, mkdir, stat, cp, rm } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { build, createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { snapshotDirectory } from '../scripts/artifact-integrity.mjs';

await mkdir('evidence/screenshots',{recursive:true});
const releaseBefore=await snapshotDirectory('dist');
await rm('.browser-site',{recursive:true,force:true});
await cp('dist','.browser-site',{recursive:true});
// Compile two independently generated TSX components; neither imports studio code.
const ssr=await createServer({configFile:false,optimizeDeps:{noDiscovery:true},server:{middlewareMode:true},logLevel:'error'});
const {defaultParams,PRESETS}=await ssr.ssrLoadModule('/src/lib/mosha/defaults.ts');
const {generateReactSnippet,generatePage}=await ssr.ssrLoadModule('/src/lib/mosha/export.ts');
const hostile='中文 <b> & {literal} " \\ ` ${text}';
const a=defaultParams(), b=defaultParams();
a.bg='#112233';a.glass.refract=26;a.cards[0].title=hostile;
b.bg='#331122';b.glass.refract=8;b.glass.radius=34;
await mkdir('.react-fixture',{recursive:true});
await writeFile('.react-fixture/A.tsx',generateReactSnippet(a,'fan'));
await writeFile('.react-fixture/B.tsx',generateReactSnippet(b,'stack'));
await writeFile('.react-fixture/index.html','<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0"><h1 id="host" style="color:rgb(255, 128, 0);font-size:26px">Host remains unchanged</h1><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
await writeFile('.react-fixture/main.tsx','import {createRoot} from "react-dom/client";import {MoshaHand as A} from "./A";import {MoshaHand as B} from "./B";createRoot(document.getElementById("root")!).render(<><A/><B/></>);');
await build({configFile:false,root:path.resolve('.react-fixture'),base:'/mosha-card-ui/react/',plugins:[react()],build:{outDir:path.resolve('.browser-site/react'),emptyOutDir:true},logLevel:'error'});
const h=defaultParams();h.bg='</style><script>globalThis.__MOSHA_INJECT__=1</script>';h.cards[0].title=hostile;
await writeFile('.browser-site/examples/hostile.html',generatePage(h,'fan'));
await ssr.close();
const basePath='/mosha-card-ui/', origin='http://127.0.0.1:4173', root=path.resolve('.browser-site');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.mp4':'video/mp4','.json':'application/json'};
const server=httpServer(async(req,res)=>{
 try{
  const u=new URL(req.url,origin);if(!u.pathname.startsWith(basePath)){res.writeHead(404).end();return;}
  let rel=decodeURIComponent(u.pathname.slice(basePath.length));if(!rel||rel.endsWith('/'))rel+='index.html';
  const f=path.resolve(root,rel);if(!f.startsWith(root+path.sep)||!(await stat(f)).isFile()){res.writeHead(404).end();return;}
  res.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});res.end(await readFile(f));
 }catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
const context=await browser.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1.5,permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();const errors=[],consoleErrors=[],assetFailures=[],externalFailures=[],results=[],captures=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')consoleErrors.push({text:m.text(),location:m.location()});});
page.on('response',r=>{if(r.url().startsWith(origin)&&r.status()>=400)assetFailures.push({url:r.url(),status:r.status()});});
page.on('requestfailed',r=>{if(!r.failure()?.errorText.includes('ABORTED'))(r.url().startsWith(origin)?assetFailures:externalFailures).push({url:r.url(),error:r.failure()});});
if(process.env.OFFLINE_FONTS==='1')await context.route('https://fonts.**/**',route=>route.fulfill({status:200,body:'',contentType:'text/css'}));
page.setDefaultTimeout(12000);
const check=async(name,fn)=>{try{await fn();results.push({name,pass:true});console.log('PASS',name);}catch(e){results.push({name,pass:false,error:e.message});console.error('FAIL',name,e.message);}};
async function open(route=''){const response=await page.goto(origin+basePath+route,{waitUntil:'networkidle'});assert.equal(response.status(),200);}
async function capture(name){await page.mouse.move(2,2);await page.waitForTimeout(900);const f=`evidence/screenshots/${name}.png`;await page.screenshot({path:f});captures.push({file:`${name}.png`,sha256:createHash('sha256').update(await readFile(f)).digest('hex'),url:page.url(),viewport:page.viewportSize(),pixelSize:[2160,1500]});}
try {
 await check('studio loads with seven presets and no login',async()=>{await open();assert.match(await page.title(),/Mosha/);assert.equal(await page.locator('.mosha-card').count(),4);assert.equal(Object.keys(PRESETS).length,7);for(const preset of Object.values(PRESETS))assert.ok(await page.getByRole('button',{name:new RegExp('^'+preset.label)}).isVisible());assert.ok(await page.getByRole('button',{name:/液态/}).isVisible());assert.ok(!await page.getByRole('button',{name:/登录/}).count());await page.getByRole('button',{name:'扇形',exact:true}).click();});
 await capture('01-studio');
 await check('fan stack pin and Escape work',async()=>{await page.getByRole('button',{name:'层叠',exact:true}).click();assert.equal(await page.locator('.mosha-hand').getAttribute('data-layout'),'stack');await page.locator('.mosha-card-hit').nth(2).focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.mosha-hand').getAttribute('data-pin'),'1');await page.keyboard.press('Escape');assert.equal(await page.locator('.mosha-hand').getAttribute('data-pin'),'0');await page.getByRole('button',{name:'扇形',exact:true}).click();});
 await check('keyboard edits persist across reload',async()=>{const slider=page.getByRole('slider',{name:'模糊',exact:true});await slider.focus();await page.keyboard.press('ArrowRight');const value=await slider.inputValue();await page.reload({waitUntil:'networkidle'});assert.equal(await slider.inputValue(),value);});
 await check('bad color drafts do not become CSS',async()=>{const input=page.getByRole('textbox',{name:'背景十六进制'});await input.fill('bad');await input.blur();assert.equal(await input.getAttribute('aria-invalid'),'true');assert.notEqual(await page.locator('.mosha-stage').evaluate(el=>el.style.getPropertyValue('--mosha-bg')),'bad');await input.fill('#123');await input.press('Enter');assert.equal(await input.inputValue(),'#112233');});
 await check('card count and preserved selection boundaries',async()=>{await page.getByRole('button',{name:'添加卡片'}).click();await page.getByRole('button',{name:'添加卡片'}).click();assert.equal(await page.locator('.mosha-card').count(),6);assert.ok(await page.getByRole('button',{name:'添加卡片'}).isDisabled());for(let i=0;i<4;i++)await page.getByRole('button',{name:'删除卡片'}).click();assert.equal(await page.locator('.mosha-card').count(),2);assert.ok(await page.getByRole('button',{name:'删除卡片'}).isDisabled());await page.getByRole('button',{name:'重置',exact:true}).click();await page.getByRole('button',{name:'扇形',exact:true}).click();});
 await check('literal text remains literal and HTML download runs',async()=>{await page.getByRole('textbox',{name:'标题',exact:true}).fill(hostile);await page.getByRole('button',{name:'网页',exact:true}).click();await page.getByRole('button',{name:'展开代码'}).click();const code=await page.locator('pre code').innerText();assert.ok(code.includes('&lt;b&gt;'));const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'下载',exact:true}).click();const d=await downloaded;await d.saveAs('evidence/downloaded.html');assert.equal(await readFile('evidence/downloaded.html','utf8'),code);await page.getByRole('button',{name:'收起',exact:true}).click();});
 await check('liquid preset renders and can be pinned',async()=>{await page.getByRole('textbox',{name:'标题',exact:true}).fill('Energy');await page.getByRole('button',{name:/^液态/}).click();await page.locator('.mosha-card-hit').first().focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.mosha-stage').getAttribute('data-refract'),'1');});
 await capture('02-liquid');
 await check('React export is copyable',async()=>{await page.getByRole('button',{name:'React',exact:true}).click();await page.getByRole('button',{name:'展开代码'}).click();await page.getByRole('button',{name:'复制代码',exact:true}).click();const text=await page.evaluate(()=>navigator.clipboard.readText());assert.match(text,/export function MoshaHand/);});
 await capture('03-export');
 await check('exported HTML renders escaped text and keyboard interaction',async()=>{await open('examples/hostile.html');assert.equal(await page.locator('.mosha-card-copy h3').first().innerText(),hostile);assert.equal(await page.evaluate(()=>globalThis.__MOSHA_INJECT__),undefined);await page.locator('.mosha-card-hit').first().focus();assert.ok(await page.locator('.mosha-card').first().evaluate(el=>el.classList.contains('is-active')));await page.keyboard.press('Enter');assert.equal(await page.locator('.mosha-card-hit').first().getAttribute('aria-pressed'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('.mosha-card-hit').first().getAttribute('aria-pressed'),'false');});
 await check('two compiled React exports render without style or filter collision',async()=>{await open('react/');assert.equal(await page.locator('.mosha-stage').count(),2);assert.equal(await page.locator('.mosha-card').count(),8);assert.equal(await page.locator('.mosha-card-copy h3').first().innerText(),hostile);const state=await page.locator('.mosha-stage').evaluateAll(nodes=>nodes.map(n=>({bg:getComputedStyle(n).backgroundColor,id:n.querySelector('filter').id,refract:n.querySelector('feDisplacementMap').getAttribute('scale')})));assert.deepEqual(state.map(s=>s.bg),['rgb(17, 34, 51)','rgb(51, 17, 34)']);assert.notEqual(state[0].id,state[1].id);assert.deepEqual(state.map(s=>s.refract),['26','8']);assert.equal(await page.locator('#host').evaluate(el=>getComputedStyle(el).color),'rgb(255, 128, 0)');await page.locator('.mosha-card-hit').nth(4).focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.mosha-card-hit').nth(4).getAttribute('aria-pressed'),'true');assert.equal(await page.locator('.mosha-card-hit').first().getAttribute('aria-pressed'),'false');});
 await capture('04-react-integration');
 await check('all mobile toolbar controls keep accessible names',async()=>{await page.setViewportSize({width:390,height:844});await open();for(const name of ['扇形','层叠','固定','演示'])assert.ok(await page.getByRole('button',{name,exact:true}).isVisible());await page.getByRole('button',{name:'层叠',exact:true}).click();assert.equal(await page.locator('.mosha-hand').getAttribute('data-layout'),'stack');});
 await check('mobile studio and exports have no horizontal document overflow',async()=>{for(const route of ['', 'examples/cards.html','react/']){await open(route);const width=await page.evaluate(()=>({w:innerWidth,s:document.documentElement.scrollWidth}));assert.ok(width.s<=width.w+1,JSON.stringify({route,width}));}await page.screenshot({path:'evidence/mobile.png'});});
 await check('reduced motion disables automatic demo and spin',async()=>{await page.emulateMedia({reducedMotion:'reduce'});await open();await page.getByRole('button',{name:'重置',exact:true}).click();assert.equal(await page.locator('.mosha-hand').getAttribute('data-demo'),'0');await page.locator('.mosha-card-hit').first().focus();assert.equal(await page.locator('.mosha-card-spin').first().evaluate(el=>getComputedStyle(el).animationName),'none');});
 await check('corrupt storage recovery does not crash the studio',async()=>{await page.evaluate(()=>localStorage.setItem('mosha-studio-v1',JSON.stringify({cards:[{title:'x'},{title:'y'}],fan:{cardW:'bad'},glass:{blur:[]},bg:'invalid'})));await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('.mosha-card').count(),2);assert.ok(await page.getByRole('slider',{name:'宽度',exact:true}).inputValue());});
 await check('release dist stays byte-identical during browser checks',async()=>assert.deepEqual(await snapshotDirectory('dist'),releaseBefore));
 await check('no application exceptions or failed local resources',()=>{assert.deepEqual(errors,[]);assert.deepEqual(assetFailures,[]);const unexpected=consoleErrors.filter(e=>!externalFailures.some(f=>e.location?.url===f.url));assert.deepEqual(unexpected,[]);});
} finally {
 const failed=results.filter(x=>!x.pass).length;
 await writeFile('evidence/browser.json',JSON.stringify({status:failed===0&&results.length===16&&captures.length===4?'PASS':'FAIL_OR_INCOMPLETE',source:process.env.SOURCE_SHA??process.env.GITHUB_SHA??'local',browser:await browser.version(),tests:results.length,passed:results.length-failed,failed,results,captures,errors,consoleErrors,assetFailures,externalFailures,method:'Actual Chromium screenshots and interaction tests of production studio plus generated HTML and separately compiled two-instance TSX. Fixtures are isolated from release dist. No AI image generation.',limits:['Chromium only; not a Safari/iOS certification','External studio fonts are optional; local offline verification may use system fallback','No backend, authentication or model API integration']},null,2));
 await context.close();await browser.close();await new Promise(resolve=>server.close(resolve));if(failed||results.length!==16||captures.length!==4)process.exitCode=1;
}
