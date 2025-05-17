
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
  import { getDatabase, ref, push, set, get, child } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

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

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-guia');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value.trim();
      const correo = document.getElementById('correo').value.trim().toLowerCase();
      const color = document.getElementById('color').value;

      const guiaRef = ref(db, 'guias');

      try {
        const snapshot = await get(guiaRef);
        let guiaExistente = false;

        if (snapshot.exists()) {
          snapshot.forEach(childSnapshot => {
            const guia = childSnapshot.val();
            if (guia.correo.toLowerCase() === correo) {
              guiaExistente = true;
            }
          });
        }

        if (guiaExistente) {
          alert("Este guía ya está registrado.");
        } else {
          const nuevaGuiaRef = push(guiaRef);
          await set(nuevaGuiaRef, { nombre, correo, color });
          alert("Guía registrada correctamente");
          form.reset();
        }
      } catch (error) {
        console.error("Error al registrar guía:", error);
        alert("Error al registrar guía");
      }
    });
  });
