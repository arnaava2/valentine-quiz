(function () {
  "use strict";

  // ===== Personalization =====
  var GIRLFRIEND_NAME = "Madhura";
  var heroTitle = document.getElementById("heroTitle");
  if (heroTitle) heroTitle.textContent = GIRLFRIEND_NAME + ".";

  function $(id) { return document.getElementById(id); }
  function safeText(el, value) { if (el) el.textContent = value; }

  // ==========================================
  // Clear Cherry Blossom Petals (Canvas BG)
  // ==========================================
  var canvas = $("petalCanvas");
  var ctx = canvas ? canvas.getContext("2d") : null;
  var W = 0, H = 0;

  // cursor interaction (stronger)
  var mouseX = 0.5, mouseY = 0.45;
  var mouseVX = 0, mouseVY = 0;
  var lastMX = null, lastMY = null;

  var petals = [];
  var lastT = 0;

  function resizeCanvas(){
    if (!canvas || !ctx) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    W = Math.floor(window.innerWidth);
    H = Math.floor(window.innerHeight);
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function rand(a,b){ return a + Math.random()*(b-a); }

  function makePetal(spawnTop){
    var size = rand(10, 22); // clearer/larger
    return {
      x: rand(-80, W + 80),
      y: spawnTop ? rand(-H, -60) : rand(-60, H + 60),
      vx: rand(-12, 14),
      vy: rand(26, 70),
      rot: rand(0, Math.PI * 2),
      vr: rand(-1.8, 1.8),
      wob: rand(0, Math.PI * 2),
      wobSpd: rand(0.6, 1.9),
      size: size,
      alpha: rand(0.55, 0.98),
      // gives a little depth
      z: rand(0.3, 1.0)
    };
  }

  function seedPetals(){
    if (!ctx) return;
    petals = [];
    var count = Math.min(140, Math.max(90, Math.floor((W*H)/17000)));
    for (var i=0;i<count;i++){
      var p = makePetal(false);
      p.y = rand(0, H);
      petals.push(p);
    }
  }

  function drawPetal(p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);

    // interactive "wind" and swirl (based on cursor pos + velocity)
    var windBase = (mouseX - 0.5) * 70;
    var liftBase = (mouseY - 0.5) * 18;

    var swirl = (mouseVX * 0.9) + (mouseVY * -0.4);
    ctx.translate(windBase * 0.25 * p.z, liftBase * 0.18 * p.z);

    ctx.globalAlpha = p.alpha;

    var s = p.size;

    // clearer sakura palette
    var grad = ctx.createRadialGradient(-s*0.22, -s*0.18, s*0.35, 0, 0, s*1.9);
    grad.addColorStop(0, "rgba(255, 252, 254, 0.98)");
    grad.addColorStop(0.35, "rgba(255, 208, 227, 0.92)");
    grad.addColorStop(1, "rgba(210, 78, 130, 0.78)");
    ctx.fillStyle = grad;

    // subtle edge
    ctx.strokeStyle = "rgba(150, 55, 95, 0.10)";
    ctx.lineWidth = Math.max(0.7, s * 0.04);

    // petal shape
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s*0.85, -s*0.75, s*1.05, -s*0.05, s*0.38, s*0.32);
    ctx.bezierCurveTo(s*0.60, s*0.70, s*0.22, s*1.10, 0, s*0.86);
    ctx.bezierCurveTo(-s*0.22, s*1.10, -s*0.60, s*0.70, -s*0.38, s*0.32);
    ctx.bezierCurveTo(-s*1.05, -s*0.05, -s*0.85, -s*0.75, 0, -s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // tiny center
    ctx.globalAlpha *= 0.6;
    ctx.fillStyle = "rgba(150, 55, 95, 0.16)";
    ctx.beginPath();
    ctx.arc(0, s*0.18, s*0.16, 0, Math.PI*2);
    ctx.fill();

    // hint of motion shimmer
    ctx.globalAlpha *= 0.22;
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.beginPath();
    ctx.ellipse(-s*0.10, -s*0.25, s*0.18, s*0.12, 0.6, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();

    // apply a tiny extra drift from "swirl"
    p.x += swirl * 0.0007 * (p.size * 8);
  }

  function step(t){
    if (!ctx) return;
    if (!lastT) lastT = t;
    var dt = Math.min(0.033, (t - lastT) / 1000);
    lastT = t;

    ctx.clearRect(0,0,W,H);

    // soft vignette
    var vg = ctx.createRadialGradient(W*0.52, H*0.42, Math.min(W,H)*0.12, W*0.52, H*0.42, Math.max(W,H)*0.95);
    vg.addColorStop(0, "rgba(255,255,255,0)");
    vg.addColorStop(1, "rgba(230,205,220,0.20)");
    ctx.fillStyle = vg;
    ctx.fillRect(0,0,W,H);

    var wind = (mouseX - 0.5) * 90 + mouseVX * 0.06;

    for (var i=0;i<petals.length;i++){
      var p = petals[i];
      p.wob += p.wobSpd * dt;

      p.x += (p.vx + Math.sin(p.wob)*14 + wind) * dt * (0.6 + p.z);
      p.y += p.vy * dt * (0.65 + p.z);
      p.rot += p.vr * dt;

      // respawn
      if (p.y > H + 80){
        petals[i] = makePetal(true);
        petals[i].y = -rand(40, 260);
      }
      if (p.x < -160) p.x = W + 160;
      if (p.x > W + 160) p.x = -160;

      drawPetal(p);
    }

    requestAnimationFrame(step);
  }

  function initCanvas(){
    if (!canvas || !ctx) return;
    resizeCanvas();
    seedPetals();
    requestAnimationFrame(step);
  }

  window.addEventListener("resize", function(){
    resizeCanvas();
    seedPetals();
  });

  window.addEventListener("mousemove", function (e) {
    var nx = e.clientX / window.innerWidth;
    var ny = e.clientY / window.innerHeight;

    if (lastMX !== null) {
      mouseVX = (e.clientX - lastMX);
      mouseVY = (e.clientY - lastMY);
      // clamp
      mouseVX = Math.max(-80, Math.min(80, mouseVX));
      mouseVY = Math.max(-80, Math.min(80, mouseVY));
    }

    lastMX = e.clientX;
    lastMY = e.clientY;

    mouseX = nx;
    mouseY = ny;

    // decay velocity
    setTimeout(function(){ mouseVX *= 0.6; mouseVY *= 0.6; }, 22);
  });

  initCanvas();

  // ===== Panels =====
  var intro = $("intro"), quiz = $("quiz"), final = $("final");
  function showPanel(panelEl) {
    [intro, quiz, final].forEach(function (p) {
      if (!p) return;
      p.classList.remove("is-active");
      p.classList.remove("active");
    });
    if (panelEl) {
      panelEl.classList.add("is-active");
      panelEl.classList.add("active");
    }
  }

  // ===== Music =====
  var bgm = $("bgm"), musicBtn = $("musicBtn"), musicOn = false;
  function setMusicLabel() {
    if (!musicBtn) return;
    if (!bgm) { musicBtn.textContent = "Music: —"; return; }
    musicBtn.textContent = (musicOn && !bgm.paused) ? "Music: On" : "Music: Off";
  }
  function startMusic() {
    if (!bgm) return Promise.resolve();
    bgm.volume = 0.78;
    bgm.muted = false;
    return bgm.play().then(function () {
      musicOn = true; setMusicLabel();
    }).catch(function () {
      musicOn = false;
      if (musicBtn) musicBtn.textContent = "Music: Tap";
    });
  }
  function toggleMusic() {
    if (!bgm) return;
    if (bgm.paused) {
      bgm.play().then(function(){ musicOn = true; setMusicLabel(); })
        .catch(function(){ if (musicBtn) musicBtn.textContent = "Music: Tap"; });
    } else { bgm.pause(); setMusicLabel(); }
  }
  if (musicBtn) musicBtn.addEventListener("click", toggleMusic);
  setMusicLabel();

  // ===== Quiz DOM =====
  var beginBtn = $("beginBtn"), card = $("card"), backBtn = $("backBtn"), nextBtn = $("nextBtn");
  var progressText = $("progressText"), chapterLine = $("chapterLine"), chapterTitle = $("chapterTitle");
  var noteTitle = $("noteTitle"), noteBody = $("noteBody"), noteFooter = $("noteFooter");
  var quizSpread = $("quizSpread");

  // ===== Signature =====
  var sigInput = $("sigInput"), sigBtn = $("sigBtn"), sigClear = $("sigClear"), sigOutput = $("sigOutput");
  function loadSignature(){
    try{
      var s = localStorage.getItem("val_sig") || "";
      if (sigInput) sigInput.value = s;
      if (sigOutput) sigOutput.textContent = s ? s : "—";
    }catch(e){}
  }
  function saveSignature(v){
    try{ localStorage.setItem("val_sig", v || ""); }catch(e){}
    if (sigOutput) sigOutput.textContent = v ? v : "—";
  }
  if (sigBtn) sigBtn.addEventListener("click", function(){
    var v = (sigInput ? sigInput.value : "").trim();
    saveSignature(v);
  });
  if (sigClear) sigClear.addEventListener("click", function(){
    if (sigInput) sigInput.value = "";
    saveSignature("");
  });
  loadSignature();

  // ===== Carousel DOM =====
  var photoImg = $("photoImg"), photoCaption = $("photoCaption"), photoPrev = $("photoPrev"), photoNext = $("photoNext"), photoDots = $("photoDots");

  var PHOTOS = [];
  for (var i = 1; i <= 15; i++) PHOTOS.push({ src: "photos/" + i + ".jpg", caption: "—" });

  var CAPTIONS = [
    "I’ll always come back to this day. It felt special — like love, but quietly sure.",
    "Whenever I can, I’m yours: travel partner, room partner, drop-off partner — all of it.",
    "My birthday was great… but my happiest minutes were the ones with you in them.",
    "OH MY GOD. How am I not supposed to fall for you?",
    "This is comfort. This is real. This is you — and I’m grateful.",
    "Fourth of July… couldn’t have been better. Thank you for coming with me (and making it ours).",
    "Diwali, my best one. This photo is calm… but my feelings aren’t. I love you.",
    "Blurry selfie, clear truth: your smile makes everything look better.",
    "Travel the world together? Haan. Always.",
    "Can’t wait to graduate with you and take all the pictures you want… so I took the first one 🙂",
    "Okay fine. I get it — you’re *ridiculously* hot. I’ll try to keep up.",
    "With you, even grocery runs feel like a date, baby.",
    "Comfort. Bas comfort. (And you.)",
    "More sun-kissed pictures like this… even when you’re 80? Deal?",
    "If Chicago was the beginning, I swear I’ll take you everywhere you want to be."
  ];
  PHOTOS.forEach(function(p, idx){ p.caption = CAPTIONS[idx] || "—"; });
  PHOTOS.forEach(function(p){ var im = new Image(); im.src = p.src; });

  var photoIndex = 0, autoTimer = null;
  function buildDots() {
    if (!photoDots) return;
    photoDots.innerHTML = "";
    for (var d = 0; d < PHOTOS.length; d++) {
      (function (k) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "dot";
        btn.setAttribute("aria-label", "Photo " + (k + 1));
        btn.addEventListener("click", function () { showPhoto(k, true); });
        photoDots.appendChild(btn);
      })(d);
    }
  }
  function setActiveDot() {
    if (!photoDots) return;
    var kids = photoDots.children;
    for (var j = 0; j < kids.length; j++) kids[j].classList.toggle("active", j === photoIndex);
  }
  function restartAutoAdvance() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(function () { showPhoto(photoIndex + 1, false); }, 6500);
  }
  function showPhoto(i, userInitiated) {
    if (!photoImg || PHOTOS.length === 0) return;
    photoIndex = (i + PHOTOS.length) % PHOTOS.length;

    photoImg.style.opacity = "0";
    setTimeout(function () {
      photoImg.src = PHOTOS[photoIndex].src;
      safeText(photoCaption, PHOTOS[photoIndex].caption || "—");
      photoImg.style.opacity = "1";
      setActiveDot();
    }, 140);

    if (userInitiated) restartAutoAdvance();
  }
  if (photoPrev) photoPrev.addEventListener("click", function(){ showPhoto(photoIndex - 1, true); });
  if (photoNext) photoNext.addEventListener("click", function(){ showPhoto(photoIndex + 1, true); });
  buildDots(); showPhoto(0, false); restartAutoAdvance();

  // Spread transition
  function fadeSwap(fn) {
    if (quizSpread) {
      quizSpread.classList.add("turning");
      setTimeout(function () { fn(); quizSpread.classList.remove("turning"); }, 280);
      return;
    }
    fn();
  }

  // Interludes (short, subtle, NOT repetitive)
  var POEM_MEMORIES = [
    "For all the times I didn’t get it right… I still wanted to hold you closer.",
    "For all the times I just wanted to hug you — that feeling hasn’t changed.",
    "Sometimes I wanted to get you a flower… and then it became a habit I like too much.",
    "I’ve missed you. Quietly. Properly. Always.",
    "Picking tiny moments with you… somehow became my favorite thing.",
    "I hope I keep choosing you — for as long as time exists."
  ];
  function getInterlude(idx){ return POEM_MEMORIES[idx % POEM_MEMORIES.length]; }

  // Questions
  var questions = [
    {
      id: "fell_date",
      type: "gate_choice",
      title: "A gentle timestamp…",
      prompt:
        "Some moments don’t arrive with fireworks.\nThey arrive quietly — and then they never leave.\n\n" +
        "When do you believe the undersigned first fell for you?",
      options: ["July 4, 2025","February 3, 2025","Some random day I don’t remember","It was inevitable 😌"],
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
      options: ["Your honesty","Your eyes","Your smile","Your tiny efforts"],
      revealNote:
        "All of them.\n\nYour honesty that feels safe.\nYour eyes that soften the world.\nYour smile that turns a bad day gentle.\nAnd your tiny efforts — the ones you think don’t matter — that matter the most.\n\nIt’s always been all of you."
    },
    {
      id: "ideal_winter_date",
      type: "text_simple",
      title: "Paint me a winter scene…",
      prompt:
        "It’s cold outside.\nWe’re warm anyway.\n\nDescribe your ideal winter date — however you like.",
      placeholder: "Write anything…"
    },
    {
      id: "valentine_word",
      type: "text",
      title: "One word. One feeling.",
      prompt: "When I say “Valentine”… what blooms in your mind?",
      placeholder: "A word, a feeling, a sentence…",
      noteOk: "That’s beautiful. I’m keeping it."
    },
    {
      id: "budget",
      type: "number",
      title: "A practical bookmark…",
      prompt: "Numbers only.\nWhat should the budget be for our Valentine’s Day expedition?",
      placeholder: "Example: 120",
      noteOk: "Understood. The undersigned will spend it wisely."
    },
    {
      id: "vibe",
      type: "choice",
      title: "Choose the mood of the chapter…",
      prompt: "What vibe do you want for our date?",
      options: ["Soft & romantic","Elegant & cozy","Playful & spontaneous","Intimate & warm"],
      noteForChoice: function (pick) { return "Done. " + pick + " it is. Main sambhaal lunga 🙂"; }
    },
    {
      id: "gift",
      type: "text",
      title: "Your gift, in your words…",
      prompt: "What do you want for your Valentine’s gift?",
      placeholder: "Be honest. I’m taking notes.",
      noteOk: "Noted. Consider this a very serious hint."
    },
    {
      id: "us_words",
      type: "text",
      title: "Write in the margins…",
      prompt:
        "Write anything you want here.\nA thought. A memory. A line for us.\n\nNo rules.",
      placeholder: "I’m listening…",
      noteOk: "Thank you. This one matters."
    },
    {
      id: "valentine_yes",
      type: "loop_yesno",
      title: "The question that starts the next chapter…",
      prompt: "Will you be the undersigned’s Valentine?",
      yesText: "Yes.",
      noText: "No.",
      noNote: "Accha? 😌\n\nNahi chalega.\nTurn the page and try again — the correct answer is… obvious.",
      yesNote: "Then it’s settled.\n\nFebruary 14 is ours."
    }
  ];

  // State
  var idxQ = 0;
  var mode = "question";
  var pendingNote = "";
  var answers = {};

  function setProgress() {
    safeText(progressText, (idxQ + 1) + " / " + questions.length);

    var left = 3 + idxQ * 2 + (mode === "note" ? 1 : 0);
    var right = left + 1;

    safeText($("pageNumLeft"), "— " + left + " —");
    safeText($("pageNumRight"), "— " + right + " —");

    safeText(chapterLine, "CHAPTER II");
    safeText(chapterTitle, (mode === "question") ? "A Gentle Examination" : "A Small Memory");
  }

  function render() {
    setProgress();
    showPhoto((idxQ * 2 + (mode === "note" ? 1 : 0)) % PHOTOS.length, false);

    if (backBtn) backBtn.disabled = (idxQ === 0 && mode === "question");
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.textContent = (mode === "note") ? "Turn Page" : "Next";
    }

    fadeSwap(function () {
      if (mode === "question") renderQuestion(questions[idxQ]);
      else renderNote();
    });
  }

  function renderNote() {
    safeText(noteTitle, "A note, in the margin…");
    safeText(noteBody, pendingNote || "—");
    safeText(noteFooter, "Turn the page when you’re ready.");
    if (nextBtn) nextBtn.disabled = false;

    var memory = getInterlude(idxQ);
    if (card) {
      card.innerHTML =
        '<h3 class="qTitle">Ek chhoti si yaad…</h3>' +
        '<p class="qPrompt">' + memory + '</p>' +
        '<p class="qPrompt" style="opacity:.78">Turn the page… I’m saving the best parts for later.</p>';
    }
  }

  function renderQuestion(q) {
    safeText(noteTitle, "Photos & notes");
    safeText(noteBody, "Your answers will leave little notes here — like bookmarks.");
    safeText(noteFooter, "—");

    if (!card) return;
    card.innerHTML = "";

    var t = document.createElement("h3");
    t.className = "qTitle";
    t.textContent = q.title;

    var p = document.createElement("p");
    p.className = "qPrompt";
    p.textContent = q.prompt;

    card.appendChild(t);
    card.appendChild(p);

    if (q.type === "gate_choice" || q.type === "choice" || q.type === "choice_reveal") return renderChoice(q);
    if (q.type === "text") return renderText(q);
    if (q.type === "text_simple") return renderTextSimple(q);
    if (q.type === "number") return renderNumber(q);
    if (q.type === "loop_yesno") return renderYesNo(q);
  }

  function enableToNote(noteText) {
    pendingNote = noteText || "";
    if (nextBtn) nextBtn.disabled = false;
  }

  function renderChoice(q) {
    var wrap = document.createElement("div");
    wrap.className = "options";

    q.options.forEach(function (label, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "opt";
      b.textContent = label;

      b.addEventListener("click", function () {
        Array.prototype.forEach.call(wrap.children, function (x) { x.classList.remove("selected"); });
        b.classList.add("selected");

        if (q.type === "gate_choice") {
          if (i === q.correctIndex) {
            answers[q.id] = i;
            enableToNote(q.noteOk);
          } else {
            delete answers[q.id];
            pendingNote = q.noteNo;
            if (nextBtn) nextBtn.disabled = true;
          }
          return;
        }

        if (q.type === "choice_reveal") {
          answers[q.id] = i;
          enableToNote(q.revealNote);
          return;
        }

        answers[q.id] = i;
        var note = q.noteForChoice ? q.noteForChoice(q.options[i]) : "";
        enableToNote(note);
      });

      wrap.appendChild(b);
    });

    card.appendChild(wrap);

    if (answers[q.id] !== undefined && wrap.children[answers[q.id]]) {
      wrap.children[answers[q.id]].classList.add("selected");
      if (q.type === "choice_reveal") enableToNote(q.revealNote);
      if (q.type === "choice" && q.noteForChoice) enableToNote(q.noteForChoice(q.options[answers[q.id]]));
    }
  }

  function renderTextSimple(q){
    var ta = document.createElement("textarea");
    ta.className = "textbox";
    ta.rows = 4;
    ta.placeholder = q.placeholder || "";
    ta.value = answers[q.id] || "";

    function validate(){
      var v = ta.value.trim();
      var ok = v.length >= 1;
      if (nextBtn) nextBtn.disabled = !ok;
      if (ok){
        answers[q.id] = v;
        pendingNote = "Noted. (This sounds like us.)";
      }
    }

    ta.addEventListener("input", validate);
    card.appendChild(ta);
    validate();
  }

  function renderText(q) {
    var ta = document.createElement("textarea");
    ta.className = "textbox";
    ta.rows = 4;
    ta.placeholder = q.placeholder || "";
    ta.value = answers[q.id] || "";

    function validate() {
      var v = ta.value.trim();
      var ok = v.length >= 1;
      if (nextBtn) nextBtn.disabled = !ok;
      if (ok) {
        answers[q.id] = v;
        pendingNote = q.noteOk || "Noted.";
      }
    }

    ta.addEventListener("input", validate);
    card.appendChild(ta);
    validate();
  }

  function renderNumber(q) {
    var inp = document.createElement("input");
    inp.className = "numBox";
    inp.type = "text";
    inp.inputMode = "numeric";
    inp.placeholder = q.placeholder || "";
    inp.value = answers[q.id] || "";

    function validate() {
      inp.value = inp.value.replace(/[^\d]/g, "");
      var v = inp.value.trim();
      if (v.length > 0) {
        answers[q.id] = v;
        pendingNote = q.noteOk || "Understood.";
        if (nextBtn) nextBtn.disabled = false;
      } else {
        if (nextBtn) nextBtn.disabled = true;
      }
    }

    inp.addEventListener("input", validate);
    card.appendChild(inp);
    validate();
  }

  function renderYesNo(q) {
    var wrap = document.createElement("div");
    wrap.className = "options";

    function makeBtn(label) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "opt";
      b.textContent = label;
      return b;
    }

    var yes = makeBtn(q.yesText || "Yes.");
    var no = makeBtn(q.noText || "No.");

    function select(btn) {
      Array.prototype.forEach.call(wrap.children, function (x) { x.classList.remove("selected"); });
      btn.classList.add("selected");
    }

    yes.addEventListener("click", function () {
      select(yes);
      answers[q.id] = "yes";
      pendingNote = q.yesNote;
      setTimeout(function () { mode = "note"; render(); }, 180);
    });

    no.addEventListener("click", function () {
      select(no);
      delete answers[q.id];
      pendingNote = q.noNote;
      setTimeout(function () { mode = "note"; render(); }, 180);
    });

    wrap.appendChild(yes);
    wrap.appendChild(no);
    card.appendChild(wrap);

    if (answers[q.id] === "yes") yes.classList.add("selected");
    if (nextBtn) nextBtn.disabled = true;
  }

  // ===== Answer export =====
  function buildAnswerSummary(){
    var vibeQ = questions.find(function(x){ return x.id === "vibe"; });
    var traitQ = questions.find(function(x){ return x.id === "trait"; });

    function pickOption(q, idx){
      if (!q || idx === undefined || idx === null) return "—";
      return q.options && q.options[idx] ? q.options[idx] : "—";
    }

    var lines = [];
    lines.push("Valentine Book — Answers");
    lines.push("================================");
    lines.push("Signed: " + (localStorage.getItem("val_sig") || "—"));
    lines.push("");

    lines.push("1) Fell for you: " + pickOption(questions[0], answers.fell_date));
    lines.push("2) Trait you picked: " + pickOption(traitQ, answers.trait));
    lines.push("3) Ideal winter date: " + (answers.ideal_winter_date || "—"));
    lines.push("4) ‘Valentine’ means: " + (answers.valentine_word || "—"));
    lines.push("5) Budget: " + (answers.budget ? ("$"+answers.budget) : "—"));
    lines.push("6) Vibe: " + (answers.vibe !== undefined ? pickOption(vibeQ, answers.vibe) : "—"));
    lines.push("7) Gift: " + (answers.gift || "—"));
    lines.push("8) Your words: " + (answers.us_words || "—"));
    lines.push("9) Valentine: " + (answers.valentine_yes === "yes" ? "Yes" : "—"));

    lines.push("");
    lines.push("(Exported locally from the page.)");
    return lines.join("\n");
  }

  function downloadText(filename, text){
    var blob = new Blob([text], {type:"text/plain;charset=utf-8"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  function copyText(text){
    if (navigator.clipboard && navigator.clipboard.writeText){
      return navigator.clipboard.writeText(text);
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  // ===== Navigation =====
  if (backBtn) {
    backBtn.addEventListener("click", function () {
      if (mode === "note") { mode = "question"; return render(); }
      idxQ = Math.max(0, idxQ - 1);
      mode = "question";
      render();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      var q = questions[idxQ];

      if (mode === "question") {
        mode = "note";
        render();
        return;
      }

      mode = "question";

      if (q.id === "valentine_yes" && answers[q.id] !== "yes") {
        render();
        return;
      }

      if (idxQ >= questions.length - 1) {
        finish();
        return;
      }

      idxQ += 1;
      render();
    });
  }

  function finish() {
    var vibeQ = questions.find(function(x){ return x.id === "vibe"; });
    var vibe = (answers.vibe !== undefined && vibeQ) ? vibeQ.options[answers.vibe] : "—";
    var budget = answers.budget ? ("$" + answers.budget) : "—";

    safeText($("finalTitle"), GIRLFRIEND_NAME + ", you’re my Valentine.");
    safeText($("finalBody"),
      "Here’s to us.\n" +
      "To your calm — my favorite place.\n" +
      "To the tiny efforts you think no one sees.\n" +
      "And to every chapter that comes next."
    );

    safeText($("outVibe"), vibe);
    safeText($("outBudget"), budget);
    safeText($("outWinter"), answers.ideal_winter_date || "—");
    safeText($("outVal"), answers.valentine_word || "—");
    safeText($("outGift"), answers.gift || "—");
    safeText($("outUs"), answers.us_words || "—");

    loadSignature();
    showPanel(final);

    var leftPage = final.querySelector(".page.left .pageBody");
    if (leftPage && !document.getElementById("exportRow")) {
      var row = document.createElement("div");
      row.className = "exportRow";
      row.id = "exportRow";

      var copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "ghost";
      copyBtn.textContent = "Copy Answers";

      var dlBtn = document.createElement("button");
      dlBtn.type = "button";
      dlBtn.className = "primary";
      dlBtn.textContent = "Download Answers";

      copyBtn.addEventListener("click", function(){
        var txt = buildAnswerSummary();
        copyText(txt).then(function(){ alert("Copied. Send it to Arnaav 🙂"); });
      });

      dlBtn.addEventListener("click", function(){
        var txt = buildAnswerSummary();
        downloadText("valentine-answers.txt", txt);
      });

      row.appendChild(copyBtn);
      row.appendChild(dlBtn);
      leftPage.appendChild(row);
    }

    if (sigInput) setTimeout(function(){ sigInput.focus(); }, 250);
  }

  // ===== Start =====
  if ($("beginBtn")) {
    $("beginBtn").addEventListener("click", function () {
      startMusic().finally(function () {
        showPanel(quiz);
        idxQ = 0;
        mode = "question";
        pendingNote = "";
        render();
        setMusicLabel();
      });
    });
  }

  showPanel(intro);
})();
