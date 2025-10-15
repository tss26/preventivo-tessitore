// ===========================================
// CONFIGURAZIONE SUPABASE
// ===========================================
// Le credenziali sono state prese dal file autocomplete.js
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 
 
// Crea il client Supabase solo se la libreria è caricata
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;


// ===========================================
// FUNZIONI DI AUTENTICAZIONE
// ===========================================

/**
 * Gestisce la registrazione di un nuovo utente.
 */
async function handleRegister(email, password) {
    if (!supabase) {
        alert("Errore: Connessione a Supabase non riuscita.");
        return;
    }
    
    // 1. Esegue la registrazione in auth.users
    const { data, error } = await supabase.auth.signUp({ // Modificato per catturare 'data'
        email: email,
        password: password,
    });

    if (error) {
        // La maggior parte degli errori qui è dovuta a password troppo deboli o email già registrate.
        alert(`Errore di registrazione: ${error.message}`);
        return;
    }
    
    // 2. NUOVO PASSO CRITICO: Inserimento nella tabella 'utenti' (profili)
    if (data.user) {
        try {
            // L'utente è stato creato in auth.users, ora lo creiamo nella tabella 'utenti'
            const { error: utentiError } = await supabase
                .from('utenti')
                .insert([
                    { 
                        id: data.user.id, // Usa l'ID utente creato in auth.users
                        // Puoi aggiungere qui altri campi obbligatori della tua tabella utenti
                        ragione_sociale: 'Cliente Registrato', 
                        // ...
                    }
                ]);

            if (utentiError) {
                console.error("Attenzione! Errore nell'inserimento in tabella utenti, ma registrazione auth ok:", utentiError);
                // Non blocchiamo l'utente, ma avvisiamo in console
            }
        } catch (e) {
            console.error("Eccezione durante l'inserimento in utenti:", e);
        }
    }
    // ******************************************************
    
    // 3. Successo: Supabase invia automaticamente l'email di conferma
    alert("Registrazione completata! Controlla la tua email per il link di conferma, poi prova ad accedere.");
    // Non reindirizziamo finché l'utente non conferma l'email.
}

/**
 * Gestisce il login di un utente esistente.
 */
async function handleLogin(email, password) {
    if (!supabase) {
        alert("Errore: Connessione a Supabase non riuscita.");
        return;
    }
    
    // 1. Esegue il login
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert(`Accesso fallito: ${error.message}. Verifica credenziali o conferma email.`);
        return;
    }
    
    // 2. Login di successo!
    alert("Accesso effettuato con successo!");
    
    // 3. Reindirizzamento all'area cliente
    window.location.href = 'cliente.html';
}


// ===========================================
// EVENT LISTENERS E LOGICA
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const registerBtn = document.getElementById('registerBtn');
    
    // Listener per il SUBMIT del form (tentativo di Login)
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            handleLogin(email, password);
        });
    }

    // Listener per il pulsante di Registrazione
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            if (email && password) {
                handleRegister(email, password);
            } else {
                alert("Inserisci Email e Password nei campi per la registrazione.");
            }
        });
    }
    
    // Logica di gestione della sessione (opzionale, ma utile per reindirizzare)
    // Se l'utente è già loggato e arriva su login.html, lo reindirizziamo
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && window.location.pathname.endsWith('login.html')) {
            // Se la sessione esiste e siamo sulla pagina di login, andiamo all'area cliente
            window.location.href = 'cliente.html';
        }
    });
});
