import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabase-config.js";

const langToggle = document.getElementById("lang-toggle");
const translateElements = document.querySelectorAll(".translate");
const orderForm = document.getElementById("secureOrderForm");
const itemSelect = document.getElementById("itemSelect");
const priceAmount = document.getElementById("price-amount");
const fileInput = document.getElementById("fileInput");
const fileNameDisplay = document.getElementById("file-name-display");
const formStatus = document.getElementById("form-status");
const submitButton = orderForm.querySelector('button[type="submit"]');

const priceMap = { mug: 15, tops: 25, tumbler: 25, headwear: 12, other: 20 };
let currentLang = "en";
const configured = !SUPABASE_URL.includes("YOUR_PROJECT_ID")
    && !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const messages = {
    en: {
        missingConfig: "Online ordering is not configured yet. Please contact the shop directly.",
        invalidImage: "Please choose an image file.",
        tooLarge: "Image must be 8 MB or smaller.",
        sending: "Submitting your request...",
        success: "Your request was submitted. The shop will contact you to confirm the details.",
        failure: "We couldn't submit your request. Please try again or contact the shop directly.",
        imageFailure: "Your request could not be saved with its image. Please try again or submit without the image.",
        imageHelp: "Your request and optional reference image will be submitted for the shop to review."
    },
    es: {
        missingConfig: "Los pedidos en línea aún no están configurados. Comunícate directamente con la tienda.",
        invalidImage: "Por favor, elige un archivo de imagen.",
        tooLarge: "La imagen debe pesar 8 MB o menos.",
        sending: "Enviando tu solicitud...",
        success: "Tu solicitud fue enviada. La tienda se comunicará contigo para confirmar los detalles.",
        failure: "No pudimos enviar tu solicitud. Inténtalo de nuevo o comunícate con la tienda.",
        imageFailure: "No se pudo guardar tu solicitud con la imagen. Inténtalo de nuevo o envía la solicitud sin la imagen.",
        imageHelp: "Tu solicitud y la imagen de referencia opcional se enviarán para que la tienda las revise."
    }
};

function showStatus(message, kind = "success") {
    formStatus.className = "status-msg " + (kind === "error" ? "error-msg" : "success-msg");
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
        fileNameDisplay.textContent = messages[currentLang].invalidImage;
    } else if (file.size > 8 * 1024 * 1024) {
        fileInput.value = "";
        fileNameDisplay.textContent = messages[currentLang].tooLarge;
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

orderForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!orderForm.reportValidity()) return;
    if (!configured) {
        showStatus(messages[currentLang].missingConfig, "error");
        return;
    }

    const file = fileInput.files[0];
    if (file && (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024)) {
        showStatus(file.size > 8 * 1024 * 1024 ? messages[currentLang].tooLarge : messages[currentLang].invalidImage, "error");
        return;
    }

    const orderId = crypto.randomUUID();
    const order = {
        id: orderId,
        customer_name: document.getElementById("nameInput").value.trim(),
        customer_email: document.getElementById("emailInput").value.trim(),
        item_type: itemSelect.value,
        design_description: document.getElementById("descInput").value.trim() || null,
        status: "pending",
        reference_image_path: file ? `${orderId}/${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}` : null
    };

    submitButton.disabled = true;
    submitButton.textContent = messages[currentLang].sending;
    formStatus.style.display = "none";

    try {
        // Upload to a private bucket first; the order row stores only the private object path.
        if (file) {
            const { error: uploadError } = await supabase.storage
                .from("order-references")
                .upload(order.reference_image_path, file, { contentType: file.type, upsert: false });
            if (uploadError) throw uploadError;
        }

        const { error: insertError } = await supabase.from("orders").insert(order);
        if (insertError) throw insertError;

        orderForm.reset();
        fileNameDisplay.textContent = "";
        fileNameDisplay.style.display = "none";
        priceAmount.textContent = "$0.00";
        priceAmount.parentElement.style.opacity = "0.5";
        showStatus(messages[currentLang].success);
    } catch (error) {
        console.error("Order submission failed:", error);
        showStatus(file ? messages[currentLang].imageFailure : messages[currentLang].failure, "error");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = currentLang === "en" ? "Submit Order Request" : "Enviar Solicitud";
    }
});
