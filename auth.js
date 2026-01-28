// ===========================================
// CONFIGURAZIONE SUPABASE
// ===========================================
// Le credenziali sono state prese dal file autocomplete.js
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw'; 

// Usa 'var' o controlla l'esistenza per evitare "Identifier already declared"
if (typeof window.supabaseClient === 'undefined') {
    window.supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
}
var supabase = window.supabaseClient;



// Crea il client Supabase solo se la libreria è caricata
//const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;


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
                        // I valori di ragione_sociale, partita_iva, e permessi: 'utente' sono gestiti dai DEFAULT VALUE della tabella.
                    }
                ]);

            if (utentiError) {
                console.error("Attenzione! Errore nell'inserimento in tabella utenti, ma registrazione auth ok:", utentiError);
            }
        } catch (e) {
            console.error("Eccezione durante l'inserimento in utenti:", e);
        }
    }
    
    // 3. Successo: Supabase invia automaticamente l'email di conferma
    alert("Registrazione completata! Controlla la tua email per il link di conferma, poi prova ad accedere.");
    // Non reindirizziamo finché l'utente non conferma l'email.
}

/**
 * Gestisce il login di un utente esistente e il reindirizzamento in base ai permessi.
 */
async function handleLogin(email, password) {
    if (!supabase) {
        alert("Errore: Connessione a Supabase non riuscita.");
        return;
    }
    
    // 1. Esegue il login e ottiene i dati di base
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert(`Accesso fallito: ${error.message}. Verifica credenziali o conferma email.`);
        return;
    }
    
    const userId = data.user.id;
    
    // 2. RECUPERA I PERMESSI DALLA TABELLA 'utenti'
    const { data: profilo, error: profiloError } = await supabase
        .from('utenti')
        .select('permessi')
        .eq('id', userId)
        .single();

    if (profiloError) {
        console.error("Errore nel recupero dei permessi utente:", profiloError);
        alert("Accesso OK, ma impossibile determinare i permessi. Reindirizzamento standard.");
        window.location.href = 'cliente.html'; 
        return;
    }

    // 3. LOGICA DI REINDIRIZZAMENTO AGGIORNATA
    const ruolo = profilo.permessi;

    if (ruolo === 'admin') {
        // alert("Bentornato Admin!"); // Opzionale
        window.location.href = 'admin.html';
    } 
    else if (ruolo === 'operatore') {
        // alert("Accesso Operatore"); // Opzionale
        window.location.href = 'operatore.html';
    } 
    else if (ruolo === 'rappresentante') {
        // alert("Accesso Rappresentante"); // Opzionale
        window.location.href = 'rappresentante.html';
    } 
    else {
        // Se è 'cliente' o qualsiasi altra cosa
        window.location.href = 'cliente.html';
    }
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
    // Nuovo codice intelligente (VERSIONE PROTETTA):
    // Controlliamo che 'supabase' esista prima di usarlo per evitare crash
    if (typeof supabase !== 'undefined' && supabase) {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            // Se c'è una sessione attiva E l'utente è sulla pagina di login
            if (session && window.location.href.includes('login.html')) {
                
                console.log("Utente già loggato. Controllo permessi...");

                // Controlliamo al volo che ruolo ha per mandarlo alla pagina giusta
                const { data: profilo, error } = await supabase
                    .from('utenti')
                    .select('permessi')
                    .eq('id', session.user.id)
                    .single();

                // Se non troviamo il profilo o c'è un errore, mandiamo al cliente standard per sicurezza
                if (error || !profilo) {
                    window.location.href = 'cliente.html';
                    return;
                }

                if (profilo.permessi === 'admin') window.location.href = 'admin.html';
                else if (profilo.permessi === 'operatore') window.location.href = 'operatore.html';
                else if (profilo.permessi === 'rappresentante') window.location.href = 'rappresentante.html';
                else window.location.href = 'cliente.html';
            }
        }).catch(err => console.log("Nessuna sessione attiva o errore:", err));
    }

    // --- FINE DEL CODICE NUOVO ---
// ===========================================
    // LOGICA RESET PASSWORD (NUOVA AGGIUNTA)
    // ===========================================
    const modalReset = document.getElementById('modalResetPassword');
    const btnForgot = document.getElementById('btnPasswordDimenticata');
    const btnCloseReset = document.getElementById('closeResetModal'); // Assicurati che l'icona X nel modale abbia questo ID
    const btnInviaRecupero = document.getElementById('btnInviaRecupero');

    // 1. APERTURA MODALE
    if (btnForgot && modalReset) {
        btnForgot.addEventListener('click', (e) => {
            e.preventDefault();
            modalReset.style.display = 'flex'; // Usa flex per centrare se hai impostato il css flex nel modale
        });
    }

    // 2. CHIUSURA MODALE (X)
    // Nota: Aggiungi id="closeResetModal" alla X nel tuo HTML se non c'è già, oppure usa l'onclick inline che avevi
    if (btnCloseReset && modalReset) {
        btnCloseReset.addEventListener('click', () => {
            modalReset.style.display = 'none';
        });
    }
    
    // 3. CHIUSURA CLICCANDO FUORI
    window.addEventListener('click', (e) => {
        if (modalReset && e.target === modalReset) {
            modalReset.style.display = 'none';
        }
    });

    // 4. INVIO EMAIL A SUPABASE
    if (btnInviaRecupero) {
        btnInviaRecupero.addEventListener('click', async () => {
            const email = document.getElementById('emailRecupero').value.trim();
            
            if (!email) {
                alert("Inserisci un'email valida.");
                return;
            }

            // Feedback visivo
            btnInviaRecupero.textContent = "Invio in corso...";
            btnInviaRecupero.disabled = true;

            // URL dove l'utente atterrerà (il file che creeremo dopo)
            const redirectUrl = 'https://tss26.github.io/preventivo-tessitore/nuova_password.html';

            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (error) {
                alert("Errore: " + error.message);
                btnInviaRecupero.textContent = "Invia Link Reset";
                btnInviaRecupero.disabled = false;
            } else {
                alert("Controlla la tua email! Se l'indirizzo è registrato, riceverai un link per reimpostare la password.");
                if(modalReset) modalReset.style.display = 'none';
                btnInviaRecupero.textContent = "Invia Link Reset";
                btnInviaRecupero.disabled = false;
            }
        });
    }



});
