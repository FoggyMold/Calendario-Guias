// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

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
const tablaGuias = document.querySelector('#tabla-guias tbody');
const formHorarios = document.getElementById('form-horarios');

let guias = {};

// Cargar guías desde Firebase
async function cargarGuias() {
  const snapshot = await get(ref(db, 'guias'));
  if (snapshot.exists()) {
    guias = snapshot.val();
    if (fechaInput.value) {
      cargarHorarios(fechaInput.value);
    }
  }
}

// Cargar horarios para la fecha seleccionada
async function cargarHorarios(fecha) {
  const snapshot = await get(ref(db, `horarios/${fecha}`));
  const horarios = snapshot.exists() ? snapshot.val() : {};

  tablaGuias.innerHTML = '';

  Object.entries(guias).forEach(([id, guia]) => {
    const horario = horarios[id] || {
      disponible: true,
      horaInicio: '09:00',
      horaFin: '20:00'
    };

    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${guia.nombre}</td>
      <td><input type="checkbox" class="disponible" data-id="${id}" ${horario.disponible ? 'checked' : ''}></td>
      <td><input type="time" class="hora-inicio" data-id="${id}" value="${horario.horaInicio || '09:00'}" ${horario.disponible ? '' : 'disabled'}></td>
      <td><input type="time" class="hora-fin" data-id="${id}" value="${horario.horaFin || '20:00'}" ${horario.disponible ? '' : 'disabled'}></td>
    `;

    tablaGuias.appendChild(tr);
  });
}

// Habilitar/deshabilitar campos según checkbox
tablaGuias.addEventListener('change', (e) => {
  if (e.target.classList.contains('disponible')) {
    const id = e.target.dataset.id;
    const checked = e.target.checked;

    const inicio = document.querySelector(`.hora-inicio[data-id="${id}"]`);
    const fin = document.querySelector(`.hora-fin[data-id="${id}"]`);

    inicio.disabled = !checked;
    fin.disabled = !checked;
  }
});

// Guardar cambios al enviar el formulario
formHorarios.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fecha = fechaInput.value;
  if (!fecha) {
    alert('Selecciona una fecha');
    return;
  }

  const datos = {};
  Object.keys(guias).forEach(id => {
    const disponible = document.querySelector(`.disponible[data-id="${id}"]`).checked;
    const horaInicio = document.querySelector(`.hora-inicio[data-id="${id}"]`).value;
    const horaFin = document.querySelector(`.hora-fin[data-id="${id}"]`).value;

    datos[id] = {
      disponible,
      horaInicio: disponible ? horaInicio : null,
      horaFin: disponible ? horaFin : null
    };
  });

  await set(ref(db, `horarios/${fecha}`), datos);
  alert('Horarios guardados correctamente');
});

// Cargar cuando se cambia la fecha
fechaInput.addEventListener('change', () => {
  if (fechaInput.value) {
    cargarHorarios(fechaInput.value);
  }
});

// Iniciar
cargarGuias();
