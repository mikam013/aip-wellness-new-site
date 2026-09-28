// Contact page form. Posts to the GHL "Contact Form" workflow's Inbound Webhook.
// Sends name, email, message, plus "source" (contact-form) and "page" (the page address).
(function () {
  // Paste the "Contact Form" workflow's Inbound Webhook URL between the quotes:
  var WEBHOOK_URL = "https://services.leadconnectorhq.com/hooks/EvjnO4xt4AwXVkc2EZ1T/webhook-trigger/8fe3344d-6b5b-46e7-b8d1-a54de933c4bd";
  var SOURCE = "contact-form";
  var loadedAt = Date.now();

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector("form[data-aip-contact]");
    if (!form) return;
    var button = form.querySelector("button[type=submit]");
    var buttonText = button.textContent;
    var status = form.querySelector(".form-status");

    function show(kind, message) {
      if (!status) return;
      status.className = "form-status is-" + kind;
      status.textContent = message;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      // Spam bots fill the hidden field and submit instantly. Only block when both happen, so a browser
      // or password manager that auto-fills the hidden field can't silently stop a real message.
      if (form.querySelector(".aipf-hp input").value && Date.now() - loadedAt < 3000) return;

      if (WEBHOOK_URL.indexOf("https://") !== 0) {
        show("error", "This form isn't connected yet. Add its GHL webhook link in contact-form.js to start receiving messages.");
        return;
      }

      var data = new URLSearchParams();
      data.append("name", form.querySelector("[name=name]").value.trim());
      data.append("email", form.querySelector("[name=email]").value.trim());
      data.append("message", form.querySelector("[name=message]").value.trim());
      data.append("source", SOURCE);
      data.append("page", window.location.href);

      button.disabled = true;
      button.textContent = "Sending…";
      fetch(WEBHOOK_URL, { method: "POST", mode: "no-cors", body: data })
        .then(function () {
          form.reset();
          show("success", "Thank you! Your message is on its way, and Anya will get back to you soon.");
        })
        .catch(function () {
          show("error", "Something went wrong. Please try again in a moment.");
        })
        .then(function () {
          button.disabled = false;
          button.textContent = buttonText;
        });
    });
  });
})();
