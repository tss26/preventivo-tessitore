import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.43.2/dist/module.js';

// Inserisci qui le tue chiavi API di Supabase. Le trovi nella dashboard del tuo progetto, in "Settings" -> "API".
const SUPABASE_URL = 'https://jukyggaoiekenvekoicv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1a3lnZ2FvaWVrZW52ZWtvaWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNjEwOTgsImV4cCI6MjA3MjYzNzA5OH0.84lO4yqqZ6pbVLX0hlxOC3qgK508y1gFxeSp3Wx3kkw';


const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Funzione principale per gestire l'autocompletamento
async function avviaAutocompletamento() {
    const inputRicerca = document.getElementById('ricercaProdotto');
    const dataList = document.getElementById('codiciProdottiList');
    const inputCodiceInterno = document.getElementById('codiceInterno');

    inputRicerca.addEventListener('input', async () => {
        const valoreRicerca = inputRicerca.value.toLowerCase();
        dataList.innerHTML = ''; // Svuota il menù a tendina

        if (valoreRicerca.length >= 2) { // Ricerca solo dopo almeno 2 caratteri per efficienza
            // Esegue la query al database Supabase
            const { data: prodotti, error } = await supabase
                .from('prodotti')
                .select('Cod., Prezzo forn.')
                .ilike('Cod.', `${valoreRicerca}%`);

            if (error) {
                console.error('Errore durante la ricerca:', error);
                return;
            }

            prodotti.forEach(prodotto => {
                const opzione = document.createElement('option');
                opzione.value = prodotto['Cod.'];
                dataList.appendChild(opzione);
            });
        }
    });

    inputRicerca.addEventListener('change', async () => {
        const codiceSelezionato = inputRicerca.value;

        // Esegue la query per recuperare il prezzo esatto del prodotto selezionato
        const { data: prodotto, error } = await supabase
            .from('prodotti')
            .select('Prezzo forn.')
            .eq('Cod.', codiceSelezionato)
            .single();

        if (error || !prodotto) {
            console.error('Errore o prodotto non trovato:', error);
            inputCodiceInterno.value = '';
            return;
        }

        const prezzoStringa = prodotto['Prezzo forn.'];
        const prezzoNumero = parseFloat(prezzoStringa.replace('€ ', '').replace(',', '.'));
        
        if (!isNaN(prezzoNumero)) {
            inputCodiceInterno.value = prezzoNumero.toFixed(2);
        } else {
            inputCodiceInterno.value = '';
            console.error('Prezzo non valido nel database:', prezzoStringa);
        }
    });
}

document.addEventListener('DOMContentLoaded', avviaAutocompletamento);
