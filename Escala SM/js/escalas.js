// =====================================================
// Escala São Miguel
// escalas.js
// =====================================================

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// =====================================================
// ELEMENTOS
// =====================================================

const thead = document.getElementById("thead");
const tbody = document.getElementById("tbody");

const mesInput = document.getElementById("mes");
const btnGerar = document.getElementById("btnGerar");
const btnSalvar = document.getElementById("btnSalvar");

const menu = document.getElementById("menuCelula");

// estado global da escala
let funcionarios = [];
let escala = {};
let celulaAtiva = null;

// =====================================================
// CARREGAR FUNCIONÁRIOS
// =====================================================

async function carregarFuncionarios() {

    const snap = await getDocs(collection(db, "funcionarios"));

    funcionarios = [];

    snap.forEach(doc => {

        const data = doc.data();

        if (data.status === "Ativo") {

            funcionarios.push({
                id: doc.id,
                nome: data.nome,
                funcao: data.funcao,
                turno: data.turno
            });

        }

    });

}

// =====================================================
// GERAR DIAS DO MÊS
// =====================================================

function gerarDias(ano, mes) {

    const dias = [];

    const total = new Date(ano, mes + 1, 0).getDate();

    for (let i = 1; i <= total; i++) {

        dias.push(i);

    }

    return dias;

}

// =====================================================
// CRIAR TABELA
// =====================================================

function criarTabela(dias) {

    thead.innerHTML = "";
    tbody.innerHTML = "";

    // HEADER
    let header = "<tr><th>Funcionário</th>";

    dias.forEach(d => {

        header += `<th>${d}</th>`;

    });

    header += "</tr>";

    thead.innerHTML = header;

    // LINHAS
    funcionarios.forEach(f => {

        let row = `<tr data-id="${f.id}">`;

        row += `<td>${f.nome} (${f.funcao})</td>`;

        dias.forEach(d => {

            const key = `${f.id}-${d}`;

            if (!escala[key]) {
                escala[key] = "X";
            }

            row += `<td data-key="${key}">${escala[key]}</td>`;

        });

        row += "</tr>";

        tbody.innerHTML += row;

    });

    ativarEventosCelulas();

}

// =====================================================
// CLIQUE NAS CÉLULAS
// =====================================================

function ativarEventosCelulas() {

    document.querySelectorAll("#tabelaEscala td[data-key]").forEach(td => {

        td.addEventListener("click", (e) => {

            celulaAtiva = td;

            const rect = td.getBoundingClientRect();

            menu.style.top = rect.top + window.scrollY + "px";
            menu.style.left = rect.left + window.scrollX + "px";

            menu.classList.remove("hidden");

        });

    });

}

// =====================================================
// MENU DE ALTERAÇÃO
// =====================================================

menu.addEventListener("click", (e) => {

    if (e.target.tagName !== "BUTTON") return;

    const valor = e.target.dataset.value;

    if (celulaAtiva) {

        celulaAtiva.innerText = valor;

        escala[celulaAtiva.dataset.key] = valor;

    }

    menu.classList.add("hidden");

});

// fechar ao clicar fora
document.addEventListener("click", (e) => {

    if (!menu.contains(e.target)) {

        menu.classList.add("hidden");

    }

});

// =====================================================
// GERAR ESCALA
// =====================================================

btnGerar.addEventListener("click", async () => {

    if (!mesInput.value) {
        alert("Selecione o mês");
        return;
    }

    await carregarFuncionarios();

    const mes = mesInput.value;

    const [ano, m] = mes.split("-");

    const dias = gerarDias(parseInt(ano), parseInt(m) - 1);

    await carregarEscalaExistente(mes);

    criarTabela(dias);

});

// =====================================================
// CARREGAR ESCALA
// =====================================================
async function carregarEscalaExistente(mes) {

    const ref = doc(db, "escalas", mes);

    const snap = await getDoc(ref);

    if (snap.exists()) {

        const data = snap.data();

        escala = data.dados || {};

        return true;

    }

    escala = {};

    return false;

}
// =====================================================
// SALVAR (BASE SIMPLES)
// =====================================================

btnSalvar.addEventListener("click", async () => {

    if (!mesInput.value) {
        alert("Selecione um mês");
        return;
    }

    try {

        const ref = doc(db, "escalas", mesInput.value);

        await setDoc(ref, {

            mes: mesInput.value,
            dados: escala,
            updatedAt: serverTimestamp()

        }, { merge: true });

        alert("Escala salva com sucesso no Firebase!");

    } catch (error) {

        console.error(error);

        alert("Erro ao salvar escala");

    }

});

// =====================================================
// INICIALIZAÇÃO
// =====================================================

window.addEventListener("load", () => {

    console.log("Escalas carregado");

});