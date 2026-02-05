(function () {
  "use strict";

  // ===== Personalization =====
  var GIRLFRIEND_NAME = "Madhura";
  var heroTitle = document.getElementById("heroTitle");
  if (heroTitle) heroTitle.textContent = GIRLFRIEND_NAME + ".";

  // ===== Helpers =====
  function $(id) { return document.getElementById(id); }
  function safeText(el, value) { if (el) el.textContent = value; }
  function wordCount(s){
    var t = (s || "").trim();
    if (!t) return 0;
    return t.split(/\s+/).filter(Boolean).length;
  }

  // ===== Blossom / Rose Petal Background (Canvas) =====
  var canvas = $("petalCanvas");
  var ctx = canvas ? canvas.getContext("2d") : null;
  var W = 0, H = 0;
  var mouseX = 0.5, mouseY = 0.45;
  var petals = [];
  var lastT = 0;

  function resizeCanvas(){
    if (!canvas) return;
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
    // petal types: sakura / rose confetti
    var type = Math.random() < 0.75 ? "sakura" : "rose";
    var size = type === "sakura" ? rand(8, 16) : rand(6, 12);

    return {
      x: rand(-40, W + 40),
      y: spawnTop ? rand(-H, -20) : rand(-20, H + 20),
      vx: rand(-10, 10),
      vy: rand(22, 55),
      rot: rand(0, Math.PI * 2),
      vr: rand(-1.2, 1.2),
      wob: rand(0, Math.PI * 2),
      wobSpd: rand(0.6, 1.6),
      size: size,
      type: type,
      alpha: rand(0.55, 0.9)
    };
  }

  function seedPetals(){
    petals = [];
    var count = Math.min(90, Math.max(55, Math.floor((W*H)/22000)));
    for (var i=0;i<count;i++){
      petals.push(makePetal(false));
      petals[i].y = rand(0, H);
    }
  }

  function drawPetal(p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);

    // subtle cursor parallax
    var px = (mouseX - 0.5) * 22;
    var py = (mouseY - 0.5) * 16;
    ctx.translate(px, py);

    ctx.globalAlpha = p.alpha;

    if (p.type === "sakura"){
      // 5-lobe blossom petal-ish shape
      var s = p.size;
      var grad = ctx.createRadialGradient(-s*0.1, -s*0.1, s*0.5, 0, 0, s*1.6);
      grad.addColorStop(0, "rgba(255, 235, 242, 0.95)");
      grad.addColorStop(0.45, "rgba(255, 192, 212, 0.90)");
      grad.addColorStop(1, "rgba(214, 112, 145, 0.78)");
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s*0.7, -s*0.7, s*0.9, -s*0.1, s*0.35, s*0.25);
      ctx.bezierCurveTo(s*0.55, s*0.65, s*0.2, s*1.05, 0, s*0.8);
      ctx.bezierCurveTo(-s*0.2, s*1.05, -s*0.55, s*0.65, -s*0.35, s*0.25);
      ctx.bezierCurveTo(-s*0.9, -s*0.1, -s*0.7, -s*0.7, 0, -s);
      ctx.closePath();
      ctx.fill();

      // tiny center hint
      ctx.globalAlpha *= 0.55;
      ctx.fillStyle = "rgba(150, 60, 90, 0.22)";
      ctx.beginPath();
      ctx.arc(0, s*0.18, s*0.18, 0, Math.PI*2);
      ctx.fill();
    } else {
      // rose confetti (rounded diamond)
      var r = p.size;
      var grad2 = ctx.createLinearGradient(-r, -r, r, r);
      grad2.addColorStop(0, "rgba(255, 214, 230, 0.92)");
      grad2.addColorStop(1, "rgba(181, 68, 105, 0.72)");
      ctx.fillStyle = grad2;

      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.quadraticCurveTo(r, -r*0.2, r*0.55, r*0.8);
      ctx.quadraticCurveTo(0, r, -r*0.55, r*0.8);
      ctx.quadraticCurveTo(-r, -r*0.2, 0, -r);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function step(t){
    if (!ctx) return;
    if (!lastT) lastT = t;
    var dt = Math.min(0.033, (t - lastT) / 1000);
    lastT = t;

    ctx.clearRect(0,0,W,H);

    // soft vignette
    var vg = ctx.createRadialGradient(W*0.5, H*0.5, Math.min(W,H)*0.2, W*0.5, H*0.5, Math.max(W,H)*0.72);
    vg.addColorStop(0, "rgba(255,255,255,0)");
    vg.addColorStop(1, "rgba(230,210,220,0.28)");
    ctx.fillStyle = vg;
    ctx.fillRect(0,0,W,H);

    // wind influenced by cursor
    var wind = (mouseX - 0.5) * 32;

    for (var i=0;i<petals.length;i++){
      var p = petals[i];
      p.wob += p.wobSpd * dt;
      p.x += (p.vx + Math.sin(p.wob)*10 + wind) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;

      // wrap
      if (p.y > H + 40){
        petals[i] = makePetal(true);
        petals[i].y = -rand(20, 140);
      }
      if (p.x < -80) p.x = W + 80;
      if (p.x > W + 80) p.x = -80;

      drawPetal(p);
    }

    requestAnimationFrame(step);
  }

  function initPetals(){
    if (!canvas || !ctx) return;
    resizeCanvas();
    seedPetals();
    requestAnimationFrame(step);
  }

  window.addEventListener("resize", function(){
    if (!canvas) return;
    resizeCanvas();
    seedPetals();
  });

  window.addEventListener("mousemove", function (e) {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  initPetals();

  // ===== Panels =====
  var intro = $("intro");
  var quiz = $("quiz");
  var final = $("final");

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
  var bgm = $("bgm");
  var musicBtn = $("musicBtn");
  var musicOn = false;

  function setMusicLabel() {
    if (!musicBtn) return;
    if (!bgm) { musicBtn.textContent = "Music: —"; return; }
    musicBtn.textContent = (musicOn && !bgm.paused) ? "Music: On" : "Music: Off";
  }

  function startMusic() {
    if (!bgm) return Promise.resolve();
    bgm.volume = 0.75;
    bgm.muted = false;

    return bgm.play().then(function () {
      musicOn = true;
      setMusicLabel();
    }).catch(function () {
      musicOn = false;
      if (musicBtn) musicBtn.textContent = "Music: Tap";
    });
  }

  function toggleMusic() {
    if (!bgm) return;
    if (bgm.paused) {
      bgm.play().then(function () {
        musicOn = true;
        setMusicLabel();
      }).catch(function () {
        if (musicBtn) musicBtn.textContent = "Music: Tap";
      });
    } else {
      bgm.pause();
      setMusicLabel();
    }
  }

  if (musicBtn) musicBtn.addEventListener("click", toggleMusic);
  setMusicLabel();

  // ===== Quiz DOM =====
  var beginBtn = $("beginBtn");
  var card = $("card");
  var backBtn = $("backBtn");
  var nextBtn = $("nextBtn");
  var progressText = $("progressText");
  var pageNumLeft = $("pageNumLeft");
  var pageNumRight = $("pageNumRight");
  var chapterLine = $("chapterLine");
  var chapterTitle = $("chapterTitle");
  var noteTitle = $("noteTitle");
  var noteBody = $("noteBody");
  var noteFooter = $("noteFooter");

  var quizSpread = $("quizSpread");

  // ===== Signature =====
  var sigInput = $("sigInput");
  var sigBtn = $("sigBtn");
  var sigClear = $("sigClear");
  var sigOutput = $("sigOutput");

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
  var photoImg = $("photoImg");
  var photoCaption = $("photoCaption");
  var photoPrev = $("photoPrev");
  var photoNext = $("photoNext");
  var photoDots = $("photoDots");

  // ===== Photos (15) =====
  var PHOTOS = [];
  for (var i = 1; i <= 15; i++) PHOTOS.push({ src: "photos/" + i + ".jpg", caption: "—" });

  var CAPTIONS = [
    "Bas tum, thoda dhoop… aur main. (perfectly simple)",
    "Night walk vibes. Tum ho toh sab aesthetic ho jaata hai.",
    "Mirror mein bhi… tum hi focus. (बाकी सब blur)",
    "Smile check: pass. (mujhe toh har baar ho jaata hai)",
    "Grass pe chill… aur tum pe dil. Simple.",
    "Event mode: on. Aur tum: always the highlight.",
    "Side hug wala comfort… exactly my type of peace.",
    "Green suit + side profile… haan, main theek nahi hoon 🙂",
    "Black + red… filmy nahi, bas hum.",
    "Backless? ok. main bas respectfully stare karunga.",
    "Thand, lights, aur tum — baaki sab manageable.",
    "Mirror selfie + winter fit… ‘us’ ka poster lagta hai.",
    "Cafe reflection… quietly my favorite chapter.",
    "Plane seat, sleepy face, and you stealing my hoodie energy.",
    "Window light + tum… full cinema, no ticket needed."
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

  buildDots();
  showPhoto(0, false);
  restartAutoAdvance();

  // ===== Spread transition =====
  function fadeSwap(fn) {
    if (quizSpread) {
      quizSpread.classList.add("turning");
      setTimeout(function () {
        fn();
        quizSpread.classList.remove("turning");
      }, 280);
      return;
    }
    fn();
  }

  // ===== Poem-memory interludes (between questions) =====
  var POEM_MEMORIES = [
    "Kabhi kabhi main samajh nahi paaya… par I always cared. I still do.",
    "Jab bhi flower laata hoon, it’s my way of saying: ‘I missed you.’",
    "Hug chahiye hota tha — aur ab bhi. Bas, tum ho toh enough.",
    "Sometimes I wanted to get you a flower… and then it became my favorite habit.",
    "If time exists… toh flowers bhi aate rahenge. (promise type.)",
    "I’ve missed you a lot. Like… quietly. Like… always.",
    "Tiny things: a flower, a hug, a look — that’s my love language with you.",
    "Tumhare saath simple moments bhi special ho jaate hain. (bas tum.)",
    "Aaj bhi, kal bhi — I’ll keep choosing you. Softly. Daily."
  ];

  function getInterlude(idx){
    // rotate + keep it subtle
    return POEM_MEMORIES[idx % POEM_MEMORIES.length];
  }

  // ===== Questions =====
  var questions = [
    {
      id: "fell_date",
      type: "gate_choice",
      title: "A gentle timestamp…",
      prompt:
        "Some moments don’t arrive with fireworks.\nThey arrive quietly — and then they never leave.\n\n" +
        "When do you believe the undersigned first fell for you?",
      options: ["January 14, 2025","February 3, 2025","Some random day I don’t remember","It was inevitable 😌"],
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
      type: "text",
      title: "Paint me a winter scene…",
      prompt:
        "It’s cold outside.\nWe’re warm anyway.\n\nDescribe your ideal winter date — like a little excerpt from our story.",
      placeholder: "Details please… (don’t be shy)",
      minLen: 45,
      minWords: 8,
      noteOk: "Noted. I’m filing this under ‘things I will make happen.’"
    },
    {
      id: "valentine_word",
      type: "text",
      title: "One word. One feeling.",
      prompt: "When I say “Valentine”… what blooms in your mind?",
      placeholder: "A word, a feeling, a sentence…",
      minLen: 2,
      minWords: 1,
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
      minLen: 2,
      minWords: 1,
      noteOk: "Noted. Consider this a very serious hint."
    },
    {
      id: "us_words",
      type: "text",
      title: "Write in the margins…",
      prompt:
        "Write anything you want here.\nA thought. A memory. A line for us.\n\nNo rules.",
      placeholder: "I’m listening…",
      minLen: 2,
      minWords: 1,
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

  // ===== State =====
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

    // Replace the “quiet beat” with poem memories (cute, subtle)
    var memory = getInterlude(idxQ);
    if (card) {
      card.innerHTML =
        '<h3 class="qTitle">Ek chhoti si baat…</h3>' +
        '<p class="qPrompt">' + memory + '</p>' +
        '<p class="qPrompt" style="opacity:.75">And yes… I’m still bringing you flowers.</p>';
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

    if (answers[q.id] !== undefined) {
      var chosenIndex = answers[q.id];
      if (wrap.children[chosenIndex]) wrap.children[chosenIndex].classList.add("selected");
      if (q.type === "choice_reveal") enableToNote(q.revealNote);
      if (q.type === "choice" && q.noteForChoice) enableToNote(q.noteForChoice(q.options[chosenIndex]));
    }
  }

  function renderText(q) {
    var ta = document.createElement("textarea");
    ta.className = "textbox";
    ta.rows = 4;
    ta.placeholder = q.placeholder || "";
    ta.value = answers[q.id] || "";

    function validate() {
      var v = ta.value.trim();
      var okLen = v.length >= (q.minLen || 1);
      var okWords = wordCount(v) >= (q.minWords || 1);
      var ok = okLen && okWords;

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
    var vibeQ = null;
    for (var i = 0; i < questions.length; i++) if (questions[i].id === "vibe") { vibeQ = questions[i]; break; }

    var vibe = (answers.vibe !== undefined && vibeQ) ? vibeQ.options[answers.vibe] : "—";
    var budget = answers.budget ? ("$" + answers.budget) : "—";
    var winter = answers.ideal_winter_date || "—";
    var val = answers.valentine_word || "—";
    var gift = answers.gift || "—";
    var us = answers.us_words || "—";

    safeText($("finalTitle"), GIRLFRIEND_NAME + ", you’re my Valentine.");
    safeText($("finalBody"),
      "I missed you. I still do — in small ways, in soft ways.\n" +
      "And I’ll keep picking flowers for you… for as long as time exists."
    );

    safeText($("outVibe"), vibe);
    safeText($("outBudget"), budget);
    safeText($("outWinter"), winter);
    safeText($("outVal"), val);
    safeText($("outGift"), gift);
    safeText($("outUs"), us);

    loadSignature();
    showPanel(final);

    if (sigInput) setTimeout(function(){ sigInput.focus(); }, 250);
  }

  // ===== Start =====
  if (beginBtn) {
    beginBtn.addEventListener("click", function () {
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

  // init
  showPanel(intro);

})();
