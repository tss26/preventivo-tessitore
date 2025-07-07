
const fasce = [5, 12, 20, 25, 30, 50, 75, 100];
const selezionate = [];
const descrizioni = {
  "Ricamo lato cuore": "Ricamo sul lato sinistro del petto",
  "Nome ricamato": "Nome personalizzato ricamato",
  "Stampa fronte A4": "Stampa di dimensione A4 sul fronte",
  "Stampa nome": "Nome personalizzato stampato"
};
const immagini = {};

window.selezionate = selezionate;
window.descrizioni = descrizioni;
window.immagini = immagini;

function togglePersonalizzazione(nome) {
  const index = selezionate.indexOf(nome);
  if (index > -1) {
    selezionate.splice(index, 1);
  } else {
    selezionate.push(nome);
  }
  aggiornaPrezzi();
}

function aggiornaPrezzi() {
  const codice = parseFloat(document.getElementById("codice").value);
  const scontoVal = document.getElementById("sconto").value;
  const percentualeSconto = scontoVal === "10%" ? 0.10 : scontoVal === "20%" ? 0.20 : 0;

  const header = document.getElementById("quantita-header");
  const baseRow = document.getElementById("prezzi-base");
  const scontoRow = document.getElementById("prezzi-sconto");

  header.innerHTML = "<th>Quantità</th>";
  baseRow.innerHTML = "<td>Prezzo base</td>";
  scontoRow.innerHTML = "<td>Prezzo scontato</td>";

  fasce.forEach(q => {
    let prezzo = codice * (1 + 0.4); // base semplificata
    prezzo += selezionate.length * 3; // 3€ per personalizzazione fissa

    const prezzoScontato = prezzo * (1 - percentualeSconto);

    header.innerHTML += `<th>${q}</th>`;
    baseRow.innerHTML += `<td>${prezzo.toFixed(2)}€</td>`;
    scontoRow.innerHTML += `<td>${prezzoScontato.toFixed(2)}€</td>`;
  });
}

document.getElementById("codice").addEventListener("input", aggiornaPrezzi);
document.getElementById("sconto").addEventListener("change", aggiornaPrezzi);
document.addEventListener("DOMContentLoaded", aggiornaPrezzi);
