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

// FUNZIONALITÀ ORDINI (Con N. Ordine leggibile e Nome Cliente)

// ===========================================



/**

 * 2. Recupera e visualizza tutti gli ordini.

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

        

        // --- LOGICA DI VISUALIZZAZIONE ---

        // N. Ordine (Prima il campo progressivo, poi l'UUID troncato se manca)

        const numeroOrdine = ordine.num_ordine_prog 

            ? ordine.num_ordine_prog 

            : ordine.id.substring(0, 8).toUpperCase(); 



        // Nome Cliente (con fallback robusto: Ragione Sociale > ID troncato)

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
/*
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
----------*/


/**
 * 4. Mostra i dettagli dell'ordine in un modale HTML selezionabile.
 * Questa funzione sostituisce il vecchio alert() nel pannello Admin.
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
/*dettagli.forEach(item => {
       outputHtml += `\n--- ${item.prodotto} (${item.quantita} pz) ---\n`;
        outputHtml += `Componenti: ${item.componenti.join(', ')}\n`;
        outputHtml += `Prezzo netto cad.: € ${item.prezzo_unitario}\n`;
*/


     
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
// Convertiamo la stringa dettagliHtml in un array di righe per usare i tag HTML
    let outputHtml = '';
        // Logica File
        if (item.personalizzazione_url && item.personalizzazione_url !== 'Nessun file collegato direttamente.') {
           // dettagliHtml += `File: COPIA E APRI L'URL:\n${item.personalizzazione_url}\n`;
         const url = item.personalizzazione_url;
         outputHtml += `File: <a href="${url}" target="_blank" style="color: blue;">SCARICA / VISUALIZZA FILE</a>\n`;
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

    // ... (resto delle chiamate come caricaOrdini())
        caricaOrdini();
    }

});
