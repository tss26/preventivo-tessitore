// ===========================================
// CONFIGURAZIONE SUPABASE
// ===========================================
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let utenteCorrenteId = null; // Variabile globale per l'ID utente

// ===========================================
// GESTIONE CARRELLO (LOGICA)
// (CODICE PRESO DA carrello.js)
// ===========================================

// 1. Inizializzazione del Carrello da localStorage
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

/**
 * Aggiorna la sezione "Il tuo preventivo" (aside.preventivo).
 */
function aggiornaUIPreventivo() {
    // Nota: Ho modificato le selezioni DOM per usare gli ID del file cliente.html
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
        
        // FIX BUG: Usa 'parti' e verifica l'anno
        if (parti.length === 2 && parti[0] === annoCorrente && !isNaN(parseInt(parti[1]))) {
            prossimoNumero = parseInt(parti[1]) + 1;
        }
    }
    
    const numeroFormattato = prossimoNumero.toString().padStart(4, '0');
    
    return `${annoCorrente}/${numeroFormattato}`; 
}


// ===========================================
// LOGICA ACQUISTO E CHECKOUT (DA carrello.js)
// ===========================================

/**
 * Funzione principale per gestire l'aggiunta al carrello (esempio per Bandiere).
 */
async function gestisciAggiuntaAlCarrello() {
    const fileInput = document.getElementById('fileUpload');
    const qta = parseInt(document.getElementById('qta').value);
    const formaElement = document.querySelector('.forma.active');
    
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
    
    // Dopo l'aggiunta, apri la sidebar (se stai usando il layout sidebar)
    // apriSidebar(); 
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
    
    document.querySelector('.logo').innerHTML = `<img src="icon-192.png" alt="Logo Tessitore" style="height: 40px; vertical-align: middle;"> Cliente: ${profilo?.ragione_sociale || user.email}`;

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
// FUNZIONALITÀ ORDINI CLIENTE (Viste e Caricamento)
// ===========================================

// ... (Includi qui le funzioni caricaMieiOrdini, mostraDettagliOrdine, mostraVistaPreventivo, mostraVistaOrdini se vuoi che la pagina funzioni) ...
// (Omesso per brevità in questa risposta, ma devi copiarle dal tuo file precedente)


// ===========================================
// INIZIALIZZAZIONE & EVENT LISTENERS
// ===========================================

document.addEventListener('DOMContentLoaded', async () => {
    
    const isLogged = await verificaCliente();
    
    if (isLogged) {
        // ASSICURATI CHE GLI ID SIANO QUELLI DEL FILE HTML
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
        
        // Listener per il pulsante AGGIUNGI AL PREVENTIVO
        document.getElementById('aggiungiBandiera').addEventListener('click', gestisciAggiuntaAlCarrello);
        
        // Listener per il pulsante RICHIESTA PREVENTIVO UFFICIALE
        document.getElementById('richiediPreventivo').addEventListener('click', gestisciCheckout);
        
        // Listener per "I Miei Ordini" (SWAP VISTA)
        document.getElementById('mieiOrdiniBtn').addEventListener('click', (e) => {
             e.preventDefault();
             // Chiamare qui la funzione che cambia la vista (mostraVistaOrdini)
        });
        
        // Carica la UI all'inizio
        aggiornaUIPreventivo();
    }
});
