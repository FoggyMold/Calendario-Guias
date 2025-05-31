// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Referencias DOM
const fechaInput = document.getElementById('fecha');
const btnDia = document.getElementById('btn-dia');
const btnSemana = document.getElementById('btn-semana');
const contenido = document.getElementById('contenido');

let vista = "dia"; // o "semana"

// --------- Funciones ---------

// Obtener el lunes de la semana de una fecha
function obtenerSemanaCompleta(fechaStr) {
  const fecha = new Date(fechaStr);
  const diaSemana = fecha.getDay(); // 0 (domingo) - 6 (sábado)
  const lunes = new Date(fecha);
  lunes.setDate(fecha.getDate() - ((diaSemana + 6) % 7));

  const dias = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    dias.push(d);
  }
  return dias;
}

// Formato yyyy-mm-dd
function formatearFecha(date) {
  return date.toISOString().split("T")[0];
}

// Formato "martes 28 may"
function formatearFechaCorta(date) {
  return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
}

// Mostrar tabla por día
async function mostrarVistaDia(fechaStr) {
  const guiasSnap = await get(ref(db, 'guias'));
  const horariosSnap = await get(ref(db, `horarios/${fechaStr}`));

  const guias = guiasSnap.exists() ? guiasSnap.val() : {};
  const horarios = horariosSnap.exists() ? horariosSnap.val() : {};

  let html = `<h2>Horario para el ${new Date(fechaStr).toLocaleDateString()}</h2>`;
  html += `
    <table>
      <thead>
        <tr>
          <th>Guía</th>
          <th>Disponible</th>
          <th>Horario</th>
          <th>Eventos</th>
        </tr>
      </thead>
      <tbody>
  `;

  Object.entries(guias).forEach(([id, guia]) => {
    const h = horarios[id] || {};
    const disponible = h.disponible ?? true;
    const horaInicio = h.horaInicio ?? "09:00";
    const horaFin = h.horaFin ?? "20:00";
    const eventos = h.eventosAsignados ?? 0;

    html += `
      <tr>
        <td>${guia.nombre}</td>
        <td>${disponible ? "✅" : "❌"}</td>
        <td>${disponible ? `${horaInicio} - ${horaFin}` : "-"}</td>
        <td>${eventos} / 3</td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  contenido.innerHTML = html;
}

// Mostrar tabla por semana
async function mostrarVistaSemana(fechaStr) {
  const fechasSemana = obtenerSemanaCompleta(fechaStr);
  const guiasSnap = await get(ref(db, 'guias'));
  const guias = guiasSnap.exists() ? guiasSnap.val() : {};

  // Obtener horarios por cada día
  const horariosPorDia = {};
  for (let fecha of fechasSemana) {
    const key = formatearFecha(fecha);
    const snap = await get(ref(db, `horarios/${key}`));
    horariosPorDia[key] = snap.exists() ? snap.val() : {};
  }

  let html = `<h2>Semana del ${formatearFechaCorta(fechasSemana[0])} al ${formatearFechaCorta(fechasSemana[6])}</h2>`;
  html += `
    <table>
      <thead>
        <tr>
          <th>Guía</th>
          ${fechasSemana.map(f => `<th>${formatearFechaCorta(f)}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;

  Object.entries(guias).forEach(([id, guia]) => {
    html += `<tr><td>${guia.nombre}</td>`;
    fechasSemana.forEach(f => {
      const fechaKey = formatearFecha(f);
      const h = horariosPorDia[fechaKey]?.[id] || {};
      const disponible = h.disponible ?? true;
      const eventos = h.eventosAsignados ?? 0;
      const color = disponible ? "✅" : "❌";
      html += `<td>${color}<br>${eventos} / 3</td>`;
    });
    html += `</tr>`;
  });

  html += '</tbody></table>';
  contenido.innerHTML = html;
}

// Cambiar vista activa
function cambiarVista(nuevaVista) {
  vista = nuevaVista;
  btnDia.classList.toggle("active", vista === "dia");
  btnSemana.classList.toggle("active", vista === "semana");
  if (fechaInput.value) {
    vista === "dia"
      ? mostrarVistaDia(fechaInput.value)
      : mostrarVistaSemana(fechaInput.value);
  }
}

// --------- Eventos ---------
btnDia.addEventListener("click", () => cambiarVista("dia"));
btnSemana.addEventListener("click", () => cambiarVista("semana"));

fechaInput.addEventListener("change", () => {
  if (!fechaInput.value) return;
  vista === "dia"
    ? mostrarVistaDia(fechaInput.value)
    : mostrarVistaSemana(fechaInput.value);
});

// Inicial: mostrar por día si ya hay fecha seleccionada
if (fechaInput.value) mostrarVistaDia(fechaInput.value);
