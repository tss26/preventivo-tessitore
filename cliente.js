// ===========================================
// CONFIGURAZIONE SUPABASE
// ===========================================
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let utenteCorrenteId = null; 
let carrello = JSON.parse(localStorage.getItem('carrello')) || [];

// ===========================================
// FUNZIONI DI BASE CARRELLO (Da carrello.js)
// ===========================================

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
// LOGICA DI ACQUISTO e Checkout
// ===========================================

/**
 * Genera il numero d'ordine progressivo (YY/XXXX) leggendo l'ultimo dal DB.
 */
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

/**
 * Funzione principale per gestire l'aggiunta al carrello (Bandiere).
 */
async function gestisciAggiuntaAlCarrello() {
    // Logica di raccolta dati e creazione nuovoArticolo (omessa per brevità)
    const nuovoArticolo = { 
        id_unico: Date.now(), 
        prodotto: 'Bandiera Goccia', 
        quantita: 1, 
        prezzo_unitario: 142.75,
        componenti: ['base', 'asta'], 
        personalizzazione_url: 'url/fittizio'
    };
    
    aggiungiAlCarrello(nuovoArticolo);
    alert(`Aggiunto 1x Bandiera Goccia al preventivo!`);
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
// FUNZIONALITÀ ORDINI CLIENTE (NUOVA VISTA)
// ===========================================

/**
 * Recupera e visualizza gli ordini specifici del cliente loggato.
 */
async function caricaMieiOrdini() {
    const container = document.getElementById('ordiniListaCliente');
    if (!utenteCorrenteId) {
        container.innerHTML = `<p style="color: red;">ID utente non disponibile.</p>`;
        return;
    }
    
    container.innerHTML = '<p>Caricamento ordini in corso...</p>';
    
    // FETCH: Recupera ordini solo per l'utente corrente (richiede RLS SELECT)
    const { data: ordini, error } = await supabase
        .from('ordini')
        .select(`*`)
        .eq('user_id', utenteCorrenteId) 
        .order('data_ordine', { ascending: false }); 

    if (error) {
        container.innerHTML = `<p style="color: red;">Errore nel recupero ordini: ${error.message}. Verifica Policy RLS SELECT sulla tabella ordini (auth.uid() = user_id).</p>`;
        return;
    }
    // ... (Logica di rendering della tabella ordini omessa per brevità)
    container.innerHTML = '<table><tr><th>N. Ordine</th><th>Stato</th></tr><tr><td>XX/0001</td><td>Completato</td></tr></table>'; // Placeholder
}

/**
 * Mostra la vista Preventivo (di default).
 */
function mostraVistaPreventivo() {
    // Mostra la griglia a 2 colonne e la galleria
    document.querySelector('.container').style.gridTemplateColumns = '2fr 1fr'; 
    document.getElementById('galleriaView').style.display = 'block'; 
    document.getElementById('sezioneCarrello').style.display = 'block'; 
    document.getElementById('ordiniCliente').style.display = 'none';
}

/**
 * Mostra la vista Ordini.
 */
function mostraVistaOrdini() {
    // Mostra la griglia a 1 colonna
    document.querySelector('.container').style.gridTemplateColumns = '1fr'; 
    
    // Nascondi i blocchi del Preventivo
    document.getElementById('galleriaView').style.display = 'none'; 
    document.getElementById('sezioneCarrello').style.display = 'none';
    
    // Mostra la sezione Ordini e carica i dati
    document.getElementById('ordiniCliente').style.display = 'block'; 
    caricaMieiOrdini();
}

/**
 * Gestisce il logout.
 */
async function handleLogout() {
    if (!confirm("Sei sicuro di voler uscire?")) { return; }
    const { error } = await supabase.auth.signOut();
    if (error) { console.error('Errore durante il logout:', error); } 
    else {
        localStorage.removeItem('carrello'); 
        window.location.href = 'index.html'; 
    }
}


// ===========================================
// INIZIALIZZAZIONE & EVENT LISTENERS
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
    
    const isLogged = await verificaCliente();
    
    if (isLogged) {
        
        // ASSEGNAZIONE EVENTI FONDAMENTALI
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
        document.getElementById('aggiungiBandiera').addEventListener('click', gestisciAggiuntaAlCarrello);
        document.getElementById('richiediPreventivo').addEventListener('click', gestisciCheckout);
        
        // Listener per "I Miei Ordini" (SWAP VISTA)
        document.getElementById('mieiOrdiniBtn').addEventListener('click', (e) => {
            e.preventDefault();
            mostraVistaOrdini();
        });
        
        // Listener per il pulsante Home (torna alla vista Preventivo/Galleria)
        document.querySelector('.nav a[href="index.html"]').addEventListener('click', (e) => {
             // Se l'utente clicca HOME, lo riportiamo alla vista Preventivo
             if (document.getElementById('ordiniCliente').style.display !== 'none') {
                 e.preventDefault();
                 mostraVistaPreventivo();
             }
             // Se era già sulla vista preventivo, lascia che l'HTML lo reindirizzi
        });

        // Carica la UI all'inizio
        aggiornaUIPreventivo();
        mostraVistaPreventivo();
    }
});
