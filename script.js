// ===== Personalization =====
const GIRLFRIEND_NAME = "Madhura";

// ===== Safe DOM helper =====
const $ = (id) => document.getElementById(id);

// ===== Panels =====
const intro = $("intro");
const quiz  = $("quiz");
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
  if (!bgm) return;
  try{
    bgm.volume = 0.75;
    bgm.muted = false;
    await bgm.play();
    musicOn = true;
    if (musicBtn) musicBtn.textContent = "Music: On";
  }catch(e){
    musicOn = false;
    if (musicBtn) musicBtn.textContent = "Music: Tap";
    console.error(e);
  }
}
function toggleMusic(){
  if (!bgm) return;
  if (!musicOn){ startMusic(); return; }
  if (bgm.paused){
    bgm.play().then(()=> musicBtn && (musicBtn.textContent="Music: On"))
      .catch(()=> musicBtn && (musicBtn.textContent="Music: Tap"));
  } else {
    bgm.pause();
    musicBtn && (musicBtn.textContent = "Music: Off");
  }
}
musicBtn && musicBtn.addEventListener("click", toggleMusic);

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
const startBtn     = $("startBtn");
const card         = $("card");
const backBtn      = $("backBtn");
const nextBtn      = $("nextBtn");
const progressText = $("progressText");
const pageNumLeft  = $("pageNumLeft");
const pageNumRight = $("pageNumRight");
const chapterLine  = $("chapterLine");
const chapterTitle = $("chapterTitle");
const noteTitle    = $("noteTitle");
const noteBody     = $("noteBody");
const noteFooter   = $("noteFooter");

// Hero name
const heroTitle = $("heroTitle");
if (heroTitle) heroTitle.textContent = `${GIRLFRIEND_NAME}.`;

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
      "If our date had a vibe — the kind you remember later — what would it be?",
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
      "If you could receive anything — small or meaningful — what would you love?",
    placeholder: "Tell me honestly…",
    minLen: 1,
    note
