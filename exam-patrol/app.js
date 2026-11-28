const subjects = {
  chinese: {
    name: "國文",
    color: "#efa38a",
    scope: "論語選、背影、心囚、貪睡的長頸鹿與語文常識",
  },
  math: {
    name: "數學",
    color: "#f4ce66",
    scope: "因數與倍數、分數四則運算與生活應用",
  },
  civics: {
    name: "公民",
    color: "#a3c4d6",
    scope: "變遷中的家庭、人口資料與生活情境",
  },
  biology: {
    name: "生物",
    color: "#afc8a4",
    scope: "細胞與滲透、組成層次、食物養分與酵素",
  },
  physics: {
    name: "理化",
    color: "#a8cbd0",
    scope: "分子與化學式、物質分類、原子計數與粒子圖",
  },
  history: {
    name: "歷史",
    color: "#deb89a",
    scope: "大航海時代的臺灣、原住民族與荷西政權的互動",
  },
};
const main = document.querySelector("main");
const byId = new Map();
const storeKey = "vocab-mine.exam-patrol.2026-v1";
const fresh = () => ({ runs: {}, wrong: {} });
function readState() {
  try {
    const data = JSON.parse(localStorage.getItem(storeKey));
    return data?.runs && data?.wrong ? data : fresh();
  } catch {
    return fresh();
  }
}
let state = readState();
let storageWarning = false;
function persist() {
  try {
    localStorage.setItem(storeKey, JSON.stringify(state));
  } catch {
    storageWarning = true;
  }
  updateCount();
}
function updateCount() {
  document.getElementById("wrong-count").textContent = Object.keys(
    state.wrong,
  ).filter((id) => byId.has(id)).length;
  if (storageWarning && !document.querySelector(".storage-note")) {
    const note = document.createElement("div");
    note.className = "storage-note";
    note.textContent = "瀏覽器無法儲存本次進度，請在關閉分頁前完成測驗。";
    document.querySelector("header").after(note);
  }
}
const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function formula(text) {
  return escape(text).replace(
    /\{([a-zA-Z0-9−-]+)\/([a-zA-Z0-9−-]+)\}/g,
    (_, a, b) =>
      '<span class="frac" aria-label="' +
      a +
      " 除以 " +
      b +
      '"><span>' +
      a +
      "</span><span>" +
      b +
      "</span></span>",
  );
}
const arrow = '<span class="arrow" aria-hidden="true">→</span>';
const back = (hash = "home", txt = "測驗大廳") =>
  '<a class="crumb" href="#' + hash + '">←　' + txt + "</a>";
const link = (hash, label, cls = "") =>
  '<a class="btn ' + cls + '" href="#' + hash + '">' + label + "</a>";
const action = (name, label, cls = "", attrs = "") =>
  '<button type="button" class="btn ' +
  cls +
  '" data-act="' +
  name +
  '" ' +
  attrs +
  ">" +
  label +
  "</button>";
const countDone = (r) =>
  Object.values(r.responses).filter((x) => typeof x.ok === "boolean").length;
function orderedRuns() {
  return Object.values(state.runs).sort((a, b) => b.updated - a.updated);
}
function resumed(r) {
  return (
    '<div class="resume"><div><b>接續測驗　' +
    escape(r.label) +
    "</b><small>已完成 " +
    countDone(r) +
    " / " +
    r.ids.length +
    " 題</small></div>" +
    link("quiz/" + r.id, "繼續作答 " + arrow, "small") +
    "</div>"
  );
}
function home() {
  const resume = orderedRuns().find((r) => !r.finished);
  const cards = Object.entries(subjects)
    .map(
      ([key, s]) =>
        '<a class="subject" style="--wash:' +
        s.color +
        '" href="#subject/' +
        key +
        '"><div class="card-top"><span class="iconbox"><img width="40" height="40" alt="" src="assets/' +
        key +
        '.png"></span><span class="card-count">' +
        s.items.length +
        ' 題</span></div><div class="card-body"><h3>' +
        s.name +
        "</h3><p>" +
        s.scope +
        '</p><span class="card-link">選擇單元' +
        arrow +
        "</span></div></a>",
    )
    .join("");
  main.innerHTML =
    `<section class="hero"><div class="hero-copy"><span class="issue">七年級　／　第二次段考</span><h1><span>段考特訓</span><span class="red">派出所</span></h1><p>${Object.keys(subjects).length} 科 ${byId.size} 道複習題，今天要挑戰哪一科？</p><div class="actions">` +
    action("pick", "選擇科目　↓", "redbtn") +
    action("random", "隨機練 10 題", "simple") +
    '</div></div><div class="hero-art"><img src="assets/station.webp" alt="街角派出所前，巡警拿著鉛筆和測驗板。" fetchpriority="high"></div></section>' +
    (resume ? resumed(resume) : "") +
    '<section id="subjects"><div class="section-title"><span class="mark" aria-hidden="true">✦</span><h2>科目測驗</h2></div><div class="cards">' +
    cards +
    "</div></section>";
}
function subjectPage(key) {
  const s = subjects[key];
  if (!s) return missing();
  const unitNames = [...new Set(s.items.map((q) => q.unit))];
  const units = unitNames
    .map(
      (name, i) =>
        '<button type="button" class="unit" data-act="start-unit" data-subject="' +
        key +
        '" data-unit="' +
        i +
        '"><span>' +
        escape(name.replaceAll("｜", " · ")) +
        "</span><span>" +
        s.items.filter((q) => q.unit === name).length +
        " 題　→</span></button>",
    )
    .join("");
  const resume = orderedRuns().find(
    (r) => !r.finished && r.scope.startsWith(key + ":"),
  );
  main.innerHTML =
    '<div class="screen">' +
    back() +
    '<section class="frame"><span class="tag" style="background:' +
    s.color +
    '">七年級 · 第二次段考</span><h1>' +
    s.name +
    '測驗</h1><p class="lead">' +
    s.scope +
    '</p><div class="actions">' +
    action(
      "start-subject",
      "全科測驗 · " + s.items.length + " 題 " + arrow,
      "redbtn",
      'data-subject="' + key + '"',
    ) +
    "</div>" +
    (resume ? resumed(resume) : "") +
    '<div class="section-title"><h2>依單元練習</h2></div><div class="unit-list">' +
    units +
    "</div></section></div>";
}
function shuffle(ids) {
  const a = ids.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function startRun(ids, label, scope) {
  if (!ids.length) return;
  const existing = orderedRuns().find(
    (r) =>
      !r.finished &&
      countDone(r) < r.ids.length &&
      r.scope === scope &&
      (scope !== "wrong" || r.ids.join() === ids.join()),
  );
  if (existing) {
    location.hash = "quiz/" + existing.id;
    return;
  }
  const id =
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  state.runs[id] = {
    id,
    scope,
    label,
    ids,
    at: 0,
    responses: {},
    updated: Date.now(),
    finished: false,
  };
  persist();
  location.hash = "quiz/" + id;
}
function diagram(path, alt) {
  if (!path) return "";
  const src = escape(path);
  return (
    '<a class="diagram" href="' +
    src +
    '" target="_blank" rel="noopener" aria-label="' +
    escape("開啟大圖：" + alt) +
    '"><img src="' +
    src +
    '" alt="' +
    escape(alt) +
    '"></a>'
  );
}
function explanation(q) {
  return (
    "<p>" +
    formula(q.explanation) +
    "</p>" +
    diagram(q.explanationImage, q.explanationAlt || "答案圖解")
  );
}
function questionMaterial(q) {
  if (!q.passage && !q.table && !q.image) return "";
  const table = q.table
    ? '<div class="scrolltable"><table><thead><tr>' +
      q.table[0]
        .map((v) => '<th scope="col">' + formula(v) + "</th>")
        .join("") +
      "</tr></thead><tbody>" +
      q.table
        .slice(1)
        .map(
          (row) =>
            "<tr>" +
            row.map((v) => "<td>" + formula(v) + "</td>").join("") +
            "</tr>",
        )
        .join("") +
      "</tbody></table></div>"
    : "";
  return (
    '<aside class="material" aria-label="題組資料">' +
    (q.passage ? "<p>" + formula(q.passage) + "</p>" : "") +
    table +
    diagram(q.image, q.alt || "題目附圖") +
    "</aside>"
  );
}
function getResponse(r, id) {
  return (r.responses[id] ??= { value: "", choice: null, shown: false });
}
function keyAnswer(q) {
  return q.options
    ? String.fromCharCode(65 + q.correct) + "．" + q.options[q.correct]
    : q.answer;
}
function userAnswer(q, a) {
  if (q.options)
    return Number.isInteger(a.choice)
      ? String.fromCharCode(65 + a.choice) + "．" + q.options[a.choice]
      : "未作答";
  return a.value?.trim() || "未作答";
}
function renderQuiz(runId) {
  const r = state.runs[runId];
  if (!r) return missing();
  if (r.finished) return result(runId);
  const id = r.ids[r.at],
    q = byId.get(id);
  if (!q) return missing();
  const a = getResponse(r, id),
    marked = typeof a.ok === "boolean";
  let inputs = "";
  if (q.options) {
    inputs =
      '<div class="options" role="group" aria-label="單選選項">' +
      q.options
        .map((opt, i) => {
          let cls = a.choice === i ? " selected" : "";
          if (a.shown && i === q.correct) cls += " good";
          if (a.shown && a.choice === i && i !== q.correct) cls += " bad";
          return (
            '<button type="button" class="opt' +
            cls +
            '" data-act="choice" data-val="' +
            i +
            '" aria-pressed="' +
            (a.choice === i) +
            '" ' +
            (a.shown ? "disabled" : "") +
            "><span>" +
            String.fromCharCode(65 + i) +
            "</span><span>" +
            formula(opt) +
            "</span></button>"
          );
        })
        .join("") +
      "</div>";
  } else if (!a.shown) {
    inputs =
      '<label class="field-label" for="answer">' +
      (q.accept ? "填入答案" : "寫下你的答案與理由") +
      "</label>" +
      (q.accept
        ? '<input class="text-answer" id="answer" autocomplete="off" value="' +
          escape(a.value) +
          '">'
        : '<textarea id="answer" placeholder="在這裡作答……">' +
          escape(a.value) +
          "</textarea>");
  } else {
    inputs =
      '<p class="response"><b>你的作答　</b>' +
      formula(userAnswer(q, a)) +
      "</p>";
  }
  let feedback = "";
  if (a.shown) {
    const head = marked
      ? a.ok
        ? "答對了"
        : "已收入錯題簿"
      : "對照參考答案，自評這一題";
    feedback =
      '<div class="feedback ' +
      (marked ? (a.ok ? "good" : "bad") : "") +
      '" tabindex="-1"><strong>' +
      head +
      "</strong><p><b>參考答案　</b>" +
      formula(keyAnswer(q)) +
      "</p>" +
      explanation(q);
    if (!marked)
      feedback +=
        '<div class="actions">' +
        action("yes", "我答對了", "yellow") +
        action("no", "還要再練", "simple") +
        "</div>";
    else if (q.accept && !a.ok && a.value.trim())
      feedback +=
        '<div class="actions">' +
        action("yes", "我的寫法等值，改記答對", "small simple") +
        "</div>";
    feedback += "</div>";
  }
  const check = action(
    "check",
    q.options || q.accept ? "核對答案" : "查看參考答案",
    "redbtn",
    'id="check" ' +
      ((q.options ? a.choice === null : !a.value.trim()) ? "disabled" : ""),
  );
  const next = action(
    "next",
    r.at + 1 === r.ids.length ? "查看測驗結果 →" : "下一題 →",
    "yellow",
  );
  const controls =
    '<div class="actions">' +
    (r.at > 0 ? action("prev", "← 上一題", "simple small") : "") +
    (marked
      ? next
      : !a.shown
        ? check + action("skip", "暫時不會", "simple small")
        : "") +
    "</div>";
  main.innerHTML =
    '<div class="screen">' +
    back() +
    '<article class="frame"><div class="questionbar"><span>' +
    escape(r.label) +
    "</span><span>第 " +
    (r.at + 1) +
    " / " +
    r.ids.length +
    ' 題</span></div><div class="progress" aria-hidden="true"><i style="width:' +
    (100 * countDone(r)) / r.ids.length +
    '%"></i></div><span class="tag" style="background:' +
    subjects[q.sub].color +
    '">' +
    subjects[q.sub].name +
    "　" +
    escape(q.unit) +
    "　第 " +
    escape(q.number) +
    " 題</span>" +
    '<h1 class="qtitle">' +
    formula(q.prompt) +
    "</h1>" +
    questionMaterial(q) +
    inputs +
    feedback +
    controls +
    "</article></div>";
}
function normalize(v) {
  return String(v ?? "")
    .normalize("NFKC")
    .replace(/[−﹣]/g, "-")
    .trim()
    .replace(/[。.!！]$/, "")
    .replace(/\s+/g, "");
}
function rational(v) {
  const s = String(v)
    .normalize("NFKC")
    .trim()
    .replace(/−/g, "-")
    .replace(/(平方公尺|公尺|塊|天)$/, "")
    .trim();
  const m = s.match(/^(-?)(?:(\d+)(?:又|\s+))?(\d+)\s*\/\s*(\d+)$/);
  if (m && Number(m[4]))
    return (m[1] ? -1 : 1) * (Number(m[2] || 0) + Number(m[3]) / Number(m[4]));
  return /^-?\d+(?:\.\d+)?$/.test(s) ? Number(s) : NaN;
}
function accepted(q, v) {
  if (q.sub !== "math")
    return q.accept.some((k) => normalize(k) === normalize(v));
  // Keep the space between the whole number and a mixed fraction.
  const mathText = (x) =>
    String(x).normalize("NFKC").replace(/−/g, "-").trim().replace(/\s+/g, " ");
  if (q.accept.some((k) => mathText(k) === mathText(v))) return true;
  if (q.strictForm) return false;
  // 任何明寫的單位都必須和本題一致。
  const allowedUnits = q.accept
    .map((x) => x.match(/(平方公尺|公尺|塊|天)$/)?.[1])
    .filter(Boolean);
  const unit = v.trim().match(/(平方公尺|公尺|塊|天)$/)?.[1];
  if (unit && !allowedUnits.includes(unit)) return false;
  const value = rational(v);
  return (
    Number.isFinite(value) &&
    q.accept.some((k) => Math.abs(value - rational(k)) < 1e-12)
  );
}
function grade(r, q, a, ok) {
  a.shown = true;
  a.ok = ok;
  if (ok) delete state.wrong[q.id];
  else state.wrong[q.id] = Date.now();
  r.updated = Date.now();
  persist();
}
function reviewRow(q, a) {
  return (
    '<details class="review-detail"><summary><span class="stamp ' +
    (a.ok ? "" : "bad") +
    '">' +
    (a.ok ? "答對" : "再練") +
    "</span>　" +
    escape(subjects[q.sub].name) +
    " · " +
    escape(q.unit) +
    " · 第 " +
    escape(q.number) +
    " 題</summary><p><b>" +
    formula(q.prompt) +
    "</b></p>" +
    questionMaterial(q) +
    "<p>你的作答　" +
    formula(userAnswer(q, a)) +
    "</p><p><b>參考答案　</b>" +
    formula(keyAnswer(q)) +
    "</p>" +
    explanation(q) +
    "</details>"
  );
}
function result(runId) {
  const r = state.runs[runId];
  if (!r) return missing();
  if (!r.finished) return renderQuiz(runId);
  const correct = r.ids.filter((id) => r.responses[id]?.ok).length;
  main.innerHTML =
    '<div class="screen">' +
    back() +
    '<section class="frame"><span class="tag">' +
    escape(r.label) +
    '</span><h1>測驗完成</h1><div class="score">' +
    correct +
    " / " +
    r.ids.length +
    "</div><p>答對 " +
    correct +
    " 題，還要再練 " +
    (r.ids.length - correct) +
    ' 題。簡答依自評結果計入。</p><div class="actions">' +
    (r.ids.some((id) => r.responses[id]?.ok === false)
      ? action("retry", "重練本次錯題", "redbtn", 'data-run="' + r.id + '"')
      : "") +
    link("home", "回測驗大廳", "yellow") +
    '</div><div class="section-title"><h2>逐題回顧</h2></div>' +
    r.ids.map((id) => reviewRow(byId.get(id), r.responses[id])).join("") +
    "</section></div>";
}
function mistakes() {
  const ids = Object.keys(state.wrong)
    .filter((id) => byId.has(id))
    .sort((a, b) => state.wrong[b] - state.wrong[a]);
  const rows = ids
    .map((id) => {
      const q = byId.get(id);
      return (
        '<div class="entry"><div><b>' +
        subjects[q.sub].name +
        "　" +
        escape(q.unit) +
        " · 第 " +
        escape(q.number) +
        " 題</b><small>" +
        formula(q.prompt) +
        "</small></div>" +
        action("one", "重練", "small", 'data-id="' + id + '"') +
        "</div>"
      );
    })
    .join("");
  main.innerHTML =
    '<div class="screen">' +
    back() +
    '<section class="frame"><h1>錯題簿</h1>' +
    (ids.length
      ? "<p>目前有 " +
        ids.length +
        " 題待複習。重新作答正確後，該題會從錯題簿移除。</p>" +
        action("wrong", "重練所有錯題 " + arrow, "redbtn") +
        '<div class="entry-list">' +
        rows +
        "</div>"
      : '<div class="empty"><p>目前沒有待複習的錯題。作答後選擇「還要再練」的簡答題也會收在這裡。</p>' +
        link("home", "選一科開始", "yellow") +
        "</div>") +
    "</section></div>";
}
function records() {
  const runs = orderedRuns();
  const entries = runs
    .map(
      (r) =>
        '<div class="entry"><div><b>' +
        escape(r.label) +
        "</b><small>" +
        escape(
          new Date(r.updated).toLocaleString("zh-TW", {
            dateStyle: "short",
            timeStyle: "short",
          }),
        ) +
        "　·　" +
        (r.finished
          ? "答對 " +
            r.ids.filter((id) => r.responses[id]?.ok).length +
            " / " +
            r.ids.length +
            " 題"
          : "已完成 " + countDone(r) + " / " + r.ids.length + " 題") +
        "</small></div>" +
        link(
          (r.finished ? "result/" : "quiz/") + r.id,
          r.finished ? "查看結果" : "繼續作答",
          "small",
        ) +
        "</div>",
    )
    .join("");
  main.innerHTML =
    '<div class="screen">' +
    back() +
    '<section class="frame"><h1>作答紀錄</h1>' +
    (runs.length
      ? '<div class="entry-list">' + entries + "</div>"
      : "<p>完成或暫停的測驗都會出現在這裡。</p>" +
        link("home", "開始第一份測驗", "yellow")) +
    "</section></div>";
}
function missing() {
  main.innerHTML =
    '<div class="frame"><h1>找不到這份測驗</h1><p>這個網址的作答紀錄可能儲存在另一個瀏覽器。</p>' +
    link("home", "回測驗大廳", "yellow") +
    "</div>";
}
function route() {
  return location.hash.slice(1).split("/");
}
function show(scroll = true) {
  let [page, id] = route();
  page = page || "home";
  updateCount();
  document.querySelectorAll("[data-tab]").forEach((a) => {
    const on =
      a.dataset.tab ===
      (["mistakes", "records"].includes(page) ? page : "home");
    a.classList.toggle("active", on);
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  if (page === "home" || page === "main") home();
  else if (page === "subject") subjectPage(id);
  else if (page === "quiz") renderQuiz(id);
  else if (page === "result") result(id);
  else if (page === "mistakes") mistakes();
  else if (page === "records") records();
  else missing();
  if (scroll) {
    window.scrollTo({ top: 0, behavior: "instant" });
    main.focus({ preventScroll: true });
  }
}
main.addEventListener("input", (e) => {
  if (e.target.id !== "answer") return;
  const r = state.runs[route()[1]];
  if (!r || r.finished) return;
  const a = getResponse(r, r.ids[r.at]);
  if (a.shown) return;
  a.value = e.target.value;
  r.updated = Date.now();
  persist();
  document.getElementById("check").disabled = !a.value.trim();
});
main.addEventListener("keydown", (e) => {
  if (e.target.matches("input#answer") && e.key === "Enter" && !e.isComposing) {
    e.preventDefault();
    document.getElementById("check")?.click();
  }
});
main.addEventListener("click", (e) => {
  const el = e.target.closest("[data-act]");
  if (!el || el.disabled) return;
  const act = el.dataset.act,
    s = subjects[el.dataset.subject];
  if (act === "pick") {
    const first = document.querySelector(".cards a");
    first?.focus({ preventScroll: true });
    document.querySelector("#subjects")?.scrollIntoView({ block: "center" });
    return;
  }
  if (act === "random") {
    startRun(
      shuffle([...byId.keys()]).slice(0, 10),
      "跨科隨機 10 題",
      "random:" + Object.keys(subjects).join(","),
    );
    return;
  }
  if (act === "start-subject") {
    startRun(
      s.items.map((q) => q.id),
      s.name + "全科測驗",
      el.dataset.subject + ":all",
    );
    return;
  }
  if (act === "start-unit") {
    const u = [...new Set(s.items.map((q) => q.unit))][Number(el.dataset.unit)];
    startRun(
      s.items.filter((q) => q.unit === u).map((q) => q.id),
      s.name + " · " + u,
      el.dataset.subject + ":" + el.dataset.unit,
    );
    return;
  }
  if (act === "wrong") {
    startRun(
      Object.keys(state.wrong).filter((id) => byId.has(id)),
      "錯題重練",
      "wrong",
    );
    return;
  }
  if (act === "one") {
    startRun([el.dataset.id], "單題重練", "single:" + el.dataset.id);
    return;
  }
  if (act === "retry") {
    const r = state.runs[el.dataset.run];
    startRun(
      r.ids.filter((id) => r.responses[id]?.ok === false),
      "本次錯題重練",
      "retry:" + r.id,
    );
    return;
  }
  const r = state.runs[route()[1]];
  if (!r || r.finished) return;
  const q = byId.get(r.ids[r.at]),
    a = getResponse(r, q.id);
  if (act === "choice" && !a.shown) {
    a.choice = Number(el.dataset.val);
    r.updated = Date.now();
    persist();
    main.querySelectorAll(".opt").forEach((o, i) => {
      o.classList.toggle("selected", i === a.choice);
      o.setAttribute("aria-pressed", String(i === a.choice));
    });
    document.getElementById("check").disabled = false;
    return;
  }
  if (act === "check" && !a.shown) {
    if (q.options) grade(r, q, a, a.choice === q.correct);
    else if (q.accept) grade(r, q, a, accepted(q, a.value));
    else {
      a.shown = true;
      r.updated = Date.now();
      persist();
    }
  } else if (act === "skip" && !a.shown) {
    a.choice = null;
    a.value = "";
    grade(r, q, a, false);
  } else if ((act === "yes" || act === "no") && a.shown) {
    grade(r, q, a, act === "yes");
  } else if (act === "prev" && r.at > 0) {
    r.at--;
    persist();
    show();
    return;
  } else if (act === "next" && typeof a.ok === "boolean") {
    if (r.at === r.ids.length - 1) {
      r.finished = true;
      r.updated = Date.now();
      persist();
      location.hash = "result/" + r.id;
      return;
    }
    r.at++;
    r.updated = Date.now();
    persist();
    show();
    return;
  } else return;
  renderQuiz(r.id);
  main.querySelector(".feedback")?.focus();
});
async function init() {
  await Promise.all(
    Object.entries(subjects).map(async ([key, s]) => {
      const res = await fetch("data/" + key + ".json");
      if (!res.ok) throw Error("load");
      s.items = (await res.json()).map((q, i) => ({
        ...q,
        id: key + "-" + (i + 1),
        sub: key,
      }));
      for (const q of s.items) byId.set(q.id, q);
    }),
  );
  window.addEventListener("hashchange", () => show());
  window.addEventListener("storage", (e) => {
    if (e.key === storeKey) {
      state = readState();
      show(false);
    }
  });
  show(false);
}
init().catch(() => {
  main.innerHTML =
    '<div class="frame"><h1>題庫載入失敗</h1><p>請確認連線後重新整理頁面。</p><button class="btn" id="reload">重新載入</button></div>';
  document.getElementById("reload").onclick = () => location.reload();
});
