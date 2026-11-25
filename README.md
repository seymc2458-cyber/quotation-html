# Quotation Maker (plain HTML)

Three files, no install, no build:

- `index.html`
- `style.css`
- `app.js`

## Run in Visual Studio Code

Easiest: install the **Live Server** extension, right-click `index.html` → **Open with Live Server**.
You can also just double-click `index.html` (needs internet for the PDF library and Khmer font).

## Host on Vercel

**Option A – drag and drop (no Git):**
1. Go to https://vercel.com/new and choose to upload / use the CLI, or run in this folder:
   `npx vercel` then answer the questions (Framework: **Other**, no build command).
2. For production: `npx vercel --prod`

**Option B – GitHub:**
1. Push this folder to GitHub.
2. https://vercel.com/new → import the repo → Framework Preset **Other** → Deploy.
   (Leave Build Command and Output Directory empty.)

## Notes

- **Save PDF** downloads an A4 PDF that matches the preview. **Print** → "Save as PDF" also works.
- **Save** keeps quotations in the browser you used (localStorage).
- The page needs internet for the html2canvas / jsPDF libraries and the Khmer font.
