# Dianita's Shop

A bilingual (English/Spanish) custom-creations shop website hosted with GitHub Pages.

## Order requests

The custom order form prepares a message and opens WhatsApp using the shop's number. The customer reviews the message and presses **Send** in WhatsApp. The website does not automatically send messages or store customer submissions.

### Configure the shop's WhatsApp number

1. Open `order-form.js`.
2. Find `WHATSAPP_NUMBER` near the top.
3. Replace `ADD_DIANITAS_WHATSAPP_NUMBER` with the shop's number in international format using digits only.
   - Example format for a US number: `15551234567`
   - Do not include a plus sign, spaces, parentheses, or dashes.
4. Save and commit the change, then test the order form on the live site.

### Reference images

The browser cannot attach a selected local file to a WhatsApp message automatically. Customers are instructed to attach the reference image manually after WhatsApp opens. The selected filename is included in the form UI only; the image itself is not uploaded or transmitted by the website.

## Local preview

Open `index.html` in a browser or use a local static development server.

## Launch checklist

- [ ] Replace the WhatsApp number placeholder in `order-form.js`.
- [ ] Test the English and Spanish language toggle.
- [ ] Submit a test order and confirm the message opens to the correct WhatsApp account.
- [ ] Confirm the customer can manually attach a reference image.
- [ ] Review all product prices and shop contact details with the owner.

## Hosting

The site is a static HTML, CSS, and JavaScript project deployed through GitHub Pages. No database or admin dashboard is required for this WhatsApp order workflow.
