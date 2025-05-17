import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, get, remove } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBBaMEMyM25ng6s7JINFM_XH6Sx2AsRoiU",
  authDomain: "mifirebase-729f6.firebaseapp.com",
  projectId: "mifirebase-729f6",
  storageBucket: "mifirebase-729f6.firebasestorage.app",
  messagingSenderId: "191927410814",
  appId: "1:191927410814:web:085873d617037fe286382f",
  measurementId: "G-C2PL3F1TQ5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const selectGuia = document.getElementById("select-guia");
const datosGuia = document.getElementById("datos-guia");
const nombreSpan = document.getElementById("nombre-guia");
const correoSpan = document.getElementById("correo-guia");
const colorSpan = document.getElementById("color-guia");
const mensajeDiv = document.getElementById("mensaje");
const form = document.getElementById("form-eliminar-guia");

let guiaIdSeleccionado = null;

// Cargar guías al selector
async function cargarGuias() {
  const dbRef = ref(db, 'guias');
  const snapshot = await get(dbRef);
  if (snapshot.exists()) {
    const guias = snapshot.val();
    for (const id in guias) {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = guias[id].nombre;
      selectGuia.appendChild(option);
    }
  }
}

selectGuia.addEventListener('change', async () => {
  guiaIdSeleccionado = selectGuia.value;
  if (!guiaIdSeleccionado) {
    datosGuia.style.display = 'none';
    return;
  }

  const guiaRef = ref(db, `guias/${guiaIdSeleccionado}`);
  const snapshot = await get(guiaRef);
  if (snapshot.exists()) {
    const guia = snapshot.val();
    nombreSpan.textContent = guia.nombre || '';
    correoSpan.textContent = guia.correo || '';
    colorSpan.textContent = guia.color || '';
    datosGuia.style.display = 'block';
    mensajeDiv.innerHTML = '';
  } else {
    datosGuia.style.display = 'none';
    mensajeDiv.innerHTML = '<div class="alert alert-warning">Guía no encontrado.</div>';
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!guiaIdSeleccionado) return;

  const confirmar = confirm("¿Estás seguro de que deseas eliminar este guía?");
  if (!confirmar) return;

  const guiaRef = ref(db, `guias/${guiaIdSeleccionado}`);
  try {
    await remove(guiaRef);
    mensajeDiv.innerHTML = '<div class="alert alert-success">Guía eliminada correctamente.</div>';
    datosGuia.style.display = 'none';
    selectGuia.selectedIndex = 0;
    selectGuia.innerHTML = `<option value="" disabled selected>-- Selecciona un guía --</option>`;
    cargarGuias(); // Recargar opciones
  } catch (error) {
    mensajeDiv.innerHTML = `<div class="alert alert-danger">Error al eliminar: ${error.message}</div>`;
  }
});

// Carga inicial
cargarGuias();