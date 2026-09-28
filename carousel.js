// Success stories showcase (program pages). The reviews glide continuously from right to left in an
// endless loop (CSS animation in styles.css). This script copies the cards once so the loop is seamless,
// sets the speed from the number of cards, and starts the motion the moment the reviews scroll into view.
// It pauses on hover, keyboard focus, or a tap; visitors who prefer reduced motion get a still, swipeable row.
(function () {
  var SECONDS_PER_CARD = 7;

  function setup(root) {
    var track = root.querySelector(".review-track");
    if (!track) return;

    var cards = track.querySelectorAll(".testimonial");
    for (var i = 0; i < cards.length; i++) {
      var copy = cards[i].cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.classList.add("is-copy");
      track.appendChild(copy);
    }
    track.style.setProperty("--showcase-duration", (cards.length * SECONDS_PER_CARD) + "s");
    root.classList.add("is-ready");

    // Start gliding as soon as the reviews appear on screen (from the first card), not on page load.
    function start() { root.classList.add("is-running"); }
    if ("IntersectionObserver" in window) {
      var watcher = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { start(); watcher.disconnect(); }
      }, { threshold: 0.15 });
      watcher.observe(root);
    } else {
      start();
    }

    // A tap on a phone holds the showcase still so the review can be read; tap again to resume.
    track.addEventListener("click", function () { root.classList.toggle("is-held"); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var all = document.querySelectorAll(".review-carousel");
    for (var i = 0; i < all.length; i++) setup(all[i]);
  });
})();
