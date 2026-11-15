// Replace this with Dianita's WhatsApp number in international format, digits only.
// Example for a US number: 15551234567 (do not include +, spaces, or dashes).
const WHATSAPP_NUMBER = "ADD_DIANITAS_WHATSAPP_NUMBER";

const langToggle = document.getElementById("lang-toggle");
const translateElements = document.querySelectorAll(".translate");
const orderForm = document.getElementById("secureOrderForm");
const itemSelect = document.getElementById("itemSelect");
const priceAmount = document.getElementById("price-amount");
const fileInput = document.getElementById("fileInput");
const fileNameDisplay = document.getElementById("file-name-display");
const formStatus = document.getElementById("form-status");

const priceMap = { mug: 15, tops: 25, tumbler: 25, headwear: 12, other: 20 };
let currentLang = "en";

const itemLabels = {
  en: {
    mug: "Custom Mug",
    tops: "Tops (Shirts/Jerseys)",
    tumbler: "Tumbler",
    headwear: "Headwear (Bows/Hats)",
    other: "Other / Sign"
  },
  es: {
    mug: "Taza personalizada",
    tops: "Ropa (camisetas/jerseys)",
    tumbler: "Vaso térmico",
    headwear: "Accesorios (lazos/gorras)",
    other: "Otro / Letrero"
  }
};

function showStatus(message, isError = false) {
  formStatus.className = "status-msg " + (isError ? "error-msg" : "success-msg");
  formStatus.textContent = message;
  formStatus.style.display = "block";
}

langToggle.addEventListener("click", () => {
  currentLang = currentLang === "en" ? "es" : "en";
  langToggle.innerText = currentLang === "en" ? "ES" : "EN";
  document.documentElement.lang = currentLang;
  translateElements.forEach((element) => {
    const translated = element.getAttribute(`data-${currentLang}`);
    if (translated) element.innerText = translated;
  });
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) {
    fileNameDisplay.textContent = "";
    fileNameDisplay.style.display = "none";
    return;
  }

  if (!file.type.startsWith("image/")) {
    fileInput.value = "";
    fileNameDisplay.textContent = currentLang === "en"
      ? "Please choose an image file."
      : "Por favor, elige un archivo de imagen.";
  } else if (file.size > 8 * 1024 * 1024) {
    fileInput.value = "";
    fileNameDisplay.textContent = currentLang === "en"
      ? "Image must be 8 MB or smaller."
      : "La imagen debe pesar 8 MB o menos.";
  } else {
    fileNameDisplay.textContent = file.name;
  }
  fileNameDisplay.style.display = "block";
});

itemSelect.addEventListener("change", () => {
  const value = itemSelect.value;
  priceAmount.textContent = value ? `$${priceMap[value].toFixed(2)}` : "$0.00";
  priceAmount.parentElement.style.opacity = value ? "1" : "0.5";
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!orderForm.reportValidity()) return;

  if (!/^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
    showStatus(
      currentLang === "en"
        ? "WhatsApp ordering is not configured yet. Please contact the shop directly."
        : "Los pedidos por WhatsApp aún no están configurados. Comunícate directamente con la tienda.",
      true
    );
    return;
  }

  const name = document.getElementById("nameInput").value.trim();
  const email = document.getElementById("emailInput").value.trim();
  const description = document.getElementById("descInput").value.trim();
  const item = itemLabels[currentLang][itemSelect.value];
  const estimate = priceMap[itemSelect.value].toFixed(2);
  const imageNote = fileInput.files.length
    ? (currentLang === "en"
      ? "I will attach my reference image in this WhatsApp chat."
      : "Adjuntaré mi imagen de referencia en este chat de WhatsApp.")
    : (currentLang === "en"
      ? "No reference image selected."
      : "No seleccioné una imagen de referencia.");

  const message = currentLang === "en"
    ? `Hello Dianita's Shop! I'd like to request a custom item.

Name: ${name}
Email: ${email}
Item: ${item}
Estimated starting price: $${estimate}
Design details: ${description || "Not provided"}
Reference image: ${imageNote}

I understand this is a starting estimate and would like to confirm the final quote.`
    : `¡Hola, Dianita's Shop! Quisiera solicitar un artículo personalizado.

Nombre: ${name}
Correo: ${email}
Artículo: ${item}
Precio inicial estimado: $${estimate}
Detalles: ${description || "No proporcionados"}
Imagen de referencia: ${imageNote}

Entiendo que este es un precio inicial y quisiera confirmar la cotización final.`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");

  showStatus(
    currentLang === "en"
      ? "WhatsApp opened with your request. Review it, attach your image if applicable, and press Send in WhatsApp."
      : "WhatsApp se abrió con tu solicitud. Revísala, adjunta tu imagen si corresponde y presiona Enviar."
  );
});
