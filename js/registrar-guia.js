// Importar módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

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

// Escuchar envío del formulario
document.getElementById('form-guia').addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const correo = document.getElementById('correo').value;
  const color = document.getElementById('color').value;

  const guiaRef = ref(db, 'guias');
  const nuevaGuiaRef = push(guiaRef);

  set(nuevaGuiaRef, {
    nombre,
    correo,
    color
  })
    .then(() => {
      alert("Guía registrada correctamente");
      document.getElementById('form-guia').reset();
    })
    .catch((error) => {
      console.error("Error al registrar guía:", error);
      alert("Error al registrar guía");
    });
});


// Manejar envío del formulario
document.getElementById('form-guia').addEventListener('submit', function (e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const correo = document.getElementById('correo').value;
  const color = document.getElementById('color').value;

  // Referencia al nodo "guias"
  const guiasRef = ref(db, 'guias');
  const nuevoGuiaRef = push(guiasRef);

  set(nuevoGuiaRef, {
    nombre,
    correo,
    color
  })
    .then(() => {
      alert('Guía registrada exitosamente.');
      document.getElementById('form-guia').reset();
    })
    .catch((error) => {
      console.error("Error al registrar:", error);
      alert('Hubo un error al registrar la guía.');
    });
});
