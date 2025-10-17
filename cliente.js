// ===========================================
// CONFIGURAZIONE SUPABASE
// ===========================================
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let utenteCorrenteId = null; 
let carrello = JSON.parse(localStorage.getItem('carrello')) || [];


// ===========================================
// FUNZIONI DI BASE CLIENTE (Verifica e Logout)
// ===========================================

/**
 * Verifica se l'utente è loggato e imposta l'ID utente.
 */
async function verificaCliente() {
    if (!supabase) { console.error("Supabase non inizializzato."); return false; }
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = 'login.html'; 
        return false;
    }
    
    utenteCorrenteId = user.id;

    // Carica il profilo per mostrare il nome/email
    const { data: profilo } = await supabase
        .from('utenti')
        .select('ragione_sociale') 
        .eq('id', user.id)
        .single();
    
    // Aggiorna l'header per mostrare l'utente loggato (con fallback al nome utente)
    const logoElement = document.querySelector('.logo');
    if (logoElement) {
        logoElement.innerHTML = `<img src="icon-192.png" alt="Logo Tessitore" style="height: 40px; vertical-align: middle;"> Cliente: ${profilo?.ragione_sociale || user.email}`;
    }
    return true; 
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
// GESTIONE CARRELLO (LOGICA)
// (Le funzioni aggiungi/calcola/rimuovi/aggiornaUIProvengono dal tuo file)
// ... (omesso per brevità) ...


// ===========================================
// NUOVA FUNZIONE DI UTILITY (GENERAZIONE N. ORDINE)
// ===========================================

/**
 * Genera un numero d'ordine progressivo (YY/XXXX) leggendo l'ultimo dal DB.
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


// ===========================================
// LOGICA ACQUISTO, CHECKOUT, e AGGIUNGI AL CARRELLO
// (Le funzioni gestisciAggiuntaAlCarrello, gestisciCheckout provengono dal tuo file)
// ... (omesso per brevità) ...
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

async function gestisciCheckout() {
    // Logica di checkout (omessa per brevità, vedi il tuo codice originale)
    const numeroOrdineGenerato = await generaNumeroOrdineTemporaneo();
    alert(`Ordine/Preventivo ${numeroOrdineGenerato} inviato con successo!`);
}


// ===========================================
// FUNZIONALITÀ ORDINI CLIENTE (FIX)
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
    
    // FETCH: Recupera ordini solo per l'utente corrente
    const { data: ordini, error } = await supabase
        .from('ordini')
        .select(`*`)
        .eq('user_id', utenteCorrenteId) // FILTRO ESSENZIALE
        .order('data_ordine', { ascending: false }); 

    if (error) {
        container.innerHTML = `<p style="color: red;">Errore nel recupero ordini: ${error.message}. Verifica Policy RLS SELECT sulla tabella ordini (auth.uid() = user_id).</p>`;
        return;
    }

    if (ordini.length === 0) {
        container.innerHTML = '<p>Non hai ancora effettuato ordini.</p>';
        return;
    }

    // Qui va la logica di rendering della tabella (come in admin.js ma semplificata)
    let html = `<table><thead><tr>
        <th>N. Ordine</th><th>Data</th><th>Totale</th><th>Stato</th><th>Dettagli</th>
        </tr></thead><tbody>`;
    
    ordini.forEach(ordine => {
        // N. Ordine (progressivo o UUID troncato)
        const numeroOrdine = ordine.num_ordine_prog 
            ? ordine.num_ordine_prog 
            : ordine.id.substring(0, 8).toUpperCase(); 
        
        html += `
            <tr data-id="${ordine.id}">
                <td>${numeroOrdine}</td> 
                <td>${new Date(ordine.data_ordine).toLocaleString()}</td>
                <td>€ ${ordine.totale ? ordine.totale.toFixed(2) : '0.00'}</td>
                <td><span class="stato-ordine stato-${ordine.stato.replace(/\s/g, '-')}">${ordine.stato}</span></td>
                <td>
                    <button onclick="mostraDettagliOrdine('${ordine.id}', '${JSON.stringify(ordine.dettagli_prodotti).replace(/"/g, '&quot;')}')" class="btn-primary" style="padding: 5px 10px;">Vedi Dettagli</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * Mostra i dettagli dell'ordine (Alert).
 */
function mostraDettagliOrdine(ordineId, dettagliProdottiString) {
    // Funzione dettagli omessa per brevità
    alert('Dettagli ordine ' + ordineId.substring(0, 8) + ' visualizzati.');
}


// ===========================================
// LOGICA DI SWITCH VISTE (FIX)
// ===========================================

/**
 * Mostra la vista Preventivo (di default).
 */
function mostraVistaPreventivo() {
    document.querySelector('.container').style.gridTemplateColumns = '2fr 1fr'; 
    document.getElementById('galleriaView').style.display = 'block'; 
    document.getElementById('sezioneCarrello').style.display = 'block'; 
    document.getElementById('ordiniCliente').style.display = 'none';
}

/**
 * Mostra la vista Ordini.
 */
function mostraVistaOrdini() {
    document.querySelector('.container').style.gridTemplateColumns = '1fr'; 
    
    document.getElementById('galleriaView').style.display = 'none'; 
    document.getElementById('sezioneCarrello').style.display = 'none';
    
    document.getElementById('ordiniCliente').style.display = 'block'; 
    caricaMieiOrdini();
}


// ===========================================
// INIZIALIZZAZIONE & EVENT LISTENERS
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
    
    const isLogged = await verificaCliente();
    
    if (isLogged) {
        
        // 1. ASSEGNAZIONE EVENTI FONDAMENTALI
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
        document.getElementById('aggiungiBandiera').addEventListener('click', gestisciAggiuntaAlCarrello);
        document.getElementById('richiediPreventivo').addEventListener('click', gestisciCheckout);
        
        // 2. Listener per "I Miei Ordini" (SWAP VISTA)
        document.getElementById('mieiOrdiniBtn').addEventListener('click', (e) => {
            e.preventDefault();
            mostraVistaOrdini();
        });
        
        // 3. Listener per la Home (torna alla vista Preventivo/Galleria)
        document.querySelector('.nav a[href="index.html"]').addEventListener('click', (e) => {
             // Intercetta il click su Home per tornare alla vista Preventivo (non ricaricare tutta la pagina)
             if (document.getElementById('ordiniCliente').style.display !== 'none') {
                 e.preventDefault();
                 mostraVistaPreventivo();
             }
        });

        // 4. Carica la UI all'inizio
        aggiornaUIPreventivo();
        mostraVistaPreventivo();
    }
});
