// ===== Personalization =====
const GIRLFRIEND_NAME = "Madhura";
document.getElementById("heroTitle").textContent = `${GIRLFRIEND_NAME}.`;

// ===== Panels =====
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
    await bgm.play(); // must be triggered by user gesture
    musicOn = true;
    musicBtn.textContent = "Music: On";
  }catch(e){
    musicOn = false;
    musicBtn.textContent = "Music: Tap";
    console.error(e);
  }
}
function toggleMusic(){
  if (!musicOn){ startMusic(); return; }
  if (bgm.paused){
    bgm.play().then(()=>musicBtn.textContent="Music: On").catch(()=>musicBtn.textContent="Music: Tap");
  } else {
    bgm.pause();
    musicBtn.textContent = "Music: Off";
  }
}
musicBtn.addEventListener("click", toggleMusic);

// ===== Cursor-reactive background =====
const root = document.documentElement;
function setCursorVars(x, y){
  root.style.setProperty("--cx", (x*100).toFixed(2) + "%");
  root.style.setProperty("--cy", (y*100).toFixed(2) + "%");
}
window.addEventListener("mousemove", (e) => {
  setCursorVars(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
});
// Mobile gentle drift
let drift = 0;
setInterval(() => {
  drift += 0.01;
  const x = 0.5 + Math.sin(drift) * 0.08;
  const y = 0.45 + Math.cos(drift * 0.9) * 0.08;
  setCursorVars(x, y);
}, 60);

// ===== DOM =====
const startBtn = document.getElementById("startBtn");
const card = document.getElementById("card");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const progressText = document.getElementById("progressText");
const pageNumLeft = document.getElementById("pageNumLeft");
const pageNumRight = document.getElementById("pageNumRight");
const chapterLine = document.getElementById("chapterLine");
const chapterTitle = document.getElementById("chapterTitle");
const noteTitle = document.getElementById("noteTitle");
const noteBody = document.getElementById("noteBody");
const noteFooter = document.getElementById("noteFooter");

// ===== Content: questions =====
const questions = [
  {
    id: "fell_date",
    type: "gate_choice",
    title: "A gentle timestamp…",
    prompt:
      "Some moments don’t arrive with fireworks.\nThey arrive quietly — and then they never leave.\n\n" +
      "When do you believe the undersigned first fell for you?",
    options: [
      "January 14, 2025",
      "February 3, 2025",
      "Some random day I don’t remember",
      "It was inevitable 😌"
    ],
    correctIndex: 1,
    noteOk: "Correct. The heart is annoyingly precise about you.",
    noteNo: "Not quite — try again. (The right date is a little sacred.)"
  },
  {
    id: "trait",
    type: "choice_reveal",
    title: "A question with a trapdoor…",
    prompt:
      "Pick one — the trait the undersigned loves most about you.\n\n" +
      "Choose carefully… or don’t. I already know what I’ll write in the margin.",
    options: ["Your honesty", "Your eyes", "Your smile", "Your tiny efforts"],
    revealNote:
      "All of them.\n\n" +
      "Your honesty that feels safe.\nYour eyes that soften the world.\nYour smile that turns a bad day gentle.\nAnd your tiny efforts — the ones you think don’t matter — that matter the most.\n\n" +
      "It’s always been all of you."
  },
  {
    id: "ideal_winter_date",
    type: "text",
    title: "Paint me a winter scene…",
    prompt:
      "It’s cold outside.\nWe’re warm anyway.\n\nDescribe your ideal winter date — like a little excerpt from our story.",
    placeholder: "Write whatever you want…",
    minLen: 6,
    noteOk: "Noted. I’m filing this under ‘things I will make happen.’"
  },
  {
    id: "valentine_word",
    type: "text",
    title: "One word. One feeling.",
    prompt:
      `When I say “Valentine”… what blooms in your mind, ${GIRLFRIEND_NAME}?`,
    placeholder: "A word, a feeling, a sentence…",
    minLen: 1,
    noteOk: "That’s beautiful. I’m keeping it."
  },
  {
    id: "vibe",
    type: "choice",
    title: "Choose the mood of the chapter…",
    prompt:
      "If our date had a *vibe* — the kind you remember later — what would it be?",
    options: ["Soft & romantic", "Elegant & cozy", "Playful & spontaneous", "Intimate & warm"],
    noteForChoice: (pick) => `Perfect. I’ll plan like it’s ${pick.toLowerCase()} and we have nowhere else to be.`
  },
  {
    id: "budget",
    type: "number",
    title: "A practical bookmark…",
    prompt:
      "Numbers only.\nWhat should the budget be for our Valentine’s Day expedition?",
    placeholder: "Example: 120",
    noteOk: "Understood. The undersigned will spend it wisely."
  },
  {
    id: "gift",
    type: "text",
    title: "Your gift, in your words…",
    prompt:
      "If you could receive *anything* — small or meaningful — what would you love?",
    placeholder: "Tell me honestly…",
    minLen: 1,
    noteOk: "Noted. Consider this a very serious hint."
  },
  {
    id: "us_words",
    type: "text",
    title: "Write in the margins…",
    prompt:
      "Write anything you want here.\nA thought. A memory. A line for us.\n\nNo rules.",
    placeholder: "I’m listening…",
    minLen: 1,
    noteOk: "Thank you. This one matters."
  },
  {
    id: "valentine_yes",
    type: "loop_yesno",
    title: "The question that starts the next chapter…",
    prompt:
      "Will you be the undersigned’s Valentine?",
    yesText: "Yes.",
    noText: "No.",
    noNote:
      "That answer doesn’t suit you.\n\nTurn the page and try again — but this time, choose the one your heart is already smiling about.",
    yesNote:
      "Then it’s settled.\n\nFebruary 14 is ours."
  }
];

// ===== State =====
let idx = 0;

// Interactivity upgrade:
// We separate the *Question Page* from the *Note Page*.
// After a valid answer, Next takes you to NOTE page.
// Next from NOTE page goes to the next question.
let mode = "question"; // "question" | "note"
let pendingNote = "";  // note to show on the note page
const answers = {};

// ===== Cosmetics =====
function setProgress(){
  progressText.textContent = `${idx + 1} / ${questions.length}`;
  // page numbers are purely aesthetic now
  const left = 3 + idx * 2 + (mode === "note" ? 1 : 0);
  const right = left + 1;
  pageNumLeft.textContent = `— ${left} —`;
  pageNumRight.textContent = `— ${right} —`;

  chapterLine.textContent = "CHAPTER II";
  chapterTitle.textContent = (mode === "question")
    ? "A Gentle Examination"
    : "A Note From The Undersigned";
}

// ===== Fade swap =====
function fadeSwap(renderFn){
  card.classList.add("fadeOut");
  setTimeout(() => {
    renderFn();
    card.classList.remove("fadeOut");
    card.classList.add("fadeIn");
    setTimeout(() => card.classList.remove("fadeIn"), 180);
  }, 240);
}

// ===== Typewriter prompt (subtle, classy) =====
function typewriter(el, text){
  el.textContent = "";
  let i = 0;
  const speed = 10; // gentle
  const tick = () => {
    i += 2;
    el.textContent = text.slice(0, i);
    if (i < text.length) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ===== Render =====
function render(){
  setProgress();
  backBtn.disabled = (idx === 0 && mode === "question");
  nextBtn.disabled = true;
  nextBtn.textContent = (mode === "note") ? "Turn Page" : "Next";

  fadeSwap(() => {
    if (mode === "question") renderQuestion(questions[idx]);
    else renderNote();
  });
}

// ===== Note page =====
function renderNote(){
  // Right page is the note area; we update it here
  noteTitle.textContent = "A note, in the margin…";
  noteBody.textContent = pendingNote || "—";
  noteFooter.textContent = "Turn the page when you’re ready.";

  // On note page, user can always proceed
  nextBtn.disabled = false;

  // In the main card area (left page), show a minimal “Page Turn” content
  card.innerHTML = `
    <h3 class="qTitle">Pause here.</h3>
    <p class="qPrompt">Some answers deserve a quiet beat.</p>
  `;
}

// ===== Question page =====
function inkBlot(btn){
  btn.classList.remove("inked");
  void btn.offsetWidth;
  btn.classList.add("inked");
}

function renderQuestion(q){
  // Reset note page guidance (default)
  noteTitle.textContent = "Turn a page…";
  noteBody.textContent = "Your answers will leave little notes here — like bookmarks.";
  noteFooter.textContent = "—";

  card.innerHTML = "";

  const t = document.createElement("h3");
  t.className = "qTitle";
  t.textContent = q.title;

  const p = document.createElement("p");
  p.className = "qPrompt";
  card.appendChild(t);
  card.appendChild(p);

  // Typewriter prompt
  typewriter(p, q.prompt);

  if (q.type === "gate_choice" || q.type === "choice" || q.type === "choice_reveal"){
    renderChoice(q);
    return;
  }
  if (q.type === "text") { renderText(q); return; }
  if (q.type === "number") { renderNumber(q); return; }
  if (q.type === "loop_yesno") { renderLoopYesNo(q); return; }
}

function enableToNote(noteText){
  pendingNote = noteText || "";
  nextBtn.disabled = false;
}

function renderChoice(q){
  const wrap = document.createElement("div");
  wrap.className = "options";

  q.options.forEach((label, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt";
    b.textContent = label;

    const ink = document.createElement("span");
    ink.className = "ink";
    b.appendChild(ink);

    b.addEventListener("click", () => {
      [...wrap.children].forEach(x => x.classList.remove("selected"));
      b.classList.add("selected");
      inkBlot(b);

      if (q.type === "gate_choice"){
        if (i === q.correctIndex){
          answers[q.id] = i;
          enableToNote(q.noteOk);
        } else {
          delete answers[q.id];
          // keep Next disabled; but set a note for later if they get it right
          pendingNote = q.noteNo;
          nextBtn.disabled = true;
        }
        return;
      }

      if (q.type === "choice_reveal"){
        answers[q.id] = i;
        enableToNote(q.revealNote);
        return;
      }

      // normal choice
      answers[q.id] = i;
      const chosen = q.options[i];
      const note = q.noteForChoice ? q.noteForChoice(chosen) : "";
      enableToNote(note);
    });

    wrap.appendChild(b);
  });

  card.appendChild(wrap);

  // If already answered previously, allow Next -> note
  if (answers[q.id] !== undefined){
    // regenerate a note if possible
    if (q.type === "choice" && q.noteForChoice){
      const chosen = q.options[answers[q.id]];
      pendingNote = q.noteForChoice(chosen);
      nextBtn.disabled = false;
    }
  }
}

function renderText(q){
  const ta = document.createElement("textarea");
  ta.className = "textbox";
  ta.rows = 4;
  ta.placeholder = q.placeholder || "";

  ta.addEventListener("input", () => {
    const v = ta.value.trim();
    const ok = v.length >= (q.minLen ?? 1);
    nextBtn.disabled = !ok;
    if (ok){
      answers[q.id] = v;
      pendingNote = q.noteOk || "Noted.";
    }
  });

  card.appendChild(ta);
}

function renderNumber(q){
  const inp = document.createElement("input");
  inp.className = "numBox";
  inp.type = "text";
  inp.inputMode = "numeric";
  inp.placeholder = q.placeholder || "";

  inp.addEventListener("input", () => {
    inp.value = inp.value.replace(/[^\d]/g, "");
    const v = inp.value.trim();
    if (v.length > 0){
      answers[q.id] = v;
      pendingNote = q.noteOk || "Understood.";
      nextBtn.disabled = false;
    } else {
      nextBtn.disabled = true;
    }
  });

  card.appendChild(inp);
}

function renderLoopYesNo(q){
  const wrap = document.createElement("div");
  wrap.className = "options";

  const yes = document.createElement("button");
  yes.type = "button";
  yes.className = "opt";
  yes.textContent = q.yesText || "Yes.";
  yes.appendChild(Object.assign(document.createElement("span"), { className: "ink" }));

  const no = document.createElement("button");
  no.type = "button";
  no.className = "opt";
  no.textContent = q.noText || "No.";
  no.appendChild(Object.assign(document.createElement("span"), { className: "ink" }));

  yes.addEventListener("click", () => {
    inkBlot(yes);
    answers[q.id] = "yes";
    pendingNote = q.yesNote;
    nextBtn.disabled = false;
  });

  no.addEventListener("click", () => {
    inkBlot(no);
    // Force a NOTE page first, then loop back to same question
    delete answers[q.id];
    pendingNote = q.noNote;
    nextBtn.disabled = false;
  });

  wrap.appendChild(yes);
  wrap.appendChild(no);
  card.appendChild(wrap);

  nextBtn.disabled = true;
}

// ===== Navigation logic (Question <-> Note) =====
backBtn.addEventListener("click", () => {
  if (mode === "note"){
    // Go back to question page (same question)
    mode = "question";
    render();
    return;
  }
  idx = Math.max(0, idx - 1);
  mode = "question";
  render();
});

nextBtn.addEventListener("click", () => {
  const q = questions[idx];

  if (mode === "question"){
    // Move to NOTE page (always separate)
    mode = "note";
    render();
    return;
  }

  // mode === note: turn page to next question or finish
  mode = "question";

  // Special: if last question is valentine_yes and answer was not yes, loop back
  if (q.id === "valentine_yes" && answers[q.id] !== "yes"){
    render();
    return;
  }

  if (idx >= questions.length - 1){
    finish();
    return;
  }

  idx += 1;
  render();
});

// ===== Finish =====
function finish(){
  const vibeQ = questions.find(x => x.id === "vibe");
  const vibe = (answers.vibe !== undefined) ? vibeQ.options[answers.vibe] : "—";
  const budget = answers.budget ? `$${answers.budget}` : "—";
  const winter = answers.ideal_winter_date || "—";
  const val = answers.valentine_word || "—";
  const gift = answers.gift || "—";
  const us = answers.us_words || "—";

  document.getElementById("finalTitle").textContent = `${GIRLFRIEND_NAME}, you’re my Valentine.`;
  document.getElementById("finalBody").textContent =
    "On February 14, I’m taking you out — not just for a date, but for a memory.\n" +
    "Thank you for turning these pages with me.";

  document.getElementById("outVibe").textContent = vibe;
  document.getElementById("outBudget").textContent = budget;
  document.getElementById("outWinter").textContent = winter;
  document.getElementById("outVal").textContent = val;
  document.getElementById("outGift").textContent = gift;
  document.getElementById("outUs").textContent = us;

  showPanel(final);
}

// ===== Start flow =====
startBtn.addEventListener("click", () => {
  startMusic(); // user gesture => works
  showPanel(quiz);
  idx = 0;
  mode = "question";
  pendingNote = "";
  render();
});

// ===== Init =====
showPanel(intro);
musicBtn.textContent = "Music: Off";
