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
const horaEncabezado = document.getElementById("horaEncabezado");
const lineasHoras = document.getElementById("lineasHoras");
const fechaBase = document.getElementById("fechaBase");

const startHour = 7;
const endHour = 20;
const totalHalfHours = (endHour - startHour) * 2;
const blockWidth = 60;
const totalWidth = blockWidth * totalHalfHours;

let guias = {};
let eventos = {};
let fechaSeleccionada = null;

horaEncabezado.style.width = totalWidth + "px";
lineasHoras.style.width = totalWidth + "px";
gantt.style.width = totalWidth + "px";

function crearEncabezadoHorasYLíneas() {
  horaEncabezado.innerHTML = "";
  lineasHoras.innerHTML = "";
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += 30) {
      const horaTexto = h.toString().padStart(2, "0") + ":" + (m === 0 ? "00" : "30");
      const horaDiv = document.createElement("div");
      horaDiv.className = "hora";
      horaDiv.style.width = blockWidth + "px";
      horaDiv.innerText = horaTexto;
      horaEncabezado.appendChild(horaDiv);

      if (h !== endHour || m !== 30) {
        const lineaDiv = document.createElement("div");
        lineaDiv.className = "linea-hora";
        lineaDiv.style.width = blockWidth + "px";
        lineasHoras.appendChild(lineaDiv);
      }
    }
  }
}

function syncScroll(source) {
  const scrollLeft = source.scrollLeft;
  if (source !== gantt) gantt.scrollLeft = scrollLeft;
}

gantt.addEventListener("scroll", () => syncScroll(gantt));


function timeToPosition(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  const halfHoursFromStart = (h - startHour) * 2 + (m === 30 ? 1 : 0);
  return halfHoursFromStart * blockWidth;
}

async function cargarGuias() {
  const snap = await get(ref(db, "guias"));
  guias = snap.exists() ? snap.val() : {};
}

async function cargarEventosDesdeFirebase(fechaInicio) {
  eventos = {};
  const fechaStr = formatearFecha(fechaInicio);
  const snap = await get(ref(db, `eventos/${fechaStr}`));
  eventos[fechaStr] = snap.exists() ? snap.val() : {};
}

function formatearFecha(date) {
  return date.toISOString().split("T")[0];
}

function renderizarGuias() {
  listaGuias.innerHTML = "";
  if (!fechaSeleccionada) return;
  const fechaKey = formatearFecha(fechaSeleccionada);

  Object.entries(guias).forEach(([id, guia]) => {
    let eventosAsignados = 0;
    let totalPersonas = 0;

    Object.values(eventos[fechaKey] || {}).forEach(evento => {
      if (evento.guiaAsignado === id) {
        eventosAsignados++;
        totalPersonas += evento.personas || 0;
      }
    });

    const div = document.createElement("div");
    div.className = "guia-card";
    div.innerHTML = `
      <div class="guia-color" style="background:${guia.color || "#ccc"}"></div>
      <div class="guia-info">
        <strong>${guia.nombre}</strong><br>
        <span>${eventosAsignados} eventos / ${totalPersonas} pers.</span>
      </div>
    `;
    listaGuias.appendChild(div);
  });
}

function renderizarGantt(fechaInicio) {
  gantt.innerHTML = "";
  const eventoAltura = 28;
  const margenEntreEventos = 4;
  const fecha = formatearFecha(fechaInicio);
  const eventosDia = eventos[fecha] || {};

  const eventosArray = Object.entries(eventosDia)
    .filter(([id, ev]) => ev.inicio && ev.fin)
    .map(([id, ev]) => {
      const [hInicio, mInicio] = ev.inicio.split(":").map(Number);
      const [hFin, mFin] = ev.fin.split(":").map(Number);
      return {
        id,
        ev,
        inicioMin: hInicio * 60 + mInicio,
        finMin: hFin * 60 + mFin,
        nivel: 0
      };
    });

  eventosArray.sort((a, b) => a.inicioMin - b.inicioMin);
  const niveles = [];

  eventosArray.forEach(evento => {
    let nivelAsignado = 0;
    while (true) {
      if (!niveles[nivelAsignado] || niveles[nivelAsignado] <= evento.inicioMin) {
        niveles[nivelAsignado] = evento.finMin;
        evento.nivel = nivelAsignado;
        break;
      }
      nivelAsignado++;
    }
  });

  eventosArray.forEach(({ id, ev, inicioMin, finMin, nivel }) => {
    if (finMin <= startHour * 60 || inicioMin >= endHour * 60) return;

    const left = timeToPosition(ev.inicio);
    const width = timeToPosition(ev.fin) - left;
    const top = nivel * (eventoAltura + margenEntreEventos);

    const block = document.createElement("div");
    block.className = "event-block";
    block.style.position = "absolute";
    block.style.left = `${left}px`;
    block.style.width = `${width}px`;
    block.style.top = `${top}px`;
    block.style.height = `${eventoAltura}px`;
    block.style.lineHeight = `${eventoAltura}px`;
    block.style.padding = "0 5px";
    block.style.color = "#fff";
    block.style.borderRadius = "4px";
    block.style.overflow = "hidden";
    block.style.whiteSpace = "nowrap";
    block.style.textOverflow = "ellipsis";
    block.style.cursor = "pointer";
    block.title = ev.titulo || ev.tituloOriginal || "Evento";

    if (ev.guiaAsignado && guias[ev.guiaAsignado]) {
      block.style.backgroundColor = guias[ev.guiaAsignado].color;
    } else {
      block.style.backgroundColor = "#5a9bd5";
    }

    block.textContent = ev.tituloOriginal || ev.titulo || "Evento";
    gantt.appendChild(block);
  });
}

// Sincronizar con Apps Script y luego actualizar vista
async function sincronizarConAppScript(fechaISO) {
  const scriptUrl = "https://script.google.com/macros/s/AKfycbzHp67ra-6CUuH-gao0GlUz6rgAgr-LFauKmdn1gj0ykxEqPz6E0NjeTBz3Z4cBArLI/exec";
  try {
    const res = await fetch(`${scriptUrl}?fecha=${fechaISO}`);
    const data = await res.json();
    console.log("Eventos sincronizados desde GAS:", data);
  } catch (error) {
    console.error("Error al sincronizar con GAS:", error);
  }
}

// Cargar datos y actualizar todo
async function actualizarVista() {
  if (!fechaSeleccionada) return;

  const fechaISO = formatearFecha(fechaSeleccionada);
  await sincronizarConAppScript(fechaISO);
  await cargarGuias();
  await cargarEventosDesdeFirebase(fechaSeleccionada);

  renderizarGuias();
  renderizarGantt(fechaSeleccionada);
}

// Cambio de fecha
fechaBase.addEventListener("change", async () => {
  if (!fechaBase.value) return;
  fechaSeleccionada = new Date(fechaBase.value);
  await actualizarVista();
});

// Inicial
crearEncabezadoHorasYLíneas();
