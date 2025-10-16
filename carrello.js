// ===========================================
// CONFIGURAZIONE SUPABASE
// ===========================================
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 
 
// Crea il client Supabase solo se la libreria è caricata
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;


// ===========================================
// GESTIONE CARRELLO (LOGICA)
// (Le funzioni base rimangono invariate)
// ===========================================

// 1. Inizializzazione del Carrello da localStorage
let carrello = JSON.parse(localStorage.getItem('carrello')) || [];

// ... (aggiungiAlCarrello, calcolaTotaleParziale, rimuoviDalCarrello, aggiornaUIPreventivo) ...
// (Le funzioni sopra rimangono invariate nel tuo file)


// ===========================================
// NUOVA FUNZIONE DI UTILITY (GENERAZIONE N. ORDINE)
// ===========================================

/**
 * Genera un numero d'ordine progressivo (YY/XXXX) leggendo l'ultimo dal DB.
 * Questa logica è stata spostata lato client per evitare conflitti RLS con i trigger DB.
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
        
        // Verifica se il formato è corretto e se l'anno è lo stesso
        if (parole.length === 2 && parti[0] === annoCorrente && !isNaN(parseInt(parti[1]))) {
            prossimoNumero = parseInt(parti[1]) + 1;
        }
    }
    
    // Formatta il numero (XXXX)
    const numeroFormattato = prossimoNumero.toString().padStart(4, '0');
    
    return `${annoCorrente}/${numeroFormattato}`; // Esempio: '25/0001'
}

// ===========================================
// LOGICA DI CHECKOUT (Fase 2: Invio dell'Ordine) - AGGIORNATA
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
    // NOTA: Richiede che la colonna num_ordine_prog esista nella tabella ordini (TEXT).
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
                    -- LASCIA user_id fuori (il DB lo popola)
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
