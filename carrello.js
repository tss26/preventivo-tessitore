// ===========================================
// CONFIGURAZIONE SUPABASE
// Devi definire il client Supabase anche qui, 
// o assicurarti che sia disponibile globalmente.
// Per semplicità, lo includiamo anche qui.
// Usa le tue chiavi reali.
// ===========================================
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;


// ===========================================
// GESTIONE CARRELLO (LOGICA)
// ===========================================

// 1. Inizializzazione del Carrello da localStorage
let carrello = JSON.parse(localStorage.getItem('carrello')) || [];

/**
 * Aggiunge un articolo al carrello e aggiorna localStorage.
 * @param {object} articolo - L'oggetto che rappresenta l'articolo personalizzato.
 */
function aggiungiAlCarrello(articolo) {
    carrello.push(articolo);
    localStorage.setItem('carrello', JSON.stringify(carrello));
    aggiornaUIPreventivo(); 
}

/**
 * Calcola il totale parziale del carrello.
 * @returns {number} Il totale calcolato.
 */
function calcolaTotaleParziale() {
    // Implementa la logica di calcolo del prezzo qui.
    // Per ora, usiamo una somma di prezzi fittizi per l'esempio.
    return carrello.reduce((totale, item) => {
        // Usa un prezzo base se non definito, altrimenti usa il prezzo dell'articolo.
        const prezzoArticolo = item.prezzo_unitario || 100; 
        return totale + (prezzoArticolo * item.quantita);
    }, 0);
}

// ===========================================
// GESTIONE INTERFACCIA UTENTE (UI)
// ===========================================

/**
 * Aggiorna la sezione "Il tuo preventivo" (aside.preventivo).
 */
function aggiornaUIPreventivo() {
    const lista = document.querySelector('.preventivo-lista');
    const totaleStrong = document.querySelector('.totale strong');
    
    if (!lista || !totaleStrong) return;

    lista.innerHTML = ''; // Svuota la lista
    
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

    // Aggiorna il totale
    const totale = calcolaTotaleParziale();
    totaleStrong.textContent = `€ ${totale.toFixed(2)}`;
    
    // Aggiunge i listener per la rimozione (opzionale ma utile)
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            rimuoviDalCarrello(e.target.getAttribute('data-index'));
        });
    });
}

/**
 * Rimuove un articolo dal carrello tramite indice.
 * @param {number} index - L'indice dell'articolo da rimuovere.
 */
function rimuoviDalCarrello(index) {
    carrello.splice(index, 1); // Rimuove 1 elemento all'indice specificato
    localStorage.setItem('carrello', JSON.stringify(carrello));
    aggiornaUIPreventivo();
}


// ===========================================
// EVENTI E LOGICA DI ACQUISTO
// ===========================================

// 2. Logica al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
    // Assicurati che il preventivo sia aggiornato all'apertura
    aggiornaUIPreventivo(); 
    
    const btnAggiungi = document.querySelector('.btn-add');
    if (btnAggiungi) {
        btnAggiungi.addEventListener('click', gestisciAggiuntaAlCarrello);
    }
});


/**
 * Funzione principale per gestire l'aggiunta al carrello: 
 * raccoglie i dati, gestisce l'upload e chiama aggiungiAlCarrello.
 */
async function gestisciAggiuntaAlCarrello() {
    const fileInput = document.getElementById('fileUpload');
    const qta = parseInt(document.getElementById('qta').value);
    const formaElement = document.querySelector('.forma.active');
    
    if (!formaElement || qta < 1) {
        alert("Seleziona una forma e una quantità valida.");
        return;
    }

    const forma = formaElement.textContent.trim();
    const componenti = Array.from(document.querySelectorAll('.componenti input:checked')).map(cb => cb.parentNode.textContent.trim());

    let fileUrl = null;

    if (fileInput.files.length > 0 && supabase) {
        const file = fileInput.files[0];
        // Crea un nome file univoco basato sull'utente e il timestamp
        const userId = (await supabase.auth.getUser()).data.user?.id || 'anonimo';
        const fileName = `${userId}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        
        try {
            // Upload del file su Supabase Storage (Assumi bucket chiamato 'personalizzazioni')
            const { data, error } = await supabase.storage.from('personalizzazioni').upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });
            
            if (error) {
                console.error('Errore upload Supabase:', error);
                alert('Errore nel caricamento del file. Controlla il bucket "personalizzazioni".');
                return;
            }
            
            // Ottieni l'URL pubblico per visualizzazione/download dell'admin
            const { data: urlData } = supabase.storage.from('personalizzazioni').getPublicUrl(data.path);
            fileUrl = urlData.publicUrl;

        } catch (e) {
            console.error('Errore generico in upload:', e);
            alert('Si è verificato un errore inaspettato durante l\'upload.');
            return;
        }

    } else if (fileInput.files.length > 0 && !supabase) {
        alert("ERRORE: Supabase non è stato inizializzato correttamente per l'upload.");
        return;
    }


    // Creazione dell'oggetto articolo da aggiungere al carrello
    const nuovoArticolo = {
        id_unico: Date.now(), // ID temporaneo per identificazione nel carrello
        prodotto: `Bandiera ${forma} Personalizzata`,
        quantita: qta,
        personalizzazione_url: fileUrl, 
        componenti: componenti,
        prezzo_unitario: 142.75 // TODO: Implementa logica di pricing dinamica qui
    };

    aggiungiAlCarrello(nuovoArticolo);
    
    // Feedback e pulizia UI
    alert(`Aggiunto al preventivo: ${qta} x ${nuovoArticolo.prodotto}`);
    fileInput.value = ''; // Resetta l'input file
}

// Assicurati che la funzione di checkout (richiediPreventivo) sia definita qui 
// o nel tuo file di checkout dedicato.
// ... (La logica del checkout della Fase 2 andrà qui, usando 'carrello' e 'supabase')
