// ======================================================
// Escala São Miguel
// Firebase
// ======================================================

// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

// Authentication
import {
    getAuth,
    browserLocalPersistence,
    browserSessionPersistence,
    setPersistence
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Firestore
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Storage (Preparado para uso futuro)
import {
    getStorage
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";


// ======================================================
// Configuração do Firebase
// ======================================================

const firebaseConfig = {

    apiKey: "AIzaSyADTCIaxy26enx0W8s7Lnbm5alEGcBN2yo",

    authDomain: "escala-sao-miguel.firebaseapp.com",

    projectId: "escala-sao-miguel",

    storageBucket: "escala-sao-miguel.firebasestorage.app",

    messagingSenderId: "882984117282",

    appId: "1:882984117282:web:c026b7b244370f6174167b"

};


// ======================================================
// Inicialização
// ======================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);


// ======================================================
// Persistência
// ======================================================

async function lembrarLogin() {

    return setPersistence(auth, browserLocalPersistence);

}

async function sessaoTemporaria() {

    return setPersistence(auth, browserSessionPersistence);

}


// ======================================================
// Exportações
// ======================================================

export {

    app,

    auth,

    db,

    storage,

    lembrarLogin,

    sessaoTemporaria

};