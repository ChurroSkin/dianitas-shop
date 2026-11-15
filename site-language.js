// Keep the language choice when customers move between pages.
const languageKey = "dianitas-language";
function setLanguage(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll(".translate").forEach((el) => {
    const text = el.getAttribute("data-" + lang);
    if (text !== null) el.textContent = text;
  });
  const toggle = document.getElementById("lang-toggle");
  if (toggle) toggle.textContent = lang === "en" ? "ES" : "EN";
  try { localStorage.setItem(languageKey, lang); } catch (_) {}
}
let currentLanguage = "en";
try { currentLanguage = localStorage.getItem(languageKey) === "es" ? "es" : "en"; } catch (_) {}
setLanguage(currentLanguage);
document.getElementById("lang-toggle")?.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "es" : "en";
  setLanguage(currentLanguage);
});
