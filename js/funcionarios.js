import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ===================== ELEMENTOS =====================

const lista = document.getElementById("listaFuncionarios");

const modal = document.getElementById("modal");

const btnNovo = document.getElementById("btnNovo");

const btnSalvar = document.getElementById("btnSalvar");

const btnCancelar = document.getElementById("btnCancelar");

// inputs

const id = document.getElementById("id");

const nome = document.getElementById("nome");

const matricula = document.getElementById("matricula");

const funcao = document.getElementById("funcao");

const turno = document.getElementById("turno");

const status = document.getElementById("status");

// ===================== ABRIR MODAL =====================

btnNovo.addEventListener("click", () => {

    limpar();

    modal.classList.remove("hidden");

});

// ===================== FECHAR MODAL =====================

btnCancelar.addEventListener("click", () => {

    modal.classList.add("hidden");

});

// ===================== SALVAR =====================

btnSalvar.addEventListener("click", async () => {

    const dados = {

        nome: nome.value,
        matricula: matricula.value,
        funcao: funcao.value,
        turno: turno.value,
        status: status.value

    };

    if (id.value) {

        await updateDoc(doc(db, "funcionarios", id.value), dados);

    } else {

        await addDoc(collection(db, "funcionarios"), dados);

    }

    modal.classList.add("hidden");

});

// ===================== LISTAR =====================

onSnapshot(collection(db, "funcionarios"), (snapshot) => {

    lista.innerHTML = "";

    snapshot.forEach((docItem) => {

        const d = docItem.data();

        lista.innerHTML += `

        <tr>

            <td>${d.nome}</td>

            <td>${d.matricula}</td>

            <td>${d.funcao}</td>

            <td>${d.turno}</td>

            <td>${d.status}</td>

            <td>

                <button onclick="editar('${docItem.id}', '${d.nome}', '${d.matricula}', '${d.funcao}', '${d.turno}', '${d.status}')">Editar</button>

                <button onclick="excluir('${docItem.id}')">Excluir</button>

            </td>

        </tr>

        `;

    });

});

// ===================== EDITAR =====================

window.editar = (i, n, m, f, t, s) => {

    id.value = i;

    nome.value = n;

    matricula.value = m;

    funcao.value = f;

    turno.value = t;

    status.value = s;

    modal.classList.remove("hidden");

};

// ===================== EXCLUIR =====================

window.excluir = async (i) => {

    if (confirm("Excluir funcionário?")) {

        await deleteDoc(doc(db, "funcionarios", i));

    }

};

// ===================== LIMPAR =====================

function limpar() {

    id.value = "";

    nome.value = "";

    matricula.value = "";

    funcao.value = "";

    turno.value = "";

    status.value = "Ativo";

}