// ===========================================
// CONFIGURAZIONE SUPABASE
// ===========================================
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;


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
// FUNZIONALITÀ ORDINI (Con N. Ordine e Nome Cliente)
// ===========================================

/**
 * 2. Recupera e visualizza tutti gli ordini.
 */
async function caricaOrdini() {
    const container = document.getElementById('ordiniLista');
    container.innerHTML = '<h2>Caricamento ordini in corso...</h2>';
    
    // Recupera ordini, includendo il nuovo campo 'num_ordine_prog'
    const { data: ordini, error } = await supabase
        .from('ordini')
        .select(`
            *,
            utente:utenti(ragione_sociale, partita_iva)
        `)
        .order('data_ordine', { ascending: false }); 

    if (error) {
        // Se la policy SELECT RLS non è ancora implementata, darà errore.
        container.innerHTML = `<p style="color: red;">Errore nel recupero ordini: ${error.message}.</p>`;
        return;
    }

    if (ordini.length === 0) {
        container.innerHTML = '<h2>Nessun ordine ricevuto.</h2>';
        return;
    }

    // Aggiorna l'intestazione della tabella per mostrare "N. Ordine" e "Cliente"
    let html = `<table><thead><tr>
        <th>N. Ordine</th><th>Cliente</th><th>P. IVA</th><th>Data</th><th>Totale</th><th>Stato</th><th>Azioni</th>
        </tr></thead><tbody>`;
    
    ordini.forEach(ordine => {
        const dettagliProdotti = JSON.stringify(ordine.dettagli_prodotti).replace(/"/g, '&quot;');
        
        // ** MODIFICA 1: Visualizzazione Nome Cliente **
        // Utilizza ragione_sociale, fallback all'UUID se non è popolato
        const clienteNome = (ordine.utente && ordine.utente.ragione_sociale) ? ordine.utente.ragione_sociale : 'ID: ' + (ordine.user_id ? ordine.user_id.substring(0, 8) : 'N/D');
        const clientePiva = (ordine.utente && ordine.utente.partita_iva) || 'N/D';
        
        // ** MODIFICA 2: Utilizzo di num_ordine_prog **
        const numeroOrdine = ordine.num_ordine_prog || ordine.id.substring(0, 8) + '...';
        
        html += `
            <tr data-id="${ordine.id}">
                <td>${numeroOrdine}</td> 
                <td>${clienteNome}</td>
                <td>${clientePiva}</td>
                <td>${new Date(ordine.data_ordine).toLocaleString()}</td>
                <td>€ ${ordine.totale ? ordine.totale.toFixed(2) : '0.00'}</td>
                <td>
                    <select class="stato-select" data-id="${ordine.id}">
                        <option value="In attesa di lavorazione" ${ordine.stato === 'In attesa di lavorazione' ? 'selected' : ''}>In attesa di lavorazione</option>
                        <option value="In lavorazione" ${ordine.stato === 'In lavorazione' ? 'selected' : ''}>In lavorazione</option>
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
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
    document.querySelectorAll('.stato-select').forEach(select => {
        select.addEventListener('change', (e) => aggiornaStatoOrdine(e.target.dataset.id, e.target.value));
    });
}

/**
 * 3. Aggiorna lo stato di un ordine nel DB.
 */
async function aggiornaStatoOrdine(ordineId, nuovoStato) {
    if (!confirm(`Confermi il cambio stato dell'ordine ${ordineId.substring(0, 8)} a "${nuovoStato}"?`)) {
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
    }
}

/**
 * 4. Mostra i dettagli dell'ordine, inclusi i link ai file.
 */
function mostraDettagli(ordineId, dettagliProdottiString) {
    const dettagli = JSON.parse(dettagliProdottiString);
    let dettagliHtml = `Ordine ID: ${ordineId.substring(0, 8)}...\n\nDETTAGLI PRODOTTI:\n`;
    
    dettagli.forEach(item => {
        dettagliHtml += `\n--- ${item.prodotto} (${item.quantita} pz) ---\n`;
        dettagliHtml += `Componenti: ${item.componenti.join(', ')}\n`;
        dettagliHtml += `Prezzo: € ${item.prezzo_unitario}\n`;
        
        if (item.personalizzazione_url) {
            dettagliHtml += `File: COPIA E APRI L'URL:\n${item.personalizzazione_url}\n`;
        } else {
            dettagliHtml += `File: Nessun file caricato.\n`;
        }
    });

    alert(dettagliHtml); 
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
        caricaOrdini();
    }
});
