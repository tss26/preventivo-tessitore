
const fasce = [5, 12, 20, 25, 30, 50, 75, 100];
const personalizzazioni = {
  "Ricamo lato cuore":  { cell: "K6",  valori: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3] },
  "Ricamo lato opposto":{ cell: "K7",  valori: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3] },
  "Ricamo manica SX":   { cell: "K8",  valori: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3] },
  "Ricamo manica DX":   { cell: "K9",  valori: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3] },
  "Ricamo sottocollo":  { cell: "K10", valori: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3] },
  "Ricamo spalle":      { cell: "K11", valori: [10,10,10,8.5,8.3,7.5,8,8] },
  "Nome ricamato":      { cell: "M6",  valori: [3.5,3.2,3,2.8,2.6,2.4,2.2,2] },
  "Stampa fronte A4":   { cell: "K14", valori: [4.5,4,3.25,3,2.5,2.3,2,1.35] },
  "Stampa lato cuore":  { cell: "K15", valori: [4.5,4,3.25,3,2.5,2.3,2,1.35] },
  "Stampa manica SX":   { cell: "K16", valori: [4.5,4,3.25,3,2.5,2.3,2,1.35] },
  "Stampa manica DX":   { cell: "K17", valori: [4.5,4,3.25,3,2.5,2.3,2,1.35] },
  "Stampa sottocollo":  { cell: "K18", valori: [4.5,4,3.25,3,2.5,2.3,2,1.35] },
  "Stampa spalle A4":   { cell: "K19", valori: [4,3.5,2.9,2,1.7,1.6,1.5,1.4] },
  "Stampa spalle A3":   { cell: "M19", valori: [6,4.8,4.2,3.2,2.9,2.5,2.5,2.5] },
  "Stampa fronte A3":   { cell: "M14", valori: [4.8,4.3,3.5,3.25,2.75,2.5,2.2,1.45] },
  "Stampa nome":        { cell: "M15", valori: [1.7,1.6,1.5,1.4,1.3,1.2,1.1,1] }
};

const attive = [];

function aggiornaTabella() {
  const codice = parseFloat(document.getElementById("codice").value) || 0;
  const sconto = parseFloat(document.getElementById("sconto").value) || 0;

  const quantitàRow = document.getElementById("quantita-row");
  const baseRow = document.getElementById("prezzo-base-row");
  const scontoRow = document.getElementById("prezzo-scontato-row");

  quantitàRow.innerHTML = "<th>Quantità</th>";
  baseRow.innerHTML = "<td>Prezzo Base</td>";
  scontoRow.innerHTML = "<td>Prezzo Scontato</td>";

  fasce.forEach((q, i) => {
    let moltiplicatore = [0.9, 0.75, 0.5, 0.4, 0.35, 0.32, 0.31, 0.3][i];
    let prezzo = codice * (1 + moltiplicatore);

    attive.forEach(nome => {
      prezzo += personalizzazioni[nome].valori[i];
    });

    let prezzoScontato = prezzo * (1 - sconto / 100);

    quantitàRow.innerHTML += `<th>${q}</th>`;
    baseRow.innerHTML += `<td>${prezzo.toFixed(2)}€</td>`;
    scontoRow.innerHTML += `<td>${prezzoScontato.toFixed(2)}€</td>`;
  });
}

function creaBottoni() {
  const ricami = [
    "Ricamo lato cuore", "Ricamo lato opposto", "Ricamo manica SX", "Ricamo manica DX",
    "Ricamo sottocollo", "Ricamo spalle", "Nome ricamato"
  ];
  const stampe = [
    "Stampa fronte A4", "Stampa lato cuore", "Stampa manica SX", "Stampa manica DX",
    "Stampa sottocollo", "Stampa spalle A4", "Stampa spalle A3", "Stampa fronte A3", "Stampa nome"
  ];

  const ricamiBox = document.getElementById("ricami-buttons");
  const stampeBox = document.getElementById("stampe-buttons");

  [...ricami, ...stampe].forEach(nome => {
    const btn = document.createElement("button");
    btn.textContent = nome;
    btn.className = "personalizzazione";
    btn.onclick = () => {
      if (attive.includes(nome)) {
        attive.splice(attive.indexOf(nome), 1);
        btn.classList.remove("attiva");
      } else {
        attive.push(nome);
        btn.classList.add("attiva");
      }
      aggiornaTabella();
    };
    if (ricami.includes(nome)) ricamiBox.appendChild(btn);
    else stampeBox.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  creaBottoni();
  document.getElementById("codice").addEventListener("input", aggiornaTabella);
  document.getElementById("sconto").addEventListener("input", aggiornaTabella);
});
