// ===== CONFIG =====
const GIRLFRIEND_NAME = "Madhura"; // change if needed
document.getElementById("heroTitle").textContent = `${GIRLFRIEND_NAME}, I made something for you.`;

// ===== MUSIC =====
const bgm = document.getElementById("bgm");
const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
const volume = document.getElementById("volume");
const nowPlaying = document.getElementById("nowPlaying");

function setNowPlaying(t){ nowPlaying.textContent = t; }

async function startMusic(){
  try{
    bgm.volume = Number(volume.value);
    await bgm.play();
    playBtn.disabled = true;
    pauseBtn.disabled = false;
    volume.disabled = false;
    setNowPlaying("Playing 🎶");
  }catch(e){
    setNowPlaying("Tap again to allow audio");
  }
}
function pauseMusic(){
  bgm.pause();
  playBtn.disabled = false;
  pauseBtn.disabled = true;
  setNowPlaying("Paused");
}
playBtn.addEventListener("click", startMusic);
pauseBtn.addEventListener("click", pauseMusic);
volume.addEventListener("input", () => bgm.volume = Number(volume.value));

// ===== QUIZ DATA =====
// Types: gate_choice, choice, text, number, loop_yesno, yes_only
const questions = [
  {
    id: "fell_date",
    type: "gate_choice",
    title: "Let’s rewind for a second…",
    prompt:
      "Every story has a quiet beginning — a moment that didn’t announce itself, but changed everything anyway.\n\n" +
      "When do you believe the undersigned first fell for you?",
    options: [
      "January 14, 2025",
      "February 3, 2025",
      "Some random day I don’t remember",
      "It was inevitable 😌"
    ],
    correctIndex: 1,
    okMsg: "Exactly. Some feelings don’t arrive loudly — they just stay.",
    nopeMsg:
      "Close… but the heart remembers dates better than calendars. Try once more 💗"
  },

  {
    id: "trait",
    type: "choice",
    title: "About you…",
    prompt:
      "There are a million things about you that make loving you feel easy.\n\n" +
      "If you had to guess — what does the undersigned love most about you?",
    options: ["Your honesty", "Your eyes", "Your smile", "The tiny efforts you don’t realize you make"],
    // Any selection accepted, but reveal always says "all of them"
    revealOnSelect: true,
    revealMsg:
      "Trick question 🙂\n\n" +
      "Because it’s never been just one thing.\n\n" +
      "It’s your honesty,\n" +
      "the way your eyes soften,\n" +
      "your smile that feels like home,\n" +
      "and the tiny efforts you think go unnoticed — but never do.\n\n" +
      "It’s all of you. Always has been."
  },

  {
    id: "ideal_winter_date",
    type: "text",
    title: "Let me imagine this with you…",
    prompt:
      "It’s winter.\nThe air is cold, but the moment is warm.\n\n" +
      "Tell me — what does your idea of an ideal winter date look like?",
    placeholder: "No wrong answers… just tell me what feels right.",
    minLen: 5,
    okMsg: "Noted. I’m keeping this one close 🤍"
  },

  {
    id: "valentine_word",
    type: "text",
    title: "One word. One feeling.",
    prompt:
      `When I say the word “Valentine”… what’s the first thing that comes to your mind, ${GIRLFRIEND_NAME}?`,
    placeholder: "A word, a feeling, or even a sentence…",
    minLen: 1,
    okMsg: "I like that. I was hoping you’d say something like that."
  },

  {
    id: "vibe",
    type: "choice",
    title: "Set the mood…",
    prompt:
      "If you had to choose the feeling of our date — the kind you remember weeks later — what would it be?",
    options: ["✨ Soft & romantic", "🍷 Elegant & cozy", "🌃 Playful & spontaneous", "🔥 Intimate & warm"],
    okMsg: "Noted. I’ll build the evening around this."
  },

  {
    id: "budget",
    type: "number",
    title: "Let’s be practical for a second… but still us.",
    prompt:
      "Every good plan needs a little grounding in reality — just enough to keep the magic intentional.\n\n" +
      "In numbers only, what do you think the budget of our Valentine’s Day expedition should be?",
    placeholder: "Just a number. I promise I won’t judge.",
    okMsg: "Got it. I like the way you think.",
    invalidMsg: "Numbers only 😌 (example: 50, 120, 250)"
  },

  {
    id: "gift",
    type: "text",
    title: "About your Valentine’s gift…",
    prompt:
      "Some gifts are wrapped.\nSome are felt.\n\n" +
      "Tell me — what would you love to receive this Valentine’s Day?",
    placeholder: "It can be something small… or something meaningful.",
    minLen: 1,
    okMsg: "I’m glad you told me."
  },

  {
    id: "us_thought",
    type: "text",
    title: "Something I’d really love to know…",
    prompt:
      "When you think about us — what’s a moment, feeling, or thought that stays with you the most?",
    placeholder: "There’s no right answer. Just whatever comes to you.",
    minLen: 1,
    okMsg: "Thank you for trusting me with that."
  },

  {
    id: "with_me_feeling",
    type: "text",
    title: "One last soft question…",
    prompt:
      "When you’re with me, what’s the feeling you notice the most?",
    placeholder: "One word or a sentence… both are perfect.",
    minLen: 1,
    okMsg: "I’m really glad I get to be that for you."
  },

  {
    id: "mini_promise",
    type: "yes_only",
    title: "No thinking allowed.",
    prompt:
      "If I promise to plan this day with care, intention, and more love than I usually know how to show…\n\n" +
      "Will you let me?",
    buttonText: "Yes 🤍"
  },

  {
    id: "valentine_yes",
    type: "loop_yesno",
    title: "Just one last thing…",
    prompt:
      "So now that you know what this really is…\n\n" +
      "Will you be the undersigned’s Valentine?",
    yesText: "Yes 💕",
    noText: "No",
    noMsg:
      "Hmm.\nI don’t think that answer fits us.\n\n" +
      "Let’s try that again — but this time, listen to your heart 😌"
  }
];

// ===== STATE =====
let idx = 0;
const answers = {}; // id -> value

// ===== UI HOOKS =====
const qArea = document.getElementById("qArea");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const bar = document.getElementById("bar");

function setProgress(){
  const done = Object.keys(answers).length;
  const pct = Math.round((done / questions.length) * 100);
  bar.style.width = `${pct}%`;
}

function showHelp(msg, kind="info"){
  const help = qArea.querySelector(".help") || document.createElement("div");
  help.className = "help show";
  help.textContent = msg;
  if (!qArea.contains(help)) qArea.appendChild(help);
}

function clearHelp(){
  const help = qArea.querySelector(".help");
  if (help) help.classList.remove("show");
}

function render(){
  const q = questions[idx];
  qArea.innerHTML = "";

  const title = document.createElement("h3");
  title.className = "qTitle";
  title.textContent = q.title;

  const prompt = document.createElement("p");
  prompt.className = "qPrompt";
  prompt.textContent = q.prompt;

  qArea.appendChild(title);
  qArea.appendChild(prompt);

  clearHelp();
  nextBtn.disabled = true;

  if (q.type === "gate_choice" || q.type === "choice"){
    renderChoice(q);
  } else if (q.type === "text"){
    renderText(q);
  } else if (q.type === "number"){
    renderNumber(q);
  } else if (q.type === "yes_only"){
    renderYesOnly(q);
  } else if (q.type === "loop_yesno"){
    renderLoopYesNo(q);
  }

  backBtn.disabled = (idx === 0);
  nextBtn.textContent = (idx === questions.length - 1) ? "Finish →" : "Next →";

  setProgress();
}

function renderChoice(q){
  const opts = document.createElement("div");
  opts.className = "options";

  q.options.forEach((text, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt";
    b.textContent = text;

    const current = answers[q.id];
    if (current === i) b.classList.add("selected");

    b.addEventListener("click", () => {
      [...opts.children].forEach(c => c.classList.remove("selected"));
      b.classList.add("selected");

      answers[q.id] = i;

      // gate_choice logic
      if (q.type === "gate_choice"){
        if (i === q.correctIndex){
          showHelp(q.okMsg);
          nextBtn.disabled = false;
        } else {
          showHelp(q.nopeMsg);
          nextBtn.disabled = true;
          delete answers[q.id]; // keep progress honest
        }
        setProgress();
        return;
      }

      // normal choice
      if (q.revealOnSelect){
        showHelp(q.revealMsg);
        // Add a tiny pause before enabling Next, makes the reveal land
        nextBtn.disabled = true;
        setTimeout(() => { nextBtn.disabled = false; }, 800);
      } else {
        if (q.okMsg) showHelp(q.okMsg);
        nextBtn.disabled = false;
      }

      setProgress();
    });

    opts.appendChild(b);
  });

  qArea.appendChild(opts);

  // if already answered and not gate_choice wrong
  if (answers[q.id] !== undefined){
    if (q.type === "choice") nextBtn.disabled = false;
  }
}

function renderText(q){
  const input = document.createElement("textarea");
  input.className = "textbox";
  input.rows = 4;
  input.placeholder = q.placeholder || "";
  input.value = answers[q.id] || "";

  input.addEventListener("input", () => {
    const val = input.value.trim();
    const ok = (val.length >= (q.minLen ?? 1));
    nextBtn.disabled = !ok;
    if (ok && q.okMsg) {
      // only show when they stop typing for a moment
      clearTimeout(input._t);
      input._t = setTimeout(() => showHelp(q.okMsg), 400);
    }
  });

  qArea.appendChild(input);

  // preload state
  const current = (answers[q.id] || "").trim();
  nextBtn.disabled = !(current.length >= (q.minLen ?? 1));
}

function renderNumber(q){
  const input = document.createElement("input");
  input.className = "textbox";
  input.type = "text";
  input.inputMode = "numeric";
  input.placeholder = q.placeholder || "";
  input.value = answers[q.id] || "";

  input.addEventListener("input", () => {
    // Allow only digits in the field
    input.value = input.value.replace(/[^\d]/g, "");
    const val = input.value.trim();
    if (val.length > 0){
      showHelp(q.okMsg);
      nextBtn.disabled = false;
      answers[q.id] = val;
    } else {
      showHelp(q.invalidMsg || "Numbers only.");
      nextBtn.disabled = true;
      delete answers[q.id];
    }
    setProgress();
  });

  qArea.appendChild(input);

  const cur = (answers[q.id] || "").trim();
  nextBtn.disabled = !(cur.length > 0);
  if (cur.length > 0 && q.okMsg) showHelp(q.okMsg);
}

function renderYesOnly(q){
  const wrap = document.createElement("div");
  wrap.className = "options";

  const b = document.createElement("button");
  b.type = "button";
  b.className = "opt";
  b.textContent = q.buttonText || "Yes";

  b.addEventListener("click", () => {
    answers[q.id] = true;
    nextBtn.disabled = false;
    showHelp("Good. That’s all I needed 🤍");
    setTimeout(() => next(), 650);
    setProgress();
  });

  wrap.appendChild(b);
  qArea.appendChild(wrap);
}

function renderLoopYesNo(q){
  const wrap = document.createElement("div");
  wrap.className = "options";

  const yes = document.createElement("button");
  yes.type = "button";
  yes.className = "opt";
  yes.textContent = q.yesText || "Yes";

  const no = document.createElement("button");
  no.type = "button";
  no.className = "opt";
  no.textContent = q.noText || "No";

  yes.addEventListener("click", () => {
    answers[q.id] = "yes";
    nextBtn.disabled = false;
    showHelp("Then it’s settled. I’m smiling already ❤️");
    setTimeout(() => finish(), 500);
    setProgress();
  });

  no.addEventListener("click", () => {
    // Loop back: do not record answer
    delete answers[q.id];
    nextBtn.disabled = true;
    showHelp(q.noMsg || "Try again 😌");
    // a tiny shake effect
    no.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }],
      { duration: 260, easing: "ease-out" }
    );
    setProgress();
  });

  wrap.appendChild(yes);
  wrap.appendChild(no);
  qArea.appendChild(wrap);
}

// ===== NAV =====
backBtn.addEventListener("click", () => {
  idx = Math.max(0, idx - 1);
  render();
});

nextBtn.addEventListener("click", () => next());

function next(){
  const q = questions[idx];

  // store text/number values when moving forward
  if (q.type === "text"){
    const ta = qArea.querySelector("textarea");
    const val = (ta?.value || "").trim();
    if (val.length >= (q.minLen ?? 1)){
      answers[q.id] = val;
    }
  }
  if (q.type === "number"){
    const inp = qArea.querySelector("input");
    const val = (inp?.value || "").trim();
    if (val.length > 0) answers[q.id] = val;
  }

  if (idx === questions.length - 1){
    // last question handles finish internally
    return;
  }
  idx += 1;
  render();
}

// ===== REVEAL =====
const quizCard = document.getElementById("quizCard");
const revealCard = document.getElementById("revealCard");
const finalConfettiBtn = document.getElementById("finalConfettiBtn");

function finish(){
  quizCard.style.display = "none";
  revealCard.classList.remove("hidden");

  // Fill outputs (fallback to em dash if empty)
  const winter = answers["ideal_winter_date"] ?? "—";
  const val = answers["valentine_word"] ?? "—";
  const vibeIndex = answers["vibe"];
  const vibe = (vibeIndex !== undefined) ? questions.find(x => x.id==="vibe").options[vibeIndex] : "—";
  const budget = answers["budget"] ? `$${answers["budget"]}` : "—";
  const gift = answers["gift"] ?? "—";
  const us = answers["us_thought"] ?? "—";

  document.getElementById("inviteLine1").textContent =
    `${GIRLFRIEND_NAME}, on February 14, I’m taking you out — not just for a “Valentine’s dinner”… but for a memory.`;

  document.getElementById("vibeOut").textContent = vibe;
  document.getElementById("budgetOut").textContent = budget;
  document.getElementById("winterOut").textContent = winter;
  document.getElementById("valOut").textContent = val;
  document.getElementById("giftOut").textContent = gift;
  document.getElementById("usOut").textContent = us;

  document.getElementById("inviteLine2").textContent =
    `Thank you for saying yes — to me, and to us. ❤️`;

  launchConfetti(320);

  // Subtle: if music isn't playing, hint gently
  if (bgm.paused) setNowPlaying("Tap Play for music 🎶");
}

finalConfettiBtn.addEventListener("click", () => launchConfetti(420));

// ===== CONFETTI (simple) =====
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
let pieces = [];
let animId = null;

function resize(){
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
}
window.addEventListener("resize", resize);
resize();

function rand(min, max){ return Math.random() * (max - min) + min; }

function launchConfetti(count){
  const w = canvas.width, h = canvas.height;
  for (let i=0; i<count; i++){
    pieces.push({
      x: rand(0, w),
      y: rand(-h*0.2, 0),
      vx: rand(-1.2, 1.2) * devicePixelRatio,
      vy: rand(1.6, 3.6) * devicePixelRatio,
      s: rand(4, 10) * devicePixelRatio,
      r: rand(0, Math.PI*2),
      vr: rand(-0.15, 0.15),
      a: 1
    });
  }
  if (!animId) tick();
}

function tick(){
  animId = requestAnimationFrame(tick);
  ctx.clearRect(0,0,canvas.width,canvas.height);

  pieces = pieces.filter(p => p.y < canvas.height + p.s && p.a > 0.02);

  for (const p of pieces){
    p.x += p.vx;
    p.y += p.vy;
    p.r += p.vr;
    p.a *= 0.988;

    ctx.save();
    ctx.globalAlpha = p.a;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);

    ctx.fillStyle = (Math.random() > 0.5) ? "rgba(255,92,138,0.9)" : "rgba(255,143,177,0.9)";
    ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s);

    ctx.restore();
  }

  if (pieces.length === 0){
    cancelAnimationFrame(animId);
    animId = null;
  }
}

// Init
render();
