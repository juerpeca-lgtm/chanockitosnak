document.querySelector("#year").textContent = new Date().getFullYear();

const orderForm = document.querySelector("#order-form");
const orderStatus = document.querySelector("#order-status");
const confirmWhatsApp = document.querySelector("#confirm-whatsapp");
const orderItems = [
  ["El clásico", "classic"],
  ["Bien picosito", "spicy"],
  ["Con todo", "loaded"]
];

document.querySelectorAll("[data-select-item]").forEach((link) => {
  link.addEventListener("click", () => {
    const input = orderForm.elements.namedItem(link.dataset.selectItem);
    if (input && Number(input.value) === 0) input.value = "1";
  });
});

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  orderStatus.textContent = "";
  orderStatus.dataset.state = "";
  confirmWhatsApp.hidden = true;

  const formData = new FormData(orderForm);
  const items = orderItems
    .map(([name, key]) => ({ name, quantity: Number(formData.get(key)) || 0 }))
    .filter((item) => item.quantity > 0);
  const endpoint = window.ORDER_CONFIG?.sheetsEndpoint?.trim();

  if (!endpoint) {
    orderStatus.textContent = "El registro en línea todavía se está configurando. Escríbenos por WhatsApp para hacer tu pedido.";
    orderStatus.dataset.state = "error";
    confirmWhatsApp.href = "https://wa.me/529983867637?text=" + encodeURIComponent("Hola, quiero hacer un pedido. ¿Me ayudan, por favor?");
    confirmWhatsApp.hidden = false;
    return;
  }

  if (items.length === 0) {
    orderStatus.textContent = "Elige al menos un producto.";
    orderStatus.dataset.state = "error";
    return;
  }

  const submitButton = orderForm.querySelector("button[type=submit]");
  const order = {
    customerName: String(formData.get("customerName") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    deliveryAddress: String(formData.get("deliveryAddress") || "").trim(),
    deliveryReference: String(formData.get("deliveryReference") || "").trim(),
    items,
    notes: String(formData.get("notes") || "").trim(),
    consent: formData.get("consent") === "on",
    website: String(formData.get("website") || "")
  };
  submitButton.disabled = true;
  submitButton.textContent = "Enviando…";

  try {
    // Apps Script does not expose CORS headers; a simple text/plain POST avoids preflight.
    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(order)
    });
    orderStatus.textContent = "El formulario intentó enviar tu pedido, pero no podemos confirmar desde aquí si quedó guardado en la hoja. Confirma por WhatsApp antes de volver a enviarlo.";
    orderStatus.dataset.state = "warning";
    const summary = items.map((item) => `${item.quantity} × ${item.name}`).join(", ");
    const message = `Hola, soy ${order.customerName}. Acabo de enviar un pedido: ${summary}. Dirección de entrega: ${order.deliveryAddress}.${order.deliveryReference ? ` Referencia: ${order.deliveryReference}.` : ""}${order.notes ? ` Nota: ${order.notes}.` : ""} ¿Me confirman disponibilidad?`;
    confirmWhatsApp.href = `https://wa.me/529983867637?text=${encodeURIComponent(message)}`;
    confirmWhatsApp.hidden = false;
  } catch {
    orderStatus.textContent = "No pudimos enviar el pedido. Intenta de nuevo o escríbenos por WhatsApp.";
    orderStatus.dataset.state = "error";
    confirmWhatsApp.href = "https://wa.me/529983867637?text=" + encodeURIComponent("Hola, no pude enviar mi pedido en línea. ¿Me ayudan, por favor?");
    confirmWhatsApp.hidden = false;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar pedido";
  }
});
