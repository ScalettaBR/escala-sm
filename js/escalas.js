// =====================================================
// Escala São Miguel
// escalas.js
// =====================================================

import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    getDoc,
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";


// =====================================================
// ELEMENTOS DA TELA
// =====================================================

const thead = document.getElementById("thead");
const tbody = document.getElementById("tbody");

const mesInput = document.getElementById("mes");

const btnGerar = document.getElementById("btnGerar");
const btnSalvar = document.getElementById("btnSalvar");

const menu = document.getElementById("menuCelula");

const btnPDF = document.getElementById("btnPDF");


// =====================================================
// VARIÁVEIS GLOBAIS
// =====================================================

let funcionarios = [];

let funcionariosManha = [];

let funcionariosNoite = [];

let escala = {};

let celulaAtiva = null;


// =====================================================
// CARREGAR FUNCIONÁRIOS
// =====================================================

async function carregarFuncionarios() {

    funcionarios = [];
    funcionariosManha = [];
    funcionariosNoite = [];

    const snapshot = await getDocs(
        collection(db, "funcionarios")
    );

    snapshot.forEach((registro) => {

        const data = registro.data();

        if (data.status !== "Ativo") return;

        const funcionario = {

            id: registro.id,

            nome: data.nome || "",

            funcao: data.funcao || "",

            turno: data.turno || "Manhã"

        };

        funcionarios.push(funcionario);

        if (funcionario.turno === "Manhã") {

            funcionariosManha.push(funcionario);

        } else {

            funcionariosNoite.push(funcionario);

        }

    });

    funcionarios.sort((a, b) =>

        a.nome.localeCompare(b.nome)

    );

}


// =====================================================
// GERAR APENAS SÁBADOS E DOMINGOS
// =====================================================

function gerarDias(ano, mes) {

    const dias = [];

    const ultimoDia = new Date(ano, mes + 1, 0).getDate();

    for (let dia = 1; dia <= ultimoDia; dia++) {

        const data = new Date(ano, mes, dia);

        const semana = data.getDay();

        if (semana === 0 || semana === 6) {

            dias.push({
                numero: dia,
                diaSemana: semana
            });

        }

    }

    return dias;

}

// =====================================================
// VERIFICAR SE É DOMINGO
// =====================================================

function ehDomingo(ano, mes, dia) {

    return new Date(

        ano,
        mes,
        dia

    ).getDay() === 0;

}


// =====================================================
// VERIFICAR SE É SÁBADO
// =====================================================

function ehSabado(ano, mes, dia) {

    return new Date(

        ano,
        mes,
        dia

    ).getDay() === 6;

}


// =====================================================
// CRIA CHAVE DA ESCALA
// =====================================================

function criarChave(funcionarioId, dia) {

    return `${funcionarioId}-${dia}`;

}


// =====================================================
// LIMPAR ESCALA
// =====================================================

function limparEscala() {

    escala = {};

}


// =====================================================
// GERADOR AUTOMÁTICO 6x1
// =====================================================
//
// M = Trabalha
// F = Folga
//
// regra:
//
// trabalha 6 dias
// folga 1
//
// posteriormente iremos adicionar:
//
// sábado/domingo alternado
// funções críticas
// distribuição equilibrada
//
// =====================================================

function gerarEscalaAutomatica(dias) {

    limparEscala();

    funcionarios.forEach((funcionario, indice) => {

        let contador = indice % 7;

      dias.forEach((dia) => {

    const chave = criarChave(
        funcionario.id,
        dia.numero
    );

            if (contador === 6) {

                escala[chave] = "F";

                contador = 0;

            }

            else {

                escala[chave] = "M";

                contador++;

            }

        });

    });

}

// =====================================================
// ORDENAR POR FUNÇÃO E NOME
// =====================================================

function ordenarFuncionarios(lista) {

    return [...lista].sort((a, b) => {

        if (a.funcao !== b.funcao) {

            return a.funcao.localeCompare(b.funcao);

        }

        return a.nome.localeCompare(b.nome);

    });

}


// =====================================================
// CRIAR HEADER
// =====================================================

function criarCabecalho(dias) {

    let html = "";

    html += "<tr>";

    html += "<th>Funcionário</th>";

    html += "<th>Função</th>";

    html += "<th>Turno</th>";

   dias.forEach((dia) => {

    const texto = dia.diaSemana === 6
        ? `Sáb<br>${dia.numero}`
        : `Dom<br>${dia.numero}`;

    html += `<th>${texto}</th>`;

});
    
    html += "</tr>";

    thead.innerHTML = html;

}


// =====================================================
// LINHA DO FUNCIONÁRIO
// =====================================================

function criarLinhaFuncionario(funcionario, dias) {

    let html = "";

    html += `<tr data-id="${funcionario.id}">`;

    html += `<td class="nome">${funcionario.nome}</td>`;

    html += `<td>${funcionario.funcao}</td>`;

    html += `<td>${funcionario.turno}</td>`;

   dias.forEach((dia) => {

    const chave = criarChave(
        funcionario.id,
        dia.numero
    );

        html += `

            <td
                class="celulaEscala"
                data-key="${chave}"
            >

                ${escala[chave] || ""}

            </td>

        `;

    });

    html += "</tr>";

    return html;

}


// =====================================================
// TÍTULO DA SEÇÃO
// =====================================================

function criarTitulo(texto, colunas) {

    return `

        <tr class="tituloTurno">

            <td colspan="${colunas}">

                ${texto}

            </td>

        </tr>

    `;

}


// =====================================================
// AGRUPAR POR FUNÇÃO
// =====================================================

function agruparPorFuncao(lista) {

    const grupos = {};

    lista.forEach((funcionario) => {

        if (!grupos[funcionario.funcao]) {

            grupos[funcionario.funcao] = [];

        }

        grupos[funcionario.funcao].push(funcionario);

    });

    return grupos;

}


// =====================================================
// RENDERIZAR TURNO
// =====================================================

function renderizarTurno(

    titulo,

    lista,

    dias

) {

    const grupos = agruparPorFuncao(

        ordenarFuncionarios(lista)

    );

    tbody.innerHTML += criarTitulo(

        titulo,

        dias.length + 3

    );

    Object.keys(grupos).forEach((funcao) => {

        tbody.innerHTML += `

            <tr class="funcaoHeader">

                <td colspan="${dias.length + 3}">

                    ${funcao}

                </td>

            </tr>

        `;

        grupos[funcao].forEach((funcionario) => {

            tbody.innerHTML += criarLinhaFuncionario(

                funcionario,

                dias

            );

        });

    });

}


// =====================================================
// RENDERIZAR TABELA
// =====================================================

function renderizarTabela(

    ano,

    mes,

    dias

) {

    criarCabecalho(dias);

    tbody.innerHTML = "";

    renderizarTurno(

        "TURNO MANHÃ",

        funcionariosManha,

        dias

    );

    renderizarTurno(

        "TURNO NOITE",

        funcionariosNoite,

        dias

    );

    ativarEventosCelulas();

}


// =====================================================
// GERAR ESCALA
// =====================================================

async function gerarEscala() {

    if (!mesInput.value) {

        alert("Selecione um mês.");

        return;

    }

    const [

        ano,

        mes

    ] = mesInput.value.split("-");

    await carregarFuncionarios();

    const dias = gerarDias(

        parseInt(ano),

        parseInt(mes) - 1

    );

    gerarEscalaAutomatica(dias);

    renderizarTabela(

        parseInt(ano),

        parseInt(mes) - 1,

        dias

    );

}


// =====================================================
// BOTÃO GERAR
// =====================================================

btnGerar.addEventListener(

    "click",

    gerarEscala

);

// =====================================================
// ATIVAR EVENTOS DAS CÉLULAS
// =====================================================

function ativarEventosCelulas() {

    const celulas = document.querySelectorAll(".celulaEscala");

    celulas.forEach((celula) => {

        celula.addEventListener("click", abrirMenuCelula);

    });

}


// =====================================================
// ABRIR MENU
// =====================================================

function abrirMenuCelula(event) {

    celulaAtiva = event.currentTarget;

    const rect = celulaAtiva.getBoundingClientRect();

    menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
    menu.style.left = `${rect.left + window.scrollX}px`;

    menu.classList.remove("hidden");

}


// =====================================================
// FECHAR MENU
// =====================================================

function fecharMenu() {

    menu.classList.add("hidden");

    celulaAtiva = null;

}


// =====================================================
// ALTERAR VALOR DA CÉLULA
// =====================================================

function alterarCelula(valor) {

    if (!celulaAtiva) return;

    celulaAtiva.textContent = valor;

    const chave = celulaAtiva.dataset.key;

    escala[chave] = valor;

}


// =====================================================
// MENU DE OPÇÕES
// =====================================================

menu.addEventListener("click", (event) => {

    const botao = event.target.closest("button");

    if (!botao) return;

    const valor = botao.dataset.value;

    if (!valor) return;

    alterarCelula(valor);

    fecharMenu();

});


// =====================================================
// FECHAR MENU AO CLICAR FORA
// =====================================================

document.addEventListener("click", (event) => {

    if (menu.classList.contains("hidden")) return;

    if (menu.contains(event.target)) return;

    if (event.target.classList.contains("celulaEscala")) return;

    fecharMenu();

});


// =====================================================
// FECHAR MENU COM ESC
// =====================================================

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        fecharMenu();

    }

});


// =====================================================
// DUPLO CLIQUE
// Alterna rapidamente entre
// M e F
// =====================================================

document.addEventListener("dblclick", (event) => {

    if (!event.target.classList.contains("celulaEscala")) {

        return;

    }

    const chave = event.target.dataset.key;

    const atual = escala[chave] || "M";

    const novoValor = atual === "M"
        ? "F"
        : "M";

    escala[chave] = novoValor;

    event.target.textContent = novoValor;

});


// =====================================================
// LEGENDAS
// =====================================================

const legenda = {

    M: "Trabalha",

    F: "Folga",

    FE: "Férias",

    A: "Atestado",

    FC: "Folga Compensada",

    DSR: "Descanso"

};


// =====================================================
// TOOLTIP
// =====================================================

document.addEventListener("mouseover", (event) => {

    if (!event.target.classList.contains("celulaEscala")) {

        return;

    }

    const valor = event.target.textContent.trim();

    if (!legenda[valor]) {

        event.target.removeAttribute("title");

        return;

    }

    event.target.title = legenda[valor];

});


// =====================================================
// CONTADOR DE ESCALA
// =====================================================

function contarStatus(status) {

    return Object.values(escala)

        .filter(valor => valor === status)

        .length;

}


// =====================================================
// ESTATÍSTICAS
// =====================================================

function atualizarResumo() {

    console.log(

        "Trabalhos:",

        contarStatus("M")

    );

    console.log(

        "Folgas:",

        contarStatus("F")

    );

}

// =====================================================
// CARREGAR ESCALA EXISTENTE
// =====================================================

async function carregarEscalaExistente(mes) {

    try {

        const referencia = doc(db, "escalas", mes);

        const documento = await getDoc(referencia);

        if (!documento.exists()) {

            escala = {};

            return false;

        }

        const dados = documento.data();

        escala = dados.dados || {};

        return true;

    }

    catch (erro) {

        console.error("Erro ao carregar escala:", erro);

        escala = {};

        return false;

    }

}


// =====================================================
// SALVAR ESCALA
// =====================================================

async function salvarEscala() {

    if (!mesInput.value) {

        alert("Selecione um mês.");

        return;

    }

    try {

        const referencia = doc(

            db,

            "escalas",

            mesInput.value

        );

        await setDoc(

            referencia,

            {

                mes: mesInput.value,

                dados: escala,

                quantidadeFuncionarios: funcionarios.length,

                atualizadoEm: serverTimestamp()

            },

            {

                merge: true

            }

        );

        alert("Escala salva com sucesso!");

    }

    catch (erro) {

        console.error(erro);

        alert("Erro ao salvar a escala.");

    }

}


// =====================================================
// BOTÃO SALVAR
// =====================================================

btnSalvar.addEventListener(

    "click",

    salvarEscala

);


// =====================================================
// GERAR ESCALA
// =====================================================

async function gerarEscalaCompleta() {

    if (!mesInput.value) {

        alert("Selecione um mês.");

        return;

    }

    const [

        ano,

        mes

    ] = mesInput.value.split("-");

    await carregarFuncionarios();

    const dias = gerarDias(

        parseInt(ano),

        parseInt(mes) - 1

    );

    const existe = await carregarEscalaExistente(

        mesInput.value

    );

    if (!existe) {

        gerarEscalaAutomatica(dias);

    }

    renderizarTabela(

        parseInt(ano),

        parseInt(mes) - 1,

        dias

    );

}


// =====================================================
// SUBSTITUI EVENTO DO BOTÃO GERAR
// =====================================================

btnGerar.removeEventListener(

    "click",

    gerarEscala

);

btnGerar.addEventListener(

    "click",

    gerarEscalaCompleta

);


// =====================================================
// AVISO AO SAIR SEM SALVAR
// =====================================================

window.addEventListener(

    "beforeunload",

    function (e) {

        e.preventDefault();

        e.returnValue = "";

    }

);

// =====================================================
// DEFINIR MÊS ATUAL
// =====================================================

function definirMesAtual() {

    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(hoje.getMonth() + 1).padStart(2, "0");

    mesInput.value = `${ano}-${mes}`;

}


// =====================================================
// FECHAR MENU AO REDIMENSIONAR
// =====================================================

window.addEventListener("resize", () => {

    if (!menu.classList.contains("hidden")) {

        menu.classList.add("hidden");

    }

});


// =====================================================
// FECHAR MENU AO ROLAR A PÁGINA
// =====================================================

window.addEventListener("scroll", () => {

    if (!menu.classList.contains("hidden")) {

        menu.classList.add("hidden");

    }

});


// =====================================================
// LIMPAR ESCALA
// =====================================================

function limparTabela() {

    thead.innerHTML = "";

    tbody.innerHTML = "";

}


// =====================================================
// NOVA ESCALA
// =====================================================

function novaEscala() {

    limparTabela();

    escala = {};

}


// =====================================================
// EXPORTAR OBJETO (FUTURO PDF/EXCEL)
// =====================================================

function obterEscala() {

    return {

        funcionarios,

        escala

    };

}


// =====================================================
// DEBUG
// =====================================================

window.debugEscala = () => {

    console.log("Funcionários");

    console.table(funcionarios);

    console.log("Escala");

    console.log(escala);

};


// =====================================================
// INICIALIZAÇÃO
// =====================================================

window.addEventListener("load", async () => {

    definirMesAtual();

    console.log("===================================");

    console.log("Escala São Miguel");

    console.log("Sistema iniciado com sucesso.");

    console.log("===================================");

});



