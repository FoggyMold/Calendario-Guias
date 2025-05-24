// Importar módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

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

// Elementos del DOM
const selectGuia = document.getElementById('guia-select');
const checkbox = document.getElementById('disponible');
const form = document.getElementById('form-horario-guia');
const mensaje = document.getElementById('mensaje');

// Cargar guías desde Firebase
function cargarGuias() {
  const dbRef = ref(db);
  get(child(dbRef, 'guias')).then(snapshot => {
    if (snapshot.exists()) {
      selectGuia.innerHTML = '<option value="">Selecciona un guía</option>';
      const guias = snapshot.val();
      for (let id in guias) {
        const guia = guias[id];
        const option = document.createElement('option');
        option.value = id;
        option.textContent = guia.nombre;
        selectGuia.appendChild(option);
      }
    } else {
      selectGuia.innerHTML = '<option value="">No hay guías registrados</option>';
    }
  }).catch(error => {
    console.error("Error al cargar guías:", error);
  });
}

// Guardar disponibilidad
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const guiaID = selectGuia.value;
  const disponible = checkbox.checked;

  if (!guiaID) {
    alert("Por favor selecciona un guía.");
    return;
  }

  const disponibilidadRef = ref(db, 'disponibilidad/' + guiaID);
  const datos = disponible
    ? { disponible: true, inicio: "09:00", fin: "20:00" }
    : { disponible: false };

  set(disponibilidadRef, datos)
    .then(() => {
      mensaje.innerHTML = `<div class="alert alert-success">Horario guardado correctamente.</div>`;
    })
    .catch((error) => {
      console.error("Error al guardar horario:", error);
      mensaje.innerHTML = `<div class="alert alert-danger">Ocurrió un error al guardar.</div>`;
    });
});

// Inicializar
cargarGuias();