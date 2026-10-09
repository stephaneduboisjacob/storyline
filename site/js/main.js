/* StoryLine — interactions: language, reveal, quotes, nav */

(function(){
  "use strict";

  /* ── language engine ─────────────────────────
     Priority: manual choice (forever) > first-visit geo hint
     (French-speaking places, via /geo/lang + Postgres GeoLite2)
     > browser language > French. */
  const SAVE_KEY = "storyline.lang";       // manual choice — always wins
  const AUTO_KEY = "storyline.lang.auto";  // geo decision from the first visit

  function manualLang(){
    try{ const saved = localStorage.getItem(SAVE_KEY);
      if(saved && I18N[saved]) return saved; }catch(e){}
    return null;
  }

  function browserLang(){
    const nav = (navigator.languages && navigator.languages[0]) || navigator.language || "fr";
    const base = nav.toLowerCase().split("-")[0];
    if(I18N[base]) return base;
    return "fr";
  }

  function applyInitialLang(){
    const manual = manualLang();
    if(manual) return manual;
    // first visit: show browser language immediately, then let geo override
    let auto = null;
    try{ auto = localStorage.getItem(AUTO_KEY); }catch(e){}
    if(auto && I18N[auto]) return auto;
    // fetch geo hint once; French regions (FR, BE, QC, MC, LU, Romandie) → fr
    fetch("/geo/lang", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if(d && d.lang && I18N[d.lang] && d.lang !== currentLang){
          try{ localStorage.setItem(AUTO_KEY, d.lang); }catch(e){}
          if(!manualLang()) applyLang(d.lang);
        }
      })
      .catch(()=>{});
    return null; // caller falls back to browser language
  }

  let currentLang = null;

  function applyLang(lang){
    const dict = I18N[lang]; if(!dict) return;
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const k = el.getAttribute("data-i18n");
      if(dict[k] !== undefined) el.textContent = dict[k];
    });
    document.querySelectorAll("[data-i18n-html]").forEach(el=>{
      const k = el.getAttribute("data-i18n-html");
      if(dict[k] !== undefined) el.innerHTML = dict[k];
    });
    if(dict["meta.title"]) document.title = dict["meta.title"];
    const md = document.querySelector('meta[name="description"]');
    if(md && dict["meta.desc"]) md.setAttribute("content", dict["meta.desc"]);
    // header label + selected states
    const label = document.getElementById("langLabel");
    if(label) label.textContent = LANGS[lang].name;
    document.querySelectorAll("#langMenu li").forEach(li=>{
      li.classList.toggle("selected", li.getAttribute("data-lang") === lang);
    });
    document.querySelectorAll("#footerLangs button").forEach(b=>{
      b.classList.toggle("selected", b.getAttribute("data-lang") === lang);
    });
    // NOTE: no persistence here — only explicit user choice is saved (SAVE_KEY)
    // close open FAQ so heights recalc naturally, keep scroll position
    window.dispatchEvent(new Event("storyline:lang"));
  }

  function chooseLang(lang){        // explicit user action → sticky forever
    applyLang(lang);
    try{ localStorage.setItem(SAVE_KEY, lang); }catch(e){}
  }

  // wire the dropdown
  const switchEl = document.getElementById("langSwitch");
  const btn = document.getElementById("langBtn");
  if(switchEl && btn){
    btn.addEventListener("click", e=>{
      e.stopPropagation();
      switchEl.classList.toggle("open");
      btn.setAttribute("aria-expanded", switchEl.classList.contains("open"));
    });
    document.querySelectorAll("#langMenu li").forEach(li=>{
      li.addEventListener("click", ()=>{ chooseLang(li.getAttribute("data-lang")); switchEl.classList.remove("open"); });
    });
    document.addEventListener("click", ()=>switchEl.classList.remove("open"));
  }
  document.querySelectorAll("#footerLangs button").forEach(b=>{
    b.addEventListener("click", ()=>chooseLang(b.getAttribute("data-lang")));
  });

  const initial = applyInitialLang();
  applyLang(initial || browserLang());

  /* ── header shadow on scroll ───────────────── */
  const header = document.querySelector(".site-header");
  const onScroll = ()=>header.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  /* ── reveal on scroll ──────────────────────── */
  const io = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
    });
  },{threshold:.12, rootMargin:"0px 0px -40px 0px"});
  document.querySelectorAll(".reveal").forEach((el,i)=>{
    el.style.transitionDelay = (Math.min(i%4,3) * 70) + "ms";
    io.observe(el);
  });

  /* ── quote rotator ─────────────────────────── */
  const quotes = document.querySelectorAll("#quoteRotator blockquote");
  const dots = document.querySelectorAll("#quoteDots i");
  let qi = 0, qTimer = null;
  function showQuote(n){
    qi = (n + quotes.length) % quotes.length;
    quotes.forEach((q,i)=>q.classList.toggle("active", i===qi));
    dots.forEach((d,i)=>d.classList.toggle("active", i===qi));
  }
  function startQuotes(){
    clearInterval(qTimer);
    qTimer = setInterval(()=>showQuote(qi+1), 6000);
  }
  dots.forEach((d,i)=>d.addEventListener("click", ()=>{ showQuote(i); startQuotes(); }));
  if(quotes.length) startQuotes();

  /* ── FAQ: one open at a time ───────────────── */
  const faqs = document.querySelectorAll(".faq-list details");
  faqs.forEach(d=>d.addEventListener("toggle", ()=>{
    if(d.open) faqs.forEach(o=>{ if(o!==d) o.open = false; });
  }));

  /* ── hero parallax (subtle, desktop only) ──── */
  const heroImg = document.querySelector(".hero-media img");
  if(heroImg && window.matchMedia("(min-width: 900px)").matches
     && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    window.addEventListener("scroll", ()=>{
      const y = Math.min(window.scrollY, 700);
      heroImg.style.transform = "translateY(" + (y * 0.12) + "px) scale(1.05)";
    }, {passive:true});
  }

})();
