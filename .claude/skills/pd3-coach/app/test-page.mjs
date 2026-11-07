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
// flashcards: batches of 20, the wrong pile drilled to empty, resume, type mode, pictures, chunk, Tankegang, keys
await ev(`DB.images.fordi = { kind: "svg", svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><circle cx="60" cy="45" r="30" fill="var(--pic-a)"/></svg>', alt_da: "test", alt_en: "test" }; DB.images.da = { kind: "photo", file: "flash-img/__missing__.jpg", w: 480, h: 320, credit: "Foto: X · CC0", source: "https://example.org", license: "cc0", alt_da: "t", alt_en: "t" }; window.confirm = () => true; window.FCT = { fresh: (groups, ids, bi) => { localStorage.clear(); startFlash(groups, ids); fcEnter(bi || 0); }, ans: k => { if (!FC.flipped) fcFlip(); fcAnswer(k); } }`);
ok("fc batches", await ev(`(()=>{ localStorage.clear(); setPicked(["l3_ord"]); home(); $("#flash").click(); const s=[FC.screen, FC.st.order.length, document.querySelectorAll(".fcbat").length]; $(".fcbat[data-bi='0']").click(); return s.concat([FC.screen, FC.queue.length, new Set(FC.queue).size, fcIds(1).length]); })()`));
ok("fc wrong pile", await ev(`(()=>{ FCT.fresh(["l3_ord"], null, 0); for (let i=0;i<5;i++) FCT.ans(false); for (let i=0;i<15;i++) FCT.ans(true); const a=[FC.screen, document.querySelectorAll("#fcwrong li").length];
  $("#fcPractice").click(); FCT.ans(true); FCT.ans(true); FCT.ans(false); FCT.ans(false); FCT.ans(false); const b=[FC.screen, FC.pile.length, FC.loop]; for (let i=0;i<3;i++) FCT.ans(true);
  return a.concat(b, [FC.screen, FC.st.score[0] && FC.st.score[0].ok, FC.st.done.includes(0), document.querySelector("#fcdone .score")?.textContent]); })()`));
ok("fc resume", await ev(`(()=>{ FCT.fresh(["l3_ord"], null, 1); FCT.ans(true); FCT.ans(true); FCT.ans(false); home(); $("#flash").click(); $("#fcGo").click(); return [FC.bi, FC.queue.length, FC.st.cur && FC.st.cur.bi, FC.screen]; })()`));
ok("fc no grading", await ev(`(()=>{ const snap=()=>JSON.stringify(Object.values(DB.cards).map(c=>[c.due,c.history.length])); const before=snap(); let calls=0; const g0=grade; grade=(...a)=>{ calls++; return g0(...a); };
  FCT.fresh(["l3_ord"], null, 0); for (let i=0;i<20;i++) FCT.ans(true); grade=g0; return [FC.screen, FC.st.done.includes(0), calls, snap()===before]; })()`));
ok("fc type mode", await ev(`(()=>{ const out=[]; const run = v => { FCT.fresh(null, ["fordi"], 0); FC.dir="en"; FC.mode="type"; fcRender(); const i=$("#fcAns"); i.value=v; i.dispatchEvent(new Event("input")); $("#fcCheck").click(); return FC.result ? FC.result.kind : null; };
  out.push(run("fordi"), run("fordy"), run("hvorfor")); out.push(!!$("#fcard .face.back .prepline"), FC.screen, FC.queue.length); return out; })()`));
ok("fc pictures", await ev(`(()=>{ const out=[]; FCT.fresh(null, ["fordi"], 0); FC.dir="da"; fcRender(); out.push(!$("#fcard .face.front .fcpic"), !!$("#fcard .face.back .fcpic svg"));
  FC.dir="en"; FC.flipped=false; fcRender(); out.push(!!$("#fcard .face.front .fcpic svg"), !$("#fcard .face.back .fcpic")); return out; })()`));
ok("fc missing photo", await ev(`(async()=>{ FCT.fresh(null, ["da"], 0); FC.dir="da"; fcRender(); const before=!!$("#fcard .fcpic img"); await new Promise(r=>setTimeout(r,400)); return [before, !!$("#fcard .fcpic img"), !!$("#fcard .fcpic")]; })()`));
ok("fc chunk", await ev(`(()=>{ const id=Object.keys(DB.info).find(k=>DB.cards[k]&&DB.info[k].forms&&DB.info[k].forms.length); FCT.fresh(null,[id],0); FC.dir="da"; fcRender(); return [id, !!$("#fcard .face.back .fcchunk"), $("#fcard .fcchunk .lbl")?.textContent]; })()`));
ok("fc from tankegang", await ev(`(()=>{ localStorage.clear(); home(); tankegang(); const n=lgRows("ulogisk").reduce((a,r)=>a+r[1].length,0); $("[data-lgfc=ulogisk]").click(); return [FC.screen, FC.kind, FC.st.order.length===n, document.querySelectorAll(".fcbat").length]; })()`));
ok("fc keys", await ev(`(()=>{ FCT.fresh(null, ["fordi","da"], 0); const k=key=>document.dispatchEvent(new KeyboardEvent("keydown",{key,bubbles:true}));
  k(" "); const a=FC.flipped; k("2"); const q1=FC.queue.length; k(" "); const b=FC.flipped; k("1"); return [a, q1, b, Object.values(FC.first), FC.queue.length, FC.screen]; })()`));
await ev(`home()`);
ok("flashcards", await ev(`(()=>{ localStorage.clear(); setPicked(["årsag"]); home(); const lbl=$("#flash").textContent; $("#flash").click(); return [FC.screen, FC.st.order.length, lbl]; })()`));
await ev(`FCT.fresh(null, ["fordi","da","imidlertid"], 0); FC.dir="da"; fcRender()`); await sleep(500); writeFileSync(`${out}/fc-front.png`, Buffer.from((await send("Page.captureScreenshot")).result.data, "base64"));
await ev(`fcFlip()`); await sleep(800); writeFileSync(`${out}/fc-back.png`, Buffer.from((await send("Page.captureScreenshot")).result.data, "base64"));
await ev(`home(); setPicked(["l3_ord"]); home(); $("#flash").click()`); await sleep(300); writeFileSync(`${out}/fc-setup.png`, Buffer.from((await send("Page.captureScreenshot")).result.data, "base64"));
// Tankegang board + "Hvilken slags?" drill: chips for every logic card, practice only (no grading), real gaps keep the exam's options
ok("tankegang", await ev(`(()=>{ localStorage.clear(); home(); const link=!!$("#tkLink"), row=$("#logic")?.textContent; $("#tkLink").click();
  const cols=[...document.querySelectorAll(".lgcol")].map(c=>[c.querySelector("h2").textContent, c.querySelectorAll(".lgchip").length]);
  const men=[...document.querySelectorAll(".lgchip")].find(b=>b.dataset.id==="men"), derfor=[...document.querySelectorAll(".lgchip")].find(b=>b.dataset.id==="derfor");
  const ids=Object.keys(LG).length, cov=Object.keys(LG).filter(id=>DB.cards[id]).length; const noscroll=document.documentElement.scrollWidth<=document.documentElement.clientWidth;
  derfor.click(); const ex=[$("#explain").open, $("#explain .big").textContent]; $("#exClose").click();
  document.querySelector("[data-lgfc=ulogisk]").click(); const fc=FC.total; home();
  return [link, row, cols, men.textContent.replace(/\\s+/g," "), derfor.textContent.replace(/\\s+/g," "), ids, cov, noscroll, ex, fc]; })()`));
ok("logic items", await ev(`(()=>{ const it=lgItems(), by={}; it.forEach(x=>{ by[x.cat]=(by[x.cat]||0)+1; });
  const noGap=it.filter(x=>x.s.slice(x.at,x.at+x.w.length)!==x.w).length;
  return [it.length, by, "gaps not at their place:", noGap]; })()`));
ok("logic drill", await ev(`(async()=>{ localStorage.clear(); const w=ms=>new Promise(r=>setTimeout(r,ms)); const due0=JSON.stringify(Object.values(DB.cards).map(c=>[c.due,c.history.length]));
  startLogic(); const q=GS.queue, x=q[0], kinds=[...new Set(q.map(y=>y.cat))].length, texts=()=>[...document.querySelectorAll(".lgopt")].map(b=>b.textContent.replace(/^\\d/,"").trim());
  const other=LG_CATS.map(c=>c[0]).find(k=>k!==x.cat), pick=k=>$(".lgcat[data-c='"+k+"']").click();
  pick(x.cat); const right1=texts(), rightN=document.querySelectorAll(".lgopt").length;
  pick(x.cat); const right2=texts();
  pick(other); const wrong1=texts(), wrongN=document.querySelectorAll(".lgopt").length;
  pick(other); const wrong2=texts();
  pick(x.cat); const again=texts();
  [...document.querySelectorAll(".lgopt")].find(b=>b.textContent.replace(/^\\d/,"").trim().toLowerCase()===x.w.toLowerCase()).click(); await w(10);
  const h3=$("#fb h3")?.textContent, same=JSON.stringify(Object.values(DB.cards).map(c=>[c.due,c.history.length]))===due0;
  return [["queue", q.length, "kinds", kinds], ["right kind", rightN, right1, "same on re-click", JSON.stringify(right1)===JSON.stringify(right2), JSON.stringify(again)===JSON.stringify(right1)], ["wrong kind", wrongN, wrong1, "same on re-click", JSON.stringify(wrong1)===JSON.stringify(wrong2)], ["answer", x.w, h3===t("gm.right"), h3], ["SM-2 unchanged", same]]; })()`));
ok("logic give up + keys", await ev(`(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); startLogic(); $("#idk").click(); await w(10); const g=[$("#fb h3").textContent, document.querySelectorAll(".lgcat.right").length];
  $("#nx").click(); await w(10); const k=key=>document.dispatchEvent(new KeyboardEvent("keydown",{key,bubbles:true})); const picks=[];
  for (const n of ["1","2","3","4"]) { grLogic(GS.queue[0]); k(n); await w(5); picks.push([document.querySelector(".lgcat.sel")?.dataset.c, document.querySelectorAll(".lgopt").length]); }
  grLogic(GS.queue[0]); k("4"); await w(5); k("2"); await w(10); const k3=[$("#fb h3")?.textContent, !!$("#fb .feedback")];
  $("#gquit").click(); await w(10); const q=[$("#app").innerText.slice(0,40).replace(/\\n+/g," | ")]; home(); return [g, picks, k3, q]; })()`));
// Hvilken slags? rounds: no word twice, a wrong sentence comes back until right (the score is the first try), one kind at a time, phone width
const lgSolve = `const solve=async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); while (GS.i < GS.queue.length) { const y=GS.queue[GS.i]; $(".lgcat[data-c='"+y.cat+"']").click(); [...document.querySelectorAll(".lgopt")].find(b=>b.textContent.replace(/^\\d/,"").trim().toLowerCase()===y.w.toLowerCase()).click(); await w(5); $("#nx").click(); await w(5); } };`;
ok("logic no repeats", await ev(`(()=>{ localStorage.clear(); startLogic(); const cards=GS.queue.map(x=>x.card), distinct=new Set(cards).size, pool=new Set(lgItems().map(x=>x.card)).size;
  const twice=cards.some((c,i)=>i && c===cards[i-1]);
  return [GS.queue.length, "distinct cards in round", distinct, "distinct cards in pool", pool, "same card as neighbour", twice, "kinds", new Set(GS.queue.map(x=>x.cat)).size]; })()`));
ok("logic retry", await ev(`(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); ${lgSolve} localStorage.clear(); startLogic(); const n0=GS.queue.length, x=GS.queue[0];
  const wrongCat=LG_CATS.map(c=>c[0]).find(k=>k!==x.cat); $(".lgcat[data-c='"+wrongCat+"']").click(); document.querySelectorAll(".lgopt")[0].click(); await w(10);
  const afterWrong=[GS.queue.length-n0, GS.queue[GS.queue.length-1].retry, GS.queue[GS.queue.length-1].id===x.id, GS.results.length, GS.results[0].ok];
  $("#nx").click(); await w(10); await solve(); await w(10);
  return afterWrong.concat(["results at the end", GS.results.length, "queue", GS.queue.length, "first try score", GS.results.filter(r=>r.ok).length, "summary", $("#app h2")?.textContent]); })()`));
ok("logic one kind", await ev(`(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); ${lgSolve} localStorage.clear(); startLogic(null, "ulogisk");
  const q=GS.queue, first=[q.every(x=>x.cat==="ulogisk"), GS.title, GS.kind, q.length, new Set(q.map(x=>x.card)).size];
  await solve(); await w(10); const again=$("#gagain"); again.click(); await w(20);
  return first.concat(["after again", GS.kind, GS.queue.every(x=>x.cat==="ulogisk"), GS.title, GS.queue.length]); })()`));
ok("tankegang one-kind buttons", await ev(`(()=>{ home(); tankegang(); return [document.querySelectorAll("[data-lgdrill]").length, [...document.querySelectorAll("[data-lgdrill]")].map(b=>b.dataset.lgdrill).join(","), document.querySelector("[data-lgdrill]")?.textContent.trim()]; })()`));
await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 800, deviceScaleFactor: 1, mobile: true }); await sleep(300);
ok("tankegang 375px no horizontal scroll", await ev(`(()=>{ home(); tankegang(); return [document.documentElement.scrollWidth <= document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.clientWidth]; })()`));
await send("Emulation.setDeviceMetricsOverride", { width: 1000, height: 1400, deviceScaleFactor: 1, mobile: false }); await sleep(200);
await ev(`home()`);
// Sortér ordene (Tankegang): both sets, a right and a wrong answer by button, the wrong pile back, keys 1–4, a real mouse drag,
// the tap fallback, the score screen, no SM-2 change, and no horizontal scroll at phone width
ok("sort start", await ev(`(()=>{ localStorage.clear(); home(); tankegang(); const btn=!!$("#soGo"); window.__snap0=JSON.stringify(Object.values(DB.cards).map(c=>[c.due,c.history.length,c.ef,c.interval]));
  $("#soGo").click(); return [btn, !!$("#soWord"), SO.set, SO.queue.length, document.querySelectorAll(".sob").length, $(".sowrd").textContent]; })()`));
ok("sort order set", await ev(`(()=>{ document.querySelector("[data-set=order]").click(); const w=SO.queue.map(id=>LG[id][1]);
  return [SO.set, SO.queue.length, [...document.querySelectorAll(".sob")].map(b=>b.dataset.b).join(","), w.every(x=>["ADV","SUB","KOO","PRAEP"].includes(x)), !!document.querySelector("[data-set=order][aria-pressed=true]")]; })()`));
ok("sort right answer", await ev(`(()=>{ document.querySelector("[data-set=logic]").click(); const id=SO.queue[SO.i], k=LG[id][0]; document.querySelector('.sob[data-b="'+k+'"]').click();
  const r=[!!$(".feedback.ok"), $(".sob.right")?.dataset.b===k, SO.first[id], soStore().words[id]]; $("#nx").click(); return r.concat(SO.i); })()`));
ok("sort wrong answer", await ev(`(()=>{ const id=SO.queue[SO.i], k=LG[id][0], wrong=SO_SETS.logic.map(b=>b[0]).find(x=>x!==k); window.__soWrong=id; document.querySelector('.sob[data-b="'+wrong+'"]').click();
  return [!!$(".feedback.bad"), $(".sob.wrong")?.dataset.b===wrong, $(".sob.right")?.dataset.b===k, $("#fb").innerText.includes("er ikke"), SO.pile.length, soStore().words[id]]; })()`));
ok("sort round, pile, score", await ev(`(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); const out=[];
  $("#nx").click(); await w(20);
  while (SO.pass===1 && !SO.done) { const id=SO.queue[SO.i]; document.querySelector('.sob[data-b="'+soKey(SO.set,id)+'"]').click(); await w(5); $("#nx").click(); await w(5); }
  out.push(SO.pass, SO.queue.length, SO.queue[0]===window.__soWrong, SO.i, SO.pile.length);
  document.querySelector('.sob[data-b="'+soKey(SO.set,SO.queue[0])+'"]').click(); await w(5); $("#nx").click(); await w(20);
  out.push(SO.done, $(".score")?.textContent, !!$("#soAgain"), $("#app").innerText.includes(DB.cards[window.__soWrong].word), JSON.stringify(Object.values(DB.cards).map(c=>[c.due,c.history.length,c.ef,c.interval]))===window.__snap0);
  return out; })()`));
ok("sort keys 1-4 + Enter", await ev(`(async()=>{ const w=ms=>new Promise(r=>setTimeout(r,ms)); soStart("logic"); const k=key=>document.dispatchEvent(new KeyboardEvent("keydown",{key,bubbles:true}));
  k("5"); const none=SO.ans; k("2"); const a=SO.ans&&SO.ans.b, i0=SO.i; k("3"); const same=SO.ans.b===a; k("Enter"); await w(20);
  return [none, a===SO_SETS.logic[1][0], same, SO.i===i0+1]; })()`));
const mouse = (type, x, y) => send("Input.dispatchMouseEvent", { type, x, y, button: "left", buttons: type === "mouseReleased" ? 0 : 1, clickCount: 1 });
const dr = await ev(`(()=>{ soStart("logic"); const id=SO.queue[SO.i], k=LG[id][0], r=$("#soWord").getBoundingClientRect(), b=document.querySelector('.sob[data-b="'+k+'"]').getBoundingClientRect();
  return {from:[r.x+r.width/2, r.y+r.height/2], to:[b.x+b.width/2, b.y+b.height/2]}; })()`);
const [fx, fy] = dr.from, [tx, ty] = dr.to;   // a real mouse drag: the word card to its right bucket
await mouse("mouseMoved", fx, fy); await mouse("mousePressed", fx, fy);
for (let s = 1; s <= 6; s++) await mouse("mouseMoved", fx + (tx - fx) * s / 6, fy + (ty - fy) * s / 6);
const mid = await ev(`[!!document.querySelector(".sogh"), document.querySelectorAll(".sob.over").length]`);
await mouse("mouseReleased", tx, ty); await sleep(200);
ok("sort drag with mouse", [mid, await ev(`[!!$(".feedback.ok"), !document.querySelector(".sogh"), SO.ans && SO.ans.ok]`)]);
await ev(`$("#nx").click(); soStart("logic")`); await sleep(100);
const t0 = await ev(`(()=>{ const r=$("#soWord").getBoundingClientRect(); return [r.x+r.width/2, r.y+r.height/2]; })()`);
await mouse("mouseMoved", t0[0], t0[1]); await mouse("mousePressed", t0[0], t0[1]); await mouse("mouseReleased", t0[0], t0[1]); await sleep(100);
ok("sort tap picks up", await ev(`[SO.picked, !!$("#soWord.picked"), SO.ans]`));
ok("sort tap then bucket", await ev(`(()=>{ document.querySelector(".sob").click(); return [!!SO.ans, !!$(".feedback")]; })()`));
ok("sort phone width", await ev(`(async()=>{ soStart("order"); return document.documentElement.scrollWidth <= document.documentElement.clientWidth; })()`));
await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 800, deviceScaleFactor: 1, mobile: true }); await sleep(300);
// Mock Læsning 3: hand-written items, 4 options that never share kind of logic + word type, fixed order on re-render, review explains every option
ok("mock options", await ev(`(()=>{ localStorage.clear(); picked = []; startMock(); const all=[MK.example, ...MK.items];
  const sig = o => { const i=Object.keys(LG).find(i=>DB.cards[i] && (lowFirst(DB.cards[i].word)===o || variants(DB.cards[i].word).includes(norm(o)))); return i ? LG[i].join(".") : "?"+o; };
  const bad = all.filter(x => x.opts.length!==4 || new Set(x.opts.map(sig)).size!==4 || x.opts[x.right]!==lowFirst(x.w));
  const before = MK.items.map(x=>x.opts.join("/")).join("|"); document.querySelector('.mkcell[data-r="0"][data-o="1"]').click(); const same = MK.items.map(x=>x.opts.join("/")).join("|")===before;
  const lis = [...document.querySelectorAll(".mksents li")], shown = MK.items.filter((x,i) => { const tx = lis[i].textContent; return tx.includes(x.s) || !tx.includes(x.s.slice(0, x.at) + "(" + (i+1) + ")\\u00a0…" + x.s.slice(x.at + x.w.length)); });
  return [MK.items.length, "bad sets", bad.map(x=>x.s), "same after click", same, document.querySelectorAll(".mkrow").length, "answer shown or gap misplaced", shown.map(x=>x.s)]; })()`));
ok("mock review", await ev(`(()=>{ MK.items.forEach((x,i)=>MK.ans[i]=x.right); MK.ans[0]=(MK.items[0].right+1)%4; mockView(); $("#mkdone").click();
  return [$(".mkresult .score").textContent, document.querySelectorAll(".mkrev").length, document.querySelectorAll(".mkrev .mkok").length, $(".mkrev").innerText.includes("Svarmulighederne")]; })()`));
ok("sort 375px no horizontal scroll",await ev(`(()=>{ soStart("logic"); return [document.documentElement.scrollWidth <= document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.clientWidth]; })()`));
await send("Emulation.setDeviceMetricsOverride", { width: 1000, height: 1400, deviceScaleFactor: 1, mobile: false }); await sleep(200);
await ev(`home()`);

// Læsning 2B · Indsæt tekststykket: home, data, level 1 (piece, reason, feedback, misses), level 2 (hooks),
// level 3 (letters, the review and the extras), the phone width, and screenshots of the states the plan asks for
const shot = async name => writeFileSync(`${out}/${name}`, Buffer.from((await send("Page.captureScreenshot")).result.data, "base64"));
ok("l2b home", await ev(`(()=>{ localStorage.clear(); l2bHome(); return [document.querySelectorAll(".lbcard").length, document.querySelectorAll(".lbtrow").length, !!$("#lbheld"), document.querySelectorAll("[data-lv]").length]; })()`));
await shot("l2b-home.png");
ok("l2b data", await ev(`(()=>{ const D=DB.l2b, bad=[];
  for (const g of D.gaps) { if (g.traps.length!==2 || g.traps[0].trap===g.traps[1].trap) bad.push("traps "+g.id); if (g.reasons.length!==3) bad.push("reasons "+g.id); if (g.src.startsWith("2022v")) bad.push("2022v gap "+g.id); }
  for (const h of D.hooks) if (h.src.startsWith("2022v")) bad.push("2022v hook "+h.id);
  for (const s of D.sets) { const letters=Object.values(s.key), uniq=new Set(letters).size===letters.length; const extras=Object.keys(s.pieces).filter(l=>!letters.includes(l)).sort().join(""); if(!uniq||extras!==Object.keys(s.extra).sort().join("")) bad.push("set "+s.id); if (s.src.startsWith("2022v")!==!!s.hold) bad.push("hold "+s.id); }
  return [D.gaps.length, D.gaps.filter(g=>!g.ai).length, D.hooks.length, D.hooks.filter(h=>!h.ai).length, D.sets.length, D.sets.filter(s=>s.hold).map(s=>s.id), "bad", bad]; })()`));
ok("l2b level 1", await ev(`(()=>{ localStorage.clear(); lbStart(1); const it=LB.queue[0];
  const b0=[...document.querySelectorAll(".lbopt")].map(b=>b.textContent).join("|"); lbRender(); const orderKept=b0===[...document.querySelectorAll(".lbopt")].map(b=>b.textContent).join("|");
  const w=it.opts.findIndex(o=>!o.ok); document.querySelector('[data-pk="'+w+'"]').click(); document.querySelector('[data-rs="0"]').click();
  const fb=!!document.querySelector(".lbfb"), pills=[...document.querySelectorAll(".lbfbt .lbpill")].map(x=>x.textContent), hl=document.querySelectorAll(".lbfull mark.hl").length;
  const miss=(JSON.parse(localStorage.getItem("pd3-assisted-learning:l2b:v1")||"{}").miss||[]).includes(it.id);
  return [orderKept, fb, pills.length>=1, hl>=1, miss, LB.phase]; })()`));
await shot("l2b-level1-feedback.png");
ok("l2b level 2", await ev(`(()=>{ localStorage.clear(); lbStart(2); const it=LB.queue[0];
  it.hooks.forEach(i=>document.querySelector('[data-tap="'+i+'"]').click()); document.querySelector("#lbcheck").click();
  const right=LB.res.at(-1).ok, shownRight=!!document.querySelector(".lbfb.ok");
  lbStart(2); const it2=LB.queue[0], wrong=it2.tokens.findIndex((x,i)=>x.trim() && !it2.hooks.includes(i));
  document.querySelector('[data-tap="'+wrong+'"]').click(); document.querySelector("#lbcheck").click();
  return [right, shownRight, LB.res.at(-1).ok, document.querySelectorAll(".lbw.bad").length]; })()`));
await shot("l2b-level2-check.png");
ok("l2b level 3", await ev(`(()=>{ localStorage.clear(); lbSetStart("s-2023s", false); const s=LB.set;
  document.querySelector('.lbcell[data-g="1"][data-l="A"]').click(); document.querySelector('.lbcell[data-g="2"][data-l="A"]').click();
  const oneRow=document.querySelectorAll('.lbcell.sel[data-l="A"]').length;
  lbSetStart("s-2023s", false);
  for (let g=1; g<=5; g++) document.querySelector('.lbcell[data-g="'+g+'"][data-l="'+s.key[g]+'"]').click();
  document.querySelector("#lbhand").click();
  return [oneRow, document.querySelector(".lbresult .score")?.textContent, document.querySelectorAll(".lbrev").length, document.querySelectorAll("[data-x]").length]; })()`));
await shot("l2b-level3-review.png");
await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 800, deviceScaleFactor: 1, mobile: true }); await sleep(300);
ok("l2b 375px", await ev(`(()=>{ localStorage.clear(); lbSetStart("s-2023s", false); const a=[document.documentElement.scrollWidth <= document.documentElement.clientWidth, document.documentElement.scrollWidth];
  document.querySelector('.lbcell[data-g="1"][data-l="A"]').click(); lbHand(); return a.concat([document.documentElement.scrollWidth <= document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.clientWidth]); })()`));
await shot("l2b-level3-375.png");
ok("l2b home 375px", await ev(`(()=>{ l2bHome(); return [document.documentElement.scrollWidth <= document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.clientWidth]; })()`));
await shot("l2b-home-375.png");
await send("Emulation.setDeviceMetricsOverride", { width: 1000, height: 1400, deviceScaleFactor: 1, mobile: false }); await sleep(200);
ok("l2b home banner", await ev(`(()=>{ home(); return [!!$("#l2bGo"), document.querySelectorAll(".l2bbanner").length]; })()`));
await ev(`$("#l2bGo").scrollIntoView({ block: "center" })`); await sleep(200); await shot("l2b-home-banner.png");
await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 800, deviceScaleFactor: 1, mobile: true }); await sleep(300);
ok("l2b home banner 375px", await ev(`(()=>{ home(); return [!!$("#l2bGo"), document.documentElement.scrollWidth <= document.documentElement.clientWidth]; })()`));
await ev(`$("#l2bGo").scrollIntoView({ block: "center" })`); await sleep(200); await shot("l2b-home-banner-375.png");
await send("Emulation.setDeviceMetricsOverride", { width: 1000, height: 1400, deviceScaleFactor: 1, mobile: false }); await sleep(200);
await ev(`home()`);

// language button: swaps texts in place, keeps the screen; "left" = interface texts still in the old language
const leftover = `(()=>{ const old=new Set(Object.values(I18N).filter(v=>v[0]!==v[1]&&!/[{<]/.test(v[0])).map(v=>(LANG==="en"?v[0]:v[1]).trim())); const out=[];
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); for(let n;(n=w.nextNode());){ const e=n.parentElement; if(!e||e.closest("script,style")) continue; const l=e.closest("[lang]"); if(l&&l!==document.documentElement) continue; if(e.closest("[inert]")) continue; const k=n.nodeValue.trim(); if(old.has(k)) out.push(k); } return out; })()`;
for (const [name, setup, probe] of [
  ["home", `localStorage.clear(); setPicked([]); home()`, `$("#go").textContent`],
  ["teach", `S={queue:[{kind:"teach",id:"fordi"},{kind:"teach",id:"da"}],i:0,results:[],graded:new Set(),title:"t"}; step()`, `[S.i, $(".q .big")?.textContent]`],
  ["feedback", `S={queue:[{kind:"ex",id:"fordi",type:"relation",practice:true}],i:0,results:[],graded:new Set(),title:"t"}; step(); $(".opt").click()`, `[!!$("#fb"), !!S.pending]`],
  ["flash setup", `localStorage.clear(); setPicked([]); startFlash(["årsag"])`, `[FC.screen, document.querySelectorAll(".fcbat").length]`],
  ["flash card", `startFlash(["årsag"]); fcEnter(0); FC.flipped = false; fcRender()`, `[FC.screen, FC.queue[0], FC.flipped]`],
  ["flash wrong pile", `startFlash(["årsag"]); fcEnter(0); const id = fcIds(0)[0]; FC.phase = "first"; FC.queue = []; FC.first = { [id]: false }; fcAdvance()`, `[FC.screen, FC.pile.length]`],
  ["flash batch done", `FC.screen = "batchDone"; FC.st.score[0] = { ok: 1, n: 2, wrong: [] }; fcRender()`, `[FC.screen, $("#fcdone .score")?.textContent]`],
  ["flash all done", `FC.screen = "allDone"; fcRender()`, `[FC.screen, !!$("#fcalldone")]`],
  ["find", `home(); $("#navFind").click(); $("#fq").value="fordi"; $("#fq").oninput()`, `[$("#findbar").classList.contains("open"), $("#fq").value, document.querySelectorAll("#hits .hit").length]`],
  ["explain", `explain(DB.cards.imidlertid)`, `[$("#explain").open]`],
  ["tankegang", `home(); tankegang()`, `[document.querySelectorAll(".lgchip").length, !!$("#lgboard")]`],
  ["logic drill", `startLogic(); $(".lgcat").click()`, `[GS.i, document.querySelectorAll(".lgopt").length]`],
  ["sort", `soStart("order")`, `[SO.i, SO.set, SO.queue.length, !!$("#soWord"), document.querySelectorAll(".sob").length]`],
  ["l2b home", `l2bHome()`, `[document.querySelectorAll(".lbcard").length, !!$("#lbheld")]`],
  ["l2b level 1", `localStorage.clear(); lbStart(1)`, `[LB.i, document.querySelectorAll(".lbopt").length]`],
  ["l2b level 3", `lbSetStart("s-2023s", false)`, `[LB.n, document.querySelectorAll(".lbcell").length]`],
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
ok("mine create", await ev(`(()=>{ localStorage.clear(); MINE=[]; mineIndex(); mineView(null); $("#mnName").value="Test ord"; $("#mnNew").requestSubmit(); return [MINE.length, !!$("#mnq"), GROUPS[MINE[0].id][2]]; })()`));
ok("mine search+add", await ev(`(()=>{ $("#mnq").value="medføre"; mnHits(); document.querySelector("[data-mn-tog]").click(); $("#mnq").value="fordi"; mnHits(); document.querySelector('[data-mn-tog="fordi"]').click(); return [MINE[0].ids, document.querySelectorAll("#mnwords .pchip").length, groupsOf(DB.cards.fordi).includes(MINE[0].id), $("#mnhits .mnprep") ? $("#mnhits .mnprep").textContent : null]; })()`));
ok("mine as topic", await ev(`(()=>{ home(); const r=[!!$("#mineLink"), byGroup()[MINE[0].id].length]; startSession({groups:[MINE[0].id], reviews:0}); r.push(S.title, S.queue.length>0); home(); return r; })()`));
ok("mine reload", await ev(`(()=>{ MINE=mineRead(); mineIndex(); return [MINE.length, MINE[0].ids.length]; })()`));
ok("mine topics tier", await ev(`(()=>{ topicsView(); return [...document.querySelectorAll(".tvset h2")].map(h=>h.textContent); })()`));
ok("mine remove+delete", await ev(`(()=>{ mineView(MINE[0].id); $("[data-mn-rm]").click(); const n=MINE[0].ids.length; window.confirm=()=>true; $("#mnDel").click(); return [n, MINE.length, GROUP_ORDER.some(g=>g.startsWith("mine_")), !!$("#mnbox")]; })()`));
const mkG = `MINE.find(g=>g.id==="mine_mock")`;
ok("mine mock setup", await ev(`(()=>{ window.alert=()=>{}; MINE=MINE.filter(g=>g.id!=="mine_mock"); MINE.push({id:"mine_mock", name:"Mock test", ids:["at_medføre","fordi","desuden","at_betyde","at_opleve","derfor","at_forhindre"]}); mineSave(); ${mkG}.avoid = mnGuessYear(${mkG}); mineSave(); return [${mkG}.avoid, mnYears(${mkG})]; })()`));
ok("mine mock build", await ev(`(()=>{ const m=${mkG}, b=mnMockBuild(m); if(!b) return "null"; const all=[b.example,...b.items]; const cnt={}; all.forEach(x=>cnt[x.card]=(cnt[x.card]||0)+1);
  return { items: b.items.length, avoid: b.avoid, noAvoidYear: all.every(x=>x.src.slice(0,4)!==b.avoid), fourOpts: all.every(x=>new Set(x.opts).size===4), rightIsW: all.every(x=>x.opts[x.right]===lowFirst(x.w)), inGroup: all.every(x=>m.ids.includes(x.card)), maxTwo: Object.values(cnt).every(n=>n<=2) }; })()`));
ok("mine mock screen", await ev(`(()=>{ startMineMock(${mkG}.id); return [document.querySelectorAll(".mkrow").length, MK.items.length + 2]; })()`));
ok("mine mock hand in", await ev(`(()=>{ const sc0=JSON.stringify(mkStore().scores||null); startMineMock(${mkG}.id); MK.items.forEach((x,i)=>document.querySelector('.mkcell[data-r="'+i+'"][data-o="'+x.right+'"]').click()); $("#mkdone").click(); const st=mkStore(); return [st.mine["mine_mock"].length, st.mine["mine_mock"][0][1], st.mine["mine_mock"][0][3], JSON.stringify(st.scores||null)===sc0, (st.mineUsed||[]).length>0]; })()`));
ok("mine year select", await ev(`(()=>{ mineView("mine_mock"); const s=document.querySelector('[data-mn-year="mine_mock"]'); s.value=""; s.dispatchEvent(new Event("change")); return [${mkG}.avoid, document.querySelector('[data-mn-year="mine_mock"]').value]; })()`));
ok("mine level select", await ev(`(()=>{ mineView("mine_mock"); const s=document.querySelector('[data-mn-level="mine_mock"]'); s.value="medium"; s.dispatchEvent(new Event("change")); return [${mkG}.level, document.querySelector('[data-mn-level="mine_mock"]').value]; })()`));
ok("mine medium build", await ev(`(()=>{ const b=mnMockBuild(${mkG}); if(!b) return "null"; const all=[b.example,...b.items], lim=b.relaxed?140:110, cl=b.relaxed?2:1;
  return { level: b.level, relaxed: b.relaxed, items: b.items.length, shortEnough: all.every(x=>x.s.length<=lim), commas: all.every(x=>(x.s.match(/,/g)||[]).length<=cl), noBadMarks: all.every(x=>!/[;:–]/.test(x.s)) }; })()`));
ok("mine medium hand in", await ev(`(()=>{ startMineMock("mine_mock"); MK.items.forEach((x,i)=>document.querySelector('.mkcell[data-r="'+i+'"][data-o="'+x.right+'"]').click()); $("#mkdone").click(); const s=mkStore().mine["mine_mock"].slice(-1)[0]; return [s[3], s[1], s[2]]; })()`));
ok("mine mock clean-up",await ev(`(()=>{ MINE=MINE.filter(g=>g.id!=="mine_mock"); mineSave(); mineView(null); return [MINE.length, GROUP_ORDER.some(g=>g==="mine_mock")]; })()`));
console.log("errors:", errs);
await send("Browser.close").catch(() => {}); chrome.kill(); process.exit(0);
