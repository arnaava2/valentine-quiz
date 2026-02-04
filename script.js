// ===== Personalization =====
const GIRLFRIEND_NAME = "Madhura";
const heroTitle = document.getElementById("heroTitle");
if (heroTitle) heroTitle.textContent = `${GIRLFRIEND_NAME}.`;

// ===== Helpers =====
const $ = (id) => document.getElementById(id);
const safeText = (el, value) => { if (el) el.textContent = value; };

// ===== Panels =====
const intro = $("intro");
const quiz = $("quiz");
const final = $("final");

function showPanel(panelToShow){
  [intro, quiz, final].forEach(p => p && p.classList.remove("is-active"));
  panelToShow && panelToShow.classList.add("is-active");
}

// ===== Music =====
const bgm = $("bgm");
const musicBtn = $("musicBtn");
let musicOn = false;

async function startMusic(){
  try{
    if (!bgm) return;
    bgm.volume = 0.75;
    bgm.muted = false;
    await bgm.play();
    musicOn = true;
    safeText(musicBtn, "Music: On");
  }catch(e){
    musicOn = false;
    safeText(musicBtn, "Music: Tap");
    console.error(e);
  }
}
function toggleMusic(){
  if (!bgm) return;
  if (!musicOn){ startMusic(); return; }
  if (bgm.paused){
    bgm.play().then(()=>safeText(musicBtn,"Music: On")).catch(()=>safeText(musicBtn,"Music: Tap"));
  } else {
    bgm.pause();
    safeText(musicBtn, "Music: Off");
  }
}
if (musicBtn) musicBtn.addEventListener("click", toggleMusic);

// ===== Cursor-reactive background =====
const root = document.documentElement;
function setCursorVars(x, y){
  root.style.setProperty("--cx", (x*100).toFixed(2) + "%");
  root.style.setProperty("--cy", (y*100).toFixed(2) + "%");
}
window.addEventListener("mousemove", (e) => {
  setCursorVars(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
});
let drift = 0;
setInterval(() => {
  drift += 0.01;
  const x = 0.5 + Math.sin(drift) * 0.08;
  const y = 0.45 + Math.cos(drift * 0.9) * 0.08;
  setCursorVars(x, y);
}, 60);

// ===== DOM =====
const startBtn = $("startBtn");
const card = $("card");
const backBtn = $("backBtn");
const nextBtn = $("nextBtn");
const progressText = $("progressText");
const pageNumLeft = $("pageNumLeft");
const pageNumRight = $("pageNumRight");
const chapterLine = $("chapterLine");
const chapterTitle = $("chapterTitle");
const noteTitle = $("noteTitle");
const noteBody = $("noteBody");
const noteFooter = $("noteFooter");

// ===== Carousel DOM =====
const photoImg = $("photoImg");
const photoCaption = $("photoCaption");
const photoPrev = $("photoPrev");
const photoNext = $("photoNext");
const photoDots = $("photoDots");

// ===== Photos (15) =====
// Ensure files exist as: photos/01.jpg ... photos/15.jpg
const PHOTOS = Array.from({ length: 15 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return {
    src: `photos/${n}.jpg`,
    caption: `Memory ${i + 1}`
  };
});

// Optional: nicer captions (customize if you want)
const CAPTIONS = [
  "A page I keep rereading",
  "My favourite kind of calm",
  "Us — quietly perfect",
  "Where I want to be",
  "Soft moments, loud feelings",
  "A little forever in one frame",
  "You, as you are",
  "A small happiness I keep",
  "The kind of love I trust",
  "Easy, warm, true",
  "A chapter I’m grateful for",
  "Proof that life is sweet",
  "The way you make days gentle",
  "More of this, always",
  "My favourite ending (and beginning)"
];
PHOTOS.forEach((p, i) => p.caption = CAPTIONS[i] || p.caption);

let photoIndex = 0;
let autoTimer = null;

function buildDots(){
  if (!photoDots) return;
  photoDots.innerHTML = "";
  PHOTOS.forEach((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "dot";
    d.setAttribute("aria-label", `Photo ${i + 1}`);
    d.addEventListener("click", () => showPhoto(i, true));
    photoDots.appendChild(d);
  });
}

function setActiveDot(){
  if (!photoDots) return;
  [...photoDots.children].forEach((el, i) => {
    el.classList.toggle("active", i === photoIndex);
  });
}

function showPhoto(i, userInitiated = false){
  if (!photoImg || PHOTOS.length === 0) return;
  photoIndex = (i + PHOTOS.length) % PHOTOS.length;

  if (photoImg) photoImg.style.opacity = "0";
  setTimeout(() => {
    photoImg.src = PHOTOS[photoIndex].src;
    safeText(photoCaption, PHOTOS[photoIndex].caption || "—");
    if (photoImg) photoImg.style.opacity = "1";
    setActiveDot();
  }, 120);

  if (userInitiated) restartAutoAdvance();
}

function restartAutoAdvance(){
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = setInterval(() => showPhoto(photoIndex + 1), 5500);
}

function preloadPhotos(){
  PHOTOS.forEach(p => { const im = new Image(); im.src = p.src; });
}

// carousel controls
if (photoPrev) photoPrev.addEventListener("click", () => showPhoto(photoIndex - 1, true));
if (photoNext) photoNext.addEventListener("click", () => showPhoto(photoIndex + 1, true));

// init carousel
buildDots();
preloadPhotos();
showPhoto(0);
restartAutoAdvance();

// ===== Questions =====
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
let mode = "question"; // "question" | "note"
let pendingNote = "";
const answers = {};

// ===== Cosmetics =====
function setProgress(){
  safeText(progressText, `${idx + 1} / ${questions.length}`);

  const left = 3 + idx * 2 + (mode === "note" ? 1 : 0);
  const right = left + 1;

  safeText(pageNumLeft, `— ${left} —`);
  safeText(pageNumRight, `— ${right} —`);

  safeText(chapterLine, "CHAPTER II");
  safeText(chapterTitle, (mode === "question") ? "A Gentle Examination" : "A Note From The Undersigned");
}

// ===== Fade swap =====
function fadeSwap(renderFn){
  if (!card){ renderFn(); return; }
  card.classList.add("fadeOut");
  setTimeout(() => {
    renderFn();
    card.classList.remove("fadeOut");
    card.classList.add("fadeIn");
    setTimeout(() => card.classList.remove("fadeIn"), 180);
  }, 240);
}

// ===== Typewriter =====
function typewriter(el, text){
  if (!el) return;
  el.textContent = "";
  let i = 0;
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

  // gentle photo shift per page
  showPhoto((idx * 2 + (mode === "note" ? 1 : 0)) % PHOTOS.length);

  if (backBtn) backBtn.disabled = (idx === 0 && mode === "question");
  if (nextBtn){
    nextBtn.disabled = true;
    nextBtn.textContent = (mode === "note") ? "Turn Page" : "Next";
  }

  fadeSwap(() => {
    if (mode === "question") renderQuestion(questions[idx]);
    else renderNote();
  });
}

// ===== Note page =====
function renderNote(){
  safeText(noteTitle, "A note, in the margin…");
  safeText(noteBody, pendingNote || "—");
  safeText(noteFooter, "Turn the page when you’re ready.");

  if (nextBtn) nextBtn.disabled = false;

  if (card){
    card.innerHTML = `
      <h3 class="qTitle">Pause here.</h3>
      <p class="qPrompt">Some answers deserve a quiet beat.</p>
    `;
  }
}

// ===== Question page =====
function inkBlot(btn){
  if (!btn) return;
  btn.classList.remove("inked");
  void btn.offsetWidth;
  btn.classList.add("inked");
}

function renderQuestion(q){
  safeText(noteTitle, "Turn a page…");
  safeText(noteBody, "Your answers will leave little notes here — like bookmarks.");
  safeText(noteFooter, "—");

  if (!card) return;
  card.innerHTML = "";

  const t = document.createElement("h3");
  t.className = "qTitle";
  t.textContent = q.title;

  const p = document.createElement("p");
  p.className = "qPrompt";

  card.appendChild(t);
  card.appendChild(p);
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
  if (nextBtn) nextBtn.disabled = false;
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
          pendingNote = q.noteNo;
          if (nextBtn) nextBtn.disabled = true;
        }
        return;
      }

      if (q.type === "choice_reveal"){
        answers[q.id] = i;
        enableToNote(q.revealNote);
        return;
      }

      answers[q.id] = i;
      const chosen = q.options[i];
      const note = q.noteForChoice ? q.noteForChoice(chosen) : "";
      enableToNote(note);
    });

    wrap.appendChild(b);
  });

  card.appendChild(wrap);

  // Restore previous answer if any
  if (answers[q.id] !== undefined){
    const chosenIndex = answers[q.id];
    if (wrap.children[chosenIndex]) wrap.children[chosenIndex].classList.add("selected");
    if (q.type === "choice" && q.noteForChoice){
      const chosen = q.options[chosenIndex];
      pendingNote = q.noteForChoice(chosen);
      if (nextBtn) nextBtn.disabled = false;
    }
    if (q.type === "choice_reveal"){
      pendingNote = q.revealNote;
      if (nextBtn) nextBtn.disabled = false;
    }
  }
}

function renderText(q){
  const ta = document.createElement("textarea");
  ta.className = "textbox";
  ta.rows = 4;
  ta.placeholder = q.placeholder || "";
  ta.value = answers[q.id] || "";

  const validate = () => {
    const v = ta.value.trim();
    const ok = v.length >= (q.minLen ?? 1);
    if (nextBtn) nextBtn.disabled = !ok;
    if (ok){
      answers[q.id] = v;
      pendingNote = q.noteOk || "Noted.";
    }
  };

  ta.addEventListener("input", validate);
  card.appendChild(ta);
  validate();
}

function renderNumber(q){
  const inp = document.createElement("input");
  inp.className = "numBox";
  inp.type = "text";
  inp.inputMode = "numeric";
  inp.placeholder = q.placeholder || "";
  inp.value = answers[q.id] || "";

  const validate = () => {
    inp.value = inp.value.replace(/[^\d]/g, "");
    const v = inp.value.trim();
    if (v.length > 0){
      answers[q.id] = v;
      pendingNote = q.noteOk || "Understood.";
      if (nextBtn) nextBtn.disabled = false;
    } else {
      if (nextBtn) nextBtn.disabled = true;
    }
  };

  inp.addEventListener("input", validate);
  card.appendChild(inp);
  validate();
}

/* ===== FIXED: last question selection ===== */
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

  const select = (btn) => {
    [...wrap.children].forEach(x => x.classList.remove("selected"));
    btn.classList.add("selected");
    inkBlot(btn);
  };

  yes.addEventListener("click", () => {
    select(yes);
    answers[q.id] = "yes";
    pendingNote = q.yesNote;

    // Auto turn to note page for a satisfying flow
    if (nextBtn) nextBtn.disabled = false;
    setTimeout(() => {
      mode = "note";
      render();
    }, 220);
  });

  no.addEventListener("click", () => {
    select(no);
    delete answers[q.id];
    pendingNote = q.noNote;

    if (nextBtn) nextBtn.disabled = false;
    setTimeout(() => {
      mode = "note";
      render();
    }, 220);
  });

  wrap.appendChild(yes);
  wrap.appendChild(no);
  card.appendChild(wrap);

  // Restore selected state if already answered
  if (answers[q.id] === "yes") yes.classList.add("selected");

  if (nextBtn) nextBtn.disabled = true;
}

// ===== Navigation =====
if (backBtn){
  backBtn.addEventListener("click", () => {
    if (mode === "note"){
      mode = "question";
      render();
      return;
    }
    idx = Math.max(0, idx - 1);
    mode = "question";
    render();
  });
}

if (nextBtn){
  nextBtn.addEventListener("click", () => {
    const q = questions[idx];

    if (mode === "question"){
      // ALWAYS go to note page first
      mode = "note";
      render();
      return;
    }

    // mode === note
    mode = "question";

    // Special loop: if Valentine question wasn't "yes", loop back to the same question
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
}

// ===== Finish =====
function finish(){
  const vibeQ = questions.find(x => x.id === "vibe");
  const vibe = (answers.vibe !== undefined && vibeQ) ? vibeQ.options[answers.vibe] : "—";
  const budget = answers.budget ? `$${answers.budget}` : "—";
  const winter = answers.ideal_winter_date || "—";
  const val = answers.valentine_word || "—";
  const gift = answers.gift || "—";
  const us = answers.us_words || "—";

  safeText($("finalTitle"), `${GIRLFRIEND_NAME}, you’re my Valentine.`);
  safeText($("finalBody"),
    "On February 14, I’m taking you out — not just for a date, but for a memory.\n" +
    "Thank you for turning these pages with me."
  );

  safeText($("outVibe"), vibe);
  safeText($("outBudget"), budget);
  safeText($("outWinter"), winter);
  safeText($("outVal"), val);
  safeText($("outGift"), gift);
  safeText($("outUs"), us);

  showPanel(final);
}

// ===== Start flow =====
if (startBtn){
  startBtn.addEventListener("click", () => {
    startMusic(); // user gesture -> should work
    showPanel(quiz);
    idx = 0;
    mode = "question";
    pendingNote = "";
    render();
  });
}

// ===== Init =====
showPanel(intro);
safeText(musicBtn, "Music: Off");
