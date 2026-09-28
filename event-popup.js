// Free live group webinar popup (held once or twice a year) — shared by every page. Include after booking-popup.js and oura-popup.js.
// Only one popup auto-opens per page view: this one goes first, and the Oura popup waits its turn.
(function () {
  // ---- Event details: edit these ----
  var EVENT_NAME = 'Lower Anxiety &amp; Live With Energy';
  var EVENT_PRICE = 'Free';
  // GHL "Event Registration" workflow's Inbound Webhook (sends name, email, event, event_date, source, page):
  var WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/EvjnO4xt4AwXVkc2EZ1T/webhook-trigger/b8a6e5c2-f53f-4c9b-aef0-5e620acd9508";
  var EVENT_DATE = "2027-01-04T19:00:00-05:00";  // sent to GHL with each sign-up
  var EVENT_START = Date.UTC(2027, 0, 5, 0, 0);  // Mon Jan 4, 2027, 7:00 PM EST (= 00:00 UTC Jan 5)
  var EVENT_END = EVENT_START + 60 * 60 * 1000;  // 1 hour; popup stops showing after this
  // -----------------------------------

  var STORAGE_KEY = "aipEventDismissed-20270104";
  var REGISTERED_KEY = "aipEventRegistered-20270104";
  var loadedAt = Date.now();
  var DELAY_MS = 8000;
  var SCROLL_SHARE = 0.3;

  var overlay, dialog, lastFocus, timer;
  var autoDone = false;

  if (Date.now() > EVENT_END) return;
  // While the webinar is upcoming, show the "Save My Free Spot" buttons and the corner tab (see .event-only in styles.css).
  if (!registered()) document.documentElement.classList.add("has-event");

  function dismissed() {
    try { return window.localStorage.getItem(STORAGE_KEY) === "1"; } catch (e) { return false; }
  }
  function rememberClosed() {
    try { window.localStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
  }
  function registered() {
    try { return window.localStorage.getItem(REGISTERED_KEY) === "1"; } catch (e) { return false; }
  }
  function rememberRegistered() {
    try { window.localStorage.setItem(REGISTERED_KEY, "1"); } catch (e) {}
    document.documentElement.classList.remove("has-event");
  }
  function calendarInView() {
    var cal = document.getElementById("aip-booking-frame");
    if (!cal) return false;
    if (document.body.getAttribute("data-page") === "book") return true;
    var r = cal.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }
  function otherPopupOpen() {
    var b = document.getElementById("booking-overlay");
    var o = document.getElementById("oura-overlay");
    return !!((b && b.classList.contains("active")) || (o && o.classList.contains("is-open")));
  }

  function build() {
    var needsDetails = EVENT_NAME.indexOf("PLACEHOLDER") > -1;

    overlay = document.createElement("div");
    overlay.className = "event-overlay";
    overlay.id = "event-overlay";
    overlay.innerHTML =
      '<div class="event-dialog" role="dialog" aria-modal="true" aria-labelledby="event-title">' +
        '<button type="button" class="event-close" aria-label="Close">&times;</button>' +
        '<div class="event-art">' +
          '<img class="event-photo" src="assets/webinar-anya.jpg" width="900" height="1200" loading="lazy" alt="Anya Gossage smiling with a green smoothie among her plants">' +
          '<span class="event-free"><span class="event-free-big">Free</span><span class="event-free-small">no cost<br>to join</span></span>' +
          '<div class="event-date" aria-hidden="true">' +
            '<span class="event-month">Jan</span>' +
            '<span class="event-day">4</span>' +
            '<span class="event-year">2027</span>' +
          '</div>' +
          '<p class="event-when">Monday &middot; 7:00 PM EST</p>' +
        '</div>' +
        '<div class="event-copy">' +
          '<p class="event-kicker">Free live group webinar on Zoom</p>' +
          '<h2 id="event-title">' + EVENT_NAME + '</h2>' +
          '<p>Feeling anxious, overwhelmed, and exhausted? Join me live for one hour to learn how to calm your anxiety and find your energy again, without relying on caffeine and sugar. Bring your questions! I only host this free webinar once or twice a year, so save your spot.</p>' +
          '<ul class="event-points">' +
            '<li><strong>When:</strong> Monday, January 4, 2027, 7:00&ndash;8:00 PM EST (4:00 PM PST)</li>' +
            '<li><strong>Where:</strong> Zoom, from wherever you are</li>' +
            '<li><strong>Who:</strong> open to everyone. Register to get the Zoom link.</li>' +
            '<li><strong>Covers:</strong> my 3 phases: Listen to Your Body, Nourish Your Core, and Plan for Success</li>' +
          '</ul>' +
          (needsDetails ? '<p class="todo-note">TO DO: send the webinar name. Edit it at the top of event-popup.js.</p>' : '') +
          '<form class="event-form" novalidate>' +
            '<div class="aipf-hp" aria-hidden="true"><label>Leave this empty <input type="text" name="aipf_hp_check" tabindex="-1" autocomplete="off" data-lpignore="true" data-1p-ignore data-bwignore></label></div>' +
            '<div class="event-fields">' +
              '<div><label for="event-name">Name *</label><input type="text" id="event-name" name="name" autocomplete="name" required></div>' +
              '<div><label for="event-email">Email *</label><input type="email" id="event-email" name="email" autocomplete="email" required></div>' +
            '</div>' +
            '<div class="event-actions">' +
              '<button type="submit" class="btn btn-primary event-go">Save My Free Spot</button>' +
              '<button type="button" class="event-later">Maybe later</button>' +
            '</div>' +
            '<p class="form-status" role="status" aria-live="polite"></p>' +
          '</form>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    dialog = overlay.querySelector(".event-dialog");

    // Corner tab on every page, so visitors can come back to the sign-up after "Maybe later".
    var tab = document.createElement("button");
    tab.type = "button";
    tab.className = "event-tab event-only";
    tab.setAttribute("data-open-event", "");
    tab.innerHTML = '<span class="event-tab-dot" aria-hidden="true"></span>Free Webinar &middot; Jan 4';
    document.body.appendChild(tab);

    overlay.querySelector(".event-close").addEventListener("click", close);
    overlay.querySelector(".event-later").addEventListener("click", close);
    overlay.querySelector(".event-form").addEventListener("submit", register);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    overlay.addEventListener("keydown", trapKeys);
  }

  // Sign-up: sends to the GHL webhook, then shows a thank-you in place of the form.
  function register(e) {
    e.preventDefault();
    var form = e.target;
    var status = form.querySelector(".form-status");
    var button = form.querySelector(".event-go");
    function show(kind, message) { status.className = "form-status is-" + kind; status.textContent = message; }
    if (!form.checkValidity()) { form.reportValidity(); return; }
    // Spam bots fill the hidden field and submit instantly; only block when both happen.
    if (form.querySelector(".aipf-hp input").value && Date.now() - loadedAt < 3000) return;

    var tmp = document.createElement("div");
    tmp.innerHTML = EVENT_NAME;
    var data = new URLSearchParams();
    data.append("name", form.querySelector("[name=name]").value.trim());
    data.append("email", form.querySelector("[name=email]").value.trim());
    data.append("event", tmp.textContent.indexOf("PLACEHOLDER") > -1 ? "Free live webinar, Jan 4 2027" : tmp.textContent);
    data.append("event_date", EVENT_DATE);
    data.append("source", "event-popup");
    data.append("page", window.location.href);

    button.disabled = true;
    button.textContent = "Saving\u2026";
    fetch(WEBHOOK_URL, { method: "POST", mode: "no-cors", body: data })
      .then(function () {
        rememberClosed(); // registered: don't show the popup again
        rememberRegistered(); // and hide the corner tab and "Save My Free Spot" buttons
        form.reset();
        form.querySelector(".event-fields").hidden = true;
        form.querySelector(".event-actions").hidden = true;
        show("success", "You're registered! Check your email for the Zoom link. See you on January 4.");
      })
      .catch(function () {
        show("error", "Something went wrong. Please try again in a moment.");
        button.disabled = false;
        button.textContent = "Save My Free Spot";
      });
  }

  function focusables() {
    return dialog.querySelectorAll('a[href], button:not([disabled]), input:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])');
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
    if (!overlay || overlay.classList.contains("is-open") || otherPopupOpen()) return;
    autoDone = true;
    clearTimeout(timer);
    window.AIP_POPUP_SHOWN = true;
    lastFocus = document.activeElement;
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    var first = overlay.querySelector("#event-name");
    if (first) first.focus();
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
    if (window.AIP_POPUP_SHOWN || window.AIP_BOOKING_USED || otherPopupOpen() || calendarInView() || dismissed()) { autoDone = true; return; }
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

  // Claim this page view's popup slot now, so the Oura popup doesn't also open.
  if (!dismissed()) window.AIP_EVENT_PENDING = true;

  document.addEventListener("DOMContentLoaded", function () {
    build();

    // Any element with data-open-event opens the popup on click (even if dismissed).
    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-open-event]") : null;
      if (t) { e.preventDefault(); open(); }
    });

    // For testing: add ?show-event to any page's address to open the popup right away.
    if (/[?&]show-event\b/.test(window.location.search)) { open(); return; }

    if (dismissed()) { autoDone = true; return; }
    timer = setTimeout(autoOpen, DELAY_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
  });
})();
