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
const lineasVerticales = document.getElementById("lineasVerticales");
const contenedorScroll = document.querySelector(".grid-body");

const fechaBase = document.getElementById("fechaBase");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");

let escalaHora = 60;
const escalaMin = 30;
const escalaMax = 240;
let guias = {};
let eventos = {};
let fechaSeleccionada = null;

const horaInicial = 7;
const horaFinal = 20;

// -------- Utilidades --------
function formatearFecha(date) {
  return date.toISOString().split("T")[0];
}

// -------- Cargar datos --------
async function cargarGuias() {
  const snap = await get(ref(db, "guias"));
  guias = snap.exists() ? snap.val() : {};
}

async function cargarEventosDesdeFirebase(fechaInicio) {
  eventos = {};
  const fechaStr = formatearFecha(fechaInicio);
  const snap = await get(ref(db, `eventos/${fechaStr}`));
  if (snap.exists()) {
    eventos[fechaStr] = snap.val();
    console.log("Eventos cargados para", fechaStr, eventos[fechaStr]);
  } else {
    console.log("No hay eventos para", fechaStr);
  }
}

// -------- Renderizado --------
function renderizarGuias() {
  listaGuias.innerHTML = "";
  Object.entries(guias).forEach(([id, guia]) => {
    let eventosAsignados = 0;
    let totalPersonas = 0;

    Object.values(eventos[formatearFecha(fechaSeleccionada)] || {}).forEach(evento => {
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
  const nivelesPorDia = {};
  const fecha = formatearFecha(fechaInicio);
  const eventosDia = eventos[fecha] || {};
  nivelesPorDia[fecha] = 0;

  Object.entries(eventosDia).forEach(([eid, ev]) => {
    const [hInicio, mInicio] = ev.inicio.split(":" ).map(Number);
    const [hFin, mFin] = ev.fin.split(":" ).map(Number);
    const inicioMin = hInicio * 60 + mInicio;
    const finMin = hFin * 60 + mFin;

    const duracion = finMin - inicioMin;
    const left = (inicioMin - horaInicial * 60) * (escalaHora / 60);
    const width = duracion * (escalaHora / 60);
    const top = nivelesPorDia[fecha] * (eventoAltura + 4);
    nivelesPorDia[fecha]++;

    const block = document.createElement("div");
    block.className = "event-block";
    block.style.left = `${left}px`;
    block.style.width = `${width}px`;
    block.style.top = `${top}px`;
    block.textContent = ev.tituloOriginal || `${ev.museo} (${ev.personas})`;

    gantt.appendChild(block);
  });

  const totalMinutos = (horaFinal - horaInicial) * 60;
  const anchoTotal = totalMinutos * (escalaHora / 60);
  gantt.style.width = `${anchoTotal}px`;
  horaEncabezado.style.width = `${anchoTotal}px`;
  lineasVerticales.style.width = `${anchoTotal}px`;
}

// -------- Horas y líneas verticales --------
function renderizarEncabezadoHorasYLineas() {
  horaEncabezado.innerHTML = "";
  lineasVerticales.innerHTML = "";

  const intervalosPorHora = 2;
  const totalColumnas = (horaFinal - horaInicial) * intervalosPorHora;
  const slotWidth = escalaHora / 2;
  document.documentElement.style.setProperty("--slot-width", `${slotWidth}px`);

  for (let i = 0; i <= totalColumnas; i++) {
    const minutos = i * 30;
    const hora = Math.floor(minutos / 60) + horaInicial;
    const min = minutos % 60;
    const horaTexto = `${hora.toString().padStart(2, "0")}:${min === 0 ? "00" : "30"}`;

    const divHora = document.createElement("div");
    divHora.textContent = horaTexto;
    divHora.style.width = `${slotWidth}px`;
    horaEncabezado.appendChild(divHora);

    const linea = document.createElement("div");
    linea.className = "line";
    linea.style.width = `${slotWidth}px`;
    lineasVerticales.appendChild(linea);
  }
}

// -------- Actualizar Vista Completa --------
async function actualizarVista() {
  if (!fechaSeleccionada) return;
  await cargarGuias();
  await cargarEventosDesdeFirebase(fechaSeleccionada);
  renderizarGuias();
  renderizarEncabezadoHorasYLineas();
  renderizarGantt(fechaSeleccionada);
}

// -------- Eventos UI --------
zoomIn.addEventListener("click", () => {
  escalaHora = Math.min(escalaHora + 10, escalaMax);
  actualizarVista();
});

zoomOut.addEventListener("click", () => {
  escalaHora = Math.max(escalaHora - 10, escalaMin);
  actualizarVista();
});

fechaBase.addEventListener("change", async () => {
  if (!fechaBase.value) return;
  fechaSeleccionada = new Date(fechaBase.value);

  const scriptUrl = "https://script.google.com/macros/s/AKfycbzHp67ra-6CUuH-gao0GlUz6rgAgr-LFauKmdn1gj0ykxEqPz6E0NjeTBz3Z4cBArLI/exec";
  try {
    const res = await fetch(`${scriptUrl}?fecha=${fechaBase.value}`);
    const data = await res.json();
    console.log("Eventos sincronizados:", data);
    await actualizarVista();
  } catch (err) {
    console.error("Error al sincronizar eventos:", err);
    alert("Error al sincronizar eventos");
  }
});

contenedorScroll.addEventListener("scroll", () => {
  horaEncabezado.scrollLeft = contenedorScroll.scrollLeft;
  lineasVerticales.scrollLeft = contenedorScroll.scrollLeft;
});
