// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

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
const contenedorScroll = document.querySelector(".scroll-synced");
const gridBody = document.querySelector(".grid-body");

const fechaBase = document.getElementById("fechaBase");
const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");

let escalaHora = 60;
let escalaMin = 60;
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

function calcularEscalaInicial() {
  const anchoDisponible = gridBody.clientWidth;
  const totalMinutos = (horaFinal - horaInicial) * 60;
  escalaHora = anchoDisponible / totalMinutos;
  escalaMin = escalaHora;
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
  console.log("🟡 Entrando a renderizarGantt con fecha:", fechaInicio);
  gantt.innerHTML = "";
  const eventoAltura = 28;
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
  console.log("🟢 Eventos a mostrar:", Object.keys(eventosDia).length, eventosDia);


  // Asignar niveles para que no se encimen
  eventosArray.sort((a, b) => a.inicioMin - b.inicioMin);
  const niveles = [];

  eventosArray.forEach(evento => {
    let nivelAsignado = 0;
    while (true) {
      const nivelActual = niveles[nivelAsignado];
      if (!nivelActual || nivelActual <= evento.inicioMin) {
        niveles[nivelAsignado] = evento.finMin;
        evento.nivel = nivelAsignado;
        break;
      }
      nivelAsignado++;
    }
  });

  const minutosTotales = (horaFinal - horaInicial) * 60;

  eventosArray.forEach(({ id, ev, inicioMin, finMin, nivel }) => {
    if (finMin <= horaInicial * 60 || inicioMin >= horaFinal * 60) return;

    const duracion = finMin - inicioMin;
    const left = (inicioMin - horaInicial * 60) * (escalaHora / 60);
    const width = duracion * (escalaHora / 60);
    const top = nivel * (eventoAltura + 4);

    const block = document.createElement("div");
    block.className = "event-block";
    block.style.left = `${left}px`;
    block.style.width = `${width}px`;
    block.style.top = `${top}px`;

    // Color según guía asignado o default
    if (ev.guiaAsignado && guias[ev.guiaAsignado]) {
      block.style.backgroundColor = guias[ev.guiaAsignado].color;
    } else {
      block.style.backgroundColor = "#5a9bd5"; // color default
    }

    // Mostrar solo el título
    block.textContent = ev.tituloOriginal || ev.titulo || "Evento";

    // Agregar evento click para asignar guía
    block.addEventListener("click", () => {
      console.log(`Haz clic en el evento ${ev.titulo}`);
    });

    gantt.appendChild(block);
    console.log("🧱 Evento renderizado:", block.style.left, block.style.width, block.style.top, block.textContent);
  });

  const anchoTotal = minutosTotales * (escalaHora / 60);
  gantt.style.width = `${anchoTotal}px`;
  horaEncabezado.style.width = `${anchoTotal}px`;
  lineasVerticales.style.width = `${anchoTotal}px`;
}

// -------- Actualizar Vista Completa --------
async function actualizarVista() {
  if (!fechaSeleccionada) return;
  calcularEscalaInicial();
  await cargarGuias();
  await cargarEventosDesdeFirebase(fechaSeleccionada);
  renderizarGuias();
  renderizarGantt(fechaSeleccionada);
}

// -------- Eventos UI -------- 

fechaBase.addEventListener("change", async () => {
  if (!fechaBase.value) return;
  fechaSeleccionada = new Date(fechaBase.value);

  // Llama al Google Apps Script para sincronizar eventos
  const scriptUrl = "https://script.google.com/macros/s/AKfycbzHp67ra-6CUuH-gao0GlUz6rgAgr-LFauKmdn1gj0ykxEqPz6E0NjeTBz3Z4cBArLI/exec";
  try {
    const res = await fetch(`${scriptUrl}?fecha=${fechaBase.value}`);
    const data = await res.json();
    console.log("Eventos sincronizados desde GAS:", data);
  } catch (error) {
    console.error("Error al sincronizar con GAS:", error);
  }

  await actualizarVista();
});

// Inicializar con hoy o vacío
fechaSeleccionada = null;
