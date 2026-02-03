// ===========================================
// CONFIGURAZIONE SUPABASE
// ===========================================
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 
//const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;


// Verifica globale per evitare SyntaxError e assicurare l'inizializzazione
if (!window.supabaseClient) {
    if (typeof window.supabase !== 'undefined') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
}
var supabase = window.supabaseClient;

// Verifica immediata in console per debug
if (!supabase) {
    console.error("ATTENZIONE: Il client Supabase non è stato inizializzato. Controlla l'ordine degli script nell'HTML.");
}




let utenteCorrenteId = null; 
let scontoUtente = 0; // Percentuale di sconto (es. 10 per 10%)
let carrello = JSON.parse(localStorage.getItem('carrello')) || [];

// Fasce di quantità per il listino Kit Calcio (Totale Pezzi)
// --- NUOVE FASCE SPECIFICHE PER IL BASKET ---
const FASCE_QUANTITA_BASKET = [
    { max: 5, key: "1_5" },
    { max: 9, key: "6_9" },
    { max: 40, key: "10_40" },
    { max: 100, key: "41_100" },
    { max: 999999, key: "101_OLTRE" }
];


// Fasce di quantità per il listino Kit Calcio
const FASCE_QUANTITA_KIT = [
    { max: 5, key: "1_5" },
    { max: 20, key: "6_20" },
    { max: 50, key: "21_50" },
    { max: 70, key: "51_70" },
    { max: 100, key: "71_100" },
    { max: 150, key: "101_150" },
    { max: 200, key: "151_200" },
    { max: 250, key: "201_250" },
    { max: 350, key: "251_350" },
    { max: 999999, key: "351_500" } // Usa l'ultimo prezzo per qualsiasi quantità sopra i 350
];

// ===========================================
// LISTINO PREZZI BANDIERE (Dati Dinamici dalla foto)
// ===========================================
const LISTINO_COMPLETO = {
    // I prezzi sono estratti dalle colonne della tua tabella.
    "Goccia": {
        "S": { FLAG: 26.00, ASTA: 21.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
        "M": { FLAG: 30.00, ASTA: 23.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
        "L": { FLAG: 37.00, ASTA: 27.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
        "XL": { FLAG: 46.00, ASTA: 33.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
    },
    "Vela": { 
        "S": { FLAG: 26.00, ASTA: 21.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
        "M": { FLAG: 30.00, ASTA: 23.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
        "L": { FLAG: 37.00, ASTA: 27.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
        "XL": { FLAG: 46.00, ASTA: 33.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
    },
    "Cresta": { 
        "S": { FLAG: 26.00, ASTA: 21.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
        "M": { FLAG: 30.00, ASTA: 23.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
        "L": { FLAG: 37.00, ASTA: 27.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
        "XL": { FLAG: 46.00, ASTA: 33.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
    },
    "Rettangolare": {
        "S": { FLAG: 20.00, ASTA: 25.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
        "M": { FLAG: 24.00, ASTA: 31.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
        "L": { FLAG: 28.00, ASTA: 45.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
        "XL": { FLAG: 34.00, ASTA: 56.00, BASE: 15.00, ZAVORRA: 6.00, BASE_RIEMPIBILE: 19.00 },
    },


    // --- NUOVO LISTINO KIT CALCIO (Basato su Listini Completini Tessitore.pdf) --- mod. fascia 21 50 compl 19.50 è 19, maglia 11.50 è 10.5, pant 9.50 è 9
    "KIT_CALCIO": {
        // Prezzi unitari netti (€) basati sulla fascia di quantità TOTALE
        "PREZZI_FASCIA": {
            "1_5": { COMPLETINO: 25.00, MAGLIA_SOLA: 14.50, PANTALONCINO_SOLO: 13.00 },
            "6_20": { COMPLETINO: 22.50, MAGLIA_SOLA: 12.50, PANTALONCINO_SOLO: 11.50 },
            "21_50": { COMPLETINO: 19.00, MAGLIA_SOLA: 10.50, PANTALONCINO_SOLO: 9.50 },
            "51_70": { COMPLETINO: 18.00, MAGLIA_SOLA: 9.50, PANTALONCINO_SOLO: 9.00 },
            "71_100": { COMPLETINO: 17.00, MAGLIA_SOLA: 9.00, PANTALONCINO_SOLO: 8.50 },
            "101_150": { COMPLETINO: 16.00, MAGLIA_SOLA: 8.50, PANTALONCINO_SOLO: 8.00 },
            "151_200": { COMPLETINO: 15.00, MAGLIA_SOLA: 8.00, PANTALONCINO_SOLO: 7.50 },
            "201_250": { COMPLETINO: 14.00, MAGLIA_SOLA: 7.50, PANTALONCINO_SOLO: 7.00 },
            "251_350": { COMPLETINO: 13.50, MAGLIA_SOLA: 6.90, PANTALONCINO_SOLO: 6.90 },
            "351_500": { COMPLETINO: 13.00, MAGLIA_SOLA: 6.50, PANTALONCINO_SOLO: 6.50 }
        },
        "COSTO_GRAFICO": 20.00 // Costo impianto grafico 
    },
    // --- CONFIGURAZIONE DTF (NON la lista dei prezzi, che è in LISTINO_DTF_METRO) ---
    "DTF": {
        "LARGHEZZA_FISSA_CM": 60 // Per riferimento nei componenti
    },


    "KIT_BASKET": {
        // Prezzi BASE unitari (dalla tabella foto) per la versione NORMALE (Single)
        "PREZZI_FASCIA": {
            "1_5":       { COMPLETINO: 29.00, CANOTTA_SOLA: 17.00, PANTALONCINO_SOLO: 14.00 },
            "6_9":       { COMPLETINO: 27.00, CANOTTA_SOLA: 16.00, PANTALONCINO_SOLO: 12.50 },
            "10_40":     { COMPLETINO: 24.00, CANOTTA_SOLA: 15.00, PANTALONCINO_SOLO: 11.50 },
            "41_100":    { COMPLETINO: 22.00, CANOTTA_SOLA: 13.50, PANTALONCINO_SOLO: 10.50 },
            "101_OLTRE": { COMPLETINO: 19.00, CANOTTA_SOLA: 12.20, PANTALONCINO_SOLO: 9.30 }
        },
        // Percentuali di aumento SPECIFICHE se si sceglie "Double"
        "EXTRA_DOUBLE": {
            "COMPLETINO": 14.0, 
            "CANOTTA_SOLA": 16.7,
            "PANTALONCINO_SOLO": 5.7
        },
        "COSTO_GRAFICO": 20.00 
    },





    





    
 }; 
    
// --- NUOVO LISTINO TIER PER DTF (MTR) ---
const LISTINO_DTF_METRO = [
    // La chiave 'max' è in metri, 'prezzo' è il costo per metro
    { max: 3.0, prezzo: 15.00 }, // da 0.1 a 3 metri
    { max: 10.0, prezzo: 12.50 }, // da 3.1 a 10 metri
    { max: 9999.0, prezzo: 9.50 } // da 10.1 metri in poi
];
const MINIMO_METRI_DTF = 0.1; // 10 cm
    

// ===========================================
// ===========================================
// CONFIGURAZIONE BONUS / LIVELLI
// ===========================================
const PREMI_TIERS = [
    { soglia: 500,   sconto: 1,   desc: "1% Sconto", emoji: "🎁" },
    { soglia: 750,   sconto: 1.5, desc: "1,5% Sconto", emoji: "🎁" },
    { soglia: 1500,  sconto: 3,   desc: "3% Sconto", emoji: "🎁" },
    { soglia: 2500,  sconto: 3.5, desc: "3,5% Sconto", emoji: "🎁" },
    { soglia: 5000,  sconto: 5,   desc: "5% Sconto", emoji: "🎁" },
    { soglia: 10000, sconto: 5,   desc: "250€ Bonus + 5% Sconto", emoji: "🏆" }
];


// ===========================================
// FUNZIONI DI BASE CLIENTE (Verifica e Logout)
// ===========================================

async function verificaCliente() {
    if (!supabase) { console.error("Supabase non inizializzato."); return false; }
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) { window.location.href = 'login.html'; return false; }
    
    utenteCorrenteId = user.id;
    
    // Recupera il profilo e i permessi
    const { data: profilo, error } = await supabase
        .from('utenti')
        .select('ragione_sociale, permessi, percentuale_sconto')
        .eq('id', user.id)
        .single();
    
    //aggiunto if per mostrare lo sconto
    if (profilo) {
        scontoUtente = parseFloat(profilo.percentuale_sconto) || 0;
        console.log("Sconto applicato per questo utente:", scontoUtente + "%");
    }
    
    if (error || !profilo) {
        alert('Accesso negato. Impossibile caricare il profilo utente. Riprova il login.');
        await supabase.auth.signOut();
        window.location.href = 'login.html';
        return false;
    }
    
    // AZIONE CRITICA 1: BLOCCO UTENTI DISATTIVATI
    if (profilo.permessi === 'disattivato') {
        alert('Accesso negato. Il tuo account è stato disattivato.');
        await supabase.auth.signOut();
        window.location.href = 'login.html';
        return false;
    }

    // AZIONE CRITICA 2: Reindirizza l'admin alla dashboard Admin -- pero un admin deve avere la possibilità di veere anche la dashboard cliente quindi riscrivo la funzione
    /*if (profilo.permessi === 'admin') {
           window.location.href = 'admin.html';
           return false;
    }*/

    const logoElement = document.querySelector('.logo');
    if (logoElement) { logoElement.innerHTML = `<img src="icon-192.png" alt="Logo Tessitore" style="height: 40px; vertical-align: middle;"> Cliente: ${profilo?.ragione_sociale || user.email}`; }


    // ============================================================
    // NUOVA LOGICA: BLOCCO QUICK ORDER SE PERMESSO == 'cliente'
    // ============================================================
    
    if (profilo.permessi === 'cliente') {
        // 1. Selezioniamo la sezione da bloccare tramite il suo ID
        const sezioneQuick = document.getElementById('quick-order-section');
        
        if (sezioneQuick) {
            // Aggiungiamo la classe per il posizionamento
            sezioneQuick.classList.add('elemento-bloccabile');
            
            // Disabilitiamo i click sugli elementi interni
            sezioneQuick.style.pointerEvents = 'none';
            // (Opzionale) Opacità leggera per far capire che è inattivo sotto la maschera
            // sezioneQuick.style.opacity = '0.7'; 

            // Creiamo l'HTML della maschera
            const htmlMaschera = `
                <div class="overlay-lock">
                    <div class="lock-message-box">
                        <span class="lock-icon">🔒</span>
                        <div class="lock-title">RISERVATO RIVENDITORI</div>
                        <div class="lock-subtitle">Funzione Quick Order non disponibile</div>
                    </div>
                </div>
            `;
            
            // Inseriamo la maschera dentro la sezione
            sezioneQuick.insertAdjacentHTML('beforeend', htmlMaschera);
        }
    }
    // ============================================================

    
    return true; 
}

async function handleLogout() {
    if (!confirm("Sei sicuro di voler uscire?")) { return; }
    const { error } = await supabase.auth.signOut();
    if (error) { console.error('Errore durante il logout:', error); } 
    else { localStorage.removeItem('carrello'); window.location.href = 'https://tss26.github.io/preventivo-tessitore/login.html'; }
}


// ===========================================
// GESTIONE CARRELLO (LOGICA)
// ===========================================

/*function aggiungiAlCarrello(articolo) {
    carrello.push(articolo);
    localStorage.setItem('carrello', JSON.stringify(carrello));
    aggiornaUIPreventivo(); 
}vecchio funzione cjhe gestiva solo un oggetto in entrata come parametro*/

/**
 * FUNZIONE UNIVERSALE PER AGGIUNGERE AL CARRELLO
 * Gestisce sia gli oggetti (Kit/Bandiere) che i parametri singoli (Configuratore)
 ************************************************************************************************************
function aggiungiAlCarrello(param1, param2, param3) {
    let item;

    // Se param1 è un OGGETTO (caso Kit Calcio)
    if (typeof param1 === 'object' && param1 !== null) {
        console.log("Rilevato Kit/Oggetto complesso:", param1);
        
        item = {
            prodotto: param1.prodotto || param1.nome || "Kit Personalizzato",
            // Cerchiamo la quantità (può essere .quantita o .qta)
            quantita: parseInt(param1.quantita || param1.qta) || 1,
            // Cerchiamo il prezzo (può essere .prezzo_unitario o .prezzo) e lo puliamo
            prezzo_unitario: safeParseFloat(param1.prezzo_unitario || param1.prezzo || 0),
            note: param1.note || "",
            // Manteniamo gli array del Kit
            componenti: param1.componenti || [],
            dettagli_taglie: param1.dettagli_taglie || {},
            personalizzazione_url: param1.personalizzazione_url || ""
        };
    } 
    // Se riceve 3 PARAMETRI (caso Configuratore Rapido)
    else {
        item = {
            prodotto: param1,
            quantita: parseInt(param2) || 1,
            prezzo_unitario: safeParseFloat(param3),
            note: "Ordine Rapido",
            componenti: [],
            dettagli_taglie: {},
            personalizzazione_url: ""
        };
    }

    // SICUREZZA: Se dopo il parsing qualcosa è ancora NaN, lo forziamo a 0
    if (isNaN(item.prezzo_unitario)) item.prezzo_unitario = 0;
    
    carrello.push(item);
    localStorage.setItem('carrello', JSON.stringify(carrello));
    aggiornaUIPreventivo();
}*/


// ===========================================
// UTILITY SCONTO CLIENTE
// ===========================================
function applicaSconto(prezzoLordo) {
    if (scontoUtente <= 0) return prezzoLordo;
    return prezzoLordo * (1 - (scontoUtente / 100));
}

function calcolaTotaleParziale() {
    return carrello.reduce((totale, item) => {
        const prezzoArticolo = item.prezzo_unitario || 0; 
        return totale + (prezzoArticolo * item.quantita);
    }, 0);
}

function rimuoviDalCarrello(index) {
    carrello.splice(index, 1);
    localStorage.setItem('carrello', JSON.stringify(carrello));
    aggiornaUIPreventivo();
}

/**
 * Aggiorna la sezione "Il tuo preventivo".
 
function aggiornaUIPreventivo() {
    const lista = document.getElementById('preventivoLista');
    const totaleStrong = document.getElementById('totaleParziale');
    
    if (!lista || !totaleStrong) return;

    lista.innerHTML = ''; 
    
    carrello.forEach((item, index) => {
        const p = document.createElement('p');
        const prezzoTotaleArticolo = (item.prezzo_unitario * item.quantita).toFixed(2);
        
        p.innerHTML = `
            ${item.quantita} × ${item.prodotto} 
            (€ ${prezzoTotaleArticolo}) 
            <span class="remove-item" data-index="${index}" style="cursor: pointer; color: red; margin-left: 10px;">(X)</span>
        `;
        lista.appendChild(p);
    });

    const totale = calcolaTotaleParziale();
    totaleStrong.textContent = `€ ${totale.toFixed(2)}`;
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            rimuoviDalCarrello(e.target.getAttribute('data-index'));
        });
    });
}*/

function aggiornaUIPreventivo() {
    // CORREZIONE 1: Usa l'ID corretto presente nel tuo HTML (riga 263 circa)
    const lista = document.getElementById('preventivoLista');
    
    // CORREZIONE 2: Usa l'ID corretto presente nel tuo HTML (riga 266 circa)
    const totaleElemento = document.getElementById('totaleParziale');

    // Se la lista non esiste nel DOM, esce per evitare errori
    if (!lista) return;

    lista.innerHTML = '';
    let totaleGenerale = 0;

    // Usiamo la variabile globale carrello
    carrello.forEach((item, index) => {
        // --- IL FILTRO ANTI-NaN ---
        // Cerchiamo il prezzo in tutte le sue possibili declinazioni
        const prezzoSorgente = item.prezzo_unitario || item.prezzo || 0;
        const prezzoPulito = parseFloat(prezzoSorgente) || 0;
        const qtaPulita = parseInt(item.quantita || item.qta) || 0;
        
        const subtotale = qtaPulita * prezzoPulito;
        totaleGenerale += subtotale;

        // Nota: Uso 'div' invece di 'li' perché il contenitore padre nel tuo HTML è un <div>, non un <ul>
        const riga = document.createElement('div');
        riga.style.borderBottom = "1px solid #eee";
        riga.style.padding = "10px 0";
        riga.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div style="flex:1;">
                    <strong>${item.prodotto || item.nome || 'Articolo'}</strong><br>
                    <small>${qtaPulita} pz x € ${prezzoPulito.toFixed(2)}</small>
                </div>
                <div style="text-align:right;">
                    <span style="font-weight:bold;">€ ${subtotale.toFixed(2)}</span>
                    <button onclick="rimuoviDalCarrello(${index})" style="background:none; border:none; color:red; cursor:pointer; margin-left:10px; font-size: 1.2em;">&times;</button>
                </div>
            </div>
        `;
        lista.appendChild(riga);
    });

    if (totaleElemento) {
        // CORREZIONE 3: Aggiungo il simbolo dell'Euro per mantenere lo stile
        totaleElemento.innerText = '€ ' + totaleGenerale.toFixed(2);
    }
}

// ===========================================
// FUNZIONE DI UTILITY (GENERAZIONE N. ORDINE) - AGGIORNATA PER USARE RPC
// ===========================================

/**
 * Chiama la funzione RPC di Supabase per incrementare il contatore globale
 * e ottenere il prossimo numero d'ordine formattato (es. 25/0001).
 * La logica è gestita dal database per bypassare l'RLS.
 */
async function generaNumeroOrdineTemporaneo() {
    // Chiama la funzione RPC sul database. Assicurati che la funzione 
    // 'incrementa_e_genera_num_ordine' sia stata creata in Supabase come SECURITY DEFINER.
    const { data: numeroOrdine, error } = await supabase.rpc('incrementa_e_genera_num_ordine');

    if (error) {
        console.error("Errore RPC nella generazione del numero d'ordine:", error);
        // È cruciale che l'ordine non venga inviato con un numero non valido
        throw new Error("Impossibile generare un numero d'ordine univoco. Riprova.");
    }
    
    // 'numeroOrdine' conterrà il valore formattato es. "25/0001"
    return numeroOrdine; 
}


// ===========================================
// LOGICA ACQUISTO E CHECKOUT (COMPLETO)
// ===========================================

const BUCKET_NAME = 'personalizzazioni';

/**
 * Funzione principale per gestire l'aggiunta al carrello (Bandiere),
 * ora include la logica di upload con scadenza (72h) e tracciamento nel DB.
 */
async function gestisciAggiuntaAlCarrello() {
    
    // --- 1. RILEVAZIONE ATTRIBUTI ---
    const fileInput = document.getElementById('fileUpload');
    const fileToUpload = fileInput.files[0]; // Ottiene il file selezionato
    const qta = parseInt(document.getElementById('qta').value);
    
    // VARIABILI PER LO STATO DI UPLOAD (Punto 1: Barra di Progresso)
    const uploadStatusBox = document.getElementById('uploadStatusBox');
    const uploadMessage = document.getElementById('uploadMessage');
    const uploadProgressBar = document.getElementById('uploadProgressBar');

    const formaElement = document.querySelector('.forme .forma.active');
    const misuraElement = document.querySelector('.misure input:checked'); 
    const componentiSelezionati = Array.from(document.querySelectorAll('.componenti input:checked'));

    // --- 2. CONTROLLI DI VALIDAZIONE AGGIUNTIVI ---
    if (!formaElement || !misuraElement || qta < 1 || isNaN(qta)) {
        alert("Seleziona una forma, una misura e una quantità valida (min. 1).");
        return;
    }
    
    // NUOVO CONTROLLO: Limite di dimensione (Punto 1: 5 MB)
    const MAX_FILE_SIZE_MB = 5;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    
    if (fileToUpload && fileToUpload.size > MAX_FILE_SIZE_BYTES) {
        alert(`Il file "${fileToUpload.name}" è troppo grande. La dimensione massima consentita è ${MAX_FILE_SIZE_MB} MB.`);
        fileInput.value = ''; // Resetta il campo file
        return; 
    }
    
    // NUOVO CONTROLLO: Il file è obbligatorio per l'aggiunta al carrello
    if (!fileToUpload) {
        alert("Per aggiungere una Bandiera personalizzata, devi caricare un file (.PNG / .PDF).");
        return;
    }
    
    if (!utenteCorrenteId) {
        alert("Errore: ID Utente non disponibile. Prova a ricaricare la pagina o a effettuare nuovamente il login.");
        return;
    }

    const forma = formaElement.textContent.trim();
    const misura = misuraElement.value;
    
    // Mostra la barra di progresso
    if (uploadStatusBox) {
        uploadStatusBox.style.display = 'block';
        uploadMessage.textContent = 'Preparazione per il caricamento...';
        uploadProgressBar.style.width = '0%';
        uploadProgressBar.style.backgroundColor = '#007bff';
    }
    
    // --- 3. LOGICA DI UPLOAD E TRACCIAMENTO ---
    let fileUrl = 'Nessun file caricato (Errore)'; 
    let storagePathFull = null;

    try {
        // --- LOGICA DI UPLOAD E INSERIMENTO DB ---
        
        const extension = fileToUpload.name.split('.').pop();
        // Crea un percorso di storage unico: user_id/timestamp-random.ext
        const filePath = `${utenteCorrenteId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;
        
        // 3a. Carica il file nello Storage di Supabase
        if (uploadMessage) uploadMessage.textContent = 'Caricamento in corso...';

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, fileToUpload, {
            cacheControl: '3600', 
            upsert: false,
          });


        if (uploadError) {
            if (uploadMessage) uploadMessage.textContent = '❌ Errore di caricamento!';
            if (uploadProgressBar) uploadProgressBar.style.backgroundColor = '#dc3545';
          throw uploadError;
        }

        // Al successo:
        if (uploadProgressBar) uploadProgressBar.style.width = '100%';
        if (uploadMessage) uploadMessage.textContent = '✅ File caricato con successo. Registrazione DB...';
        
        fileUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;
        storagePathFull = `${BUCKET_NAME}/${filePath}`;

        // 3b. Calcola l'orario di scadenza (adesso + 72 ore)
        const expirationTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

        // 3c. Registra il percorso e la scadenza nel database 'temp_files'
        const { error: dbError } = await supabase
          .from('temp_files')
          .insert([
            { 
              storage_path: storagePathFull, 
              expires_at: expirationTime, 
            }
          ]);

        if (dbError) {
          // Se fallisce l'inserimento nel DB, cancella il file appena caricato!
          await supabase.storage.from(BUCKET_NAME).remove([filePath]);
          throw dbError;
        }

    } catch (e) {
        console.error('Errore Upload/Tracciamento:', e.message);
        alert(`Errore critico durante il caricamento del file. Riprova. Dettagli: ${e.message}`);
        if (uploadStatusBox) uploadStatusBox.style.display = 'none'; // Nascondi stato al fallimento
        fileInput.value = ''; // Resetta il campo file
        return; // Blocca l'aggiunta al carrello se l'upload fallisce
    }

    // --- 4. CALCOLO DEL PREZZO UNITARIO (Logica CORRETTA per lo scope) ---
    
    // 1. Definisce listinoForma e verifica l'esistenza
    const listinoForma = LISTINO_COMPLETO[forma];
    if (!listinoForma) {
        console.error('Listino non trovato per la forma:', forma);
        alert('Errore interno: Listino prezzi non trovato per la forma selezionata.');
        return; 
    }
    
    // 2. Definisce listinoMisura e verifica l'esistenza (NUOVO)
    const listinoMisura = listinoForma[misura]; 
    if (!listinoMisura) {
        console.error('Listino non trovato per la misura:', misura);
        alert('Errore interno: Listino prezzi non trovato per la misura selezionata.');
        return; 
    }

    let prezzoUnitarioFinale = 0;
    let componentiNomi = []; 

    // 3. Esegue il ciclo (listinoMisura ORA è definita!)
    componentiSelezionati.forEach(checkbox => {
        const componenteKey = checkbox.value; 
        const prezzoComponente = listinoMisura[componenteKey] || 0; 
        
        prezzoUnitarioFinale += prezzoComponente;
        componentiNomi.push(checkbox.parentNode.textContent.trim());
    });
    // Fine sezione di calcolo del prezzo

    const nuovoArticolo = { 
        id_unico: Date.now(), 
        prodotto: `${forma} (${misura})`, 
        quantita: qta, 
        prezzo_unitario: prezzoUnitarioFinale, 
        componenti: componentiNomi, 
        personalizzazione_url: fileUrl // <--- ADESSO CONTIENE L'URL PUBBLICO VERO
    };

    
    if (prezzoUnitarioFinale <= 0) {
        if (!confirm(`Attenzione! Prezzo calcolato di € ${prezzoUnitarioFinale.toFixed(2)} cad. Continuare?`)) return;
    }


    aggiungiAlCarrello(nuovoArticolo);
    alert(`Aggiunto ${qta}x ${nuovoArticolo.prodotto} al preventivo per € ${prezzoUnitarioFinale.toFixed(2)} cad.! (File: OK)`);
    
    // Pulisci lo stato di upload dopo 2 secondi
    if (uploadStatusBox) {
        setTimeout(() => { uploadStatusBox.style.display = 'none'; }, 2000);
    }
    fileInput.value = ''; // Resetta il campo file dopo l'aggiunta di successo

}


/**
 * Gestisce il processo di checkout.
 */
async function gestisciCheckout() {
    if (!supabase) { alert("ERRORE: Supabase non è inizializzato."); return; }
    // --- MODIFICA CONTROLLO COPYRIGHT ---
    const checkCopyright = document.getElementById('checkCopyright');
        if (!checkCopyright || !checkCopyright.checked) {
            alert("ATTENZIONE: Per inviare la Richiesta di Preventivo Ufficiale devi accettare la clausola di responsabilità sui file (Copyright/Manleva).");
            // Scrolliamo verso il carrello per fargli vedere cosa manca
            document.getElementById('sezioneCarrello').scrollIntoView({ behavior: 'smooth' });
            return;
        }
        // ------------------------------------
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Devi effettuare il login per richiedere un preventivo ufficiale."); return; }
    
    const carrelloDaSalvare = JSON.parse(localStorage.getItem('carrello')) || [];
    if (carrelloDaSalvare.length === 0) { alert("Il preventivo è vuoto."); return; }
    
    // --- PARTE NUOVA: Recupero dati dai campi blu ---
    const nomeCliente = document.getElementById('prevClienteNome').value.trim();
    const contattiCliente = document.getElementById('prevClienteContatti').value.trim();

    // Creiamo un oggetto "intestazione" da salvare insieme ai prodotti
    const intestazioneCliente = {
        tipo: 'INFO_CLIENTE', // Questo ci serve per riconoscerlo dopo
        cliente: nomeCliente,
        contatti: contattiCliente,
        prodotto: "RIFERIMENTI CLIENTE", // Fallback per sicurezza
        quantita: 0,
        prezzo_unitario: 0,
        componenti: [],
        note: `Cliente: ${nomeCliente} - Contatti: ${contattiCliente}`
    };

    // Mettiamo l'intestazione PRIMA dei prodotti veri
    const dettagliCompleti = [intestazioneCliente, ...carrelloDaSalvare];
    // ------------------------------------------------
    
    const totaleCalcolato = calcolaTotaleParziale();
    
    let numeroOrdineGenerato;
    try {
        numeroOrdineGenerato = await generaNumeroOrdineTemporaneo();
    } catch (e) {
        alert(e.message);
        return; 
    }
    
    if (!confirm(`Confermi l'invio del preventivo N. ${numeroOrdineGenerato} per € ${totaleCalcolato.toFixed(2)}?`)) { return; }
    
    try {
        const { error } = await supabase
            .from('ordini')
            .insert([
                {
                    num_ordine_prog: numeroOrdineGenerato,
                    stato: 'Richiesta Inviata',
                    totale: totaleCalcolato,
                    dettagli_prodotti: dettagliCompleti, // Usiamo la lista con i dati cliente
                    user_id: utenteCorrenteId,
                }
            ]);

        if (error) { throw new Error(error.message); }

        carrello = []; 
        localStorage.removeItem('carrello');
        
        // Puliamo anche i campi input
        document.getElementById('prevClienteNome').value = "";
        document.getElementById('prevClienteContatti').value = "";
        
        aggiornaUIPreventivo();
        
        alert(`Ordine/Preventivo ${numeroOrdineGenerato} inviato con successo!`);

    } catch (e) {
        console.error('Errore durante l\'invio dell\'ordine:', e);
        alert(`Errore nell'invio dell'ordine: ${e.message}.`);
    }
}


/// ===========================================
// FUNZIONI DI SUPPORTO PER IL KIT CALCIO
// ===========================================

//------------------------------
// FUNZIONE DI CALCOLO DINAMICO DEL PREZZO PER kit sublimazione
//------
function calcolaPrezzoDinamicoKit() {
    const prezzoDinamicoSpan = document.getElementById('kitPrezzoDinamico');
    const qtaTotaleSpan = document.getElementById('kitQtaTotale');
    const prezzoBaseSpan = document.getElementById('kitPrezzoBase');
    const taglieTables = document.querySelectorAll('#taglieInputContainer .taglie-table');
    const kitProdSelezionato = document.querySelector('.kit-item.active')?.dataset.prodotto;

    if (!kitProdSelezionato || !prezzoDinamicoSpan || !qtaTotaleSpan || !prezzoBaseSpan) {
        prezzoDinamicoSpan.textContent = '€ 0.00';
        qtaTotaleSpan.textContent = '0';
        prezzoBaseSpan.textContent = '€ 0.00'; // <-- RESET NUOVO
        return;
    }

    const listinoKit = LISTINO_COMPLETO.KIT_CALCIO;
    let qtaTotale = 0;
    
    // 1. Calcola la quantità totale di tutti gli input
    taglieTables.forEach(table => {
        table.querySelectorAll('input[type="number"]').forEach(input => {
            qtaTotale += parseInt(input.value) || 0;
        });
    });

    if (qtaTotale === 0) {
        prezzoDinamicoSpan.textContent = '€ 0.00';
        qtaTotaleSpan.textContent = '0';
        prezzoBaseSpan.textContent = '€ 0.00';
        return;
    }
    
    // 2. Trova la fascia di prezzo corretta
    const fascia = FASCE_QUANTITA_KIT.find(f => qtaTotale <= f.max);
    
    // 3. Recupera il prezzo unitario in base al prodotto selezionato
    let prezzoUnitarioBase = 0;
    
    if (fascia) {
        const prezzi = listinoKit.PREZZI_FASCIA[fascia.key];
        
        if (kitProdSelezionato === 'COMPLETINO') {
            prezzoUnitarioBase = prezzi.COMPLETINO;
        } else if (kitProdSelezionato === 'T-SHIRT_SOLO') {
            prezzoUnitarioBase = prezzi.MAGLIA_SOLA;
        } else if (kitProdSelezionato === 'PANTALONCINO_SOLO') {
            prezzoUnitarioBase = prezzi.PANTALONCINO_SOLO;
        }
    }

    //  Visualizzazione del Prezzo Base ***
   // prezzoBaseSpan.textContent = `€ ${prezzoUnitarioBase.toFixed(2)}`;-------- TOLTO PERCHE è STATO INSERITO NELLA GESTIONE DELLO SCONTO
    
    // 4. Calcola il costo totale e applica l'impianto grafico
    const costoTotaleBase = qtaTotale * prezzoUnitarioBase;
    
    // Il costo impianto grafico di 20€ viene applicato una sola volta 
    const costoImpianto = listinoKit.COSTO_GRAFICO || 0; 
    
    //---const costoTotaleFinale = costoTotaleBase + costoImpianto;
    const costoTotaleFinale = costoTotaleBase ;
    
    // 5. Calcola il prezzo MEDIO unitario finale (per visualizzazione dinamica)
    const prezzoMedioUnitario = costoTotaleFinale ;

    //---const prezzoMedioUnitario = prezzoUnitarioBase; 
    // Oppure, se vuoi includere l'ammortamento del costo impianto (20€) nel prezzo unitario:
    // const prezzoMedioUnitario = (costoTotaleBase + costoImpianto) / qtaTotale;

    // Visualizzazione del Prezzo Base
    prezzoBaseSpan.textContent = `€ ${prezzoUnitarioBase.toFixed(2)}`;

    // --- SALVA IL PREZZO UNITARIO BASE NEL CAMPO NASCOSTO ---
    const prezzoUnitarioInput = document.getElementById('kitPrezzoUnitarioBase');
    if (prezzoUnitarioInput) {
        prezzoUnitarioInput.value = prezzoUnitarioBase.toFixed(2);
    }

    
    // 6. SALVA IL COSTO TOTALE IN UN CAMPO NASCOSTO ***
    const costoTotaleInput = document.getElementById('kitCostoTotaleFinale');
    if (costoTotaleInput) {
        costoTotaleInput.value = costoTotaleFinale.toFixed(2);
    }
    
    //prezzoDinamicoSpan.textContent = `€ ${prezzoMedioUnitario.toFixed(2)}`;
    // --- GESTIONE VISIVA SCONTO (PULITA) ----------------------------------------------------------------------
    const baseScontato = applicaSconto(prezzoUnitarioBase);
    
    if (scontoUtente > 0) {
        // Mostra il prezzo base barrato + quello scontato in verde
        prezzoBaseSpan.innerHTML = `
            <span style="text-decoration: line-through; color: #999; font-size: 0.8em;">€ ${prezzoUnitarioBase.toFixed(2)}</span> 
            <span style="color: #28a745; font-weight: bold;">€ ${baseScontato.toFixed(2)}</span>
            <small style="color: #28a745;">(-${scontoUtente}%)</small>`;
        
        // Mostra il totale complessivo già scontato
        prezzoDinamicoSpan.textContent = `€ ${applicaSconto(prezzoMedioUnitario).toFixed(2)}`;
    } else {
        prezzoBaseSpan.textContent = `€ ${prezzoUnitarioBase.toFixed(2)}`;
        prezzoDinamicoSpan.textContent = `€ ${prezzoMedioUnitario.toFixed(2)}`;
    }//------------FINE GESTIONE SCONTO-----------------------------------------------------------------------------------------------------------
    
    qtaTotaleSpan.textContent = qtaTotale;
}


//Questa funzione deve usare il prezzo medio e deve includere il costo grafico nei componenti per tracciarlo nell'ordine.
async function gestisciAggiuntaKitCalcio() {
    const taglieTables = document.querySelectorAll('#taglieInputContainer .taglie-table');
    const kitProdSelezionato = document.querySelector('.kit-item.active')?.dataset.prodotto;
    
    // Recupero dati numerici e testo
    const qtaTotale = parseInt(document.getElementById('kitQtaTotale').textContent) || 0;
    const prezzoDinamico = parseFloat(document.getElementById('kitPrezzoDinamico').textContent.replace('€', '').trim()) || 0;
    const prezzoUnitarioBase = parseFloat(document.getElementById('kitPrezzoUnitarioBase')?.value) || 0;
    const kitNote = document.getElementById('kitNote').value;

    // --- 1. RILEVAZIONE FILE UPLOAD ---
    const fileInput = document.getElementById('kitFileUpload'); // Assicurati che questo ID esista nell'HTML
    const fileToUpload = fileInput ? fileInput.files[0] : null; 
    
    // Elementi UI per l'upload (Barra di progresso)
    const uploadStatusBox = document.getElementById('kitUploadStatusBox');
    const uploadMessage = document.getElementById('kitUploadMessage');
    const uploadProgressBar = document.getElementById('kitUploadProgressBar');

    // --- CONTROLLI PRELIMINARI ---
    if (!kitProdSelezionato) {
        alert("Devi selezionare un prodotto Kit (T-Shirt, Pantaloncino o Completino).");
        return;
    }
    if (qtaTotale === 0) {
        alert("La quantità totale deve essere superiore a zero.");
        return;
    }
    if (!utenteCorrenteId) { 
        alert("Errore: ID Utente non disponibile. Effettua nuovamente il login.");
        return;
    }
    
    // Controllo Dimensione File (Max 5MB) - Se il file c'è
    const MAX_FILE_SIZE_MB = 5;
    if (fileToUpload && fileToUpload.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`Il file è troppo grande. Max ${MAX_FILE_SIZE_MB} MB.`);
        fileInput.value = ''; 
        return;
    }

    // --- LOGICA DI UPLOAD (OPZIONALE) ---
    let fileUrl = 'Nessun file caricato';
    
    // Eseguiamo l'upload SOLO se l'utente ha selezionato un file
    if (fileToUpload) {
        const BUCKET_NAME = 'personalizzazioni'; 
        
        // Mostra interfaccia caricamento
        if (uploadStatusBox) {
            uploadStatusBox.style.display = 'block';
            uploadMessage.textContent = 'Caricamento grafica in corso...';
            uploadProgressBar.style.width = '0%';
            uploadProgressBar.style.backgroundColor = '#007bff';
        }

        try {
            const extension = fileToUpload.name.split('.').pop();
            // Path univoco: user_id/KIT-timestamp.ext
            const filePath = `${utenteCorrenteId}/KIT-${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;

            // Upload su Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, fileToUpload, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            // Aggiorna progress bar al 100%
            if (uploadProgressBar) uploadProgressBar.style.width = '100%';
            if (uploadMessage) uploadMessage.textContent = '✅ File caricato. Creazione ordine...';

            // Ottieni URL pubblico
            fileUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;

            // Registra scadenza file nel DB (72h)
            const expirationTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
            const { error: dbError } = await supabase
                .from('temp_files')
                .insert([{
                    storage_path: `${BUCKET_NAME}/${filePath}`,
                    expires_at: expirationTime,
                }]);

            if (dbError) console.error("Errore tracciamento scadenza file (non bloccante)", dbError);

        } catch (e) {
            console.error('Errore Upload Kit:', e.message);
            alert(`Errore durante il caricamento del file: ${e.message}`);
            if (uploadStatusBox) uploadStatusBox.style.display = 'none';
            return; // Interrompe l'aggiunta al carrello in caso di errore upload
        }
    }

    // --- 2. RACCOLTA DATI TAGLIE ---
    let dettagliTaglie = {};
    taglieTables.forEach(table => {
        const genere = table.dataset.genere;
        dettagliTaglie[genere] = {};
        
        const inputs = table.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            const taglia = input.dataset.taglia;
            const qta = parseInt(input.value) || 0;
            if (qta > 0) {
                dettagliTaglie[genere][taglia] = qta;
            }
        });
        if (Object.keys(dettagliTaglie[genere]).length === 0) {
            delete dettagliTaglie[genere];
        }
    });
    
    // --- 3. CREAZIONE OGGETTO CARRELLO ---
    // *** NUOVO: Recupero il valore del radio button selezionato ***
    // Cerca l'input selezionato, se non lo trova mette una stringa vuota di sicurezza
    const tessutoRadio = document.querySelector('input[name="tessutoCalcio"]:checked');
    const tessutoScelto = tessutoRadio ? tessutoRadio.value : "Tessuto Non Specificato";


    
    // Traccia il costo impianto grafico come componente fisso
    const componenti = [`Tessuto: ${tessutoScelto}`,`Sublimazione`, `Costo Impianto Grafico (€${LISTINO_COMPLETO.KIT_CALCIO.COSTO_GRAFICO.toFixed(2)})`];

    const nuovoArticolo = { 
        id_unico: Date.now(), 
        prodotto: `KIT CALCIO - ${kitProdSelezionato}`, 
        quantita: qtaTotale, 
        prezzo_unitario: prezzoUnitarioBase,
        prezzo_dinamico: parseFloat(prezzoDinamico.toFixed(2)), 
        componenti: componenti,
        dettagli_taglie: dettagliTaglie,
        note: kitNote,
        personalizzazione_url: fileUrl // Qui salva l'URL o "Nessun file caricato"
    };

    // --- 4. AGGIUNTA E RESET ---
    aggiungiAlCarrello(nuovoArticolo);
    
    let msg = `Aggiunto ${qtaTotale}x ${nuovoArticolo.prodotto} al preventivo!`;
    if (fileToUpload) msg += " (File caricato correttamente)";
    alert(msg);
    
    // Reset dell'interfaccia dopo l'aggiunta 
    document.getElementById('kitNote').value = '';
    taglieTables.forEach(table => table.querySelectorAll('input[type="number"]').forEach(input => input.value = '0'));

    // *** NUOVO: Reset del Radio Button su DRY (Default) ***
    const radioDry = document.querySelector('input[name="tessutoCalcio"][value^="DRY"]');
    if(radioDry) radioDry.checked = true;
    
    // Reset File e Progress Bar
    if (fileInput) fileInput.value = '';
    if (uploadStatusBox) {
        setTimeout(() => { uploadStatusBox.style.display = 'none'; }, 2000);
    }

    calcolaPrezzoDinamicoKit(); // Ritorna a €0.00
}




// ===========================================
// FUNZIONALITÀ ORDINI CLIENTE (Viste e Caricamento)
// ===========================================


/*async function caricaMieiOrdini() {
    const container = document.getElementById('ordiniListaCliente');
    if (!utenteCorrenteId) { container.innerHTML = `<p style="color: red;">ID utente non disponibile.</p>`; return; }
    container.innerHTML = '<p>Caricamento ordini in corso...</p>';
    const { data: ordini, error } = await supabase.from('ordini').select(`*`).eq('user_id', utenteCorrenteId).order('data_ordine', { ascending: false }); 
    if (error) { container.innerHTML = `<p style="color: red;">Errore nel recupero ordini: ${error.message}. Verifica Policy RLS SELECT sulla tabella ordini (auth.uid() = user_id).</p>`; return; }
    if (ordini.length === 0) { container.innerHTML = '<p>Non hai ancora effettuato ordini.</p>'; return; }
    let html = `<div class="lista-ordini-table-wrapper"><table><thead><tr><th>N. Ordine</th><th>Data</th><th>Totale</th><th>Stato</th><th>Dettagli</th></tr></thead><tbody>`;
    ordini.forEach(ordine => {
        const numeroOrdine = ordine.num_ordine_prog ? ordine.num_ordine_prog : ordine.id.substring(0, 8).toUpperCase(); 
        // MODIFICA QUI: PASSAGGIO DEL NUMERO ORDINE PROGRESSIVO E DEL TOTALE
        html += `<tr data-id="${ordine.id}"><td>${numeroOrdine}</td><td>${new Date(ordine.data_ordine).toLocaleString()}</td><td>€ ${ordine.totale ? ordine.totale.toFixed(2) : '0.00'}</td><td><span class="stato-ordine stato-${ordine.stato.replace(/\s/g, '-')}">${ordine.stato}</span></td><td><button onclick="mostraDettagliOrdine('${ordine.id}', '${JSON.stringify(ordine.dettagli_prodotti).replace(/"/g, '&quot;')}', '${ordine.num_ordine_prog}', ${ordine.totale || 0})" class="btn-primary" style="padding: 5px 10px;">Vedi Dettagli</button></td></tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}*/

// ===========================================
// BLOCCO GESTIONE ORDINI E FILTRI (NUOVO)
// ===========================================

let ordiniCaricatiLocali = []; // Variabile globale per salvare i dati
// *** Variabili paginazione cliente ***
let paginaCorrenteCliente = 1;
let cacheOrdiniCliente = [];

// 1. CARICAMENTO DATI (Sostituisce la tua vecchia funzione)
async function caricaMieiOrdini() {
    const container = document.getElementById('ordiniListaCliente');
    if (!utenteCorrenteId) return;

    // Recupera i dati da Supabase
    const { data: ordini, error } = await supabase
        .from('ordini')
        .select('*')
        .eq('user_id', utenteCorrenteId)
        .order('data_ordine', { ascending: false });

    if (error) { 
        console.error(error); 
        container.innerHTML = `<p style="color:red">Errore caricamento: ${error.message}</p>`;
        return; 
    }
    
    ordiniCaricatiLocali = ordini; // Salviamo i dati nella variabile globale
    
    // Invece di disegnare subito, chiamiamo la funzione che applica i filtri
    applicaFiltriCliente(); 
}

// 2. FUNZIONE DI FILTRAGGIO (Nuova)
function applicaFiltriCliente() {
    // Recupera i valori dai campi input HTML (con controllo di esistenza)
    const testo = document.getElementById('cliRicerca') ? document.getElementById('cliRicerca').value.toLowerCase().trim() : '';
    const dataInizio = document.getElementById('cliDataInizio') ? document.getElementById('cliDataInizio').value : '';
    const dataFine = document.getElementById('cliDataFine') ? document.getElementById('cliDataFine').value : '';
    const stato = document.getElementById('cliStato') ? document.getElementById('cliStato').value : '';

    // Filtra l'array locale
    const ordiniFiltrati = ordiniCaricatiLocali.filter(ordine => {
        let matchTesto = true;
        let matchData = true;
        let matchStato = true;

        // A. Filtro Testo (Cerca in N. Ordine o Riferimento Cliente)
        if (testo) {
            const numOrdine = (ordine.num_ordine_prog || ordine.id).toLowerCase();
            let riferimento = "";
            
            // Cerca dentro il JSON dettagli_prodotti
            if (ordine.dettagli_prodotti && Array.isArray(ordine.dettagli_prodotti)) {
                const info = ordine.dettagli_prodotti.find(i => i.tipo === 'INFO_CLIENTE');
                if (info && info.cliente) riferimento = info.cliente.toLowerCase();
            }
            
            matchTesto = numOrdine.includes(testo) || riferimento.includes(testo);
        }

        // B. Filtro Data
        const dataOrdine = new Date(ordine.data_ordine);
        if (dataInizio) {
            const dStart = new Date(dataInizio); dStart.setHours(0,0,0,0);
            if (dataOrdine < dStart) matchData = false;
        }
        if (dataFine) {
            const dEnd = new Date(dataFine); dEnd.setHours(23,59,59,999);
            if (dataOrdine > dEnd) matchData = false;
        }

        // C. Filtro Stato
        if (stato && stato !== "") {
            matchStato = ordine.stato === stato;
        }

        return matchTesto && matchData && matchStato;
    });

    // Passa i dati filtrati alla funzione che disegna la tabella
    renderOrdiniCliente(ordiniFiltrati);
}



// -----Funzione globale cambio pagina cliente----
window.cambiaPaginaCliente = function(delta) {
    paginaCorrenteCliente += delta;
    renderOrdiniCliente(cacheOrdiniCliente, true);
};

// 3. FUNZIONE DI DISEGNO TABELLA (Nuova)
function renderOrdiniCliente(ordiniDaMostrare, mantieniPagina = false) {
    const container = document.getElementById('ordiniListaCliente');
    
    if (!mantieniPagina) {
        cacheOrdiniCliente = ordiniDaMostrare;
        paginaCorrenteCliente = 1;
    }

    if (ordiniDaMostrare.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">Nessun ordine trovato con i filtri selezionati.</p>';
        return;
    }

    let html = `<div class="lista-ordini-table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>N. Prev.</th>
                    <th>Riferimento</th>
                    <th>Data</th>
                    <th>Totale</th>
                    <th>Stato</th>
                    <th>Dettagli</th>
                </tr>
            </thead>
           <tbody>`;
    
    // Paginazione Cliente (30 items)
    const inizio = (paginaCorrenteCliente - 1) * 30;
    const fine = inizio + 30;
    const ordiniPagina = ordiniDaMostrare.slice(inizio, fine);

    ordiniPagina.forEach(ordine => {
        const numeroOrdine = ordine.num_ordine_prog || ordine.id.substring(0, 8).toUpperCase();
            
        // Estrazione del Riferimento
        let riferimentoCliente = "---";
        if (ordine.dettagli_prodotti && Array.isArray(ordine.dettagli_prodotti)) {
            const info = ordine.dettagli_prodotti.find(d => d.tipo === 'INFO_CLIENTE');
            if (info && info.cliente) {
                riferimentoCliente = info.cliente;
            }
        }

        html += `
            <tr>
                <td>${numeroOrdine}</td>
                <td style="font-weight:600; color:#4a90e2;">${riferimentoCliente}</td>
                <td>${new Date(ordine.data_ordine).toLocaleString()}</td>
                <td>€ ${ordine.totale ? ordine.totale.toFixed(2) : '0.00'}</td>
                <td><span class="stato-ordine stato-${ordine.stato.replace(/\s/g, '-')}">${ordine.stato}</span></td>
                <td>
                    <button onclick="apriDettagliOrdine('${ordine.id}')" class="btn-primary" style="padding: 5px 10px;">
                        Vedi Dettagli
                    </button>
                </td>
            </tr>`;
    });
    
    html += '</tbody></table></div>';

    // *** MODIFICA QUI: Bottoni Paginazione Cliente ***
    const totPagine = Math.ceil(ordiniDaMostrare.length / 30);
    html += `
    <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 15px;">
        <button onclick="cambiaPaginaCliente(-1)" class="btn-secondary" ${paginaCorrenteCliente === 1 ? 'disabled' : ''} style="padding: 8px 15px;">⬅️ Indietro</button>
        <span style="font-weight: 600;">Pagina ${paginaCorrenteCliente} di ${totPagine || 1}</span>
        <button onclick="cambiaPaginaCliente(1)" class="btn-secondary" ${paginaCorrenteCliente >= totPagine ? 'disabled' : ''} style="padding: 8px 15px;">Avanti ➡️</button>
    </div>`;

    container.innerHTML = html;
}


// Nuova funzione per gestire l'apertura pulita
window.apriDettagliOrdine = function(id) {
    const ordine = ordiniCaricatiLocali.find(o => o.id === id);
    if (ordine) {
        mostraDettagliOrdine(ordine.id, JSON.stringify(ordine.dettagli_prodotti), ordine.num_ordine_prog, ordine.totale);
    }
};

// Funzione ponte per aprire il modale senza errori di sintassi
function preparaEApriModale(idOrdine) {
    const ordine = ordiniCaricatiLocali.find(o => o.id === idOrdine);
    if (ordine) {
        // Richiama la tua funzione originale passandogli i dati puliti
        mostraDettagliOrdine(
            ordine.id, 
            JSON.stringify(ordine.dettagli_prodotti), 
            ordine.num_ordine_prog, 
            ordine.totale
        );
    }
}


/**
 * 4. Mostra i dettagli dell'ordine in un modale HTML selezionabile.
 * MODIFICATA PER ACCETTARE, VISUALIZZARE numeroOrdineProg E CALCOLARE IVA
 */

function mostraDettagliOrdine(ordineId, dettagliProdottiString, numeroOrdineProg, totaleImponibile) {
    const dettagli = JSON.parse(dettagliProdottiString); 
    const modal = document.getElementById('orderDetailsModal');
    const modalBody = document.getElementById('modalOrderDetails');
    const modalTitle = document.getElementById('modalOrderId');
    modalBody.style.whiteSpace = 'normal'; // <--- FONDAMENTALE: Ripristina lo stile corretto
    
    // --- MODIFICA: Fix spazi e Definizione Logo ---
    modalBody.style.whiteSpace = 'normal'; 
    const logoHtml = `<img src="icon-192.png" alt="Logo" style="height: 45px; vertical-align: middle; margin-right: 15px;">`;

    // --- Titolo Modale con Logo ---
    if (numeroOrdineProg && numeroOrdineProg !== 'null') {
        document.querySelector('#orderDetailsModal h2').innerHTML = `${logoHtml}Numero Preventivo : <span style="color: #007bff;">${numeroOrdineProg}</span>`;
    } else {
        document.querySelector('#orderDetailsModal h2').innerHTML = `${logoHtml}Dettaglio Preventivo ID: <span style="color: #6c757d; font-size: 0.9em;">${ordineId.substring(0, 8)}</span>`;
    }
    
    let dettagliHtml = "";

    // --- Dati Cliente ---
    const infoCliente = dettagli.find(d => d.tipo === 'INFO_CLIENTE');
    if (infoCliente) {
        dettagliHtml += `<div style="background: #f1f8ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #cce5ff;">`;
        dettagliHtml += `<strong>Cliente / Rag. Soc.:</strong> ${infoCliente.cliente || '---'}<br>`;
        dettagliHtml += `<strong>Contatti:</strong> ${infoCliente.contatti || '---'}`;
        dettagliHtml += `</div>`;
} //modifica nuova per tabellla html---------------------------------------------------------------------------------------------------------------------------- Chiudiamo l'IF infoCliente qui

    // --- INIZIO TABELLA PRODOTTI (FIX LAYOUT) ---
    dettagliHtml += `<h3 style="margin-bottom:10px; border-bottom:2px solid #eee; padding-bottom:5px; text-align:left;">Riepilogo Articoli</h3>`;
    
    // Aggiunto table-layout: fixed e larghezze percentuali per costringere le colonne a stare al loro posto
    dettagliHtml += `<table style="width:100%; border-collapse:collapse; font-size:0.95em; margin-bottom:20px; table-layout: fixed;">
        <thead>
            <tr style="background:#f8f9fa; border-bottom:2px solid #dee2e6;">
                <th style="padding:10px; text-align:left; color:#495057; width: 55%;">Prodotto & Dettagli</th>
                <th style="padding:10px; text-align:center; color:#495057; width: 10%;">Q.tà</th>
                <th style="padding:10px; text-align:right; color:#495057; width: 20%;">Prezzo</th>
                <th style="padding:10px; text-align:center; color:#495057; width: 15%;">File</th>
            </tr>
        </thead>
        <tbody>`;

    dettagli.forEach(item => {
        if (item.tipo === 'INFO_CLIENTE') return;

        // Gestione Componenti e Note
        let extraInfo = '';
        if (item.componenti && item.componenti.length > 0) {
            extraInfo += `<div style="font-size:0.85em; color:#666; margin-top:4px; text-align:left;">🔹 ${item.componenti.join('<br>🔹 ')}</div>`;
        }
        if (item.dettagli_taglie && Object.keys(item.dettagli_taglie).length > 0) {
            extraInfo += `<div style="font-size:0.85em; color:#007bff; margin-top:4px; text-align:left;">📏 Taglie: `;
            for (const g in item.dettagli_taglie) {
                const t = Object.entries(item.dettagli_taglie[g]).map(([k,v])=>`${k}:${v}`).join(', ');
                extraInfo += `${g} [${t}] `;
            }
            extraInfo += `</div>`;
        }
        if (item.note) {
            extraInfo += `<div style="font-size:0.85em; font-style:italic; color:#dc3545; margin-top:4px; text-align:left;">📝 Note: ${item.note}</div>`;
        }

        // Gestione Bottone File (MODIFICATO PER MOSTRARE IL FILE)
        let fileBtn = '<span style="color:#ccc;">-</span>';
        
        if (item.personalizzazione_url && item.personalizzazione_url.includes('http')) {
            // Se è un link valido, mostra il bottone verde
            fileBtn = `<a href="${item.personalizzazione_url}" target="_blank" style="display:inline-block; padding:6px 12px; background:#007bff; color:white; text-decoration:none; border-radius:4px; font-weight:bold; font-size:0.85em; white-space:nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">📎 </a>`;
        } else if (item.personalizzazione_url && item.personalizzazione_url.length > 2 && item.personalizzazione_url !== 'Nessun file caricato') {
             // Se è solo testo (es. nome file senza link), mostralo come testo
             fileBtn = `<small style="color:#666;">${item.personalizzazione_url}</small>`;
        }

        let pUnit = parseFloat(item.prezzo_unitario) || 0;

        dettagliHtml += `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:10px; vertical-align:top; text-align:left; word-wrap: break-word;">
                    <strong style="font-size:1.05em; color:#333;">${item.prodotto}</strong>
                    ${extraInfo}
                </td>
                <td style="padding:10px; text-align:center; vertical-align:top; font-weight:bold;">${item.quantita}</td>
                <td style="padding:10px; text-align:right; vertical-align:top; white-space: nowrap;">€ ${pUnit.toFixed(2)}</td>
                <td style="padding:10px; text-align:center; vertical-align:top;">${fileBtn}</td>
            </tr>`;
    });
    
    dettagliHtml += `</tbody></table>`;
    // --- FINE TABELLA PRODOTTI ---


    // --- Totali e Footer (CORRETTO HTML) ---
    dettagliHtml += '<br><div style="border-top:1px dashed #ccc; margin-top:10px; padding-top:10px;">'; 
    dettagliHtml += 'Per procedere con l\'ordine effettuare Bonifico intestato a : Tessitore s.r.l.<br>';
    dettagliHtml += 'BANCA : SELLA  IBAN : IT56 O032 6804 6070 5227 9191 820</div>';
    
    const ivaRate = 0.22; 
    let totaleImponibileNumerico = parseFloat(totaleImponibile) || 0; 
    
    if (totaleImponibileNumerico > 0) {
        const ivaDovuta = totaleImponibileNumerico * ivaRate;
        const totaleFinale = totaleImponibileNumerico + ivaDovuta;
        
        dettagliHtml += `<div style="border-top:2px solid #333; margin-top:10px; padding-top:10px; text-align:right;">`;
        dettagliHtml += `<strong>TOTALE IMPONIBILE:</strong> € ${totaleImponibileNumerico.toFixed(2)}<br>`;
        dettagliHtml += `<strong>IVA (22%):</strong> € ${ivaDovuta.toFixed(2)}<br>`;
        dettagliHtml += `<strong style="font-size:1.2em;">TOTALE DOVUTO: € ${totaleFinale.toFixed(2)}</strong>`;
        dettagliHtml += `</div>`;
    }
    
    // Assegnazione HTML (SENZA .replace, così la tabella non si rompe!)
    modalBody.innerHTML = dettagliHtml;



      /*  

    // --- Totali e Footer ---
    dettagliHtml += '\n-----------------------------------------------------------------------------------------\n'; 
    dettagliHtml += '\n Per procedere con l\'ordine effettuare Bonifico intestato a : Tessitore s.r.l.  \n';
    dettagliHtml += ' BANCA : SELLA  IBAN : IT56 O032 6804 6070 5227 9191 820 \n';
    
    const ivaRate = 0.22; 
    let totaleImponibileNumerico = parseFloat(totaleImponibile) || 0; 
    
    if (totaleImponibileNumerico > 0) {
        const ivaDovuta = totaleImponibileNumerico * ivaRate;
        const totaleFinale = totaleImponibileNumerico + ivaDovuta;
        
        dettagliHtml += `\n-------------------------------------------------------------------------\n`;
        dettagliHtml += `TOTALE IMPONIBILE (Netto): € ${totaleImponibileNumerico.toFixed(2)}`;
        dettagliHtml += `\nIVA (22%): € ${ivaDovuta.toFixed(2)}`;
        dettagliHtml += `\nTOTALE DOVUTO (IVA Incl.): € ${totaleFinale.toFixed(2)}\n`;
        dettagliHtml += `-------------------------------------------------------------------------\n`;
    }
    
    // Assegnazione HTML
    modalBody.innerHTML = dettagliHtml.replace(/\n/g, '<br>');*/

    // Tasto Stampa
    let btnStampa = document.getElementById('btnStampaOrdine');
    if (!btnStampa) {
        btnStampa = document.createElement('button');
        btnStampa.id = 'btnStampaOrdine';
        btnStampa.textContent = '🖨️ Stampa Ordine / Salva PDF';
        btnStampa.style.marginTop = '15px';
        btnStampa.style.padding = '10px 20px';
        btnStampa.style.backgroundColor = '#6c757d'; 
        btnStampa.style.color = 'white';
        btnStampa.style.border = 'none';
        btnStampa.style.borderRadius = '5px';
        btnStampa.style.cursor = 'pointer';
        btnStampa.style.fontSize = '1rem';
        btnStampa.style.float = 'right'; 
        btnStampa.onclick = function() { window.print(); };
        modalBody.parentNode.insertBefore(btnStampa, modalBody.nextSibling);
    }

    modal.style.display = 'block';
}


// --- NUOVA FUNZIONE: GESTIONE CHIUSURA MODALE ---


// --- gestione bandiere al metro INIZIOOOOO ---

// ===========================================
// CONFIGURAZIONE PREZZI STRISCIONI & BANDIERE
// ===========================================
const LISTINO_STRISCIONI = {
    MATERIALI_MQ: {
        "FLAG_NAUTICO": 4.2,    // Prezzo esempio al MQ
        "RASO": 3.3,            // Prezzo esempio al MQ
        "POLIESTERE_160": 4.2   // Prezzo esempio al MQ
    },
    COSTI_EXTRA: {
        CUCITURA_INTERMEDIA: 2.50, // Prezzo al metro lineare per cucitura sormonto
        ASOLA: 1.50,               // Prezzo al metro
        OCCHIELLI: 0.60,           // Prezzo cadauno
        RINFORZO: 2.50,            // Prezzo al metro
        DRING: 1.20,               // Prezzo cadauno
        LACCETTI: {
            "NESSUNO": 0,
            "V_SHAPE": 0.50,
            "20CM": 1.00,
            "50CM": 2.00,
            "100CM": 3.00
        }
    },
    // NUOVO: Fasce di ricarico in base alla quantità
    MARKUP_QUANTITA: [
        { max: 5, perc: 70 },      // 1-5 pz: +70%
        { max: 12, perc: 60 },     // 6-12 pz: +60%
        { max: 24, perc: 50 },     // 13-24 pz: +50%
        { max: 50, perc: 40 },     // 25-50 pz: +40%
        { max: 100, perc: 35 },    // 51-100 pz: +35%
        { max: 250, perc: 33 },    // 101-250 pz: +33%
        { max: 500, perc: 30 },    // 251-500 pz: +30%
        { max: 1000, perc: 26 },   // 501-1000 pz: +26%
        { max: 999999, perc: 23 }  // Oltre 1000 pz: +23%
    ]
};

function calcolaPrezzoBanner() {
    // --- 1. CONTROLLO DI SICUREZZA ---
    // Recuperiamo gli elementi PRIMA di leggere il valore
    const inputLargh = document.getElementById('bannerLargh');
    const inputAlt = document.getElementById('bannerAlt');
    const inputQta = document.getElementById('bannerQta'); 

    // Se manca ANCHE SOLO UNO degli input, fermati per evitare errori in console
    if (!inputLargh || !inputAlt || !inputQta) {
        return; 
    }

    // --- 2. INPUT UTENTE SICURO ---
    // Ora siamo sicuri che le variabili esistono, quindi possiamo leggere .value
    const larghezzaCm = parseFloat(inputLargh.value) || 0;
    const altezzaCm = parseFloat(inputAlt.value) || 0;
    const qta = parseInt(inputQta.value) || 1; 

    // Recupera materiale
    const matRadio = document.querySelector('input[name="bannerMateriale"]:checked');
    const materiale = matRadio ? matRadio.value : "FLAG_NAUTICO";
    
    const infoExtraDiv = document.getElementById('bannerInfoExtra');
    const prezzoOutput = document.getElementById('bannerPrezzoUnitario');
    
    if (larghezzaCm <= 0 || altezzaCm <= 0 || qta <= 0) {
        if(prezzoOutput) prezzoOutput.textContent = "€ 0.00";
        return;
    }

    // Conversioni
    const larghezzaMt = larghezzaCm / 100;
    const altezzaMt = altezzaCm / 100;
    const areaMq = larghezzaMt * altezzaMt;

    let dettagliCalcolo = []; 

    // ---------------------------------------------------------
    // A. CALCOLO COSTO BASE (Materiale + Lavorazioni)
    // ---------------------------------------------------------
    
    // 1. COSTO MATERIALE BASE
    const prezzoMq = LISTINO_STRISCIONI.MATERIALI_MQ[materiale] || 0;
    let costoBase = areaMq * prezzoMq;

    // 2. LOGICA SORMONTO (Cucitura Intermedia)
    if (larghezzaCm > 160 && altezzaCm > 160) {
        const latoMinore = Math.min(larghezzaCm, altezzaCm);
        const latoMaggiore = Math.max(larghezzaCm, altezzaCm);
        
        // divide il lato minore per 160 -> parte intera
        const ripetizioni = Math.floor(latoMinore / 160);
        
        // moltiplicare per il lato lungo (in metri) e per costante
        const latoMaggioreMt = latoMaggiore / 100;
        const costoSormonto = ripetizioni * latoMaggioreMt * LISTINO_STRISCIONI.COSTI_EXTRA.CUCITURA_INTERMEDIA;
        
        costoBase += costoSormonto;
        dettagliCalcolo.push(`Sormonto Fuori Formato (${ripetizioni} cuciture): €${costoSormonto.toFixed(2)}`);
    }

    // 3. CALCOLO FINITURE
    let costoFiniture = 0;
    
    // A. ASOLA & RINFORZO
    document.querySelectorAll('.banner-finish:checked').forEach(chk => {
        const tipo = chk.dataset.tipo; 
        const lato = chk.value; 
        let lunghezzaLato = (lato === 'Alto' || lato === 'Basso') ? larghezzaMt : altezzaMt;

        if (tipo === 'ASOLA') {
            costoFiniture += lunghezzaLato * LISTINO_STRISCIONI.COSTI_EXTRA.ASOLA;
        } else if (tipo === 'RINFORZO') {
            costoFiniture += lunghezzaLato * LISTINO_STRISCIONI.COSTI_EXTRA.RINFORZO;
        }
    });

    // B. OCCHIELLI
    const inputOcchielli = document.getElementById('bannerFreqOcchielli');
    const freqOcchielli = inputOcchielli ? (parseInt(inputOcchielli.value) || 50) : 50;
    
    const latiOcchielli = Array.from(document.querySelectorAll('.banner-finish[data-tipo="OCCHIELLI"]:checked')).map(c => c.value);
    latiOcchielli.forEach(lato => {
        let lunghezzaLatoCm = (lato === 'Alto' || lato === 'Basso') ? larghezzaCm : altezzaCm;
        let numOcchielli = Math.floor(lunghezzaLatoCm / freqOcchielli) + 1;
        costoFiniture += numOcchielli * LISTINO_STRISCIONI.COSTI_EXTRA.OCCHIELLI;
    });

    // C. D-RINGS
    const inputDring = document.getElementById('bannerFreqDring');
    const freqDring = inputDring ? (parseInt(inputDring.value) || 50) : 50;

    const latiDring = Array.from(document.querySelectorAll('.banner-finish[data-tipo="DRING"]:checked')).map(c => c.value);
    latiDring.forEach(lato => {
        let lunghezzaLatoCm = (lato === 'Alto' || lato === 'Basso') ? larghezzaCm : altezzaCm;
        let numDring = Math.floor(lunghezzaLatoCm / freqDring) + 1;
        costoFiniture += numDring * LISTINO_STRISCIONI.COSTI_EXTRA.DRING;
    });

    // D. LACCETTI
    const laccettoRadio = document.querySelector('input[name="bannerLaccetto"]:checked');
    const laccettoVal = laccettoRadio ? laccettoRadio.value : "NESSUNO";
    costoFiniture += LISTINO_STRISCIONI.COSTI_EXTRA.LACCETTI[laccettoVal] || 0;

    costoBase += costoFiniture;
    if (costoFiniture > 0) dettagliCalcolo.push(`Finiture extra: €${costoFiniture.toFixed(2)}`);

    // ---------------------------------------------------------
    // B. APPLICAZIONE MARKUP QUANTITÀ
    // ---------------------------------------------------------
    
    // Trova la percentuale corretta in base alla quantità
    const fascia = LISTINO_STRISCIONI.MARKUP_QUANTITA.find(f => qta <= f.max);
    // Se supera l'ultima fascia, prendi l'ultima disponibile
    const percentualeAumento = fascia ? fascia.perc : LISTINO_STRISCIONI.MARKUP_QUANTITA[LISTINO_STRISCIONI.MARKUP_QUANTITA.length -1].perc;

    // Calcolo Prezzo Finale Unitario
    const prezzoFinaleUnitario = costoBase * (1 + (percentualeAumento / 100));

    // Aggiungi info al riepilogo
    dettagliCalcolo.push(`<strong>Costo Base Produzione:</strong> €${costoBase.toFixed(2)}`);
    dettagliCalcolo.push(`<strong>Margine Qta (${qta}pz):</strong> +${percentualeAumento}%`);

    // OUTPUT PREZZI SENZA GESTIONE SCONTO
    /*if(prezzoOutput) {
        prezzoOutput.textContent = `€ ${prezzoFinaleUnitario.toFixed(2)}`;
        // Salva valore in un attributo data per il recupero facile nella funzione di aggiunta
        prezzoOutput.dataset.valore = prezzoFinaleUnitario.toFixed(2);
    }*/
    //------INIZIO GESTIONE SCONTO-------------------------------------------------------------
    if(prezzoOutput) {
        const finaleScontato = applicaSconto(prezzoFinaleUnitario);
        if (scontoUtente > 0) {
            prezzoOutput.innerHTML = `<span style="text-decoration: line-through; color: #999; font-size: 0.8em;">€ ${prezzoFinaleUnitario.toFixed(2)}</span> <span style="color: #28a745;">€ ${finaleScontato.toFixed(2)}</span> <small style="color: #28a745;">(-${scontoUtente}%)</small>`;
        } else {
            prezzoOutput.textContent = `€ ${prezzoFinaleUnitario.toFixed(2)}`;
        }
        prezzoOutput.dataset.valore = prezzoFinaleUnitario.toFixed(2);
    }//------FINE GESTIONE SCONTO-------------------------------------------------------------
    if(infoExtraDiv) infoExtraDiv.innerHTML = dettagliCalcolo.join('<br>');
}

// FUNZIONE DI AGGIUNTA AL CARRELLO (Aggiornata e Sicura)
async function gestisciAggiuntaBanner() {
    // --- 1. RECUPERO DATI CON SICUREZZA ---
    const inputLargh = document.getElementById('bannerLargh');
    const inputAlt = document.getElementById('bannerAlt');
    const inputQta = document.getElementById('bannerQta');
    const inputNote = document.getElementById('bannerNote');
    
    // Se mancano gli elementi principali, esci.
    if(!inputLargh || !inputAlt || !inputQta) return; 

    const larghezza = inputLargh.value;
    const altezza = inputAlt.value;
    const qta = parseInt(inputQta.value) || 1; 
    
    const prezzoEl = document.getElementById('bannerPrezzoUnitario');
    const prezzoUnitario = prezzoEl ? (parseFloat(prezzoEl.dataset.valore) || 0) : 0;
    
    const note = inputNote ? inputNote.value : "";
    const materiale = document.querySelector('input[name="bannerMateriale"]:checked').value;
    
    // 2. VALIDAZIONI
    if (prezzoUnitario <= 0) {
        alert("Attenzione: Dimensioni non valide o prezzo a zero.");
        return;
    }
    if (!utenteCorrenteId) {
        alert("Sessione scaduta o utente non loggato. Effettua il login.");
        return;
    }

    // 3. COSTRUZIONE DESCRIZIONE FINITURE
    let componentiList = [`Dim: ${larghezza}x${altezza} cm`, `Materiale: ${materiale}`];
    
    const finitureMap = {}; 
    document.querySelectorAll('.banner-finish:checked').forEach(chk => {
        const tipo = chk.dataset.tipo;
        if (!finitureMap[tipo]) finitureMap[tipo] = [];
        finitureMap[tipo].push(chk.value);
    });

    for (const [tipo, lati] of Object.entries(finitureMap)) {
        let desc = `${tipo}: ${lati.join(', ')}`;
        
        // Verifica esistenza input prima di leggere .value
        const inOcch = document.getElementById('bannerFreqOcchielli');
        const inDring = document.getElementById('bannerFreqDring');

        if (tipo === 'OCCHIELLI' && inOcch) desc += ` (ogni ${inOcch.value}cm)`;
        if (tipo === 'DRING' && inDring) desc += ` (ogni ${inDring.value}cm)`;
        
        componentiList.push(desc);
    }

    const laccettoRadio = document.querySelector('input[name="bannerLaccetto"]:checked');
    if (laccettoRadio && laccettoRadio.value !== 'NESSUNO') {
        componentiList.push(`Laccetto: ${laccettoRadio.value}`);
    }

    // 4. GESTIONE UPLOAD
    const fileInput = document.getElementById('bannerFileUpload');
    const fileToUpload = fileInput ? fileInput.files[0] : null;
    const uploadStatusBox = document.getElementById('bannerUploadStatusBox');
    const uploadMessage = document.getElementById('bannerUploadMessage');
    const uploadProgressBar = document.getElementById('bannerUploadProgressBar');
    let fileUrl = 'Nessun file caricato';

    // Controllo Dimensione File
    if (fileToUpload && fileToUpload.size > 5 * 1024 * 1024) {
        alert("File troppo grande (Max 5MB).");
        return;
    }

    if (fileToUpload) {
        const BUCKET_NAME = 'personalizzazioni';
        
        if (uploadStatusBox) {
            uploadStatusBox.style.display = 'block';
            if(uploadProgressBar) uploadProgressBar.style.width = '0%';
        }

        try {
            const extension = fileToUpload.name.split('.').pop();
            const filePath = `${utenteCorrenteId}/BANNER-${Date.now()}.${extension}`;
            
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, fileToUpload, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            if (uploadProgressBar) uploadProgressBar.style.width = '100%';
            if (uploadMessage) uploadMessage.textContent = '✅ File caricato.';

            fileUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;
            
            const expirationTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
            await supabase.from('temp_files').insert([{ storage_path: `${BUCKET_NAME}/${filePath}`, expires_at: expirationTime }]);

        } catch (e) {
            console.error(e);
            alert("Errore durante l'upload: " + e.message);
            if (uploadStatusBox) uploadStatusBox.style.display = 'none';
            return;
        }
    }

    // 5. CREAZIONE OGGETTO CARRELLO
    const nuovoArticolo = {
        id_unico: Date.now(),
        prodotto: `STRISCIONE SU MISURA`,
        quantita: qta, 
        prezzo_unitario: prezzoUnitario, 
        note: note,
        componenti: componentiList,
        personalizzazione_url: fileUrl,
        dettagli_taglie: {} 
    };

    // 6. INVIO AL CARRELLO
    aggiungiAlCarrello(nuovoArticolo);
    alert(`Aggiunti ${qta} Striscioni al preventivo!`);

    // 7. RESET
    if(inputNote) inputNote.value = '';
    if(inputQta) inputQta.value = '1';
    if(fileInput) fileInput.value = '';
    
    if (uploadStatusBox) {
        setTimeout(() => { uploadStatusBox.style.display = 'none'; }, 2000);
    }
    
    // Ricalcola il prezzo per riportarlo alla quantità 1
    calcolaPrezzoBanner();
}

// --- gestione bandiere al metro FINEEEEE ---



















document.addEventListener('DOMContentLoaded', () => {
    // ... (All'interno del tuo blocco DOMContentLoaded)
    
    const modal = document.getElementById('orderDetailsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    if (closeModalBtn && modal) {
        // Chiudi quando si clicca il pulsante X
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Chiudi quando si clicca fuori dal modale
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});
//chiusura nuova funzione modale


/*function mostraVistaPreventivo() {
    document.querySelector('.container').style.gridTemplateColumns = '1fr'; 
    document.getElementById('galleriaView').style.display = 'block'; 
    document.getElementById('sezioneCarrello').style.display = 'block'; 
    document.getElementById('ordiniCliente').style.display = 'none';
}

function mostraVistaOrdini() {
    document.querySelector('.container').style.gridTemplateColumns = '1fr'; 
    document.getElementById('galleriaView').style.display = 'none'; 
    document.getElementById('sezioneCarrello').style.display = 'none';
    document.getElementById('ordiniCliente').style.display = 'block'; 
    caricaMieiOrdini();
}*/

function mostraVistaPreventivo() {
    document.querySelector('.container').style.gridTemplateColumns = '1fr'; 
    
    // Mostra la galleria prodotti e il carrello
    document.getElementById('galleriaView').style.display = 'block'; 
    document.getElementById('sezioneCarrello').style.display = 'block'; 
    
    // Nascondi la sezione ordini
    document.getElementById('ordiniCliente').style.display = 'none';

    // --- FIX GRAFICO: Mostra i Banner e il Quick Order ---
    const bannerNav = document.querySelector('.banner-iniziale-nav');
    if (bannerNav) bannerNav.style.display = 'block';

   // const quickOrder = document.getElementById('quick-order-section');  --- se voglio far in modo che quick order rimanga sempre attivo all'avvio 
   // if (quickOrder) quickOrder.style.display = 'block';-------------------- della pagina cliente basta che tolgo i commenti su queste  2 righe
	
    // --- NOVITÀ: Nascondi vista Bonus ---
    const vistaBonus = document.getElementById('vistaBonus');
    if (vistaBonus) vistaBonus.style.display = 'none';

}

function mostraVistaOrdini() {
    document.querySelector('.container').style.gridTemplateColumns = '1fr'; 
    
    // Nascondi galleria e carrello
    document.getElementById('galleriaView').style.display = 'none'; 
    document.getElementById('sezioneCarrello').style.display = 'none';

    // 2. *** FIX CRITICO ***: Nascondi forzatamente TUTTE le singole sezioni prodotto
    // Questo assicura che Shopper o Scaldacollo spariscano anche se sono fuori dal div galleria
    const sezioni = document.querySelectorAll('.sezione-prodotto');
    sezioni.forEach(s => {
        s.style.display = 'none';
    });
    
    // Mostra la sezione ordini
    document.getElementById('ordiniCliente').style.display = 'block'; 
    
    // --- FIX GRAFICO: Nascondi esplicitamente Banner e Quick Order ---
    const bannerNav = document.querySelector('.banner-iniziale-nav');
    if (bannerNav) bannerNav.style.display = 'none';

    const quickOrder = document.getElementById('quick-order-section');
    if (quickOrder) quickOrder.style.display = 'none';
    
    
     // --- NOVITÀ: Nascondi vista Bonus ---
    const vistaBonus = document.getElementById('vistaBonus');
    if (vistaBonus) vistaBonus.style.display = 'none';

    // Carica i dati
    caricaMieiOrdini();
}

// --- FUNZIONE CHE PERMETTE LA VISTA PER I BONUS E PREMI DELL UTENTE ---
function mostraVistaBonus() {
    document.querySelector('.container').style.gridTemplateColumns = '1fr';

    // Nascondi TUTTO il resto
    document.getElementById('galleriaView').style.display = 'none';
    document.getElementById('sezioneCarrello').style.display = 'none';
    document.getElementById('ordiniCliente').style.display = 'none';
    
    const bannerNav = document.querySelector('.banner-iniziale-nav');
    if (bannerNav) bannerNav.style.display = 'none';
    const quickOrder = document.getElementById('quick-order-section');
    if (quickOrder) quickOrder.style.display = 'none';
    
    document.querySelectorAll('.sezione-prodotto').forEach(s => s.style.display = 'none');

    // Mostra solo la pagina Bonus
    const vistaBonus = document.getElementById('vistaBonus');
    if (vistaBonus) {
        vistaBonus.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Carica i calcoli
    caricaDatiVantaggi();
}




//------------------------------
// FUNZIONE DI CALCOLO DINAMICO DEL PREZZO PER LE BANDIERE SENZA CONNESSIONE AL DB
//------
function calcolaPrezzoDinamico() {
    // --- 1. RILEVAZIONE ATTRIBUTI ---
    const formaElement = document.querySelector('.forme .forma.active');
    const misuraElement = document.querySelector('.misure input:checked'); 
    const componentiSelezionati = Array.from(document.querySelectorAll('.componenti input:checked'));
    const prezzoDinamicoSpan = document.getElementById('prezzoDinamico');
    
    // Controlli minimi
    if (!formaElement || !misuraElement || !prezzoDinamicoSpan) {
        return; // Non ci sono elementi da aggiornare
    }

    //const forma = formaElement.textContent.trim();
    //const misura = misuraElement.value;
    const forma = formaElement.querySelector('span').textContent.trim();
    const misura = misuraElement.value;

    const listinoForma = LISTINO_COMPLETO[forma];
    const listinoMisura = listinoForma ? listinoForma[misura] : null;

    if (!listinoMisura) {
        prezzoDinamicoSpan.textContent = '€ Errore Listino';
        return;
    }

    let prezzoUnitarioFinale = 0;

    componentiSelezionati.forEach(checkbox => {
        const componenteKey = checkbox.value; 
        const prezzoComponente = listinoMisura[componenteKey] || 0;
        prezzoUnitarioFinale += prezzoComponente;
    });

    prezzoDinamicoSpan.textContent = `€ ${prezzoUnitarioFinale.toFixed(2)}`;
    
    const prezzoScontato = applicaSconto(prezzoUnitarioFinale);

    if (scontoUtente > 0) {
        prezzoDinamicoSpan.innerHTML = `
            <span style="text-decoration: line-through; color: #999; font-size: 0.8em;">€ ${prezzoUnitarioFinale.toFixed(2)}</span> 
            <span style="color: #28a745;">€ ${prezzoScontato.toFixed(2)}</span> 
            <small style="color: #28a745;">(-${scontoUtente}%)</small>`;
    } else {
        prezzoDinamicoSpan.textContent = `€ ${prezzoUnitarioFinale.toFixed(2)}`;
    }

    
}




// ===========================================
// FUNZIONI DI SUPPORTO PER LA STAMPA DTF
// ===========================================
// --- FUNZIONE DI CALCOLO DINAMICO DEL PREZZO DTF (Logica a Fasce con Minimo Totale) ---
function calcolaPrezzoDinamicoDTF() {
    const prezzoDinamicoSpan = document.getElementById('dtfPrezzoDinamico');
    const metriInput = document.getElementById('dtfMetri');
    const copieInput = document.getElementById('dtfCopie');

    if (!prezzoDinamicoSpan || !metriInput || !copieInput) return;

    const lunghezzaCm = parseFloat(metriInput.value) || 0;
    const numeroCopie = parseInt(copieInput.value) || 1;
    
    // Calcolo della lunghezza totale in metri
    const lunghezzaTotaleMetri = (lunghezzaCm * numeroCopie) / 100;
    
    let prezzoMetro = 0;
    let costoFinaleBase = 0; // Utilizzeremo questa variabile per il costo prima del "minimo"
    
    // 🛑 CONTROLLO MINIMO ORDINABILE (0.1 metri = 10 cm)
    if (lunghezzaTotaleMetri < MINIMO_METRI_DTF) {
        prezzoDinamicoSpan.textContent = `€ 0.00`;
        return;
    }
    
    // 1. Trova il prezzo al metro in base alla lunghezza TOTALE in metri
    const fasciaPrezzo = LISTINO_DTF_METRO.find(f => lunghezzaTotaleMetri <= f.max);
    
    if (fasciaPrezzo) {
        prezzoMetro = fasciaPrezzo.prezzo;
    } else {
        prezzoMetro = 9.50; 
    }

    // 2. Calcolo: Metri totali * Prezzo al Metro (corretto per fascia)
    const costoCalcolato = lunghezzaTotaleMetri * prezzoMetro;


    // 3. IMPLEMENTAZIONE DELLA REGOLA SPECIALE "COSTO TOTALE MINIMO DI €15.00 NELLA PRIMA FASCIA"
    
    // Se la quantità totale in metri è nella prima fascia (<= 3.0 m)
    if (lunghezzaTotaleMetri <= 3.0) {
        // Applica il prezzo di €15.00 (che è già il prezzo per metro, ma lo trattiamo come minimo totale)
        // Se il costo calcolato è minore di 15.00, imponi 15.00. Altrimenti, usa il costo calcolato.
        costoFinaleBase = Math.max(15.00, costoCalcolato);
        
    } else {
        // Per le fasce successive, si usa il costo calcolato (che sarà già > 15.00)
        costoFinaleBase = costoCalcolato;
    }
    
    // Il costo finale è il costo base (o il minimo imposto)
    //prezzoDinamicoSpan.textContent = `€ ${costoFinaleBase.toFixed(2)}`;------- togli il commento e funziona senza sconto, e cancella da inizio a fine sconto
    
    // --- INIZIO GESTIONE VISIVA SCONTO -----------------------------------------------------------------------------------------
    const totaleScontato = applicaSconto(costoFinaleBase);

    if (scontoUtente > 0) {
        prezzoDinamicoSpan.innerHTML = `
            <span style="text-decoration: line-through; color: #999; font-size: 0.8em;">€ ${costoFinaleBase.toFixed(2)}</span> 
            <span style="color: #28a745; font-weight: bold;">€ ${totaleScontato.toFixed(2)}</span>
            <small style="color: #28a745;">(-${scontoUtente}%)</small>`;
    } else {
        prezzoDinamicoSpan.textContent = `€ ${costoFinaleBase.toFixed(2)}`;
    }//----------------------------FINE SCONTO DTF------------------------------------------------------------------
    // *** FONDAMENTALE ***: Salviamo il prezzo LORDO in un attributo nascosto
    // Così la funzione di aggiunta al carrello legge questo numero pulito e non si confonde con l'HTML
    prezzoDinamicoSpan.dataset.valore = costoFinaleBase.toFixed(2);

    
}

// --- FUNZIONE DI AGGIUNTA DTF AL CARRELLO (con upload) ---
async function gestisciAggiuntaDTF() {
    
    // --- 1. RILEVAZIONE ATTRIBUTI ---
    const fileInput = document.getElementById('dtfFileUpload');
    const fileToUpload = fileInput.files[0]; 
    const nomeFile = document.getElementById('dtfNomeFile').value.trim();
    const lunghezzaCm = parseFloat(document.getElementById('dtfMetri').value) || 0;
    const numeroCopie = parseInt(document.getElementById('dtfCopie').value) || 1;
    const note = document.getElementById('dtfNote').value;
    
    // Variabili per lo stato di upload
    const uploadStatusBox = document.getElementById('dtfUploadStatusBox');
    const uploadMessage = document.getElementById('dtfUploadMessage');
    const uploadProgressBar = document.getElementById('dtfUploadProgressBar');

    // Recupero del prezzo calcolato dinamicamente (totale finale)
    const prezzoDinamicoSpan = document.getElementById('dtfPrezzoDinamico');
    //const totaleCalcolato = parseFloat(prezzoDinamicoSpan.textContent.replace('€', '').trim()) || 0;----------senza calcolo sconto funzionava
    // Leggiamo il valore lordo salvato nel dataset, così aggiungiAlCarrello applicherà lo sconto correttamente
    const totaleCalcolato = parseFloat(prezzoDinamicoSpan.dataset.valore) || 0;

    // --- 2. CONTROLLI DI VALIDAZIONE ---
    if (!fileToUpload) {
        alert("Devi caricare un file per la stampa DTF (.PNG / .PDF).");
        return;
    }
    if (nomeFile === "") {
        alert("Inserisci un Nome del File per il tracciamento.");
        return;
    }
    if (lunghezzaCm <= 0 || isNaN(lunghezzaCm) || numeroCopie < 1 || isNaN(numeroCopie)) {
        alert("Lunghezza e Quantità Copie devono essere valori validi e positivi.");
        return;
    }
    if (totaleCalcolato <= 0) {
        alert("Il prezzo calcolato è zero. Verifica i valori di stampa.");
        return;
    }
    if (!utenteCorrenteId) {
        alert("Errore: ID Utente non disponibile. Effettua nuovamente il login.");
        return;
    }
    
    // Logica di upload e tracciamento (omessa per brevità, assumiamo sia corretta e simile a 'gestisciAggiuntaAlCarrello')
    let fileUrl = 'Nessun file caricato (Errore)';  
    const BUCKET_NAME_DTF = 'personalizzazioni'; 
    const lunghezzaTotaleMetri = (lunghezzaCm * numeroCopie) / 100;

    // Mostra la barra di progresso
    if (uploadStatusBox) {
        uploadStatusBox.style.display = 'block';
        uploadMessage.textContent = 'Preparazione per il caricamento...';
        uploadProgressBar.style.width = '0%';
        uploadProgressBar.style.backgroundColor = '#007bff';
    }

    try {
        const extension = fileToUpload.name.split('.').pop();
        const filePath = `${utenteCorrenteId}/DTF-${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;
        
        if (uploadMessage) uploadMessage.textContent = 'Caricamento in corso...';

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME_DTF)
          .upload(filePath, fileToUpload, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        if (uploadProgressBar) uploadProgressBar.style.width = '100%';
        if (uploadMessage) uploadMessage.textContent = '✅ File caricato con successo. Registrazione DB...';
        
        fileUrl = supabase.storage.from(BUCKET_NAME_DTF).getPublicUrl(filePath).data.publicUrl;
        
        const expirationTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
        const { error: dbError } = await supabase.from('temp_files').insert([{ storage_path: `${BUCKET_NAME_DTF}/${filePath}`, expires_at: expirationTime }]);

        if (dbError) {
          await supabase.storage.from(BUCKET_NAME_DTF).remove([filePath]);
          throw dbError;
        }

    } catch (e) {
        console.error('Errore Upload/Tracciamento DTF:', e.message);
        alert(`Errore critico durante il caricamento del file DTF. Riprova. Dettagli: ${e.message}`);
        if (uploadStatusBox) uploadStatusBox.style.display = 'none';
        fileInput.value = ''; 
        return; 
    }
    
    // --- 4. CREAZIONE ARTICOLO PER CARRELLO ---
    
    // Il prezzo unitario è il prezzo per SINGOLA COPIA
    const prezzoPerCopia = totaleCalcolato / numeroCopie; 

    const nuovoArticolo = {  
        id_unico: Date.now(),  
        prodotto: `STAMPA DTF (Nome File: ${nomeFile})`,  
        quantita: numeroCopie, // Quante "rullate" totali
        prezzo_unitario: parseFloat(prezzoPerCopia.toFixed(2)), 
        componenti: [
            `Metri Lineari per Copia: ${(lunghezzaCm / 100).toFixed(2)}m`, 
            `Lunghezza Totale: ${lunghezzaTotaleMetri.toFixed(2)} metri`,
            `Larghezza Rullo: ${LISTINO_COMPLETO.DTF.LARGHEZZA_FISSA_CM} cm`
        ],
        note: note,
        personalizzazione_url: fileUrl 
    };

    aggiungiAlCarrello(nuovoArticolo);
    alert(`Aggiunto Stampa DTF (${lunghezzaTotaleMetri.toFixed(2)}mt totali) al preventivo per € ${totaleCalcolato.toFixed(2)} Totali! (File: OK)`);
    
    // Pulisci lo stato di upload e i campi
    if (uploadStatusBox) {
        setTimeout(() => { uploadStatusBox.style.display = 'none'; }, 2000);
    }
    fileInput.value = ''; 
    document.getElementById('dtfNomeFile').value = '';
    document.getElementById('dtfNote').value = '';
    document.getElementById('dtfMetri').value = '10';
    document.getElementById('dtfCopie').value = '1';
    calcolaPrezzoDinamicoDTF(); 
}
//*** INZIO CODICE E FUNZIONI PER CALCOLO -----SCALDACOLLO-----

// ===========================================
// FUNZIONI PER LO SCALDACOLLO
// ===========================================

// LISTINO PREZZI (Definito in base alla tua richiesta)
const LISTINO_SCALDACOLLO = {
    "PILE": [
        { max: 8, price: 6.00 },
        { max: 30, price: 4.50 },
        { max: 50, price: 3.90 },
        { max: 100, price: 3.50 },
        { max: 200, price: 3.00 },
        { max: 300, price: 2.70 },
        { max: 550, price: 2.50 },
        { max: 999999, price: 2.50 }
    ],
    // Per Interlock: Minimo 25, Multipli di 25
    "INTERLOCK": [
        { max: 25, price: 3.50 },
        { max: 50, price: 2.80 },
        { max: 75, price: 2.50 },
        { max: 100, price: 2.30 },
        { max: 300, price: 2.25 },
        { max: 999999, price: 2.15 }
    ]
};

function calcolaPrezzoScaldacollo() {
    const tessuto = document.querySelector('input[name="scaldacolloTessuto"]:checked').value;
    const inputQta = document.getElementById('scaldacolloQta');
    const hint = document.getElementById('scaldacolloHint');
    
    // Aggiornamento vincoli input in base al tessuto
    if (tessuto === 'INTERLOCK') {
        inputQta.min = 25;
        inputQta.step = 25;
        hint.textContent = "Minimo 25 pz - Solo multipli di 25 (es. 25, 50, 75...)";
        // Se l'utente ha messo un numero non valido mentre cambiava tessuto, lo correggiamo visivamente (o lo lasciamo gestire alla validazione)
        if (inputQta.value < 25) inputQta.value = 25;
    } else {
        inputQta.min = 10;
        inputQta.step = 10;
        hint.textContent = "Minimo 10 pz";
        // Se l'utente ha un valore inferiore a 10 (es. era su Interlock e torna a Pile), correggiamo
        if (inputQta.value < 10) inputQta.value = 10;
    }

    const qta = parseInt(inputQta.value) || 0;
    
    // Recupero Elementi UI Prezzi
    const elUnitario = document.getElementById('scaldacolloPrezzoUnitario');
    const elTotNetto = document.getElementById('scaldacolloTotaleNetto');
    const elTotIvato = document.getElementById('scaldacolloTotaleIvato');

    if (qta === 0) {
        elUnitario.textContent = "€ 0.00";
        elTotNetto.textContent = "€ 0.00";
        elTotIvato.textContent = "€ 0.00";
        return;
    }

    // Logica Prezzo
    let prezzoUnitario = 0;
    const fasce = LISTINO_SCALDACOLLO[tessuto];

    // Trova la fascia corretta
    const fasciaTrovata = fasce.find(f => qta <= f.max);
    
    if (fasciaTrovata) {
        prezzoUnitario = fasciaTrovata.price;
    } else {
        // Fallback sull'ultima fascia se supera il max (gestito comunque dal 999999)
        prezzoUnitario = fasce[fasce.length - 1].price;
    }

    const totaleNetto = qta * prezzoUnitario;
    const totaleIvato = totaleNetto * 1.22; // IVA 22%

    //elUnitario.textContent = `€ ${prezzoUnitario.toFixed(2)}`;
   // elTotNetto.textContent = `€ ${totaleNetto.toFixed(2)}`;
     //-----------INIZIO GESTIONE SCONTO------------------------------------------------------------- 
    const unitarioScontato = applicaSconto(prezzoUnitario);
    if (scontoUtente > 0) {
        elUnitario.innerHTML = `<span style="text-decoration: line-through; color: #999; font-size: 0.8em;">€ ${prezzoUnitario.toFixed(2)}</span> <span style="color: #28a745;">€ ${unitarioScontato.toFixed(2)}</span> <small style="color: #28a745;">(-${scontoUtente}%)</small>`;
        elTotNetto.textContent = `€ ${applicaSconto(totaleNetto).toFixed(2)}`;
    } else {
        elUnitario.textContent = `€ ${prezzoUnitario.toFixed(2)}`;
        elTotNetto.textContent = `€ ${totaleNetto.toFixed(2)}`;
    } //-----------FINE GESTIONE SCONTO------------------------------------------------------------- 

    elTotIvato.textContent = `€ ${totaleIvato.toFixed(2)}`;
   }

async function gestisciAggiuntaScaldacollo() {
    const tessuto = document.querySelector('input[name="scaldacolloTessuto"]:checked').value;
    const qta = parseInt(document.getElementById('scaldacolloQta').value) || 0;
    const note = document.getElementById('scaldacolloNote').value;
    
    // Validazione Specifica Interlock
    if (tessuto === 'INTERLOCK') {
        if (qta < 25 || qta % 25 !== 0) {
            alert("Per il tessuto INTERLOCK la quantità deve essere almeno 25 e un multiplo di 25 (es. 25, 50, 75).");
            return;
        }
    } else {
        if (qta < 10) {
            alert("Il minimo ordinabile per gli Scaldacollo in PILE è di 10 pezzi.");
            return;
        }
    }

    if (!utenteCorrenteId) {
        alert("Utente non loggato.");
        return;
    }

    // Gestione Upload (Simile alle altre funzioni)
    const fileInput = document.getElementById('scaldacolloFileUpload');
    const fileToUpload = fileInput.files[0];
    const uploadStatusBox = document.getElementById('scaldacolloUploadStatusBox');
    const uploadMessage = document.getElementById('scaldacolloUploadMessage');
    const uploadProgressBar = document.getElementById('scaldacolloUploadProgressBar');
    let fileUrl = 'Nessun file caricato';

    // Controllo dimensione
    if (fileToUpload && fileToUpload.size > 5 * 1024 * 1024) {
        alert("File troppo grande (Max 5MB).");
        return;
    }

    if (fileToUpload) {
        const BUCKET_NAME = 'personalizzazioni';
        if (uploadStatusBox) {
            uploadStatusBox.style.display = 'block';
            uploadProgressBar.style.width = '0%';
        }

        try {
            const extension = fileToUpload.name.split('.').pop();
            const filePath = `${utenteCorrenteId}/SCALDACOLLO-${Date.now()}.${extension}`;
            
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, fileToUpload, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            if (uploadProgressBar) uploadProgressBar.style.width = '100%';
            if (uploadMessage) uploadMessage.textContent = '✅ File caricato.';

            fileUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;
            
            // Tracciamento scadenza (Opzionale, copia dalle altre funzioni se necessario)
             const expirationTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
             await supabase.from('temp_files').insert([{ storage_path: `${BUCKET_NAME}/${filePath}`, expires_at: expirationTime }]);

        } catch (e) {
            console.error(e);
            alert("Errore upload file: " + e.message);
            if (uploadStatusBox) uploadStatusBox.style.display = 'none';
            return;
        }
    }

    // Recupero il prezzo unitario calcolato
    const prezzoUnitarioText = document.getElementById('scaldacolloPrezzoUnitario').textContent.replace('€', '').trim();
    const prezzoUnitario = parseFloat(prezzoUnitarioText) || 0;

    const nuovoArticolo = {
        id_unico: Date.now(),
        prodotto: `SCALDACOLLO - ${tessuto}`,
        quantita: qta,
        prezzo_unitario: prezzoUnitario,
        note: note,
        componenti: [`Tessuto: ${tessuto}`, `Stampa Sublimatica`],
        personalizzazione_url: fileUrl,
        dettagli_taglie: {} // Vuoto per scaldacollo
    };

    aggiungiAlCarrello(nuovoArticolo);
    alert(`Aggiunti ${qta} Scaldacollo (${tessuto}) al carrello!`);

    // Reset
    document.getElementById('scaldacolloNote').value = '';
    if (fileInput) fileInput.value = '';
    if (uploadStatusBox) setTimeout(() => { uploadStatusBox.style.display = 'none'; }, 2000);
}


//---- FINE SCALDACOLLO-----------------


//------- INIZIO SHOPPER---------------
// ===========================================
// FUNZIONI PER LE SHOPPER
// ===========================================

// LISTINO PREZZI DETTAGLIATO PER MATERIALE
const LISTINO_SHOPPER = {
    "POLIESTERE": [
        { max: 10, price: 4.50 },
        { max: 30, price: 3.90 },
        { max: 50, price: 3.20 },
        { max: 71, price: 2.99 },
        { max: 100, price: 2.54 },
        { max: 300, price: 2.34 },
        { max: 500, price: 2.21 },
        { max: 750, price: 2.10 },
        { max: 3000, price: 1.95 },
        { max: 999999, price: 1.80 }
    ],
    "TNT": [
        { max: 10, price: 4.50 },
        { max: 30, price: 3.50 },
        { max: 50, price: 2.40 },
        { max: 71, price: 2.20 },
        { max: 100, price: 2.10 },
        { max: 300, price: 1.99 },
        { max: 500, price: 1.90 },
        { max: 750, price: 1.80 },
        { max: 1000, price: 1.75 },
        { max: 999999, price: 1.70 }
    ],
    "GABARDINA": [
        { max: 10, price: 5.50 },
        { max: 30, price: 4.50 },
        { max: 50, price: 3.50 },
        { max: 71, price: 3.35 },
        { max: 100, price: 3.10 },
        { max: 300, price: 2.95 },
        { max: 500, price: 2.50 },
        { max: 750, price: 2.20 },
        { max: 3000, price: 2.15 },
        { max: 999999, price: 2.05 }
    ]
};

function calcolaPrezzoShopper() {
    // 1. Recupera il tessuto selezionato (POLIESTERE, GABARDINA o TNT)
    const tessutoRadio = document.querySelector('input[name="shopperTessuto"]:checked');
    const tessuto = tessutoRadio ? tessutoRadio.value : "POLIESTERE";
    
    // 2. Recupera quantità
    const inputQta = document.getElementById('shopperQta');
    const qta = parseInt(inputQta.value) || 0;
    
    // Elementi UI
    const elUnitario = document.getElementById('shopperPrezzoUnitario');
    const elTotNetto = document.getElementById('shopperTotaleNetto');
    const elTotIvato = document.getElementById('shopperTotaleIvato');

    // Minimo d'ordine 10
    if (qta < 10) { 
        elUnitario.textContent = "€ 0.00";
        elTotNetto.textContent = "€ 0.00";
        elTotIvato.textContent = "€ 0.00";
        return;
    }

    // 3. Trova la lista prezzi specifica per il tessuto
    const listinoSelezionato = LISTINO_SHOPPER[tessuto];
    
    // 4. Trova la fascia di prezzo corretta
    let prezzoUnitario = 0;
    const fascia = listinoSelezionato.find(f => qta <= f.max);
    
    if (fascia) {
        prezzoUnitario = fascia.price;
    } else {
        // Fallback sull'ultimo prezzo se supera il massimo definito
        prezzoUnitario = listinoSelezionato[listinoSelezionato.length - 1].price;
    }

    // 5. Calcoli Totali
    const totaleNetto = qta * prezzoUnitario;
    const totaleIvato = totaleNetto * 1.22; // IVA 22%

    // 6. Aggiorna UI
    //elUnitario.textContent = `€ ${prezzoUnitario.toFixed(2)}`;
    //elTotNetto.textContent = `€ ${totaleNetto.toFixed(2)}`;
    //-----------INIZIO GESTIONE SCONTO SHOPPER------------------------
    const unitarioScontato = applicaSconto(prezzoUnitario);
    if (scontoUtente > 0) {
        elUnitario.innerHTML = `<span style="text-decoration: line-through; color: #999; font-size: 0.8em;">€ ${prezzoUnitario.toFixed(2)}</span> <span style="color: #28a745;">€ ${unitarioScontato.toFixed(2)}</span> <small style="color: #28a745;">(-${scontoUtente}%)</small>`;
        elTotNetto.textContent = `€ ${applicaSconto(totaleNetto).toFixed(2)}`;
    } else {
        elUnitario.textContent = `€ ${prezzoUnitario.toFixed(2)}`;
        elTotNetto.textContent = `€ ${totaleNetto.toFixed(2)}`;
    }
    //-----------FINE GESTIONE SCONTO SHOPPER--------------------------
    elTotIvato.textContent = `€ ${totaleIvato.toFixed(2)}`;
}

async function gestisciAggiuntaShopper() {
    const tessuto = document.querySelector('input[name="shopperTessuto"]:checked').value;
    const qta = parseInt(document.getElementById('shopperQta').value) || 0;
    const note = document.getElementById('shopperNote').value;

    if (qta < 10) {
        alert("Il minimo ordinabile per le Shopper è di 10 pezzi.");
        return;
    }

    if (!utenteCorrenteId) {
        alert("Sessione scaduta o utente non loggato. Effettua il login.");
        return;
    }

    // --- Gestione Upload ---
    const fileInput = document.getElementById('shopperFileUpload');
    const fileToUpload = fileInput.files[0];
    const uploadStatusBox = document.getElementById('shopperUploadStatusBox');
    const uploadMessage = document.getElementById('shopperUploadMessage');
    const uploadProgressBar = document.getElementById('shopperUploadProgressBar');
    let fileUrl = 'Nessun file caricato';

    // Controllo Dimensione File
    if (fileToUpload && fileToUpload.size > 5 * 1024 * 1024) {
        alert("File troppo grande (Max 5MB).");
        return;
    }

    if (fileToUpload) {
        const BUCKET_NAME = 'personalizzazioni';
        if (uploadStatusBox) {
            uploadStatusBox.style.display = 'block';
            uploadProgressBar.style.width = '0%';
            uploadStatusBox.scrollIntoView({ behavior: 'smooth' });
        }

        try {
            const extension = fileToUpload.name.split('.').pop();
            const filePath = `${utenteCorrenteId}/SHOPPER-${Date.now()}.${extension}`;
            
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, fileToUpload, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            if (uploadProgressBar) uploadProgressBar.style.width = '100%';
            if (uploadMessage) uploadMessage.textContent = '✅ File caricato.';

            fileUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;
            
            // Tracciamento scadenza nel DB
            const expirationTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
            await supabase.from('temp_files').insert([{ storage_path: `${BUCKET_NAME}/${filePath}`, expires_at: expirationTime }]);

        } catch (e) {
            console.error(e);
            alert("Errore durante l'upload: " + e.message);
            if (uploadStatusBox) uploadStatusBox.style.display = 'none';
            return;
        }
    }

    // Recupero Prezzo Calcolato dall'UI (che è stato aggiornato da calcolaPrezzoShopper)
    const prezzoUnitarioText = document.getElementById('shopperPrezzoUnitario').textContent.replace('€', '').trim();
    const prezzoUnitario = parseFloat(prezzoUnitarioText) || 0;

    const nuovoArticolo = {
        id_unico: Date.now(),
        prodotto: `SHOPPER PERSONALIZZATA - ${tessuto}`,
        quantita: qta,
        prezzo_unitario: prezzoUnitario,
        note: note,
        componenti: [
            `Materiale: ${tessuto}`,
            `Dimensione: 38x42 cm (Manici Lunghi)`,
            `Stampa Sublimatica`
        ],
        personalizzazione_url: fileUrl,
        dettagli_taglie: {} 
    };

    aggiungiAlCarrello(nuovoArticolo);
    alert(`Aggiunte ${qta} Shopper (${tessuto}) al preventivo!`);

    // Reset Interfaccia
    document.getElementById('shopperNote').value = '';
    if (fileInput) fileInput.value = '';
    if (uploadStatusBox) setTimeout(() => { uploadStatusBox.style.display = 'none'; }, 2000);
}
//------- FINE SHOPPER-------------------------


//-------INIZIO SACCHE -------------------------------------------------

// ===========================================
// FUNZIONI PER LE SACCHE (ZAINETTI)
// ===========================================

const LISTINO_SACCHE = {
    "POLIESTERE": [
        { max: 10, price: 4.70 },
        { max: 30, price: 4.10 },
        { max: 50, price: 3.40 },
        { max: 71, price: 3.10 },
        { max: 100, price: 2.75 },
        { max: 300, price: 2.50 },
        { max: 500, price: 2.30 },
        { max: 750, price: 2.15 },
        { max: 3000, price: 1.99 },
        { max: 999999, price: 1.95 }
    ],
    "TNT": [
        { max: 10, price: 4.30 },
        { max: 30, price: 3.40 },
        { max: 50, price: 3.00 },
        { max: 71, price: 2.80 },
        { max: 100, price: 2.60 },
        { max: 300, price: 2.40 },
        { max: 500, price: 2.25 },
        { max: 750, price: 2 },
        { max: 1000, price: 1.95 },
        { max: 999999, price: 1.85 }
    ],
    "GABARDINA": [
        { max: 10, price: 5.50 },
        { max: 30, price: 4.50 },
        { max: 50, price: 3.70 },
        { max: 71, price: 3.55 },
        { max: 100, price: 3.30 },
        { max: 300, price: 3.05 },
        { max: 500, price: 2.80 },
        { max: 750, price: 2.45 },
        { max: 3000, price: 2.25 },
        { max: 999999, price: 2.05 }
    ]
};

function calcolaPrezzoSacche() {
    const tessuto = document.querySelector('input[name="saccheTessuto"]:checked').value;
    const inputQta = document.getElementById('saccheQta');
    const qta = parseInt(inputQta.value) || 0;
    
    // Elementi UI
    const elUnitario = document.getElementById('sacchePrezzoUnitario');
    const elTotNetto = document.getElementById('saccheTotaleNetto');
    const elTotIvato = document.getElementById('saccheTotaleIvato');

    if (qta < 10) { 
        elUnitario.textContent = "€ 0.00";
        elTotNetto.textContent = "€ 0.00";
        elTotIvato.textContent = "€ 0.00";
        return;
    }

    // 1. Trova il listino corretto
    const listinoSelezionato = LISTINO_SACCHE[tessuto];
    
    // 2. Trova la fascia di prezzo
    let prezzoUnitario = 0;
    const fascia = listinoSelezionato.find(f => qta <= f.max);
    
    if (fascia) {
        prezzoUnitario = fascia.price;
    } else {
        prezzoUnitario = listinoSelezionato[listinoSelezionato.length - 1].price;
    }

    const totaleNetto = qta * prezzoUnitario;

    // =============================================================
    // GESTIONE SCONTO
    // =============================================================
    const unitarioScontato = (typeof applicaSconto === 'function') ? applicaSconto(prezzoUnitario) : prezzoUnitario;
    const totaleNettoScontato = (typeof applicaSconto === 'function') ? applicaSconto(totaleNetto) : totaleNetto;

    if (typeof scontoUtente !== 'undefined' && scontoUtente > 0) {
        elUnitario.innerHTML = `<span style="text-decoration: line-through; color: #999; font-size: 0.8em;">€ ${prezzoUnitario.toFixed(2)}</span> <span style="color: #28a745;">€ ${unitarioScontato.toFixed(2)}</span> <small style="color: #28a745;">(-${scontoUtente}%)</small>`;
        elTotNetto.textContent = `€ ${totaleNettoScontato.toFixed(2)}`;
    } else {
        elUnitario.textContent = `€ ${prezzoUnitario.toFixed(2)}`;
        elTotNetto.textContent = `€ ${totaleNetto.toFixed(2)}`;
    }
    // =============================================================

    // Calcolo IVA sul totale (che sia scontato o pieno)
    const baseImponibile = (typeof scontoUtente !== 'undefined' && scontoUtente > 0) ? totaleNettoScontato : totaleNetto;
    const totaleIvato = baseImponibile * 1.22;

    elTotIvato.textContent = `€ ${totaleIvato.toFixed(2)}`;
}

async function gestisciAggiuntaSacche() {
    const tessuto = document.querySelector('input[name="saccheTessuto"]:checked').value;
    const qta = parseInt(document.getElementById('saccheQta').value) || 0;
    const note = document.getElementById('saccheNote').value;

    if (qta < 10) {
        alert("Il minimo ordinabile per le Sacche è di 10 pezzi.");
        return;
    }

    if (!utenteCorrenteId) {
        alert("Sessione scaduta. Effettua il login.");
        return;
    }

    // Gestione Upload
    const fileInput = document.getElementById('saccheFileUpload');
    const fileToUpload = fileInput.files[0];
    const uploadStatusBox = document.getElementById('saccheUploadStatusBox');
    const uploadMessage = document.getElementById('saccheUploadMessage');
    const uploadProgressBar = document.getElementById('saccheUploadProgressBar');
    let fileUrl = 'Nessun file caricato';

    if (fileToUpload && fileToUpload.size > 5 * 1024 * 1024) {
        alert("File troppo grande (Max 5MB).");
        return;
    }

    if (fileToUpload) {
        const BUCKET_NAME = 'personalizzazioni';
        if (uploadStatusBox) {
            uploadStatusBox.style.display = 'block';
            uploadProgressBar.style.width = '0%';
        }

        try {
            const extension = fileToUpload.name.split('.').pop();
            const filePath = `${utenteCorrenteId}/SACCA-${Date.now()}.${extension}`;
            
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, fileToUpload, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            if (uploadProgressBar) uploadProgressBar.style.width = '100%';
            if (uploadMessage) uploadMessage.textContent = '✅ File caricato.';

            fileUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;
            
            const expirationTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
            await supabase.from('temp_files').insert([{ storage_path: `${BUCKET_NAME}/${filePath}`, expires_at: expirationTime }]);

        } catch (e) {
            console.error(e);
            alert("Errore upload: " + e.message);
            if (uploadStatusBox) uploadStatusBox.style.display = 'none';
            return;
        }
    }

    // Calcolo Prezzo Unitario da salvare (Scontato o Pieno)
    const listinoSelezionato = LISTINO_SACCHE[tessuto];
    let prezzoUnitarioBase = 0;
    const fascia = listinoSelezionato.find(f => qta <= f.max);
    prezzoUnitarioBase = fascia ? fascia.price : listinoSelezionato[listinoSelezionato.length - 1].price;

    let prezzoFinaleSalvataggio = prezzoUnitarioBase;
    if (typeof applicaSconto === 'function' && typeof scontoUtente !== 'undefined' && scontoUtente > 0) {
        prezzoFinaleSalvataggio = applicaSconto(prezzoUnitarioBase);
    }

    const nuovoArticolo = {
        id_unico: Date.now(),
        prodotto: `SACCA PERSONALIZZATA - ${tessuto}`,
        quantita: qta,
        prezzo_unitario: parseFloat(prezzoFinaleSalvataggio.toFixed(2)), 
        note: note,
        componenti: [
            `Materiale: ${tessuto}`,
            `Modello: Zainetto con cordini`,
            `Stampa Sublimatica`
        ],
        personalizzazione_url: fileUrl,
        dettagli_taglie: {} 
    };

    aggiungiAlCarrello(nuovoArticolo);
    alert(`Aggiunte ${qta} Sacche (${tessuto}) al carrello!`);

    // Reset
    document.getElementById('saccheNote').value = '';
    if (fileInput) fileInput.value = '';
    if (uploadStatusBox) setTimeout(() => { uploadStatusBox.style.display = 'none'; }, 2000);
}

//-------- FINE SACCHE --------------------------------------



//------- inizio portachiavi------------------

// ===========================================
// FUNZIONI PER I PORTACHIAVI
// ===========================================

const LISTINO_PORTACHIAVI = [
    { max: 75, price: 1.50 },
    { max: 100, price: 1.20 },
    { max: 200, price: 1.00 },
    { max: 300, price: 0.90 },
    { max: 999999, price: 0.80 }
];

function calcolaPrezzoPortachiavi() {
    const inputQta = document.getElementById('portachiaviQta');
    const qta = parseInt(inputQta.value) || 0;

    // Elementi UI
    const elUnitario = document.getElementById('portachiaviPrezzoUnitario');
    const elTotNetto = document.getElementById('portachiaviTotaleNetto');
    const elTotIvato = document.getElementById('portachiaviTotaleIvato');

    if (qta < 50) {
        elUnitario.textContent = "€ 0.00";
        elTotNetto.textContent = "€ 0.00";
        elTotIvato.textContent = "€ 0.00";
        return;
    }

    // 1. Trova Prezzo Base
    let prezzoUnitario = 0;
    const fascia = LISTINO_PORTACHIAVI.find(f => qta <= f.max);
    if (fascia) {
        prezzoUnitario = fascia.price;
    } else {
        prezzoUnitario = LISTINO_PORTACHIAVI[LISTINO_PORTACHIAVI.length - 1].price;
    }

    const totaleNetto = qta * prezzoUnitario;

    // Gestione Sconto (Se presente la funzione globale)
    const unitarioScontato = (typeof applicaSconto === 'function') ? applicaSconto(prezzoUnitario) : prezzoUnitario;
    const totaleNettoScontato = (typeof applicaSconto === 'function') ? applicaSconto(totaleNetto) : totaleNetto;

    if (typeof scontoUtente !== 'undefined' && scontoUtente > 0) {
        elUnitario.innerHTML = `<span style="text-decoration: line-through; color: #999; font-size: 0.8em;">€ ${prezzoUnitario.toFixed(2)}</span> <span style="color: #28a745;">€ ${unitarioScontato.toFixed(2)}</span> <small style="color: #28a745;">(-${scontoUtente}%)</small>`;
        elTotNetto.textContent = `€ ${totaleNettoScontato.toFixed(2)}`;
    } else {
        elUnitario.textContent = `€ ${prezzoUnitario.toFixed(2)}`;
        elTotNetto.textContent = `€ ${totaleNetto.toFixed(2)}`;
    }

    // Calcolo IVA
    const baseImponibile = (typeof scontoUtente !== 'undefined' && scontoUtente > 0) ? totaleNettoScontato : totaleNetto;
    const totaleIvato = baseImponibile * 1.22;

    elTotIvato.textContent = `€ ${totaleIvato.toFixed(2)}`;
}

async function gestisciAggiuntaPortachiavi() {
    const qta = parseInt(document.getElementById('portachiaviQta').value) || 0;
    const note = document.getElementById('portachiaviNote').value;

    if (qta < 50) {
        alert("Il minimo ordinabile per i Portachiavi è di 50 pezzi.");
        return;
    }
    if (!utenteCorrenteId) {
        alert("Sessione scaduta. Login necessario.");
        return;
    }

    // Gestione Upload
    const fileInput = document.getElementById('portachiaviFileUpload');
    const fileToUpload = fileInput.files[0];
    const uploadStatusBox = document.getElementById('portachiaviUploadStatusBox');
    const uploadMessage = document.getElementById('portachiaviUploadMessage');
    const uploadProgressBar = document.getElementById('portachiaviUploadProgressBar');
    let fileUrl = 'Nessun file caricato';

    if (fileToUpload && fileToUpload.size > 5 * 1024 * 1024) {
        alert("File troppo grande (Max 5MB)."); return;
    }

    if (fileToUpload) {
        const BUCKET_NAME = 'personalizzazioni';
        if (uploadStatusBox) {
            uploadStatusBox.style.display = 'block';
            uploadProgressBar.style.width = '0%';
        }
        try {
            const extension = fileToUpload.name.split('.').pop();
            const filePath = `${utenteCorrenteId}/PORTACHIAVI-${Date.now()}.${extension}`;
            const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, fileToUpload, { cacheControl: '3600', upsert: false });
            if (uploadError) throw uploadError;
            if (uploadProgressBar) uploadProgressBar.style.width = '100%';
            if (uploadMessage) uploadMessage.textContent = '✅ File caricato.';
            fileUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;
            
            const expirationTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
            await supabase.from('temp_files').insert([{ storage_path: `${BUCKET_NAME}/${filePath}`, expires_at: expirationTime }]);
        } catch (e) {
            console.error(e); alert("Errore upload: " + e.message);
            if (uploadStatusBox) uploadStatusBox.style.display = 'none'; return;
        }
    }

    // Calcolo Prezzo Finale da salvare
    let prezzoUnitarioBase = 0;
    const fascia = LISTINO_PORTACHIAVI.find(f => qta <= f.max);
    prezzoUnitarioBase = fascia ? fascia.price : LISTINO_PORTACHIAVI[LISTINO_PORTACHIAVI.length - 1].price;

    let prezzoFinaleSalvataggio = prezzoUnitarioBase;
    if (typeof applicaSconto === 'function' && typeof scontoUtente !== 'undefined' && scontoUtente > 0) {
        prezzoFinaleSalvataggio = applicaSconto(prezzoUnitarioBase);
    }

    const nuovoArticolo = {
        id_unico: Date.now(),
        prodotto: `PORTACHIAVI PERSONALIZZATO`,
        quantita: qta,
        prezzo_unitario: parseFloat(prezzoFinaleSalvataggio.toFixed(2)),
        note: note,
        componenti: [
            `2 Strati (Stampa + Ottomano)`,
            `Anello 30mm incluso`,
            `Stampa Sublimatica`
        ],
        personalizzazione_url: fileUrl,
        dettagli_taglie: {} 
    };

    aggiungiAlCarrello(nuovoArticolo);
    alert(`Aggiunti ${qta} Portachiavi al carrello!`);

    // Reset
    document.getElementById('portachiaviNote').value = '';
    if (fileInput) fileInput.value = '';
    if (uploadStatusBox) setTimeout(() => { uploadStatusBox.style.display = 'none'; }, 2000);
}


//---------- FINE PORTACHIAVI----------------


//----------- inizio GREMBIULI-----------------
// ===========================================
// FUNZIONI PER I GREMBIULI
// ===========================================

const LISTINO_GREMBIULI = {
    "POLIESTERE": [
        { max: 12, price: 8.50 },
        { max: 25, price: 6.00 },
        { max: 50, price: 4.90 },
        { max: 100, price: 4.35 },
        { max: 250, price: 4.15 },
        { max: 500, price: 3.90 },
        { max: 1000, price: 3.70 },
        { max: 999999, price: 3.58 }
    ],
    "GABARDINA": [
        { max: 12, price: 8.50 },
        { max: 25, price: 6.80 },
        { max: 50, price: 5.40 },
        { max: 100, price: 4.85 },
        { max: 250, price: 4.45 },
        { max: 500, price: 4.10 },
        { max: 1000, price: 3.88 },
        { max: 999999, price: 3.68 }
    ],
    "TNT": [
        { max: 12, price: 7.50 },
        { max: 25, price: 5.30 },
        { max: 50, price: 4.30 },
        { max: 100, price: 3.90 },
        { max: 250, price: 4.15 }, // Nota: Valore come da tua indicazione (attenzione: è più alto della fascia precedente)
        { max: 500, price: 3.50 },
        { max: 1000, price: 3.15 },
        { max: 999999, price: 2.99 }
    ]
};

function calcolaPrezzoGrembiuli() {
    const tessuto = document.querySelector('input[name="grembiuliTessuto"]:checked').value;
    const inputQta = document.getElementById('grembiuliQta');
    const qta = parseInt(inputQta.value) || 0;
    
    // Elementi UI
    const elUnitario = document.getElementById('grembiuliPrezzoUnitario');
    const elTotNetto = document.getElementById('grembiuliTotaleNetto');
    const elTotIvato = document.getElementById('grembiuliTotaleIvato');

    if (qta < 6) { 
        elUnitario.textContent = "€ 0.00";
        elTotNetto.textContent = "€ 0.00";
        elTotIvato.textContent = "€ 0.00";
        return;
    }

    // 1. Trova Prezzo Base Materiale
    let prezzoBase = 0;
    const listino = LISTINO_GREMBIULI[tessuto];
    const fascia = listino.find(f => qta <= f.max);
    
    if (fascia) {
        prezzoBase = fascia.price;
    } else {
        prezzoBase = listino[listino.length - 1].price;
    }

    // 2. Calcola Extra (Fibbie e Tasche)
    let costoExtra = 0;
    document.querySelectorAll('.grembiuli-extra:checked').forEach(chk => {
        costoExtra += parseFloat(chk.dataset.costo);
    });

    // 3. Prezzo Unitario Totale
    let prezzoUnitarioTotale = prezzoBase + costoExtra;

    // 4. Totale Netto
    const totaleNetto = qta * prezzoUnitarioTotale;

    // =============================================================
    // GESTIONE SCONTO
    // =============================================================
    const unitarioScontato = (typeof applicaSconto === 'function') ? applicaSconto(prezzoUnitarioTotale) : prezzoUnitarioTotale;
    const totaleNettoScontato = (typeof applicaSconto === 'function') ? applicaSconto(totaleNetto) : totaleNetto;

    if (typeof scontoUtente !== 'undefined' && scontoUtente > 0) {
        elUnitario.innerHTML = `<span style="text-decoration: line-through; color: #999; font-size: 0.8em;">€ ${prezzoUnitarioTotale.toFixed(2)}</span> <span style="color: #28a745;">€ ${unitarioScontato.toFixed(2)}</span> <small style="color: #28a745;">(-${scontoUtente}%)</small>`;
        elTotNetto.textContent = `€ ${totaleNettoScontato.toFixed(2)}`;
    } else {
        elUnitario.textContent = `€ ${prezzoUnitarioTotale.toFixed(2)}`;
        elTotNetto.textContent = `€ ${totaleNetto.toFixed(2)}`;
    }

    // Calcolo IVA
    const baseImponibile = (typeof scontoUtente !== 'undefined' && scontoUtente > 0) ? totaleNettoScontato : totaleNetto;
    const totaleIvato = baseImponibile * 1.22;

    elTotIvato.textContent = `€ ${totaleIvato.toFixed(2)}`;
}

async function gestisciAggiuntaGrembiuli() {
    const tessuto = document.querySelector('input[name="grembiuliTessuto"]:checked').value;
    const qta = parseInt(document.getElementById('grembiuliQta').value) || 0;
    const note = document.getElementById('grembiuliNote').value;

    if (qta < 6) {
        alert("Il minimo ordinabile per i Grembiuli è di 6 pezzi.");
        return;
    }

    if (!utenteCorrenteId) {
        alert("Sessione scaduta. Login necessario.");
        return;
    }

    // Raccolta componenti extra selezionati
    let extraDesc = [];
    let costoExtraTotale = 0;
    document.querySelectorAll('.grembiuli-extra:checked').forEach(chk => {
        const label = chk.parentNode.textContent.trim().split('(+')[0]; // Prende il nome pulito
        extraDesc.push(label);
        costoExtraTotale += parseFloat(chk.dataset.costo);
    });

    // Gestione Upload
    const fileInput = document.getElementById('grembiuliFileUpload');
    const fileToUpload = fileInput.files[0];
    const uploadStatusBox = document.getElementById('grembiuliUploadStatusBox');
    const uploadMessage = document.getElementById('grembiuliUploadMessage');
    const uploadProgressBar = document.getElementById('grembiuliUploadProgressBar');
    let fileUrl = 'Nessun file caricato';

    if (fileToUpload && fileToUpload.size > 5 * 1024 * 1024) {
        alert("File troppo grande (Max 5MB)."); return;
    }

    if (fileToUpload) {
        const BUCKET_NAME = 'personalizzazioni';
        if (uploadStatusBox) {
            uploadStatusBox.style.display = 'block';
            uploadProgressBar.style.width = '0%';
        }
        try {
            const extension = fileToUpload.name.split('.').pop();
            const filePath = `${utenteCorrenteId}/GREMBIULE-${Date.now()}.${extension}`;
            const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filePath, fileToUpload, { cacheControl: '3600', upsert: false });
            if (uploadError) throw uploadError;
            if (uploadProgressBar) uploadProgressBar.style.width = '100%';
            if (uploadMessage) uploadMessage.textContent = '✅ File caricato.';
            fileUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;
            
            const expirationTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
            await supabase.from('temp_files').insert([{ storage_path: `${BUCKET_NAME}/${filePath}`, expires_at: expirationTime }]);
        } catch (e) {
            console.error(e); alert("Errore upload: " + e.message);
            if (uploadStatusBox) uploadStatusBox.style.display = 'none'; return;
        }
    }

    // Calcolo Prezzo Finale per Carrello
    const listino = LISTINO_GREMBIULI[tessuto];
    const fascia = listino.find(f => qta <= f.max);
    const prezzoBase = fascia ? fascia.price : listino[listino.length - 1].price;
    const prezzoPienoUnitario = prezzoBase + costoExtraTotale;

    let prezzoFinaleSalvataggio = prezzoPienoUnitario;
    if (typeof applicaSconto === 'function' && typeof scontoUtente !== 'undefined' && scontoUtente > 0) {
        prezzoFinaleSalvataggio = applicaSconto(prezzoPienoUnitario);
    }

    // Costruzione lista componenti
    const listaComponenti = [
        `Materiale: ${tessuto}`,
        `Stampa Sublimatica Full Print`
    ];
    if (extraDesc.length > 0) {
        listaComponenti.push(`Extra: ${extraDesc.join(', ')}`);
    }

    const nuovoArticolo = {
        id_unico: Date.now(),
        prodotto: `GREMBIULE PERSONALIZZATO`,
        quantita: qta,
        prezzo_unitario: parseFloat(prezzoFinaleSalvataggio.toFixed(2)),
        note: note,
        componenti: listaComponenti,
        personalizzazione_url: fileUrl,
        dettagli_taglie: {} 
    };

    aggiungiAlCarrello(nuovoArticolo);
    alert(`Aggiunti ${qta} Grembiuli (${tessuto}) al carrello!`);

    // Reset
    document.getElementById('grembiuliNote').value = '';
    document.querySelectorAll('.grembiuli-extra').forEach(c => c.checked = false);
    if (fileInput) fileInput.value = '';
    if (uploadStatusBox) setTimeout(() => { uploadStatusBox.style.display = 'none'; }, 2000);
    calcolaPrezzoGrembiuli(); // Reset prezzi UI
}

//--------- FINE GREMBIULI------------------






//------- INIZIO LANYARD-------------------------

// ===========================================
// FUNZIONI PER I LANYARD
// ===========================================

const LISTINO_LANYARD = {
    // Stampa Solo Lato A (1 Lato)
    "SINGLE": [
        { max: 100, price: 1.50 },
        { max: 200, price: 1.20 },
        { max: 300, price: 1.00 },
        { max: 500, price: 0.90 },
        { max: 1000, price: 0.85 },
        { max: 999999, price: 0.78 }
    ],
    // Stampa Lato A + Lato B (2 Lati)
    "DOUBLE": [
        { max: 100, price: 1.90 },
        { max: 200, price: 1.60 },
        { max: 300, price: 1.30 },
        { max: 500, price: 1.10 },
        { max: 1000, price: 1.00 },
        { max: 999999, price: 0.89 }
    ]
};

const COSTO_IMPIANTO_LANYARD = 20.00;

function calcolaPrezzoLanyard() {
    const isDouble = document.getElementById('lanyardDoubleSide').checked;
    const inputQta = document.getElementById('lanyardQta');
    let qta = parseInt(inputQta.value) || 0;

    // Elementi UI
    const elUnitarioBase = document.getElementById('lanyardPrezzoUnitarioBase');
    const elTotNetto = document.getElementById('lanyardTotaleNetto');
    const elTotIvato = document.getElementById('lanyardTotaleIvato');

    // Reset visuale se quantità non valida
    if (qta < 50) {
        elUnitarioBase.textContent = "€ 0.00";
        elTotNetto.textContent = "€ 0.00";
        elTotIvato.textContent = "€ 0.00";
        return;
    }

    // Selezione Listino (SINGLE o DOUBLE)
    const tipoStampa = isDouble ? "DOUBLE" : "SINGLE";
    const fasce = LISTINO_LANYARD[tipoStampa];

    // Trova il prezzo unitario in base alla fascia
    let prezzoUnitario = 0;
    const fascia = fasce.find(f => qta <= f.max);
    if (fascia) {
        prezzoUnitario = fascia.price;
    } else {
        prezzoUnitario = fasce[fasce.length - 1].price;
    }

    // Calcolo Totale: (Qta * Prezzo) + Impianto
    const totaleMerce = qta * prezzoUnitario;
    const totaleImponibile = totaleMerce + COSTO_IMPIANTO_LANYARD;
    const totaleIvato = totaleImponibile * 1.22;

    // Aggiornamento UI
    // elUnitarioBase.textContent = `€ ${prezzoUnitario.toFixed(2)}`;
    //elTotNetto.textContent = `€ ${totaleImponibile.toFixed(2)}`;
    //-------INIZIO GESTIONE SCONTO ------------------------------------------
    const unitarioScontato = applicaSconto(prezzoUnitario);
    if (scontoUtente > 0) {
        elUnitarioBase.innerHTML = `<span style="text-decoration: line-through; color: #999; font-size: 0.8em;">€ ${prezzoUnitario.toFixed(2)}</span> <span style="color: #28a745;">€ ${unitarioScontato.toFixed(2)}</span> <small style="color: #28a745;">(-${scontoUtente}%)</small>`;
        elTotNetto.textContent = `€ ${applicaSconto(totaleImponibile).toFixed(2)}`;
    } else {
        elUnitarioBase.textContent = `€ ${prezzoUnitario.toFixed(2)}`;
        elTotNetto.textContent = `€ ${totaleImponibile.toFixed(2)}`;
    }
    //-------FINE GESTIONE SCONTO---------------------------------------------
    elTotIvato.textContent = `€ ${totaleIvato.toFixed(2)}`;
}

async function gestisciAggiuntaLanyard() {
    const isDouble = document.getElementById('lanyardDoubleSide').checked;
    const qta = parseInt(document.getElementById('lanyardQta').value) || 0;
    const note = document.getElementById('lanyardNote').value;

    // 1. Validazione Quantità (Minimo 50 e Multipli di 50)
    if (qta < 50) {
        alert("Il minimo ordinabile per i Lanyard è di 50 pezzi.");
        return;
    }
    if (qta % 50 !== 0) {
        alert("La quantità deve essere un multiplo di 50 (es. 50, 100, 150...).");
        return;
    }

    if (!utenteCorrenteId) {
        alert("Sessione scaduta. Effettua il login.");
        return;
    }

    // Gestione Upload
    const fileInput = document.getElementById('lanyardFileUpload');
    const fileToUpload = fileInput.files[0];
    const uploadStatusBox = document.getElementById('lanyardUploadStatusBox');
    const uploadMessage = document.getElementById('lanyardUploadMessage');
    const uploadProgressBar = document.getElementById('lanyardUploadProgressBar');
    let fileUrl = 'Nessun file caricato';

    if (fileToUpload && fileToUpload.size > 5 * 1024 * 1024) {
        alert("File troppo grande (Max 5MB).");
        return;
    }

    if (fileToUpload) {
        const BUCKET_NAME = 'personalizzazioni';
        if (uploadStatusBox) {
            uploadStatusBox.style.display = 'block';
            uploadProgressBar.style.width = '0%';
        }

        try {
            const extension = fileToUpload.name.split('.').pop();
            const filePath = `${utenteCorrenteId}/LANYARD-${Date.now()}.${extension}`;
            
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, fileToUpload, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            if (uploadProgressBar) uploadProgressBar.style.width = '100%';
            if (uploadMessage) uploadMessage.textContent = '✅ File caricato.';

            fileUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;
            
            const expirationTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
            await supabase.from('temp_files').insert([{ storage_path: `${BUCKET_NAME}/${filePath}`, expires_at: expirationTime }]);

        } catch (e) {
            console.error(e);
            alert("Errore upload: " + e.message);
            if (uploadStatusBox) uploadStatusBox.style.display = 'none';
            return;
        }
    }

    // Recupero il totale imponibile calcolato per ricavare il prezzo unitario "effettivo" (spalmando l'impianto)
    // OPPURE: Salviamo il prezzo base e mettiamo l'impianto nei componenti.
    // Metodo scelto: Prezzo Unitario = Totale Imponibile / Qta (così il totale nel carrello torna)
    
    const totaleImponibileString = document.getElementById('lanyardTotaleNetto').textContent.replace('€', '').trim();
    const totaleImponibile = parseFloat(totaleImponibileString) || 0;
    const prezzoUnitarioMedio = totaleImponibile / qta;

    const tipoStampaDesc = isDouble ? "Stampa su 2 Lati (A+B)" : "Stampa su 1 Lato (A)";

    const nuovoArticolo = {
        id_unico: Date.now(),
        prodotto: `LANYARD 20mm - ${tipoStampaDesc}`,
        quantita: qta,
        prezzo_unitario: parseFloat(prezzoUnitarioMedio.toFixed(3)), // Usiamo 3 decimali per precisione media
        note: note,
        componenti: [
            `Tipologia: ${tipoStampaDesc}`,
            `Gancio metallico incluso`,
            `Include costo impianto grafico (€ 20.00)`
        ],
        personalizzazione_url: fileUrl,
        dettagli_taglie: {} 
    };

    aggiungiAlCarrello(nuovoArticolo);
    alert(`Aggiunti ${qta} Lanyard al carrello!`);

    // Reset
    document.getElementById('lanyardNote').value = '';
    if (fileInput) fileInput.value = '';
    if (uploadStatusBox) setTimeout(() => { uploadStatusBox.style.display = 'none'; }, 2000);
}



//------- FINE LANYARD-------------------------
// --- LISTENER STRISCIONI & BANDIERE ---
// 1. Input Dimensioni e Materiale
/*const inputBanner = document.querySelectorAll('#bannerLargh, #bannerAlt, input[name="bannerMateriale"], .banner-finish, #bannerFreqOcchielli, #bannerFreqDring, input[name="bannerLaccetto"]');
inputBanner.forEach(el => {
    el.addEventListener('input', calcolaPrezzoBanner);
    el.addEventListener('change', calcolaPrezzoBanner);
});

// 2. Bottone Aggiungi
const btnAddBanner = document.getElementById('aggiungiBannerBtn');
if (btnAddBanner) btnAddBanner.addEventListener('click', gestisciAggiuntaBanner);

// 3. Inizializza calcolo
calcolaPrezzoBanner();
*/




// --- LISTENER STRISCIONI & BANDIERE ---
    // Verifica che gli elementi esistano prima di attaccare i listener
    const inputBanner = document.querySelectorAll('#bannerLargh, #bannerAlt, input[name="bannerMateriale"], .banner-finish, #bannerFreqOcchielli, #bannerFreqDring, input[name="bannerLaccetto"]');
    
    if (document.getElementById('bannerLargh')) { // Controllo di sicurezza
        inputBanner.forEach(el => {
            el.addEventListener('input', calcolaPrezzoBanner);
            el.addEventListener('change', calcolaPrezzoBanner);
        });

        // 2. Bottone Aggiungi
        const btnAddBanner = document.getElementById('aggiungiBannerBtn');
        if (btnAddBanner) btnAddBanner.addEventListener('click', gestisciAggiuntaBanner);

        // 3. Inizializza calcolo ORA che siamo sicuri che l'HTML è carico
        calcolaPrezzoBanner();
    }







//------- FINE BANDIERE AL METRO -------------------------





//---------------


		// ===========================================
		// LOGICA BONUS & CORIANDOLI
		// ===========================================

async function caricaDatiVantaggi() {
    if (!utenteCorrenteId) return;

    // 1. Date del mese corrente
    const dataOggi = new Date();
    const primoDelMese = new Date(dataOggi.getFullYear(), dataOggi.getMonth(), 1).toISOString();
    const primoMeseProx = new Date(dataOggi.getFullYear(), dataOggi.getMonth() + 1, 1).toISOString();

    // 2. Query Supabase: Somma solo ordini COMPLETATI o SPEDITI
    // (Modifica 'Completato' se nel tuo DB usi un altro termine es. 'Consegnato')
    const { data: ordini, error } = await supabase
        .from('ordini')
        .select('totale')
        .eq('user_id', utenteCorrenteId)
        .gte('data_ordine', primoDelMese)
        .lt('data_ordine', primoMeseProx)
        .or('stato.eq.Completato,stato.eq.Spedito,stato.eq.Consegnato'); 

    if (error) {
        console.error("Errore Bonus:", error);
        return;
    }

    // 3. Somma Totale
    let totaleMese = 0;
    if (ordini) {
        ordini.forEach(o => totaleMese += parseFloat(o.totale) || 0);
    }

    aggiornaUIBonus(totaleMese);
}

function aggiornaUIBonus(totale) {
    // A. Aggiorna Testi
    document.getElementById('lvTotaleMese').textContent = `€ ${totale.toFixed(2)}`;
    
    let livelloAttuale = { soglia: 0, sconto: 0, desc: "Base" };
    let prossimoStep = PREMI_TIERS[0];
    let stepIndex = -1;

    for (let i = 0; i < PREMI_TIERS.length; i++) {
        if (totale >= PREMI_TIERS[i].soglia) {
            livelloAttuale = PREMI_TIERS[i];
            stepIndex = i;
            prossimoStep = PREMI_TIERS[i + 1] || null;
        }
    }

    document.getElementById('lvLivelloAttuale').textContent = livelloAttuale.desc;
    document.getElementById('lvScontoSbloccato').textContent = livelloAttuale.sconto + "%";

    // B. Calcolo Barra (6 segmenti uguali)
    const SEGMENT_WIDTH = 100 / 6; // 16.66%
    let percentualeVisiva = 0;

    if (stepIndex === -1) {
        // Sotto il primo step
        percentualeVisiva = (totale / PREMI_TIERS[0].soglia) * SEGMENT_WIDTH;
    } else if (prossimoStep) {
        // Tra due step
        let base = (stepIndex + 1) * SEGMENT_WIDTH;
        let range = prossimoStep.soglia - livelloAttuale.soglia;
        let avanzamento = totale - livelloAttuale.soglia;
        percentualeVisiva = base + ((avanzamento / range) * SEGMENT_WIDTH);
    } else {
        // Finito (oltre 10k)
        percentualeVisiva = 100;
    }
    
    if (percentualeVisiva > 100) percentualeVisiva = 100;

    // Aggiorna CSS Barra
    const barFill = document.getElementById('progressBarFill');
    const emoji = document.getElementById('userEmoji');
    if(barFill) barFill.style.width = `${percentualeVisiva}%`;
    if(emoji) emoji.style.left = `${percentualeVisiva}%`;

    // C. Messaggio e Lista
    const msgBox = document.getElementById('lvNextGoalMsg');
    if (prossimoStep) {
        msgBox.innerHTML = `Mancano <strong>€ ${(prossimoStep.soglia - totale).toFixed(2)}</strong> al prossimo premio!`;
    } else {
        msgBox.innerHTML = `🎉 <strong>Livello Massimo Raggiunto!</strong> Sei un Top Client!`;
    }

    const ul = document.getElementById('rewardsListUl');
    if (ul) {
        ul.innerHTML = '';
        PREMI_TIERS.forEach(tier => {
            const unlocked = totale >= tier.soglia;
            const styleClass = unlocked ? 'unlocked' : 'locked';
            const icon = unlocked ? '✅' : '🔒';
            ul.innerHTML += `<li class="${styleClass}">
                <span class="reward-desc">${tier.desc} (sopra €${tier.soglia})</span>
                <span class="reward-status">${icon}</span>
            </li>`;
        });
    }

    // D. Coriandoli (Se livello aumentato dall'ultima volta)
    const storedLevel = parseInt(localStorage.getItem(`bonus_level_${utenteCorrenteId}`)) || -1;
    if (stepIndex > storedLevel) {
        localStorage.setItem(`bonus_level_${utenteCorrenteId}`, stepIndex);
        lanciaCoriandoli();
    }
}

function lanciaCoriandoli() {
    // Richiede script canvas-confetti nell'HTML
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}



		//---------fine logica bonus------------

//---------------






// ===========================================
// INIZIALIZZAZIONE & EVENT LISTENERS
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
    const isLogged = await verificaCliente();
    if (isLogged) {
        // --- 1. PULIZIA INIZIALE DELLA VISTA ---
        // Nascondiamo tutte le sezioni prodotto all'avvio
        const sezioni = document.querySelectorAll('.sezione-prodotto');
        sezioni.forEach(s => s.style.display = 'none');


        
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
        document.getElementById('aggiungiBandiera').addEventListener('click', gestisciAggiuntaAlCarrello);
        document.getElementById('richiediPreventivo').addEventListener('click', gestisciCheckout);

// --- LISTENER FILTRI CLIENTE ---
        const btnCerca = document.getElementById('cliBtnCerca');
        if(btnCerca) btnCerca.addEventListener('click', applicaFiltriCliente);
        
        const btnReset = document.getElementById('cliBtnReset');
        if(btnReset) btnReset.addEventListener('click', () => {
            // Resetta i campi
            if(document.getElementById('cliRicerca')) document.getElementById('cliRicerca').value = '';
            if(document.getElementById('cliDataInizio')) document.getElementById('cliDataInizio').value = '';
            if(document.getElementById('cliDataFine')) document.getElementById('cliDataFine').value = '';
            if(document.getElementById('cliStato')) document.getElementById('cliStato').value = '';
            // Ricarica la lista completa
            applicaFiltriCliente();
        });
        
       
// === FIX NAVIGAZIONE: Controllo URL iniziale ===
        // Se l'URL finisce con #ordini, apre subito la vista ordini
        if (window.location.hash === '#ordini') {
            mostraVistaOrdini();
        } else {
            mostraVistaPreventivo();
        }
        
        // Listener MENU "I Miei Ordini"
        document.getElementById('mieiOrdiniBtn').addEventListener('click', (e) => {
            e.preventDefault();
            // Aggiunge #ordini all'URL
            history.pushState(null, null, '#ordini');
            mostraVistaOrdini();
        });

        // Listener MENU "Nuovo Preventivo"
        document.querySelector('.nav a[href="cliente.html"]').addEventListener('click', (e) => {
             // Rimuove #ordini dall'URL tornando a cliente.html pulito
             history.pushState(null, null, 'cliente.html');
             
             // Se non siamo già nel preventivo, mostriamolo
             if (document.getElementById('galleriaView').style.display === 'none') {
                 e.preventDefault();
                 mostraVistaPreventivo();
             }
        });

        


// *** LOGICA DI FORZATURA STATI (PER TIMING JS) ***
        // 1. Forza la forma attiva (per l'elemento che ha .active nell'HTML)
        const defaultForma = document.querySelector('.forme .forma.active');
        if (defaultForma) {
            defaultForma.classList.add('active'); 
        }
        
        // 2. Forza la misura checkata (per l'elemento che ha checked nell'HTML)
        const defaultMisura = document.querySelector('.misure input:checked'); 
        if (defaultMisura) {
             defaultMisura.checked = true;
        }
        // **********************************************

		
    // --- LISTENER MENU BONUS ---
    const btnMenuBonus = document.getElementById('btnMenuBonus');
    if (btnMenuBonus) {
        btnMenuBonus.addEventListener('click', (e) => {
            e.preventDefault();
            // Aggiunge #bonus all'URL per gestire il tasto indietro
            history.pushState(null, null, '#bonus');
            mostraVistaBonus();
        });
    }

    // Controllo se l'utente ricarica la pagina mentre è su #bonus
    if (window.location.hash === '#bonus') {
        mostraVistaBonus();
    }


        // *** NUOVO LISTENER PER IL KIT CALCIO ***


// --- LISTENER KIT CALCIO: Selezione del Prodotto Base ---

document.querySelectorAll('#kitSelectionContainer .kit-item').forEach(button => {
    button.addEventListener('click', (e) => {
        // Rimuove la classe 'active' da tutti i pulsanti kit-item
        document.querySelectorAll('#kitSelectionContainer .kit-item').forEach(btn => btn.classList.remove('active'));
        
        // Trova il pulsante genitore su cui è avvenuto il click e lo marca come attivo
        const targetButton = e.target.closest('.kit-item'); 
        if (targetButton) {
            targetButton.classList.add('active');
            
            // 1. RENDE IL CONTENITORE DELLE TAGLIE VISIBILE!
            document.getElementById('taglieInputContainer').style.display = 'block'; 
            
            // 2. Aggiorna il titolo del prodotto selezionato
            document.getElementById('kitProdottoSelezionato').textContent = targetButton.dataset.prodotto;
            
            // 3. Esegue il calcolo dinamico
            calcolaPrezzoDinamicoKit();
        }
    });
});

        //--------
// 2. LISTENER PER GLI INPUT DELLE QUANTITÀ DEL KIT (Aggiorna Prezzo Dinamico Kit)
        document.querySelectorAll('#taglieInputContainer input[type="number"]').forEach(input => {
            input.addEventListener('input', calcolaPrezzoDinamicoKit);
            input.addEventListener('change', calcolaPrezzoDinamicoKit); 
        });

        // 3. Listener per il pulsante Aggiungi Kit
        document.getElementById('aggiungiKitCalcioBtn').addEventListener('click', gestisciAggiuntaKitCalcio);
        
        // 4. Listener per il bottone INFO Kit Calcio (NUOVO)
        const infoKitBtn = document.getElementById('kitCalcioInfoIcon');
        if (infoKitBtn) {
            infoKitBtn.addEventListener('click', () => {
                const content = document.getElementById('kitCalcioInfoContent');
                // Se è nascosto o non ha stile definito, mostralo, altrimenti nascondilo
                content.style.display = (content.style.display === 'none' || content.style.display === '') ? 'block' : 'none';
            });
        }
        
        // 5. Listener per il bottone INFO Basket (NUOVO)
        const infoBasketBtn = document.getElementById('basketInfoIcon');
        if (infoBasketBtn) {
            infoBasketBtn.addEventListener('click', () => {
                const content = document.getElementById('basketInfoContent');
                content.style.display = (content.style.display === 'none' || content.style.display === '') ? 'block' : 'none';
            });
        }

        // 6. Listener per il bottone INFO Bandiere (NUOVO)
        const infoBandiereBtn = document.getElementById('bandiereInfoIcon');
        if (infoBandiereBtn) {
            infoBandiereBtn.addEventListener('click', () => {
                const content = document.getElementById('bandiereInfoContent');
                content.style.display = (content.style.display === 'none' || content.style.display === '') ? 'block' : 'none';
            });
        }



        // LISTENER PER IL PREZZO DINAMICO E AGGIORNAMENTO (Bandiere)
        // Funzione globale per gestire il click sui bottoni delle forme
window.selezionaForma = function(formaNome) {
    // 1. Rimuovi la classe active da tutti i bottoni forma
    document.querySelectorAll('.forme .forma').forEach(btn => {
        btn.classList.remove('active');
    });

    // 2. Trova il bottone cliccato. Cerchiamo il bottone che contiene il testo della forma
    // (o puoi basarti sulla posizione se preferisci)
    const bottoni = document.querySelectorAll('.forme .forma');
    bottoni.forEach(btn => {
        if (btn.textContent.trim().toLowerCase() === formaNome.toLowerCase()) {
            btn.classList.add('active');
        }
    });

    // 3. Ricalcola subito il prezzo
    calcolaPrezzoDinamico();
};
       /* commentato perche andava in errore la selezione
       // 1. Logica per la selezione delle forme
        document.querySelectorAll('.forme .forma').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.forme .forma').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                calcolaPrezzoDinamico(); 
            });
        });*/
        
        // 2. Listener per le Misure (Radio Button)
        document.querySelectorAll('.misure input[name="misura"]').forEach(input => {
            input.addEventListener('change', calcolaPrezzoDinamico);
        });
        
        // 3. Listener per i Componenti (Checkbox)
        document.querySelectorAll('.componenti input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', calcolaPrezzoDinamico);
        });
        
        // 4. Listener per il pulsante "Bandiera Completa"
        document.getElementById('selezionaCompleto').addEventListener('click', (e) => {
            e.preventDefault();

           // SELEZIONIAMO SOLO I COMPONENTI STANDARD (Escludendo la BASE_RIEMPIBILE)
            const checkboxesStandard = document.querySelectorAll('.componenti input[type="checkbox"]:not([disabled]):not([value="BASE_RIEMPIBILE"])');
            
            // Controlliamo se sono tutti checkati
            const allChecked = Array.from(checkboxesStandard).every(cb => cb.checked);

            // Invertiamo lo stato solo di quelli standard
            checkboxesStandard.forEach(cb => {
                cb.checked = !allChecked;
            });
            
            // Nota: La "Base riempibile" non viene toccata da questo click.



            
            /*
            const checkboxes = document.querySelectorAll('.componenti input[type="checkbox"]:not([disabled])');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);

            checkboxes.forEach(cb => {
                cb.checked = !allChecked;
            });*/

             
            aggiornaUIPreventivo();
            calcolaPrezzoDinamico();
        });

        // *** NUOVI LISTENER PER IL DTF ***
        // 1. Listener per gli input che cambiano il prezzo dinamico DTF
        document.getElementById('dtfMetri').addEventListener('input', calcolaPrezzoDinamicoDTF);
        document.getElementById('dtfCopie').addEventListener('input', calcolaPrezzoDinamicoDTF);

        // 2. Listener per il pulsante Aggiungi DTF
        document.getElementById('aggiungiDTFBtn').addEventListener('click', gestisciAggiuntaDTF);

        // 3. Logica per mostrare/nascondere la descrizione DTF (Info Box)
        document.getElementById('dtfInfoIcon').addEventListener('click', () => {
            const content = document.getElementById('dtfInfoContent');
            const larghezza = LISTINO_COMPLETO.DTF.LARGHEZZA_FISSA_CM;
            const prezzo = 15.00; // Valore di default o fascia 1
            
            if (content.style.display === 'block') {
                content.style.display = 'none';
            } else {
                content.innerHTML = `<p><strong>Prezzo:</strong> €${prezzo.toFixed(2)} al metro lineare (Fascia Minima).</p><p><strong>Larghezza Fissa:</strong> ${larghezza} cm.</p><p><strong>Requisiti File:</strong> Vettoriale (.PDF) o Raster (.PNG ad alta risoluzione, 300dpi).</p>`;
                content.style.display = 'block';
            }
        });



// --- EVENT LISTENER BASKET ---
// 1. Selezione Icone Basket
document.querySelectorAll('#basketSelectionContainer .kit-item').forEach(button => {
    button.addEventListener('click', (e) => {
        document.querySelectorAll('#basketSelectionContainer .kit-item').forEach(btn => btn.classList.remove('active'));
        const target = e.target.closest('.kit-item');
        target.classList.add('active');
        
        document.getElementById('basketTaglieContainer').style.display = 'block';
        document.getElementById('basketProdottoSelezionato').textContent = target.dataset.prodotto;
        calcolaPrezzoDinamicoBasket();
    });
});

// 2. Cambio Checkbox Double
document.getElementById('checkBasketDouble').addEventListener('change', calcolaPrezzoDinamicoBasket);

// 3. Input Quantità Basket
document.querySelectorAll('#basketTaglieContainer input[type="number"]').forEach(input => {
    input.addEventListener('input', calcolaPrezzoDinamicoBasket);
});

// 4. Bottone Aggiungi Basket
document.getElementById('aggiungiBasketBtn').addEventListener('click', gestisciAggiuntaBasket);







        

        aggiornaUIPreventivo();
        //NOTA: mostraVistaPreventivo() QUI E' STATA RIMOSSA PERCHE' GESTITA ALL'INIZIO
        calcolaPrezzoDinamico(); // Inizializza il prezzo dinamico all'avvio (Bandiere)
        calcolaPrezzoDinamicoKit(); // Inizializza il prezzo dinamico Kit all'avvio
        calcolaPrezzoDinamicoDTF(); // Inizializza il prezzo dinamico DTF all'avvio

        // --- INIZIO INTEGRAZIONE CONFIGURATORE********** ---
        // Attiva la logica per la prima riga del configuratore rapido
        const primaRiga = document.querySelector('.order-row');
        if (primaRiga) {
            setupRigaEvents(primaRiga);
        }
        // --- FINE INTEGRAZIONE CONFIGURATORE ---


        // --- LISTENER SCALDACOLLO -----------------------------------------------------------------------------------
        // 1. Cambio Tessuto (ricalcola e imposta vincoli)
        document.querySelectorAll('input[name="scaldacolloTessuto"]').forEach(radio => {
            radio.addEventListener('change', calcolaPrezzoScaldacollo);
        });

        // 2. Cambio Quantità
        document.getElementById('scaldacolloQta').addEventListener('input', calcolaPrezzoScaldacollo);

        // 3. Bottone Aggiungi
        document.getElementById('aggiungiScaldacolloBtn').addEventListener('click', gestisciAggiuntaScaldacollo);

        // 4. Bottone Info (Mostra/Nascondi)
        document.getElementById('scaldacolloInfoIcon').addEventListener('click', () => {
            const content = document.getElementById('scaldacolloInfoContent');
            content.style.display = (content.style.display === 'none' || content.style.display === '') ? 'block' : 'none';
        });
        
        // Inizializza il calcolo all'avvio
        calcolaPrezzoScaldacollo();


        // --- LISTENER SHOPPER --------------------------------------------------------------------------------------------------
        // 1. Cambio Tessuto
        document.querySelectorAll('input[name="shopperTessuto"]').forEach(radio => {
            radio.addEventListener('change', calcolaPrezzoShopper);
        });

        // 2. Cambio Quantità
        document.getElementById('shopperQta').addEventListener('input', calcolaPrezzoShopper);

        // 3. Bottone Aggiungi
        document.getElementById('aggiungiShopperBtn').addEventListener('click', gestisciAggiuntaShopper);

        // 4. Info Box
        document.getElementById('shopperInfoIcon').addEventListener('click', () => {
            const content = document.getElementById('shopperInfoContent');
            content.style.display = (content.style.display === 'none' || content.style.display === '') ? 'block' : 'none';
        });

        // Inizializza Calcolo
        calcolaPrezzoShopper();


		//------------------LISTENER SACCHE INIZIO ------------------
		// --- LISTENER SACCHE ---
        document.querySelectorAll('input[name="saccheTessuto"]').forEach(radio => {
            radio.addEventListener('change', calcolaPrezzoSacche);
        });

        document.getElementById('saccheQta').addEventListener('input', calcolaPrezzoSacche);
        document.getElementById('aggiungiSaccheBtn').addEventListener('click', gestisciAggiuntaSacche);

        document.getElementById('saccheInfoIcon').addEventListener('click', () => {
            const content = document.getElementById('saccheInfoContent');
            content.style.display = (content.style.display === 'none' || content.style.display === '') ? 'block' : 'none';
        });

        calcolaPrezzoSacche();

		//---------- FINE LISTENER SACCHE-----------


		//--------- inizio listener portachiavii--------------

		// --- LISTENER PORTACHIAVI ---
        document.getElementById('portachiaviQta').addEventListener('input', calcolaPrezzoPortachiavi);
        document.getElementById('aggiungiPortachiaviBtn').addEventListener('click', gestisciAggiuntaPortachiavi);
        
        document.getElementById('portachiaviInfoIcon').addEventListener('click', () => {
            const content = document.getElementById('portachiaviInfoContent');
            content.style.display = (content.style.display === 'none' || content.style.display === '') ? 'block' : 'none';
        });

        // Inizializza
        calcolaPrezzoPortachiavi();

		//---------- fine listener portachiavi----------------

		//----------INZIO GREMBIULI-----------------------
		// --- LISTENER GREMBIULI ---
        document.querySelectorAll('input[name="grembiuliTessuto"]').forEach(radio => {
            radio.addEventListener('change', calcolaPrezzoGrembiuli);
        });

        document.getElementById('grembiuliQta').addEventListener('input', calcolaPrezzoGrembiuli);
        
        // Listener per tutti i checkbox extra
        document.querySelectorAll('.grembiuli-extra').forEach(chk => {
            chk.addEventListener('change', calcolaPrezzoGrembiuli);
        });

        document.getElementById('aggiungiGrembiuliBtn').addEventListener('click', gestisciAggiuntaGrembiuli);

        document.getElementById('grembiuliInfoIcon').addEventListener('click', () => {
            const content = document.getElementById('grembiuliInfoContent');
            content.style.display = (content.style.display === 'none' || content.style.display === '') ? 'block' : 'none';
        });

        calcolaPrezzoGrembiuli();

		//----------FINE GREMBIULI-----------------------


        // --- LISTENER LANYARD --------------------------------------------------------------------------------------------------
        
        // 1. Checkbox Doppio Lato
        document.getElementById('lanyardDoubleSide').addEventListener('change', calcolaPrezzoLanyard);

        // 2. Input Quantità
        document.getElementById('lanyardQta').addEventListener('input', calcolaPrezzoLanyard);
        document.getElementById('lanyardQta').addEventListener('change', calcolaPrezzoLanyard); // Per i tastini up/down

        // 3. Bottone Aggiungi
        document.getElementById('aggiungiLanyardBtn').addEventListener('click', gestisciAggiuntaLanyard);

        // 4. Info Box
        document.getElementById('lanyardInfoIcon').addEventListener('click', () => {
            const content = document.getElementById('lanyardInfoContent');
            content.style.display = (content.style.display === 'none' || content.style.display === '') ? 'block' : 'none';
        });

        // Inizializza
        calcolaPrezzoLanyard();

        // --- LISTENER STRISCIONI & BANDIERE ---------------------------------------------------------------------------------
        // 1. Input Dimensioni, Materiale E QUANTITÀ
        const inputBanner = document.querySelectorAll('#bannerLargh, #bannerAlt, #bannerQta, input[name="bannerMateriale"], .banner-finish, #bannerFreqOcchielli, #bannerFreqDring, input[name="bannerLaccetto"]');

        // 2. Attacca l'evento a tutti i campi
        inputBanner.forEach(el => {
        // Se l'elemento esiste (sicurezza), aggiungi l'ascoltatore
        if (el) {
            el.addEventListener('input', calcolaPrezzoBanner);
            el.addEventListener('change', calcolaPrezzoBanner);
            }
        });

        // 3. Bottone Aggiungi
        const btnAddBanner = document.getElementById('aggiungiBannerBtn');
        if (btnAddBanner) btnAddBanner.addEventListener('click', gestisciAggiuntaBanner);

        // 4. Inizializza calcolo all'avvio
        calcolaPrezzoBanner();

        


       
    }
});


// ============================================================
// LOGICA CONFIGURATORE RAPIDO (Inizio)**** K6: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3]--  MODIFICATA k6 per sistemare tutti i prezzi -----------------------------------------------------------------
// ============================================================
const quantitaList = [5, 12, 20, 25, 30, 50, 75, 100];
const prezziLavorazioni = {
    K1: [3.5, 3.2, 3, 2.8, 2.6, 2.4, 2.2, 2], K4: [3.5, 3.2, 3, 2.8, 2.6, 2.4, 2.2, 2],
    K5: [3.5, 3.2, 3, 2.8, 2.6, 2.4, 2.2, 2], K6: [3.5, 3.2, 3, 2.8, 2.6, 2.4, 2.2, 2],
    K7: [3.5, 3.2, 3, 2.8, 2.6, 2.4, 2.2, 2], K8: [3.5, 3.2, 3, 2.8, 2.6, 2.4, 2.2, 2],
    K9: [3.5, 3.2, 3, 2.8, 2.6, 2.4, 2.2, 2], K10: [3.5, 3.2, 3, 2.8, 2.6, 2.4, 2.2, 2],
    K11: [10, 10, 10, 8.5, 8.3, 7.5, 8, 8], M6: [3.8, 3.5, 3.2, 2.9, 2.7, 2.5, 2.3, 2.1],
    K14: [3.5, 3.2, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05], K21: [3.5, 3.2, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05],
    K22: [3.5, 3.2, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05], K23: [3.5, 3.2, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05],
    K15: [3.5, 3.2, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05], K16: [3.5, 3.2, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05],
    K17: [3.5, 3.2, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05], K18: [3.5, 3.2, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05],
    K19: [3.7, 3.4, 2.1, 2.05, 1.85, 1.58, 1.34, 1.15], M19: [6, 4.8, 4.2, 3.2, 2.9, 2.5, 2.5, 2.5],
    M14: [4.8, 4.3, 3.5, 3.25, 2.75, 2.5, 2.2, 1.55], M15: [1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1]
};

let statoPersonalizzazioni = {};

function setupRigaEvents(riga) {
    if (!riga) return;
    const inputs = riga.querySelectorAll('.calc-codice-interno, .calc-qty');
    inputs.forEach(input => {
        input.addEventListener('input', () => ricalcolaPrezzoRiga(riga));
    });

    const btnAdd = riga.querySelector('.btn-confirm-row');
    btnAdd.addEventListener('click', () => confermaEInviaAlCarrello(riga));

    const btnPopup = riga.querySelector('.btn-open-popup');
    btnPopup.addEventListener('click', () => apriPopupPersonalizzazioni(riga));
}

function getMargine(qty) {
    if (qty <= 5) return 0.75;
    if (qty <= 12) return 0.62;
    if (qty <= 20) return 0.5;
    if (qty <= 25) return 0.4;
    if (qty <= 30) return 0.35;
    if (qty <= 50) return 0.33;
    if (qty <= 75) return 0.32;
    return 0.30;
}


// A) LA MAPPA DEI NOMI (Aggiungila qui sotto alle costanti)
const labelMap = {
    K6: "Ricamo lato cuore", K7: "Ricamo lato opposto", K1: "Ricamo Centro Petto",
    K8: "Ricamo manica SX", K9: "Ricamo manica DX", K4: "Ricamo Coscia SX",
    K5: "Ricamo Coscia DX", K10: "Ricamo sottocollo", K11: "Ricamo spalle",
    M6: "Nome ricamato", K14: "Stampa fronte A4", M14: "Stampa fronte A3",
    K15: "Stampa lato cuore", K21: "Stampa Centro Petto", K16: "Stampa manica SX",
    K17: "Stampa manica DX", K18: "Stampa sottocollo", K19: "Stampa spalle A4",
    M19: "Stampa spalle A3", M15: "Stampa nome", K22: "Stampa Coscia SX",
    K23: "Stampa Coscia DX"
};






/*// Funzione di utilità per pulire i numeri
function parsePrezzo(stringa) {
    if (!stringa) return 0;
    // Sostituisce la virgola con il punto e rimuove caratteri non numerici
    const valore = parseFloat(stringa.replace(',', '.'));
    return isNaN(valore) ? 0 : valore;
}-----
function parsePrezzo(valore) {
    if (typeof valore === 'number') return valore;
    if (!valore) return 0;
    let s = valore.toString().replace('€', '').replace(/\s/g, '').replace(',', '.');
    return parseFloat(s) || 0;
}*/
// ============================================================
// 1. FUNZIONE DI PULIZIA PREZZI (Fondamentale per evitare NaN)
// ============================================================
function parsePrezzo(valore) {
    // Se è già un numero, lo restituisce subito
    if (typeof valore === 'number') return valore;
    
    // Se è vuoto, null o undefined, restituisce 0
    if (!valore) return 0;

    // Se è una stringa (es: "€ 15,50"), la pulisce
    let s = String(valore)
        .replace('€', '')   // Toglie simbolo Euro
        .replace(/\s/g, '') // Toglie tutti gli spazi
        .replace(',', '.'); // Cambia virgola in punto

    let n = parseFloat(s);
    
    // Se il risultato non è un numero, restituisce 0
    return isNaN(n) ? 0 : n;
}

// 2. Versione corretta e "corazzata" della funzione
function aggiungiAlCarrello(param1, param2, param3) {
    console.log("Dati ricevuti in aggiungiAlCarrello:", param1);
    
    // Inizializziamo il carrello se per qualche motivo fosse sparito
    if (typeof carrello === 'undefined') {
        carrello = JSON.parse(localStorage.getItem('carrello')) || [];
    }

    let item;

    // CASO A: Riceve un OGGETTO (Kit Calcio)
    if (typeof param1 === 'object' && param1 !== null) {
        item = {
            prodotto: param1.prodotto || param1.nome || "Kit Personalizzato",
            quantita: parseInt(param1.quantita || param1.qta) || 1,
            prezzo_unitario: parsePrezzo(param1.prezzo_unitario || param1.prezzo || 0),
            note: param1.note || "",
            componenti: param1.componenti || [],
            dettagli_taglie: param1.dettagli_taglie || {},
            personalizzazione_url: param1.personalizzazione_url || ""
        };
    } 
    // CASO B: Riceve PARAMETRI (Configuratore Rapido)
    else {
        item = {
            prodotto: param1 || "Articolo",
            quantita: parseInt(param2) || 1,
            prezzo_unitario: parsePrezzo(param3),
            note: "Ordine Rapido",
            componenti: [],
            dettagli_taglie: {},
            personalizzazione_url: ""
        };
    }

    // --- AGGIUNTA SCONTO AUTOMATICO ---
    // Applichiamo lo sconto al prezzo finale prima di salvarlo nel carrello
    item.prezzo_unitario = applicaSconto(item.prezzo_unitario);

    // Controllo finale anti-blocco
    if (isNaN(item.prezzo_unitario)) item.prezzo_unitario = 0;
    
    // AGGIUNTA EFFETTIVA
    carrello.push(item);
    
    // SALVATAGGIO
    localStorage.setItem('carrello', JSON.stringify(carrello));
    
    console.log("Carrello dopo aggiunta:", carrello);

    // AGGIORNAMENTO INTERFACCIA
    if (typeof aggiornaUIPreventivo === 'function') {
        aggiornaUIPreventivo();
    } else {
        console.error("La funzione aggiornaUIPreventivo non esiste!");
    }
}






// B) RICALCOLO (Legge prezziLavorazioni e quantitaList)
function ricalcolaPrezzoRiga(riga) {
    // 1. Recupero il prezzo d'acquisto usando la funzione parsePrezzo
    const prezzoAcquisto = parsePrezzo(riga.querySelector('.calc-codice-interno').value);
    
    // 2. Recupero la quantità (default a 1 se vuoto o errato)
    const qty = parseInt(riga.querySelector('.calc-qty').value) || 1;
    
    const rigaId = riga.dataset.id || 'default';
    const persAttive = statoPersonalizzazioni[rigaId] || [];

    // 3. Calcolo il costo delle personalizzazioni in base alla fascia di quantità
    let costoPers = 0;
    
    // Troviamo l'indice corretto nella tabella sconti (5, 12, 20...)
    let i = quantitaList.findIndex(v => qty <= v);
    if (i === -1) i = quantitaList.length - 1; // Se la quantità supera 100, prende l'ultima fascia

    persAttive.forEach(key => {
        if (prezziLavorazioni[key]) {
            // Aggiunge il costo della lavorazione specifica per quella fascia
            costoPers += prezziLavorazioni[key][i]; 
        }
    });

    // 4. Calcolo finale: (Prezzo Acquisto + Margine variabile) + Costi Personalizzazione
    let prezzoBase = (prezzoAcquisto * (1 + getMargine(qty))) + costoPers;
    
    // 5. Aggiorno lo span visibile (prezzo suggerito) con due decimali
    const spanSugg = riga.querySelector('.price-suggested');
    /*GESTINO PREZZO SENZA SCONTO
    if (spanSugg) {
        spanSugg.innerText = prezzoBase.toFixed(2);
    }*/
    if (spanSugg) {
        const baseScontata = applicaSconto(prezzoBase);
        if (scontoUtente > 0) {
            spanSugg.innerHTML = `<del style="color:#999; font-size:0.8em;">${prezzoBase.toFixed(2)}</del> <span style="color:#28a745;">${baseScontata.toFixed(2)}</span>`;
        } else {
            spanSugg.innerText = prezzoBase.toFixed(2);
        }
    }
}



// C) INVIO AL CARRELLO (Aggiornata per nomi reali e protezione NaN)
function confermaEInviaAlCarrello(riga) {
    // Recupero i campi
    const inputDesc = riga.querySelector('.calc-descrizione');
    const inputQty = riga.querySelector('.calc-qty');
    const spanSugg = riga.querySelector('.price-suggested');
    const inputManu = riga.querySelector('.calc-prezzo-finale');

    // Pulizia Dati
    const descBase = inputDesc ? inputDesc.value.trim() : "Articolo";
    const qty = inputQty ? (parseInt(inputQty.value) || 1) : 1;
    
    // Usiamo parsePrezzo per sicurezza su suggerito e manuale
    const prezzoSugg = parsePrezzo(spanSugg.innerText);
    const prezzoManu = parsePrezzo(inputManu.value);

    // Se l'utente non ha scritto nulla nel prezzo finale, usa quello suggerito
    const prezzoFinale = prezzoManu > 0 ? prezzoManu : prezzoSugg;

    // Gestione Nomi Personalizzazioni (labelMap)
    const rigaId = riga.dataset.id || 'default';
    const elencoNomi = (statoPersonalizzazioni[rigaId] || [])
        .map(k => labelMap[k] || k)
        .join(', ');
    
    const descFinale = elencoNomi ? `${descBase} [${elencoNomi}]` : descBase;

    // Controllo sicurezza
    if (prezzoFinale <= 0) { 
        alert("Inserisci un prezzo valido (es. 10.50)"); 
        return; 
    }

    // INVIO AL CARRELLO
    // Nota: Passiamo i 3 parametri separati se la tua funzione aggiungiAlCarrello li accetta così
    aggiungiAlCarrello(descFinale, qty, prezzoFinale);
    
    // RESET RIGA
    if(inputDesc) inputDesc.value = "";
    if(inputManu) inputManu.value = "";
    riga.querySelector('.calc-codice-interno').value = "";
    statoPersonalizzazioni[rigaId] = [];
    ricalcolaTutteLeRighe();
}


// D) POPUP (Usa labelMap per mostrarti i nomi invece dei codici)
window.apriPopupPersonalizzazioni = function(riga) {
    const rigaId = riga.dataset.id || 'default';
    const overlay = document.createElement('div');
    overlay.className = "modal-backdrop";
    overlay.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:10000; display:flex; align-items:center; justify-content:center;";
    
    let html = `<div class="modal-content" style="background:white; padding:20px; border-radius:10px; max-width:550px; max-height:80vh; overflow-y:auto;">
                <h3 style="color:#009dff;margin-top:0">Personalizzazioni</h3>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">`;

    for (let cod in prezziLavorazioni) {
        const checked = (statoPersonalizzazioni[rigaId] || []).includes(cod) ? 'checked' : '';
        html += `<label style="display:flex; align-items:center; gap:8px; border:1px solid #eee; padding:8px; border-radius:5px; cursor:pointer; background:#f9f9f9;">
                    <input type="checkbox" value="${cod}" ${checked} onchange="togglePers('${rigaId}', '${cod}')"> 
                    <span style="font-size:12px;"><strong>${cod}</strong><br>${labelMap[cod] || cod}</span>
                 </label>`;
    }

    html += `</div><button onclick="this.closest('.modal-backdrop').remove(); ricalcolaTutteLeRighe();" class="btn-primary" style="margin-top:20px; width:100%; padding:10px;">APPLICA</button></div>`;
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
}

window.togglePers = function(rigaId, key) {
    if (!statoPersonalizzazioni[rigaId]) statoPersonalizzazioni[rigaId] = [];
    const index = statoPersonalizzazioni[rigaId].indexOf(key);
    (index > -1) ? statoPersonalizzazioni[rigaId].splice(index, 1) : statoPersonalizzazioni[rigaId].push(key);
};

window.ricalcolaTutteLeRighe = function() {
    document.querySelectorAll('.order-row').forEach(riga => {
        ricalcolaPrezzoRiga(riga);
        const rigaId = riga.dataset.id || 'default';
        riga.querySelector('.active-tags').innerHTML = (statoPersonalizzazioni[rigaId] || []).map(t => `<small style="background:#eee; padding:2px; margin:2px; display:inline-block;">${t}</small>`).join('');
    });
};

function aggiungiNuovaRigaConfiguratore() {
    const container = document.getElementById('order-rows-container');
    const nuova = container.querySelector('.order-row').cloneNode(true);
    nuova.dataset.id = Date.now();
    nuova.querySelectorAll('input, textarea').forEach(i => i.value = "");
    nuova.querySelector('.price-suggested').innerText = "0.00";
    nuova.querySelector('.active-tags').innerHTML = "";
    container.appendChild(nuova);
    setupRigaEvents(nuova);
}
// ============================================================
// LOGICA CONFIGURATORE RAPIDO (Fine gli * segnano le parti collegate)**********
// ============================================================


// ===========================================
// FUNZIONI FILTRO MENU & RESET
// ===========================================

function filterMainMenu() {
    var input = document.getElementById('menuSearchInput');
    var clearBtn = document.getElementById('menuClearBtn'); // <--- RECUPERIAMO LA X
    var filter = input.value.toLowerCase().trim();
    var container = document.getElementById('mainMenuGrid');
    var items = container.getElementsByClassName('banner-item');
    var noResultsMsg = document.getElementById('menuNoResults');
    
    // GESTIONE VISIBILITÀ DELLA "X"
    if (filter.length > 0) {
        clearBtn.style.display = "block"; // Mostra se c'è testo
    } else {
        clearBtn.style.display = "none";  // Nascondi se vuoto
    }

    var visibleCount = 0;

    // Se l'input è vuoto, mostra tutto e esci
    if (filter === "") {
        for (var i = 0; i < items.length; i++) {
            items[i].style.display = "";
        }
        noResultsMsg.style.display = "none";
        return;
    }

    var searchTerms = filter.split(" ");

    for (var i = 0; i < items.length; i++) {
        var keywords = items[i].getAttribute('data-keywords');
        var match = false;

        if (keywords) {
            keywords = keywords.toLowerCase();
            for (var j = 0; j < searchTerms.length; j++) {
                var term = searchTerms[j];
                if (term !== "" && keywords.indexOf(term) > -1) {
                    match = true;
                    break; 
                }
            }
        }

        if (match) {
            items[i].style.display = ""; 
            visibleCount++;
        } else {
            items[i].style.display = "none"; 
        }
    }

    // Gestione messaggio "Nessun risultato"
    if (visibleCount === 0) {
        noResultsMsg.style.display = "block";
    } else {
        noResultsMsg.style.display = "none";
    }
}

// NUOVA FUNZIONE PER CANCELLARE TUTTO
function clearSearch() {
    var input = document.getElementById('menuSearchInput');
    input.value = ""; // Pulisce il testo
    filterMainMenu(); // Richiama il filtro (che ora vedrà testo vuoto e resetterà tutto)
    input.focus();    // Rimette il cursore nella barra pronto per scrivere di nuovo
}
//------fine js per la ricerca sul menu cliente.html--------------------------

/*
// rendere l file visivamente piu pulito 
function mostraSezione(idSezione) {
    // 1. Nascondi tutte le sezioni che hanno la classe 'sezione-prodotto'
    const sezioni = document.querySelectorAll('.sezione-prodotto');
    sezioni.forEach(s => {
        s.style.display = 'none';
    });

    // 2. Mostra solo la sezione cliccata
    const sezioneSelezionata = document.getElementById(idSezione);
    if (sezioneSelezionata) {
        sezioneSelezionata.style.display = 'block';
        
        // 3. Opzionale: scroll fluido verso la sezione per dare feedback all'utente
        sezioneSelezionata.scrollIntoView({ behavior: 'smooth' });
    }
}


*/


/**
 * Gestisce la visualizzazione dinamica delle sezioni
 * Nasconde tutto e mostra solo quella selezionata.
 */
function mostraSezione(idSezione) {
    // 1. Seleziona tutte le sezioni che devono essere alternate
    const sezioni = document.querySelectorAll('.sezione-prodotto');
    
    // 2. Nascondile tutte
    sezioni.forEach(s => {
        s.style.display = 'none';
    });

    // 3. Mostra la sezione specifica
    const sezioneSelezionata = document.getElementById(idSezione);
    if (sezioneSelezionata) {
        sezioneSelezionata.style.display = 'block';
        
        // 4. Feedback visivo: scorre leggermente verso il contenuto
        sezioneSelezionata.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
/*
// Inizializzazione al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
    // Assicuriamoci che all'apertura nessuna sezione sia visibile
    const sezioni = document.querySelectorAll('.sezione-prodotto');
    sezioni.forEach(s => s.style.display = 'none');
});
*/




// ===========================================
// FUNZIONI PER IL BASKET (CON GESTIONE DOUBLE)
// ===========================================
function calcolaPrezzoDinamicoBasket() {
    const prezzoDinamicoSpan = document.getElementById('basketPrezzoDinamico');
    const qtaTotaleSpan = document.getElementById('basketQtaTotale');
    const prezzoBaseSpan = document.getElementById('basketPrezzoBase');
    const labelDouble = document.getElementById('labelDoubleAttivo');
    const basketProdSelezionato = document.querySelector('#basketSelectionContainer .kit-item.active')?.dataset.prodotto;
    const isDouble = document.getElementById('checkBasketDouble').checked;

    if (!basketProdSelezionato || !prezzoDinamicoSpan) return;

    // 1. Calcolo Quantità Totale
    let qtaTotale = 0;
    document.querySelectorAll('#basketTaglieContainer .taglie-table input[type="number"]').forEach(input => {
        qtaTotale += parseInt(input.value) || 0;
    });

    if (qtaTotale === 0) {
        prezzoDinamicoSpan.textContent = '€ 0.00';
        qtaTotaleSpan.textContent = '0';
        prezzoBaseSpan.textContent = '€ 0.00';
        if(labelDouble) labelDouble.style.display = 'none';
        return;
    }

    // 2. Trova il Prezzo Base (Versione Normale)
    const listinoBasket = LISTINO_COMPLETO.KIT_BASKET;
    // Usa la nuova costante fasce specifica per Basket (definita al passo 1)
    const fascia = FASCE_QUANTITA_BASKET.find(f => qtaTotale <= f.max);
    
    let prezzoUnitarioFinale = 0;

    if (fascia) {
        const prezzi = listinoBasket.PREZZI_FASCIA[fascia.key];
        if (basketProdSelezionato === 'COMPLETINO') prezzoUnitarioFinale = prezzi.COMPLETINO;
        else if (basketProdSelezionato === 'CANOTTA_SOLO') prezzoUnitarioFinale = prezzi.CANOTTA_SOLA;
        else if (basketProdSelezionato === 'PANTALONCINO_SOLO') prezzoUnitarioFinale = prezzi.PANTALONCINO_SOLO;
    }

    // 3. APPLICAZIONE MAGGIORAZIONE DOUBLE (Logica specifica per prodotto)
    if (isDouble) {
        let percentualeExtra = 0;
        
        // Seleziona la percentuale corretta in base al prodotto (Step 2)
        if (basketProdSelezionato === 'COMPLETINO') percentualeExtra = listinoBasket.EXTRA_DOUBLE.COMPLETINO;
        else if (basketProdSelezionato === 'CANOTTA_SOLO') percentualeExtra = listinoBasket.EXTRA_DOUBLE.CANOTTA_SOLA;
        else if (basketProdSelezionato === 'PANTALONCINO_SOLO') percentualeExtra = listinoBasket.EXTRA_DOUBLE.PANTALONCINO_SOLO;

        // Calcola l'aumento
        prezzoUnitarioFinale += prezzoUnitarioFinale * (percentualeExtra / 100);
        
        // Mostra l'etichetta rossa con la percentuale applicata
        if(labelDouble) {
            labelDouble.style.display = 'inline';
            //labelDouble.textContent = `(+${percentualeExtra}% Double)`;----------------togli il commento qui per vedere la percetuale
        }
    } else {
        if(labelDouble) labelDouble.style.display = 'none';
    }

    // 4. Aggiorna UI e Input Nascosti--------------------------PREZZO SENZA SCONTO----------------------
    //prezzoBaseSpan.textContent = `€ ${prezzoUnitarioFinale.toFixed(2)}`;
    
    const costoTotale = qtaTotale * prezzoUnitarioFinale;
    
    // 4. Aggiorna UI e Input Nascosti--------------------------PREZZO SENZA SCONTO----------------------
    //prezzoDinamicoSpan.textContent = `€ ${costoTotale.toFixed(2)}`;

    
    //-------------INIZIO GESTIONE SCONTO--------------------------------
    const basketScontato = applicaSconto(prezzoUnitarioFinale);
    if (scontoUtente > 0) {
        prezzoBaseSpan.innerHTML = `<span style="text-decoration: line-through; color: #999; font-size: 0.8em;">€ ${prezzoUnitarioFinale.toFixed(2)}</span> <span style="color: #28a745;">€ ${basketScontato.toFixed(2)}</span> <small style="color: #28a745;">(-${scontoUtente}%)</small>`;
        prezzoDinamicoSpan.textContent = `€ ${applicaSconto(costoTotale).toFixed(2)}`;
    } else {
        prezzoBaseSpan.textContent = `€ ${prezzoUnitarioFinale.toFixed(2)}`;
        prezzoDinamicoSpan.textContent = `€ ${costoTotale.toFixed(2)}`;
    }
    //-------------FINE GESTIONE SCONTO-----------------------------------
    qtaTotaleSpan.textContent = qtaTotale;
    
    // Salva i valori nei campi nascosti per inviarli al carrello
    const hiddenUnitario = document.getElementById('basketPrezzoUnitarioBase');
    const hiddenTotale = document.getElementById('basketCostoTotaleFinale');
    
    if (hiddenUnitario) hiddenUnitario.value = prezzoUnitarioFinale.toFixed(2);
    if (hiddenTotale) hiddenTotale.value = costoTotale.toFixed(2);
}

async function gestisciAggiuntaBasket() {
    const qtaTotale = parseInt(document.getElementById('basketQtaTotale').textContent) || 0;
    const prezzoBase = parseFloat(document.getElementById('basketPrezzoUnitarioBase').value) || 0;
    const prodSel = document.querySelector('#basketSelectionContainer .kit-item.active')?.dataset.prodotto;
    const isDouble = document.getElementById('checkBasketDouble').checked;
    const note = document.getElementById('basketNote').value;
    
    if (!prodSel || qtaTotale === 0) {
        alert("Seleziona un prodotto e inserisci le quantità.");
        return;
    }

    // Gestione Taglie
    let dettagliTaglie = {};
    document.querySelectorAll('#basketTaglieContainer .taglie-table').forEach(table => {
        const genere = table.dataset.genere;
        dettagliTaglie[genere] = {};
        table.querySelectorAll('input[type="number"]').forEach(inp => {
            const val = parseInt(inp.value) || 0;
            if (val > 0) dettagliTaglie[genere][inp.dataset.taglia] = val;
        });
        if (Object.keys(dettagliTaglie[genere]).length === 0) delete dettagliTaglie[genere];
    });

    // Costruzione Nome Prodotto
    let nomeProdotto = `BASKET - ${prodSel}`;
    if (isDouble) nomeProdotto += " (VERSIONE DOUBLE)";

    // Gestione Upload (Semplificata)
    const fileInput = document.getElementById('basketFileUpload');
    let fileUrl = 'Nessun file caricato';
    
    // --- INIZIO CODICE AGGIUNTO ---
    const fileToUpload = fileInput ? fileInput.files[0] : null; 
    const uploadStatusBox = document.getElementById('basketUploadStatusBox');
    const uploadMessage = document.getElementById('basketUploadMessage');
    const uploadProgressBar = document.getElementById('basketUploadProgressBar');

    // 1. Controllo Dimensione
    const MAX_FILE_SIZE_MB = 5;
    if (fileToUpload && fileToUpload.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        alert(`Il file è troppo grande. Max ${MAX_FILE_SIZE_MB} MB.`);
        fileInput.value = ''; 
        return;
    }

    // 2. Logica Upload su Supabase
    if (fileToUpload) {
        const BUCKET_NAME = 'personalizzazioni'; 
        
        if (uploadStatusBox) {
            uploadStatusBox.style.display = 'block';
            uploadMessage.textContent = 'Caricamento grafica in corso...';
            uploadProgressBar.style.width = '0%';
            uploadProgressBar.style.backgroundColor = '#007bff';
        }

        try {
            const extension = fileToUpload.name.split('.').pop();
            // Nota: Uso prefisso BASKET nel nome file
            const filePath = `${utenteCorrenteId}/BASKET-${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, fileToUpload, { cacheControl: '3600', upsert: false });

            if (uploadError) throw uploadError;

            if (uploadProgressBar) uploadProgressBar.style.width = '100%';
            if (uploadMessage) uploadMessage.textContent = '✅ File caricato.';

            fileUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;

            // Tracciamento scadenza file (72h)
            const expirationTime = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
            const { error: dbError } = await supabase
                .from('temp_files')
                .insert([{ storage_path: `${BUCKET_NAME}/${filePath}`, expires_at: expirationTime }]);

            if (dbError) console.error("Errore tracciamento scadenza file", dbError);

        } catch (e) {
            console.error('Errore Upload Basket:', e.message);
            alert(`Errore durante il caricamento del file: ${e.message}`);
            if (uploadStatusBox) uploadStatusBox.style.display = 'none';
            return; 
        }
    }
    // --- FINE CODICE AGGIUNTO ---
    
    const nuovoArticolo = {
        id_unico: Date.now(),
        prodotto: nomeProdotto,
        quantita: qtaTotale,
        prezzo_unitario: prezzoBase,
        note: note,
        dettagli_taglie: dettagliTaglie,
        componenti: isDouble ? ["Opzione Reversibile (Double) Inclusa"] : [],
        personalizzazione_url: fileUrl 
    };

    aggiungiAlCarrello(nuovoArticolo);
    alert(`Aggiunto ${nomeProdotto} al carrello!`);
    
    // Reset
    document.getElementById('basketNote').value = '';
    document.querySelectorAll('#basketTaglieContainer input').forEach(i => i.value = 0);
    document.getElementById('checkBasketDouble').checked = false;
    calcolaPrezzoDinamicoBasket();
}







