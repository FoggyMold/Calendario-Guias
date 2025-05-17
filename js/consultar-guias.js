// Importar desde CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js";

// Tu configuración de Firebase (misma que en registrar)
const firebaseConfig = {
  apiKey: "AIzaSyBBaMEMyM25ng6s7JINFM_XH6Sx2AsRoiU",
  authDomain: "mifirebase-729f6.firebaseapp.com",
  projectId: "mifirebase-729f6",
  storageBucket: "mifirebase-729f6.firebasestorage.app",
  messagingSenderId: "191927410814",
  appId: "1:191927410814:web:085873d617037fe286382f",
  measurementId: "G-C2PL3F1TQ5"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Referencia a la tabla HTML
const tbody = document.querySelector("#tabla-guias tbody");

// Escuchar cambios en la base de datos
const guiasRef = ref(database, "guias");

onValue(guiasRef, (snapshot) => {
  // Limpiar contenido actual
  tbody.innerHTML = "";

  // Recorrer todos los guías
  snapshot.forEach((childSnapshot) => {
    const id = childSnapshot.key;
    const guia = childSnapshot.val();

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${id}</td>
      <td>${guia.nombre}</td>
      <td>${guia.correo}</td>
      <td><div style="width: 30px; height: 30px; background: ${guia.color}; border-radius: 50%; margin: auto;"></div></td>
    `;

    tbody.appendChild(fila);
  });
});