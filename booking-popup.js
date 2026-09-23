var BOOKING_URL = "https://api.leadconnectorhq.com/widget/bookings/discovery-call-with-anya";

function AIPOpenBooking(e, url) {
  if (e && e.preventDefault) e.preventDefault();
  var overlay = document.getElementById("booking-overlay");
  var iframe = document.getElementById("booking-iframe");
  if (!overlay || !iframe) return false;
  // Use the button's own booking link if it's a real URL; otherwise the discovery call.
  var target = (url && /^https?:\/\//.test(url)) ? url : BOOKING_URL;
  if (iframe.getAttribute("src") !== target) iframe.src = target;
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
  return false;
}

function AIPCloseBooking() {
  var overlay = document.getElementById("booking-overlay");
  if (!overlay) return;
  overlay.classList.remove("active");
  document.body.style.overflow = "";
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") AIPCloseBooking();
});

document.addEventListener("DOMContentLoaded", function () {
  var overlay = document.getElementById("booking-overlay");
  if (!overlay) return;
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) AIPCloseBooking();
  });
});

// Mobile menu (hamburger)
document.addEventListener("DOMContentLoaded", function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");
  if (!header || !toggle) return;
  function setOpen(open) {
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.addEventListener("click", function () {
    setOpen(!header.classList.contains("menu-open"));
  });
  var links = header.querySelectorAll(".site-nav a");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function () { setOpen(false); });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
});

// Footer: random "Today's Nourish Tip" and wave color matched to the section above
var AIP_TIPS = [
  "Drink a glass of water before your morning coffee.",
  "Try including protein at breakfast to help keep energy steadier.",
  "Chew slowly. Digestion starts in your mouth.",
  "A 10-minute walk after meals can help you feel less sluggish.",
  "Colorful vegetables, beans, and berries give your gut the fiber it loves.",
  "Take three slow belly breaths before you eat.",
  "Morning daylight can help support your natural sleep rhythm.",
  "Try adding a fermented food like yogurt, kefir, or sauerkraut."
];

document.addEventListener("DOMContentLoaded", function () {
  var tip = document.getElementById("nourish-tip");
  if (tip) tip.textContent = AIP_TIPS[Math.floor(Math.random() * AIP_TIPS.length)];

  var footer = document.querySelector(".site-footer");
  if (!footer) return;
  var prev = footer.previousElementSibling;
  var color = prev ? window.getComputedStyle(prev).backgroundColor : "";
  if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") color = "#ffffff";
  footer.style.setProperty("--wave-bg", color);
});

// Booking calendar: open the box scrolled past GHL's header so the dates and times show first.
// 395px = height of GHL's logo/title/description block; adjust if the calendar description changes length.
document.addEventListener("DOMContentLoaded", function () {
  var frame = document.getElementById("aip-booking-frame");
  var box = document.getElementById("booking-scroll");
  if (!frame || !box) return;
  function jump() { box.scrollTop = 395; }
  frame.addEventListener("load", jump);
  jump();
});
