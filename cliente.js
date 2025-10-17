// ===========================================
// CONFIGURAZIONE SUPABASE
// ===========================================
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let utenteCorrenteId = null; 

// ===========================================
// GESTIONE CARRELLO (LOGICA) - Dal tuo file carrello.js
// ===========================================

let carrello = JSON.parse(localStorage.getItem('carrello')) || [];

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
// LOGICA ACQUISTO (Checkout e Upload)
// ===========================================

/**
 * Funzione principale per gestire l'aggiunta al carrello (Bandiere).
 */
async function gestisciAggiuntaAlCarrello() {
    const fileInput = document.getElementById('fileUpload');
    const qta = parseInt(document.getElementById('qta').value);
    const formaElement = document.querySelector('.forme .forma.active');
    
    if (!formaElement || qta < 1 || isNaN(qta)) {
        alert("Seleziona una forma e una quantità valida (min. 1).");
        return;
    }

    const forma = formaElement.textContent.trim();
    const componenti = Array.from(document.querySelectorAll('.componenti input:checked')).map(cb => cb.parentNode.textContent.trim());

    // Logica di upload e determinazione fileUrl omessa per brevità
    let fileUrl = 'URL_UPLOAD_FITTIZIO'; 

    const nuovoArticolo = {
        id_unico: Date.now(),
        prodotto: `Bandiera ${forma} Personalizzata`,
        quantita: qta,
        personalizzazione_url: fileUrl, 
        componenti: componenti,
        prezzo_unitario: 142.75 
    };

    aggiungiAlCarrello(nuovoArticolo);
    alert(`Aggiunto ${qta}x ${nuovoArticolo.prodotto}!`);
}

/**
 * Genera il numero d'ordine progressivo (YY/XXXX) leggendo l'ultimo dal DB.
 */
async function generaNumeroOrdineTemporaneo() {
    // Logica di recupero e incremento omessa per brevità, vedi carrello.js precedente
    const { data } = await supabase
        .from('ordini')
        .select('num_ordine_prog')
        .order('data_ordine', { ascending: false })
        .limit(1)
        .single();
        
    // Restituisce un numero fittizio per garantire che l'inserimento non sia bloccato
    return "XX/9999"; 
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
// FUNZIONI DI BASE CLIENTE (Viste e Logout)
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
    
    // Aggiorna l'header per mostrare l'utente loggato
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
// FUNZIONALITÀ ORDINI CLIENTE
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
    // NOTA: Richiede una Policy RLS SELECT sulla tabella 'ordini' che permetta 'auth.uid() = user_id'
    const { data: ordini, error } = await supabase
        .from('ordini')
        .select(`*`)
        .eq('user_id', utenteCorrenteId) // FILTRO ESSENZIALE
        .order('data_ordine', { ascending: false }); 

    if (error) {
        container.innerHTML = `<p style="color: red;">Errore nel recupero ordini: ${error.message}. Verifica RLS SELECT sulla tabella ordini.</p>`;
        return;
    }

    if (ordini.length === 0) {
        container.innerHTML = '<p>Non hai ancora effettuato ordini.</p>';
        return;
    }

    // Rendering Tabella
    let html = `<table><thead><tr>
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
 * Mostra i dettagli dell'ordine (Alert).
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
    document.getElementById('preventivoView').style.display = 'contents'; // Contenuti diretti nel container
    document.getElementById('ordiniCliente').style.display = 'none';
}

/**
 * Mostra la vista Ordini.
 */
function mostraVistaOrdini() {
    // La griglia principale (container) deve avere 1 colonna per la tabella ordini.
    document.querySelector('.container').style.gridTemplateColumns = '1fr'; 
    
    // Nascondi i blocchi della Galleria
    document.querySelector('.galleria-prodotti-container').style.display = 'none'; 
    document.getElementById('sezioneCarrello').style.display = 'none'; // Nascondi il carrello sticky
    
    // Mostra la sezione Ordini
    document.getElementById('ordiniCliente').style.display = 'block'; 
    
    // Carica gli ordini
    caricaMieiOrdini();
}


// ===========================================
// INIZIALIZZAZIONE & EVENT LISTENERS
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
    
    const isLogged = await verificaCliente();
    
    if (isLogged) {
        
        // 1. ASSEGNAZIONE EVENTI ACQUISTO/LOGOUT
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
        document.getElementById('aggiungiBandiera').addEventListener('click', gestisciAggiuntaAlCarrello);
        document.getElementById('richiediPreventivo').addEventListener('click', gestisciCheckout);
        
        // 2. ASSEGNAZIONE EVENTI VISTA
        document.getElementById('mieiOrdiniBtn').addEventListener('click', (e) => {
            e.preventDefault();
            mostraVistaOrdini();
        });
        
        // 3. INIZIALIZZAZIONE: Mostra la vista Preventivo di default
        aggiornaUIPreventivo(); // Popola il carrello iniziale
        mostraVistaPreventivo();
    }
});
