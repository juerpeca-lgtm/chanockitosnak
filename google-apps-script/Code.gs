function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    if (String(payload.website || "").trim()) return output_({ ok: true }); // honeypot

    const name = clean_(payload.customerName, 100);
    const phone = clean_(payload.phone, 30);
    const notes = clean_(payload.notes, 500);
    const items = Array.isArray(payload.items) ? payload.items : [];
    if (!name || !phone || !/^\+?[0-9 ()-]{7,30}$/.test(phone) || !items.length || payload.consent !== true) {
      return output_({ ok: false, error: "invalid_order" });
    }

    const itemSummary = items.map((item) => {
      const itemName = clean_(item.name, 80);
      const quantity = Number(item.quantity);
      if (!itemName || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        throw new Error("invalid_item");
      }
      return `${quantity} × ${itemName}`;
    }).join(", ");

    const properties = PropertiesService.getScriptProperties();
    const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
    const sheetName = properties.getProperty("SHEET_NAME") || "Pedidos";
    if (!spreadsheetId) throw new Error("missing_spreadsheet_id");

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
      if (!sheet) throw new Error("missing_sheet");
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Fecha y hora", "Nombre", "WhatsApp", "Pedido", "Notas", "Estado"]);
      }
      sheet.appendRow([new Date(), name, phone, itemSummary, notes, "Nuevo"]);
    } finally {
      lock.releaseLock();
    }
    return output_({ ok: true });
  } catch (error) {
    console.error(error);
    return output_({ ok: false, error: "could_not_save" });
  }
}

function clean_(value, maxLength) {
  let text = String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maxLength);
  if (/^[=+@-]/.test(text)) text = "'" + text;
  return text;
}

function output_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
