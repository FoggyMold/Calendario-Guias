// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// Configuración Firebase (misma que en registrar-guia.js)
const firebaseConfig = {
  apiKey: "AIzaSyBBaMEMyM25ng6s7JINFM_XH6Sx2AsRoiU",
  authDomain: "mifirebase-729f6.firebaseapp.com",
  databaseURL: "https://mifirebase-729f6-default-rtdb.firebaseio.com/",
  projectId: "mifirebase-729f6",
  storageBucket: "mifirebase-729f6.firebasestorage.app",
  messagingSenderId: "191927410814",
  appId: "1:191927410814:web:085873d617037fe286382f"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const fechaInput = document.getElementById('fecha');
const semanaDiv = document.getElementById('semana');
const tablaDiv = document.getElementById('tabla-guias');

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

// Formatear fecha a yyyy-mm-dd
function formatearFecha(date) {
  return date.toISOString().split("T")[0];
}

// Mostrar encabezado de semana
function mostrarSemana(fechas) {
  semanaDiv.innerHTML = "";
  fechas.forEach(f => {
    const div = document.createElement('div');
    div.textContent = f.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' });
    semanaDiv.appendChild(div);
  });
}

// Mostrar guías disponibles para una fecha específica
async function mostrarGuiasDisponibles(fechaSeleccionada) {
  const guiasSnap = await get(ref(db, 'guias'));
  const horariosSnap = await get(ref(db, `horarios/${fechaSeleccionada}`));

  const guias = guiasSnap.exists() ? guiasSnap.val() : {};
  const horarios = horariosSnap.exists() ? horariosSnap.val() : {};

  let html = '<table><thead><tr><th>Guía</th><th>Disponible</th><th>Inicio</th><th>Fin</th></tr></thead><tbody>';

  Object.entries(guias).forEach(([id, guia]) => {
    const disponible = horarios[id]?.disponible ?? true;
    const inicio = horarios[id]?.horaInicio ?? "09:00";
    const fin = horarios[id]?.horaFin ?? "20:00";

    if (disponible && inicio === "09:00" && fin === "20:00") {
      html += `
        <tr>
          <td>${guia.nombre}</td>
          <td>✅</td>
          <td>${inicio}</td>
          <td>${fin}</td>
        </tr>
      `;
    }
  });

  html += '</tbody></table>';
  tablaDiv.innerHTML = html;
}

// Evento cuando se selecciona una fecha
fechaInput.addEventListener('change', () => {
  const fecha = fechaInput.value;
  if (!fecha) return;

  const semana = obtenerSemanaCompleta(fecha);
  mostrarSemana(semana);
  mostrarGuiasDisponibles(fecha);
});
