/*
  AIP WELLNESS — FOOTER NEWSLETTER FORM (email only, for the dark navy footer)
  FILE 3 of 3: form.js
  Paste into GHL Page Settings > Tracking Code > Footer Code (or Settings > Tracking Code for the whole site),
  wrapped like this:   <script>  ...this file...  </script>
  It only runs on pages that contain the form, so it is safe to add site-wide.

  TO CONNECT IT TO GHL (one-time setup):
  1. Automation > Workflows > Create Workflow > Start from scratch.
  2. Add the trigger "Inbound Webhook" and copy the webhook URL it gives you.
  3. Paste that URL below where it says [PLACEHOLDER GHL webhook URL] (keep the quotes).
  4. Submit the form once on your live page, then in the workflow click "Fetch sample request".
  5. Add a "Create/Update Contact" action and map the fields: email. Add a tag such as "newsletter".
  6. Save and publish the workflow.
  Until step 3 is done, the form shows a message that it isn't connected yet.

  Fields sent: email, plus "source" (footer-newsletter) and "page" (the page address).
*/
(function () {
  // Paste your GHL Inbound Webhook URL between the quotes:
  var WEBHOOK_URL = "[PLACEHOLDER GHL webhook URL]";
  var SOURCE = "footer-newsletter";

  function init() {
  var root = document.getElementById("aip-form-footer");
  if (!root || root.getAttribute("data-ready")) return;
  root.setAttribute("data-ready", "1");
  var form = root.querySelector("form");
  var button = form.querySelector("button[type=submit]");
  var status = root.querySelector(".aipf-status");
  var buttonText = button.textContent;

  function show(kind, message) {
    status.className = "aipf-status is-" + kind;
    status.textContent = message;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (form.querySelector(".aipf-hp input").value) return; // spam bot filled the hidden field

    if (WEBHOOK_URL.indexOf("https://") !== 0) {
      show("error", "This form isn't connected yet. Add your GHL webhook link to the code to start receiving submissions.");
      return;
    }

    var data = new URLSearchParams();
    var fields = form.querySelectorAll("[data-field]");
    for (var i = 0; i < fields.length; i++) data.append(fields[i].name, fields[i].value.trim());
    data.append("source", SOURCE);
    data.append("page", window.location.href);

    button.disabled = true;
    button.textContent = "Sending\u2026";
    fetch(WEBHOOK_URL, { method: "POST", mode: "no-cors", body: data })
      .then(function () {
        form.reset();
        show("success", "You're on the list! Watch your inbox for tips from Anya.");
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
