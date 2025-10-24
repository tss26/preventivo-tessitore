// ===========================================
// CONFIGURAZIONE SUPABASE
// ===========================================
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let utenteCorrenteId = null; 
let carrello = JSON.parse(localStorage.getItem('carrello')) || [];

// Fasce di quantità per il listino Kit Calcio (Totale Pezzi)
// Questo array aiuta la funzione a trovare il prezzo corretto per fascia.
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
// QUESTA SEZIONE MANCAVA O ERA ERRATA
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
    }


    
};
// ===========================================


// --- NUOVO LISTINO TIER PER DTF (MTR) ---
const LISTINO_DTF_METRO = [
    // La chiave 'max' è in metri, 'prezzo' è il costo per metro
    { max: 3.0, prezzo: 15.00 }, // da 0.1 a 3 metri
    { max: 10.0, prezzo: 12.50 }, // da 3.1 a 10 metri
    { max: 9999.0, prezzo: 9.50 } // da 10.1 metri in poi
];

const LISTINO_COMPLETO = {
    // ... (Bandiere)

    // --- NUOVO LISTINO DTF ---
    "DTF": {
        "COSTO_GRAFICO": 0.00, // Rimosso (impostato a zero per coerenza)
        "MINIMO_METRI": 0.1 // Minimo ordinabile (10 cm)
    }
};
// ...listino dtf fine



// ===========================================
// FUNZIONI DI BASE CLIENTE (Verifica e Logout)
// ... (omissis, rimane invariato)

async function verificaCliente() {
    if (!supabase) { console.error("Supabase non inizializzato."); return false; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = 'login.html'; return false; }
    utenteCorrenteId = user.id;
    const { data: profilo } = await supabase.from('utenti').select('ragione_sociale').eq('id', user.id).single();
    const logoElement = document.querySelector('.logo');
    if (logoElement) { logoElement.innerHTML = `<img src="icon-192.png" alt="Logo Tessitore" style="height: 40px; vertical-align: middle;"> Cliente: ${profilo?.ragione_sociale || user.email}`; }
    return true; 
}

async function handleLogout() {
    if (!confirm("Sei sicuro di voler uscire?")) { return; }
    const { error } = await supabase.auth.signOut();
    if (error) { console.error('Errore durante il logout:', error); } 
    else { localStorage.removeItem('carrello'); window.location.href = 'index.html'; }
}


// ===========================================
// GESTIONE CARRELLO (LOGICA)
// ... (omissis, rimane invariato)

function aggiungiAlCarrello(articolo) {
    carrello.push(articolo);
    localStorage.setItem('carrello', JSON.stringify(carrello));
    aggiornaUIPreventivo(); 
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
 */
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
}


// ===========================================
// NUOVA FUNZIONE DI UTILITY (GENERAZIONE N. ORDINE)
// ... (omissis, rimane invariato)

async function generaNumeroOrdineTemporaneo() {
    const { data } = await supabase
        .from('ordini')
        .select('num_ordine_prog')
        .order('data_ordine', { ascending: false })
        .limit(1)
        .single();
    const annoCorrente = new Date().getFullYear().toString().substring(2); 
    let prossimoNumero = 1;
    if (data && data.num_ordine_prog) {
        const ultimoOrdine = data.num_ordine_prog; 
        const parti = ultimoOrdine.split('/');
        if (parti.length === 2 && parti[0] === annoCorrente && !isNaN(parseInt(parti[1]))) {
            prossimoNumero = parseInt(parti[1]) + 1;
        }
    }
    const numeroFormattato = prossimoNumero.toString().padStart(4, '0');
    return `${annoCorrente}/${numeroFormattato}`; 
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
// ... (omissis, gestisciCheckout e funzioni successive non modificate)
*/
async function gestisciCheckout() {
    if (!supabase) { alert("ERRORE: Supabase non è inizializzato."); return; }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) { alert("Devi effettuare il login per richiedere un preventivo ufficiale."); return; }
    
    const carrelloDaSalvare = JSON.parse(localStorage.getItem('carrello')) || [];
    
    if (carrelloDaSalvare.length === 0) { alert("Il preventivo è vuoto."); return; }
    
    const totaleCalcolato = calcolaTotaleParziale();
    const numeroOrdineGenerato = await generaNumeroOrdineTemporaneo();

    if (!confirm(`Confermi l'invio del preventivo N. ${numeroOrdineGenerato} per € ${totaleCalcolato.toFixed(2)}?`)) { return; }
    
    try {
        const { error } = await supabase
            .from('ordini')
            .insert([
                {
                    num_ordine_prog: numeroOrdineGenerato,
                    stato: 'In attesa di lavorazione',
                    totale: totaleCalcolato,
                    dettagli_prodotti: carrelloDaSalvare,
                    user_id: utenteCorrenteId,
                }
            ]);

        if (error) { throw new Error(error.message); }

        carrello = []; 
        localStorage.removeItem('carrello');
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

    //  Visualizzazione del Prezzo Base ***
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
    
    const qtaTotale = parseInt(document.getElementById('kitQtaTotale').textContent) || 0;
    //kitPrezzoBase sostituito a kitPrezzoDinamico
    const prezzoDinamico = parseFloat(document.getElementById('kitPrezzoBase').textContent.replace('€', '').trim()) || 0;
    const kitNote = document.getElementById('kitNote').value;

    if (!kitProdSelezionato) {
        alert("Devi selezionare un prodotto Kit (T-Shirt, Pantaloncino o Completino).");
        return;
    }
    if (qtaTotale === 0 || isNaN(prezzoDinamico)) {
        alert("La quantità totale deve essere superiore a zero.");
        return;
    }
    if (!utenteCorrenteId) { // Controllo cruciale
        alert("Errore: ID Utente non disponibile. Effettua nuovamente il login.");
        return;
    }
    
    // Raccoglie i dettagli delle taglie
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
    
    // Traccia il costo impianto grafico come componente fisso
    const componenti = [`Sublimazione`, `Costo Impianto Grafico (€${LISTINO_COMPLETO.KIT_CALCIO.COSTO_GRAFICO.toFixed(2)})`];

    const nuovoArticolo = { 
        id_unico: Date.now(), 
        prodotto: `KIT CALCIO - ${kitProdSelezionato}`, 
        quantita: qtaTotale, 
        // Il prezzo unitario è il prezzo medio calcolato
        prezzo_unitario: parseFloat(prezzoDinamico.toFixed(2)), 
        componenti: componenti,
        dettagli_taglie: dettagliTaglie,
        note: kitNote,
        // NON c'è upload qui, ma l'ordine verrà inviato con questo campo
        personalizzazione_url: 'Nessun file collegato direttamente.'
    };

    aggiungiAlCarrello(nuovoArticolo);
    alert(`Aggiunto ${qtaTotale}x ${nuovoArticolo.prodotto} al preventivo per € ${nuovoArticolo.prezzo_unitario.toFixed(2)} cad. (Prezzo Netto)!`);
    
    // Reset dell'interfaccia dopo l'aggiunta 
    document.getElementById('kitNote').value = '';
    taglieTables.forEach(table => table.querySelectorAll('input[type="number"]').forEach(input => input.value = '0'));
    calcolaPrezzoDinamicoKit(); // Ritorna a €0.00
}





// ===========================================
// FUNZIONALITÀ ORDINI CLIENTE (Viste e Caricamento)
// ... (omissis, funzioni ordini non modificate)
// ...


async function caricaMieiOrdini() {
    const container = document.getElementById('ordiniListaCliente');
    if (!utenteCorrenteId) { container.innerHTML = `<p style="color: red;">ID utente non disponibile.</p>`; return; }
    container.innerHTML = '<p>Caricamento ordini in corso...</p>';
    const { data: ordini, error } = await supabase.from('ordini').select(`*`).eq('user_id', utenteCorrenteId).order('data_ordine', { ascending: false }); 
    if (error) { container.innerHTML = `<p style="color: red;">Errore nel recupero ordini: ${error.message}. Verifica Policy RLS SELECT sulla tabella ordini (auth.uid() = user_id).</p>`; return; }
    if (ordini.length === 0) { container.innerHTML = '<p>Non hai ancora effettuato ordini.</p>'; return; }
    let html = `<div class="lista-ordini-table-wrapper"><table><thead><tr><th>N. Ordine</th><th>Data</th><th>Totale</th><th>Stato</th><th>Dettagli</th></tr></thead><tbody>`;
    ordini.forEach(ordine => {
        const numeroOrdine = ordine.num_ordine_prog ? ordine.num_ordine_prog : ordine.id.substring(0, 8).toUpperCase(); 
        html += `<tr data-id="${ordine.id}"><td>${numeroOrdine}</td><td>${new Date(ordine.data_ordine).toLocaleString()}</td><td>€ ${ordine.totale ? ordine.totale.toFixed(2) : '0.00'}</td><td><span class="stato-ordine stato-${ordine.stato.replace(/\s/g, '-')}">${ordine.stato}</span></td><td><button onclick="mostraDettagliOrdine('${ordine.id}', '${JSON.stringify(ordine.dettagli_prodotti).replace(/"/g, '&quot;')}')" class="btn-primary" style="padding: 5px 10px;">Vedi Dettagli</button></td></tr>`;
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}
function mostraDettagliOrdine(ordineId, dettagliProdottiString) {
    const dettagli = JSON.parse(dettagliProdottiString); 
    let dettagliHtml = `Ordine ID: ${ordineId.substring(0, 8)}...\n\nDETTAGLI PRODOTTI:\n`; 
    dettagli.forEach(item => {
        dettagliHtml += `\n--- ${item.prodotto} (${item.quantita} pz) ---\n`;
        dettagliHtml += `Componenti: ${item.componenti.join(', ')}\n`;
        dettagliHtml += `Prezzo netto cad.: € ${item.prezzo_unitario}\n`;
        // *******************************************************
        // 1. LOGICA AGGIUNTA TAGLIE E NOTE
        // *******************************************************
        
        // Mostra i dettagli delle taglie se presenti
        if (item.dettagli_taglie && Object.keys(item.dettagli_taglie).length > 0) {
            dettagliHtml += `\nDettagli Taglie:\n`;
            for (const genere in item.dettagli_taglie) {
                const taglie = Object.entries(item.dettagli_taglie[genere])
                    .map(([taglia, qty]) => `${taglia}: ${qty}`)
                    .join(', ');
                dettagliHtml += `  - ${genere}: ${taglie}\n`;
            }
        }
        
        // Mostra le note se presenti
        if (item.note && item.note.trim() !== '') {
            dettagliHtml += `Note Cliente: ${item.note}\n`;
        }
        
        // *******************************************************
        
        if (item.personalizzazione_url) {
            dettagliHtml += `File: COPIA E APRI L'URL:\n${item.personalizzazione_url}\n`;
        } else {
            dettagliHtml += `File: Nessun file caricato.\n`;
        }
    });
    alert(dettagliHtml); 
}


/**
 * 4. Mostra i dettagli dell'ordine in un modale HTML selezionabile.
 */
function mostraDettagliOrdine(ordineId, dettagliProdottiString) {
    const dettagli = JSON.parse(dettagliProdottiString); 
    const modal = document.getElementById('orderDetailsModal');
    const modalBody = document.getElementById('modalOrderDetails');
    const modalTitle = document.getElementById('modalOrderId');

    let dettagliHtml = `Ordine ID: ${ordineId.substring(0, 8)}...\n\nDETTAGLI PRODOTTI:\n`; 
    
    dettagli.forEach(item => {
        dettagliHtml += `\n--- ${item.prodotto} (${item.quantita} pz) ---\n`;
        dettagliHtml += `Componenti: ${item.componenti.join(', ')}\n`;
        dettagliHtml += `Prezzo netto cad.: € ${item.prezzo_unitario}\n`;
        
        // 1. Logica Taglie (Riusata dal tuo codice precedente)
        if (item.dettagli_taglie && Object.keys(item.dettagli_taglie).length > 0) {
            dettagliHtml += `\nDettagli Taglie:\n`;
            for (const genere in item.dettagli_taglie) {
                const taglie = Object.entries(item.dettagli_taglie[genere])
                    .map(([taglia, qty]) => `${taglia}: ${qty}`)
                    .join(', ');
                dettagliHtml += `  - ${genere}: ${taglie}\n`;
            }
        }
        
        // 2. Logica Note
        if (item.note && item.note.trim() !== '') {
            dettagliHtml += `Note Cliente: ${item.note}\n`;
        }

        // 3. Logica File
        if (item.personalizzazione_url && item.personalizzazione_url !== 'Nessun file collegato direttamente.') {
            dettagliHtml += `File: COPIA E APRI L'URL:\n${item.personalizzazione_url}\n`;
        } else {
            dettagliHtml += `File: Nessun file collegato direttamente.\n`;
        }
    });

    // Aggiorna e mostra il modale
    modalTitle.textContent = ordineId.substring(0, 8).toUpperCase() + '...';
    modalBody.textContent = dettagliHtml; // Usiamo textContent per prevenire problemi di injection
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


function mostraVistaPreventivo() {
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
}


//------------------------------
// FUNZIONE DI CALCOLO DINAMICO DEL PREZZO PER LE BANDIERE  SENZA CONNESSIONE AL DB
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


//--------------------------------
// CALCOLA PREZZO DINAMICO DTF
//--------------------------------
function calcolaPrezzoDinamicoDTF() {
    const centimetriInput = document.getElementById('dtfMetri')?.value; 
    const copie = parseInt(document.getElementById('dtfCopie')?.value) || 1;
    const prezzoDinamicoSpan = document.getElementById('dtfPrezzoDinamico');

    // Conversione da Centimetri a Metri (Cruciale: 100 cm = 1 mt)
    const metri = parseFloat(centimetriInput) / 100 || 0; 
    
    const listinoDTF = LISTINO_COMPLETO.DTF;

    // 🛑 CONTROLLO MINIMO ORDINABILE (0.1 metri = 10 cm)
    if (metri < listinoDTF.MINIMO_METRI || !prezzoDinamicoSpan) { 
        prezzoDinamicoSpan.textContent = '€ 0.00';
        return;
    }
    
    // 1. Trova il prezzo al metro in base alla quantità (metri)
    const fasciaPrezzo = LISTINO_DTF_METRO.find(f => metri <= f.max);
    
    let prezzoMetro = 0;
    
    if (fasciaPrezzo) {
        prezzoMetro = fasciaPrezzo.prezzo;
    } else {
        // Usa il prezzo più basso (€9.50) se la quantità è enorme
        prezzoMetro = 9.50; 
    }

    // 2. Calcolo del Costo Totale (Costo grafico fisso rimosso)
    const costoTotaleBase = metri * prezzoMetro;
    
    // Calcoliamo solo le copie aggiuntive (se copie > 1)
    const costoCopiaAggiuntiva = 0; // Se non c'è costo per copia, lasciamo 0
    const copieAggiuntive = Math.max(0, copie - 1); 
    const costoGestioneAggiuntiva = copieAggiuntive * costoCopiaAggiuntiva; // Assumendo che il costo sia zero

    // Il costo totale è solo il costo base di stampa
    const costoTotaleFinale = costoTotaleBase + costoGestioneAggiuntiva; 
    
    prezzoDinamicoSpan.textContent = `€ ${costoTotaleFinale.toFixed(2)}`;
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
        
        document.getElementById('mieiOrdiniBtn').addEventListener('click', (e) => {
            e.preventDefault();
            mostraVistaOrdini();
        });
        
        document.querySelector('.nav a[href="index.html"]').addEventListener('click', (e) => {
             if (document.getElementById('ordiniCliente').style.display !== 'none') {
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
        

        // LISTENER PER IL PREZZO DINAMICO E AGGIORNAMENTO
        
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


//----- LISTENER PER DTF----------

    //document.addEventListener('DOMContentLoaded', async () => {
    // --- LISTENER PER LA SEZIONE DTF ---

    // 1. Inizializzazione Info Box DTF
    const dtfInfoContent = document.getElementById('dtfInfoContent');
    const dtfInfoIcon = document.getElementById('dtfInfoIcon');

    // Contenuto dei requisiti
    const requisitiDTF = `
        File formato PDF o PNG con sfondo trasparente.
        Metodo colore CMYK.
        Risoluzione 300dpi (misure reali).
        Il file deve avere larghezza 55 cm x la lunghezza selezionata.
        Sono da evitare sfumature trasparenti o traslucide, con trasparenze del 30/40%.
        Si consiglia di mantenere i contorni della grafica sempre ben definiti.
        N.B. Quando la grafica da stampare è di colore bianco, evitare assolutamente di inserire fondini di altri colori.
        Per qualsiasi informazione contattaci o scrivici nel campo "Note".
    `;
    
    // Inserisce il contenuto formattato (pre-wrap per mantenere i salti di riga)
    if (dtfInfoContent) {
        dtfInfoContent.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit; font-size: 0.9em; margin: 0;">${requisitiDTF}</pre>`;
        dtfInfoContent.style.display = 'none'; // Nascondi all'inizio
    }
    
    // Listener per mostrare/nascondere il contenuto (click su ℹ️)
    if (dtfInfoIcon) {
        dtfInfoIcon.addEventListener('click', () => {
            if (dtfInfoContent.style.display === 'none') {
                dtfInfoContent.style.display = 'block';
            } else {
                dtfInfoContent.style.display = 'none';
            }
        });
    }

    // 2. Listener per il Calcolo Dinamico (Metri e Copie)
    document.getElementById('dtfMetri')?.addEventListener('input', calcolaPrezzoDinamicoDTF);
    document.getElementById('dtfCopie')?.addEventListener('input', calcolaPrezzoDinamicoDTF);

    // 3. Listener per l'Aggiunta al Carrello
    document.getElementById('aggiungiDTFBtn')?.addEventListener('click', aggiungiDTFAlCarrello);

    // ... (Chiamate finali: calcolaPrezzoDinamico(), calcolaPrezzoDinamicoKit())
    calcolaPrezzoDinamicoDTF(); // Inizializzazione del prezzo DTF
});//--------- fine listner dtf







        
        aggiornaUIPreventivo();
        mostraVistaPreventivo();
        calcolaPrezzoDinamico(); // Inizializza il prezzo dinamico all'avvio
        calcolaPrezzoDinamicoKit(); // Inizializza il prezzo dinamico Kit all'avvio (dovrebbe essere 0)
    }
});
