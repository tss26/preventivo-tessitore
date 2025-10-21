// ===========================================
// CONFIGURAZIONE SUPABASE
// ===========================================
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let utenteCorrenteId = null; 
let carrello = JSON.parse(localStorage.getItem('carrello')) || [];


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
};
// ===========================================


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


// ===========================================
// FUNZIONALITÀ ORDINI CLIENTE (Viste e Caricamento)
// ... (omissis, funzioni ordini non modificate)
// ...

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


        aggiornaUIPreventivo();
        mostraVistaPreventivo();
        calcolaPrezzoDinamico(); // Inizializza il prezzo dinamico all'avvio
    }
});
