// Inserisci qui le tue chiavi API di Supabase. Le trovi nella dashboard del tuo progetto, in "Settings" -> "API".
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw';

// Crea il client Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funzione principale per gestire l'autocompletamento
async function avviaAutocompletamento() {
    const inputRicerca = document.getElementById('ricercaProdotto');
    const dataList = document.getElementById('codiciProdottiList');
    const inputCodiceInterno = document.getElementById('codiceInterno');

    if (!inputRicerca) {
        console.error('Errore: elemento "ricercaProdotto" non trovato nel DOM.');
        return;
    }

    // Autocompletamento
    inputRicerca.addEventListener('input', async () => {
        const valoreRicerca = inputRicerca.value.toLowerCase();
        dataList.innerHTML = ''; // Svuota il menù a tendina

        if (valoreRicerca.length >= 2) {
            const { data: prodotti, error } = await supabase
                .from('prodotti')
                .select('Cod, Prezzo_forn')
                .ilike('Cod', `${valoreRicerca}%`);

            if (error) {
                console.error('Errore durante la ricerca:', error);
                return;
            }

            prodotti.forEach(prodotto => {
                const opzione = document.createElement('option');
                opzione.value = prodotto.Cod;
                dataList.appendChild(opzione);
            });
        }
    });

    // Quando selezioni un prodotto
    inputRicerca.addEventListener('change', async () => {
        const codiceSelezionato = inputRicerca.value;

        const { data: prodotto, error } = await supabase
            .from('prodotti')
            .select('Prezzo_forn')
            .eq('Cod', codiceSelezionato)
            .single();

        if (error || !prodotto) {
            console.error('Errore o prodotto non trovato:', error);
            inputCodiceInterno.value = '';
            return;
        }

        // Prezzo già numerico, quindi non serve .replace()
        const prezzoNumero = prodotto.Prezzo_forn;

        if (!isNaN(prezzoNumero)) {
            inputCodiceInterno.value = prezzoNumero.toFixed(2);
        } else {
            inputCodiceInterno.value = '';
            console.error('Prezzo non valido nel database:', prodotto.Prezzo_forn);
        }
    });
}

document.addEventListener('DOMContentLoaded', avviaAutocompletamento);

