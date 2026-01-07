// CONFIGURAZIONE SUPABASE
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 

if (!window.supabaseClient) {
    if (typeof window.supabase !== 'undefined') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
}
var supabase = window.supabaseClient;

let ordineSelezionatoId = null; 
let ordiniGlobali = []; // Variabile per salvare i dati scaricati

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
    caricaTuttiGliOrdini();
}

// 2. CARICAMENTO ORDINI
async function caricaTuttiGliOrdini() {
    const tbody = document.getElementById('listaOrdiniBody');
    const table = document.getElementById('tabellaOrdini');
    const loading = document.getElementById('loadingMessage');

    const { data: ordini, error } = await supabase
        .from('ordini')
        .select('*')
        .order('data_ordine', { ascending: false });

    if (error) {
        loading.textContent = "Errore caricamento ordini: " + error.message;
        return;
    }

    // Salviamo gli ordini nella variabile globale per usarli nel dettaglio
    ordiniGlobali = ordini;

    tbody.innerHTML = '';
    
    ordini.forEach(ordine => {
        const numOrdine = ordine.num_ordine_prog || ordine.id.substring(0, 8).toUpperCase();
        const dataFmt = new Date(ordine.data_ordine).toLocaleString();
        
        let nomeCliente = '<span style="color: #999;">N/D</span>';
        if (ordine.dettagli_prodotti && Array.isArray(ordine.dettagli_prodotti)) {
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
                <button class="btn-info" onclick="apriDettagliPreventivo('${ordine.id}')">
                    📄 Visualizza
                </button>
                <button class="btn-edit" onclick="apriModaleModifica('${ordine.id}', '${numOrdine}', '${ordine.stato}')">
                    ✏️ Stato
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    loading.style.display = 'none';
    table.style.display = 'table';
}

// 3. NUOVA FUNZIONE: APRI DETTAGLI (SENZA PREZZI)
window.apriDettagliPreventivo = function(id) {
    const ordine = ordiniGlobali.find(o => o.id === id);
    if (!ordine) return;

    const dettagli = ordine.dettagli_prodotti;
    const container = document.getElementById('contenutoDettagli');
    let html = "";

    // Info Cliente
    const infoCliente = dettagli.find(d => d.tipo === 'INFO_CLIENTE');
    if (infoCliente) {
        html += `<div style="background: #f1f8ff; padding: 10px; border-radius: 5px; margin-bottom: 15px; border: 1px solid #cce5ff;">`;
        html += `<strong>Cliente:</strong> ${infoCliente.cliente || '---'}<br>`;
        html += `<strong>Riferimenti:</strong> ${infoCliente.contatti || '---'}`;
        html += `</div>`;
    }

    html += `<strong>ARTICOLI DA PRODURRE:</strong><br>`;

    dettagli.forEach(item => {
        if (item.tipo === 'INFO_CLIENTE') return;

        html += `<div style="border-bottom: 1px solid #eee; padding: 10px 0; margin-bottom: 5px;">`;
        html += `<strong style="font-size: 1.1em;">${item.prodotto}</strong> (${item.quantita} pz)`;
        
        // Componenti
        if (item.componenti && item.componenti.length > 0) {
             html += `<div style="color: #555; font-size: 0.9em;">Componenti: ${item.componenti.join(', ')}</div>`;
        }
        
        // Taglie
        if (item.dettagli_taglie && Object.keys(item.dettagli_taglie).length > 0) {
            html += `<div style="margin-top: 5px; background: #fafafa; padding: 5px; border-radius: 4px;">`;
            for (const genere in item.dettagli_taglie) {
                const taglie = Object.entries(item.dettagli_taglie[genere])
                    .map(([taglia, qty]) => `<b>${taglia}</b>: ${qty}`)
                    .join(' | ');
                html += `<div>${genere}: ${taglie}</div>`;
            }
            html += `</div>`;
        }
        
        // Note Articolo
        if (item.note && item.note.trim() !== '') {
            html += `<div style="margin-top: 5px; color: #d63384;"><em>Note: ${item.note}</em></div>`;
        }

        // File Allegato (Con logica link cliccabile)
        if (item.personalizzazione_url && item.personalizzazione_url !== 'Nessun file collegato direttamente.') {
            if (item.personalizzazione_url.includes('http')) {
                html += `<div style="margin-top: 5px;">File: <a href="${item.personalizzazione_url}" target="_blank" style="color: #007bff; text-decoration: underline; font-weight: bold; cursor: pointer;">Visualizza Allegato 📎</a></div>`;
            } else {
                html += `<div style="margin-top: 5px;">File: ${item.personalizzazione_url}</div>`;
            }
        }
        
        html += `</div>`;
    });

    // NOTE: NON AGGIUNGIAMO TOTALI NÉ IBAN QUI.

    container.innerHTML = html;
    document.getElementById('modalDettagli').style.display = 'flex';
}

// 4. GESTIONE MODALE STATO (Esistente)
window.apriModaleModifica = function(id, numProg, statoAttuale) {
    ordineSelezionatoId = id;
    document.getElementById('modalOrderIdLabel').textContent = numProg;
    document.getElementById('nuovoStatoSelect').value = statoAttuale;
    document.getElementById('modalStato').style.display = 'flex';
}

document.getElementById('btnSalvaStato').addEventListener('click', async () => {
    if (!ordineSelezionatoId) return;
    const nuovoStato = document.getElementById('nuovoStatoSelect').value;
    
    // Aggiorna stato su Supabase
    const { error } = await supabase
        .from('ordini')
        .update({ stato: nuovoStato })
        .eq('id', ordineSelezionatoId);

    if (error) {
        alert("Errore: " + error.message);
    } else {
        document.getElementById('modalStato').style.display = 'none';
        caricaTuttiGliOrdini(); // Ricarica tabella
    }
});

// GESTIONE CHIUSURA MODALI
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
});

// Chiudi modale Stato
document.getElementById('closeModalStato').addEventListener('click', () => {
    document.getElementById('modalStato').style.display = 'none';
});

// Chiudi modale Dettagli (Nuovo)
document.getElementById('closeModalDettagli').addEventListener('click', () => {
    document.getElementById('modalDettagli').style.display = 'none';
});

// Chiudi cliccando fuori
window.addEventListener('click', (e) => {
    const mStato = document.getElementById('modalStato');
    const mDett = document.getElementById('modalDettagli');
    if (e.target === mStato) mStato.style.display = 'none';
    if (e.target === mDett) mDett.style.display = 'none';
});

// Avvio
document.addEventListener('DOMContentLoaded', verificaOperatore);
