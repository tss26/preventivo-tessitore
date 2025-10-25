// ===========================================
// CONFIGURAZIONE SUPABASE
// ===========================================

const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// VARIABILE GLOBALE PER IL FILTRAGGIO
let allOrders = []; // <-- AGGIUNTA: Variabile per salvare tutti gli ordini scaricati da Supabase

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
async function caricaOrdini() { // <-- MODIFICATA: Ora salva in allOrders e chiama renderOrderList
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

    if (ordini.length === 0) {
        // Non serve interrompere, allOrders sarà [] e renderOrderList mostrerà il messaggio
    }
    
    // Salva i dati originali
    allOrders = ordini; 
    
    // Visualizza la lista completa (funzione creata sotto)
    renderOrderList(allOrders); 
}

/**
 * Funzione di utilità per disegnare la tabella degli ordini, usata da caricaOrdini e applyFilters.
 */
function renderOrderList(ordiniDaVisualizzare) { // <-- AGGIUNTA: Contiene la logica di visualizzazione
    const container = document.getElementById('ordiniLista');
    
    if (ordiniDaVisualizzare.length === 0) {
        container.innerHTML = '<h2>Nessun ordine trovato con i filtri applicati.</h2>';
        return;
    }

    let html = `<div class="admin-table">
        <table><thead><tr>
        <th>N. Ordine</th><th>Cliente</th><th>P. IVA</th><th>Data</th><th>Totale</th><th>Stato</th><th>Azioni</th>
        </tr></thead><tbody>`;
    
    ordiniDaVisualizzare.forEach(ordine => {
        const dettagliProdotti = JSON.stringify(ordine.dettagli_prodotti).replace(/"/g, '&quot;');
        
        // --- LOGICA DI VISUALIZZAZIONE ---
        const numeroOrdine = ordine.num_ordine_prog 
            ? ordine.num_ordine_prog 
            : ordine.id.substring(0, 8).toUpperCase(); 

        const nomeUtenteDB = ordine.utente?.ragione_sociale; 
        const clienteNome = (nomeUtenteDB && nomeUtenteDB.trim() !== '') 
            ? nomeUtenteDB 
            : 'ID: ' + (ordine.user_id ? ordine.user_id.substring(0, 8) : 'N/D'); 
        
        const clientePiva = (ordine.utente && ordine.utente.partita_iva) || 'N/D';
        // --- FINE LOGICA DI VISUALIZZAZIONE ---
        
        html += `
            <tr data-id="${ordine.id}">
                <td>${numeroOrdine}</td> 
                <td>${clienteNome}</td>
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
                    </select>
                </td>
                <td>
                    <button onclick="mostraDettagli('${ordine.id}', '${dettagliProdotti}')" class="btn-primary" style="padding: 5px 10px;">Vedi Dettagli</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    
    // Ri-aggiungi i listener per l'update dello stato
    document.querySelectorAll('.stato-select').forEach(select => {
        select.addEventListener('change', (e) => aggiornaStatoOrdine(e.target.dataset.id, e.target.value));
    });
}


/**
 * Applica i filtri (testo e stato) all'array allOrders e ridisegna la lista.
 */
function applyFilters() { // <-- AGGIUNTA: Logica di filtraggio
    const ricercaTesto = document.getElementById('ricercaTesto')?.value.toLowerCase().trim() || '';
    const filtroStato = document.getElementById('filtroStato')?.value || '';

    let ordiniFiltrati = allOrders.filter(ordine => {
        let matchTesto = true;
        let matchStato = true;

        // 1. Filtro Testuale (N. Ordine Progressivo, ID, Ragione Sociale)
        if (ricercaTesto) {
            const numeroOrdine = String(ordine.num_ordine_prog || '').toLowerCase(); 
            const idOrdineTroncato = ordine.id ? ordine.id.substring(0, 8).toLowerCase() : '';
            const nomeCliente = ordine.utente?.ragione_sociale ? ordine.utente.ragione_sociale.toLowerCase() : '';
            
            matchTesto = numeroOrdine.includes(ricercaTesto) || 
                         idOrdineTroncato.includes(ricercaTesto) ||
                         nomeCliente.includes(ricercaTesto);
        }

        // 2. Filtro per Stato
        if (filtroStato) {
            matchStato = ordine.stato === filtroStato;
        }

        return matchTesto && matchStato;
    });

    renderOrderList(ordiniFiltrati);
}

/**
 * Resetta i campi di filtro e riesegue applyFilters.
 */
function resetFilters() { // <-- AGGIUNTA: Funzione di reset
    const ricercaTesto = document.getElementById('ricercaTesto');
    const filtroStato = document.getElementById('filtroStato');
    
    if (ricercaTesto) ricercaTesto.value = '';
    if (filtroStato) filtroStato.value = '';
    
    applyFilters(); 
}


/**
 * 3. Aggiorna lo stato di un ordine nel DB.
 */
async function aggiornaStatoOrdine(ordineId, nuovoStato) {
    if (!confirm(`Confermi il cambio stato dell'ordine ${ordineId.substring(0, 8)} a "${nuovoStato}"?`)) {
        // Se annulla, ricarica la lista per ripristinare lo stato corretto nella select
        // Meglio ricaricare solo il dato, ma per semplicità ricarichiamo tutto
        caricaOrdini(); 
        return;
    }
    
    // NOTA: Policy RLS UPDATE su 'ordini' deve permettere l'update agli admin
    const { error } = await supabase
        .from('ordini')
        .update({ stato: nuovoStato })
        .eq('id', ordineId);
    
    if (error) {
        alert(`Errore nell'aggiornamento dello stato: ${error.message}.`);
    } else {
        console.log(`Stato ordine ${ordineId} aggiornato a: ${nuovoStato}`);
        // Dopo un aggiornamento riuscito, aggiorna l'array allOrders e ridisegna la lista
        // (Questo assicura che il dato in memoria sia coerente se stai filtrando)
        const updatedOrders = allOrders.map(order => 
            order.id === ordineId ? { ...order, stato: nuovoStato } : order
        );
        allOrders = updatedOrders;
        // Ridisegna la lista mantenendo gli eventuali filtri attivi.
        applyFilters(); 
    }
}


/**
 * 4. Mostra i dettagli dell'ordine in un modale HTML selezionabile.
 */
function mostraDettagli(ordineId, dettagliProdottiString) {
    const dettagli = JSON.parse(dettagliProdottiString); 
    const modal = document.getElementById('orderDetailsModal');
    const modalBody = document.getElementById('modalOrderDetails');
    const modalTitle = document.getElementById('modalOrderId');

    if (!modal || !modalBody || !modalTitle) {
        // Fallback: se gli elementi del modale non esistono nell'HTML, usa alert
        console.error("Elementi modale non trovati in admin.html!");
        alert("Errore nel caricamento del modale. Controllare l'HTML.");
        return; 
    }
    
    let dettagliHtml = `Ordine ID: ${ordineId.substring(0, 8)}...\n\nDETTAGLI PRODOTTI:\n`; 

 
    dettagli.forEach(item => {
        dettagliHtml += `\n--- ${item.prodotto} (${item.quantita} pz) ---\n`;
        dettagliHtml += `Componenti: ${item.componenti.join(', ')}\n`;
        dettagliHtml += `Prezzo netto cad.: € ${item.prezzo_unitario}\n`;

  
        // Logica Taglie (per Kit Calcio)
        if (item.dettagli_taglie && Object.keys(item.dettagli_taglie).length > 0) {
            dettagliHtml += `\nDettagli Taglie:\n`;
            for (const genere in item.dettagli_taglie) {
                const taglie = Object.entries(item.dettagli_taglie[genere])
                    .map(([taglia, qty]) => `${taglia}: ${qty}`)
                    .join(', ');
                dettagliHtml += `  - ${genere}: ${taglie}\n`;
            }
        }
        
        // Logica Note
        if (item.note && item.note.trim() !== '') {
            dettagliHtml += `Note Cliente: ${item.note}\n`;
        }

        // Logica File
        if (item.personalizzazione_url && item.personalizzazione_url !== 'Nessun file collegato direttamente.') {
           dettagliHtml += `File: COPIA E APRI L'URL:\n${item.personalizzazione_url}\n`;
        } else {
            dettagliHtml += `File: Nessun file caricato.\n`;
        }
    });

    // Aggiorna e mostra il modale
    modalTitle.textContent = ordineId.substring(0, 8).toUpperCase() + '...';
    modalBody.textContent = dettagliHtml;
    modal.style.display = 'block';
}


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
        
        // --- INIZIO AGGIUNTA EVENT LISTENERS PER I FILTRI ---
        const applicaBtn = document.getElementById('applicaFiltriBtn');
        const resetBtn = document.getElementById('resetFiltriBtn');
        const ricercaInput = document.getElementById('ricercaTesto');
        const statoSelect = document.getElementById('filtroStato');

        if (applicaBtn) {
            applicaBtn.addEventListener('click', applyFilters);
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', resetFilters);
        }
        if (statoSelect) {
            statoSelect.addEventListener('change', applyFilters);
        }
        if (ricercaInput) {
            ricercaInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    applyFilters();
                }
            });
        }
        // --- FINE AGGIUNTA EVENT LISTENERS PER I FILTRI ---

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

        caricaOrdini();
    }

});
