// Oura Ring popup — shared by every page. Include after booking-popup.js.
(function () {
  var OURA_URL = "https://us.fullscript.com/u/catalog/product/U3ByZWU6OlByb2R1Y3QtMTE0ODkz";
  var STORAGE_KEY = "aipOuraHiddenUntil";
  var HIDE_DAYS = 7;
  var DELAY_MS = 15000;
  var SCROLL_SHARE = 0.4;

  var overlay, dialog, lastFocus, timer;
  var autoDone = false;

  function hiddenUntil() {
    try { return parseInt(window.localStorage.getItem(STORAGE_KEY), 10) || 0; } catch (e) { return 0; }
  }
  function rememberClosed() {
    try { window.localStorage.setItem(STORAGE_KEY, String(Date.now() + HIDE_DAYS * 24 * 60 * 60 * 1000)); } catch (e) {}
  }
  // True when the embedded booking calendar is on screen (or this is the booking page).
  function calendarInView() {
    var cal = document.getElementById("aip-booking-frame");
    if (!cal) return false;
    if (document.body.getAttribute("data-page") === "book") return true;
    var r = cal.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }
  function bookingIsOpen() {
    var b = document.getElementById("booking-overlay");
    return !!(b && b.classList.contains("active"));
  }

  function build() {
    overlay = document.createElement("div");
    overlay.className = "oura-overlay";
    overlay.id = "oura-overlay";
    overlay.innerHTML =
      '<div class="oura-dialog" role="dialog" aria-modal="true" aria-labelledby="oura-title">' +
        '<button type="button" class="oura-close" aria-label="Close">&times;</button>' +
        '<div class="oura-art" aria-hidden="true">' +
          '<svg viewBox="0 0 200 200" focusable="false">' +
            '<g transform="rotate(-90 100 100)"><g class="oura-arcs">' +
              '<circle cx="100" cy="100" r="78" stroke="#6BC96A" stroke-dasharray="140 350" stroke-dashoffset="0"/>' +
              '<circle cx="100" cy="100" r="78" stroke="#F5E14C" stroke-dasharray="140 350" stroke-dashoffset="-163"/>' +
              '<circle cx="100" cy="100" r="78" stroke="#F4A9B8" stroke-dasharray="140 350" stroke-dashoffset="-326"/>' +
            '</g></g>' +
            '<g class="oura-words"><text x="100" y="80">sleep</text><text x="100" y="105">stress</text><text x="100" y="130">recovery</text></g>' +
          '</svg>' +
        '</div>' +
        '<div class="oura-copy">' +
          '<p class="oura-kicker">Now in Anya&rsquo;s supplement shop</p>' +
          '<h2 id="oura-title">See how your body is really doing, day to day</h2>' +
          '<p>The Oura Ring tracks your sleep, stress, activity, and recovery, the same things that shift so much in midlife.</p>' +
          '<ul class="oura-points">' +
            '<li>10% off when you order through my Fullscript store</li>' +
            '<li>Spot patterns in your sleep and energy across your cycle</li>' +
            '<li>Choose to share your trends with me so your plan fits how you&rsquo;re actually feeling</li>' +
          '</ul>' +
          '<div class="oura-actions">' +
            '<a href="' + OURA_URL + '" target="_blank" rel="noopener" class="btn btn-primary oura-go">Get 10% off Oura<span class="visually-hidden"> (opens in a new tab)</span></a>' +
            '<button type="button" class="oura-later">Maybe later</button>' +
          '</div>' +
          '<p class="oura-note">New to Fullscript? You&rsquo;ll create a free account first.</p>' +
          '<p class="oura-fine">Oura Ring is not a medical device and is not intended to diagnose, treat, cure, or prevent any condition. Discount applied through Fullscript. Oura is a trademark of its owner.</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    dialog = overlay.querySelector(".oura-dialog");

    overlay.querySelector(".oura-close").addEventListener("click", close);
    overlay.querySelector(".oura-later").addEventListener("click", close);
    // Let the link open its new tab, then close and remember.
    overlay.querySelector(".oura-go").addEventListener("click", function () { close(); });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    overlay.addEventListener("keydown", trapKeys);
  }

  function focusables() {
    return dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
  }

  function trapKeys(e) {
    if (e.key === "Escape") { e.stopPropagation(); close(); return; }
    if (e.key !== "Tab") return;
    var items = focusables();
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open() {
    if (!overlay || overlay.classList.contains("is-open") || bookingIsOpen()) return;
    autoDone = true;
    clearTimeout(timer);
    lastFocus = document.activeElement;
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var go = overlay.querySelector(".oura-go");
    if (go) go.focus();
  }

  function close() {
    if (!overlay || !overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    rememberClosed();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function autoOpen() {
    if (autoDone) return;
    // Stay out of the way if the visitor is booking (or has opened booking this visit).
    if (bookingIsOpen() || window.AIP_BOOKING_USED || calendarInView()) { autoDone = true; return; }
    if (hiddenUntil() > Date.now()) { autoDone = true; return; }
    open();
  }

  function onScroll() {
    if (autoDone) { window.removeEventListener("scroll", onScroll); return; }
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable > 0 && window.scrollY / scrollable >= SCROLL_SHARE) {
      window.removeEventListener("scroll", onScroll);
      autoOpen();
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    build();

    // Any element with data-open-oura opens the popup on click (even if dismissed recently).
    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-open-oura]") : null;
      if (t) { e.preventDefault(); open(); return; }
      // Note when the booking popup is used so the Oura popup never interrupts it.
      if (e.target.closest && e.target.closest('[onclick*="AIPOpenBooking"]')) window.AIP_BOOKING_USED = true;
    });

    // Once someone clicks into the calendar, they are booking: stay out of the way.
    window.addEventListener("blur", function () {
      if (document.activeElement && document.activeElement.id === "aip-booking-frame") window.AIP_BOOKING_USED = true;
    });
    // Links that go to the calendar count as booking too.
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest('a[href="book.html"], a[href="#book"]') : null;
      if (a) window.AIP_BOOKING_USED = true;
    });

    if (hiddenUntil() > Date.now()) { autoDone = true; return; }
    timer = setTimeout(autoOpen, DELAY_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
  });
})();
