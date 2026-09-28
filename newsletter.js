// Newsletter sign-up forms (home page box + footer on every page).
// Both newsletter forms post to the same GHL Inbound Webhook (the "Newsletter" workflow); "source" tells them apart.
// Both send name (full name) + email.
(function () {
  // Paste the "Newsletter" workflow's Inbound Webhook URL between the quotes:
  var NEWSLETTER_WEBHOOK = "https://services.leadconnectorhq.com/hooks/EvjnO4xt4AwXVkc2EZ1T/webhook-trigger/d608ebbf-cede-45c4-80c2-5a1e98bcc8cc";
  var WEBHOOKS = {
    "homepage-newsletter": NEWSLETTER_WEBHOOK,
    "footer-newsletter": NEWSLETTER_WEBHOOK
  };

  var loadedAt = Date.now();

  function wire(form) {
    var button = form.querySelector("button[type=submit]");
    var buttonText = button.textContent;
    var status = form.parentNode.querySelector(".form-status");
    var source = form.getAttribute("data-aip-newsletter");
    var webhook = WEBHOOKS[source];

    function show(kind, message) {
      if (!status) return;
      status.className = "form-status is-" + kind;
      status.textContent = message;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      // Spam bots fill the hidden field and submit instantly. Only block when both happen, so a browser
      // or password manager that auto-fills the hidden field can't silently stop a real sign-up.
      if (form.querySelector(".aipf-hp input").value && Date.now() - loadedAt < 3000) return;

      if (!webhook || webhook.indexOf("https://") !== 0) {
        show("error", "This form isn't connected yet. Add its GHL webhook link in newsletter.js to start receiving sign-ups.");
        return;
      }

      var data = new URLSearchParams();
      var fields = form.querySelectorAll("input[name]:not([name=aipf_hp_check])");
      for (var i = 0; i < fields.length; i++) data.append(fields[i].name, fields[i].value.trim());
      data.append("source", source);
      data.append("page", window.location.href);

      button.disabled = true;
      button.textContent = "Sending…";
      fetch(webhook, { method: "POST", mode: "no-cors", body: data })
        .then(function () {
          form.reset();
          show("success", "Thank you! You're on the list. Watch your inbox for tips from Anya.");
        })
        .catch(function () {
          show("error", "Something went wrong. Please try again in a moment.");
        })
        .then(function () {
          button.disabled = false;
          button.textContent = buttonText;
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var forms = document.querySelectorAll("form[data-aip-newsletter]");
    for (var i = 0; i < forms.length; i++) wire(forms[i]);
  });
})();
