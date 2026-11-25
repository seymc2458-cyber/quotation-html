/* Quotation Maker - plain JavaScript, no build step. */

const KEY_DRAFT = "quotation:draft";
const KEY_SAVED = "quotation:saved";

const $ = (s, r = document) => r.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const todayISO = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};
const fmtDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
const lineTotal = (it) => num(it.qty) * num(it.price);
const money = (n, sym = "$") =>
  `${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}${sym}`;
const lines = (t) => String(t || "").split("\n").map((s) => s.trim()).filter(Boolean);

const blankItem = () => ({ id: uid(), description: "", qty: "1", unit: "", price: "" });
const item = (description, qty, unit, price) => ({
  id: uid(), description, qty: String(qty), unit, price: String(price),
});

const nextQuoteNo = (no = "") => {
  const m = String(no).match(/^(.*?)(\d+)(\D*)$/);
  if (!m) return "#00001";
  return `${m[1]}${String(Number(m[2]) + 1).padStart(m[2].length, "0")}${m[3]}`;
};

/* The example from the PDF, so the page opens with something to preview. */
const sampleQuote = () => ({
  id: uid(),
  language: "en",
  quoteNo: "#00445",
  date: todayISO(),
  validity: "1month",
  preparedBy: "Hok Visal",
  phone: "(+855) 85 522 380",
  email: "visalhok@gmail.com",
  address: "Phum Kvar;Sangkat Dangkoa;Khan Dangkoa; Phnom Penh",
  customerName: "Ouk Chanmeanrith",
  customerAddress: "Phnom Penh ; Cambodia",
  customerPhone: "(+855) 11 718 185",
  currencySymbol: "$",
  currencyName: "Dollar",
  items: [
    item("ប្រអប់ពណ៌ខ្មៅ 50cm*70cm", 1, "", 65),
    item("ប្រអប់ឌីសុងទ័រ 2p-4p", 1, "", 3),
    item("Insulator 40A(Hanger)", 1, "", 19),
    item("RCBO 40A (hanger)", 1, "", 35),
    item("ខ្សែភ្លើង 2*10mm²", 3, "m", 3.5),
    item("ខ្សែដី 1*4mm²", 2, "m", 1.5),
    item("ដែកទែរ(ម៉ាសដី) 1.8m", 1, "", 7),
    item("ក្រចាប់ទែរ", 1, "", 2),
    item("ស្រោមការពារខ្សែសាក", 1, "set", 6),
    item("ទុយោភ្លើងនិងគ្រឿងផ្សេងៗ", 1, "set", 10),
    item("ឆ្នាំងសាក 7kw type2 plug&charge", 1, "", 199),
    item("ខ្សែភ្លើង 2 * 10mm²", 13, "m", 3.5),
    item("CB 2*32A(schneider)", 1, "", 15),
    item("នាឡិកាស្ទង់ឌីជីថល", 1, "", 20),
  ],
  serviceFee: "70",
  showGrandTotal: false,
  timePeriod: "According to available time for working only 8am-5pm. We expect to complete this job during 1day.",
  scope: "Installation service; testing resistance ohm for earth",
  note: "This quotation is for location project in Phnom Penh",
  warranty: "6months",
  payment: "50% when the quotation is approved\n50% more after finished project",
  acceptedBy: "Ouk Chanmeanrith",
  signature: "",
});

const blankQuote = (prev) => ({
  ...prev,
  id: uid(),
  quoteNo: nextQuoteNo(prev.quoteNo),
  date: todayISO(),
  customerName: "",
  customerAddress: "",
  customerPhone: "",
  items: [blankItem()],
  serviceFee: "",
  acceptedBy: "",
});

const calc = (q) => {
  const subtotal = q.items.reduce((s, i) => s + lineTotal(i), 0);
  const service = num(q.serviceFee);
  return { subtotal, service, grand: subtotal + service };
};

/* ---------- Storage ---------- */
const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const store = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
};

let q = load(KEY_DRAFT, null) || sampleQuote();
let saved = load(KEY_SAVED, []);

/* ---------- The quotation document ---------- */
function info(rows, lw) {
  return `<div class="info" style="--lw:${lw}">` +
    rows.filter((r) => r[1]).map(([k, v]) =>
      `<div class="info-row"><span>${k}</span><span>: ${esc(v)}</span></div>`).join("") +
    `</div>`;
}

function quoteHTML(q) {
  const sym = q.currencySymbol || "$";
  const t = calc(q);
  const time = lines(q.timePeriod);
  const pay = lines(q.payment);
  const khmer = q.language === "km";
  const text = khmer ? {
    title: "ប័ណ្ណសម្រង់តម្លៃ",
    prepared: "រៀបចំដោយ",
    tel: "ទូរស័ព្ទ",
    email: "អ៊ីមែល",
    address: "អាសយដ្ឋាន",
    date: "កាលបរិច្ឆេទ",
    validity: "រយៈពេល",
    quoteNo: "លេខ",
    customer: "អតិថិជន",
    name: "ឈ្មោះ",
    item: "ល.រ",
    description: "បរិយាយ",
    qty: "ចំនួន",
    unitPrice: "តម្លៃ",
    amount: "ទឹកប្រាក់",
    total: "សរុប",
    service: "ថ្លៃសេវា",
    grand: "សរុបរួម",
    timePeriod: "រយៈពេល",
    scope: "ទំហំការងារ",
    note: "កំណត់ចំណាំ",
    currency: "រូបិយប័ណ្ណ",
    warranty: "ការធានា",
    payment: "ការទូទាត់",
    preparedBy: "រៀបចំដោយ",
    acceptedBy: "យល់ព្រម និង ទទួល"
  } : {
    title: "QUOTATION",
    prepared: "Prepare by",
    tel: "Tel",
    email: "Email",
    address: "Address",
    date: "Date",
    validity: "Validity",
    quoteNo: "Quote No.",
    customer: "CUSTOMER",
    name: "Name",
    item: "Item",
    description: "Description",
    qty: "Qty.",
    unitPrice: "Unit Price",
    amount: "Amount",
    total: "Total Amount",
    service: "Service",
    grand: "Grand Total",
    timePeriod: "Time period",
    scope: "Scope of work",
    note: "Note",
    currency: "Currency",
    warranty: "Warranty",
    payment: "Payment",
    preparedBy: "Prepared By",
    acceptedBy: "Agreed & Accepted by"
  };

  const rows = q.items.map((it, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${esc(it.description)}</td>
      <td>${esc(it.qty)}${esc(it.unit)}</td>
      <td>${it.price !== "" ? money(it.price, sym) : ""}</td>
      <td>${it.price !== "" ? money(lineTotal(it), sym) : ""}</td>
    </tr>`).join("");

  return `
  <div class="quote-page">
    <h1 class="q-title">${text.title}</h1>
    <div class="q-head">
      ${info([[text.prepared, q.preparedBy], [text.tel, q.phone], [text.email, q.email], [text.address, q.address]], "22mm")}
      ${info([[text.date, fmtDate(q.date)], [text.validity, q.validity], [text.quoteNo, q.quoteNo]], "20mm")}
    </div>
    <div class="q-rule"></div>
    <div class="q-customer">
      <div>${text.customer}</div>
      ${info([[text.name, q.customerName], [text.address, q.customerAddress], [text.tel, q.customerPhone]], "22mm")}
    </div>

    <table class="q-table">
      <thead><tr>
        <th style="width:9%">${text.item}</th><th>${text.description}</th>
        <th style="width:12%">${text.qty}</th><th style="width:15%">${text.unitPrice}</th><th style="width:15%">${text.amount}</th>
      </tr></thead>
      <tbody>
        ${rows}
        <tr class="sum"><td colspan="4">${text.total}</td><td>${money(t.subtotal, sym)}</td></tr>
        ${q.serviceFee !== "" ? `<tr class="sum"><td colspan="4">${text.service}</td><td>${money(t.service, sym)}</td></tr>` : ""}
        ${q.showGrandTotal ? `<tr class="sum grand"><td colspan="4">${text.grand}</td><td>${money(t.grand, sym)}</td></tr>` : ""}
      </tbody>
    </table>

    <div class="q-terms">
      ${time.length ? `<div>${text.timePeriod}:</div><ol>${time.map((l) => `<li>${esc(l)}</li>`).join("")}</ol>` : ""}
      ${q.scope ? `<div>${text.scope}: ${esc(q.scope)}</div>` : ""}
      ${q.note ? `<div>${text.note}: ${esc(q.note)}</div>` : ""}
      <ol class="q-notes">
        ${q.currencyName ? `<li>${text.currency} : ${esc(q.currencyName)}</li>` : ""}
        ${q.warranty ? `<li>${text.warranty} : ${esc(q.warranty)}</li>` : ""}
        ${pay.length ? `<li>${text.payment} : ${esc(pay[0])}${pay.slice(1).map((l) => `<div>: ${esc(l)}</div>`).join("")}</li>` : ""}
      </ol>
    </div>

    <div class="q-sign">
      <div>
        <div>${text.preparedBy}: ${esc(q.preparedBy)}</div>
        <div class="sig-box">${q.signature ? `<img src="${q.signature}" alt="" />` : ""}</div>
        <div class="sig-line"></div>
      </div>
      <div>
        <div>${text.acceptedBy}: ${esc(q.acceptedBy)}</div>
        <div class="sig-box"></div>
        <div class="sig-line"></div>
      </div>
    </div>
  </div>`;
}

/* ---------- Rendering ---------- */
function renderPreview() {
  const html = quoteHTML(q);
  $("#quote").innerHTML = html;
  $("#pdf-source").innerHTML = html;
  const t = calc(q);
  const sym = q.currencySymbol || "$";
  $("#t-sub").textContent = money(t.subtotal, sym);
  $("#t-srv").textContent = money(t.service, sym);
  $("#t-grand").textContent = money(t.grand, sym);
  store(KEY_DRAFT, q);
}

function renderItems() {
  const sym = q.currencySymbol || "$";
  $("#items").innerHTML = q.items.map((it, i) => `
    <div class="item" data-i="${i}">
      <div class="item-top">
        <b>#${i + 1}</b>
        <div class="item-btns">
          <button class="icon" data-act="up" ${i === 0 ? "disabled" : ""} title="Move up">↑</button>
          <button class="icon" data-act="down" ${i === q.items.length - 1 ? "disabled" : ""} title="Move down">↓</button>
          <button class="icon danger" data-act="del" ${q.items.length === 1 ? "disabled" : ""} title="Remove">✕</button>
        </div>
      </div>
      <input class="full" data-f="description" placeholder="Description (Khmer or English)" value="${esc(it.description)}" />
      <div class="item-nums">
        <label class="field"><span>Qty</span><input type="number" min="0" step="any" data-f="qty" value="${esc(it.qty)}" /></label>
        <label class="field"><span>Unit</span><input list="units" placeholder="m, set…" data-f="unit" value="${esc(it.unit)}" /></label>
        <label class="field"><span>Unit price</span><input type="number" min="0" step="any" data-f="price" value="${esc(it.price)}" /></label>
        <div class="amt"><span>Amount</span><b data-amt>${money(lineTotal(it), sym)}</b></div>
      </div>
    </div>`).join("");
}

function renderSaved() {
  const box = $("#saved");
  if (!saved.length) {
    box.innerHTML = `<p class="muted">Nothing saved yet. Press “Save” in the top bar.</p>`;
    return;
  }
  box.innerHTML = saved.map((s) => `
    <div class="saved" data-id="${s.id}">
      <div><b>${esc(s.quoteNo)}</b> ${esc(s.customerName) || "(no customer)"}
        <div class="muted">${money(calc(s).grand, s.currencySymbol || "$")} incl. service</div></div>
      <div class="item-btns">
        <button class="small" data-act="open">Open</button>
        <button class="small danger" data-act="delete">Delete</button>
      </div>
    </div>`).join("");
}

function fillForm() {
  document.querySelectorAll("#form [data-k]").forEach((el) => {
    const v = q[el.dataset.k];
    if (el.type === "checkbox") el.checked = !!v;
    else el.value = v ?? "";
  });
  $("#lang-select").value = q.language || "en";
  renderItems();
  renderSaved();
  renderPreview();
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (el.hidden = true), 2200);
}

/* ---------- Events ---------- */
$("#form").addEventListener("input", (e) => {
  const el = e.target;
  if (el.dataset.k) {
    const k = el.dataset.k;
    const v = el.type === "checkbox" ? el.checked : el.value;
    if (k === "customerName" && q.acceptedBy === q.customerName) {
      q.acceptedBy = v;
      $('[data-k="acceptedBy"]').value = v;
    }
    q[k] = v;
    if (k === "currencySymbol") renderItems();
    renderPreview();
    return;
  }
  if (el.dataset.f) {
    const card = el.closest(".item");
    const it = q.items[Number(card.dataset.i)];
    it[el.dataset.f] = el.value;
    card.querySelector("[data-amt]").textContent = money(lineTotal(it), q.currencySymbol || "$");
    renderPreview();
  }
});

$("#items").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const i = Number(btn.closest(".item").dataset.i);
  const act = btn.dataset.act;
  if (act === "del" && q.items.length > 1) q.items.splice(i, 1);
  if (act === "up" && i > 0) [q.items[i - 1], q.items[i]] = [q.items[i], q.items[i - 1]];
  if (act === "down" && i < q.items.length - 1) [q.items[i + 1], q.items[i]] = [q.items[i], q.items[i + 1]];
  renderItems();
  renderPreview();
});

$("#btn-add").addEventListener("click", () => {
  q.items.push(blankItem());
  renderItems();
  renderPreview();
  $("#items").lastElementChild.querySelector("input").focus();
});

$("#btn-new").addEventListener("click", () => {
  if (!confirm("Start a new quotation? Save the current one first if you need it.")) return;
  q = blankQuote(q);
  fillForm();
});
$("#btn-sample").addEventListener("click", () => {
  if (!confirm("Replace the current form with the sample from your PDF?")) return;
  q = sampleQuote();
  fillForm();
});

$("#btn-save").addEventListener("click", () => {
  const i = saved.findIndex((x) => x.id === q.id);
  const copy = JSON.parse(JSON.stringify(q));
  if (i >= 0) saved[i] = copy; else saved.unshift(copy);
  store(KEY_SAVED, saved);
  renderSaved();
  toast("Saved to this browser");
});

$("#saved").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const id = btn.closest(".saved").dataset.id;
  if (btn.dataset.act === "open") {
    q = JSON.parse(JSON.stringify(saved.find((x) => x.id === id)));
    fillForm();
    setTab("edit");
  } else {
    if (!confirm("Delete this saved quotation?")) return;
    saved = saved.filter((x) => x.id !== id);
    store(KEY_SAVED, saved);
    renderSaved();
  }
});

/* Signature image (shrunk so it stays small in browser storage) */
$("#sig-file").addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 500 / img.width);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      q.signature = c.toDataURL("image/png");
      renderPreview();
    };
    img.onerror = () => toast("Could not read that image");
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
  e.target.value = "";
});
$("#sig-remove").addEventListener("click", () => {
  q.signature = "";
  renderPreview();
});

$("#lang-select").addEventListener("change", (e) => {
  q.language = e.target.value;
  renderPreview();
});

/* Tabs (small screens) */
function setTab(name) {
  document.body.dataset.tab = name;
  $("#tab-edit").classList.toggle("on", name === "edit");
  $("#tab-preview").classList.toggle("on", name === "preview");
  fitPreview();
}
$("#tab-edit").addEventListener("click", () => setTab("edit"));
$("#tab-preview").addEventListener("click", () => setTab("preview"));

/* Fit the A4 preview to the available width */
function fitPreview() {
  const pane = $("#pane");
  if (!pane.clientWidth) return;
  const z = Math.min(1, Math.max(0.3, (pane.clientWidth - 32) / 794));
  $("#zoom").style.zoom = z;
}
new ResizeObserver(fitPreview).observe($("#pane"));
window.addEventListener("resize", fitPreview);

/* ---------- Save PDF (looks like the preview / your PDF) ---------- */
function fileName() {
  const clean = (s) => String(s || "").replace(/[\\/:*?"<>|#]+/g, "").trim().replace(/\s+/g, "-");
  return ["Quotation", clean(q.quoteNo), clean(q.customerName)].filter(Boolean).join("-");
}

function downloadPdfBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.rel = "noopener";
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  toast(isIOS ? "PDF opened — use Share to download" : "PDF downloaded");
}

$("#btn-pdf").addEventListener("click", async () => {
  const btn = $("#btn-pdf");
  const el = $("#pdf-source .quote-page");
  if (!el) return;
  btn.disabled = true;
  btn.textContent = "Creating…";
  try {
    await document.fonts.ready;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const pageW = 210, pageH = 297;
    const imgH = (canvas.height * pageW) / canvas.width;
    const img = canvas.toDataURL("image/png");
    let remaining = imgH, y = 0;
    pdf.addImage(img, "PNG", 0, y, pageW, imgH);
    remaining -= pageH;
    while (remaining > 1) {
      y -= pageH;
      pdf.addPage();
      pdf.addImage(img, "PNG", 0, y, pageW, imgH);
      remaining -= pageH;
    }
    const name = fileName() + ".pdf";
    const blob = pdf.output("blob");
    const file = new File([blob], name, { type: "application/pdf" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: name });
        toast("PDF ready");
      } catch (err) {
        if (err.name !== "AbortError") downloadPdfBlob(blob, name);
      }
    } else {
      downloadPdfBlob(blob, name);
    }
  } catch (err) {
    console.error(err);
    toast("PDF failed. Try the Print button instead.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save PDF";
  }
});

$("#btn-print").addEventListener("click", () => {
  const old = document.title;
  document.title = fileName();
  window.addEventListener("afterprint", () => (document.title = old), { once: true });
  window.print();
});

/* ---------- Start ---------- */
fillForm();
fitPreview();
