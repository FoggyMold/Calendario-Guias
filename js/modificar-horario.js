// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, onValue, set, get, child } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

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

// Referencias DOM
const tablaGuias = document.querySelector('#tabla-guias tbody');
const fechaInput = document.getElementById('fecha');
const btnGuardar = document.getElementById('guardar-cambios');

let guias = {};

// Cargar guías
function cargarGuias() {
  const guiasRef = ref(db, 'guias');
  onValue(guiasRef, (snapshot) => {
    guias = snapshot.val() || {};
    mostrarGuias();
  });
}

// Mostrar tabla de guías
function mostrarGuias() {
  tablaGuias.innerHTML = '';
  Object.entries(guias).forEach(([id, guia]) => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${guia.nombre}</td>
      <td><input type="checkbox" class="disponible" data-id="${id}" checked></td>
      <td><input type="time" class="hora-inicio horario-input" data-id="${id}" value="09:00"></td>
      <td><input type="time" class="hora-fin horario-input" data-id="${id}" value="20:00"></td>
    `;

    tablaGuias.appendChild(fila);
  });
}

// Cambiar habilitación de horarios al marcar o desmarcar disponibilidad
tablaGuias.addEventListener('change', (e) => {
  if (e.target.classList.contains('disponible')) {
    const id = e.target.dataset.id;
    const inicio = document.querySelector(`.hora-inicio[data-id="${id}"]`);
    const fin = document.querySelector(`.hora-fin[data-id="${id}"]`);
    const habilitado = e.target.checked;
    inicio.disabled = !habilitado;
    fin.disabled = !habilitado;
    if (!habilitado) {
      inicio.classList.add('disabled');
      fin.classList.add('disabled');
    } else {
      inicio.classList.remove('disabled');
      fin.classList.remove('disabled');
    }
  }
});

// Guardar cambios
btnGuardar.addEventListener('click', async () => {
  const fecha = fechaInput.value;
  if (!fecha) return alert('Selecciona una fecha');

  const cambios = {};
  const filas = tablaGuias.querySelectorAll('tr');

  for (let fila of filas) {
    const id = fila.querySelector('.disponible').dataset.id;
    const disponible = fila.querySelector('.disponible').checked;

    if (disponible) {
      const horaInicio = fila.querySelector('.hora-inicio').value;
      const horaFin = fila.querySelector('.hora-fin').value;

      // Validación simple de horario
      if (horaInicio >= horaFin) {
        alert(`Error en los horarios de ${guias[id].nombre}`);
        return;
      }

      cambios[id] = {
        disponible: true,
        horaInicio,
        horaFin
      };
    } else {
      cambios[id] = { disponible: false };
    }
  }

  const refDia = ref(db, `horarios/${fecha}`);
  await set(refDia, cambios);

  alert('Horarios guardados correctamente');
});

cargarGuias();
