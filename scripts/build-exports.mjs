import { mkdir, writeFile, cp } from "node:fs/promises";
import { createServer } from "vite";
import { snapshotDirectory } from "./artifact-integrity.mjs";
const server=await createServer({ configFile:false, optimizeDeps:{noDiscovery:true}, server:{middlewareMode:true}, logLevel:"error" });
try {
  const {defaultParams}=await server.ssrLoadModule("/src/lib/mosha/defaults.ts");
  const {generatePage,generateReactSnippet,generateSnippet,INTERACTION_SCRIPT}=await server.ssrLoadModule("/src/lib/mosha/export.ts");
  const {generateMoshaCss}=await server.ssrLoadModule("/src/lib/mosha/recipe.ts");
  const p=defaultParams();
  await mkdir("dist/examples",{recursive:true});await mkdir("dist/css",{recursive:true});
  await writeFile("dist/examples/cards.html",generatePage(p,"fan"));
  await writeFile("dist/examples/MoshaHand.tsx",generateReactSnippet(p,"fan"));
  await writeFile("dist/examples/markup.html",generateSnippet(p,"fan"));
  await writeFile("dist/examples/interactions.js",INTERACTION_SCRIPT);
  await writeFile("dist/css/mosha-card.css",generateMoshaCss(p));
  await writeFile("dist/.nojekyll","");
  await mkdir("dist/demo",{recursive:true});
  await cp("demo/66workshop-operate-15s.mp4","dist/demo/66workshop-operate-15s.mp4",{recursive:true});
  await writeFile("dist/BUILD.json",JSON.stringify({source:process.env.SOURCE_SHA??process.env.GITHUB_SHA??"local",version:"0.2.0"},null,2));
  await mkdir("evidence",{recursive:true});
  await writeFile("evidence/release-input.json",JSON.stringify({source:process.env.GITHUB_SHA??process.env.SOURCE_SHA??"local",files:await snapshotDirectory("dist")},null,2));
} finally { await server.close(); }
