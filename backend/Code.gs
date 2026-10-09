/**
 * Backend para el formulario SISCO de HBBS.
 *
 * CONFIGURACIÓN:
 * 1. Crea una hoja de cálculo de Google Sheets.
 * 2. Copia su ID y reemplaza SPREADSHEET_ID.
 * 3. Opcional: coloca un correo en EMAIL_NOTIFICACION.
 * 4. Implementa como Aplicación web: ejecutar como "Yo" y acceso "Cualquier persona".
 * 5. Copia la URL /exec en config.js del sitio.
 */

const SPREADSHEET_ID = 'PEGA_AQUI_EL_ID_DE_GOOGLE_SHEETS';
const SHEET_NAME = 'Respuestas SISCO';
const EMAIL_NOTIFICACION = ''; // Ej.: investigacion@dominio.com

const HEADERS = [
  'Fecha y hora', 'Edad', 'Sexo', 'Grado', 'Sección', 'Consentimiento',
  'P1', 'P2',
  'P3','P4','P5','P6','P7','P8','P9','P10',
  'P11','P12','P13','P14','P15','P16',
  'P17','P18','P19','P20','P21',
  'P22','P23','P24','P25',
  'P26','P27','P28','P29','P30','P31',
  'Otra estresor', 'Frecuencia otra estresor',
  'Otra reacción', 'Frecuencia otra reacción',
  'Otra afrontamiento', 'Frecuencia otra afrontamiento',
  'Puntaje estresores', 'Puntaje síntomas', 'Puntaje afrontamiento',
  'URL origen', 'User agent'
];

function doGet() {
  return json_({ ok: true, service: 'HBBS SISCO endpoint' });
}

function doPost(e) {
  try {
    if (!SPREADSHEET_ID || SPREADSHEET_ID.indexOf('PEGA_AQUI') === 0) {
      throw new Error('Configura SPREADSHEET_ID en Code.gs.');
    }

    const raw = (e && e.parameter && e.parameter.payload)
      ? e.parameter.payload
      : (e && e.postData ? e.postData.contents : '{}');
    const d = JSON.parse(raw || '{}');

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) sh = ss.insertSheet(SHEET_NAME);

    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sh.getRange(1, 1, 1, HEADERS.length)
        .setFontWeight('bold')
        .setBackground('#6666AB')
        .setFontColor('#FFFFFF');
      sh.setFrozenRows(1);
    }

    const noStress = d.p1 === 'No';
    const val = key => (d[key] === undefined || d[key] === null) ? '' : d[key];
    const num = key => {
      if (noStress) return '';
      const n = Number(d[key]);
      return Number.isFinite(n) ? n : '';
    };
    const sum = (a,b) => {
      if (noStress) return '';
      let total = 0;
      for (let i=a; i<=b; i++) {
        const n = Number(d['p'+i]);
        if (!Number.isFinite(n)) return '';
        total += n;
      }
      return total;
    };

    const row = [
      new Date(), val('edad'), val('sexo'), val('grado'), val('seccion'), val('consentimiento'),
      val('p1'), noStress ? '' : val('p2'),
      ...Array.from({length: 8}, (_,i) => num('p'+(i+3))),
      ...Array.from({length: 6}, (_,i) => num('p'+(i+11))),
      ...Array.from({length: 5}, (_,i) => num('p'+(i+17))),
      ...Array.from({length: 4}, (_,i) => num('p'+(i+22))),
      ...Array.from({length: 6}, (_,i) => num('p'+(i+26))),
      val('otra_estresor'), val('otra_estresor_frecuencia'),
      val('otra_reaccion'), val('otra_reaccion_frecuencia'),
      val('otra_afrontamiento'), val('otra_afrontamiento_frecuencia'),
      sum(3,10), sum(11,25), sum(26,31),
      val('url'), val('userAgent')
    ];

    sh.appendRow(row);

    if (EMAIL_NOTIFICACION) {
      MailApp.sendEmail({
        to: EMAIL_NOTIFICACION,
        subject: 'Nueva respuesta SISCO - HBBS',
        htmlBody: '<p>Se registró una nueva respuesta del formulario SISCO.</p>' +
                  '<p><strong>Fecha:</strong> ' + new Date() + '</p>' +
                  '<p><strong>P1:</strong> ' + val('p1') + '</p>'
      });
    }

    return json_({ ok: true, message: 'Respuesta registrada correctamente.' });
  } catch (err) {
    return json_({ ok: false, message: err.message || String(err) });
  }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
