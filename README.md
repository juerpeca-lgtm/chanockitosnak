# Chanockitosnak

Sitio estático, adaptable a móvil y listo para GitHub Pages. No requiere build ni dependencias.

## Pedidos a Google Sheets

El formulario envía nombre, teléfono de WhatsApp, dirección, referencia de entrega, productos/cantidades y notas al Apps Script configurado, y después ofrece confirmar por WhatsApp. No recopila datos de pago. Como el navegador usa `no-cors`, la página no puede verificar que la fila haya quedado guardada; el cliente debe confirmar por WhatsApp.

1. Crea una hoja de cálculo en la cuenta de Google que recibirá los pedidos; puedes nombrarla **Pedidos Chanockitosnak**.
2. En la hoja, abre **Extensiones → Apps Script** y pega el contenido de `google-apps-script/Code.gs`.
3. En Apps Script abre **Configuración del proyecto → Propiedades del script** y agrega `SPREADSHEET_ID` con el ID de la hoja (la parte entre `/d/` y `/edit` en su URL). Opcional: agrega `SHEET_NAME` con `Pedidos`.
4. Selecciona **Implementar → Nueva implementación → Aplicación web**. Ejecutar como: **Yo**. Quién tiene acceso: **Cualquier persona**. Implementa y copia la URL que termina en `/exec`.
5. Pega esa URL en `order-config.js`, en `sheetsEndpoint` (ya configurado para este sitio).
6. Cuando cambie `Code.gs`, reemplaza su contenido en Apps Script y, en **Implementar → Gestionar implementaciones**, edita la implementación activa eligiendo **Nueva versión**; luego pulsa **Implementar**. El script agrega los encabezados de dirección y referencia al final de la hoja, preservando las columnas anteriores.

El acceso público es necesario para que el formulario estático de GitHub Pages pueda registrar pedidos sin pedirle a cada cliente que inicie sesión en Google. El endpoint valida los campos y usa un campo señuelo contra envíos automáticos; no compartas la hoja públicamente.

## Personalizar WhatsApp

Los enlaces de WhatsApp ya están configurados. Para cambiar el teléfono en el futuro, busca `529983867637` en `index.html` y sustitúyelo por el número en formato internacional, solo dígitos y con clave de país.

## Publicar con GitHub Pages

1. Sube estos archivos a un repositorio de GitHub.
2. Abre **Settings → Pages**.
3. Selecciona **Deploy from a branch**, rama `main`, carpeta `/ (root)` y guarda.

GitHub Pages publicará el sitio en unos minutos. Los precios, ubicación y horarios se dejaron sin inventar; pueden añadirse cuando estén definidos.
