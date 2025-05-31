// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// Configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBBaMEMyM25ng6s7JINFM_XH6Sx2AsRoiU",
  authDomain: "mifirebase-729f6.firebaseapp.com",
  databaseURL: "https://mifirebase-729f6-default-rtdb.firebaseio.com/",
  projectId: "mifirebase-729f6",
  storageBucket: "mifirebase-729f6.appspot.com",
  messagingSenderId: "191927410814",
  appId: "1:191927410814:web:085873d617037fe286382f"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM
const listaGuias = document.getElementById("listaGuias");
const gantt = document.getElementById("ganttCalendar");
const fechaBase = document.getElementById("fechaBase");
const btnDia = document.getElementById("vista-dia");
const btnTres = document.getElementById("vista-tres");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");

let diasVista = 1;
let escalaHora = 60; // ancho base en px para una hora

let guias = {};
let eventos = {};

// -------- Utilidades --------
function formatearFecha(date) {
  return date.toISOString().split("T")[0];
}

function sumarDias(fecha, dias) {
  const f = new Date(fecha);
  f.setDate(f.getDate() + dias);
  return f;
}

// -------- Cargar datos --------
async function cargarGuias() {
  const snap = await get(ref(db, "guias"));
  guias = snap.exists() ? snap.val() : {};
}

async function cargarEventos(fechaInicio, dias) {
  eventos = {};
  for (let i = 0; i < dias; i++) {
    const fechaStr = formatearFecha(sumarDias(fechaInicio, i));
    const snap = await get(ref(db, `eventos/${fechaStr}`));
    if (snap.exists()) eventos[fechaStr] = snap.val();
  }
}

// -------- Renderizar --------
function renderizarGuias() {
  listaGuias.innerHTML = "";
  Object.entries(guias).forEach(([id, guia]) => {
    const div = document.createElement("div");
    div.className = "guia-card";
    div.innerHTML = `
      <div class="guia-color" style="background:${guia.color || "#ccc"}"></div>
      <div class="guia-info">
        <strong>${guia.nombre}</strong><br>
        <span id="info-${id}">0 eventos / 0 pers.</span>
      </div>
    `;
    listaGuias.appendChild(div);
  });
}

function renderizarGantt(fechaInicio) {
  gantt.innerHTML = "";
  const horasTotales = 12; // por defecto de 08:00 a 20:00
  const horaInicial = 8;

  Object.entries(guias).forEach(([id, guia]) => {
    const row = document.createElement("div");
    row.className = "gantt-row";

    let eventosGuia = 0;
    let personasGuia = 0;

    for (let i = 0; i < diasVista; i++) {
      const fecha = formatearFecha(sumarDias(fechaInicio, i));
      const eventosDia = eventos[fecha] || {};

      Object.entries(eventosDia).forEach(([eid, ev]) => {
        if (ev.guiaAsignado === id) {
          const horaInicio = parseInt(ev.inicio.split(":")[0]);
          const horaFin = parseInt(ev.fin.split(":")[0]);
          const duracion = horaFin - horaInicio;

          const left = ((i * horasTotales) + (horaInicio - horaInicial)) * escalaHora;
          const width = duracion * escalaHora;

          const block = document.createElement("div");
          block.className = "event-block";
          block.style.left = `${left}px`;
          block.style.width = `${width}px`;
          block.style.top = "10px";
          block.style.background = guia.color || "#f9a72d";
          block.textContent = `${ev.museo} (${ev.personas})`;

          row.appendChild(block);
          eventosGuia++;
          personasGuia += ev.personas || 0;
        }
      });
    }

    // Actualizar resumen lateral
    const info = document.getElementById(`info-${id}`);
    if (info) info.textContent = `${eventosGuia} eventos / ${personasGuia} pers.`;

    gantt.appendChild(row);
  });

  gantt.style.width = `${diasVista * escalaHora * 12 + 100}px`;
}

// -------- Controladores --------
async function actualizarVista() {
  if (!fechaBase.value) return;
  const fecha = new Date(fechaBase.value);
  await cargarEventos(fecha, diasVista);
  renderizarGuias();
  renderizarGantt(fecha);
}

// -------- Eventos UI --------
btnDia.addEventListener("click", () => {
  diasVista = 1;
  actualizarVista();
});

btnTres.addEventListener("click", () => {
  diasVista = 3;
  actualizarVista();
});

zoomIn.addEventListener("click", () => {
  escalaHora = Math.min(escalaHora + 10, 200);
  actualizarVista();
});

zoomOut.addEventListener("click", () => {
  escalaHora = Math.max(escalaHora - 10, 30);
  actualizarVista();
});

fechaBase.addEventListener("change", actualizarVista);

// Inicializar
(async () => {
  await cargarGuias();
  const hoy = new Date();
  fechaBase.value = formatearFecha(hoy);
  await actualizarVista();
})();