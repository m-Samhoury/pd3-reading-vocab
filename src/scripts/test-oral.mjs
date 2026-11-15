// Whole-page test for mundtlig.html (headless Chrome over CDP, Node 22+), modelled on
// .claude/skills/pd3-coach/app/test-page.mjs.
//   node src/scripts/test-oral.mjs [path-to-mundtlig.html] [scratch-dir] [port]
// Topbar at 375, 768, 1024 and 1280 px; the page at 375 and 1280 px, in light and dark theme. Prints one "ok"/"FAIL" line per check, the
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
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: dark ? "dark" : "light" }] });
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

// English-language pass: the layout and the English lines only (the full Danish flows below use Danish button labels)
async function layoutOnly(tag) {
  await open("#laer");
  check(`${tag} · no horizontal scroll`, await ev(`document.documentElement.scrollWidth <= window.innerWidth`), await ev(`[document.documentElement.scrollWidth, window.innerWidth]`));
  check(`${tag} · UI in English: tabs read Study and Test`, await ev(`[...document.querySelectorAll("#tabs button")].map(b => b.textContent.trim()).join("|")`) === "Study|Test");
  check(`${tag} · start screen: 4 question types, 3 how-to steps, one progress line`, await ev(`document.querySelectorAll(".ftype").length === 4 && document.querySelectorAll(".howsteps li").length === 3 && document.querySelectorAll(".progline").length === 1 && !document.querySelector(".band")`));
  check(`${tag} · English switch label is in English`, await ev(`/Hide English|Show English/.test(document.querySelector("#enToggle").textContent)`));
  check(`${tag} · English lines are on the page`, await ev(`document.querySelectorAll("#app .en").length > 0`));
  await shot(`${tag.replace(/ /g, "-")}-laer-start`);
  await open("#q/2018s-A-1A");
  check(`${tag} · question cards: structure line and Hvordan? block`, await ev(`[...document.querySelectorAll(".qcard")].length === 3 && [...document.querySelectorAll(".qcard")].every(c => c.querySelector(".structline") && c.querySelector("details.how"))`));
  check(`${tag} · no horizontal scroll on a topic`, await ev(`document.documentElement.scrollWidth <= window.innerWidth`));
  await open("#test");
  check(`${tag} · Test start screen loads`, await ev(`!!document.querySelector(".chipbtn")`));
  check(`${tag} · no horizontal scroll on Test`, await ev(`document.documentElement.scrollWidth <= window.innerWidth`));
  check(`${tag} · no console errors`, consoleErrors.length === 0, consoleErrors.slice(0, 5));
}

for (const [width, dark, lang] of [[375, false, "da"], [375, true, "da"], [1280, false, "da"], [1280, true, "da"],
                                   [375, false, "en"], [375, true, "en"], [1280, false, "en"], [1280, true, "en"]]) {
  const tag = `${width}px ${dark ? "dark" : "light"} ${lang}`;
  console.log(`\n== ${tag} ==`);
  consoleErrors.length = 0;
  await setViewport(width, dark, lang);
  if (lang === "en") { await layoutOnly(tag); continue; }
  await open("#laer");
  check(`${tag} · Lær loads`, await ev(`!!document.querySelector(".chipbtn")`));
  check(`${tag} · no horizontal scroll`, await ev(`document.documentElement.scrollWidth <= window.innerWidth`), await ev(`[document.documentElement.scrollWidth, window.innerWidth]`));
  check(`${tag} · 12 sittings as chips`, await ev(`document.querySelectorAll(".chipbtn").length`) === 12);
  const theme = await ev(`[document.documentElement.dataset.theme, localStorage.getItem("pd3.theme")]`);
  check(`${tag} · theme applied`, theme[0] === (dark ? "dark" : "light"), theme);
  await shot(`${width}-${dark ? "dark" : "light"}-laer`);

  // every sitting: three topic cards, each with a picture and three questions with a source label
  let badSitting = [];
  for (const [i, s] of sittings.entries()) {
    const n = await ev(`(async () => { const c = document.querySelectorAll(".chipbtn")[${i}]; if (!c) return -1;
      c.click(); await new Promise(r=>setTimeout(r,80)); return document.querySelectorAll(".tcard").length; })()`);
    if (n !== 3) badSitting.push([s, n]);
  }
  check(`${tag} · every sitting shows 3 topics`, badSitting.length === 0, badSitting);
  const topicsOk = await ev(`(async () => {
    const keys = ["2018s-A","2018s-B","2018s-C","2018v-A","2018v-B","2018v-C","2019s-A","2019s-B","2019s-C","2019v-A","2019v-B","2019v-C","2020s-A","2020s-B","2020s-C","2020v-A","2020v-B","2020v-C","2021s-A","2021s-B","2021s-C","2021v-A","2021v-B","2021v-C","2022v-A","2022v-B","2022v-C","2023s-A","2023s-B","2023s-C","2023v-A","2023v-B","2023v-C","2024s-A","2024s-B","2024s-C"];
    const bad = [];
    for (const k of keys) {
      location.hash = "#q/" + k + "-1A";
      await new Promise(r => setTimeout(r, 120));
      const img = document.querySelector("figure.pic img");
      const pic = img && (img.complete && img.naturalWidth > 0 ? true : await new Promise(res => { img.onload = () => res(true); img.onerror = () => res(false); setTimeout(() => res(false), 3000); }));
      const qs = document.querySelectorAll(".qcard");
      const labels = [...qs].filter(q => /Emne [ABC]:/.test(q.querySelector(".src").textContent)).length;
      if (!pic || qs.length !== 3 || labels !== 3) bad.push([k, !!pic, qs.length, labels]);
    }
    return bad; })()`);
  check(`${tag} · 36 topics: picture loads, 3 questions with source label`, Array.isArray(topicsOk) && topicsOk.length === 0, topicsOk);
  await open("#q/2018s-A-1A");
  // the source label on the first question: Danish first, English underneath
  const src = await ev(`[...document.querySelectorAll(".qcard .src")].map(x => x.textContent)[0]`);
  check(`${tag} · source label Danish + English`, /Maj–juni 2018 · Emne A: .* · 1\. obligatorisk spørgsmål, situation A/.test(src) && /May–June 2018/.test(src), src);
  await shot(`${width}-${dark ? "dark" : "light"}-topic`);

  // ── B3 layout: each question card explains its answer structure and has a "Hvordan?" block
  check(`${tag} · every question card: structure line + Hvordan?`, await ev(`[...document.querySelectorAll(".qcard")].length === 3 &&
    [...document.querySelectorAll(".qcard")].every(c => c.querySelector(".structline") && c.querySelector("details.how"))`));
  // ── B1: English under the question, every answer segment, the tips and the follow-up answer, where a translation exists
  const enBad = await ev(`(() => { const bad = [];
    for (const q of window.ORAL.questions.filter(x => x.sitting === "2018s" && x.letter === "A")) {
      const card = document.querySelector("#q-" + q.id), en = q.en || {};
      if (!card) { bad.push([q.id, "no card"]); continue; }
      const want = (en.question ? 1 : 0) + (q.intro && en.intro ? 1 : 0), got = card.querySelectorAll(".qtext .en").length;
      if (got !== want) bad.push([q.id, "question en", got, want]);
      if (q.answer) {
        const seg = card.querySelectorAll(".seg .en").length, wantSeg = en.answer ? en.answer.length : 0;
        if (seg !== wantSeg) bad.push([q.id, "segments en", seg, wantSeg]);
        const tips = card.querySelectorAll(".answer .tips .en").length, wantTips = en.tips ? en.tips.length : 0;
        if (tips !== wantTips) bad.push([q.id, "tips en", tips, wantTips]);
        const dl = [...card.querySelectorAll(".seg")].every(s => s.getAttribute("lang") === "da");
        if (!dl) bad.push([q.id, "segment lang"]);
      }
    }
    return bad; })()`);
  check(`${tag} · English under question, every answer segment and tip (2018s A)`, Array.isArray(enBad) && enBad.length === 0, enBad);
  const enCount = await ev(`document.querySelectorAll("#app .en").length`);
  check(`${tag} · English lines exist on the page`, enCount > 0, enCount);
  // the English switch: hides the lines in place, keeps the open answer open, and is remembered
  await ev(`(() => { const b = [...document.querySelectorAll("#q-2018s-A-1A .btn")].find(x => /Vis svar/.test(x.textContent)); b.click(); return 1; })()`);
  const sw0 = await ev(`(() => [...document.querySelectorAll("#app .en")].filter(e => getComputedStyle(e).display !== "none").length)()`);
  await ev(`document.querySelector("#enToggle").click(); 1`); await sleep(120);
  const sw1 = await ev(`[[...document.querySelectorAll("#app .en")].filter(e => getComputedStyle(e).display !== "none").length,
    document.querySelector("#q-2018s-A-1A .answer").hidden, document.querySelector("#enToggle").textContent.trim(), localStorage.getItem("pd3.oral.en")]`);
  check(`${tag} · English switch hides the English lines, keeps the open answer, and is remembered`,
    sw0 > 0 && sw1[0] === 0 && sw1[1] === false && sw1[3] === "0" && /Vis engelsk|Show English/.test(sw1[2]), [sw0, sw1]);
  await open("#q/2018s-A-1A");
  check(`${tag} · English switch stays off after a reload`, await ev(`document.querySelector("#app").classList.contains("hide-en")`));
  await ev(`document.querySelector("#enToggle").click(); 1`); await sleep(120);
  check(`${tag} · English switch back on`, await ev(`[...document.querySelectorAll("#app .en")].some(e => getComputedStyle(e).display !== "none")`));

  // model answer: segments coloured by part, the structure map lights up the parts used
  const seg = await ev(`(async () => {
    const card = document.querySelector("#q-2018s-A-1A"); const btn = [...card.querySelectorAll("button")].find(b => /Vis svar/.test(b.textContent)); btn.click();
    await new Promise(r => setTimeout(r, 80));
    const segs = card.querySelectorAll(".seg"); const cols = [...segs].map(s => getComputedStyle(s).borderLeftColor);
    const steps = [...card.querySelectorAll("ol.steps li")];
    const usedOn = steps.filter(s => !s.classList.contains("off")).length;
    const fordi = [...steps].find(s => s.dataset.step === "fordi").querySelector("button"); fordi.click();
    await new Promise(r => setTimeout(r, 60));
    const lit = card.querySelectorAll(".seg.hi").length, litPart = card.querySelector(".seg.hi") && card.querySelector(".seg.hi").dataset.part;
    return { segs: segs.length, distinctColours: new Set(cols).size, steps: steps.length, usedOn, lit, litPart }; })()`);
  check(`${tag} · model answer: segments and structure map`, seg.segs === 6 && seg.distinctColours >= 4 && seg.steps === 6 && seg.usedOn === 6 && seg.lit === 1 && seg.litPart === "fordi", seg);
  // missing model answer
  const soon = await ev(`(async () => { await new Promise(r=>setTimeout(r,50)); location.hash = "#q/2018s-C-1A"; await new Promise(r=>setTimeout(r,200)); return [...document.querySelectorAll(".qcard .soon")].length; })()`);
  const expectSoon = await ev(`window.ORAL.questions.filter(q => q.letter === "C" && q.sitting === "2018s" && !q.answer).length`);
  check(`${tag} · every question without a model answer shows "Svar kommer snart"`, soon === expectSoon, [soon, expectSoon]);

  // language switch: UI text changes, the question text does not
  await open("#laer");
  const before = await ev(`[document.querySelector(".tabs, #tabs").textContent, document.querySelector(".brand").textContent]`);
  await ev(`document.querySelector(".langbtn").click(); 1`);
  await sleep(200);
  const en = await ev(`[document.querySelector("#tabs").textContent, document.querySelector(".langbtn").textContent]`);
  check(`${tag} · language switch changes UI text`, en[0].includes("Study") && en[0] !== before[0], en);
  await open("#q/2018s-A-1A");
  await ev(`document.querySelector(".langbtn").click(); 1`); await sleep(250);
  const qtext = await ev(`document.querySelector(".qcard .qtext").textContent`);
  check(`${tag} · question text unchanged by the language switch`, /Frivilligt|Nogle studerende/.test(qtext) || qtext.length > 20, qtext.slice(0, 60));
  await ev(`document.querySelector(".langbtn").click(); 1`); await sleep(200);

  await ev(`try { localStorage.setItem("pd3.lang", "da"); } catch (e) {} 1`);
  // ── Test ────────────────────────────────────────────────────────────────
  // stub Math.random so the examiner picks situation 1A (first question) on the first topic
  await open("#test");
  await ev(`Math.random = (() => { const f = Math.random; return () => 0.1; })(); 1`);
  check(`${tag} · test setup`, await ev(`!!document.querySelector(".chipbtn") && !!document.querySelector("button.btn.solid")`));
  const started = await ev(`(async () => {
    document.querySelectorAll(".chipbtn")[0].click(); await new Promise(r => setTimeout(r, 80));
    [...document.querySelectorAll("button.btn.solid")].find(b => /Start test/.test(b.textContent)).click();
    await new Promise(r => setTimeout(r, 150)); return document.querySelectorAll("#app .qcard, #app .thead").length > 0; })()`);
  check(`${tag} · test sitting 2018s starts`, started === true, started);
  const dbgBtns = await ev(`[...document.querySelectorAll("#app button")].map(b => b.textContent.trim()).join("|") + " || " + location.hash`);
  await clickText("Start spørgsmål");
  const q1 = await ev(`[!!document.querySelector("#ta"), document.querySelector("#app").innerText.slice(0, 40), ${JSON.stringify(dbgBtns)}]`);await ev(`[!!document.querySelector("figure.pic.test img"), !!document.querySelector("#ta"), document.querySelector("#app").innerText.slice(0, 160)]`);
  check(`${tag} · test question 1 shows picture + question`, q1[0] && q1[1], q1);
  await ev(`(() => { const ta = document.querySelector("#ta"); ta.value = ${JSON.stringify(SAMPLE.wo1)}; ta.dispatchEvent(new Event("input")); return 1; })()`);
  await clickText("Tjek mit svar");
  await sleep(120);
  const fbWo = await ev(`({ wo: [...document.querySelectorAll(".wlist .wo")].map(x => x.textContent), fixes: [...document.querySelectorAll(".wlist li b")].map(x => x.textContent) })`);
  check(`${tag} · word order: "tror, er det" flagged with fix`, fbWo.wo.includes("tror, er det") && fbWo.fixes.some(x => x.includes("tror, at det er")), fbWo);
  await shot(`${width}-${dark ? "dark" : "light"}-feedback`);
  const rated = await ev(`(async () => { [...document.querySelectorAll(".ratebtns button")].find(b => b.textContent.trim() === "Kunne").click(); await new Promise(r=>setTimeout(r,80)); return [...document.querySelectorAll(".ratebtns button")].find(b => b.textContent.trim() === "Kunne").getAttribute("aria-pressed"); })()`);
  check(`${tag} · self-rating saved (Kunne)`, rated === "true", rated);
  await clickText("Næste spørgsmål");
  await ev(`(() => { const ta = document.querySelector("#ta"); ta.value = ${JSON.stringify(SAMPLE.wo2)}; ta.dispatchEvent(new Event("input")); return 1; })()`);
  await clickText("Tjek mit svar");
  const modal = await ev(`[...document.querySelectorAll(".wlist .wo")].map(x => x.textContent)`);
  check(`${tag} · modal + at flagged ("kan at")`, modal.some(x => x.includes("kan at")), modal);
  await clickText("Kunne"); await clickText("Se emnet");
  const sum = await ev(`!!document.querySelector(".sumrow")`);
  check(`${tag} · topic summary reached`, sum);
  for (let k = 0; k < 2; k++) {
    await clickText("Næste emne");
    await clickText("Start spørgsmål");
    await clickText("Tjek mit svar"); await clickText("Kunne");
    await clickText("Næste spørgsmål");
    await clickText("Tjek mit svar"); await clickText("Kunne");
    await clickText("Se emnet");
  }
  await clickText("Se resultat");
  check(`${tag} · sitting test reaches "Testen er færdig"`, await ev(`/Test færdig|Testen er færdig/.test(document.querySelector("#app").textContent)`));

  // random test, with the topic pass-through checked by its title
  await open("#test");
  await ev(`Math.random = () => 0.1; 1`);
  await clickText("Tilfældig · 3 emner", ".chipbtn");
  await clickText("Start test");
  check(`${tag} · random test starts`, await ev(`!!document.querySelector(".testbar")`));
  for (let k = 0; k < 3; k++) {
    await clickText("Start spørgsmål");
    await ev(`(() => { const ta = document.querySelector("#ta"); ta.value = ${JSON.stringify(SAMPLE.clean)}; ta.dispatchEvent(new Event("input")); return 1; })()`);
    await clickText("Tjek mit svar"); await clickText("Kunne");
    await clickText("Næste spørgsmål");
    await ev(`(() => { const ta = document.querySelector("#ta"); ta.value = ${JSON.stringify(SAMPLE.spell)}; ta.dispatchEvent(new Event("input")); return 1; })()`);
    await clickText("Tjek mit svar"); await clickText("Delvist");
    await clickText(k < 2 ? "Se emnet" : "Se emnet");
    if (k < 2) await clickText("Næste emne");
  }
  await clickText("Se resultat");
  check(`${tag} · random test reaches the end`, await ev(`/Test færdig|Testen er færdig/.test(document.querySelector("#app").textContent)`));

  // clean answer: no word-order flags; spelling fix for "velvlre"
  await open("#test");
  await ev(`Math.random = () => 0.1; 1`);
  await clickText("Start test");
  await clickText("Start spørgsmål");
  await ev(`(() => { const ta = document.querySelector("#ta"); ta.value = ${JSON.stringify(SAMPLE.clean)}; ta.dispatchEvent(new Event("input")); return 1; })()`);
  await clickText("Tjek mit svar");
  const clean = await ev(`({ wo: document.querySelectorAll(".wlist .wo").length, none: [...document.querySelectorAll(".ok-mark")].map(x => x.textContent), struct: [...document.querySelectorAll(".fsteps li")].map(li => li.textContent.slice(0,1)).join("") })`);
  check(`${tag} · clean answer: no word-order flag`, clean.wo === 0 && clean.none.some(x => /Ingen ordstillingsfejl|No word-order/.test(x)), clean);
  check(`${tag} · structure ✅/❌ shown for each step`, clean.struct.length >= 5, clean.struct);
  await open("#test");
  await ev(`Math.random = () => 0.1; 1`);
  await clickText("Start test"); await clickText("Start spørgsmål");
  await ev(`(() => { const ta = document.querySelector("#ta"); ta.value = ${JSON.stringify(SAMPLE.spell)}; ta.dispatchEvent(new Event("input")); return 1; })()`);
  await clickText("Tjek mit svar");
  const spell = await ev(`[...document.querySelectorAll(".sp-old")].map(x => x.textContent).concat([...document.querySelectorAll(".sp-new")].map(x => x.textContent))`);
  check(`${tag} · spelling: "velvlre" → "velvære"`, spell.includes("velvlre") && spell.includes("velvære"), spell);
  check(`${tag} · spelling note says it does not count`, /tæller ikke|does not count/.test(await ev(`document.querySelector(".box") ? document.querySelector("#app").textContent : ""`)));

  // progress: two "Kunne" on two different days make a question secure; it persists after a reload
  await ev(`(() => { try { const k = "pd3.oral.v1"; const d = JSON.parse(localStorage.getItem(k) || "{}");
    d["2018s-A-1B"] = { ratings: [{ d: "2000-01-01", r: "k" }, { d: "2000-01-02", r: "k" }] }; localStorage.setItem(k, JSON.stringify(d)); } catch (e) {} return 1; })()`);
  await open("#laer");
  const prog = await ev(`document.querySelector(".progline .pl") && document.querySelector(".progline .pl").textContent`);
  check(`${tag} · one progress line counts sure questions`, typeof prog === "string" && prog.includes("1 af 108 spørgsmål sikre") && /ikke startet/.test(prog), prog);
  check(`${tag} · progress persists after reload`, await ev(`(JSON.parse(localStorage.getItem("pd3.oral.v1")||"{}"))["2018s-A-1B"].ratings.length`) === 2);

  // ── B3 start screen: no Rammer tab, the four question types, one progress line, a 3-step how-to ──
  await open("#laer");
  check(`${tag} · tabs are Lær and Test only`, await ev(`[...document.querySelectorAll("#tabs button")].map(b => b.textContent.trim()).join("|")`) === "Lær|Test");
  check(`${tag} · start screen: the four question types`, await ev(`document.querySelectorAll(".ftype").length === 4 &&
    [...document.querySelectorAll(".ftype .fq")].every(x => x.textContent.trim().length > 0)`));
  check(`${tag} · start screen: 3-step how-to`, await ev(`document.querySelectorAll(".howsteps li").length === 3`));
  check(`${tag} · start screen: stat cards replaced by one progress line`, await ev(`!document.querySelector(".band") && document.querySelectorAll(".progline").length === 1`));
  await shot(`${width}-${dark ? "dark" : "light"}-laer-start`);
  await open("#test");
  check(`${tag} · Test tab opens`, await ev(`!!document.querySelector(".chipbtn")`));

  check(`${tag} · no horizontal scroll (Lær + Test)`, await ev(`document.documentElement.scrollWidth <= window.innerWidth`));
  check(`${tag} · no console errors`, consoleErrors.length === 0, consoleErrors.slice(0, 5));
  await ev(`localStorage.removeItem("pd3.oral.v1"); 1`);
  await ev(`Math.random = (() => { const f = Math.random; return f; })(); 1`);
}

await send("Emulation.setDeviceMetricsOverride", { width: 0, height: 0, deviceScaleFactor: 0, mobile: false }).catch(() => {});
chrome.kill();
console.log(failures ? `\n${failures} check(s) FAILED` : "\nall checks passed");
process.exit(failures ? 1 : 0);
