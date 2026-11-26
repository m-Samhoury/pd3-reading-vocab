// Whole-page test for mundtlig.html (headless Chrome over CDP, Node 22+), modelled on
// .claude/skills/pd3-coach/app/test-page.mjs.
//   node src/scripts/test-oral.mjs [path-to-mundtlig.html] [scratch-dir] [port]
// Topbar at 375, 768, 1024 and 1280 px; the page (v3, "Trin for trin") at 375 and 1280 px in light and dark, the Emneord tab (PLAN-3) at 375 and 1280, a layout pass at 768 and 1024, and an English-UI pass. Prints one "ok"/"FAIL" line per check, the
// console errors, and writes screenshots of the main views into the scratch dir. Exit code 1 on any failure.
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const page = "file://" + path.resolve(process.argv[2] || path.resolve(here, "../../mundtlig.html"));
const out = process.argv[3] || path.join(tmpdir(), "mundtlig-test");
const port = process.argv[4] || "9364";
mkdirSync(out, { recursive: true });
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = ms => new Promise(r => setTimeout(r, ms));
setTimeout(() => { console.log("SAFETY TIMEOUT"); process.exit(2); }, 1500000);

const profile = path.join(out, "profile"); rmSync(profile, { recursive: true, force: true });
const chrome = spawn(CHROME, ["--headless=new", `--user-data-dir=${profile}`, `--remote-debugging-port=${port}`,
  "--no-first-run", "--disable-gpu", "about:blank"], { stdio: "ignore" });
let tabs;
for (let i = 0; i < 60; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); } }
const ws = new WebSocket(tabs.find(t => t.type === "page").webSocketDebuggerUrl);
await new Promise(r => { ws.onopen = r; });
let id = 0; const pending = {}; const consoleErrors = [];
ws.onmessage = m => {
  const d = JSON.parse(m.data);
  if (d.method === "Runtime.exceptionThrown") consoleErrors.push("exception: " + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text || "").slice(0, 300));
  if (d.method === "Runtime.consoleAPICalled" && d.params.type === "error") consoleErrors.push("console: " + d.params.args.map(a => a.value ?? a.description).join(" ").slice(0, 300));
  if (d.method === "Log.entryAdded" && d.params.entry.level === "error") consoleErrors.push("log: " + d.params.entry.text.slice(0, 300) + " " + (d.params.entry.url || ""));
  if (pending[d.id]) { pending[d.id](d); delete pending[d.id]; }
};
const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
const ev = async expr => {
  const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result.exceptionDetails) return "ERR " + (r.result.exceptionDetails.exception?.description || "").slice(0, 300);
  return r.result.result.value;
};

let failures = 0;
const check = (name, ok, detail) => {
  if (!ok) failures++;
  console.log((ok ? "ok   " : "FAIL ") + name + (detail !== undefined ? ": " + JSON.stringify(detail).slice(0, 240) : ""));
};
const clickText = async (text, sel = "button") => ev(`(async () => {
  let b = null;
  for (let i = 0; i < 30 && !b; i++) {
    b = [...document.querySelectorAll(${JSON.stringify(sel)})].find(x => x.textContent.trim() === ${JSON.stringify(text)}) || null;
    if (!b) await new Promise(r => setTimeout(r, 100));
  }
  if (!b) return false; b.click(); await new Promise(r => setTimeout(r, 150)); return true; })()`);
const shot = async name => {
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(path.join(out, name + ".png"), Buffer.from(r.result.data, "base64"));
};
const shotFull = async name => {
  await ev(`document.body.classList.add("shot"); 1`);
  const h = await ev(`Math.ceil(document.documentElement.scrollHeight)`), w = await ev(`window.innerWidth`);
  const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: Math.min(h, 16000), scale: 1 } });
  writeFileSync(path.join(out, name + ".png"), Buffer.from(r.result.data, "base64"));
  await ev(`document.body.classList.remove("shot"); 1`);
};
const waitFor = async (expr, ms = 4000) => {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (await ev(`!!(${expr})`) === true) return true; await sleep(80); }
  return false;
};

await send("Runtime.enable"); await send("Log.enable"); await send("Page.enable");
const SAMPLE = {
  clean: "En årsag er, at mange har brug for penge, fordi huslejen er høj. Fx kender jeg en studerende. Så derfor tror jeg, at økonomi er vigtigst.",
  wo1: "Jeg tror, er det fordi de vil spare penge.",
  wo2: "De kan at hjælpe os med det.",
  spell: "Det er vigtigt med velvlre på arbejdet.",
};

async function setViewport(width, dark, lang = "da") {
  await send("Emulation.setDeviceMetricsOverride", { width, height: width < 600 ? 812 : 900, deviceScaleFactor: 1, mobile: width < 600 });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: dark ? "dark" : "light" }, { name: "prefers-reduced-motion", value: "no-preference" }] });
  await ev(`try { localStorage.setItem("pd3.theme", ${JSON.stringify(dark ? "dark" : "light")}); localStorage.setItem("pd3.lang", ${JSON.stringify(lang)}); } catch (e) {}`);
}
async function open(hash) {
  await send("Page.navigate", { url: "about:blank" });
  await sleep(60);
  await send("Page.navigate", { url: page + hash });
  await waitFor(`document.querySelector("#app") && document.querySelector("#app").children.length > 0`, 6000);
  await sleep(250);
}

const sittings = ["2018s", "2018v", "2019s", "2019v", "2020s", "2020v", "2021s", "2021v", "2022v", "2023s", "2023v", "2024s"];

// ── topbar (B2): the language button stays on the nav row and does not move when the language changes ──
const siteRoot = path.dirname(path.resolve(process.argv[2] || path.resolve(here, "../../mundtlig.html")));
const topbarMetrics = `(() => { const b = document.querySelector(".langbtn").getBoundingClientRect();
  const n = document.querySelector(".nav").getBoundingClientRect(), br = document.querySelector(".brand").getBoundingClientRect();
  const desktop = window.innerWidth >= 641;
  return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), label: document.querySelector(".langbtn").textContent.trim(),
    rowOK: desktop ? Math.abs(b.y + b.height / 2 - (n.y + n.height / 2)) < 8 : Math.abs(b.y + b.height / 2 - (br.y + br.height / 2)) < 8,
    overflow: document.documentElement.scrollWidth > window.innerWidth }; })()`;
for (const file of ["index.html", "mundtlig.html"]) {
  for (const width of [375, 768, 1024, 1280]) {
    await setViewport(width, false);
    await send("Page.navigate", { url: "about:blank" }); await sleep(60);
    await send("Page.navigate", { url: "file://" + path.join(siteRoot, file) });
    await waitFor(`!!document.querySelector(".langbtn")`, 6000); await sleep(200);
    const before = await ev(topbarMetrics);
    await ev(`document.querySelector(".langbtn").click(); 1`); await sleep(300);
    const after = await ev(topbarMetrics);
    check(`topbar · ${file} ${width}px: lang button on the nav row`, before.rowOK && after.rowOK, [before, after]);
    check(`topbar · ${file} ${width}px: lang button does not move or change size when switching`,
      before.x === after.x && before.y === after.y && before.w === after.w, [before, after]);
    check(`topbar · ${file} ${width}px: no horizontal scroll`, !before.overflow && !after.overflow);
  }
}

// ── v3 (Trin for trin) ─────────────────────────────────────────────────────────────
const KEYS36 = sittings.flatMap(s => ["A", "B", "C"].map(L => `${s}-${L}`));
const DEMO = "Jeg tror, er det fordi de vil spare penge. En årsag er, at de har ikke råd til det. Det er vigtigt med velvlre for børn.";
const noHScroll = () => ev(`document.documentElement.scrollWidth <= window.innerWidth`);
const typeAnswer = text => ev(`(() => { const ta = document.querySelector("#ta"); ta.value = ${JSON.stringify(text)}; ta.dispatchEvent(new Event("input")); return 1; })()`);
const goBtn = () => ev(`(async () => { const b = document.querySelector(".actionbar button.go"); if (!b) return null;
  const l = b.textContent.trim(); b.click(); await new Promise(r => setTimeout(r, 250)); return l; })()`);
const hashNow = () => ev(`location.hash`);
const setProg = obj => ev(`(() => { localStorage.setItem("pd3.oral.v1", ${JSON.stringify(JSON.stringify(obj))}); return 1; })()`);
const visibleEn = `[...document.querySelectorAll("#app .en")].filter(e => getComputedStyle(e).display !== "none").length`;
const stepClasses = `[...document.querySelectorAll("ol.steps > li.step")].map(li => li.className.replace("step ", "")).join(",")`;
const FB_STATE = `({
  secs: [...document.querySelectorAll("ol.fbsteps > li")].map(li => li.dataset.sec).join(","),
  woOld: [...document.querySelectorAll(".wo-fix .old")].map(x => x.textContent),
  woNew: [...document.querySelectorAll(".wo-fix .new")].map(x => x.textContent),
  woWhy: [...document.querySelectorAll(".wo-fix .why .da")].map(x => x.textContent),
  woNone: /Ingen sikre ordstillingsfejl/.test((document.querySelector('[data-sec="wo"]') || {}).textContent || ""),
  spOld: [...document.querySelectorAll(".sp-fix .old")].map(x => x.textContent),
  spNew: [...document.querySelectorAll(".sp-fix .new")].map(x => x.textContent),
  spHead: ((document.querySelector('[data-sec="sp"] h3') || {}).textContent) || "",
  stOk: document.querySelectorAll(".fsteps li.ok").length, stNo: document.querySelectorAll(".fsteps li.no").length,
  stFix: [...document.querySelectorAll(".st-fix")].map(x => x.textContent),
  kw: document.querySelectorAll(".fkw li").length, kwUse: [...document.querySelectorAll(".fkw li .use")].every(x => x.textContent.trim().length > 0),
  chips: [...document.querySelectorAll(".verdict li")].map(x => (x.querySelector(".da") || x).textContent),
  model: document.querySelectorAll(".cmp .seg").length, yours: ((document.querySelector(".cmp .yours") || {}).textContent) || "",
  rate: document.querySelectorAll('[data-sec="rate"] .ratebtn').length })`;

// a whole Test: choose a sitting (or "random"), answer 6 questions, rate "Kunne", reach #test/done
async function runTest(sit, answers) {
  await open("#test");
  await ev(`Math.random = () => 0.1; 1`);
  await ev(`(async () => { document.querySelector('.chipbtn[data-sit="${sit}"]').click(); await new Promise(r => setTimeout(r, 120));
    document.querySelector("#tstart").click(); await new Promise(r => setTimeout(r, 250)); return 1; })()`);
  const seen = [];
  for (let k = 0; k < 6; k++) {
    if (!await waitFor(`location.hash === "#test/q" && !!document.querySelector("#ta")`)) { seen.push({ k, stuck: await hashNow() }); break; }
    const info = await ev(`({ count: document.querySelector(".tbar .count .da").textContent, src: document.querySelector(".qhead .src .da").textContent,
      pic: !!document.querySelector(".side figure.pic img"), q: document.querySelector(".tq .qtext").textContent.length })`);
    await typeAnswer(answers[Math.min(k, answers.length - 1)]);
    const check1 = await goBtn();
    await waitFor(`location.hash === "#test/fb" && !!document.querySelector(".verdict")`);
    const fb = await ev(FB_STATE);
    await ev(`document.querySelector('[data-sec="rate"] .ratebtn.r-k').click(); 1`); await sleep(80);
    const next = await goBtn();
    seen.push({ k, ...info, check1, ...fb, next });
  }
  const end = await waitFor(`location.hash === "#test/done" && /Testen er færdig/.test(document.querySelector("#app").textContent)`);
  return { seen, end, rows: await ev(`document.querySelectorAll(".endrow").length`), noScroll: await noHScroll() };
}

async function danishRun(tag, width, dark) {
  const P = `${width}-${dark ? "dark" : "light"}`;
  await open("#laer");
  await ev(`localStorage.removeItem("pd3.oral.v1"); localStorage.removeItem("pd3.oral.en"); sessionStorage.clear(); 1`);
  await open("#laer");

  // A. start screen
  const start = await ev(`(() => { const n = document.querySelector("#app > .next"), a = n && n.querySelector("a.go");
    return { href: a && a.getAttribute("href"), btn: a && a.textContent.trim(), lab: n && n.querySelector(".lab .da").textContent,
      first: !!n && n.getBoundingClientRect().top < document.querySelector(".choose").getBoundingClientRect().top,
      line: document.querySelector(".prog .line .da").textContent, legend: document.querySelectorAll(".prog .legend li").length,
      legendEn: [...document.querySelectorAll(".prog .legend li")].every(li => li.querySelector(".en")),
      chips: [...document.querySelectorAll(".years .chipbtn")].map(c => c.dataset.sit), pressed: (document.querySelector('.years .chipbtn[aria-pressed="true"]') || {}).dataset?.sit,
      rows: document.querySelectorAll(".topics .trow").length,
      tabs: [...document.querySelectorAll("#tabs button")].map(b => b.textContent.trim()).join("|") }; })()`);
  check(`${tag} · start: "Dit næste spørgsmål" card first → 2024s-A-1A`, start.href === "#q/2024s-A-1A" && start.btn === "Start spørgsmålet" && start.lab === "Dit næste spørgsmål" && start.first, start);
  check(`${tag} · start: progress line and 3-item legend with English`, /^0 af 108 spørgsmål er sikre/.test(start.line) && start.legend === 3 && start.legendEn, start);
  check(`${tag} · start: 12 sitting chips, newest first, 2024s chosen, 3 topic rows`, start.chips.length === 12 && start.chips[0] === "2024s" && start.chips[11] === "2018s" && start.pressed === "2024s" && start.rows === 3, start);
  check(`${tag} · tabs are Lær, Emneord and Test`, start.tabs === "Lær|Emneord|Test", start.tabs);
  const theme = await ev(`[document.documentElement.dataset.theme, localStorage.getItem("pd3.theme")]`);
  check(`${tag} · theme applied`, theme[0] === (dark ? "dark" : "light"), theme);
  check(`${tag} · no horizontal scroll (Lær start)`, await noHScroll(), await ev(`[document.documentElement.scrollWidth, window.innerWidth]`));
  if (width < 600) {
    const dots = await ev(`[...document.querySelectorAll(".trow")].map(r => { const t = [...r.querySelectorAll(".sdot")].map(d => Math.round(d.getBoundingClientRect().top));
      return new Set(t).size === 1 && t[0] < r.querySelector("h3").getBoundingClientRect().bottom && r.querySelector(".dots").getBoundingClientRect().right <= r.getBoundingClientRect().right; })`);
    check(`${tag} · phone: topic-row dots on one line, top right`, dots.length === 3 && dots.every(Boolean), dots);
  }
  await shotFull(`${P}-laer`);

  // B. every sitting chip shows its 3 topics
  const sitBad = await ev(`(async () => { const bad = [];
    for (const s of ${JSON.stringify(sittings)}) { document.querySelector('.years .chipbtn[data-sit="' + s + '"]').click(); await new Promise(r => setTimeout(r, 80));
      const h = [...document.querySelectorAll(".topics .trow")].map(a => a.getAttribute("href")).join(",");
      if (h !== ["A","B","C"].map(L => "#q/" + s + "-" + L + "-1A").join(",")) bad.push([s, h]); } return bad; })()`);
  check(`${tag} · every sitting shows its 3 topics`, Array.isArray(sitBad) && sitBad.length === 0, sitBad);

  // C. all 108 questions: picture, 3 pills, source label, question text, type card
  const qBad = await ev(`(async () => { const bad = [];
    for (const k of ${JSON.stringify(KEYS36)}) for (const slot of ["1A", "1B", "2"]) {
      location.hash = "#q/" + k + "-" + slot; await new Promise(r => setTimeout(r, 90));
      const img = document.querySelector(".side figure.pic img");
      const pic = !!img && (img.complete && img.naturalWidth > 0 ? true : await new Promise(res => { img.onload = () => res(true); img.onerror = () => res(false); setTimeout(() => res(img.naturalWidth > 0), 3000); }));
      const pills = document.querySelectorAll(".qpills a").length, src = ((document.querySelector(".qhead .src .da") || {}).textContent) || "";
      const q = ((document.querySelector("#s1 .qtext") || {}).textContent) || "", order = document.querySelectorAll("#s1 .typecard ol.order li").length;
      const hasAns = !!(window.ORAL.questions.find(x => x.id === k + "-" + slot) || {}).answer;
      if (!pic || pills !== 3 || !/Emne [ABC]:/.test(src) || q.length < 10 || (hasAns && order < 4)) bad.push([k, slot, pic, pills, src.slice(0, 30), order]);
    } return bad; })()`);
  check(`${tag} · 108 questions: picture loads, 3 pills, source label, question, type card`, Array.isArray(qBad) && qBad.length === 0, qBad);
  const soonBad = await ev(`(async () => { const bad = []; for (const q of window.ORAL.questions.filter(x => !x.answer)) {
    location.hash = "#q/" + q.id + "/2"; await new Promise(r => setTimeout(r, 90)); if (!document.querySelector("#s2 .soon")) bad.push(q.id); } return bad; })()`);
  check(`${tag} · a question without a model answer shows "Svar kommer snart"`, Array.isArray(soonBad) && soonBad.length === 0, soonBad);

  await open("#q/2018s-A-1A");
  const pills = await ev(`[...document.querySelectorAll(".qpills a")].map(a => Math.round(a.getBoundingClientRect().height))`);
  check(`${tag} · question pills: each on one line`, pills.length === 3 && pills.every(h => h <= 44), pills);
  const src = await ev(`document.querySelector(".qhead .src").textContent`);
  check(`${tag} · source label Danish + English`, /Maj–juni 2018 · Emne A: .* · 1\. obligatorisk spørgsmål, situation A/.test(src) && /May–June 2018/.test(src), src);
  await shotFull(`${P}-q1`);

  // D. English under the question, every segment, tip, follow-up answer, part chip and step heading (2018s A)
  const enBad = await ev(`(async () => { const bad = [];
    for (const q of window.ORAL.questions.filter(x => x.sitting === "2018s" && x.letter === "A")) {
      location.hash = "#q/" + q.id + "/3"; await new Promise(r => setTimeout(r, 150));
      const e = q.en || {}, a = q.answer;
      const wantQ = (e.question ? 1 : 0) + (q.intro && e.intro ? 1 : 0), gotQ = document.querySelectorAll("#s1 .qtext .en").length;
      if (gotQ !== wantQ) bad.push([q.id, "question", gotQ, wantQ]);
      if (!document.querySelector(".qhead .src .en")) bad.push([q.id, "source label"]);
      if ([...document.querySelectorAll(".step .sh h3")].some(h => !h.querySelector(".en"))) bad.push([q.id, "step heading"]);
      if (a) {
        const seg = document.querySelectorAll("#s2 .seg > .en").length, wantSeg = e.answer ? e.answer.length : 0;
        if (seg !== wantSeg) bad.push([q.id, "segments", seg, wantSeg]);
        const tips = document.querySelectorAll("#s3 .tips li > .en").length, wantTips = e.tips ? e.tips.length : 0;
        if (tips !== wantTips) bad.push([q.id, "tips", tips, wantTips]);
        if (a.followup && e.followup_answer && !document.querySelector("#s3 .fua > .en")) bad.push([q.id, "follow-up answer"]);
        if (![...document.querySelectorAll("#s2 .seg > .da")].every(s => s.getAttribute("lang") === "da")) bad.push([q.id, "segment lang"]);
        if ([...document.querySelectorAll("#s1 .order li, #s2 .smap button")].some(x => !x.querySelector(".en"))) bad.push([q.id, "part chip"]);
        if (![...document.querySelectorAll("#s3 .kws .kw")].every(k => k.querySelector("b").textContent.trim() && k.querySelector(".use").textContent.trim())) bad.push([q.id, "keyword without its pattern"]);
      }
    } return bad; })()`);
  check(`${tag} · English under question, segments, tips, follow-up, chips, headings; keywords with pattern (2018s A)`, Array.isArray(enBad) && enBad.length === 0, enBad);

  // E. the 4 steps and the action button
  await open("#q/2018s-A-1A");
  const st1 = await ev(`({ cls: ${stepClasses}, hidden: getComputedStyle(document.querySelector("#s3 .sb")).display })`);
  check(`${tag} · step 1: now,later,later,later; later steps hidden`, st1.cls === "now,later,later,later" && st1.hidden === "none", st1);
  const labels = [], hashes = [];
  for (let k = 0; k < 4; k++) { labels.push(await goBtn()); await sleep(150); hashes.push(await hashNow()); }
  check(`${tag} · action button: Vis modelsvar → Se ord og tips → Hvordan gik det? → Næste spørgsmål`,
    labels.join("|") === "Vis modelsvar|Se ord og tips|Hvordan gik det?|Næste spørgsmål"
    && hashes.join(",") === "#q/2018s-A-1A/2,#q/2018s-A-1A/3,#q/2018s-A-1A/4,#q/2018s-A-1B", [labels, hashes]);
  await open("#q/2018s-A-1A/3");
  check(`${tag} · step 3: done,done,now,later`, await ev(stepClasses) === "done,done,now,later");
  await open("#q/2018s-A-2/4");
  const nt = [await goBtn(), await hashNow()];
  check(`${tag} · last question of a topic: "Næste emne" → next topic`, nt[0] === "Næste emne" && nt[1] === "#q/2018s-B-1A", nt);
  await open("#q/2018s-C-2/4");
  const al = [await goBtn(), await hashNow()];
  check(`${tag} · very last topic: "Alle emner" → #laer`, al[0] === "Alle emner" && al[1] === "#laer", al);

  // F. structure map lights its segment
  await open("#q/2018s-A-1A/2");
  const smap = await ev(`(async () => { const segs = [...document.querySelectorAll("#s2 .seg")];
    const cols = new Set(segs.map(s => getComputedStyle(s).backgroundColor)).size, chips = document.querySelectorAll("#s2 ol.smap li").length;
    document.querySelector("#s2 ol.smap li.p-fordi button").click(); await new Promise(r => setTimeout(r, 60));
    const lit = [...document.querySelectorAll("#s2 .seg.hi")].map(s => s.dataset.part), focus = document.querySelector("#s2 .segs").classList.contains("focus");
    document.querySelector("#s2 ol.smap li.p-fordi button").click(); await new Promise(r => setTimeout(r, 60));
    return { segs: segs.length, cols, chips, lit, focus, off: document.querySelectorAll("#s2 .seg.hi").length }; })()`);
  check(`${tag} · structure map: 6 parts, 6 coloured segments, "Fordi" lights only its segment`, smap.segs === 6 && smap.cols >= 4 && smap.chips === 6 && smap.lit.join() === "fordi" && smap.focus && smap.off === 0, smap);

  // G. English switch: hides in place, stays on the same step, remembered
  const sw0 = await ev(visibleEn);
  await ev(`document.querySelector("#enToggle").click(); 1`); await sleep(120);
  const sw1 = await ev(`[${visibleEn}, document.body.classList.contains("hide-en"), document.querySelector("#enToggle").textContent.trim(),
    localStorage.getItem("pd3.oral.en"), location.hash, document.querySelector("#s2").classList.contains("now")]`);
  check(`${tag} · English switch hides every English line in place and is remembered`,
    sw0 > 0 && sw1[0] === 0 && sw1[1] && /Vis engelsk/.test(sw1[2]) && sw1[3] === "0" && sw1[4] === "#q/2018s-A-1A/2" && sw1[5], [sw0, sw1]);
  await open("#q/2018s-A-1A/2");
  check(`${tag} · English stays off after a reload`, await ev(`document.body.classList.contains("hide-en") && document.querySelector("#enToggle").getAttribute("aria-pressed") === "false"`));
  await ev(`document.querySelector("#enToggle").click(); 1`); await sleep(120);
  check(`${tag} · English switch back on`, await ev(`${visibleEn} > 0 && localStorage.getItem("pd3.oral.en") === "1"`));

  // H. Dansk/English button: UI swaps in place, content stays Danish, typed text kept
  await open("#laer");
  await ev(`document.querySelector(".langbtn").click(); 1`); await sleep(250);
  const ui = await ev(`[[...document.querySelectorAll("#tabs button")].map(b => b.textContent.trim()).join("|"), document.querySelector(".next a.go").textContent.trim(),
    document.querySelector(".next .lab .da").textContent, document.querySelector("#enToggle").textContent.trim()]`);
  check(`${tag} · language button: UI in English, Danish content unchanged`, ui[0] === "Study|Topic words|Test" && ui[1] === "Start the question" && ui[2] === "Dit næste spørgsmål" && /Hide English/.test(ui[3]), ui);
  await ev(`document.querySelector(".langbtn").click(); 1`); await sleep(250);
  await open("#test");
  await ev(`(async () => { document.querySelector('.chipbtn[data-sit="2024s"]').click(); await new Promise(r => setTimeout(r, 80)); document.querySelector("#tstart").click(); return 1; })()`);
  await waitFor(`!!document.querySelector("#ta")`);
  await typeAnswer("Jeg tror, at det er godt.");
  await ev(`document.querySelector(".langbtn").click(); 1`); await sleep(250);
  const kept = await ev(`[document.querySelector("#ta").value, document.querySelector(".actionbar button.go").textContent.trim(), location.hash]`);
  check(`${tag} · language button in a test: typed text kept, button "Check my answer"`, kept[0] === "Jeg tror, at det er godt." && kept[1] === "Check my answer" && kept[2] === "#test/q", kept);
  await ev(`document.querySelector(".langbtn").click(); 1`); await sleep(250);
  check(`${tag} · language button back: "Tjek mit svar"`, await ev(`document.querySelector(".actionbar button.go").textContent.trim()`) === "Tjek mit svar");
  await ev(`try { localStorage.setItem("pd3.lang", "da"); } catch (e) {} 1`);

  // I. rating and progress
  await ev(`localStorage.removeItem("pd3.oral.v1"); 1`);
  await open("#q/2018s-A-1A/4");
  const r1 = await ev(`(async () => { document.querySelector("#s4 .ratebtn.r-k").click(); await new Promise(r => setTimeout(r, 80));
    return [document.querySelector("#s4 .ratebtn.r-k").getAttribute("aria-pressed"), document.querySelector("#s4 .ratemsg").textContent,
      (JSON.parse(localStorage.getItem("pd3.oral.v1") || "{}")["2018s-A-1A"] || { ratings: [] }).ratings.length]; })()`);
  check(`${tag} · self-rating saved (Kunne) with a confirmation`, r1[0] === "true" && /Gemt/.test(r1[1]) && r1[2] === 1, r1);
  check(`${tag} · rating buttons explain themselves (hint + English)`, await ev(`!!document.querySelector("#s4 .rating > .hint") && [...document.querySelectorAll("#s4 .ratebtn")].every(b => b.querySelector(".en") && b.querySelector(".hint"))`));
  await setProg({ "2018s-A-1A": { ratings: [{ d: new Date().toLocaleDateString("sv-SE"), r: "k" }] }, "2018s-A-2": { ratings: [{ d: "2000-01-01", r: "k" }] } });
  await open("#q/2018s-A-2/4");
  const r2 = await ev(`(async () => { document.querySelector("#s4 .ratebtn.r-k").click(); await new Promise(r => setTimeout(r, 80)); return document.querySelector("#s4 .ratemsg").textContent; })()`);
  check(`${tag} · second "Kunne" on another day makes the question secure`, /nu sikkert/.test(r2), r2);
  await open("#q/2018s-A-2");
  check(`${tag} · secure question shows a green dot in its pill`, await ev(`!!document.querySelector('.qpills a[aria-current="true"] .sdot.s-sure')`));
  await open("#laer");
  const prog = await ev(`document.querySelector(".prog .line .da").textContent`);
  check(`${tag} · progress line counts the secure question`, /^1 af 108 spørgsmål er sikre/.test(prog), prog);
  check(`${tag} · progress persists after reload`, await ev(`(JSON.parse(localStorage.getItem("pd3.oral.v1") || "{}"))["2018s-A-2"].ratings.length`) === 2);
  await setProg({ "2024s-A-1A": { ratings: [{ d: "2000-01-01", r: "k" }, { d: "2000-01-02", r: "k" }] } });
  await open("#laer");
  check(`${tag} · next-question card moves on to 2024s-A-1B`, await ev(`document.querySelector(".next a.go").getAttribute("href")`) === "#q/2024s-A-1B");

  // sticky picture (wide) / picture on top (phone)
  await open("#q/2018s-A-1A/4"); await sleep(700);
  const side = await ev(`(() => { const s = document.querySelector(".side"), m = document.querySelector(".main"), r = s.querySelector("img").getBoundingClientRect();
    return { pos: getComputedStyle(s).position, right: s.getBoundingClientRect().left > m.getBoundingClientRect().left, inView: r.top >= 0 && r.top < innerHeight,
      above: s.getBoundingClientRect().top < m.getBoundingClientRect().top }; })()`);
  if (width >= 960) check(`${tag} · picture sticky on the right, visible at step 4`, side.pos === "sticky" && side.right && side.inView, side);
  else check(`${tag} · phone: picture on top of the question`, side.pos === "static" && side.above, side);
  check(`${tag} · no horizontal scroll (question, step 4)`, await noHScroll());
  await shotFull(`${P}-q4`);

  // reduced motion: the step jump is instant (once, at 1280 light)
  if (width === 1280 && !dark) {
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }, { name: "prefers-reduced-motion", value: "reduce" }] });
    await open("#q/2018s-A-1A");
    await ev(`location.hash = "#q/2018s-A-1A/3"; 1`); await sleep(150);
    const top = await ev(`Math.round(document.querySelector("#s3").getBoundingClientRect().top)`);
    check(`${tag} · reduced motion: step 3 is in view at once`, top >= -2 && top <= 40, top);
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }, { name: "prefers-reduced-motion", value: "no-preference" }] });
  }

  // J. Test: the prototype's demo answer on 2024s-A-1A (for the screenshot), then a sitting test and a random test
  await ev(`localStorage.removeItem("pd3.oral.v1"); 1`);
  await open("#test");
  check(`${tag} · Test setup: random + 12 sittings, Start testen`, await ev(`document.querySelectorAll(".tsetup .chipbtn").length === 13 && document.querySelector(".tsetup .chipbtn").dataset.sit === "random" && document.querySelector("#tstart").textContent.trim() === "Start testen"`));
  check(`${tag} · no horizontal scroll (Test setup)`, await noHScroll());
  await ev(`Math.random = () => 0.1; 1`);
  await ev(`(async () => { document.querySelector('.chipbtn[data-sit="2024s"]').click(); await new Promise(r => setTimeout(r, 80)); document.querySelector("#tstart").click(); return 1; })()`);
  await waitFor(`!!document.querySelector("#ta")`);
  check(`${tag} · test question: count, picture, question, timer`, await ev(`/^Spørgsmål 1 af 6$/.test(document.querySelector(".tbar .count .da").textContent) && !!document.querySelector(".side figure.pic img") && !!document.querySelector(".tq .qtext") && /mål 45–90 s/.test(document.querySelector(".timer").textContent)`));
  check(`${tag} · no horizontal scroll (test question)`, await noHScroll());
  await shotFull(`${P}-test-q`);
  await typeAnswer(DEMO); await goBtn();
  await waitFor(`!!document.querySelector(".verdict")`);
  const demo = await ev(FB_STATE);
  check(`${tag} · feedback order: Ordstilling, Opbygning, Nøgleord, Stavning, Sammenlign, Rating`, demo.secs === "wo,st,kw,sp,cmp,rate", demo.secs);
  check(`${tag} · demo: "at de har ikke" → "at de ikke har"`, demo.woOld.includes("at de har ikke") && demo.woNew.some(x => x.includes("at de ikke har")), demo);
  check(`${tag} · no horizontal scroll (feedback)`, await noHScroll());
  await shotFull(`${P}-test-fb`);

  const T = await runTest("2018s", [SAMPLE.wo1, SAMPLE.wo2, SAMPLE.spell, SAMPLE.clean]);
  const [a, b, c, d] = T.seen;
  check(`${tag} · sitting test: 6 questions with count, picture, source label`, T.seen.length === 6 && T.seen.every((x, i) => x.count === `Spørgsmål ${i + 1} af 6` && x.pic && /Maj–juni 2018 · Emne [ABC]/.test(x.src) && x.check1 === "Tjek mit svar" && x.model > 0 && x.rate === 3), T.seen.map(x => [x.count, x.src, x.check1, x.model, x.rate]));
  check(`${tag} · word order: "tror, er det" → "tror, at det er", with Hvorfor?`, a.woOld.includes("tror, er det") && a.woNew.some(x => x.includes("tror, at det er")) && /^Hvorfor\? /.test(a.woWhy[0] || ""), a);
  check(`${tag} · structure: one "Mangler" fix per missing part`, a.stNo > 0 && a.stFix.length === a.stNo && a.stFix.every(x => /Mangler: /.test(x)), [a.stNo, a.stFix]);
  check(`${tag} · keywords listed with their pattern`, a.kw > 0 && a.kwUse, [a.kw, a.kwUse]);
  check(`${tag} · modal + at flagged ("kan at")`, b.woOld.some(x => x.includes("kan at")), b.woOld);
  check(`${tag} · spelling: "velvlre" → "velvære", "tæller ikke" in heading and verdict`, c.spOld.includes("velvlre") && c.spNew.includes("velvære") && /tæller ikke/.test(c.spHead) && /tæller ikke/.test(c.chips[3] || ""), c);
  check(`${tag} · clean answer: no word-order flag, structure ticks`, d.woOld.length === 0 && d.woNew.length === 0 && d.woNone && d.stOk >= 1 && d.stOk + d.stNo >= 4, [d.woOld, d.woNone, d.stOk, d.stNo]);
  check(`${tag} · sitting test ends on "Testen er færdig" with 6 rows`, T.end && T.rows === 6 && T.seen[5].next === "Se resultatet" && T.seen[0].next === "Næste spørgsmål", [T.end, T.rows, T.seen.map(x => x.next)]);
  check(`${tag} · no horizontal scroll (test end)`, T.noScroll);
  await shotFull(`${P}-test-done`);
  const R = await runTest("random", [SAMPLE.clean]);
  check(`${tag} · random test: 6 questions, reaches the end`, R.seen.length === 6 && R.end && R.rows === 6 && R.seen.every(x => /af 6$/.test(x.count)), [R.end, R.rows, R.seen.map(x => x.count + " " + x.src)]);

  await ev(`localStorage.removeItem("pd3.oral.v1"); sessionStorage.clear(); 1`);
}


// ── Emneord (PLAN-3): the third tab. Runs on the fixture build (src/fixtures/oral-vocab.sample.json) ──
const VK = "pd3-oral-vocab:known:v1", VC = "pd3-oral-vocab:cloze:v1";
const vocabRun = async (tag, width, dark) => {
  const P = `${width}-${dark ? "dark" : "light"}`;
  await ev(`try { localStorage.removeItem("${VK}"); localStorage.removeItem("${VC}"); } catch (e) {} 1`);
  await open("#laer");
  await ev(`document.querySelector('#tabs button[data-go="#ord"]').click(); 1`); await sleep(200);
  const tab = await ev(`[location.hash, document.querySelector('#tabs button[data-go="#ord"]').getAttribute("aria-pressed")]`);
  check(`${tag} · Emneord tab opens #ord`, tab[0] === "#ord" && tab[1] === "true", tab);
  check(`${tag} · Emneord: two topic cards, families, start-screen order`,
    await ev(`[...document.querySelectorAll("#app .vtopic")].map(a => a.getAttribute("href")).join(",") === "#ord/frivilligt-arbejde,#ord/transport-og-miljoe"`));
  check(`${tag} · Emneord: each card shows word count and known / total`,
    await ev(`[...document.querySelectorAll("#app .vtopic")].every(a => /4 ord/.test(a.textContent) && /0 af 4 kan/.test(a.textContent))`));
  check(`${tag} · Emneord overview: no horizontal scroll`, await noHScroll());
  await shotFull(`${P}-ord`);

  await open("#ord/frivilligt-arbejde");
  await waitFor(`[...document.querySelectorAll("#app img.vpic")].every(i => i.complete)`, 5000);
  check(`${tag} · topic page: 4 rows, pictures on 4, none missing`,
    await ev(`[document.querySelectorAll("#app .vw").length, document.querySelectorAll("#app img.vpic").length, document.querySelectorAll("#app .vnopic").length].join() === "4,4,0"`));
  check(`${tag} · topic page: every <mark> equals the sentence span`, await ev(`(() => { const t = window.ORAL.vocab.topics.find(x => x.key === "frivilligt-arbejde");
    return [...document.querySelectorAll("#app .vw")].every((r, i) => { const w = t.words[i], m = r.querySelector(".vsent mark");
      return !!m && m.textContent === w.sentence.slice(w.span[0], w.span[1]); }); })()`));
  check(`${tag} · written example carries the "eget eksempel" tag`, await ev(`[...document.querySelectorAll("#app .vw")].some(r => r.querySelector(".vtag") && /de fleste/.test(r.textContent))`));
  check(`${tag} · picture alt text from alt_da`, await ev(`document.querySelector("#app img.vpic").alt === "En ung kvinde hjælper en ældre mand."`));
  check(`${tag} · link to the question (#q/<id>/2)`, await ev(`document.querySelector("#app .vw a.vsrc").getAttribute("href") === "#q/2018s-A-1A/2"`));
  check(`${tag} · no horizontal scroll (topic page)`, await noHScroll());
  await shotFull(`${P}-ord-topic`);

  // the picture dialog: opens large, Escape closes it
  await ev(`document.querySelector("#app .vpicbtn").click(); 1`); await sleep(150);
  check(`${tag} · picture opens in the dialog with its credit`, await ev(`document.querySelector("dialog.vdlg").open && /Testbillede/.test(document.querySelector("dialog.vdlg").textContent)`));
  if (width >= 375) await shot(`${P}-ord-dialog`);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }); await sleep(150);
  check(`${tag} · Escape closes the picture dialog`, await ev(`!document.querySelector("dialog.vdlg").open`));

  // a topic without a picture: its rows have a blank cell, no <img>
  await open("#ord/transport-og-miljoe");
  check(`${tag} · missing picture: blank cell, no broken <img>`, await ev(`[document.querySelectorAll("#app .vnopic").length, document.querySelectorAll("#app img.vpic").length, [...document.querySelectorAll("#app img.vpic")].filter(i => i.complete && i.naturalWidth === 0).length].join() === "2,2,0"`));
  check(`${tag} · last topic has no "Næste emne" link`, await ev(`document.querySelector("#app .vtools a.go") === null || document.querySelector("#app .vtools a.go").getAttribute("href") === "#ord"`));

  // Kan den: saved per browser, survives a reload
  await open("#ord/frivilligt-arbejde");
  await ev(`document.querySelector("#app .vknow").click(); 1`); await sleep(120);
  check(`${tag} · "Kan den" toggles, counted in the topic`, await ev(`document.querySelector("#app .vknow").getAttribute("aria-pressed") === "true" && /1 af 4 kan/.test(document.querySelector(".vcount").textContent)`));
  await open("#ord/frivilligt-arbejde");
  check(`${tag} · "Kan den" persists after a reload (topic|id)`, await ev(`document.querySelector("#app .vknow").getAttribute("aria-pressed") === "true" && JSON.parse(localStorage.getItem("${VK}")).join() === "frivilligt-arbejde|hjaelpe_andre"`));
  await ev(`document.querySelector("#app .vknow").click(); 1`); await sleep(100);

  // Skjul ordene: cloze, remembered; English off in cloze mode; a tap reveals the gap
  await open("#ord/frivilligt-arbejde");
  await ev(`document.querySelector("#app .vtools .enbtn").click(); 1`); await sleep(150);
  check(`${tag} · "Skjul ordene" blanks every <mark>, hides the word line and the English sentence`,
    await ev(`[document.querySelectorAll("#app .gap").length, document.querySelectorAll("#app mark").length, document.querySelectorAll("#app .vsent .en").length, getComputedStyle(document.querySelector("#app .gap .ga")).display].join() === "4,0,0,none"`));
  await ev(`document.querySelector("#app .gap").click(); 1`); await sleep(100);
  check(`${tag} · tapping a gap reveals the word`, await ev(`document.querySelectorAll("#app .gap.open").length === 1`));
  await open("#ord/frivilligt-arbejde");
  check(`${tag} · "Skjul ordene" is remembered per browser`, await ev(`document.querySelectorAll("#app .gap").length === 4 && document.querySelector("#app .vtools .enbtn").getAttribute("aria-pressed") === "true"`));
  await shotFull(`${P}-ord-cloze`);
  await ev(`document.querySelector("#app .vtools .enbtn").click(); 1`); await sleep(120);
  check(`${tag} · switching cloze off restores the marks`, await ev(`document.querySelectorAll("#app mark").length === 4 && document.querySelectorAll("#app .gap").length === 0`));

  // the English switch hides the English lines on this page too
  const enVis = `[...document.querySelectorAll("#app .en")].filter(e => getComputedStyle(e).display !== "none").length`;
  const en0 = await ev(enVis);
  await ev(`document.querySelector("#enToggle").click(); 1`); await sleep(120);
  check(`${tag} · English switch hides the English lines on the word pages`, en0 > 0 && (await ev(enVis)) === 0, en0);
  await ev(`document.querySelector("#enToggle").click(); 1`); await sleep(120);

  // the phone: rows and the cloze switch fit the width
  check(`${tag} · no horizontal scroll (topic page, cloze off)`, await noHScroll());
  await ev(`try { localStorage.removeItem("${VK}"); localStorage.removeItem("${VC}"); } catch (e) {} 1`);
};

// 768 and 1024: layout only
async function layoutRun(tag, width) {
  await open("#laer");
  check(`${tag} · no horizontal scroll (Lær start)`, await noHScroll(), await ev(`[document.documentElement.scrollWidth, window.innerWidth]`));
  await open("#ord");
  check(`${tag} · no horizontal scroll (Emneord)`, await noHScroll());
  await open("#ord/frivilligt-arbejde");
  check(`${tag} · no horizontal scroll (Emneord topic)`, await noHScroll());
  await open("#q/2018s-A-1A/4");
  check(`${tag} · no horizontal scroll (question)`, await noHScroll());
  await open("#test");
  check(`${tag} · no horizontal scroll (Test setup)`, await noHScroll());
  const T = await runTest("2024s", [SAMPLE.clean]);
  check(`${tag} · test runs to the end, no horizontal scroll`, T.end && T.noScroll, [T.end, T.noScroll]);
  await ev(`localStorage.removeItem("pd3.oral.v1"); sessionStorage.clear(); 1`);
}

// English UI (pd3.lang = en): buttons in English, content still Danish + English
async function englishRun(tag, width, dark) {
  await open("#laer");
  check(`${tag} · no horizontal scroll`, await noHScroll());
  check(`${tag} · UI in English: tabs Study|Topic words|Test`, await ev(`[...document.querySelectorAll("#tabs button")].map(b => b.textContent.trim()).join("|")`) === "Study|Topic words|Test");
  check(`${tag} · next-question button "Start the question", label still Danish first`, await ev(`document.querySelector(".next a.go").textContent.trim() === "Start the question" && document.querySelector(".next .lab .da").textContent === "Dit næste spørgsmål"`));
  check(`${tag} · English switch label in English`, await ev(`/Hide English|Show English/.test(document.querySelector("#enToggle").textContent)`));
  check(`${tag} · English lines on the page`, await ev(`document.querySelectorAll("#app .en").length > 0`));
  await shotFull(`${width}-${dark ? "dark" : "light"}-laer-en`);
  await open("#q/2018s-A-1A/4");
  check(`${tag} · question: action button "Next question"`, await ev(`document.querySelector(".actionbar button.go").textContent.trim()`) === "Next question");
  check(`${tag} · no horizontal scroll (question)`, await noHScroll());
  await open("#test");
  check(`${tag} · Test: "Start the test"`, await ev(`document.querySelector("#tstart").textContent.trim()`) === "Start the test");
  check(`${tag} · no horizontal scroll (Test)`, await noHScroll());
}

for (const [width, dark, lang] of [[375, false, "da"], [375, true, "da"], [1280, false, "da"], [1280, true, "da"], [768, false, "da"], [1024, false, "da"],
                                   [375, false, "en"], [375, true, "en"], [1280, false, "en"], [1280, true, "en"]]) {
  const tag = `${width}px ${dark ? "dark" : "light"} ${lang}`;
  console.log(`\n== ${tag} ==`);
  consoleErrors.length = 0;
  await setViewport(width, dark, lang);
  if (lang === "en") await englishRun(tag, width, dark);
  else if (width === 768 || width === 1024) await layoutRun(tag, width);
  else { await danishRun(tag, width, dark); await vocabRun(tag, width, dark); }
  check(`${tag} · no console errors`, consoleErrors.length === 0, consoleErrors.slice(0, 5));
}

// ── picture zoom (≥ 960 px): closed it stays in its own column; tapped (.big) it covers the whole viewport,
//    above the steps and the action bar; tapping it again, the backdrop or Escape closes it ──
const PIC_PROBE = `(() => {
  const side = document.querySelector(".flow .side"), main = document.querySelector(".flow .main"), fig = side.querySelector("figure.pic");
  const sr = side.getBoundingClientRect(), mr = main.getBoundingClientRect();
  const go = document.querySelector(".actionbar .go").getBoundingClientRect();
  const pts = [[innerWidth / 2, innerHeight / 2], [mr.left + 30, innerHeight / 2], [go.left + go.width / 2, go.top + go.height / 2], [mr.left + 30, 30]];
  const hits = pts.map(([x, y]) => { const h = document.elementFromPoint(x, y); return !!h && fig.contains(h); });
  return { big: fig.classList.contains("big"), overlapX: Math.max(0, Math.min(sr.right, mr.right) - Math.max(sr.left, mr.left)), hits }; })()`;
console.log(`\n== picture zoom ==`);
for (const [width, dark, lang] of [[960, true, "en"], [1024, true, "en"], [1100, false, "da"], [1180, true, "da"], [1280, true, "en"], [1440, false, "en"], [1920, true, "da"]]) {
  const tag = `${width}px ${dark ? "dark" : "light"} ${lang} · picture`;
  await setViewport(width, dark, lang);
  await open("#q/2024s-B-2/2"); await sleep(500);
  await ev(`window.scrollTo(0, document.documentElement.scrollHeight * 0.35); 1`); await sleep(200);
  const closed = await ev(PIC_PROBE);
  check(`${tag}: closed, in its own column (no overlap with the steps)`, !closed.big && closed.overlapX === 0, closed);
  await ev(`document.querySelector(".side .picbtn").click(); 1`); await sleep(200);
  const big = await ev(PIC_PROBE);
  check(`${tag}: tapped, the big picture is on top everywhere (centre, over the steps, over the action bar)`, big.big && big.hits.every(Boolean), big);
  if (width === 1024) await shot(`${width}-${dark ? "dark" : "light"}-picture-big`);
  await ev(`document.querySelector(".side .picbtn").click(); 1`); await sleep(150);
  const again = await ev(PIC_PROBE);
  check(`${tag}: tapped again, closed and back in its column`, !again.big && again.overlapX === 0, again);
  await ev(`document.querySelector(".side .picbtn").click(); 1`); await sleep(150);
  await ev(`document.querySelector(".side figure.pic").dispatchEvent(new MouseEvent("click", { bubbles: true })); 1`); await sleep(150);
  check(`${tag}: tap on the backdrop closes it`, await ev(`!document.querySelector("figure.pic.big") && !document.querySelector(".side.zoomed")`));
  await ev(`if (!document.querySelector("figure.pic.big")) document.querySelector(".side .picbtn").click(); document.querySelector(".side .picbtn").blur(); 1`); await sleep(100);
  check(`${tag}: open again before Escape`, await ev(`!!document.querySelector("figure.pic.big")`));
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }); await sleep(150);
  check(`${tag}: Escape closes it, even without focus on the picture`, await ev(`!document.querySelector("figure.pic.big") && !document.querySelector(".side.zoomed")`));
}

await ev(`try { localStorage.setItem("pd3.lang", "da"); } catch (e) {} 1`);

await send("Emulation.setDeviceMetricsOverride", { width: 0, height: 0, deviceScaleFactor: 0, mobile: false }).catch(() => {});
chrome.kill();
console.log(failures ? `\n${failures} check(s) FAILED` : "\nall checks passed");
process.exit(failures ? 1 : 0);
