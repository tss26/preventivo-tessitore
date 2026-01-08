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
let carrello = JSON.parse(localStorage.getItem('carrello')) || [];

// Fasce di quantità per il listino Kit Calcio (Totale Pezzi)
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
    { max: 500, key: "351_500" },
    { max: 999999, key: "351_500" }
];


// ===========================================
// LISTINO PREZZI BANDIERE (Dati Dinamici dalla foto)
// ===========================================
const LISTINO_COMPLETO = {
    // I prezzi sono estratti dalle colonne della tua tabella.
    "Goccia": {
        "S": { FLAG: 26.00, ASTA: 21.00, BASE: 15.00, ZAVORRA: 6.00 },
        "M": { FLAG: 30.00, ASTA: 23.00, BASE: 15.00, ZAVORRA: 6.00 },
        "L": { FLAG: 37.00, ASTA: 27.00, BASE: 15.00, ZAVORRA: 6.00 },
        "XL": { FLAG: 46.00, ASTA: 33.00, BASE: 15.00, ZAVORRA: 6.00 },
    },
    "Vela": { 
        "S": { FLAG: 26.00, ASTA: 21.00, BASE: 15.00, ZAVORRA: 6.00 },
        "M": { FLAG: 30.00, ASTA: 23.00, BASE: 15.00, ZAVORRA: 6.00 },
        "L": { FLAG: 37.00, ASTA: 27.00, BASE: 15.00, ZAVORRA: 6.00 },
        "XL": { FLAG: 46.00, ASTA: 33.00, BASE: 15.00, ZAVORRA: 6.00 },
    },
    "Cresta": { 
        "S": { FLAG: 26.00, ASTA: 21.00, BASE: 15.00, ZAVORRA: 6.00 },
        "M": { FLAG: 30.00, ASTA: 23.00, BASE: 15.00, ZAVORRA: 6.00 },
        "L": { FLAG: 37.00, ASTA: 27.00, BASE: 15.00, ZAVORRA: 6.00 },
        "XL": { FLAG: 46.00, ASTA: 33.00, BASE: 15.00, ZAVORRA: 6.00 },
    },
    "Rettangolare": {
        "S": { FLAG: 20.00, ASTA: 25.00, BASE: 15.00, ZAVORRA: 6.00 },
        "M": { FLAG: 24.00, ASTA: 31.00, BASE: 15.00, ZAVORRA: 6.00 },
        "L": { FLAG: 28.00, ASTA: 45.00, BASE: 15.00, ZAVORRA: 6.00 },
        "XL": { FLAG: 34.00, ASTA: 56.00, BASE: 15.00, ZAVORRA: 6.00 },
    },


    // --- NUOVO LISTINO KIT CALCIO (Basato su Listini Completini Tessitore.pdf) ---
    "KIT_CALCIO": {
        // Prezzi unitari netti (€) basati sulla fascia di quantità TOTALE
        "PREZZI_FASCIA": {
            "1_5": { COMPLETINO: 25.00, MAGLIA_SOLA: 14.50, PANTALONCINO_SOLO: 13.00 },
            "6_20": { COMPLETINO: 22.50, MAGLIA_SOLA: 13.50, PANTALONCINO_SOLO: 11.50 },
            "21_50": { COMPLETINO: 19.50, MAGLIA_SOLA: 11.50, PANTALONCINO_SOLO: 9.50 },
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
    }
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
        .select('ragione_sociale, permessi')
        .eq('id', user.id)
        .single();
    
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

    // AZIONE CRITICA 2: Reindirizza l'admin alla dashboard Admin
    if (profilo.permessi === 'admin') {
           window.location.href = 'admin.html';
           return false;
    }

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
    prezzoBaseSpan.textContent = `€ ${prezzoUnitarioBase.toFixed(2)}`;

    // 4. Calcola il costo totale e applica l'impianto grafico
    const costoTotaleBase = qtaTotale * prezzoUnitarioBase;
    
    // Il costo impianto grafico di 20€ viene applicato una sola volta 
    const costoImpianto = listinoKit.COSTO_GRAFICO || 0; 
    
    //---const costoTotaleFinale = costoTotaleBase + costoImpianto;
    const costoTotaleFinale = costoTotaleBase ;
    
    // 5. Calcola il prezzo MEDIO unitario finale (per visualizzazione dinamica)
    //---const prezzoMedioUnitario = costoTotaleFinale / qtaTotale;
    const prezzoMedioUnitario = costoTotaleFinale ;

    // 6. SALVA IL COSTO TOTALE IN UN CAMPO NASCOSTO ***
    const costoTotaleInput = document.getElementById('kitCostoTotaleFinale');
    if (costoTotaleInput) {
        costoTotaleInput.value = costoTotaleFinale.toFixed(2);
    }

    prezzoDinamicoSpan.textContent = `€ ${prezzoMedioUnitario.toFixed(2)}`;
    qtaTotaleSpan.textContent = qtaTotale;
}

//-----------
//Questa funzione deve usare il prezzo medio e deve includere il costo grafico nei componenti per tracciarlo nell'ordine.
async function gestisciAggiuntaKitCalcio() {
    const taglieTables = document.querySelectorAll('#taglieInputContainer .taglie-table');
    const kitProdSelezionato = document.querySelector('.kit-item.active')?.dataset.prodotto;
    
    // Recupero dati numerici e testo
    const qtaTotale = parseInt(document.getElementById('kitQtaTotale').textContent) || 0;
    const prezzoDinamico = parseFloat(document.getElementById('kitPrezzoDinamico').textContent.replace('€', '').trim()) || 0;
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
    // Traccia il costo impianto grafico come componente fisso
    const componenti = [`Sublimazione`, `Costo Impianto Grafico (€${LISTINO_COMPLETO.KIT_CALCIO.COSTO_GRAFICO.toFixed(2)})`];

    const nuovoArticolo = { 
        id_unico: Date.now(), 
        prodotto: `KIT CALCIO - ${kitProdSelezionato}`, 
        quantita: qtaTotale, 
        prezzo_unitario: parseFloat(prezzoDinamico.toFixed(2)), 
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

// 3. FUNZIONE DI DISEGNO TABELLA (Nuova)
function renderOrdiniCliente(ordiniDaMostrare) {
    const container = document.getElementById('ordiniListaCliente');
    
    if (ordiniDaMostrare.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">Nessun ordine trovato con i filtri selezionati.</p>';
        return;
    }

    let html = `<div class="lista-ordini-table-wrapper">
        <table>
            <thead>
                <tr>
                    <th>N. Ordine</th>
                    <th>Riferimento</th>
                    <th>Data</th>
                    <th>Totale</th>
                    <th>Stato</th>
                    <th>Dettagli</th>
                </tr>
            </thead>
            <tbody>`;
    
    ordiniDaMostrare.forEach(ordine => {
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

    // --- Titolo Modale ---
    if (numeroOrdineProg && numeroOrdineProg !== 'null') {
        document.querySelector('#orderDetailsModal h2').innerHTML = `Numero Preventivo : <span style="color: #007bff;">${numeroOrdineProg}</span>`;
    } else {
        document.querySelector('#orderDetailsModal h2').innerHTML = `Dettaglio Preventivo ID: <span style="color: #6c757d; font-size: 0.9em;">${ordineId.substring(0, 8)}</span>`;
    }
    
    let dettagliHtml = "";

    // --- Dati Cliente ---
    const infoCliente = dettagli.find(d => d.tipo === 'INFO_CLIENTE');
    if (infoCliente) {
        dettagliHtml += `<div style="background: #f1f8ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #cce5ff;">`;
        dettagliHtml += `<strong>Cliente / Rag. Soc.:</strong> ${infoCliente.cliente || '---'}<br>`;
        dettagliHtml += `<strong>Contatti:</strong> ${infoCliente.contatti || '---'}`;
        dettagliHtml += `</div>`;
        dettagliHtml += `----------------------------------------------------------\n\n`;
    }

    dettagliHtml += `DETTAGLI ARTICOLI:\n`;

    dettagli.forEach(item => {
        // Ignora l'oggetto INFO_CLIENTE nel loop prodotti
        if (item.tipo === 'INFO_CLIENTE') return;

        dettagliHtml += `\n--- ${item.prodotto} (${item.quantita} pz) ---\n`;
        
        if (item.componenti && item.componenti.length > 0) {
             dettagliHtml += `Componenti: ${item.componenti.join(', ')}\n`;
        }
        
        let pUnit = parseFloat(item.prezzo_unitario);
        if (isNaN(pUnit)) pUnit = 0;
        dettagliHtml += `Prezzo netto cad.: € ${pUnit.toFixed(2)}\n`;
        
        if (item.dettagli_taglie && Object.keys(item.dettagli_taglie).length > 0) {
            dettagliHtml += `Dettagli Taglie:\n`;
            for (const genere in item.dettagli_taglie) {
                const taglie = Object.entries(item.dettagli_taglie[genere])
                    .map(([taglia, qty]) => `${taglia}: ${qty}`)
                    .join(', ');
                dettagliHtml += `  - ${genere}: ${taglie}\n`;
            }
        }
        
        if (item.note && item.note.trim() !== '') {
            dettagliHtml += `Note: ${item.note}\n`;
        }

        // --- MODIFICA QUI: GESTIONE LINK FILE ---
        if (item.personalizzazione_url && item.personalizzazione_url !== 'Nessun file collegato direttamente.') {
            // Se contiene "http", è un link valido -> Creiamo il pulsante
            if (item.personalizzazione_url.includes('http')) {
                dettagliHtml += `File: <a href="${item.personalizzazione_url}" target="_blank" style="color: #007bff; text-decoration: underline; font-weight: bold; cursor: pointer;">Visualizza Allegato 📎</a>\n`;
            } else {
                // Altrimenti stampiamo il testo (es. "Nessun file caricato")
                dettagliHtml += `File: ${item.personalizzazione_url}\n`;
            }
        }
    });

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
    modalBody.innerHTML = dettagliHtml.replace(/\n/g, '<br>');

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

    const quickOrder = document.getElementById('quick-order-section');
    if (quickOrder) quickOrder.style.display = 'block';
}

function mostraVistaOrdini() {
    document.querySelector('.container').style.gridTemplateColumns = '1fr'; 
    
    // Nascondi galleria e carrello
    document.getElementById('galleriaView').style.display = 'none'; 
    document.getElementById('sezioneCarrello').style.display = 'none';
    
    // Mostra la sezione ordini
    document.getElementById('ordiniCliente').style.display = 'block'; 
    
    // --- FIX GRAFICO: Nascondi esplicitamente Banner e Quick Order ---
    const bannerNav = document.querySelector('.banner-iniziale-nav');
    if (bannerNav) bannerNav.style.display = 'none';

    const quickOrder = document.getElementById('quick-order-section');
    if (quickOrder) quickOrder.style.display = 'none';

    // Carica i dati
    caricaMieiOrdini();
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

    const forma = formaElement.textContent.trim();
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
    prezzoDinamicoSpan.textContent = `€ ${costoFinaleBase.toFixed(2)}`;
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
    const totaleCalcolato = parseFloat(prezzoDinamicoSpan.textContent.replace('€', '').trim()) || 0;

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


// ===========================================
// INIZIALIZZAZIONE & EVENT LISTENERS
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
    const isLogged = await verificaCliente();
    if (isLogged) {
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
        

        // LISTENER PER IL PREZZO DINAMICO E AGGIORNAMENTO (Bandiere)
        
        // 1. Logica per la selezione delle forme
        document.querySelectorAll('.forme .forma').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.forme .forma').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                calcolaPrezzoDinamico(); 
            });
        });
        
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
            
            const checkboxes = document.querySelectorAll('.componenti input[type="checkbox"]:not([disabled])');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);

            checkboxes.forEach(cb => {
                cb.checked = !allChecked;
            });

             
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
        
    }
});


// ============================================================
// LOGICA CONFIGURATORE RAPIDO (Inizio)***********
// ============================================================
const quantitaList = [5, 12, 20, 25, 30, 50, 75, 100];
const prezziLavorazioni = {
    K1: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3], K4: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
    K5: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3], K6: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
    K7: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3], K8: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
    K9: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3], K10: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
    K11: [10, 10, 10, 8.5, 8.3, 7.5, 8, 8], M6: [3.5, 3.2, 3, 2.8, 2.6, 2.4, 2.2, 2],
    K14: [4.5, 4, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05], K21: [4.5, 4, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05],
    K22: [4.5, 4, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05], K23: [4.5, 4, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05],
    K15: [4.5, 4, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05], K16: [4.5, 4, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05],
    K17: [4.5, 4, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05], K18: [4.5, 4, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05],
    K19: [4.5, 4, 1.9, 1.85, 1.65, 1.48, 1.24, 1.05], M19: [6, 4.8, 4.2, 3.2, 2.9, 2.5, 2.5, 2.5],
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
    if (qty <= 5) return 0.9;
    if (qty <= 12) return 0.75;
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
    if (spanSugg) {
        spanSugg.innerText = prezzoBase.toFixed(2);
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
