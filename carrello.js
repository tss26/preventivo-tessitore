// ===========================================
// CONFIGURAZIONE SUPABASE
// Devi definire qui le tue chiavi reali.
// ATTENZIONE: Se carichi questo file su GitHub, le chiavi pubbliche (ANON_KEY)
// possono essere visibili, ma sono necessarie per l'uso lato client.
// ===========================================
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 
 
// Crea il client Supabase solo se la libreria è caricata
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
    return carrello.reduce((totale, item) => {
        // Usa il prezzo unitario definito nell'oggetto articolo.
        const prezzoArticolo = item.prezzo_unitario || 0; 
        return totale + (prezzoArticolo * item.quantita);
    }, 0);
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
    
    // Aggiunge i listener per la rimozione
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            rimuoviDalCarrello(e.target.getAttribute('data-index'));
        });
    });
}


// ===========================================
// LOGICA DI ACQUISTO (Fase 1: Aggiungi al Carrello)
// ===========================================

/**
 * Funzione principale per gestire l'aggiunta al carrello: 
 * raccoglie i dati, gestisce l'upload e chiama aggiungiAlCarrello.
 */
async function gestisciAggiuntaAlCarrello() {
    const fileInput = document.getElementById('fileUpload');
    const qta = parseInt(document.getElementById('qta').value);
    const formaElement = document.querySelector('.forma.active');
    
    if (!formaElement || qta < 1 || isNaN(qta)) {
        alert("Seleziona una forma e una quantità valida (min. 1).");
        return;
    }

    const forma = formaElement.textContent.trim();
    const componenti = Array.from(document.querySelectorAll('.componenti input:checked')).map(cb => cb.parentNode.textContent.trim());

    let fileUrl = null;

    if (fileInput.files.length > 0) {
        if (!supabase) {
             alert("ERRORE: Supabase non è stato inizializzato. Controlla la console.");
             return;
        }

        const file = fileInput.files[0];
        // Crea un nome file univoco
        // Nota: user_id sarà 'anonimo' finché non implementi la login.
        const userId = (await supabase.auth.getUser()).data.user?.id || 'anonimo';
        const fileName = `${userId}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        
        try {
            // Upload del file su Supabase Storage (bucket chiamato 'personalizzazioni')
            const { data, error } = await supabase.storage.from('personalizzazioni').upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });
            
            if (error) {
                console.error('Errore upload Supabase:', error);
                alert('Errore nel caricamento del file. Verifica le policy di RLS nel bucket "personalizzazioni".');
                return;
            }
            
            // Ottieni l'URL pubblico
            const { data: urlData } = supabase.storage.from('personalizzazioni').getPublicUrl(data.path);
            fileUrl = urlData.publicUrl;

        } catch (e) {
            console.error('Errore generico in upload:', e);
            alert('Si è verificato un errore inaspettato durante l\'upload.');
            return;
        }

    }


    // Creazione dell'oggetto articolo da aggiungere al carrello
    const nuovoArticolo = {
        id_unico: Date.now(),
        prodotto: `Bandiera ${forma} Personalizzata`,
        quantita: qta,
        personalizzazione_url: fileUrl, 
        componenti: componenti,
        prezzo_unitario: 142.75 // TODO: Sostituisci con il pricing dinamico reale
    };

    aggiungiAlCarrello(nuovoArticolo);
    
    // Feedback e pulizia UI
    alert(`Aggiunto al preventivo: ${qta} x ${nuovoArticolo.prodotto}`);
    fileInput.value = ''; // Resetta l'input file
}


// ===========================================
// LOGICA DI CHECKOUT (Fase 2: Invio dell'Ordine)
// ===========================================

/**
 * Gestisce il processo di checkout: salva il carrello nel DB e lo svuota.
 */
async function gestisciCheckout() {
    if (!supabase) {
        alert("ERRORE: Supabase non è inizializzato. Impossibile inviare l'ordine.");
        return;
    }

    // 1. Prepara i dati
    const carrelloDaSalvare = JSON.parse(localStorage.getItem('carrello')) || [];
    
    if (carrelloDaSalvare.length === 0) {
        alert("Il preventivo è vuoto. Aggiungi prima degli articoli.");
        return;
    }
    
    const totaleCalcolato = calcolaTotaleParziale();
    
    // Ottiene l'ID utente (sarà null se non loggato)
    let userId = null;
    const { data: { user } } = await supabase.auth.getUser();
    userId = user ? user.id : null; 
    

    // 2. Conferma (opzionale)
    if (!confirm(`Confermi l'invio del preventivo per un totale di € ${totaleCalcolato.toFixed(2)}?`)) {
        return;
    }
    
    // 3. Inserisci l'ordine nel DB
    try {
        const { data, error } = await supabase
            .from('ordini')
            .insert([
                {
                    user_id: userId,
                    stato: 'In attesa di lavorazione',
                    totale: totaleCalcolato,
                    dettagli_prodotti: carrelloDaSalvare,
                }
            ])
            .select(); // Richiedi i dati inseriti per ottenere l'ID

        if (error) {
            throw new Error(error.message);
        }

        // 4. Successo: Svuota il carrello e aggiorna l'UI
        carrello = []; 
        localStorage.removeItem('carrello');
        aggiornaUIPreventivo();
        
        const ordineId = data && data[0] ? data[0].id : 'N/D';
        alert(`Ordine/Preventivo inviato con successo! Ti contatteremo a breve. ID ordine: ${ordineId}`);

    } catch (e) {
        console.error('Errore durante l\'invio dell\'ordine:', e);
        alert(`Errore nell'invio dell'ordine: ${e.message}. Assicurati che la tabella 'ordini' esista e che le policy di RLS lo permettano.`);
    }
}


// ===========================================
// INIZIALIZZAZIONE E EVENT LISTENERS
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    // Aggiorna subito l'UI al caricamento con i dati di localStorage
    aggiornaUIPreventivo(); 
    
    
    // ** CODICE AGGIUNTO PER GESTIRE IL CLICK SUI PULSANTI FORMA **
    document.querySelectorAll('.forme .forma').forEach(button => {
        button.addEventListener('click', (e) => {
            // 1. Trova e rimuovi 'active' da tutti i pulsanti della forma
            document.querySelectorAll('.forme .forma').forEach(btn => {
                btn.classList.remove('active');
            });

            // 2. Aggiungi 'active' solo al pulsante cliccato
            e.target.classList.add('active');
        });
    });
    // ***************************************************************
    
    
    // Listener per l'aggiunta al carrello
    const btnAggiungi = document.querySelector('.btn-add');
    if (btnAggiungi) {
        btnAggiungi.addEventListener('click', gestisciAggiuntaAlCarrello);
    }
    
    // Listener per il checkout (Richiedi preventivo ufficiale)
    const btnCheckout = document.getElementById('richiediPreventivo');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', gestisciCheckout);
    }
});
