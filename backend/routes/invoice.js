const express = require("express");
const { Calculation, User } = require("../models");

const router = express.Router();

// ── Generate printable HTML invoice ──────────────────────
router.get("/:id", async (req, res) => {
    try {
        const calc = await Calculation.findByPk(req.params.id, {
            include: [{ model: User, attributes: ["name", "business_name", "gstin"] }],
        });

        if (!calc) {
            return res.status(404).json({ error: "Calculation not found" });
        }

        const c = calc.toJSON();
        const isInterState = parseFloat(c.igst) > 0;
        const invoiceDate = new Date(c.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric",
        });
        const invoiceNo = `GST-${c.id.split("-")[0].toUpperCase()}`;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>GST Invoice — ${invoiceNo}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a2e; padding: 40px; background: #fff; }
  .invoice { max-width: 800px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #6c63ff; padding-bottom: 20px; margin-bottom: 30px; }
  .brand h1 { font-size: 28px; color: #6c63ff; }
  .brand p { color: #666; font-size: 13px; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 22px; color: #333; margin-bottom: 8px; }
  .invoice-meta p { font-size: 13px; color: #666; }
  .parties { display: flex; gap: 40px; margin-bottom: 30px; }
  .party { flex: 1; }
  .party h4 { font-size: 12px; text-transform: uppercase; color: #6c63ff; letter-spacing: 1px; margin-bottom: 8px; }
  .party p { font-size: 14px; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
  th { background: #6c63ff; color: #fff; text-align: left; padding: 10px 14px; font-size: 13px; }
  td { padding: 10px 14px; border-bottom: 1px solid #eee; font-size: 14px; }
  tr:nth-child(even) td { background: #f8f8ff; }
  .summary { display: flex; justify-content: flex-end; }
  .summary-table { width: 320px; }
  .summary-table td { padding: 8px 14px; }
  .summary-table .label { color: #666; font-size: 13px; }
  .summary-table .value { text-align: right; font-weight: 500; }
  .summary-table .grand-total { border-top: 2px solid #6c63ff; font-size: 18px; font-weight: 700; color: #6c63ff; }
  .rcm-notice { background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 12px 16px; margin-bottom: 25px; font-size: 13px; color: #856404; }
  .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px; }
  @media print { body { padding: 20px; } .no-print { display: none; } }
</style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <div class="brand">
      <h1>🧾 GST Guru</h1>
      <p>Dynamic GST Calculation System</p>
    </div>
    <div class="invoice-meta">
      <h2>TAX INVOICE</h2>
      <p><strong>Invoice #:</strong> ${invoiceNo}</p>
      <p><strong>Date:</strong> ${invoiceDate}</p>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <h4>From</h4>
      <p><strong>${c.User?.business_name || "GST Guru User"}</strong></p>
      ${c.User?.gstin ? `<p>GSTIN: ${c.User.gstin}</p>` : ""}
      <p>${c.User?.name || ""}</p>
    </div>
    <div class="party">
      <h4>Transaction Details</h4>
      <p><strong>Type:</strong> ${c.transaction_type}</p>
      <p><strong>Supply:</strong> ${isInterState ? "Inter-State (IGST)" : "Intra-State (CGST + SGST)"}</p>
      ${c.reverse_charge ? '<p style="color:#e65100;"><strong>⚠ Reverse Charge Applicable</strong></p>' : ""}
    </div>
  </div>

  ${c.reverse_charge ? '<div class="rcm-notice">⚠️ This invoice is issued under the <strong>Reverse Charge Mechanism (RCM)</strong>. The recipient is liable to pay GST directly to the government.</div>' : ""}

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>HSN/SAC</th>
        <th>Description</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Taxable Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>${c.hsn_sac_code}</td>
        <td>${c.product_description || "—"}</td>
        <td>${c.quantity}</td>
        <td>${c.rate_used}%</td>
        <td>₹${Number(c.taxable_value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
    </tbody>
  </table>

  <div class="summary">
    <table class="summary-table">
      <tr>
        <td class="label">Taxable Amount</td>
        <td class="value">₹${Number(c.taxable_value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
      ${isInterState ? `
      <tr>
        <td class="label">IGST (${c.rate_used}%)</td>
        <td class="value">₹${Number(c.igst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>` : `
      <tr>
        <td class="label">CGST (${c.rate_used / 2}%)</td>
        <td class="value">₹${Number(c.cgst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr>
        <td class="label">SGST (${c.rate_used / 2}%)</td>
        <td class="value">₹${Number(c.sgst).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>`}
      ${parseFloat(c.cess) > 0 ? `
      <tr>
        <td class="label">Cess</td>
        <td class="value">₹${Number(c.cess).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>` : ""}
      <tr class="grand-total">
        <td>Grand Total</td>
        <td class="value">₹${Number(c.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p>Generated by GST Guru — Dynamic GST Calculation System</p>
    <p>This is a computer-generated invoice and does not require a signature.</p>
    <button class="no-print" onclick="window.print()" style="margin-top:15px;padding:10px 30px;background:#6c63ff;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;">🖨️ Print / Save as PDF</button>
  </div>
</div>
</body>
</html>`;

        res.send(html);
    } catch (err) {
        console.error("Invoice generation error:", err);
        res.status(500).json({ error: "Failed to generate invoice" });
    }
});

module.exports = router;
