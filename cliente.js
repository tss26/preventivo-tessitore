// ===========================================
// CONFIGURAZIONE SUPABASE
// ===========================================
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let utenteCorrenteId = null; 

// ===========================================
// FUNZIONI DI BASE CLIENTE
// ===========================================

/**
 * 1. Verifica se l'utente è loggato e imposta l'ID utente.
 */
async function verificaCliente() {
    if (!supabase) { console.error("Supabase non inizializzato."); return false; }
    
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        alert('Accesso negato. Effettua il login.');
        window.location.href = 'login.html'; 
        return false;
    }
    
    utenteCorrenteId = user.id;

    // Carica il profilo per mostrare il nome/email
    const { data: profilo, error } = await supabase
        .from('utenti')
        .select('ragione_sociale') 
        .eq('id', user.id)
        .single();
    
    document.querySelector('.logo').textContent = `Cliente: ${profilo?.ragione_sociale || user.email}`;

    return true; 
}

/**
 * 2. Gestisce il logout.
 */
async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Errore logout:', error);
    window.location.href = 'index.html'; 
}

// ===========================================
// FUNZIONALITÀ ORDINI CLIENTE
// ===========================================

/**
 * 3. Recupera e visualizza gli ordini specifici del cliente loggato.
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
        container.innerHTML = `<p style="color: red;">Errore nel recupero ordini: ${error.message}.</p>`;
        return;
    }

    if (ordini.length === 0) {
        container.innerHTML = '<p>Non hai ancora effettuato ordini.</p>';
        return;
    }

    let html = `
    <style>
        .lista-ordini table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .lista-ordini th, .lista-ordini td { padding: 12px 15px; border: 1px solid #ddd; text-align: left; }
        .lista-ordini th { background-color: #f1f1f1; color: #333; }
        .lista-ordini tr:nth-child(even) { background-color: #f9f9f9; }
        .lista-ordini .stato-ordine { padding: 4px 8px; border-radius: 4px; font-weight: 500; font-size: 0.9em; }
        .lista-ordini .stato-In-attesa-di-lavorazione { background-color: #ffc107; color: #333; }
        .lista-ordini .stato-In-lavorazione { background-color: #17a2b8; color: white; }
        .lista-ordini .stato-Completato { background-color: #28a745; color: white; }
        .lista-ordini .stato-Spedito { background-color: #007bff; color: white; }
    </style>
    <table><thead><tr>
        <th>N. Ordine</th><th>Data</th><th>Totale</th><th>Stato</th><th>Dettagli</th>
        </tr></thead><tbody>`;
    
    ordini.forEach(ordine => {
        const dettagliProdotti = JSON.stringify(ordine.dettagli_prodotti).replace(/"/g, '&quot;');
        
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
                    <button onclick="mostraDettagliOrdine('${ordine.id}', '${dettagliProdotti}')" class="btn-primary" style="padding: 5px 10px;">Vedi Dettagli</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

/**
 * 4. Mostra i dettagli dell'ordine.
 */
function mostraDettagliOrdine(ordineId, dettagliProdottiString) {
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

// ===========================================
// LOGICA DI SWITCH VISTE
// ===========================================

/**
 * Mostra la vista Preventivo (di default e al caricamento).
 */
function mostraVistaPreventivo() {
    // La griglia principale (container) ha 2 colonne.
    document.querySelector('.container').style.gridTemplateColumns = '2fr 1fr'; 
    document.getElementById('preventivoView').style.display = 'contents';
    document.getElementById('ordiniCliente').style.display = 'none';
}

/**
 * Mostra la vista Ordini.
 */
function mostraVistaOrdini() {
    // La griglia principale (container) deve avere 1 colonna per la tabella ordini.
    document.querySelector('.container').style.gridTemplateColumns = '1fr'; 
    document.getElementById('preventivoView').style.display = 'none';
    document.getElementById('ordiniCliente').style.display = 'block'; 
    
    // Carica gli ordini
    caricaMieiOrdini();
}

// ===========================================
// INIZIALIZZAZIONE
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Verifica accesso e imposta ID utente
    const isLogged = await verificaCliente();
    
    if (isLogged) {
        // 2. Associa il click al logout
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
        
        // 3. Associa il click al bottone "I Miei Ordini"
        document.getElementById('mieiOrdiniBtn').addEventListener('click', (e) => {
            e.preventDefault();
            mostraVistaOrdini();
        });
        
        // 4. Inserisci qui la LOGICA ORIGINALE di carrello.js se vuoi mantenerla attiva.
        // ... (Esempio: gestione click sul bottone 'Configura il tuo kit' e logica del carrello)

        
        // 5. Mostra la vista Preventivo di default
        mostraVistaPreventivo();
    }
});
