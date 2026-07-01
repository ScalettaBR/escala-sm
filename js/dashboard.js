// ======================================================
// Escala São Miguel
// dashboard.js
// ======================================================

import { auth, db } from "../firebase.js";
import { logout } from "./auth.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    collection,
    getCountFromServer
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ======================================================
// Elementos
// ======================================================

const btnLogout = document.getElementById("btnLogout");
const totalFuncionarios = document.getElementById("totalFuncionarios");

if (!totalFuncionarios) {
    console.warn("Elemento totalFuncionarios não encontrado");
}

// ======================================================
// Verificar autenticação
// ======================================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    carregarTotalFuncionarios();

});

// ======================================================
// Carregar quantidade de funcionários
// ======================================================

async function carregarTotalFuncionarios() {

    try {

        const snapshot = await getCountFromServer(
            collection(db, "funcionarios")
        );

        totalFuncionarios.textContent = snapshot.data().count;

    } catch (error) {

        console.error(error);

        totalFuncionarios.textContent = "--";

    }

}

// ======================================================
// Logout
// ======================================================

btnLogout.addEventListener("click", async () => {

    const sair = confirm("Deseja realmente sair do sistema?");

    if (!sair) return;

    try {

        await logout();

    } catch (error) {

        console.error(error);

        alert("Erro ao realizar logout.");

    }

});