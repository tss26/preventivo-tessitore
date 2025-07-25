document.addEventListener("DOMContentLoaded", function () {
  const quantitaList = [5, 12, 20, 25, 30, 50, 75, 100];
  const personalizzazioni = {};
  const uploadContainer = document.getElementById("uploadContainer");

  const labelMap = {
    K6: "Ricamo Fronte max 12 cm",
    K8: "Ricamo lato SX",
    K9: "Ricamo lato DX",
    M6: "Nome ricamato",
    K14: "Stampa fronte A4",
    M14: "Stampa fronte A3",
    K15: "Stampa dim lato cuore",
    K16: "Stampa lato SX",
    K17: "Stampa lato DX",
    K19: "Stampa Retro A4",
    M19: "Stampa Retro A3",
    M15: "Stampa nome"
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
    let margine;
    if (qty <= 5) margine = 0.9;
    else if (qty <= 12) margine = 0.75;
    else if (qty <= 20) margine = 0.5;
    else if (qty <= 25) margine = 0.4;
    else if (qty <= 30) margine = 0.35;
    else if (qty <= 50) margine = 0.32;
    else if (qty <= 75) margine = 0.31;
    else margine = 0.3;

    // Moltiplica il margine per 2 per i gadget/accessori
    return margine * 2;
  }

  function getCostoPersonalizzazioni(qty) {
    let costo = 0;
    const prezzi = {
      K6: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
      K7: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
      K8: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
      K9: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
      K10: [5, 5, 5, 4.5, 4.2, 3.8, 3.3, 3.3],
      K11: [10, 10, 10, 8.5, 8.3, 7.5, 8, 8],
      M6: [3.5, 3.2, 3, 2.8, 2.6, 2.4, 2.2, 2],
      K14: [4.5, 4, 3.25, 3, 2.5, 2.3, 2, 1.35],
      K15: [4.5, 4, 3.25, 3, 2.5, 2.3, 2, 1.35],
      K16: [4.5, 4, 3.25, 3, 2.5, 2.3, 2, 1.35],
      K17: [4.5, 4, 3.25, 3, 2.5, 2.3, 2, 1.35],
      K18: [4.5, 4, 3.25, 3, 2.5, 2.3, 2, 1.35],
      K19: [4, 3.5, 2.9, 2, 1.7, 1.6, 1.5, 1.4],
      M19: [6, 4.8, 4.2, 3.2, 2.9, 2.5, 2.5, 2.5],
      M14: [4.8, 4.3, 3.5, 3.25, 2.75, 2.5, 2.2, 1.45],
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
