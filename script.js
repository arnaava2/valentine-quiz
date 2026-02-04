(function () {
  "use strict";

  // ===== Personalization =====
  var GIRLFRIEND_NAME = "Madhura";
  var heroTitle = document.getElementById("heroTitle");
  if (heroTitle) heroTitle.textContent = GIRLFRIEND_NAME + ".";

  // ===== Helpers =====
  function $(id) { return document.getElementById(id); }
  function safeText(el, value) { if (el) el.textContent = value; }

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

  // ===== Cursor-reactive background =====
  var root = document.documentElement;
  function setCursorVars(x, y) {
    root.style.setProperty("--cx", (x * 100).toFixed(2) + "%");
    root.style.setProperty("--cy", (y * 100).toFixed(2) + "%");
  }
  window.addEventListener("mousemove", function (e) {
    setCursorVars(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
  });

  // gentle drift if mouse is idle
  var drift = 0;
  setInterval(function () {
    drift += 0.01;
    var x = 0.5 + Math.sin(drift) * 0.06;
    var y = 0.45 + Math.cos(drift * 0.9) * 0.06;
    setCursorVars(x, y);
  }, 60);

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

  // ===== Carousel DOM =====
  var photoImg = $("photoImg");
  var photoCaption = $("photoCaption");
  var photoPrev = $("photoPrev");
  var photoNext = $("photoNext");
  var photoDots = $("photoDots");

  // ===== Photos (15) =====
  var PHOTOS = [];
  for (var i = 1; i <= 15; i++) {
    var n = (i < 10 ? "0" + i : "" + i);
    PHOTOS.push({ src: "photos/" + n + ".jpg", caption: "Memory " + i });
  }
  var CAPTIONS = [
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
  PHOTOS.forEach(function (p, idx) { p.caption = CAPTIONS[idx] || p.caption; });

  // preload
  PHOTOS.forEach(function (p) { var im = new Image(); im.src = p.src; });

  var photoIndex = 0;
  var autoTimer = null;

  function buildDots() {
    if (!photoDots) return;
    photoDots.innerHTML = "";
    for (var d = 0; d < PHOTOS.length; d++) {
      (function (k) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "dot";
        btn.setAttribute("aria-label", "Photo " + (k + 1));
        btn.addEventListener("click", function () {
          showPhoto(k, true);
        });
        photoDots.appendChild(btn);
      })(d);
    }
  }

  function setActiveDot() {
    if (!photoDots) return;
    var kids = photoDots.children;
    for (var j = 0; j < kids.length; j++) {
      kids[j].classList.toggle("active", j === photoIndex);
    }
  }

  function restartAutoAdvance() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(function () {
      showPhoto(photoIndex + 1, false);
    }, 5500);
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
    }, 120);

    if (userInitiated) restartAutoAdvance();
  }

  if (photoPrev) photoPrev.addEventListener("click", function () { showPhoto(photoIndex - 1, true); });
  if (photoNext) photoNext.addEventListener("click", function () { showPhoto(photoIndex + 1, true); });

  buildDots();
  showPhoto(0, false);
  restartAutoAdvance();

  // ===== Questions (your full spec) =====
  var questions = [
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
        "Your honesty that feels safe.\nYour eyes that soften the world.\nYour smile that turns a bad day gentle.\n" +
        "And your tiny efforts — the ones you think don’t matter — that matter the most.\n\n" +
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
      prompt: "When I say “Valentine”… what blooms in your mind?",
      placeholder: "A word, a feeling, a sentence…",
      minLen: 1,
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
      options: ["Soft & romantic", "Elegant & cozy", "Playful & spontaneous", "Intimate & warm"],
      noteForChoice: function (pick) {
        return "Perfect. I’ll plan like it’s " + pick.toLowerCase() + " and we have nowhere else to be.";
      }
    },
    {
      id: "gift",
      type: "text",
      title: "Your gift, in your words…",
      prompt: "What do you want for your Valentine’s gift?",
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
      prompt: "Will you be the undersigned’s Valentine?",
      yesText: "Yes.",
      noText: "No.",
      noNote:
        "That answer doesn’t suit you.\n\nTurn the page and try again — but this time, choose the one your heart is already smiling about.",
      yesNote:
        "Then it’s settled.\n\nFebruary 14 is ours."
    }
  ];

  // ===== State =====
  var idxQ = 0;
  var mode = "question"; // question -> note -> next question
  var pendingNote = "";
  var answers = {};

  // ===== Progress/page numbers =====
  function setProgress() {
    safeText(progressText, (idxQ + 1) + " / " + questions.length);

    var left = 3 + idxQ * 2 + (mode === "note" ? 1 : 0);
    var right = left + 1;

    safeText(pageNumLeft, "— " + left + " —");
    safeText(pageNumRight, "— " + right + " —");

    safeText(chapterLine, "CHAPTER II");
    safeText(chapterTitle, (mode === "question") ? "A Gentle Examination" : "A Note From The Undersigned");
  }

  function fadeSwap(fn) {
    if (!card) { fn(); return; }
    card.classList.add("fadeOut");
    setTimeout(function () {
      fn();
      card.classList.remove("fadeOut");
    }, 220);
  }

  // ===== Rendering =====
  function render() {
    setProgress();

    // rotate photos with page turns
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

    if (card) {
      card.innerHTML =
        '<h3 class="qTitle">Pause here.</h3>' +
        '<p class="qPrompt">Some answers deserve a quiet beat.</p>';
    }
  }

  function renderQuestion(q) {
    safeText(noteTitle, "Turn a page…");
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

    // restore selection if answered
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
      var ok = v.length >= (q.minLen || 1);
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

  // FIXED: last question selection always works, No loops back
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

      // question -> note
      if (mode === "question") {
        mode = "note";
        render();
        return;
      }

      // note -> next question (or loop)
      mode = "question";

      if (q.id === "valentine_yes" && answers[q.id] !== "yes") {
        render(); // loop until yes
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

  // ===== Finish =====
  function finish() {
    var vibeQ = null;
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].id === "vibe") { vibeQ = questions[i]; break; }
    }

    var vibe = (answers.vibe !== undefined && vibeQ) ? vibeQ.options[answers.vibe] : "—";
    var budget = answers.budget ? ("$" + answers.budget) : "—";
    var winter = answers.ideal_winter_date || "—";
    var val = answers.valentine_word || "—";
    var gift = answers.gift || "—";
    var us = answers.us_words || "—";

    safeText($("finalTitle"), GIRLFRIEND_NAME + ", you’re my Valentine.");
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

  // ===== Start =====
  if (beginBtn) {
    beginBtn.addEventListener("click", function () {
      // proceed even if music can't autoplay
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
