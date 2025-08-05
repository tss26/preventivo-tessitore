
document.addEventListener("DOMContentLoaded", function () {
  const quantitaList = [5, 12, 20, 25, 30, 50, 75, 100];
  const personalizzazioni = {};
  const uploadContainer = document.getElementById("uploadContainer");

  const labelMap = {
    K6: "Ricamo lato cuore",
    K7: "Ricamo lato opposto",
    K1: "Ricamo Centro Petto",
    K8: "Ricamo manica SX",
    K9: "Ricamo manica DX",
    K4: "Ricamo Coscia SX",
    K5: "Ricamo Coscia DX",
    K10: "Ricamo sottocollo",
    K11: "Ricamo spalle",
    M6: "Nome ricamato",
    K14: "Stampa fronte A4",
    M14: "Stampa fronte A3",
    K15: "Stampa lato cuore",
    K21: "Stampa Centro Petto",
    K16: "Stampa manica SX",
    K17: "Stampa manica DX",
    K18: "Stampa sottocollo",
    K19: "Stampa spalle A4",
    M19: "Stampa spalle A3",
    M15: "Stampa nome",
    K22: "Stampa Coscia SX",
    K23: "Stampa Coscia DX"
  };

  function creaUploadBox(key, label) {
    const box = document.createElement("div");
    box.className = "upload-box";
    box.id = `upload-${key}`;
    box.innerHTML = `
      <h4>${label}</h4>
      <label>Immagine: <input type="file" accept="image/*" data-upload="${key}"></label><br>
      <label>Descrizione: <input type="text" placeholder="Inserisci descrizione" data-desc="${key}"></label>
    `;
    return box;
  }

  function getMargine(qty) {
    if (qty <= 5) return 0.9;
    if (qty <= 12) return 0.75;
    if (qty <= 20) return 0.5;
    if (qty <= 25) return 0.4;
    if (qty <= 30) return 0.35;
    if (qty <= 50) return 0.33;
    if (qty <= 75) return 0.32;
    return 0.31;
  }

  function getCostoPersonalizzazioni(qty) {
    let costo = 0;
    const prezzi = {
      K1: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
      K4: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
      K5: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
      K6: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
      K7: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
      K8: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
      K9: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
      K10: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
      K11: [10, 10, 10, 8.5, 8.3, 7.5, 8, 8],
      M6: [3.5, 3.2, 3, 2.8, 2.6, 2.4, 2.2, 2],
      K14: [4.5, 4, 3.25, 3, 2.5, 2.3, 2, 1.6],
      K21: [4.5, 4, 3.25, 3, 2.5, 2.3, 2, 1.6],
      K22: [4.5, 4, 3.25, 3, 2.5, 2.3, 2, 1.6],
      K23: [4.5, 4, 3.25, 3, 2.5, 2.3, 2, 1.6],
      K15: [4.5, 4, 3.25, 3, 2.5, 2.3, 2, 1.6],
      K16: [4.5, 4, 3.25, 3, 2.5, 2.3, 2, 1.6],
      K17: [4.5, 4, 3.25, 3, 2.5, 2.3, 2, 1.6],
      K18: [4.5, 4, 3.25, 3, 2.5, 2.3, 2, 1.6],
      K19: [4, 3.5, 2.9, 2, 1.7, 1.6, 1.5, 1.45],
      M19: [6, 4.8, 4.2, 3.2, 2.9, 2.5, 2.5, 2.5],
      M14: [4.8, 4.3, 3.5, 3.25, 2.75, 2.5, 2.2, 1.55],
      M15: [1.7, 1.6, 1.5, 1.4, 1.3, 1.2, 1.1, 1]
    };

    let i = quantitaList.findIndex(v => qty <= v);
    if (i === -1) i = quantitaList.length - 1;

    for (const key in personalizzazioni) {
      if (personalizzazioni[key] && prezzi[key]) {
        costo += prezzi[key][i];
      }
    }
    return costo;
  }

  function getPrezzoBase(prezzoUnit) {
    return quantitaList.map(q => (prezzoUnit * (1 + getMargine(q)) + getCostoPersonalizzazioni(q)).toFixed(2));
  }

  function getPrezzoScontato(prezzi, sconto) {
    return prezzi.map(p => (p - (p * (sconto / 100))).toFixed(2));
  }

  function aggiornaTabella() {
    const prezzoUnit = parseFloat(document.getElementById("codiceInterno").value) || 0;
    const sconto = parseFloat(document.getElementById("sconto").value) || 0;
    const base = getPrezzoBase(prezzoUnit);
    const scontato = getPrezzoScontato(base, sconto);

    const baseRow = document.getElementById("prezzoBaseRow");
    const scontoRow = document.getElementById("prezzoScontatoRow");

    baseRow.innerHTML = "<td>Prezzo base</td>" + base.map(p => `<td>${p}€</td>`).join("");
    scontoRow.innerHTML = "<td>Prezzo scontato</td>" + scontato.map(p => `<td>${p}€</td>`).join("");
  }

  // Attiva bottoni + upload box
  document.querySelectorAll(".button-group button").forEach(button => {
    const key = button.dataset.key;
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      personalizzazioni[key] = button.classList.contains("active");

      if (personalizzazioni[key]) {
        const box = creaUploadBox(key, labelMap[key] || key);
        uploadContainer.appendChild(box);
      } else {
        const existing = document.getElementById(`upload-${key}`);
        if (existing) existing.remove();
      }

      aggiornaTabella();
    });
  });

  document.getElementById("codiceInterno").addEventListener("input", aggiornaTabella);
  document.getElementById("sconto").addEventListener("change", aggiornaTabella);
});
