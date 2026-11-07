/* ============================================================
   GALI CRICKET — Mohalla League
   game.js — game logic + rendering (vanilla JS, no build step).
   All content comes from js/data.js (COMMENTARY, TEAMS,
   SHOP_ITEMS, COIN_RULES, BALL_TYPES).
   ============================================================ */
"use strict";

/* ---------------- Save / persistent state ---------------- */
const SAVE_KEY = "galiCricketSaveV1";
const DEFAULT_OWNED = ["bat-lakri", "ball-classic", "jersey-team", "stadium-gali5"];

function defaultSave() {
  return {
    coins: COIN_RULES.startBalance,
    owned: DEFAULT_OWNED.slice(),
    equipped: { bat: "bat-lakri", ball: "ball-classic", jersey: "jersey-team", stadium: "stadium-gali5" },
    team: "korangi",
    highScore: 0,
    lastDaily: "",
    muted: false,
  };
}
function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const s = Object.assign(defaultSave(), JSON.parse(raw));
    s.equipped = Object.assign(defaultSave().equipped, s.equipped || {});
    if (!Array.isArray(s.owned) || !s.owned.length) s.owned = DEFAULT_OWNED.slice();
    return s;
  } catch (e) { return defaultSave(); }
}
let save = loadSave();
function persist() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* storage full/blocked: game still runs */ }
}

/* ---------------- DOM helpers ---------------- */
const $ = (id) => document.getElementById(id);
const screens = { home: $("screen-home"), game: $("screen-game"), result: $("screen-result"), shop: $("screen-shop") };
function showScreen(name) {
  Object.keys(screens).forEach((k) => screens[k].classList.toggle("active", k === name));
  window.scrollTo(0, 0);
}
let toastTimer = null;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}
function updateCoins() { $("coinCount").textContent = save.coins; }
function teamById(id) { return TEAMS.find((t) => t.id === id) || TEAMS[0]; }
function itemById(id) { return SHOP_ITEMS.find((i) => i.id === id); }
function randomLine(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* ---------------- Sound (WebAudio, no files) ---------------- */
let audioCtx = null;
function ac() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function tone(freqFrom, freqTo, dur, type, vol, delay) {
  if (save.muted) return;
  const ctx = ac(); if (!ctx) return;
  const t0 = ctx.currentTime + (delay || 0);
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type || "square";
  o.frequency.setValueAtTime(freqFrom, t0);
  o.frequency.exponentialRampToValueAtTime(Math.max(freqTo, 1), t0 + dur);
  g.gain.setValueAtTime(vol || 0.12, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
const sfx = {
  click: () => tone(660, 660, 0.06, "square", 0.06),
  hit:   () => { tone(200, 70, 0.09, "square", 0.2); tone(1200, 900, 0.05, "triangle", 0.08); },
  six:   () => { tone(392, 392, 0.16, "sawtooth", 0.14); tone(523, 523, 0.28, "sawtooth", 0.14, 0.15); },
  four:  () => { tone(523, 523, 0.1, "sawtooth", 0.1); tone(659, 659, 0.14, "sawtooth", 0.1, 0.1); },
  out:   () => tone(1300, 500, 0.45, "sine", 0.16),
  dot:   () => tone(220, 180, 0.08, "triangle", 0.08),
  coin:  () => { tone(988, 988, 0.07, "square", 0.08); tone(1319, 1319, 0.12, "square", 0.08, 0.07); },
};

/* ---------------- Theme / cosmetics ---------------- */
function applyTheme() {
  const root = document.documentElement.style;
  const bat = itemById(save.equipped.bat);
  const ball = itemById(save.equipped.ball);
  const jersey = itemById(save.equipped.jersey);
  const stadium = itemById(save.equipped.stadium);
  const team = teamById(save.team);
  if (bat) root.setProperty("--bat-color", bat.color);
  if (ball) { root.setProperty("--ball-color", ball.color); root.setProperty("--ball-tape", ball.tape); }
  root.setProperty("--jersey", jersey && jersey.color ? jersey.color : team.primary);
  if (stadium) {
    root.setProperty("--green-pitch1", stadium.bg1);
    root.setProperty("--green-pitch2", stadium.bg2);
    $("pitchName").textContent = stadium.name;
  }
  $("statTeam").textContent = team.short;
  $("gsTeam").textContent = team.short + " · " + team.name;
}

/* ---------------- Home: team picker ---------------- */
function renderTeams() {
  const wrap = $("teamList");
  wrap.innerHTML = "";
  TEAMS.forEach((t) => {
    const d = document.createElement("div");
    d.className = "team-card" + (save.team === t.id ? " selected" : "");
    d.innerHTML = '<span class="badge" style="background:' + t.primary + '">' + t.short + "</span><br>" + t.name;
    d.addEventListener("click", () => {
      save.team = t.id; persist(); renderTeams(); applyTheme(); sfx.click();
    });
    wrap.appendChild(d);
  });
}

/* ---------------- Shop ---------------- */
const SHOP_GROUPS = [
  { type: "bat", title: "BALLE (BATS)" },
  { type: "ball", title: "TAPE BALLS" },
  { type: "jersey", title: "JERSEYS" },
  { type: "stadium", title: "GROUNDS" },
];
function swatchStyle(item) {
  if (item.type === "ball")
    return "background:linear-gradient(100deg, transparent 40%," + item.tape + " 40%," + item.tape + " 60%, transparent 60%), radial-gradient(circle at 34% 30%, #ffffff88, " + item.color + " 55%, #00000044);";
  if (item.type === "stadium")
    return "background:linear-gradient(180deg," + item.bg1 + "," + item.bg2 + ");";
  if (item.type === "jersey") {
    const c = item.color || teamById(save.team).primary;
    return "background:linear-gradient(180deg," + c + "," + c + "bb);";
  }
  return "background:linear-gradient(180deg," + item.color + ",#9a6a33);";
}
function renderShop() {
  const wrap = $("shopGroups");
  wrap.innerHTML = "";
  SHOP_GROUPS.forEach((g) => {
    const title = document.createElement("div");
    title.className = "shop-group-title";
    title.textContent = g.title;
    wrap.appendChild(title);
    const grid = document.createElement("div");
    grid.className = "shop-grid";
    SHOP_ITEMS.filter((i) => i.type === g.type).forEach((item) => {
      const owned = save.owned.includes(item.id);
      const equipped = save.equipped[item.type] === item.id;
      const card = document.createElement("div");
      card.className = "shop-item" + (equipped ? " equipped" : "");
      let btn;
      if (item.premium) btn = '<button disabled>Coming Soon</button>';
      else if (equipped) btn = '<button class="owned" disabled>Lagaya Hua</button>';
      else if (owned) btn = '<button class="equip" data-act="equip">Lagao</button>';
      else btn = '<button data-act="buy">Kharido</button>';
      card.innerHTML =
        (item.premium ? '<span class="premium-tag">PREMIUM</span>' : "") +
        '<div class="shop-swatch ' + (item.type === "bat" ? "bat-shape" : item.type === "ball" ? "" : "flat") + '" style="' + swatchStyle(item) + '"></div>' +
        '<div class="name">' + item.name + "</div>" +
        '<div class="price">' + (item.premium ? "Premium" : owned ? "Tumhare pas he" : item.price === 0 ? "FREE" : item.price + " Coins") + "</div>" +
        btn;
      const b = card.querySelector("button[data-act]");
      if (b) b.addEventListener("click", () => shopAction(item));
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
  });
}
function shopAction(item) {
  const owned = save.owned.includes(item.id);
  if (!owned) {
    if (save.coins < item.price) { toast("Coins kam hein yar! Pehle khelo, kamao."); sfx.dot(); return; }
    save.coins -= item.price;
    save.owned.push(item.id);
    save.equipped[item.type] = item.id;
    toast(item.name + " kharid liya aur laga bhi diya!");
    sfx.coin();
  } else {
    save.equipped[item.type] = item.id;
    toast(item.name + " laga diya!");
    sfx.click();
  }
  persist(); updateCoins(); applyTheme(); renderShop();
}

/* ---------------- Match state ---------------- */
const TOTAL_BALLS = 12, TOTAL_WICKETS = 3;
let M = null;          // match state, null when no match running
let rafId = null;      // requestAnimationFrame id
let pendingTimer = null;
let matchToken = 0;    // increments to invalidate stale timeouts after quit

function clearTimers() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = null;
}
function schedule(fn, ms) {
  const tok = matchToken;
  pendingTimer = setTimeout(() => { if (tok === matchToken) fn(); }, ms);
}

function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

function startMatch() {
  clearTimers();
  matchToken++;
  // Daily bonus: once per day, on first match start
  if (save.lastDaily !== todayStr()) {
    save.lastDaily = todayStr();
    save.coins += COIN_RULES.dailyBonus;
    persist(); updateCoins();
    $("dailyNote").textContent = "Aaj ka daily bonus mil gaya: +" + COIN_RULES.dailyBonus + " coins!";
    toast("Daily Bonus! +" + COIN_RULES.dailyBonus + " coins");
    sfx.coin();
  }
  M = {
    score: 0, wickets: 0, balls: 0,
    target: 25 + Math.floor(Math.random() * 24), // 25..48
    fours: 0, sixes: 0, best: 0, coinsEarned: 0,
    phase: "ready", ball: null,
  };
  applyTheme();
  showScreen("game");
  $("banner").classList.remove("show");
  $("commentary").textContent = "";
  $("ballLabel").textContent = "Target: " + M.target + " — pehli ball arahi he...";
  updateScoreStrip();
  $("btnHit").disabled = true;
  schedule(bowlNext, 900);
}

function updateScoreStrip() {
  if (!M) return;
  $("gsScore").textContent = M.score;
  $("gsWkts").textContent = " ●".repeat(M.wickets) + " ○".repeat(TOTAL_WICKETS - M.wickets);
  $("gsBalls").textContent = M.balls + "/" + TOTAL_BALLS;
  $("gsTarget").textContent = M.target;
  const need = M.target - M.score;
  const left = TOTAL_BALLS - M.balls;
  $("gsNeed").textContent = need > 0 ? ("Chahiye " + need + " run, " + left + " balls") : "Target pura!";
}

/* ---------------- Bowling ---------------- */
function bowlNext() {
  if (!M) return;
  if (M.balls >= TOTAL_BALLS || M.wickets >= TOTAL_WICKETS || M.score >= M.target) { endMatch(); return; }
  M.phase = "bowling";
  const type = BALL_TYPES[Math.floor(Math.random() * BALL_TYPES.length)];
  // Difficulty: every ball is a little faster than the last.
  const speedUp = Math.max(0.68, 1 - M.balls * 0.03);
  M.ball = {
    type: type,
    duration: type.duration * speedUp,
    start: performance.now(),
    contact: 0.95,          // progress value when the ball reaches the bat
    dir: Math.random() < 0.5 ? -1 : 1,
    swung: false,
  };
  $("ballLabel").textContent = type.label;
  $("commentary").textContent = "";
  $("banner").classList.remove("show");
  const ballEl = $("ball"), ring = $("timingRing");
  ballEl.style.display = "block";
  ring.style.display = "block";
  $("btnHit").disabled = false;
  animateBall();
}

function ballPos(p, type) {
  // Ball travels from bowler (top ~14%) down to the bat zone (~bottom 12%).
  const topPct = 14 + p * 66;                                   // 14% -> 80%
  const sway = Math.sin(p * Math.PI) * type.arc * 26 * (M.ball ? M.ball.dir : 1);
  const scale = 0.45 + p * 1.3;                                 // grows as it approaches
  return { topPct: topPct, leftPct: 50 + sway, scale: scale };
}

function animateBall() {
  const ballEl = $("ball"), trail = $("ballTrail");
  let lastTrail = 0;
  const step = (now) => {
    if (!M || M.phase !== "bowling" || !M.ball) return;
    const p = Math.min((now - M.ball.start) / M.ball.duration, 1);
    const pos = ballPos(p, M.ball.type);
    ballEl.style.top = pos.topPct + "%";
    ballEl.style.left = pos.leftPct + "%";
    ballEl.style.transform = "scale(" + pos.scale + ")";
    // Fading trail dots
    if (now - lastTrail > 45) {
      lastTrail = now;
      const dot = document.createElement("div");
      dot.className = "trail-dot";
      const s = 8 + p * 14;
      dot.style.width = s + "px"; dot.style.height = s + "px";
      dot.style.top = "calc(" + pos.topPct + "% - " + s / 2 + "px)";
      dot.style.left = "calc(" + pos.leftPct + "% - " + s / 2 + "px)";
      trail.appendChild(dot);
      setTimeout(() => dot.remove(), 260);
      while (trail.children.length > 14) trail.firstChild.remove();
    }
    if (p >= 1) { resolveBall("bowled"); return; }
    rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);
}

/* ---------------- Swing / timing ---------------- */
// Windows are in progress units around the contact point; they tighten per ball.
function windows() {
  const b = M ? M.balls : 0;
  return {
    perfect: Math.max(0.028, 0.046 - b * 0.0016),
    good: Math.max(0.07, 0.115 - b * 0.003),
    ok: Math.max(0.12, 0.185 - b * 0.004),
  };
}
function swing() {
  if (!M || M.phase !== "bowling" || !M.ball || M.ball.swung) return;
  M.ball.swung = true;
  const bat = $("bat");
  bat.classList.remove("swing"); void bat.offsetWidth; bat.classList.add("swing");
  const p = Math.min((performance.now() - M.ball.start) / M.ball.duration, 1);
  const diff = Math.abs(p - M.ball.contact);
  const w = windows();
  if (diff <= w.perfect) resolveBall(6);
  else if (diff <= w.good) resolveBall(diff <= (w.perfect + w.good) / 2 ? 4 : 2);
  else if (diff <= w.ok) resolveBall(1);
  else resolveBall(Math.random() < 0.45 ? "caught" : 0); // too early / too late
}

/* ---------------- Ball resolution ---------------- */
function resolveBall(outcome) {
  if (!M || M.phase !== "bowling") return;
  M.phase = "pause";
  if (rafId) cancelAnimationFrame(rafId); rafId = null;
  $("ball").style.display = "none";
  $("timingRing").style.display = "none";
  $("ballTrail").innerHTML = "";
  $("btnHit").disabled = true;
  M.balls += 1;

  let banner, bannerClass = "", line, earned = 0;
  if (outcome === "bowled" || outcome === "caught") {
    M.wickets += 1;
    banner = "OUT yar!"; bannerClass = "out";
    line = randomLine(COMMENTARY.out);
    $("ballLabel").textContent = outcome === "bowled" ? "BOWLED! Bat ghuma hi nahi..." : "CAUGHT! Hawa me shot gaya ghalat.";
    sfx.out();
  } else if (outcome === 6) {
    M.score += 6; M.sixes += 1; M.best = Math.max(M.best, 6);
    earned = 6 * COIN_RULES.perRun + COIN_RULES.perSixBonus;
    banner = "CHHAKKA!"; line = randomLine(COMMENTARY.six);
    $("ballLabel").textContent = "PERFECT TIMING!";
    sfx.hit(); sfx.six();
    const pitch = $("pitch");
    pitch.classList.remove("shake"); void pitch.offsetWidth; pitch.classList.add("shake");
  } else if (outcome === 4) {
    M.score += 4; M.fours += 1; M.best = Math.max(M.best, 4);
    earned = 4 * COIN_RULES.perRun + COIN_RULES.perFourBonus;
    banner = "CHOWKA!"; line = randomLine(COMMENTARY.four);
    $("ballLabel").textContent = "Zabardast shot!";
    sfx.hit(); sfx.four();
  } else if (outcome === 2 || outcome === 1) {
    M.score += outcome;
    earned = outcome * COIN_RULES.perRun;
    banner = outcome + (outcome === 2 ? " RUNS!" : " RUN!");
    line = randomLine(COMMENTARY.runs);
    $("ballLabel").textContent = "Achi timing, run mil gaya.";
    sfx.hit();
  } else { // dot ball
    banner = "Dot ball..."; line = randomLine(COMMENTARY.dot);
    $("ballLabel").textContent = "Timing miss ho gayi!";
    sfx.dot();
  }

  if (earned > 0) {
    M.coinsEarned += earned;
    save.coins += earned;
    persist(); updateCoins();
  }
  updateScoreStrip();
  const bt = $("bannerText");
  bt.textContent = banner;
  bt.className = bannerClass;
  $("banner").classList.add("show");
  $("commentary").textContent = line;

  const finished = M.wickets >= TOTAL_WICKETS || M.balls >= TOTAL_BALLS || M.score >= M.target;
  schedule(() => { if (M) { if (finished) endMatch(); else bowlNext(); } }, finished ? 1700 : 1500);
}

/* ---------------- Match end ---------------- */
function confetti() {
  const pitch = $("pitch");
  const colors = ["#ff2e88", "#ffd400", "#ff7b00", "#00c853", "#00b0ff"];
  for (let i = 0; i < 42; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "%";
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = 1.6 + Math.random() * 1.6 + "s";
    c.style.animationDelay = Math.random() * 0.5 + "s";
    (screens.result.classList.contains("active") ? document.body : pitch).appendChild(c);
    setTimeout(() => c.remove(), 3800);
  }
}

function endMatch() {
  if (!M) return;
  clearTimers();
  const win = M.score >= M.target;
  if (win) { M.coinsEarned += COIN_RULES.winBonus; save.coins += COIN_RULES.winBonus; }
  let newHigh = false;
  if (M.score > save.highScore) {
    save.highScore = M.score;
    newHigh = true;
    M.coinsEarned += COIN_RULES.highScoreBonus;
    save.coins += COIN_RULES.highScoreBonus;
  }
  persist(); updateCoins();

  $("resultTitle").textContent = win ? "JEET GAYE!" : "HAAR GAYE...";
  $("resultTitle").className = "result-title " + (win ? "win" : "lose");
  $("resultComment").textContent = randomLine(win ? COMMENTARY.win : COMMENTARY.lose);
  $("rScore").textContent = M.score + "/" + M.wickets;
  $("rTarget").textContent = M.target;
  $("rBalls").textContent = M.balls;
  $("rFours").textContent = M.fours;
  $("rSixes").textContent = M.sixes;
  $("rBest").textContent = M.best + " runs";
  $("rHigh").textContent = save.highScore + (newHigh ? " (NAYA RECORD!)" : "");
  $("rCoins").textContent = "+" + M.coinsEarned + " Coins kamaye!";
  M = null;
  showScreen("result");
  if (win) { confetti(); sfx.six(); } else { sfx.dot(); }
  if (newHigh) toast("Naya High Score! +" + COIN_RULES.highScoreBonus + " coins bonus!");
}

/* ---------------- Wiring ---------------- */
function init() {
  updateCoins();
  renderTeams();
  applyTheme();
  $("statHigh").textContent = save.highScore;
  if (save.lastDaily !== todayStr()) {
    $("dailyNote").textContent = "Aaj pehla match kheliye — daily bonus +" + COIN_RULES.dailyBonus + " coins milega!";
  }
  $("btnMute").textContent = save.muted ? "✕" : "♪";

  $("btnPlay").addEventListener("click", () => { sfx.click(); startMatch(); });
  $("btnAgain").addEventListener("click", () => { sfx.click(); startMatch(); });
  $("btnShop").addEventListener("click", () => { sfx.click(); renderShop(); showScreen("shop"); });
  $("btnShopBack").addEventListener("click", () => { sfx.click(); $("statHigh").textContent = save.highScore; showScreen("home"); });
  $("btnHome").addEventListener("click", () => { sfx.click(); $("statHigh").textContent = save.highScore; showScreen("home"); });
  $("btnQuit").addEventListener("click", () => {
    matchToken++; clearTimers(); M = null;
    $("ball").style.display = "none"; $("timingRing").style.display = "none";
    $("statHigh").textContent = save.highScore;
    showScreen("home");
  });
  $("btnHit").addEventListener("click", (e) => { e.stopPropagation(); swing(); });
  $("pitch").addEventListener("click", () => swing());
  $("btnMute").addEventListener("click", () => {
    save.muted = !save.muted; persist();
    $("btnMute").textContent = save.muted ? "✕" : "♪";
    if (!save.muted) sfx.click();
  });
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && screens.game.classList.contains("active")) { e.preventDefault(); swing(); }
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => { /* offline mode unavailable (e.g. file://) */ });
    });
  }
}
document.addEventListener("DOMContentLoaded", init);
