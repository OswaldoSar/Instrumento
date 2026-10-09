const CONFIG = window.HBBS_CONFIG || {};
const form = document.getElementById('siscoForm');
const steps = [...document.querySelectorAll('.form-step')];
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const progressLabel = document.getElementById('progressLabel');
const stepLabel = document.getElementById('stepLabel');
const formMessage = document.getElementById('formMessage');
const p2Block = document.getElementById('p2Block');
const noBranchNote = document.getElementById('noBranchNote');
const reviewText = document.getElementById('reviewText');
let currentStep = 0;

const scale = [
  {value: 0, short: '1', label: 'Nunca'},
  {value: 1, short: '2', label: 'Rara vez'},
  {value: 2, short: '3', label: 'Algunas veces'},
  {value: 3, short: '4', label: 'Casi siempre'},
  {value: 4, short: '5', label: 'Siempre'}
];

const groups = {
  estresores: [
    [3, 'La competencia con los compañeros del grupo.'],
    [4, 'Sobrecarga de tareas y trabajos escolares.'],
    [5, 'La personalidad y el carácter del profesor.'],
    [6, 'Las evaluaciones de los profesores (exámenes, ensayos, trabajos de investigación, etc.).'],
    [7, 'El tipo de trabajo que te piden los profesores (consulta de temas, fichas de trabajo, ensayos, mapas conceptuales, etc.).'],
    [8, 'No entender los temas que se abordan en la clase.'],
    [9, 'Participación en clase (responder a preguntas, exposiciones, etc.).'],
    [10, 'Tiempo limitado para hacer el trabajo.']
  ],
  fisicas: [
    [11, 'Trastornos en el sueño (insomnio o pesadillas).'],
    [12, 'Fatiga crónica (cansancio permanente).'],
    [13, 'Dolores de cabeza o migrañas.'],
    [14, 'Problemas de digestión, dolor abdominal o diarrea.'],
    [15, 'Rascarse, morderse las uñas, frotarse, etc.'],
    [16, 'Somnolencia o mayor necesidad de dormir.']
  ],
  psicologicas: [
    [17, 'Inquietud (incapacidad de relajarse y estar tranquilo).'],
    [18, 'Sentimientos de depresión y tristeza (decaído).'],
    [19, 'Ansiedad, angustia o desesperación.'],
    [20, 'Problemas de concentración.'],
    [21, 'Sentimiento de agresividad o aumento de irritabilidad.']
  ],
  comportamentales: [
    [22, 'Conflictos o tendencia a polemizar o discutir.'],
    [23, 'Aislamiento de los demás.'],
    [24, 'Desgano para realizar las labores escolares.'],
    [25, 'Aumento o reducción del consumo de alimentos.']
  ],
  afrontamiento: [
    [26, 'Habilidad asertiva (defender nuestras preferencias, ideas o sentimientos sin dañar a otros).'],
    [27, 'Elaboración de un plan y ejecución de sus tareas.'],
    [28, 'Elogios a sí mismo.'],
    [29, 'La religiosidad (oraciones o asistencia a misa).'],
    [30, 'Búsqueda de información sobre la situación.'],
    [31, 'Ventilación y confidencias (verbalización de la situación que preocupa).']
  ]
};

function renderLikert(containerId, items) {
  const container = document.getElementById(containerId);
  const header = `
    <div class="likert-header">
      <div>Enunciado</div>
      ${scale.map(s => `<div>${s.short}<br>${s.label}</div>`).join('')}
    </div>`;
  const rows = items.map(([n, text]) => `
    <div class="likert-row" data-question="p${n}">
      <div class="likert-row__q"><strong>${n}.</strong> ${text}</div>
      ${scale.map(s => `
        <label class="likert-cell" data-label="${s.label}">
          <input type="radio" name="p${n}" value="${s.value}" aria-label="${s.short} - ${s.label}" required>
          <span class="likert-dot">${s.short}</span>
        </label>`).join('')}
    </div>`).join('');
  container.innerHTML = `<div class="likert-wrap">${header}${rows}</div>`;
}

function renderOptionalScale(containerId, name) {
  const c = document.getElementById(containerId);
  c.innerHTML = `
    <div class="field"><span>Frecuencia de la respuesta adicional <em>opcional</em></span></div>
    <div class="optional-scale">
      ${scale.map(s => `<label class="choice"><input type="radio" name="${name}" value="${s.value}"><span>${s.short}</span></label>`).join('')}
    </div>`;
}

function renderP2() {
  document.getElementById('p2Scale').innerHTML = [1,2,3,4,5].map(n => `
    <label class="choice"><input type="radio" name="p2" value="${n}"><span>${n}</span></label>`).join('');
}

Object.entries(groups).forEach(([id, items]) => renderLikert(id, items));
renderOptionalScale('otraEstresorFreq', 'otra_estresor_frecuencia');
renderOptionalScale('otraReaccionFreq', 'otra_reaccion_frecuencia');
renderOptionalScale('otraAfrontamientoFreq', 'otra_afrontamiento_frecuencia');
renderP2();

function answerP1() {
  return form.querySelector('input[name="p1"]:checked')?.value || '';
}

form.querySelectorAll('input[name="p1"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const yes = answerP1() === 'Sí';
    p2Block.hidden = !yes;
    noBranchNote.hidden = yes;
    form.querySelectorAll('input[name="p2"]').forEach(i => i.required = yes);
    if (!yes) form.querySelectorAll('input[name="p2"]').forEach(i => i.checked = false);
  });
});

function visibleSequence() {
  return answerP1() === 'No' ? [0,1,2,8] : [0,1,2,3,4,5,6,7,8];
}

function validateCurrentStep() {
  formMessage.textContent = '';
  formMessage.className = 'form-message';
  const step = steps[currentStep];
  const required = [...step.querySelectorAll('[required]')].filter(el => !el.disabled && !el.closest('[hidden]'));
  let ok = true;
  const seenRadio = new Set();

  required.forEach(el => {
    if (el.type === 'radio') {
      if (seenRadio.has(el.name)) return;
      seenRadio.add(el.name);
      const group = [...step.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`)];
      if (!group.some(r => r.checked)) {
        ok = false;
        const row = el.closest('.likert-row, .question-card');
        if (row) row.classList.add('invalid');
      } else {
        const row = el.closest('.likert-row, .question-card');
        if (row) row.classList.remove('invalid');
      }
    } else if (!el.checkValidity()) {
      ok = false;
      el.classList.add('invalid');
    } else {
      el.classList.remove('invalid');
    }
  });

  if (!ok) {
    formMessage.textContent = 'Completa las preguntas obligatorias antes de continuar.';
    formMessage.classList.add('is-error');
    const first = step.querySelector('.invalid');
    first?.scrollIntoView({behavior: 'smooth', block: 'center'});
  }
  return ok;
}

function goToStep(stepIndex) {
  currentStep = stepIndex;
  steps.forEach((s,i) => s.classList.toggle('is-active', i === currentStep));
  const seq = visibleSequence();
  const pos = Math.max(0, seq.indexOf(currentStep));
  const pct = Math.round((pos / (seq.length - 1)) * 100);
  progressBar.style.width = `${pct}%`;
  progressLabel.textContent = `${pct}%`;
  stepLabel.textContent = currentStep === 0 ? 'Inicio' : currentStep === 8 ? 'Finalizar' : `Paso ${pos} de ${seq.length - 1}`;
  backBtn.disabled = pos === 0;
  nextBtn.hidden = currentStep === 8;
  submitBtn.hidden = currentStep !== 8;
  formMessage.textContent = '';
  formMessage.className = 'form-message';
  window.scrollTo({top: document.querySelector('.survey-card').offsetTop - 85, behavior: 'smooth'});
}

nextBtn.addEventListener('click', () => {
  if (!validateCurrentStep()) return;
  const seq = visibleSequence();
  const pos = seq.indexOf(currentStep);
  const next = seq[pos + 1];
  if (next === 8 && answerP1() === 'No') {
    reviewText.textContent = 'Como indicaste que no tuviste momentos de preocupación o nerviosismo durante el semestre, el cuestionario concluye aquí. Puedes enviar tu participación.';
  } else if (next === 8) {
    reviewText.textContent = 'Has completado los 31 ítems. Al enviar, tus respuestas quedarán registradas para fines de investigación.';
  }
  if (typeof next === 'number') goToStep(next);
});

backBtn.addEventListener('click', () => {
  const seq = visibleSequence();
  const pos = seq.indexOf(currentStep);
  const prev = seq[pos - 1];
  if (typeof prev === 'number') goToStep(prev);
});

function serialize() {
  const data = Object.fromEntries(new FormData(form).entries());
  data.consentimiento = document.getElementById('consent').checked ? 'Sí' : 'No';
  data.userAgent = navigator.userAgent;
  data.url = location.href;
  return data;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando…';
  formMessage.textContent = '';

  const endpoint = CONFIG.APPS_SCRIPT_URL || '';
  if (!endpoint.startsWith('https://script.google.com/')) {
    formMessage.textContent = 'El formulario aún no está conectado a Google Apps Script. Revisa config.js antes de publicarlo.';
    formMessage.className = 'form-message is-error';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar respuestas';
    return;
  }

  try {
    const fd = new FormData();
    fd.append('payload', JSON.stringify(serialize()));
    const response = await fetch(endpoint, { method: 'POST', body: fd });
    const result = await response.json().catch(() => ({ok: response.ok}));
    if (!response.ok || result.ok === false) throw new Error(result.message || 'No se pudo registrar la respuesta.');

    form.innerHTML = `
      <div class="success-preview" style="padding:56px 18px">
        <div class="success-preview__icon">✓</div>
        <div class="section-kicker">Respuesta registrada</div>
        <h2>¡Gracias por participar!</h2>
        <p class="section-help" style="max-width:620px;margin:12px auto 0">Tus respuestas han sido enviadas correctamente y serán utilizadas únicamente para los fines declarados en la investigación.</p>
      </div>`;
    progressBar.style.width = '100%';
    progressLabel.textContent = '100%';
    stepLabel.textContent = 'Completado';
  } catch (error) {
    formMessage.textContent = `No se pudo enviar la respuesta. ${error.message || 'Inténtalo nuevamente.'}`;
    formMessage.className = 'form-message is-error';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar respuestas';
  }
});

goToStep(0);
