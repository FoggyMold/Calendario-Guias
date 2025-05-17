import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// Tu configuración de Firebase (igual que en los otros archivos)
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

const selectGuia = document.getElementById('select-guia');
const camposActualizar = document.getElementById('campos-actualizar');
const mensajeDiv = document.getElementById('mensaje');
const form = document.getElementById('form-actualizar-guia');

let guiaSeleccionadoId = null;

// Cargar las guías en el selector
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
  guiaSeleccionadoId = selectGuia.value;
  if (!guiaSeleccionadoId) {
    camposActualizar.style.display = 'none';
    return;
  }

  const guiaRef = ref(db, `guias/${guiaSeleccionadoId}`);
  const snapshot = await get(guiaRef);
  if (snapshot.exists()) {
    const guia = snapshot.val();
    document.getElementById('nombre').value = guia.nombre || '';
    document.getElementById('correo').value = guia.correo || '';
    document.getElementById('color').value = guia.color || '#f9a72d';
    camposActualizar.style.display = 'block';
    mensajeDiv.innerHTML = '';
  } else {
    camposActualizar.style.display = 'none';
    mensajeDiv.innerHTML = '<div class="alert alert-warning">Guía no encontrado.</div>';
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!guiaSeleccionadoId) return;

  const nombre = document.getElementById('nombre').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const color = document.getElementById('color').value;

  if (!nombre || !correo) {
    mensajeDiv.innerHTML = '<div class="alert alert-danger">Por favor, completa todos los campos requeridos.</div>';
    return;
  }

  const guiaRef = ref(db, `guias/${guiaSeleccionadoId}`);
  try {
    await update(guiaRef, { nombre, correo, color });
    mensajeDiv.innerHTML = '<div class="alert alert-success">Guía actualizada correctamente.</div>';
  } catch (error) {
    mensajeDiv.innerHTML = `<div class="alert alert-danger">Error al actualizar: ${error.message}</div>`;
  }
});

// Carga inicial
cargarGuias();