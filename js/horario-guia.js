// js/horario-guias.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// Configuración de Firebase
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

const tablaBody = document.querySelector('#tabla-horarios tbody');
const filtroSelect = document.getElementById('filtro-guia');

// Cargar datos
async function cargarDatos() {
  const dbRef = ref(db);
  const snapshotGuias = await get(child(dbRef, 'guias'));
  const snapshotDisponibilidad = await get(child(dbRef, 'disponibilidad'));

  if (!snapshotGuias.exists()) return;

  const guias = snapshotGuias.val();
  const disponibilidad = snapshotDisponibilidad.exists() ? snapshotDisponibilidad.val() : {};

  tablaBody.innerHTML = '';
  filtroSelect.innerHTML = '<option value="">Todos</option>';

  Object.entries(guias).forEach(([id, guia]) => {
    const dias = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
    const fila = document.createElement('tr');
    fila.setAttribute('data-id', id);

    // Columna del nombre
    const tdNombre = document.createElement('td');
    tdNombre.textContent = guia.nombre;
    fila.appendChild(tdNombre);

    dias.forEach(dia => {
      const td = document.createElement('td');
      const disponible = disponibilidad[id]?.[dia] === true;
      td.textContent = disponible ? '✅' : '❌';
      fila.appendChild(td);
    });

    tablaBody.appendChild(fila);

    // Agregar al filtro
    const option = document.createElement('option');
    option.value = id;
    option.textContent = guia.nombre;
    filtroSelect.appendChild(option);
  });
}

// Filtro por guía
filtroSelect.addEventListener('change', () => {
  const filtro = filtroSelect.value;
  document.querySelectorAll('#tabla-horarios tbody tr').forEach(tr => {
    const mostrar = !filtro || tr.getAttribute('data-id') === filtro;
    tr.style.display = mostrar ? '' : 'none';
  });
});

// Ejecutar carga
cargarDatos();
