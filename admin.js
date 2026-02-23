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
// *** MODIFICA QUI: Variabili per la paginazione ***
let paginaCorrenteAdmin = 1;
let ordiniFiltratiCache = [];




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
    aggiornaConteggioDaEvadereAdmin();
    // Visualizza la lista completa applicando eventuali filtri già presenti
    applyFilters(); 
}

//inizio funzione che conta ordini da evadere sulla pagina admin--------------------------------------------
function aggiornaConteggioDaEvadereAdmin() {
    const countSpan = document.getElementById('countOrdiniDaEvadereAdmin');
    if (!countSpan) return;

    // Array con gli stati specifici da conteggiare
    const statiDaEvadere = [
        'Richiesta Inviata', 
        'In attesa di lavorazione', 
        'In lavorazione', 
        'Attesa Pagamento', 
        'Convalida Commerciale'
    ];

    // Filtriamo e contiamo solo gli ordini che hanno uno degli stati elencati
    const daEvadere = allOrders.filter(o => statiDaEvadere.includes(o.stato)).length;
    
    countSpan.textContent = daEvadere;
}
//----------------fine funzione che conta ordini da evadere ------------------------------------------------


/**
 * Funzione di utilità per disegnare la tabella degli ordini
 */
// Funzione globale per cambiare pagina
window.cambiaPaginaAdmin = function(delta) {
    paginaCorrenteAdmin += delta;
    renderOrderList(ordiniFiltratiCache, true); // true = non resettare la pagina
};

function renderOrderList(ordiniDaVisualizzare, mantieniPagina = false) { 
    const container = document.getElementById('ordiniLista');
    
    // Se è una nuova ricerca (non un cambio pagina), salviamo i dati e resettiamo a pag 1
    if (!mantieniPagina) {
        ordiniFiltratiCache = ordiniDaVisualizzare;
        paginaCorrenteAdmin = 1;
    }

    if (ordiniDaVisualizzare.length === 0) {
        container.innerHTML = '<h2>Nessun ordine trovato con i filtri applicati.</h2>';
        return;
    }

   let html = `<div class="admin-table">
        <table><thead><tr>
        <th>N. Ordine</th><th>Account</th><th>Riferimento</th><th>P. IVA</th><th>Data</th><th>Totale</th><th>Stato</th><th>Note</th><th>Azioni</th>
        </tr></thead><tbody>`;
    
    // Calcolo indici per la paginazione (30 per pagina)
    const inizio = (paginaCorrenteAdmin - 1) * 30;
    const fine = inizio + 30;
    const ordiniPagina = ordiniDaVisualizzare.slice(inizio, fine);

    ordiniPagina.forEach(ordine => {
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
                    <div id="nota-preview-${ordine.id}" 
         style="cursor:pointer; max-width:150px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#007bff; text-decoration:underline; font-size: 0.85em;"
         onclick="apriModaleNotaAdmin('${ordine.id}', \`${(ordine.note_condivise || '').replace(/\`/g, '\\`').replace(/\n/g, '\\n')}\`)">
        ${ordine.note_condivise ? ordine.note_condivise : '➕'}
                    </div>
                </td>

                
               
                <td style="display: flex; gap: 5px;">
                    <button onclick="preparaEApriDettagli('${ordine.id}')" class="btn-primary" style="padding: 5px 10px;">
                    Vedi Dettagli
                    </button>
                    
                    <button onclick="esportaOrdineXLSX('${ordine.id}')" style="padding: 5px 10px; background-color: #28a745; color: white; border: none; cursor: pointer; font-size: 0.85em; border-radius: 4px; display: flex; align-items: center; gap: 4px;">
                    📊 Esporta XLSX
                    </button>
                </td>   
                
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';

    // *** MODIFICA QUI: Aggiunta Bottoni Paginazione ***
    const totPagine = Math.ceil(ordiniDaVisualizzare.length / 30);
    html += `
    <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 15px;">
        <button onclick="cambiaPaginaAdmin(-1)" class="btn-secondary" ${paginaCorrenteAdmin === 1 ? 'disabled' : ''} style="padding: 5px 15px;">⬅️ Precedenti</button>
        <span style="font-weight: bold;">Pagina ${paginaCorrenteAdmin} di ${totPagine || 1} (Tot. ${ordiniDaVisualizzare.length} ordini)</span>
        <button onclick="cambiaPaginaAdmin(1)" class="btn-secondary" ${paginaCorrenteAdmin >= totPagine ? 'disabled' : ''} style="padding: 5px 15px;">Successivi ➡️</button>
    </div>`;

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
        aggiornaConteggioDaEvadereAdmin();
        applyFilters(); 
    }
}



/**
 * Mostra i dettagli dell'ordine in un modale includendo la tabella per Excel,
 * i file allegati, i totali e la funzione di stampa.
 
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

   
    // --- 3. BOX BLU DATI CLIENTE ---
    const infoCliente = dettagli.find(d => d.tipo === 'INFO_CLIENTE');
    dettagliHtml += `<div style="font-size: 0.85em; color: #999; margin-bottom: 5px;">Rif. Database: ${ordineId}</div>`;

    if (infoCliente) {
        dettagliHtml += `<div style="background: #f1f8ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #cce5ff;">`;
        dettagliHtml += `<strong>Cliente / Rag. Soc.:</strong> ${infoCliente.cliente || '---'}<br>`;
        dettagliHtml += `<strong>Contatti:</strong> ${infoCliente.contatti || '---'}`;
        dettagliHtml += `</div>`;
        dettagliHtml += `----------------------------------------------------------<br><br>`;
    }

    dettagliHtml += `<strong>DETTAGLI ARTICOLI COMPLETI:</strong><br>`;

    // --- 4. LISTA PRODOTTI E ALLEGATI ---
    dettagli.forEach(item => {
        if (item.tipo === 'INFO_CLIENTE') return;

        dettagliHtml += `<br><strong>--- ${item.prodotto} (${item.quantita} pz) ---</strong><br>`;
        
        if (item.componenti && Array.isArray(item.componenti) && item.componenti.length > 0) {
            dettagliHtml += `Componenti: ${item.componenti.join(', ')}<br>`;
        }
        
        let pUnit = parseFloat(item.prezzo_unitario);
        if (isNaN(pUnit)) pUnit = 0;
        dettagliHtml += `Prezzo netto cad.: € ${pUnit.toFixed(2)}<br>`;
  
        if (item.dettagli_taglie && Object.keys(item.dettagli_taglie).length > 0) {
            dettagliHtml += `Dettagli Taglie:<br>`;
            for (const genere in item.dettagli_taglie) {
                const taglie = Object.entries(item.dettagli_taglie[genere])
                    .map(([taglia, qty]) => `${taglia}: ${qty}`)
                    .join(', ');
                dettagliHtml += `&nbsp;&nbsp;- ${genere}: ${taglie}<br>`;
            }
        }
        
        if (item.note && item.note.trim() !== '') {
            dettagliHtml += `Note: ${item.note}<br>`;
        }

        if (item.personalizzazione_url && item.personalizzazione_url !== 'Nessun file collegato direttamente.') {
           dettagliHtml += `<span style="color: #d63384; font-weight:bold;">📎 File Allegato:</span> <a href="${item.personalizzazione_url}" target="_blank" style="color: #007bff; text-decoration: underline;">Apri Allegato</a><br>`;
        }
    });

    // --- 5. FOOTER E TOTALI ---
    dettagliHtml += '<br>-----------------------------------------------------------------------------------------<br>'; 
    dettagliHtml += 'Per procedere con l\'ordine effettuare Bonifico intestato a : Tessitore s.r.l.<br>';
    dettagliHtml += 'BANCA : SELLA  IBAN : IT56 O032 6804 6070 5227 9191 820<br>';

    const ivaRate = 0.22; 
    let totaleImponibileNumerico = parseFloat(totaleImponibile) || 0; 
    
    if (totaleImponibileNumerico > 0) {
        const ivaDovuta = totaleImponibileNumerico * ivaRate;
        const totaleFinale = totaleImponibileNumerico + ivaDovuta;
        
        dettagliHtml += `<br>-------------------------------------------------------------------------<br>`;
        dettagliHtml += `<strong>TOTALE IMPONIBILE (Netto): € ${totaleImponibileNumerico.toFixed(2)}</strong>`;
        dettagliHtml += `<br>IVA (22%): € ${ivaDovuta.toFixed(2)}`;
        dettagliHtml += `<br><span style="font-size: 1.2em; color: #28a745;"><strong>TOTALE DOVUTO (IVA Incl.): € ${totaleFinale.toFixed(2)}</strong></span><br>`;
        dettagliHtml += `-------------------------------------------------------------------------<br>`;
    }

    modalBody.innerHTML = dettagliHtml;

    // --- 6. TASTO STAMPA ---
    let btnStampa = document.getElementById('btnStampaOrdine');
    if (!btnStampa) {
        btnStampa = document.createElement('button');
        btnStampa.id = 'btnStampaOrdine'; 
        btnStampa.textContent = '🖨️ Stampa Ordine';
        btnStampa.style.marginTop = '15px';
        btnStampa.style.padding = '10px 20px';
        btnStampa.style.backgroundColor = '#6c757d'; 
        btnStampa.style.color = 'white';
        btnStampa.style.border = 'none';
        btnStampa.style.borderRadius = '5px';
        btnStampa.style.cursor = 'pointer';
        btnStampa.style.fontSize = '1rem';
        btnStampa.style.float = 'right'; 
        
        btnStampa.onclick = function() {
            window.print();
        };
        modalBody.parentNode.insertBefore(btnStampa, modalBody.nextSibling);
    }

    modal.style.display = 'block';
}--------------------------------------------------------------------------------------------------------*/


/**
 * Mostra i dettagli dell'ordine in un modale (Versione Finale: Logo + Stampa Full Width A4)
 */
function mostraDettagli(ordineId, dettagliProdottiString, numeroOrdineVisibile, totaleImponibile) {
    const dettagli = JSON.parse(dettagliProdottiString); 
    const modal = document.getElementById('orderDetailsModal');
    const modalBody = document.getElementById('modalOrderDetails');

    if (!modal || !modalBody) {
        console.error("Elementi modale non trovati!");
        return; 
    }

    // --- 0. FIX IMPORTANTE PER IL LAYOUT ---
    modalBody.style.whiteSpace = 'normal'; 

    // --- 1. GESTIONE TITOLO CON LOGO ---
    const h2Element = document.querySelector('#orderDetailsModal h2');
    // HTML del logo (usa l'icona presente nel progetto)
    const logoHtml = `<img src="icon-192.png" alt="Logo" style="height: 45px; vertical-align: middle; margin-right: 15px;">`;

    if (numeroOrdineVisibile && numeroOrdineVisibile.includes('/')) {
        h2Element.innerHTML = `${logoHtml}Numero Preventivo : <span style="color: #007bff;">${numeroOrdineVisibile}</span>`;
    } else {
        const label = numeroOrdineVisibile || ordineId.substring(0, 8).toUpperCase();
        h2Element.innerHTML = `${logoHtml}Dettaglio Preventivo ID: <span style="color: #6c757d; font-size: 0.9em;">${label}</span>`;
    }

    let dettagliHtml = "";

    // --- INIEZIONE STILE STAMPA FULL WIDTH (Risolve i bordi bianchi) ---
    dettagliHtml += `
    <style>
        @media print {
            @page { 
                margin: 0.5cm; /* Riduce i margini del foglio */
            }
            body * { 
                visibility: hidden; 
            }
            #orderDetailsModal, #orderDetailsModal * { 
                visibility: visible; 
            }
            #orderDetailsModal {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 0;
                background: white;
            }
            /* FORZA LA LARGHEZZA AL 100% */
            .modal-content {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                box-shadow: none !important;
            }
            #modalOrderDetails {
                border: none !important;
            }
            /* Nasconde bottoni inutili in stampa */
            .close-button, #btnStampaOrdine, button { 
                display: none !important; 
            }
        }
    </style>
    `;

    // --- 2. BOX BLU DATI CLIENTE ---
    dettagliHtml += `<div style="font-size: 0.85em; color: #999; margin-bottom: 5px;">Rif. Database: ${ordineId}</div>`;

    const infoCliente = dettagli.find(d => d.tipo === 'INFO_CLIENTE');
    if (infoCliente) {
        dettagliHtml += `<div style="background: #f1f8ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #cce5ff;">`;
        dettagliHtml += `<strong>Cliente / Rag. Soc.:</strong> ${infoCliente.cliente || '---'}<br>`;
        dettagliHtml += `<strong>Contatti:</strong> ${infoCliente.contatti || '---'}`;
        dettagliHtml += `</div>`;
    }

    // --- 3. TABELLA PRODOTTI ---
    dettagliHtml += `<h4 style="margin:0 0 10px 0; color:#007bff; text-align:left;">📋 Dettaglio Articoli Preventivo</h4>`;
    
    dettagliHtml += `<div style="overflow-x:auto;">
    <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-family:inherit; table-layout: fixed;">
        <thead>
            <tr style="background-color:#e9ecef; color:#495057;">
                <th style="padding:10px; text-align:left; border:1px solid #dee2e6; width: 50%;">Articolo & Specifiche</th>
                <th style="padding:10px; text-align:center; border:1px solid #dee2e6; width: 10%;">Qtà</th>
                <th style="padding:10px; text-align:right; border:1px solid #dee2e6; width: 20%;">Prezzo</th>
                <th style="padding:10px; text-align:center; border:1px solid #dee2e6; width: 20%;">Allegato</th>
            </tr>
        </thead>
        <tbody>`;

    dettagli.forEach(item => {
        if (item.tipo === 'INFO_CLIENTE') return;

        let specs = '';
        if (item.componenti && item.componenti.length > 0) specs += `<div style="font-size:0.85em; margin-top:3px; color:#555; text-align:left;">🔹 ${item.componenti.join('<br>🔹 ')}</div>`;
        
        if (item.dettagli_taglie && Object.keys(item.dettagli_taglie).length > 0) {
            specs += `<div style="font-size:0.85em; margin-top:3px; color:#007bff; text-align:left;"><strong>Taglie:</strong> `;
            for (const g in item.dettagli_taglie) {
                const t = Object.entries(item.dettagli_taglie[g]).map(([k,v])=>`${k}:${v}`).join(' ');
                specs += `${g} [${t}] `;
            }
            specs += `</div>`;
        }

        if (item.note) specs += `<div style="font-size:0.85em; margin-top:3px; color:#dc3545; text-align:left;"><em>Note: ${item.note}</em></div>`;

        let fileCell = '<span style="color:#ccc;">-</span>';
        if (item.personalizzazione_url && item.personalizzazione_url.includes('http')) {
            fileCell = `<a href="${item.personalizzazione_url}" target="_blank" style="display:inline-block; padding:5px 10px; background:#007bff; color:white; border-radius:4px; text-decoration:none; font-weight:bold; font-size:0.8em; white-space:nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">📥</a>`;
        }

        let pUnit = parseFloat(item.prezzo_unitario) || 0;

        dettagliHtml += `
            <tr>
                <td style="padding:10px; border:1px solid #dee2e6; vertical-align:top; text-align:left; word-wrap: break-word;">
                    <div style="font-weight:bold; color:#333;">${item.prodotto}</div>
                    ${specs}
                </td>
                <td style="padding:10px; border:1px solid #dee2e6; text-align:center; vertical-align:top; font-weight:bold;">${item.quantita}</td>
                <td style="padding:10px; border:1px solid #dee2e6; text-align:right; vertical-align:top; white-space: nowrap;">€ ${pUnit.toFixed(2)}</td>
                <td style="padding:10px; border:1px solid #dee2e6; text-align:center; vertical-align:top;">${fileCell}</td>
            </tr>`;
    });

    dettagliHtml += `</tbody></table></div>`;

    // --- 4. FOOTER E TOTALI ---
    dettagliHtml += '<br><div style="border-top:1px dashed #ccc; margin-top:10px; padding-top:10px;">'; 
    dettagliHtml += 'Per procedere con l\'ordine effettuare Bonifico intestato a : Tessitore s.r.l.<br>';
    dettagliHtml += 'BANCA : SELLA  IBAN : IT56 O032 6804 6070 5227 9191 820</div>';

    const ivaRate = 0.22; 
    let totaleImponibileNumerico = parseFloat(totaleImponibile) || 0; 
    
    if (totaleImponibileNumerico > 0) {
        const ivaDovuta = totaleImponibileNumerico * ivaRate;
        const totaleFinale = totaleImponibileNumerico + ivaDovuta;
        
        dettagliHtml += `<div style="border-top:2px solid #333; margin-top:10px; padding-top:10px; text-align:right;">`;
        dettagliHtml += `<strong>TOTALE IMPONIBILE (Netto):</strong> € ${totaleImponibileNumerico.toFixed(2)}<br>`;
        dettagliHtml += `<strong>IVA (22%):</strong> € ${ivaDovuta.toFixed(2)}<br>`;
        dettagliHtml += `<strong style="font-size:1.2em; color:#28a745;">TOTALE DOVUTO (IVA Incl.): € ${totaleFinale.toFixed(2)}</strong>`;
        dettagliHtml += `</div>`;
    }

    modalBody.innerHTML = dettagliHtml;

    // --- 5. TASTO STAMPA ---
    let btnStampa = document.getElementById('btnStampaOrdine');
    if (!btnStampa) {
        btnStampa = document.createElement('button');
        btnStampa.id = 'btnStampaOrdine'; 
        btnStampa.textContent = '🖨️ Stampa Ordine';
        
        btnStampa.style.marginTop = '15px';
        btnStampa.style.padding = '10px 20px';
        btnStampa.style.backgroundColor = '#6c757d'; 
        btnStampa.style.color = 'white';
        btnStampa.style.border = 'none';
        btnStampa.style.borderRadius = '5px';
        btnStampa.style.cursor = 'pointer';
        btnStampa.style.fontSize = '1rem';
        btnStampa.style.float = 'right'; 
        
        btnStampa.onclick = function() {
            window.print();
        };
        modalBody.parentNode.insertBefore(btnStampa, modalBody.nextSibling);
    }

    modal.style.display = 'block';
}










/**
 * Funzione helper per copiare la tabella negli appunti
 */
window.copyTableToClipboard = function() {
    const table = document.getElementById('tableToCopy');
    if (!table) return;
    
    const range = document.createRange();
    range.selectNode(table);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    
    try {
        document.execCommand('copy');
        alert('Dati copiati correttamente! Ora puoi incollarli su Excel.');
    } catch (err) {
        alert('Impossibile copiare i dati automaticamente.');
    }
    
    window.getSelection().removeAllRanges();
};


















/**
 * Gestisce il logout.
 */
async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Errore logout:', error);
    window.location.href = 'index.html'; 
}


// ===========================================
// INIZIALIZZAZIONE E PROTEZIONE
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    const isAdmin = await verificaAdmin();

    if (isAdmin) {
        
        // --- EVENT LISTENERS FILTRI ---
        const applicaBtn = document.getElementById('applicaFiltriBtn');
        const resetBtn = document.getElementById('resetFiltriBtn');
        const ricercaInput = document.getElementById('ricercaTesto');
        const statoSelect = document.getElementById('filtroStato');

        if (applicaBtn) applicaBtn.addEventListener('click', applyFilters);
        if (resetBtn) resetBtn.addEventListener('click', resetFilters);
        if (statoSelect) statoSelect.addEventListener('change', applyFilters);
        
        if (ricercaInput) {
            ricercaInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') applyFilters();
            });
        }

        // --- GESTIONE MODALE ORDINI ---
        const modal = document.getElementById('orderDetailsModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        
        if (closeModalBtn && modal) {
            closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; });
            window.addEventListener('click', (event) => {
                if (event.target === modal) modal.style.display = 'none';
            });
        }

        caricaOrdini();
        
        // ===========================================
        // GESTIONE MODALE UTENTI
        // ===========================================
        const saveBtn = document.getElementById('saveUserChangesBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveUserChanges);
        }

        const userEditModal = document.getElementById('userEditModal');
        window.addEventListener('click', (event) => {
            if (event.target === userEditModal) {
                userEditModal.style.display = 'none';
            }
        });
        
        const sameMerceCheckbox = document.getElementById('editUserStessoMerce');
        if (sameMerceCheckbox) {
             sameMerceCheckbox.addEventListener('change', (e) => toggleMerceAddressFields(e.target.checked));
        }

        // Avvia la sezione Ordini
        showSection('orders');
    }
});



// ===========================================
// FUNZIONALITÀ UTENTI E PERMESSI
// ===========================================

let allUsers = []; 

//---------------inizio gestione per aggiunzione sconto --------------------
// CONFIGURAZIONE SOGLIE SCONTI
const PREMI_TIERS = [
    { soglia: 500,   sconto: 1 },
    { soglia: 750,   sconto: 1.5 },
    { soglia: 1500,  sconto: 3 },
    { soglia: 2500,  sconto: 3.5 },
    { soglia: 5000,  sconto: 5 },
    { soglia: 10000, sconto: 5 } 
];

/**
 * CALCOLO SCONTI MENSILI (Versione "Reset Totale")
 * 1. Analizza il fatturato del mese scorso.
 * 2. Assegna lo sconto a chi lo merita.
 * 3. RIMUOVE lo sconto (imposta a 0) a chi non ha raggiunto soglie.
 */
async function elaboraScontiMeseScorso() {
    // --- A. GESTIONE DATE (Mese Scorso) ---
    const oggi = new Date();
    // Primo giorno del mese corrente (es. 1 Febbraio)
    const primoQuestoMese = new Date(oggi.getFullYear(), oggi.getMonth(), 1);
    // Primo giorno del mese scorso (es. 1 Gennaio)
    const primoMeseScorso = new Date(oggi.getFullYear(), oggi.getMonth() - 1, 1);
    
    // Stringhe ISO per Supabase
    const dataInizio = primoMeseScorso.toISOString();
    const dataFine = primoQuestoMese.toISOString();
    
    // Nome leggibile (es. "gennaio 2025")
    const nomeMeseScorso = primoMeseScorso.toLocaleString('it-IT', { month: 'long', year: 'numeric' });

    if (!confirm(`⚠️ ATTENZIONE ⚠️\n\nStai per ricalcolare gli sconti basandoti sugli ordini di ${nomeMeseScorso.toUpperCase()}.\n\nQuesta operazione:\n1. Assegnerà nuovi sconti a chi ha raggiunto le soglie.\n2. AZZERERÀ lo sconto a chi non ha raggiunto il budget minimo.\n\nVuoi procedere?`)) {
        return;
    }

    const btn = document.getElementById('btnCalcolaSconti');
    if(btn) { btn.disabled = true; btn.textContent = "⏳ Elaborazione in corso..."; }

    try {
        console.log(`Inizio elaborazione sconti per: ${nomeMeseScorso}`);

        // --- B. RECUPERA TUTTI GLI UTENTI ATTIVI ---
        // Ci serve la lista completa per poter azzerare chi non ha comprato nulla
        const { data: tuttiUtenti, error: errUtenti } = await supabase
            .from('utenti')
            .select('id, ragione_sociale')
            .neq('permessi', 'admin'); // Escludiamo gli admin se vuoi, o rimuovi questa riga

        if (errUtenti) throw new Error("Errore recupero utenti: " + errUtenti.message);

        // --- C. RECUPERA GLI ORDINI DEL MESE SCORSO ---
        const { data: ordini, error: errOrdini } = await supabase
            .from('ordini')
            .select('user_id, totale')
            .gte('data_ordine', dataInizio)
            .lt('data_ordine', dataFine)
            // Consideriamo validi solo ordini confermati/pagati (modifica gli stati se necessario)
            .or('stato.eq.Completato,stato.eq.Spedito,stato.eq.Consegnato,stato.eq.In lavorazione,stato.eq.Stampato');

        if (errOrdini) throw new Error("Errore recupero ordini: " + errOrdini.message);

        // --- D. CALCOLA TOTALE PER OGNI UTENTE ---
        // Mappa: { "id_utente": 1500.00, "altro_id": 200.00 }
        const mappaFatturato = {};
        if (ordini) {
            ordini.forEach(o => {
                if (!mappaFatturato[o.user_id]) mappaFatturato[o.user_id] = 0;
                mappaFatturato[o.user_id] += (o.totale || 0);
            });
        }

        // --- E. CICLO SU TUTTI GLI UTENTI E UPDATE ---
        let contatoreAggiornati = 0;
        let contatoreAzzerati = 0;

        for (const utente of tuttiUtenti) {
            const fatturato = mappaFatturato[utente.id] || 0; // Se non c'è in mappa, è 0
            
            // Calcola il tier
            let nuovoSconto = 0;
            PREMI_TIERS.forEach(tier => {
                if (fatturato >= tier.soglia) {
                    nuovoSconto = tier.sconto;
                }
            });

            // Esegui l'update nel DB per OGNI utente
            const { error: errUpdate } = await supabase
                .from('utenti')
                .update({ percentuale_sconto: nuovoSconto })
                .eq('id', utente.id);

            if (errUpdate) {
                console.error(`Errore update utente ${utente.ragione_sociale}:`, errUpdate);
            } else {
                if (nuovoSconto > 0) contatoreAggiornati++;
                else contatoreAzzerati++;
            }
        }

        alert(`✅ Operazione Completata per ${nomeMeseScorso}!\n\n` +
              `💰 Utenti con sconto attivo: ${contatoreAggiornati}\n` +
              `⭕ Utenti resettati a 0%: ${contatoreAzzerati}\n\n` +
              `La lista utenti verrà ora ricaricata.`);
        
        caricaUtenti(); // Aggiorna la tabella a video

    } catch (error) {
        console.error(error);
        alert("Errore critico: " + error.message);
    } finally {
        if(btn) { btn.disabled = false; btn.textContent = "📅 Calcola e Assegna Sconti (Mese Scorso)"; }
    }
}

//---------------fine gestione per aggiunzione sconto --------------------



function showSection(sectionId) {
    // 1. Nascondi TUTTE le sezioni
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    // 2. Mostra la sezione richiesta
    const targetSection = document.getElementById(sectionId + '-section');
    if (targetSection) targetSection.style.display = 'block';

    // 3. Gestione classe active sui tab
    document.querySelectorAll('.tab-nav a').forEach(tab => tab.classList.remove('active'));
    const activeTab = document.getElementById(sectionId + '-tab');
    if (activeTab) activeTab.classList.add('active');

    // 4. CARICAMENTI DATI SPECIFICI
    if (sectionId === 'orders') {
        caricaOrdini();
    } else if (sectionId === 'users') {
        caricaUtenti();
    } else if (sectionId === 'stats') {  // <--- NUOVA SEZIONE ANALISI
        inizializzaStatistiche();
    }
}

/**
 * 1. Recupera tutti gli utenti.
 */
async function caricaUtenti() {
    const container = document.getElementById('utentiLista');
    if (!container) return;
    
    container.innerHTML = '<h2>Caricamento utenti in corso...</h2>';
    
    const { data: utenti, error } = await supabase
        .from('utenti')
        .select(`
            id, email, ragione_sociale, partita_iva, telefono, permessi,
            indirizzo_legale_via, indirizzo_legale_cap, indirizzo_legale_citta, indirizzo_legale_provincia,
            stesso_indirizzo_merce,
            indirizzo_merce_via, indirizzo_merce_cap, indirizzo_merce_citta, indirizzo_merce_provincia,
            percentuale_sconto, sdi
        `)
        .order('ragione_sociale', { ascending: true }); 

    if (error) {
        container.innerHTML = `<p style="color: red;">Errore nel recupero utenti: ${error.message}.</p>`;
        return;
    }

    allUsers = utenti || []; 
    renderUserList(allUsers); 
}

/**
 * 2. Visualizza la tabella degli utenti.
 */
function renderUserList(users) {
    const container = document.getElementById('utentiLista');
    if (!container) return;


    // --- PULSANTE AUTOMAZIONE (INSERISCI QUESTO PEZZO) ---
    let html = `
    <div style="margin-bottom: 20px; padding: 15px; background: #e8f5e9; border-left: 5px solid #4caf50; border-radius: 4px; display:flex; justify-content:space-between; align-items:center;">
        <div>
            <h3 style="margin-top:0; color:#2e7d32;">⚡ Gestione Mensile Sconti</h3>
            <p style="margin:0; font-size:0.9em;">Clicca per analizzare il mese scorso. Chi ha raggiunto il budget avrà lo sconto, <strong>chi no verrà portato a 0%.</strong></p>
        </div>
        <button id="btnCalcolaSconti" class="btn-primary" style="background-color: #2e7d32; padding: 10px 20px;">
           📅 Calcola e Assegna Sconti (Mese Scorso)
        </button>
    </div>
    `;
    // -----------------------------------------------------

    

    if (users.length === 0) {
        // AGGIUNGI "html +" QUI SOTTO:
        container.innerHTML = html + '<h2>Nessun utente trovato.</h2>'; 
        
        // Listener anche qui per sicurezza
        const btn = document.getElementById('btnCalcolaSconti');
        if(btn) btn.addEventListener('click', elaboraScontiMeseScorso);
        return;
    }

    html += `
    <div class="admin-table">
        <table>
            <thead>
                <tr>
                    <th>Nome / Ragione Sociale</th>
                    <th>Email</th> <th>P. IVA</th>
                    <th>Permessi</th>
                    <th>Azioni</th>
                </tr>
            </thead>
            <tbody>`;
    
    users.forEach(user => {
        html += `
            <tr data-id="${user.id}">
                <td>${user.ragione_sociale || 'N/D'}</td> 
                <td>${user.email || 'N/D'}</td> <td>${user.partita_iva || 'N/D'}</td>
                <td>
                    <select class="permessi-select" data-id="${user.id}">
                        <option value="cliente" ${user.permessi === 'cliente' ? 'selected' : ''}>Cliente</option>
                        <option value="rivenditore" ${user.permessi === 'rivenditore' ? 'selected' : ''}>Rivenditore</option>
                        <option value="operatore" ${user.permessi === 'operatore' ? 'selected' : ''}>Operatore</option>
                        <option value="rappresentante" ${user.permessi === 'rappresentante' ? 'selected' : ''}>Rappresentante</option>
                        <option value="admin" ${user.permessi === 'admin' ? 'selected' : ''}>Admin</option>
                        <option value="disattivato" ${user.permessi === 'disattivato' ? 'selected' : ''}>Disattivato</option>
                    </select>
                </td>
                <td>
                    <button onclick="openEditUserModal('${user.id}')" class="btn-secondary" style="padding: 5px 10px;">Modifica Dati</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;

    // Aggancia l'evento click al nuovo bottone ---------------------------inizio gestisce il bottone per aggiunta sconto automatico ---------
    const btnCalcola = document.getElementById('btnCalcolaSconti');
    if (btnCalcola) {
        btnCalcola.addEventListener('click', elaboraScontiMeseScorso);
    }
    // ---------------------------fine gestisce il bottone per aggiunta sconto automatico ---------
    
    document.querySelectorAll('.permessi-select').forEach(select => {
        select.addEventListener('change', (e) => aggiornaPermessiUtente(e.target.dataset.id, e.target.value));
    });
}

/**
 * 3. Aggiorna i permessi di un utente nel DB.
 */
async function aggiornaPermessiUtente(userId, nuovoPermesso) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === userId && nuovoPermesso !== 'admin') {
        alert("Non puoi declassare o disattivare i tuoi stessi permessi di amministratore.");
        caricaUtenti(); 
        return;
    }
    
    if (!confirm(`Confermi il cambio permessi per l'utente ${userId.substring(0, 8)} a "${nuovoPermesso}"?`)) {
        caricaUtenti(); 
        return;
    }
    
    const { error } = await supabase
        .from('utenti')
        .update({ permessi: nuovoPermesso })
        .eq('id', userId);
    
    if (error) {
        alert(`Errore nell'aggiornamento dei permessi: ${error.message}.`);
    } else {
        console.log(`Permessi utente ${userId} aggiornati a: ${nuovoPermesso}`);
        caricaUtenti(); 
    }
}

/**
 * Nasconde/Mostra i campi dell'indirizzo di destinazione merce a seconda della checkbox.
 */
function toggleMerceAddressFields(isSame) {
    const fieldsContainer = document.getElementById('merceAddressFields');
    if (fieldsContainer) {
        fieldsContainer.style.display = isSame ? 'none' : 'block';
    }
}


/**
 * 4. Apri e popola il modale per la modifica di tutti i dati dell'utente.
 */
function openEditUserModal(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
        alert('Utente non trovato nell\'elenco.');
        return;
    }

    const modal = document.getElementById('userEditModal');
    if (!modal) {
        alert('Modale di modifica utente non trovato.');
        return;
    }
    
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUserEmail').value = user.email || '';
    document.getElementById('editUserRagioneSociale').value = user.ragione_sociale || '';
    document.getElementById('editUserPartitaIva').value = user.partita_iva || '';
    document.getElementById('editUserTelefono').value = user.telefono || '';
    document.getElementById('editUserPermessi').value = user.permessi || 'cliente';
    
    document.getElementById('editUserSdi').value = user.sdi || '';
    document.getElementById('editUserSconto').value = user.percentuale_sconto || 0;

    document.getElementById('editUserLegaleVia').value = user.indirizzo_legale_via || '';
    document.getElementById('editUserLegaleCap').value = user.indirizzo_legale_cap || '';
    document.getElementById('editUserLegaleCitta').value = user.indirizzo_legale_citta || '';
    document.getElementById('editUserLegaleProvincia').value = user.indirizzo_legale_provincia || '';

    const isSameAddress = user.stesso_indirizzo_merce === true;
    document.getElementById('editUserStessoMerce').checked = isSameAddress;
    
    document.getElementById('editUserMerceVia').value = user.indirizzo_merce_via || '';
    document.getElementById('editUserMerceCap').value = user.indirizzo_merce_cap || '';
    document.getElementById('editUserMerceCitta').value = user.indirizzo_merce_citta || '';
    document.getElementById('editUserMerceProvincia').value = user.indirizzo_merce_provincia || '';
    
    toggleMerceAddressFields(isSameAddress);

    modal.style.display = 'block';
}

/**
 * 5. Salva i dati modificati dall'apposito modale.
 */
async function saveUserChanges() {
    const userId = document.getElementById('editUserId').value;
    const ragione_sociale = document.getElementById('editUserRagioneSociale').value;
    const partita_iva = document.getElementById('editUserPartitaIva').value;
    const telefono = document.getElementById('editUserTelefono').value.trim(); 
    const permessi = document.getElementById('editUserPermessi').value;
    
    if (!telefono || telefono === '') {
        alert("ATTENZIONE INSERIRE IL TELEFONO è OBBLIGATORIO");
        return; 
    }
    
    const sdi = document.getElementById('editUserSdi').value;

    const scontoInput = document.getElementById('editUserSconto').value.trim();
    let sconto = 0; 
    if (scontoInput !== '') {
        const parsedSconto = parseFloat(scontoInput);
        sconto = isNaN(parsedSconto) ? 0 : parsedSconto; 
    }

    const legale_via = document.getElementById('editUserLegaleVia').value;
    const legale_cap = document.getElementById('editUserLegaleCap').value;
    const legale_citta = document.getElementById('editUserLegaleCitta').value;
    const legale_provincia = document.getElementById('editUserLegaleProvincia').value;

    const stesso_merce = document.getElementById('editUserStessoMerce').checked;

    const merce_via = stesso_merce ? legale_via : document.getElementById('editUserMerceVia').value;
    const merce_cap = stesso_merce ? legale_cap : document.getElementById('editUserMerceCap').value;
    const merce_citta = stesso_merce ? legale_citta : document.getElementById('editUserMerceCitta').value;
    const merce_provincia = stesso_merce ? legale_provincia : document.getElementById('editUserMerceProvincia').value;

    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === userId && permessi !== 'admin') {
        alert("Non puoi declassare i tuoi stessi permessi. Modifica fallita.");
        return;
    }

    const updatedData = {
        ragione_sociale: ragione_sociale,
        partita_iva: partita_iva,
        telefono: telefono,
        permessi: permessi,
        sdi: sdi,
        percentuale_sconto: sconto, 

        indirizzo_legale_via: legale_via,
        indirizzo_legale_cap: legale_cap,
        indirizzo_legale_citta: legale_citta,
        indirizzo_legale_provincia: legale_provincia,
        
        stesso_indirizzo_merce: stesso_merce,
        indirizzo_merce_via: merce_via,
        indirizzo_merce_cap: merce_cap,
        indirizzo_merce_citta: merce_citta,
        indirizzo_merce_provincia: merce_provincia,
    };
    
    const { error } = await supabase
        .from('utenti')
        .update(updatedData)
        .eq('id', userId);
    
    if (error) {
        alert(`Errore nel salvataggio dei dati utente: ${error.message}.`);
    } else {
        alert('Dati utente aggiornati con successo!');
        document.getElementById('userEditModal').style.display = 'none'; 
        caricaUtenti(); 
    }
}

// 1. Variabile globale
let ordineNotaInModifica = null;

// 2. Funzione per aprire il modale
window.apriModaleNotaAdmin = function(id, testo) {
    ordineNotaInModifica = id;
    const textarea = document.getElementById('textareaNotaAdmin');
    const modal = document.getElementById('modalNotaAdmin');
    const btnSalva = document.getElementById('btnSalvaNotaAdmin');

    if (textarea && modal) {
        // Pulisce eventuali rimasugli HTML o caratteri speciali
        textarea.value = testo && testo !== 'undefined' ? testo : '';
        modal.style.display = 'flex';

        // Rimuoviamo vecchi listener clonando il bottone per evitare salvataggi doppi o errori
        const nuovoBtnSalva = btnSalva.cloneNode(true);
        btnSalva.parentNode.replaceChild(nuovoBtnSalva, btnSalva);

        // Colleghiamo la funzione di salvataggio al nuovo bottone pulito
        nuovoBtnSalva.addEventListener('click', eseguiSalvataggioNotaAdmin);
    }
};

// 3. Funzione effettiva di salvataggio su database---- nota 
async function eseguiSalvataggioNotaAdmin() {
    if (!ordineNotaInModifica) return;

    const nuovaNota = document.getElementById('textareaNotaAdmin').value;
    const btn = document.getElementById('btnSalvaNotaAdmin');

    // Feedback visivo disabilitando il tasto
    btn.disabled = true;
    btn.innerText = "Salvataggio...";

    const { error } = await supabase
        .from('ordini')
        .update({ note_condivise: nuovaNota })
        .eq('id', ordineNotaInModifica);

    if (error) {
        alert("Errore nel salvataggio: " + error.message);
        btn.disabled = false;
        btn.innerText = "💾 Salva Nota Condivisa";
    } else {
        // Successo: chiudi e aggiorna la UI
        document.getElementById('modalNotaAdmin').style.display = 'none';
        
        // Aggiorna l'anteprima nella tabella (testo blu)
        const preview = document.getElementById(`nota-preview-${ordineNotaInModifica}`);
        if (preview) {
            preview.innerText = nuovaNota.trim() !== "" ? nuovaNota : '➕ Aggiungi nota';
        }
        
        // Sincronizza l'array locale allOrders
        allOrders = allOrders.map(order => 
            order.id === ordineNotaInModifica ? { ...order, note_condivise: nuovaNota } : order
        );

        btn.disabled = false;
        btn.innerText = "💾 Salva Nota Condivisa";
        console.log("Salvataggio admin completato.");
    }
}

// funzione ponte per passare i dettagli dell ordine quando l'utente clicca vede dettagli
window.preparaEApriDettagli = function(id) {
    const ordine = allOrders.find(o => o.id === id);
    if (ordine) {
        const numeroOrdine = ordine.num_ordine_prog || ordine.id.substring(0, 8).toUpperCase();
        const dettagliString = JSON.stringify(ordine.dettagli_prodotti);
        mostraDettagli(ordine.id, dettagliString, numeroOrdine, ordine.totale || 0);
    }
};


/**
 * Funzione per generare ed esportare il file CSV dell'ordine
 
function esportaOrdineCSV(ordineId) {
    const ordine = allOrders.find(o => o.id === ordineId);
    if (!ordine || !ordine.dettagli_prodotti) return;

    // Header del CSV basato sulla tua immagine (Cod., Descrizione, Taglia/Colore, Q.tà, Prezzo netto, U.m., Sconti, Eco-contrib., Iva, Mag., Importo, Note)
    let csvContent = "Cod.;Descrizione;Taglia/Colore;Q.tà;Prezzo netto;U.m.;Sconti;Eco-contrib.;Iva;Mag.;Importo;Note\n";

    ordine.dettagli_prodotti.forEach(item => {
        // Saltiamo l'oggetto INFO_CLIENTE se presente nei dettagli
        if (item.tipo === 'INFO_CLIENTE') return;

        const descrizione = (item.prodotto || "").replace(/;/g, ","); // Evitiamo conflitti con il separatore ;
        const quantita = item.quantita || 0;
        const prezzo = item.prezzo_unitario || 0;
        const importo = (quantita * prezzo).toFixed(2);

        // Costruiamo la riga lasciando vuote le colonne non richieste (come da tua richiesta)
        // Ma popolando Descrizione (B), Q.tà (D) e Prezzo netto (E) + Importo (K) per utilità
        let riga = [
            "",             // A: Cod.
            descrizione,    // B: Descrizione
            "",             // C: Taglia/Colore
            quantita,       // D: Q.tà
            prezzo,         // E: Prezzo netto
            "pz",           // F: U.m.
            "",             // G: Sconti
            "",             // H: Eco-contrib.
            "22",           // I: Iva
            "No",           // J: Mag.
            importo,        // K: Importo
            ""              // L: Note
        ];

        csvContent += riga.join(";") + "\n";
    });

    // Creazione del file e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const dataOggi = new Date().toISOString().slice(0, 10);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Ordine_${ordine.num_ordine_prog || ordineId.substring(0,8)}_${dataOggi}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

<button onclick="esportaOrdineCSV('${ordine.id}')" class="btn-secondary" style="padding: 5px 10px; background-color: #28a745; color: white; border: none;">
                    <i class="fas fa-file-csv"></i>
                    </button>
----------------------------------------------------------------------------------------------------------------------------------------------------
function esportaOrdineXLSX(ordineId) {
    const ordine = allOrders.find(o => o.id === ordineId);
    if (!ordine || !ordine.dettagli_prodotti) return;

    // Intestazioni identiche al file "Righe documento.xlsx"
    const headers = [
        "Cod. articolo", "Descrizione", "Lotto", "Scadenza", 
        "Taglia", "Colore", "U.m.", "Quantità", 
        "Prezzo", "Sconto %", "Iva", "Cod. commessa", "Note"
    ];

    const rows = [];
    
    ordine.dettagli_prodotti.forEach(item => {
        if (item.tipo === 'INFO_CLIENTE') return;

        // --- PULIZIA PROFONDA DATI ---
        // Rimuove spazi extra e caratteri di controllo che potrebbero bloccare l'importazione
        const descrizionePulita = (item.prodotto || "").replace(/[\n\r\t]/g, " ").trim();
        const notePulite = (item.note || "").replace(/[\n\r\t]/g, " ").trim();

        // Conversione numerica sicura
        let qtaGrezza = String(item.quantita || "0").replace(/[^0-9,.]/g, '').replace(',', '.');
        let prezzoGrezzo = String(item.prezzo_unitario || "0").replace(/[^0-9,.]/g, '').replace(',', '.');
        
        const qtaNumerica = parseFloat(qtaGrezza) || 0;
        const prezzoNumerico = parseFloat(prezzoGrezzo) || 0;

        // Estrazione Taglia
        let taglia = "";
        if (item.dettagli_taglie) {
            taglia = Object.keys(item.dettagli_taglie).join(", ");
        }

        rows.push([
            item.codice || "000",        // A: Cod. articolo (aggiunto default per evitare celle vuote iniziali)
            descrizionePulita,           // B: Descrizione
            "",                          // C: Lotto
            "",                          // D: Scadenza
            taglia,                      // E: Taglia
            "",                          // F: Colore
            "pz",                        // G: U.m.
            qtaNumerica,                 // H: Quantità
            prezzoNumerico,              // I: Prezzo
            0,                           // J: Sconto %
            22,                          // K: Iva
            "",                          // L: Cod. commessa
            notePulite                   // M: Note
        ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // --- DEFINIZIONE ESPLICITA AREA DATI ---
    // Aiuta il gestionale a capire i limiti del foglio e a non fermarsi a metà
    ws['!ref'] = XLSX.utils.encode_range({
        s: { c: 0, r: 0 }, 
        e: { c: 12, r: rows.length }
    });

    // --- FORZATURA FORMATO NUMERICO ---
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        // Colonna H (Quantità)
        const cellH = ws[XLSX.utils.encode_cell({r: R, c: 7})];
        if (cellH) {
            cellH.t = 'n'; 
            cellH.z = '0.00'; 
        }
        
        // Colonna I (Prezzo)
        const cellI = ws[XLSX.utils.encode_cell({r: R, c: 8})];
        if (cellI) {
            cellI.t = 'n'; 
            cellI.z = '#,##0.00'; 
        }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Foglio1");

    let rifCliente = "Ordine";
    const info = ordine.dettagli_prodotti.find(d => d.tipo === 'INFO_CLIENTE');
    if (info && info.cliente) rifCliente = info.cliente.replace(/[^a-z0-9]/gi, '_');

    // Salvataggio esplicito in XLSX (evita il formato ODS che può dare problemi)
    XLSX.writeFile(wb, `${rifCliente}_Dati_Import.xlsx`, { bookType: 'xlsx' });
}

*/
function esportaOrdineXLSX(ordineId) {
    const ordine = allOrders.find(o => o.id === ordineId);
    if (!ordine || !ordine.dettagli_prodotti) return;

    // Header personalizzati secondo le tue impostazioni
    const headers = [
        "Cod. articolo", "Descrizione", "U.m.", "Q.tà", 
        "Prezzo netto"
    ];

    const rows = [];
    
    ordine.dettagli_prodotti.forEach(item => {
        if (item.tipo === 'INFO_CLIENTE') return;

        // Pulizia testi
        const desc = (item.prodotto || "").replace(/[^\x20-\x7E]/g, "").trim();
        
        // Conversione numerica pulita
        const qta = parseFloat(String(item.quantita).replace(',', '.')) || 0;
        const prezzo = parseFloat(String(item.prezzo_unitario).replace(/[^0-9,.]/g, '').replace(',', '.')) || 0;

        // Allineamento colonne basato sul nuovo array headers:
        // A: Cod. articolo, B: Descrizione, C: U.m., D: Q.tà, E: Prezzo netto
        rows.push([
            item.codice || "0",          // A
            desc,                        // B
            "pz",                        // C
            qta,                         // D
            prezzo                       // E
        ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // --- LOGICA DI FORZATURA NUMERICA AGGRESSIVA ---
    // Aggiornata per riflettere le nuove posizioni (D ed E)
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        
        // Colonna D (Indice 3) -> Q.tà
        const cellD = ws[XLSX.utils.encode_cell({r: R, c: 3})];
        if (cellD) {
            cellD.t = 'n'; // Forza tipo numero
            cellD.v = Number(cellD.v); // Forza valore numerico
            cellD.z = '0,00'; // Formato con VIRGOLA decimale (Italiano)
        }
        
        // Colonna E (Indice 4) -> Prezzo netto
        const cellE = ws[XLSX.utils.encode_cell({r: R, c: 4})];
        if (cellE) {
            cellE.t = 'n'; // Forza tipo numero
            cellE.v = Number(cellE.v); // Forza valore numerico
            cellE.z = '#,##0,00'; // Formato con VIRGOLA decimale (Italiano)
        }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Foglio1");

    // Generazione nome file basata sul cliente
    let rifCliente = "Export";
    const info = ordine.dettagli_prodotti.find(d => d.tipo === 'INFO_CLIENTE');
    if (info && info.cliente) rifCliente = info.cliente.replace(/[^a-z0-9]/gi, '_');

    // Salvataggio esplicito in XLSX
    XLSX.writeFile(wb, `${rifCliente}_Import.xlsx`, { bookType: 'xlsx', type: 'binary' });
}



// ===========================================
// LOGICA STATISTICHE E BUSINESS INTELLIGENCE
// ===========================================

let myChartAndamento = null;
let myChartTorta = null;

async function inizializzaStatistiche() {
    console.log("Inizializzazione statistiche...");
    await popolaSelectClientiStats();
    await aggiornaStatistiche();
}

/**
 * 1. Popola il menu a tendina con tutti i clienti (per il filtro)
 */
async function popolaSelectClientiStats() {
    const select = document.getElementById('statsSelectCliente');
    if (select.options.length > 1) return; // Evita di ricaricare se già popolato

    const { data: utenti, error } = await supabase
        .from('utenti')
        .select('id, ragione_sociale, email')
        .order('ragione_sociale');

    if (error) console.error("Errore loading utenti stats:", error);
    else {
        utenti.forEach(u => {
            const option = document.createElement('option');
            option.value = u.id;
            option.textContent = u.ragione_sociale || u.email;
            select.appendChild(option);
        });
    }
}

/**
 * 2. Funzione Principale: Recupera dati, calcola KPI e disegna i grafici
 * (AGGIORNATA: Filtro per range di date specifico)
 */
async function aggiornaStatistiche() {
    const clienteId = document.getElementById('statsSelectCliente').value;
    
    // Recuperiamo le date dai nuovi input
    const dataInizioVal = document.getElementById('statsDataInizio').value;
    const dataFineVal = document.getElementById('statsDataFine').value;

    // Se le date non sono selezionate, impostiamo l'anno corrente come default
    let filtroStart, filtroEnd;
    
    if (dataInizioVal && dataFineVal) {
        filtroStart = `${dataInizioVal}T00:00:00`;
        filtroEnd = `${dataFineVal}T23:59:59`;
    } else {
        // Default: Anno corrente intero
        const annoCorrente = new Date().getFullYear();
        filtroStart = `${annoCorrente}-01-01T00:00:00`;
        filtroEnd = `${annoCorrente}-12-31T23:59:59`;
        
        // Aggiorniamo visivamente gli input per chiarezza
        if(document.getElementById('statsDataInizio')) 
            document.getElementById('statsDataInizio').value = `${annoCorrente}-01-01`;
        if(document.getElementById('statsDataFine')) 
            document.getElementById('statsDataFine').value = `${annoCorrente}-12-31`;
    }
    
    // Costruiamo la query su righe_statistiche
    let query = supabase
        .from('righe_statistiche')
        .select('*')
        .gte('data_ordine', filtroStart) // Maggiore o uguale data inizio
        .lte('data_ordine', filtroEnd);  // Minore o uguale data fine

    // Filtro per Cliente (se selezionato)
    if (clienteId !== 'ALL') {
        query = query.eq('user_id', clienteId);
    }

    const { data: righe, error } = await query;

    if (error) {
        alert("Errore caricamento statistiche: " + error.message);
        return;
    }

    // --- ELABORAZIONE DATI ---
    calcolaEKPI(righe);
    disegnaGrafici(righe);
    generareRiepilogoCategorie(righe);
    popolaTabellaDettaglio(righe);
}
/**
 * 3. Calcola e mostra i numeri nei box colorati (KPI)
 */
function calcolaEKPI(righe) {
    let fatturatoTotale = 0;
    let ordiniSet = new Set(); // Set per contare ID ordini univoci
    let categorieCount = {};

    righe.forEach(r => {
        fatturatoTotale += parseFloat(r.prezzo_totale || 0);
        ordiniSet.add(r.ordine_id);
        
        // Conta categorie per la "Top Categoria"
        const cat = r.categoria || 'Altro';
        categorieCount[cat] = (categorieCount[cat] || 0) + parseFloat(r.prezzo_totale);
    });

    const numOrdini = ordiniSet.size;
    const scontrinoMedio = numOrdini > 0 ? (fatturatoTotale / numOrdini) : 0;

    // Trova la categoria top
    let bestCat = "---";
    let maxVal = 0;
    for (const [cat, val] of Object.entries(categorieCount)) {
        if (val > maxVal) { maxVal = val; bestCat = cat; }
    }

    // Aggiorna DOM
    document.getElementById('kpiFatturato').innerText = `€ ${fatturatoTotale.toLocaleString('it-IT', {minimumFractionDigits: 2})}`;
    document.getElementById('kpiOrdini').innerText = numOrdini;
    document.getElementById('kpiMedio').innerText = `€ ${scontrinoMedio.toLocaleString('it-IT', {minimumFractionDigits: 2})}`;
    document.getElementById('kpiBestCat').innerText = bestCat;
}

/**
 * 4. Genera i grafici usando Chart.js
 */
function disegnaGrafici(righe) {
    // A. Preparazione Dati Temporali (Mesi)
    const datiMesi = Array(12).fill(0);
    const labelsMesi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

    // B. Preparazione Dati Categorie
    const datiCategorie = {};

    righe.forEach(r => {
        const data = new Date(r.data_ordine);
        const meseIndex = data.getMonth(); // 0-11
        datiMesi[meseIndex] += parseFloat(r.prezzo_totale);

        const cat = r.categoria || 'Altro';
        datiCategorie[cat] = (datiCategorie[cat] || 0) + parseFloat(r.prezzo_totale);
    });

    // --- GRAFICO ANDAMENTO (Linea) ---
    const ctxAndamento = document.getElementById('chartAndamento').getContext('2d');
    if (myChartAndamento) myChartAndamento.destroy(); // Distruggi vecchio grafico se esiste

    myChartAndamento = new Chart(ctxAndamento, {
        type: 'line',
        data: {
            labels: labelsMesi,
            datasets: [{
                label: 'Fatturato Mensile (€)',
                data: datiMesi,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true }
    });

    // --- GRAFICO CATEGORIE (Torta) ---
    const ctxTorta = document.getElementById('chartTorta').getContext('2d');
    if (myChartTorta) myChartTorta.destroy();

    myChartTorta = new Chart(ctxTorta, {
        type: 'doughnut',
        data: {
            labels: Object.keys(datiCategorie),
            datasets: [{
                data: Object.values(datiCategorie),
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'],
                hoverOffset: 4
            }]
        },
        options: { responsive: true }
    });
}



/**
 * NUOVA FUNZIONE: Genera i box con il riepilogo quantità e ordini per categoria
 * Con dettaglio specifico per Bandiere e Abbigliamento Sport.
 */
function generareRiepilogoCategorie(righe) {
    const container = document.getElementById('containerRiepilogoCat');
    if (!container) return;
    container.innerHTML = ''; // Pulisci

    // 1. Struttura dati per aggregazione
    const aggregato = {};

    righe.forEach(r => {
        // Normalizza la categoria
        let cat = r.categoria || 'ALTRO';
        const nomeProd = (r.prodotto_nome || '').toUpperCase();
        
        // Fix per Scaldacollo se non categorizzato dal DB
        if (nomeProd.includes('SCALDACOLLO')) cat = 'SCALDACOLLO';

        if (!aggregato[cat]) {
            aggregato[cat] = { 
                pezzi: 0, 
                ordiniSet: new Set(), 
                dettagli: {} 
            };
        }

        // Somma Pezzi e traccia Ordine
        aggregato[cat].pezzi += r.quantita;
        aggregato[cat].ordiniSet.add(r.ordine_id);

        // --- LOGICA A: BANDIERE ---
        if (cat === 'BANDIERE') {
            let tipo = 'Altro';
            if (nomeProd.includes('GOCCIA')) tipo = 'Goccia';
            else if (nomeProd.includes('VELA')) tipo = 'Vela';
            else if (nomeProd.includes('CRESTA') || nomeProd.includes('CREST')) tipo = 'Cresta';
            else if (nomeProd.includes('RETTANGOLARE')) tipo = 'Rettangolare';
            
            if (!aggregato[cat].dettagli[tipo]) aggregato[cat].dettagli[tipo] = 0;
            aggregato[cat].dettagli[tipo] += r.quantita;
        }

        // --- LOGICA B: ABBIGLIAMENTO SPORT (Nuova!) ---
        else if (cat === 'ABBIGLIAMENTO SPORT') {
            let tipo = 'Altro Sport';

            // Logica CALCIO
            if (nomeProd.includes('CALCIO')) {
                if (nomeProd.includes('COMPLETINO')) tipo = 'Completo Calcio';
                else if (nomeProd.includes('T-SHIRT') || nomeProd.includes('MAGLIA')) tipo = 'Solo Maglia Calcio';
                else if (nomeProd.includes('PANTALONCINO') || nomeProd.includes('PANT')) tipo = 'Solo Pant. Calcio';
            }
            // Logica BASKET
            else if (nomeProd.includes('BASKET')) {
                if (nomeProd.includes('COMPLETINO')) tipo = 'Completo Basket';
                else if (nomeProd.includes('CANOTTA')) tipo = 'Solo Canotta Basket';
                else if (nomeProd.includes('PANTALONCINO') || nomeProd.includes('PANT')) tipo = 'Solo Pant. Basket';
            }

            if (!aggregato[cat].dettagli[tipo]) aggregato[cat].dettagli[tipo] = 0;
            aggregato[cat].dettagli[tipo] += r.quantita;
        }
    });

    // 2. Generazione HTML
    const categorieOrdinate = Object.entries(aggregato).sort((a, b) => b[1].pezzi - a[1].pezzi);

    categorieOrdinate.forEach(([catNome, dati]) => {
        const numOrdini = dati.ordiniSet.size;
        
        // Creazione Card
        const card = document.createElement('div');
        card.style.cssText = "background: #fff; padding: 15px; border-radius: 8px; border-left: 4px solid #007bff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-size: 0.9em;";
        
        let htmlDettagli = '';
        
        // Se ci sono dettagli, costruisci la lista
        if (Object.keys(dati.dettagli).length > 0) {
            htmlDettagli += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #eee; font-size: 0.85em; color: #666;">`;
            
            // Ordina i dettagli per quantità decrescente
            const dettagliOrdinati = Object.entries(dati.dettagli).sort((a, b) => b[1] - a[1]);
            
            for (const [tipo, qta] of dettagliOrdinati) {
                htmlDettagli += `<div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span>• ${tipo}</span> 
                    <strong>${qta} pz</strong>
                </div>`;
            }
            htmlDettagli += `</div>`;
        }

        card.innerHTML = `
            <div style="font-weight: bold; color: #333; margin-bottom: 5px; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px;">${catNome}</div>
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-size: 1.4rem; font-weight: 700; color: #007bff;">${dati.pezzi} <span style="font-size:0.6em; font-weight:normal; color:#666;">pz tot</span></span>
                <span style="font-size: 0.9rem; color: #555;">in <strong>${numOrdini}</strong> ordini</span>
            </div>
            ${htmlDettagli}
        `;

        container.appendChild(card);
    });
}


/**
 * 5. Riempie la tabella in basso con i dettagli aggregati
 */
function popolaTabellaDettaglio(righe) {
    const tbody = document.querySelector('#tabellaStatsBody tbody');
    tbody.innerHTML = '';

    // Aggreghiamo per Prodotto
    const prodottiStats = {};

    righe.forEach(r => {
        const key = r.prodotto_nome || 'Prodotto generico';
        if (!prodottiStats[key]) {
            prodottiStats[key] = { qta: 0, totale: 0, cat: r.categoria };
        }
        prodottiStats[key].qta += r.quantita;
        prodottiStats[key].totale += parseFloat(r.prezzo_totale);
    });

    // Ordina per Fatturato decrescente
    const sortedProd = Object.entries(prodottiStats).sort((a, b) => b[1].totale - a[1].totale);

    // Disegna righe (Top 30)
    sortedProd.slice(0, 30).forEach(([nome, dati]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge-cat">${dati.cat}</span></td>
            <td>${nome}</td>
            <td style="text-align:center;">${dati.qta}</td>
            <td style="text-align:right; font-weight:bold;">€ ${dati.totale.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
}
