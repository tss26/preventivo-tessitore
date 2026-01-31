// ===========================================
// CONFIGURAZIONE SUPABASE (PROFILO)
// ===========================================
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 

// Verifica se window.supabaseClient esiste già per evitare doppi caricamenti
if (!window.supabaseClient) {
    if (typeof window.supabase !== 'undefined') {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
}

// Usa var (non const) per evitare l'errore "already declared"
var supabase = window.supabaseClient;

if (!supabase) {
    console.error("ATTENZIONE: Client Supabase non inizializzato in profilo.js");
}

let currentUserId = null;
const LOGIN_REDIRECT_URL = 'login.html';
// ===========================================
// FUNZIONI DI UTILITY
// ===========================================

/**
 * Gestisce il logout (reindirizza all'URL specifico).
 */
async function handleLogout() {
    if (!confirm("Sei sicuro di voler uscire?")) { return; }
    const { error } = await supabase.auth.signOut();
    if (error) { console.error('Errore durante il logout:', error); } 
    else { window.location.href = LOGIN_REDIRECT_URL; }
}

/**
 * Mostra o nasconde i campi dell'indirizzo merce in base alla checkbox.
 */
function toggleMerceAddressFields(isSame) {
    const fieldsContainer = document.getElementById('merceAddressFields');
    if (!fieldsContainer) return;

    fieldsContainer.style.display = isSame ? 'none' : 'block';
    
    // Rimuovi/Aggiungi l'attributo 'required' dinamicamente per la validazione del browser
    fieldsContainer.querySelectorAll('input').forEach(input => {
        if (isSame) {
            input.removeAttribute('required');
        } else {
            input.setAttribute('required', 'true');
        }
    });
}

// ===========================================
// LOGICA DI CARICAMENTO E SALVATAGGIO PROFILO
// ===========================================

/**
 * 1. Carica i dati dell'utente loggato e popola il form.
 */
async function loadUserProfile() {
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        window.location.href = LOGIN_REDIRECT_URL;
        return;
    }
    
    currentUserId = user.id;

    const logoElement = document.querySelector('.logo');
    
    // Carica il profilo dalla tabella 'utenti'
    const { data: profile, error } = await supabase
        .from('utenti')
        .select(`
            email, ragione_sociale, partita_iva, telefono, permessi, percentuale_sconto, sdi,
            indirizzo_legale_via, indirizzo_legale_cap, indirizzo_legale_citta, indirizzo_legale_provincia,
            stesso_indirizzo_merce, indirizzo_merce_via, indirizzo_merce_cap, indirizzo_merce_citta, indirizzo_merce_provincia
        `)
        .eq('id', currentUserId)
        .single();

    if (error || !profile) {
        console.warn("Profilo utente non trovato in 'utenti'. Potrebbe essere una nuova registrazione.");
    }
    
    // Blocco utenti disattivati (sicurezza critica)
    if (profile && (profile.permessi === 'disattivato' || profile.permessi === 'admin')) {
         if (profile.permessi === 'disattivato') {
            alert('Accesso negato. Il tuo account è disattivato.');
         } else {
             alert('Sei un Amministratore. Usa la dashboard Admin.');
         }
         await supabase.auth.signOut();
         window.location.href = LOGIN_REDIRECT_URL;
         return;
    }


    // Popola il form con dati esistenti (o vuoti se profile è nullo)
    document.getElementById('userId').value = currentUserId;
    document.getElementById('email').value = profile?.email || user.email; 
    
    // Aggiorna il logo dopo aver ottenuto la ragione sociale
    if (logoElement) { 
         logoElement.innerHTML = `<img src="icon-192.png" alt="Logo Tessitore" style="height: 40px; vertical-align: middle;"> Profilo: ${profile?.ragione_sociale || user.email}`; 
    }
    
    document.getElementById('ragione_sociale').value = profile?.ragione_sociale || '';
    document.getElementById('partita_iva').value = profile?.partita_iva || '';
    document.getElementById('telefono').value = profile?.telefono || '';
    document.getElementById('sdi').value = profile?.sdi || '';
    document.getElementById('percentuale_sconto').value = profile?.percentuale_sconto || 0;

    // Indirizzo Legale
    document.getElementById('legale_via').value = profile?.indirizzo_legale_via || '';
    document.getElementById('legale_cap').value = profile?.indirizzo_legale_cap || '';
    document.getElementById('legale_citta').value = profile?.indirizzo_legale_citta || '';
    document.getElementById('legale_provincia').value = profile?.indirizzo_legale_provincia || '';

    // Checkbox Merce
    const isSameAddress = profile?.stesso_indirizzo_merce === true;
    document.getElementById('stesso_indirizzo_merce').checked = isSameAddress;
    
    // Indirizzo Merce
    document.getElementById('merce_via').value = profile?.indirizzo_merce_via || '';
    document.getElementById('merce_cap').value = profile?.indirizzo_merce_cap || '';
    document.getElementById('merce_citta').value = profile?.indirizzo_merce_citta || '';
    document.getElementById('merce_provincia').value = profile?.indirizzo_merce_provincia || '';
    
    // Nascondi i campi merce se la checkbox è spuntata
    toggleMerceAddressFields(isSameAddress);
}

/**
 * 2. Salva i dati del profilo sul database.
 */
async function saveUserProfile(event) {
    event.preventDefault();
    // --- MODIFICA CONTROLLO PRIVACY ---
    const checkPrivacy = document.getElementById('accettazionePrivacy');
    if (!checkPrivacy || !checkPrivacy.checked) {
        alert("ERRORE: Per salvare il profilo è OBBLIGATORIO accettare Privacy Policy e Termini e Condizioni.");
        return; // Blocca il salvataggio
    }
    // ----------------------------------

    const userId = document.getElementById('userId').value;
    const telefono = document.getElementById('telefono').value.trim();
    
    // MODIFICA CRITICA: Controllo Telefono Obbligatorio
    if (!telefono) {
        alert("ATTENZIONE INSERIRE IL TELEFONO è OBBLIGATORIO");
        return; // Blocca il salvataggio
    }
    
    // Recupero tutti gli altri campi
    const ragione_sociale = document.getElementById('ragione_sociale').value;
    const partita_iva = document.getElementById('partita_iva').value;
    const sdi = document.getElementById('sdi').value;
    
    const legale_via = document.getElementById('legale_via').value;
    const legale_cap = document.getElementById('legale_cap').value;
    const legale_citta = document.getElementById('legale_citta').value;
    const legale_provincia = document.getElementById('legale_provincia').value;

    const stesso_merce = document.getElementById('stesso_indirizzo_merce').checked;

    // Gestione campi Merce (copia i dati legali se checkbox spuntata)
    const merce_via = stesso_merce ? legale_via : document.getElementById('merce_via').value;
    const merce_cap = stesso_merce ? legale_cap : document.getElementById('merce_cap').value;
    const merce_citta = stesso_merce ? legale_citta : document.getElementById('merce_citta').value;
    const merce_provincia = stesso_merce ? legale_provincia : document.getElementById('merce_provincia').value;

    // I campi 'permessi' e 'percentuale_sconto' sono ESCLUSI da updatedData

    const updatedData = {
        ragione_sociale: ragione_sociale,
        partita_iva: partita_iva,
        telefono: telefono, 
        sdi: sdi,
        
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
    
    // Salva su Supabase
    const { error } = await supabase
        .from('utenti')
        .update(updatedData)
        .eq('id', userId);
    
    if (error) {
        alert(`Errore nel salvataggio del profilo: ${error.message}.`);
    } else {
        alert('Profilo aggiornato con successo!');
        // Ricarica per visualizzare i nuovi dati
        loadUserProfile(); 
    }
}

// ===========================================
// INIZIALIZZAZIONE
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    // Carica il profilo all'avvio
    loadUserProfile();
    
    // Listener per il pulsante di logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Listener per il submit del form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', saveUserProfile);
    }
    
    // Listener per la checkbox dell'indirizzo merce
    const merceCheckbox = document.getElementById('stesso_indirizzo_merce');
    if (merceCheckbox) {
        merceCheckbox.addEventListener('change', (e) => toggleMerceAddressFields(e.target.checked));
    }
});
