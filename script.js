// ===== Personalization =====
const GIRLFRIEND_NAME = "Madhura";
document.getElementById("heroTitle").textContent = `${GIRLFRIEND_NAME}.`;

// ===== Panels / Fade routing =====
const intro = document.getElementById("intro");
const quiz = document.getElementById("quiz");
const final = document.getElementById("final");

function showPanel(panelToShow){
  [intro, quiz, final].forEach(p => p.classList.remove("is-active"));
  panelToShow.classList.add("is-active");
}

// ===== Music (continuous once started) =====
const bgm = document.getElementById("bgm");
const musicBtn = document.getElementById("musicBtn");

let musicOn = false;

async function startMusic(){
  try{
    bgm.volume = 0.75;
    bgm.muted = false;
    await bgm.play(); // requires user gesture
    musicOn = true;
    musicBtn.textContent = "Music: On";
  }catch(e){
    // If it fails, keep it off and let user try again
    musicOn = false;
    musicBtn.textContent = "Music: Tap to enable";
    console.error(e);
  }
}

function toggleMusic(){
  if (!musicOn){
    startMusic();
    return;
  }
  // Minimalist: allow pause, but default experience is continuous.
  if (bgm.paused){
    bgm.play().then(() => {
      musicBtn.textContent = "Music: On";
    }).catch(() => {
      musicBtn.textContent = "Music: Tap to enable";
    });
  } else {
    bgm.pause();
    musicBtn.textContent = "Music: Off";
  }
}

musicBtn.addEventListener("click", toggleMusic);

// ===== Quiz data =====
const questions = [
  {
    id: "fell_date",
    type: "gate_choice",
    title: "Let’s rewind for a second…",
    prompt:
      "Every story has a quiet beginning —\n" +
      "a moment that didn’t announce itself,\n" +
      "but changed everything anyway.\n\n" +
      "When do you believe the undersigned first fell for you?",
    options: [
      "January 14, 2025",
      "February 3, 2025",
      "Some random day I don’t remember",
      "It was inevitable 😌"
    ],
    correctIndex: 1,
    okMsg: "Exactly. Some feelings don’t arrive loudly — they just stay.",
    nopeMsg: "Close… but the heart remembers dates better than calendars. Try once more."
  },
  {
    id: "trait",
    type: "choice_reveal",
    title: "About you…",
    prompt:
      "There are a million things about you\n" +
      "that make loving you feel easy.\n\n" +
      "If you had to guess — what does the undersigned love most about you?",
    options: ["Your honesty", "Your eyes", "Your smile", "The tiny efforts you don’t realize you make"],
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
      "It’s winter.\n" +
      "The air is cold, but the moment is warm.\n\n" +
      "Tell me — what does your idea of an ideal winter date look like?",
    placeholder: "No wrong answers… just whatever feels right.",
    minLen: 5,
    okMsg: "Noted. I’m keeping this one close."
  },
  {
    id: "valentine_word",
    type: "text",
    title: "One word. One feeling.",
    prompt:
      `When I say the word “Valentine”…\nwhat’s the first thing that comes to your mind, ${GIRLFRIEND_NAME}?`,
    placeholder: "A word, a feeling, or even a sentence…",
    minLen: 1,
    okMsg: "I like that."
  },
  {
    id: "vibe",
    type: "choice",
    title: "Set the mood…",
    prompt:
      "If you had to choose the feeling of our date —\n" +
      "the kind you remember weeks later —\n" +
      "what would it be?",
    options: ["Soft & romantic", "Elegant & cozy", "Playful & spontaneous", "Intimate & warm"],
    okMsg: "Noted. I’ll build the evening around this."
  },
  {
    id: "budget",
    type: "number",
    title: "Just one practical detail…",
    prompt:
      "In numbers only — what should the budget be\n" +
      "for our Valentine’s Day expedition?",
    placeholder: "Numbers only (example: 120)",
    okMsg: "Perfect."
  },
  {
    id: "gift",
    type: "text",
    title: "About your gift…",
    prompt:
      "Some gifts are wrapped.\nSome are felt.\n\n" +
      "Tell me — what would you love to receive this Valentine’s Day?",
    placeholder: "Something small, something meaningful… anything.",
    minLen: 1,
    okMsg: "I’m glad you told me."
  },
  {
    id: "us_thought",
    type: "text",
    title: "Something I’d really love to know…",
    prompt:
      "When you think about us —\n" +
      "what’s a moment, feeling, or thought\n" +
      "that stays with you the most?",
    placeholder: "There’s no right answer. Just whatever comes to you.",
    minLen: 1,
    okMsg: "Thank you for trusting me with that."
  },
  {
    id: "with_me_feeling",
    type: "text",
    title: "One last soft question…",
    prompt:
      "When you’re with me,\nwhat’s the feeling you notice the most?",
    placeholder: "One word or a sentence… both are perfect.",
    minLen: 1,
    okMsg: "I’m really glad I get to be that for you."
  },
  {
    id: "mini_promise",
    type: "one_button",
    title: "No thinking allowed.",
    prompt:
      "If I promise to plan this day with care,\n" +
      "intention,\n" +
      "and more love than I usually know how to show…\n\n" +
      "Will you let me?",
    buttonText: "Yes."
  },
  {
    id: "valentine_yes",
    type: "loop_yesno",
    title: "Just one last thing…",
    prompt:
      "So now that you know what this really is…\n\n" +
      "Will you be the undersigned’s Valentine?",
    yesText: "Yes.",
    noText: "No.",
    noMsg:
      "Hmm.\n" +
      "I don’t think that answer fits us.\n\n" +
      "Let’s try again — but this time,\nlisten to your heart."
  }
];

// ===== Quiz state =====
let idx = 0;
const answers = {}; // { id: value }

// ===== DOM hooks =====
const startBtn = document.getElementById("startBtn");
const card = document.getElementById("card");
const helper = document.getElementById("helper");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const progressText = document.getElementById("progressText");

// ===== Start flow =====
startBtn.addEventListener("click", async () => {
  // This click counts as the user gesture: start music here
  await startMusic();

  // Fade intro -> quiz
  showPanel(quiz);
  render();
});

// ===== Rendering with fade between questions =====
function setHelper(text){
  helper.textContent = text || "";
}

function setProgress(){
  progressText.textContent = `${idx + 1} / ${questions.length}`;
}

function fadeSwap(renderFn){
  card.classList.add("fadeOut");
  setTimeout(() => {
    renderFn();
    card.classList.remove("fadeOut");
    card.classList.add("fadeIn");
    setTimeout(() => card.classList.remove("fadeIn"), 200);
  }, 220);
}

function render(){
  setProgress();
  setHelper("");

  const q = questions[idx];
  backBtn.disabled = idx === 0;
  nextBtn.disabled = true;
  nextBtn.textContent = (idx === questions.length - 1) ? "Finish" : "Next";

  fadeSwap(() => renderQuestion(q));
}

function renderQuestion(q){
  card.innerHTML = "";

  const t = document.createElement("h3");
  t.className = "qTitle";
  t.textContent = q.title;

  const p = document.createElement("p");
  p.className = "qPrompt";
  p.textContent = q.prompt;

  card.appendChild(t);
  card.appendChild(p);

  if (q.type === "gate_choice" || q.type === "choice" || q.type === "choice_reveal"){
    renderChoice(q);
    return;
  }
  if (q.type === "text"){
    renderText(q);
    return;
  }
  if (q.type === "number"){
    renderNumber(q);
    return;
  }
  if (q.type === "one_button"){
    renderOneButton(q);
    return;
  }
  if (q.type === "loop_yesno"){
    renderLoopYesNo(q);
    return;
  }
}

function renderChoice(q){
  const wrap = document.createElement("div");
  wrap.className = "options";

  q.options.forEach((label, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt";
    b.textContent = label;

    const current = answers[q.id];
    if (current === i) b.classList.add("selected");

    b.addEventListener("click", () => {
      [...wrap.children].forEach(x => x.classList.remove("selected"));
      b.classList.add("selected");

      // Gate choice: must be correct to proceed
      if (q.type === "gate_choice"){
        if (i === q.correctIndex){
          answers[q.id] = i;
          setHelper(q.okMsg);
          nextBtn.disabled = false;
        } else {
          delete answers[q.id];
          setHelper(q.nopeMsg);
          nextBtn.disabled = true;
        }
        return;
      }

      // Choice reveal: always accept, but show reveal
      if (q.type === "choice_reveal"){
        answers[q.id] = i;
        setHelper(q.revealMsg);
        nextBtn.disabled = true;
        setTimeout(() => { nextBtn.disabled = false; }, 700);
        return;
      }

      // Normal choice
      answers[q.id] = i;
      setHelper(q.okMsg || "");
      nextBtn.disabled = false;
    });

    wrap.appendChild(b);
  });

  card.appendChild(wrap);

  // If already answered and not gate-blocked, allow Next
  if (answers[q.id] !== undefined && q.type !== "gate_choice"){
    nextBtn.disabled = false;
  }
}

function renderText(q){
  const ta = document.createElement("textarea");
  ta.className = "textbox";
  ta.rows = 4;
  ta.placeholder = q.placeholder || "";
  ta.value = answers[q.id] || "";

  ta.addEventListener("input", () => {
    const v = ta.value.trim();
    const ok = v.length >= (q.minLen ?? 1);
    nextBtn.disabled = !ok;
    if (ok && q.okMsg) setHelper(q.okMsg);
  });

  card.appendChild(ta);

  const v = (answers[q.id] || "").trim();
  nextBtn.disabled = !(v.length >= (q.minLen ?? 1));
}

function renderNumber(q){
  const inp = document.createElement("input");
  inp.className = "numBox";
  inp.type = "text";
  inp.inputMode = "numeric";
  inp.placeholder = q.placeholder || "";
  inp.value = answers[q.id] || "";

  inp.addEventListener("input", () => {
    inp.value = inp.value.replace(/[^\d]/g, "");
    const v = inp.value.trim();
    if (v.length > 0){
      answers[q.id] = v;
      setHelper(q.okMsg || "");
      nextBtn.disabled = false;
    } else {
      delete answers[q.id];
      setHelper("Numbers only.");
      nextBtn.disabled = true;
    }
  });

  card.appendChild(inp);

  const v = (answers[q.id] || "").trim();
  nextBtn.disabled = !(v.length > 0);
}

function renderOneButton(q){
  const wrap = document.createElement("div");
  wrap.className = "options";

  const b = document.createElement("button");
  b.type = "button";
  b.className = "opt";
  b.textContent = q.buttonText || "Yes";

  b.addEventListener("click", () => {
    answers[q.id] = true;
    setHelper("Good.");
    // Auto-advance with a gentle pause
    setTimeout(() => goNext(), 450);
  });

  wrap.appendChild(b);
  card.appendChild(wrap);

  nextBtn.disabled = true;
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
    setHelper("Then it’s settled.");
    setTimeout(() => finish(), 350);
  });

  no.addEventListener("click", () => {
    delete answers[q.id];
    setHelper(q.noMsg);
    // keep them here; no Next
    nextBtn.disabled = true;
    no.animate(
      [{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }],
      { duration: 240, easing: "ease-out" }
    );
  });

  wrap.appendChild(yes);
  wrap.appendChild(no);
  card.appendChild(wrap);

  nextBtn.disabled = true;
}

// ===== Navigation =====
backBtn.addEventListener("click", () => {
  idx = Math.max(0, idx - 1);
  render();
});

nextBtn.addEventListener("click", () => goNext());

function goNext(){
  const q = questions[idx];

  // Persist text/number on Next
  if (q.type === "text"){
    const ta = card.querySelector("textarea");
    const v = (ta?.value || "").trim();
    if (v.length >= (q.minLen ?? 1)) answers[q.id] = v;
  }
  if (q.type === "number"){
    const inp = card.querySelector("input");
    const v = (inp?.value || "").trim();
    if (v.length > 0) answers[q.id] = v;
  }

  if (idx >= questions.length - 1) return;
  idx += 1;
  render();
}

// ===== Finish (fade to final) =====
function finish(){
  // Fill final outputs
  const vibeQ = questions.find(x => x.id === "vibe");
  const vibe = (answers.vibe !== undefined) ? vibeQ.options[answers.vibe] : "—";
  const budget = answers.budget ? `$${answers.budget}` : "—";
  const winter = answers.ideal_winter_date || "—";
  const val = answers.valentine_word || "—";
  const gift = answers.gift || "—";
  const us = answers.us_thought || "—";

  document.getElementById("finalTitle").textContent = `${GIRLFRIEND_NAME}, you’re my Valentine.`;
  document.getElementById("finalBody").textContent =
    `On February 14, I’m taking you out — not just for a date, but for a memory.\n` +
    `Thank you for saying yes to me, and to us.`;

  document.getElementById("outVibe").textContent = vibe;
  document.getElementById("outBudget").textContent = budget;
  document.getElementById("outWinter").textContent = winter;
  document.getElementById("outVal").textContent = val;
  document.getElementById("outGift").textContent = gift;
  document.getElementById("outUs").textContent = us;

  showPanel(final);
}

// ===== On load =====
showPanel(intro);
musicBtn.textContent = "Music: Off";
