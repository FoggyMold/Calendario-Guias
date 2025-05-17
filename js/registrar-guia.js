import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

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

const form = document.getElementById("form-registro");
const mensajeDiv = document.getElementById("mensaje");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // ✅ Previene el envío por defecto

  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const color = document.getElementById("color").value.trim();

  if (!nombre || !correo || !color) {
    mensajeDiv.innerHTML = `<div class="alert alert-warning">Por favor completa todos los campos.</div>`;
    return;
  }

  try {
    const nuevoGuiaRef = push(ref(db, "guias")); // ✅ Solo una vez
    await set(nuevoGuiaRef, {
      nombre,
      correo,
      color
    });

    mensajeDiv.innerHTML = `<div class="alert alert-success">Guía registrado exitosamente.</div>`;
    form.reset();
  } catch (error) {
    mensajeDiv.innerHTML = `<div class="alert alert-danger">Error al registrar: ${error.message}</div>`;
  }
});
