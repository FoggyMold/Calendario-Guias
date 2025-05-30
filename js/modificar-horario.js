// Importar módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, get, set, child } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// Configuración
const firebaseConfig = {
  apiKey: "AIzaSyBBaMEMyM25ng6s7JINFM_XH6Sx2AsRoiU",
  authDomain: "mifirebase-729f6.firebaseapp.com",
  databaseURL: "https://mifirebase-729f6-default-rtdb.firebaseio.com/",
  projectId: "mifirebase-729f6",
  storageBucket: "mifirebase-729f6.firebasestorage.app",
  messagingSenderId: "191927410814",
  appId: "1:191927410814:web:085873d617037fe286382f",
  measurementId: "G-C2PL3F1TQ5"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Días de la semana
const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Referencias DOM
const guiaSelect = document.getElementById('seleccionar-guia');
const diasContainer = document.getElementById('dias-container');
const formHorario = document.getElementById('form-horario');

// Cargar guías
function cargarGuias() {
  const guiasRef = ref(db, 'guias');
  get(guiasRef).then((snapshot) => {
    if (snapshot.exists()) {
      const guias = snapshot.val();
      for (const id in guias) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = guias[id].nombre;
        guiaSelect.appendChild(option);
      }
    }
  });
}

// Generar formulario por día
function generarFormularioHorario() {
  diasContainer.innerHTML = '';
  diasSemana.forEach(dia => {
    const diaHTML = `
      <div class="form-group">
        <label>
          <input type="checkbox" class="chk-disponible" data-dia="${dia}" checked>
          Disponible el ${dia}
        </label>
        <div class="horarios" id="horarios-${dia}">
          <label>Hora de inicio:</label>
          <input type="time" id="inicio-${dia}" value="09:00" class="form-control">
          <label>Hora de fin:</label>
          <input type="time" id="fin-${dia}" value="20:00" class="form-control">
          <label>Límite de eventos:</label>
          <input type="number" id="limite-${dia}" min="1" max="10" value="3" class="form-control">
        </div>
      </div>
    `;
    diasContainer.insertAdjacentHTML('beforeend', diaHTML);
  });

  // Escuchar cambios de disponibilidad
  document.querySelectorAll('.chk-disponible').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
      const dia = this.dataset.dia;
      document.getElementById(`horarios-${dia}`).style.display = this.checked ? 'block' : 'none';
    });
  });
}

// Guardar horario
formHorario.addEventListener('submit', function (e) {
  e.preventDefault();

  const guiaId = guiaSelect.value;
  if (!guiaId) {
    alert("Selecciona un guía primero.");
    return;
  }

  const horario = {};

  diasSemana.forEach(dia => {
    const disponible = document.querySelector(`.chk-disponible[data-dia="${dia}"]`).checked;

    if (disponible) {
      const inicio = document.getElementById(`inicio-${dia}`).value;
      const fin = document.getElementById(`fin-${dia}`).value;
      const limite = parseInt(document.getElementById(`limite-${dia}`).value);

      horario[dia] = {
        disponible: true,
        inicio,
        fin,
        limiteEventos: limite || 3
      };
    } else {
      horario[dia] = { disponible: false };
    }
  });

  set(ref(db, `horarios/${guiaId}`), horario)
    .then(() => alert("Horario guardado correctamente."))
    .catch((error) => {
      console.error("Error al guardar horario:", error);
      alert("Hubo un error al guardar el horario.");
    });
});

// Inicializar
cargarGuias();
generarFormularioHorario();