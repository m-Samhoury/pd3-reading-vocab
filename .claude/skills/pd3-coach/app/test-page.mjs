// Whole-page regression test for the Assisted Learning page (headless Chrome over CDP, Node 22+).
//   node .claude/skills/pd3-coach/app/test-page.mjs "file:///…/assisted-learning.html" <scratch-dir> [port]
// Prints one "ok"/"FAIL" line per check and "errors: [...]" with any uncaught page exception.
// Covers Find ord, Forklar mere + translate, lesson cards (tips, pairs, "Med:"), all exercise types,
// the confusables drill, Øvelse, random sessions, sentence lengths and the translate-after-answer row.
// Run it after every change to the page: a past edit silently deleted Find ord / Forklar mere.
import { spawn } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
setTimeout(() => { console.log("SAFETY TIMEOUT"); process.exit(2); }, 110000);
const [, , url, out, port = "9363"] = process.argv;
const profile = out + "/profr8"; rmSync(profile, { recursive: true, force: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
let tabs; for (let i = 0; i < 50; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); } }
const ws = new WebSocket(tabs.find(t => t.type === "page").webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
let id = 0; const pending = {}; const errs = [];
ws.onmessage = m => { const d = JSON.parse(m.data); if (d.method === "Runtime.exceptionThrown") errs.push(d.params.exceptionDetails.exception?.description?.slice(0,700)); if (pending[d.id]) { pending[d.id](d); delete pending[d.id]; } };
const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
const ev = async e => { const r = await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true }); return r.result.exceptionDetails ? "ERR " + r.result.exceptionDetails.exception?.description?.slice(0,200) : r.result.result.value; };
await send("Runtime.enable"); await send("Emulation.setDeviceMetricsOverride", { width: 1000, height: 1400, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: url + "#find" }); await sleep(4000); await ev(`window.alert = () => {}`);
const ok = (name, v) => console.log((typeof v === "string" && v.startsWith("ERR") ? "FAIL " : "ok   ") + name + ": " + JSON.stringify(v).slice(0, 260));
ok("find view", await ev(`(()=>{ const i=$("#fq"); i.value="blandet andet"; i.oninput(); return [$("#fmeta").textContent, [...document.querySelectorAll(".hit .gname")].map(x=>x.textContent).slice(0,2)]; })()`));
ok("find → explain", await ev(`(()=>{ const i=$("#fq"); i.value="imidlertid"; i.oninput(); $("[data-explain]").click(); return [$("#explain").open, $("#explain .big").textContent, !!$("#explain .tipbox"), [...document.querySelectorAll("#explain .warnbox")].map(x=>x.innerText.slice(0,60))]; })()`));
ok("translate button", await ev(`(async()=>{ const b=$("#explain button.tr"); b.click(); await new Promise(r=>setTimeout(r,2500)); return b.parentElement.querySelector(".trl")?.textContent; })()`));
await ev(`$("#exClose").click(); location.hash=""`); await sleep(300);
ok("find bar from #find", await ev(`[$("#findbar").classList.contains("open"), location.hash, !!$("#go")]`));
ok("find bar close/open", await ev(`(async()=>{ $("#fqClose").click(); await new Promise(r=>setTimeout(r,500)); const shut=[$("#findbar").classList.contains("open"), $("#findbar").inert, $("#fq").value];
  S={queue:[{kind:"teach",id:"fordi"}],i:0,results:[],graded:new Set(),title:"t"}; step(); const before=$("#app").innerHTML; $("#navFind").click(); const i=$("#fq"); i.value="fordi"; i.oninput();
  const open=[$("#findbar").classList.contains("open"), $("#navFind").getAttribute("aria-expanded"), document.querySelectorAll("#hits .hit").length, $("#app").innerHTML===before];
  i.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true})); await new Promise(r=>setTimeout(r,500)); const r=[shut, open, $("#findbar").classList.contains("open"), !!S]; home(); return r; })()`));
await ev(`$("#navFind").click(); $("#fq").value="medføre"; $("#fq").oninput()`); await sleep(700); writeFileSync(`${out}/findbar.png`, Buffer.from((await send("Page.captureScreenshot")).result.data, "base64"));
await ev(`$("#fqClose").click()`); await sleep(600);
ok("home", await ev(`[$("#go").textContent, $("#conf").textContent, document.querySelectorAll(".pchip").length]`));
const teach = id => `(()=>{ S={queue:[{kind:"teach",id:${JSON.stringify(id)}}],i:0,results:[],graded:new Set(),title:"t"}; step(); return [$(".q .prepline")?.innerText||null, $(".q .tipbox")?.innerText.replace(/\\n+/g," | ").slice(0,170)||null, document.querySelectorAll(".q .warnbox").length]; })()`;
for (const id of ["at_skyldes", "imidlertid", "at_resultere_i", "et_ansvar", "da", "fordi"]) ok("teach " + id, await ev(teach(id)));
await ev(teach("imidlertid")); writeFileSync(`${out}/tip.png`, Buffer.from((await send("Page.captureScreenshot")).result.data, "base64"));
ok("teach → explain", await ev(`(()=>{ $("#more").click(); return [$("#explain").open, !!$("#explain .tipbox"), document.querySelectorAll("#explain .ex").length]; })()`));
await ev(`$("#exClose").click()`);
for (const [cid, type] of [["at_medføre","meaning"],["da","sense"],["fordi","relation"],["da","cloze"],["at_skyldes","produce"],["fordi","order"],["mens","odd"]])
  ok(`ex ${cid}/${type}`, await ev(`(()=>{ S={queue:[{kind:"ex",id:${JSON.stringify(cid)},type:${JSON.stringify(type)},practice:true}],i:0,results:[],graded:new Set(),title:"t"}; step(); return $(".kind").textContent; })()`));
ok("feedback prepline", await ev(`(async()=>{ S={queue:[{kind:"ex",id:"at_resultere_i",type:"meaning",practice:true}],i:0,results:[],graded:new Set(),title:"t"}; step(); $(".opt").click(); await new Promise(r=>setTimeout(r,30)); return $("#fb .prepline")?.innerText; })()`)); ok("omvendt explain", await ev(`(()=>{ explain(DB.cards.omvendt); const t=$("#explain .ddo").innerText.replace(/\\n+/g," | ").slice(0,330); $("#exClose").click(); return t; })()`)); ok("feedback explain", await ev(`(async()=>{ S={queue:[{kind:"ex",id:"fordi",type:"relation",practice:true}],i:0,results:[],graded:new Set(),title:"t"}; step(); $(".opt").click(); await new Promise(r=>setTimeout(r,30)); $("#fb #more").click(); return [$("#explain").open, $("#explain .big").textContent]; })()`));
await ev(`$("#exClose").click()`);
ok("new pairs", await ev(`(()=>{ const ps=CONFUSABLES.filter(p=>DB.cards[p[0]]&&DB.cards[p[1]]); return [CONFUSABLES.length, ps.length, ps.filter(p=>SAME_MEANING.has(p[0]+"|"+p[1])).length]; })()`));
ok("pair eftersom/efter_at", await ev(`pairItems(["eftersom","efter_at"],3).map(x=>x.id+":"+x.s.slice(x.span[0],x.span[1]))`));
ok("pair imidlertid/dog", await ev(`(()=>{ S={queue:[{kind:"pairsame",pair:["imidlertid","dog"]}],i:0,results:[],graded:new Set(),title:"t",drill:true}; step(); return [...document.querySelectorAll(".opt")].map(b=>b.innerText.split("\\n").pop()); })()`));
ok("drill all groups", await ev(`(async()=>{ setPicked([]); home(); $("#conf").click(); const n=S.queue.length; const w=ms=>new Promise(r=>setTimeout(r,ms));
  for (let k=0;k<60 && S && S.queue && S.i<S.queue.length;k++){ if($("#ans")){ $("#ans").value="x"; $("#chk").click(); } else if($(".opt")){ const b=[...document.querySelectorAll(".opt")]; b[0].click(); b[1].click(); } await w(8); if($("#nx")&&!$("#nx").disabled) $("#nx").click(); await w(8); }
  return [n, $("#app").innerText.slice(0,60).replace(/\\n+/g," | ")]; })()`));
ok("random sessions", await ev(`(async()=>{ localStorage.clear(); const w=ms=>new Promise(r=>setTimeout(r,ms)); let n=0;
  for (let r=0;r<3;r++){ home(); startSession({}); for (let k=0;k<50 && S && S.queue && S.i<S.queue.length;k++){ if($(".opt")&&!$(".opt").disabled){ const b=[...document.querySelectorAll(".opt")]; b[0].click(); b[1]?.click(); } else if($("#idk")) $("#idk").click(); await w(5); if($("#skip")) $("#skip").click(); if($("#nx")&&!$("#nx").disabled) $("#nx").click(); n++; await w(5);} }
  return n; })()`));
ok("øvelse none", await ev(`(()=>{ localStorage.clear(); location.hash=""; setPicked(["årsag"]); home(); return [$("#exer").textContent, $("#exer").disabled]; })()`));
ok("øvelse with learned", await ev(`(async()=>{ ["fordi","da","eftersom","at_skyldes","nemlig"].forEach(id=>grade(id,4)); grade("idet",2); home(); const before=JSON.stringify(["fordi","da","idet"].map(id=>[DB.cards[id].due,DB.cards[id].history.length])); const lbl=[$("#exer").textContent,$("#exer").disabled]; $("#exer").click(); const q=S.queue.map(x=>x.id); const w=ms=>new Promise(r=>setTimeout(r,ms)); const types=[];
  for (let k=0;k<30 && S && S.queue && S.i<S.queue.length;k++){ types.push(S.queue[S.i].type||"?"); await w(5); types[types.length-1]=S.queue[S.i]?.type; if($(".opt")&&!$(".opt").disabled){ $(".opt").click(); [...document.querySelectorAll(".opt")][1]?.click(); } else if($("#idk")) $("#idk").click(); await w(8); if($("#skip")) $("#skip").click(); if($("#nx")&&!$("#nx").disabled) $("#nx").click(); await w(8); }
  const after=JSON.stringify(["fordi","da","idet"].map(id=>[DB.cards[id].due,DB.cards[id].history.length]));
  return [lbl, q, types, before===after, $("#app").innerText.slice(0,260).replace(/\\n+/g," | ")]; })()`));
ok("sentence lengths", await ev(`(()=>{ const L=[]; for (const id of Object.keys(DB.cards)) { const x=ctxSentence(DB.cards[id]); if (x) L.push(x.s.length); } L.sort((a,b)=>a-b); return {n:L.length, median:L[L.length>>1], max:L[L.length-1], over110:L.filter(x=>x>110).length}; })()`));
ok("translate after answer", await ev(`(async()=>{ S={queue:[{kind:"ex",id:"da",type:"sense",practice:true}],i:0,results:[],graded:new Set(),title:"t"}; step(); const before=!!$(".q button.tr"); $(".opt").click(); await new Promise(r=>setTimeout(r,30)); const b=$("#fb .trrow button.tr"); const label=b?.textContent; b.click(); await new Promise(r=>setTimeout(r,2500)); return [before, label, $("#fb .trrow .trl")?.textContent]; })()`));
ok("sense options", await ev(`[...document.querySelectorAll(".opt")].map(b=>b.innerText.replace(/\\n/g," "))`));
ok("base form ok", await ev(`(async()=>{ const s="Forsinkelsen skyldtes sne."; const it={kind:"ex",id:"at_skyldes",type:"produce",practice:true}; S={queue:[it],i:0,results:[],graded:new Set(),title:"t"}; step(); const gap=$(".q .gap")?true:false; $("#ans").value="skyldes"; $("#chk").click(); await new Promise(r=>setTimeout(r,30)); return [gap, S.pending.q, $("#fb h3").innerText, $("#fb .why").innerText.slice(0,80)]; })()`));
ok("flashcards", await ev(`(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); localStorage.clear(); setPicked(["årsag"]); home(); const lbl=$("#flash").textContent; const due0=JSON.stringify(Object.values(DB.cards).map(c=>c.due));
  $("#flash").click(); const n=FC.total, front=$("#fcard .front").innerText.replace(/\\n+/g," | ");
  document.dispatchEvent(new KeyboardEvent("keydown",{key:" ",bubbles:true})); const flipped=$("#fcard .fcin").classList.contains("flipped"), back=$("#fcard .back").innerText.replace(/\\n+/g," | ").slice(0,200);
  $("#fcNo").click(); const afterNo=[FC.pile.length, FC.again.size];
  let k=0; while (FC.pile.length && k++<40) { $("#fcFlip").click(); $("#fcYes").click(); }
  const done=$("#app").innerText.slice(0,120).replace(/\\n+/g," | "); $("#fcHard").click(); const hard=FC.total;
  $(".seg [data-dir=en]").click(); const en=$("#fcard .front").innerText.replace(/\\n+/g," | ");
  return [lbl, n, flipped, afterNo, done.slice(0,60), hard, en.slice(0,40), due0===JSON.stringify(Object.values(DB.cards).map(c=>c.due))]; })()`));
await ev(`$(".seg [data-dir=da]").click(); setPicked([]); startFlash(null); FC.pile.unshift("at_resultere_i"); FC.total++; flashCard()`); await sleep(500); writeFileSync(`${out}/fc-front.png`, Buffer.from((await send("Page.captureScreenshot")).result.data, "base64"));
await ev(`flashFlip()`); await sleep(800); writeFileSync(`${out}/fc-back.png`, Buffer.from((await send("Page.captureScreenshot")).result.data, "base64"));
await ev(`home()`);
// Tankegang board + "Hvilken slags?" drill: chips for every logic card, practice only (no grading), real gaps keep the exam's options
ok("tankegang", await ev(`(()=>{ localStorage.clear(); home(); const link=!!$("#tkLink"), row=$("#logic")?.textContent; $("#tkLink").click();
  const cols=[...document.querySelectorAll(".lgcol")].map(c=>[c.querySelector("h2").textContent, c.querySelectorAll(".lgchip").length]);
  const men=[...document.querySelectorAll(".lgchip")].find(b=>b.dataset.id==="men"), derfor=[...document.querySelectorAll(".lgchip")].find(b=>b.dataset.id==="derfor");
  const ids=Object.keys(LG).length, cov=Object.keys(LG).filter(id=>DB.cards[id]).length; const noscroll=document.documentElement.scrollWidth<=document.documentElement.clientWidth;
  derfor.click(); const ex=[$("#explain").open, $("#explain .big").textContent]; $("#exClose").click();
  document.querySelector("[data-lgfc=ulogisk]").click(); const fc=FC.total; home();
  return [link, row, cols, men.textContent.replace(/\\s+/g," "), derfor.textContent.replace(/\\s+/g," "), ids, cov, noscroll, ex, fc]; })()`));
ok("logic items", await ev(`(()=>{ const it=lgItems(), by={}; it.forEach(x=>{ const k=x.cat+(x.n?" real":" text"); by[k]=(by[k]||0)+1; });
  const bad=it.filter(x=>x.opts&&(x.opts.length!==4||lowFirst(x.opts[x.ans])!==lowFirst(x.w)&&!lowFirst(x.w).startsWith(lowFirst(x.opts[x.ans])))).length;
  const noGap=it.filter(x=>x.s.toLowerCase().slice(x.at,x.at+x.w.length)!==x.w.toLowerCase()).length; const opt4=it.filter(x=>!x.opts).slice(0,40).map(x=>lgOptions(x)).filter(o=>o.length!==4||new Set(o).size!==4).length;
  return [it.length, by, bad, noGap, opt4]; })()`));
ok("logic drill", await ev(`(async()=>{ localStorage.clear(); const w=ms=>new Promise(r=>setTimeout(r,ms)); const due0=JSON.stringify(Object.values(DB.cards).map(c=>[c.due,c.history.length])); startLogic(); const q=GS.queue.map(x=>[x.cat,!!x.n]); const real0=q.findIndex(x=>!x[1]); const cats=new Set(q.map(x=>x[0])).size;
  const first=[$(".lgprev")!==null||GS.queue[0].prev==="", $(".lgcat")!==null, document.querySelectorAll(".lgcat").length, $("#lgopts").children.length]; let n=0, fbs=[], steps=[];
  for (let k=0;k<12 && GS && GS.i<GS.queue.length;k++){ const x=GS.queue[GS.i]; $(".lgcat[data-c='"+x.cat+"']").click(); await w(5); steps.push(document.querySelectorAll(".lgopt").length); const right=x.opts?x.ans:lgOptions(x).indexOf(lowFirst(x.w)); const opts=[...document.querySelectorAll(".lgopt")];
    if (k===1) { opts[(+opts[0].dataset.i===-1)?0:0].click(); } else { document.querySelectorAll(".lgopt")[0].click(); }
    await w(10); fbs.push($("#fb h3")?.textContent); if (k===0) fbs.push([$("#fb .gdiff mark.hl")?.textContent, !!$("#fb [data-more]"), !!$("#fb .trrow button.tr"), $("#fb .gwhy").innerText.replace(/\\n+/g," | ").slice(0,300)]); $("#nx").click(); await w(10); n++; }
  const sum=$("#app").innerText.slice(0,70).replace(/\\n+/g," | "); const redo=!!$("#gmiss"); const st=Object.keys(lgStats()).length; const same=due0===JSON.stringify(Object.values(DB.cards).map(c=>[c.due,c.history.length]));
  if (redo) { $("#gmiss").click(); await w(10); } const redoLen=GS?.queue.length; home();
  return [q.length, cats, real0, first, steps.slice(0,3), n, fbs.slice(0,3), sum, st, same, redoLen]; })()`));
ok("logic give up + keys", await ev(`(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); startLogic(); $("#idk").click(); await w(10); const g=[$("#fb h3").textContent, document.querySelectorAll(".lgcat.right").length];
  $("#nx").click(); await w(10); document.dispatchEvent(new KeyboardEvent("keydown",{key:"2",bubbles:true})); await w(5); const k1=document.querySelectorAll(".lgcat.sel").length, k2=document.querySelectorAll(".lgopt").length; document.dispatchEvent(new KeyboardEvent("keydown",{key:"1",bubbles:true})); await w(5);
  const k3=!!$("#fb .feedback"); $("#gquit").click(); await w(10); const q=[$("#app").innerText.slice(0,40).replace(/\\n+/g," | ")]; home(); return [g,k1,k2,k3,q]; })()`));
await ev(`home()`);
// language button: swaps texts in place, keeps the screen; "left" = interface texts still in the old language
const leftover = `(()=>{ const old=new Set(Object.values(I18N).filter(v=>v[0]!==v[1]&&!/[{<]/.test(v[0])).map(v=>(LANG==="en"?v[0]:v[1]).trim())); const out=[];
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); for(let n;(n=w.nextNode());){ const e=n.parentElement; if(!e||e.closest("script,style")) continue; const l=e.closest("[lang]"); if(l&&l!==document.documentElement) continue; if(e.closest("[inert]")) continue; const k=n.nodeValue.trim(); if(old.has(k)) out.push(k); } return out; })()`;
for (const [name, setup, probe] of [
  ["home", `localStorage.clear(); setPicked([]); home()`, `$("#go").textContent`],
  ["teach", `S={queue:[{kind:"teach",id:"fordi"},{kind:"teach",id:"da"}],i:0,results:[],graded:new Set(),title:"t"}; step()`, `[S.i, $(".q .big")?.textContent]`],
  ["feedback", `S={queue:[{kind:"ex",id:"fordi",type:"relation",practice:true}],i:0,results:[],graded:new Set(),title:"t"}; step(); $(".opt").click()`, `[!!$("#fb"), !!S.pending]`],
  ["flash", `startFlash(["årsag"]); flashFlip()`, `[FC.pile[0], FC.flipped, $("#fcard .fcin").classList.contains("flipped")]`],
  ["find", `home(); $("#navFind").click(); $("#fq").value="fordi"; $("#fq").oninput()`, `[$("#findbar").classList.contains("open"), $("#fq").value, document.querySelectorAll("#hits .hit").length]`],
  ["explain", `explain(DB.cards.imidlertid)`, `[$("#explain").open]`],
  ["tankegang", `home(); tankegang()`, `[document.querySelectorAll(".lgchip").length, !!$("#lgboard")]`],
  ["logic drill", `startLogic(); $(".lgcat").click()`, `[GS.i, document.querySelectorAll(".lgopt").length]`],
]) {
  await ev(setup); await sleep(150);
  const before = await ev(probe);
  await ev(`$(".langbtn").click()`); await sleep(150);
  const after = await ev(probe), left = await ev(leftover), lang = await ev(`[LANG, $(".langbtn").textContent]`);
  await ev(`$(".langbtn").click()`); await sleep(100);
  const back = await ev(leftover);
  ok("lang " + name, [JSON.stringify(before) === JSON.stringify(after) ? "kept" : ["CHANGED", before, after], lang, "left:", left, "back:", back]);
  await ev(`document.querySelector("dialog[open]")?.close(); if ($("#findbar").classList.contains("open")) findClose()`); await sleep(450);
}
console.log("errors:", errs);
await send("Browser.close").catch(() => {}); chrome.kill(); process.exit(0);
