# HBBS · Formulario SISCO 31 ítems

Sitio web estático listo para publicar en **GitHub Pages**, con identidad visual de **HBBS — Human Behavior Business Science** y formulario digital del **Inventario SISCO del Estrés Académico (31 ítems)**.

## Archivos

- `index.html` — estructura principal del formulario.
- `styles.css` — identidad visual HBBS y diseño responsive.
- `app.js` — preguntas, navegación, validación, lógica del filtro P1 y envío.
- `config.js` — URL del backend de Google Apps Script.
- `assets/logo-hbbs.png` — logo HBBS obtenido del material gráfico proporcionado.
- `assets/favicon.png` — símbolo HBBS para pestaña del navegador.
- `backend/Code.gs` — backend de Google Apps Script para guardar respuestas en Google Sheets.
- `.nojekyll` — evita procesamiento Jekyll innecesario en GitHub Pages.

## 1. Preparar Google Sheets

1. Crea una hoja nueva en Google Sheets.
2. Copia el ID de la URL. Ejemplo:
   `https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit`
3. Abre `backend/Code.gs` y reemplaza:
   `PEGA_AQUI_EL_ID_DE_GOOGLE_SHEETS`
4. Si quieres recibir una notificación por correo en cada respuesta, completa `EMAIL_NOTIFICACION`.

## 2. Crear el backend en Google Apps Script

1. Entra a `https://script.google.com/` y crea un proyecto.
2. Copia todo el contenido de `backend/Code.gs`.
3. Ve a **Implementar → Nueva implementación**.
4. Tipo: **Aplicación web**.
5. Ejecutar como: **Yo**.
6. Quién tiene acceso: **Cualquier persona**.
7. Implementa y copia la URL que termina en `/exec`.

## 3. Conectar la web

Abre `config.js` y reemplaza:

```js
APPS_SCRIPT_URL: 'PEGA_AQUI_LA_URL_DE_TU_APPS_SCRIPT'
```

por la URL `/exec` obtenida en el paso anterior.

## 4. Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube **todo el contenido de esta carpeta** a la raíz del repositorio.
3. Ve a **Settings → Pages**.
4. En **Build and deployment**, selecciona **Deploy from a branch**.
5. Branch: `main` y carpeta `/ (root)`.
6. Guarda.
7. GitHub mostrará la URL pública del formulario.

## Funcionamiento del instrumento

- P1 funciona como filtro.
- Si P1 = **No**, el formulario omite P2–P31 y permite finalizar.
- Si P1 = **Sí**, P2 pasa a ser obligatorio y se habilitan los ítems P3–P31.
- P3–P31 se muestran en escala 1–5 al participante y se guardan internamente como 0–4:
  - 1 Nunca = 0
  - 2 Rara vez = 1
  - 3 Algunas veces = 2
  - 4 Casi siempre = 3
  - 5 Siempre = 4
- El backend calcula automáticamente:
  - Estresores: P3–P10
  - Síntomas/reacciones: P11–P25
  - Afrontamiento: P26–P31
- Los campos “Otra (especifique)” son opcionales y no forman parte del conteo de 31 ítems.

## Colores HBBS utilizados

- Principal: `#6666AB`
- Violeta oscuro: `#484978`
- Lavanda: `#9495F6`
- Acento violeta: `#9C69E9`
- Fondo morado profundo: `#2F0E80`

## Recomendación antes de aplicar

Haz una prueba completa desde celular y computadora antes de distribuir el enlace. Comprueba que la respuesta llegue a Google Sheets y que el flujo P1 = No termine correctamente.
