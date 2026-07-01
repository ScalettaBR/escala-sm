// ======================================================
// Escala São Miguel
// auth.js
// ======================================================

import { auth, lembrarLogin, sessaoTemporaria } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


// ======================================================
// ELEMENTOS
// ======================================================

const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const remember = document.getElementById("remember");
const loginMessage = document.getElementById("loginMessage");
const btnLogin = document.getElementById("btnLogin");
const loginText = document.getElementById("loginText");
const loading = document.getElementById("loading");
const forgotPassword = document.getElementById("forgotPassword");
const togglePassword = document.getElementById("togglePassword");


// ======================================================
// MENSAGEM
// ======================================================

function mostrarMensagem(texto, cor = "#ef4444") {

    if (!loginMessage) return;

    loginMessage.innerText = texto;
    loginMessage.style.color = cor;

}


// ======================================================
// LOADING
// ======================================================

function iniciarLoading() {

    if (!btnLogin) return;

    btnLogin.disabled = true;
    loginText?.classList.add("hidden");
    loading?.classList.remove("hidden");

}

function finalizarLoading() {

    if (!btnLogin) return;

    btnLogin.disabled = false;
    loginText?.classList.remove("hidden");
    loading?.classList.add("hidden");

}


// ======================================================
// TOGGLE SENHA
// ======================================================

if (togglePassword && password) {

    togglePassword.addEventListener("click", () => {

        if (password.type === "password") {

            password.type = "text";

            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye-slash"></i>';

        } else {

            password.type = "password";

            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye"></i>';

        }

    });

}


// ======================================================
// LOGIN
// ======================================================

if (form) {

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        mostrarMensagem("");
        iniciarLoading();

        try {

            if (remember?.checked) {
                await lembrarLogin();
            } else {
                await sessaoTemporaria();
            }

            await signInWithEmailAndPassword(
                auth,
                email.value.trim(),
                password.value
            );

            mostrarMensagem("Login realizado com sucesso!", "#16a34a");

        } catch (error) {

            let mensagem = "Erro ao realizar login.";

            switch (error.code) {

                case "auth/invalid-email":
                    mensagem = "E-mail inválido.";
                    break;

                case "auth/user-not-found":
                    mensagem = "Usuário não encontrado.";
                    break;

                case "auth/wrong-password":
                    mensagem = "Senha incorreta.";
                    break;

                case "auth/invalid-credential":
                    mensagem = "E-mail ou senha inválidos.";
                    break;

                case "auth/too-many-requests":
                    mensagem = "Muitas tentativas. Aguarde alguns minutos.";
                    break;

                default:
                    mensagem = error.message;
            }

            mostrarMensagem(mensagem);

        } finally {

            finalizarLoading();

        }

    });

}


// ======================================================
// RECUPERAR SENHA
// ======================================================

if (forgotPassword && email) {

    forgotPassword.addEventListener("click", async (e) => {

        e.preventDefault();

        if (email.value.trim() === "") {
            mostrarMensagem("Informe seu e-mail primeiro.");
            return;
        }

        try {

            await sendPasswordResetEmail(
                auth,
                email.value.trim()
            );

            mostrarMensagem("E-mail de recuperação enviado.", "#16a34a");

        } catch (error) {

            mostrarMensagem(error.message);

        }

    });

}


// ======================================================
// AUTO LOGIN
// ======================================================

onAuthStateChanged(auth, (user) => {

    const path = window.location.pathname;

    if (user) {

        if (path.includes("login.html") || path === "/" || path.includes("index.html")) {
            window.location.replace("dashboard.html");
        }

    } else {

        if (!path.includes("login.html")) {
            window.location.replace("login.html");
        }
    }

});


// ======================================================
// LOGOUT
// ======================================================

export async function logout() {

    await signOut(auth);
    window.location.href = "login.html";

}
