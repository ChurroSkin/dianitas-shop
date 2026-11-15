# Dianita's Shop by DJ's

A bilingual (English/Spanish) static website for a custom creations shop. Hosted with GitHub Pages.

## Current stack
- HTML pages: `index.html`, `story.html`, `gallery.html`
- CSS: `style.css`
- Vanilla JavaScript for language switching, estimated starting prices, and WhatsApp order-message generation
- GitHub Pages hosting

## WhatsApp order setup

The order form currently prepares a message and opens WhatsApp. The customer must review and press **Send** in WhatsApp; opening WhatsApp does not submit an order automatically.

Before enabling orders, edit `index.html` and replace:

```js
const WHATSAPP_NUMBER = "ADD_DIANITAS_WHATSAPP_NUMBER";
```

with the shop's WhatsApp number in international format using digits only (country code + number; no plus sign, spaces, or punctuation). For a US number, this normally starts with `1`.

Then test on a phone and desktop:
1. Submit a valid test request.
2. Confirm WhatsApp opens the correct shop conversation.
3. Confirm the prefilled message includes the customer's name, email, item, estimate, and design details.
4. If a reference image is selected, attach it manually in WhatsApp before sending.
5. Confirm the shop receives the message.

The reference image is **not uploaded by the website**. A normal `wa.me` link cannot attach a local file automatically. The form validates that the selected file is an image no larger than 8 MB and reminds the customer to attach it in the chat.

## Important business configuration

- The starting prices in `index.html` are sample values inherited from the existing site. Confirm them with the shop owner before accepting real orders.
- Update the social links and business details after confirming the correct accounts and information.
- Do not describe the form as secure order storage: it sends no data to a website server or database.
- The live `main` branch is intentionally unchanged while this feature is reviewed.

## Development preview

This is a static site. Open `index.html` in a browser or use a local static server. GitHub Pages can publish the branch after the owner reviews and merges the changes.
