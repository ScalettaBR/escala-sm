import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// =========================
// LOGIN
// =========================

const form = document.getElementById("loginForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/home.html";
    } catch (err) {
      alert("Erro no login: " + err.message);
    }
  });
}

// =========================
// PROTEÇÃO DE ROTAS (SEM LOOP)
// =========================

const isLoginPage = window.location.pathname.includes("login");
const isHomePage = window.location.pathname.includes("home");

onAuthStateChanged(auth, (user) => {
  if (user && isLoginPage) {
    window.location.href = "/home.html";
  }

  if (!user && isHomePage) {
    window.location.href = "/login.html";
  }
});

// =========================
// LOGOUT
// =========================

export function logout() {
  signOut(auth);
  window.location.href = "/login.html";
}
