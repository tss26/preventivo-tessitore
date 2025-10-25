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
                        <option value="Annullato" ${ordine.stato === 'Annullato' ? 'selected' : ''}>Annullato</option>
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
        
        // ===========================================
        // AGGIUNTA: Listener Modale Utenti e Inizializzazione Sezioni
        // ===========================================
        
        // Listener per il pulsante di salvataggio del modale Utenti
        const saveBtn = document.getElementById('saveUserChangesBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveUserChanges);
        }

        // Listener per chiudere il modale Utenti cliccando fuori (se non gestito nell'HTML)
        const userEditModal = document.getElementById('userEditModal');
        window.addEventListener('click', (event) => {
            if (event.target === userEditModal) {
                userEditModal.style.display = 'none';
            }
        });
        
        // Aggiunta la funzione di toggle per l'indirizzo merce al listener della checkbox
        const sameMerceCheckbox = document.getElementById('editUserStessoMerce');
        if (sameMerceCheckbox) {
             sameMerceCheckbox.addEventListener('change', (e) => toggleMerceAddressFields(e.target.checked));
        }

        // Avvia la navigazione alla sezione Ordini (che chiama caricaOrdini() e imposta la tab attiva)
        showSection('orders');
    }

});

// ===========================================
// AGGIUNTA: FUNZIONALITÀ UTENTI E PERMESSI
// ===========================================

let allUsers = []; // Variabile globale per salvare tutti gli utenti

/**
 * Funzione per cambiare sezione (Ordini o Utenti) e gestire la classe 'active' nella tab.
 */
function showSection(sectionId) {
    // 1. Nascondi tutte le sezioni di contenuto (presuppone la classe 'content-section' nell'HTML)
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    // 2. Mostra la sezione richiesta
    const targetSection = document.getElementById(sectionId + '-section');
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    // 3. Gestione della tab attiva visuale (per la classe 'active' nell'HTML)
    document.querySelectorAll('.tab-nav a').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = document.getElementById(sectionId + '-tab');
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // 4. Carica i dati specifici della sezione
    if (sectionId === 'orders') {
        caricaOrdini();
    } else if (sectionId === 'users') {
        caricaUtenti();
    }
}


/**
 * 1. Recupera tutti gli utenti dalla tabella 'utenti' e avvia la visualizzazione.
 */
async function caricaUtenti() {
    const container = document.getElementById('utentiLista');
    if (!container) return;
    
    container.innerHTML = '<h2>Caricamento utenti in corso...</h2>';
    
    // AGGIORNAMENTO: Includi tutti i nuovi campi nella SELECT
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
        // L'errore ora dovrebbe mostrare il messaggio completo
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

    if (users.length === 0) {
        container.innerHTML = '<h2>Nessun utente trovato.</h2>';
        return;
    }

    let html = `
    <div class="admin-table">
        <table>
            <thead>
                <tr>
                    <th>Nome / Ragione Sociale</th>
                    <th>Email</th>
                    <th>P. IVA</th>
                    <th>Permessi</th>
                    <th>Azioni</th>
                </tr>
            </thead>
            <tbody>`;
    
    users.forEach(user => {
        html += `
            <tr data-id="${user.id}">
                <td>${user.ragione_sociale || 'N/D'}</td> 
                <td>${user.email}</td>
                <td>${user.partita_iva || 'N/D'}</td>
                <td>
                    <select class="permessi-select" data-id="${user.id}">
                        <option value="cliente" ${user.permessi === 'cliente' ? 'selected' : ''}>Cliente</option>
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
    
    // Aggiungi i listener per l'update dei permessi
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
        // Se la checkbox è spuntata (stesso indirizzo), nascondi i campi
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
    
    // AGGIUNTA: Popolamento dei nuovi campi anagrafici e logistici
    document.getElementById('editUserSdi').value = user.sdi || '';
    document.getElementById('editUserSconto').value = user.percentuale_sconto || 0;

    // Indirizzo Legale
    document.getElementById('editUserLegaleVia').value = user.indirizzo_legale_via || '';
    document.getElementById('editUserLegaleCap').value = user.indirizzo_legale_cap || '';
    document.getElementById('editUserLegaleCitta').value = user.indirizzo_legale_citta || '';
    document.getElementById('editUserLegaleProvincia').value = user.indirizzo_legale_provincia || '';

    // Indirizzo Spedizione (Checkbox e campi)
    const isSameAddress = user.stesso_indirizzo_merce === true;
    document.getElementById('editUserStessoMerce').checked = isSameAddress;
    
    document.getElementById('editUserMerceVia').value = user.indirizzo_merce_via || '';
    document.getElementById('editUserMerceCap').value = user.indirizzo_merce_cap || '';
    document.getElementById('editUserMerceCitta').value = user.indirizzo_merce_citta || '';
    document.getElementById('editUserMerceProvincia').value = user.indirizzo_merce_provincia || '';
    
    // Chiama una funzione per nascondere/mostrare l'indirizzo merce
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
    const telefono = document.getElementById('editUserTelefono').value;
    const permessi = document.getElementById('editUserPermessi').value;
    
    // Recupero nuovi campi
    const sdi = document.getElementById('editUserSdi').value;
    const sconto = parseFloat(document.getElementById('editUserSconto').value);

    // Indirizzo Legale
    const legale_via = document.getElementById('editUserLegaleVia').value;
    const legale_cap = document.getElementById('editUserLegaleCap').value;
    const legale_citta = document.getElementById('editUserLegaleCitta').value;
    const legale_provincia = document.getElementById('editUserLegaleProvincia').value;

    // Checkbox Merce
    const stesso_merce = document.getElementById('editUserStessoMerce').checked;

    // Indirizzo Merce (solo se diverso)
    // Se è uguale, copiamo i valori legali per assicurare che il DB sia coerente
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

        // Indirizzo Legale
        indirizzo_legale_via: legale_via,
        indirizzo_legale_cap: legale_cap,
        indirizzo_legale_citta: legale_citta,
        indirizzo_legale_provincia: legale_provincia,
        
        // Indirizzo Merce
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
        document.getElementById('userEditModal').style.display = 'none'; // Chiudi modale
        caricaUtenti(); // Ricarica la lista per mostrare le modifiche
    }
}
