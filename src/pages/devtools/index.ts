import Browser from "webextension-polyfill";
document.body.style.backgroundColor = "#f0f0f0";
Browser.devtools.panels
  .create("Dev Tools", "icon-32.png", "src/pages/devtools/index.html")
  .catch(console.error);
