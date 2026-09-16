var BOOKING_URL = "https://api.leadconnectorhq.com/widget/bookings/discovery-call-with-anya";

function AIPOpenBooking(e) {
  if (e && e.preventDefault) e.preventDefault();
  var overlay = document.getElementById("booking-overlay");
  var iframe = document.getElementById("booking-iframe");
  if (!overlay || !iframe) return false;
  if (!iframe.src) iframe.src = BOOKING_URL;
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
