// CONFIGURAZIONE SUPABASE
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 

if (!window.supabaseClient) {
    if (typeof window.supabase !== 'undefined') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
}
var supabase = window.supabaseClient;

let ordineSelezionatoId = null; // Per tenere traccia di quale ordine stiamo modificando

// 1. VERIFICA PERMESSI OPERATORE
async function verificaOperatore() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = 'login.html'; return; }

    const { data: profilo, error } = await supabase
        .from('utenti')
        .select('permessi')
        .eq('id', user.id)
        .single();

    if (error || !profilo || profilo.permessi !== 'operatore') {
        alert("Accesso Negato: Area riservata agli operatori.");
        await supabase.auth.signOut();
        window.location.href = 'login.html';
        return;
    }
    
    // Se è operatore, carica i dati
    caricaTuttiGliOrdini();
}

// 2. CARICAMENTO ORDINI
async function caricaTuttiGliOrdini() {
    const tbody = document.getElementById('listaOrdiniBody');
    const table = document.getElementById('tabellaOrdini');
    const loading = document.getElementById('loadingMessage');

    // Prendi TUTTI gli ordini (senza filtro user_id)
    const { data: ordini, error } = await supabase
        .from('ordini')
        .select('*')
        .order('data_ordine', { ascending: false });

    if (error) {
        loading.textContent = "Errore caricamento ordini: " + error.message;
        return;
    }

    tbody.innerHTML = '';
    
    ordini.forEach(ordine => {
        const numOrdine = ordine.num_ordine_prog || ordine.id.substring(0, 8).toUpperCase();
        const dataFmt = new Date(ordine.data_ordine).toLocaleString();
        
        // ESTRAZIONE NOME CLIENTE (Il famoso "Commento")
        let nomeCliente = '<span style="color: #999;">N/D</span>';
        
        if (ordine.dettagli_prodotti && Array.isArray(ordine.dettagli_prodotti)) {
            // Cerchiamo l'oggetto INFO_CLIENTE che abbiamo salvato nel carrello
            const info = ordine.dettagli_prodotti.find(item => item.tipo === 'INFO_CLIENTE');
            if (info && info.cliente) {
                nomeCliente = `<strong>${info.cliente}</strong>`;
            }
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${numOrdine}</td>
            <td>${dataFmt}</td>
            <td>${nomeCliente}</td>
            <td><span class="stato-${ordine.stato.replace(/\s/g, '-')}">${ordine.stato}</span></td>
            <td>
                <button class="btn-edit" onclick="apriModaleModifica('${ordine.id}', '${ordine.num_ordine_prog || ''}', '${ordine.stato}')">
                    ✏️ Modifica
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    loading.style.display = 'none';
    table.style.display = 'table';
}

// 3. GESTIONE MODALE
window.apriModaleModifica = function(id, numProg, statoAttuale) {
    ordineSelezionatoId = id;
    document.getElementById('modalOrderIdLabel').textContent = numProg || id.substring(0,8);
    document.getElementById('nuovoStatoSelect').value = statoAttuale;
    document.getElementById('modalStato').style.display = 'flex'; // Flex per centrare
}

// 4. SALVATAGGIO STATO
document.getElementById('btnSalvaStato').addEventListener('click', async () => {
    if (!ordineSelezionatoId) return;

    const nuovoStato = document.getElementById('nuovoStatoSelect').value;
    const btn = document.getElementById('btnSalvaStato');
    btn.textContent = "Salvataggio...";
    btn.disabled = true;

    const { error } = await supabase
        .from('ordini')
        .update({ stato: nuovoStato })
        .eq('id', ordineSelezionatoId);

    if (error) {
        alert("Errore aggiornamento: " + error.message);
    } else {
        // Chiudi modale e ricarica tabella
        document.getElementById('modalStato').style.display = 'none';
        caricaTuttiGliOrdini();
    }

    btn.textContent = "Salva Modifica";
    btn.disabled = false;
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
});

// Chiusura Modale
document.getElementById('closeModalStato').addEventListener('click', () => {
    document.getElementById('modalStato').style.display = 'none';
});

// Avvio
document.addEventListener('DOMContentLoaded', verificaOperatore);
