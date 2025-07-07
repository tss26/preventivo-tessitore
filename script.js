const fasce = [5, 12, 20, 25, 30, 50, 75, 100];

const personalizzazioni = {
  ricami: [
    "Ricamo lato cuore", "Ricamo lato opposto", "Ricamo manica SX", "Ricamo manica DX",
    "Ricamo sottocollo", "Ricamo spalle", "Nome ricamato"
  ],
  stampe: [
    "Stampa fronte A4", "Stampa fronte A3", "Stampa lato cuore", "Stampa manica SX",
    "Stampa manica DX", "Stampa sottocollo", "Stampa spalle A4", "Stampa spalle A3", "Stampa nome"
  ]
};

const selezionate = [];

function creaBottoniPersonalizzazione() {
  ["ricami", "stampe"].forEach(tipo => {
    const container = document.getElementById(tipo);
    personalizzazioni[tipo].forEach(p => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = p;
      btn.onclick = () => {
        btn.classList.toggle("attivo");
        if (btn.classList.contains("attivo")) {
          selezionate.push(p);
        } else {
          const index = selezionate.indexOf(p);
          if (index > -1) selezionate.splice(index, 1);
        }
        aggiornaPrezzi();
      };
      container.appendChild(btn);
    });
  });
}

function aggiornaPrezzi() {
  const codice = parseFloat(document.getElementById("codiceInterno").value) || 0;
  const scontoTipo = document.getElementById("sconto").value;
  const tabella = document.getElementById("tabella-prezzi");
  const extra = selezionate.length * 1; // Dummy extra
  const moltiplicatori = {
    nessuno: 0.9, cliente: 0.75, rivenditore: 0.5, promo: 0.4
  };
  const sconto = moltiplicatori[scontoTipo] ?? 0.9;
  let html = "<table><tr><th>Quantità</th>";
  fasce.forEach(f => html += `<th>${f}</th>`);
  html += "</tr><tr><td>Prezzo base</td>";
  fasce.forEach(() => html += `<td>${(codice * (1 + 0.9) + extra).toFixed(2)}€</td>`);
  html += "</tr><tr><td>Prezzo scontato</td>";
  fasce.forEach(() => html += `<td>${(codice * (1 + sconto) + extra).toFixed(2)}€</td>`);
  html += "</tr></table>";
  tabella.innerHTML = html;
}

document.getElementById("codiceInterno").addEventListener("input", aggiornaPrezzi);
document.getElementById("sconto").addEventListener("change", aggiornaPrezzi);

creaBottoniPersonalizzazione();
