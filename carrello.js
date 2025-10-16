// ===========================================
// CONFIGURAZIONE SUPABASE
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
 */
function aggiungiAlCarrello(articolo) {
    carrello.push(articolo);
    localStorage.setItem('carrello', JSON.stringify(carrello));
    aggiornaUIPreventivo(); 
}

/**
 * Calcola il totale parziale del carrello.
 */
function calcolaTotaleParziale() {
    return carrello.reduce((totale, item) => {
        const prezzoArticolo = item.prezzo_unitario || 0; 
        return totale + (prezzoArticolo * item.quantita);
    }, 0);
}

/**
 * Rimuove un articolo dal carrello tramite indice.
 */
function rimuoviDalCarrello(index) {
    carrello.splice(index, 1);
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
// NUOVA FUNZIONE DI UTILITY (GENERAZIONE N. ORDINE)
// ===========================================

/**
 * Genera un numero d'ordine progressivo (YY/XXXX) leggendo l'ultimo dal DB.
 */
async function generaNumeroOrdineTemporaneo() {
    // 1. Recupera l'ultimo ordine per trovare l'ultimo num_ordine_prog
    const { data } = await supabase
        .from('ordini')
        .select('num_ordine_prog')
        .order('data_ordine', { ascending: false })
        .limit(1)
        .single();

    const annoCorrente = new Date().getFullYear().toString().substring(2); // Esempio: '25'
    let prossimoNumero = 1;

    if (data && data.num_ordine_prog) {
        const ultimoOrdine = data.num_ordine_prog; // Esempio: '25/0010'
        const parti = ultimoOrdine.split('/');
        
        // CORREZIONE BUG: Uso 'parti' al posto di 'parole' e verifica la lunghezza dell'array
        if (parti.length === 2 && parti[0] === annoCorrente && !isNaN(parseInt(parti[1]))) {
            prossimoNumero = parseInt(parti[1]) + 1;
        }
    }
    
    // Formatta il numero (XXXX)
    const numeroFormattato = prossimoNumero.toString().padStart(4, '0');
    
    return `${annoCorrente}/${numeroFormattato}`; // Esempio: '25/0001'
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
        const userId = (await supabase.auth.getUser()).data.user?.id || 'anonimo';
        const fileName = `${userId}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        
        try {
            const { data, error } = await supabase.storage.from('personalizzazioni').upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });
            
            if (error) {
                console.error('Errore upload Supabase:', error);
                alert('Errore nel caricamento del file. Verifica le policy di RLS nel bucket "personalizzazioni".');
                return;
            }
            
            const { data: urlData } = supabase.storage.from('personalizzazioni').getPublicUrl(data.path);
            fileUrl = urlData.publicUrl;

        } catch (e) {
            console.error('Errore generico in upload:', e);
            alert('Si è verificato un errore inaspettato durante l\'upload.');
            return;
        }

    }

    const nuovoArticolo = {
        id_unico: Date.now(),
        prodotto: `Bandiera ${forma} Personalizzata`,
        quantita: qta,
        personalizzazione_url: fileUrl, 
        componenti: componenti,
        prezzo_unitario: 142.75 
    };

    aggiungiAlCarrello(nuovoArticolo);
    
    alert(`Aggiunto al preventivo: ${qta} x ${nuovoArticolo.prodotto}`);
    fileInput.value = '';
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
    
    // 1. CONTROLLO AUTENTICAZIONE (OBBLIGATORIO)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        alert("Devi effettuare il login per richiedere un preventivo ufficiale. Verrai reindirizzato alla pagina di accesso.");
        window.location.href = 'login.html'; 
        return; 
    }
    
    // 2. Prepara i dati
    const carrelloDaSalvare = JSON.parse(localStorage.getItem('carrello')) || [];
    
    if (carrelloDaSalvare.length === 0) {
        alert("Il preventivo è vuoto. Aggiungi prima degli articoli.");
        return;
    }
    
    const totaleCalcolato = calcolaTotaleParziale();

    // 3. AGGIUNGI IL NUOVO NUMERO D'ORDINE
    const numeroOrdineGenerato = await generaNumeroOrdineTemporaneo();

    // 4. Conferma (opzionale)
    if (!confirm(`Confermi l'invio del preventivo N. ${numeroOrdineGenerato} per € ${totaleCalcolato.toFixed(2)}?`)) {
        return;
    }
    
    // 5. Inserisci l'ordine nel DB
    try {
        const { error } = await supabase
            .from('ordini')
            .insert([
                {
                    // LASCIA user_id fuori (il DB lo popola)
                    num_ordine_prog: numeroOrdineGenerato, // <-- NUOVO CAMPO AGGIUNTO
                    stato: 'In attesa di lavorazione',
                    totale: totaleCalcolato,
                    dettagli_prodotti: carrelloDaSalvare,
                }
            ]);

        if (error) {
            throw new Error(error.message);
        }

        // 6. Successo: Svuota il carrello
        carrello = []; 
        localStorage.removeItem('carrello');
        aggiornaUIPreventivo();
        
        alert(`Ordine/Preventivo ${numeroOrdineGenerato} inviato con successo!`);

    } catch (e) {
        console.error('Errore durante l\'invio dell\'ordine:', e);
        alert(`Errore nell'invio dell'ordine: ${e.message}. Riprova il login.`);
    }
}


// ===========================================
// EVENT LISTENERS (rimanente invariato)
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    // Aggiorna subito l'UI al caricamento con i dati di localStorage
    aggiornaUIPreventivo(); 
    
    // ** CODICE AGGIUNTO PER GESTIRE IL CLICK SUI PULSANTI FORMA **
    document.querySelectorAll('.forme .forma').forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelectorAll('.forme .forma').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
        });
    });
    
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
