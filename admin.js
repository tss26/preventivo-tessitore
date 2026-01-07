// ===========================================
// CONFIGURAZIONE SUPABASE
// ===========================================

const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 

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

// VARIABILE GLOBALE PER IL FILTRAGGIO
let allOrders = []; 

// ===========================================
// FUNZIONI DI BASE ADMIN (Corrette con 'permessi')
// ===========================================

/**
 * 1. Verifica se l'utente è loggato e se ha i 'permessi' di 'admin'.
 */
async function verificaAdmin() {
    if (!supabase) { console.error("Supabase non inizializzato."); return false; }
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        alert('Accesso negato. Effettua il login.');
        window.location.href = 'login.html'; 
        return false;
    }

    // Carica il profilo dalla tabella 'utenti' per verificare il campo 'permessi'
    const { data: profilo, error } = await supabase
        .from('utenti')
        .select('permessi, ragione_sociale') 
        .eq('id', user.id)
        .single();

    if (error || !profilo || profilo.permessi !== 'admin') { 
        alert('Accesso negato. Permessi insufficienti (Non sei un amministratore).');
        window.location.href = 'cliente.html'; 
        return false;
    }

    document.querySelector('.logo').textContent = `Admin: ${profilo.ragione_sociale || user.email}`;

    return true; 
}

// ===========================================
// FUNZIONALITÀ ORDINI (Con N. Ordine leggibile e Nome Cliente)
// ===========================================

/**
 * 2. Recupera tutti gli ordini, li salva e ne avvia la visualizzazione.
 */
async function caricaOrdini() { 
    const container = document.getElementById('ordiniLista');
    container.innerHTML = '<h2>Caricamento ordini in corso...</h2>';
    
    // Recupera ordini e i dati del cliente correlato (JOIN su utente)
    const { data: ordini, error } = await supabase
        .from('ordini')
        .select(`
            *,
            utente:utenti(ragione_sociale, partita_iva)
        `)
        .order('data_ordine', { ascending: false }); 

    if (error) {
        container.innerHTML = `<p style="color: red;">Errore nel recupero ordini: ${error.message}.</p>`;
        return;
    }

    // Salva i dati originali
    allOrders = ordini || []; 
    
    // Visualizza la lista completa applicando eventuali filtri già presenti
    applyFilters(); 
}

/**
 * Funzione di utilità per disegnare la tabella degli ordini
 */
function renderOrderList(ordiniDaVisualizzare) { 
    const container = document.getElementById('ordiniLista');
    
    if (ordiniDaVisualizzare.length === 0) {
        container.innerHTML = '<h2>Nessun ordine trovato con i filtri applicati.</h2>';
        return;
    }

    // Header Tabella
    let html = `<div class="admin-table">
        <table><thead><tr>
        <th>N. Ordine</th><th>Account</th><th>Riferimento</th><th>P. IVA</th><th>Data</th><th>Totale</th><th>Stato</th><th>Azioni</th>
        </tr></thead><tbody>`;
    
    ordiniDaVisualizzare.forEach(ordine => {
        const dettagliProdotti = JSON.stringify(ordine.dettagli_prodotti).replace(/"/g, '&quot;');
        
        // Calcolo del numero ordine leggibile
        const numeroOrdine = ordine.num_ordine_prog 
            ? ordine.num_ordine_prog 
            : ordine.id.substring(0, 8).toUpperCase(); 

        // Nome dell'account registrato (chi ha fatto il login)
        const nomeUtenteDB = ordine.utente?.ragione_sociale; 
        const accountNome = (nomeUtenteDB && nomeUtenteDB.trim() !== '') 
            ? nomeUtenteDB 
            : 'ID: ' + (ordine.user_id ? ordine.user_id.substring(0, 8) : 'N/D'); 
        
        const clientePiva = (ordine.utente && ordine.utente.partita_iva) || 'N/D';

        // --- Estrazione del Riferimento (Nome inserito nel carrello) ---
        let riferimentoCliente = "---";
        if (ordine.dettagli_prodotti && Array.isArray(ordine.dettagli_prodotti)) {
            const info = ordine.dettagli_prodotti.find(d => d.tipo === 'INFO_CLIENTE');
            if (info && info.cliente) {
                riferimentoCliente = info.cliente;
            }
        }
        // --------------------------------------------------------------------------
        
        html += `
            <tr data-id="${ordine.id}">
                <td>${numeroOrdine}</td> 
                <td>${accountNome}</td>
                <td style="font-weight:bold; color:#007bff;">${riferimentoCliente}</td>
                <td>${clientePiva}</td>
                <td>${new Date(ordine.data_ordine).toLocaleString()}</td>
                <td>€ ${ordine.totale ? ordine.totale.toFixed(2) : '0.00'}</td>
                <td>
                    <select class="stato-select" data-id="${ordine.id}">
                        <option value="Richiesta Inviata" ${ordine.stato === 'Richiesta Inviata' ? 'selected' : ''}>Richiesta Inviata</option>
                        <option value="Attesa Pagamento" ${ordine.stato === 'Attesa Pagamento' ? 'selected' : ''}>Attesa Pagamento</option>
                        <option value="Convalida Commerciale" ${ordine.stato === 'Convalida Commerciale' ? 'selected' : ''}>Convalida Commerciale</option>
                        <option value="In attesa di lavorazione" ${ordine.stato === 'In attesa di lavorazione' ? 'selected' : ''}>In attesa di lavorazione</option>
                        <option value="In lavorazione" ${ordine.stato === 'In lavorazione' ? 'selected' : ''}>In lavorazione</option>
                        <option value="Stampato" ${ordine.stato === 'Stampato' ? 'selected' : ''}>Stampato</option>
                        <option value="Completato" ${ordine.stato === 'Completato' ? 'selected' : ''}>Completato</option>
                        <option value="Spedito" ${ordine.stato === 'Spedito' ? 'selected' : ''}>Spedito</option>
                        <option value="Annullato" ${ordine.stato === 'Annullato' ? 'selected' : ''}>Annullato</option>
                    </select>
                </td>
                <td>
                    <button onclick="mostraDettagli('${ordine.id}', '${dettagliProdotti}', '${numeroOrdine}', ${ordine.totale || 0})" class="btn-primary" style="padding: 5px 10px;">Vedi Dettagli</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    
    document.querySelectorAll('.stato-select').forEach(select => {
        select.addEventListener('change', (e) => aggiornaStatoOrdine(e.target.dataset.id, e.target.value));
    });
}


/**
 * Applica i filtri (testo, stato, data) all'array allOrders e ridisegna la lista.
 */
function applyFilters() { 
    const ricercaTesto = document.getElementById('ricercaTesto')?.value.toLowerCase().trim() || '';
    const filtroStato = document.getElementById('filtroStato')?.value || '';
    const dataInizio = document.getElementById('filtroDataInizio')?.value;
    const dataFine = document.getElementById('filtroDataFine')?.value;

    let ordiniFiltrati = allOrders.filter(ordine => { 
        let matchTesto = true;
        let matchStato = true;
        let matchData = true;

        // 1. Filtro Testuale (N. Ordine, ID, Ragione Sociale, RIFERIMENTO)
        if (ricercaTesto) {
            const numeroOrdine = String(ordine.num_ordine_prog || '').toLowerCase(); 
            const idOrdineTroncato = ordine.id ? ordine.id.substring(0, 8).toLowerCase() : '';
            const nomeClienteDB = ordine.utente?.ragione_sociale ? ordine.utente.ragione_sociale.toLowerCase() : '';
            
            // Logica Riferimento (dal JSON)
            let riferimento = "";
            if (ordine.dettagli_prodotti && Array.isArray(ordine.dettagli_prodotti)) {
                const info = ordine.dettagli_prodotti.find(i => i.tipo === 'INFO_CLIENTE');
                if (info && info.cliente) riferimento = info.cliente.toLowerCase();
            }
            
            matchTesto = numeroOrdine.includes(ricercaTesto) || 
                         idOrdineTroncato.includes(ricercaTesto) ||
                         nomeClienteDB.includes(ricercaTesto) ||
                         riferimento.includes(ricercaTesto);
        }

        // 2. Filtro per Stato
        if (filtroStato) {
            matchStato = ordine.stato === filtroStato;
        }

        // 3. Filtro Data
        const dataOrdine = new Date(ordine.data_ordine);
        if (dataInizio) {
            const dInizio = new Date(dataInizio);
            dInizio.setHours(0,0,0,0);
            if (dataOrdine < dInizio) matchData = false;
        }
        if (dataFine) {
            const dFine = new Date(dataFine);
            dFine.setHours(23,59,59,999);
            if (dataOrdine > dFine) matchData = false;
        }

        return matchTesto && matchStato && matchData;
    });

    renderOrderList(ordiniFiltrati);
}

/**
 * Resetta i campi di filtro e riesegue applyFilters.
 */
function resetFilters() { 
    const ricercaTesto = document.getElementById('ricercaTesto');
    const filtroStato = document.getElementById('filtroStato');
    const filtroDataInizio = document.getElementById('filtroDataInizio');
    const filtroDataFine = document.getElementById('filtroDataFine');
    
    if (ricercaTesto) ricercaTesto.value = '';
    if (filtroStato) filtroStato.value = '';
    if (filtroDataInizio) filtroDataInizio.value = '';
    if (filtroDataFine) filtroDataFine.value = '';
    
    applyFilters(); 
}


/**
 * 3. Aggiorna lo stato di un ordine nel DB.
 */
async function aggiornaStatoOrdine(ordineId, nuovoStato) {
    if (!confirm(`Confermi il cambio stato dell'ordine ${ordineId.substring(0, 8)} a "${nuovoStato}"?`)) {
        caricaOrdini(); 
        return;
    }
    
    const { error } = await supabase
        .from('ordini')
        .update({ stato: nuovoStato })
        .eq('id', ordineId);
    
    if (error) {
        alert(`Errore nell'aggiornamento dello stato: ${error.message}.`);
    } else {
        console.log(`Stato ordine ${ordineId} aggiornato a: ${nuovoStato}`);
        // Aggiorna array locale e riapplica i filtri
        const updatedOrders = allOrders.map(order => 
            order.id === ordineId ? { ...order, stato: nuovoStato } : order
        );
        allOrders = updatedOrders;
        applyFilters(); 
    }
}


/**
 * 4. Mostra i dettagli dell'ordine in un modale.
 */
function mostraDettagli(ordineId, dettagliProdottiString, numeroOrdineVisibile, totaleImponibile) {
    const dettagli = JSON.parse(dettagliProdottiString); 
    const modal = document.getElementById('orderDetailsModal');
    const modalBody = document.getElementById('modalOrderDetails');

    if (!modal || !modalBody) {
        console.error("Elementi modale non trovati!");
        return; 
    }

    // --- 1. GESTIONE TITOLO ---
    const h2Element = document.querySelector('#orderDetailsModal h2');
    if (numeroOrdineVisibile && numeroOrdineVisibile.includes('/')) {
        h2Element.innerHTML = `Numero Preventivo : <span style="color: #007bff;">${numeroOrdineVisibile}</span>`;
    } else {
        const label = numeroOrdineVisibile || ordineId.substring(0, 8).toUpperCase();
        h2Element.innerHTML = `Dettaglio Preventivo ID: <span style="color: #6c757d; font-size: 0.9em;">${label}</span>`;
    }

    let dettagliHtml = "";

    // --- 2. BOX BLU DATI CLIENTE ---
    const infoCliente = dettagli.find(d => d.tipo === 'INFO_CLIENTE');
    
    // Riferimento ID Database
    dettagliHtml += `<div style="font-size: 0.85em; color: #999; margin-bottom: 5px;">Rif. Database: ${ordineId}</div>`;

    if (infoCliente) {
        dettagliHtml += `<div style="background: #f1f8ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #cce5ff;">`;
        dettagliHtml += `<strong>Cliente / Rag. Soc.:</strong> ${infoCliente.cliente || '---'}<br>`;
        dettagliHtml += `<strong>Contatti:</strong> ${infoCliente.contatti || '---'}`;
        dettagliHtml += `</div>`;
        dettagliHtml += `----------------------------------------------------------\n\n`;
    }

    dettagliHtml += `DETTAGLI ARTICOLI:\n`;

    // --- 3. LISTA PRODOTTI ---
    dettagli.forEach(item => {
        if (item.tipo === 'INFO_CLIENTE') return;

        dettagliHtml += `\n--- ${item.prodotto} (${item.quantita} pz) ---\n`;
        
        if (item.componenti && Array.isArray(item.componenti) && item.componenti.length > 0) {
            dettagliHtml += `Componenti: ${item.componenti.join(', ')}\n`;
        }
        
        let pUnit = parseFloat(item.prezzo_unitario);
        if (isNaN(pUnit)) pUnit = 0;
