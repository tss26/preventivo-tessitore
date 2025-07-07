
document.addEventListener("DOMContentLoaded", function () {
  const quantitaList = [5, 12, 20, 25, 30, 50, 75, 100];
  const personalizzazioni = {};

  function getPrezzoBase(prezzoUnit) {
    return quantitaList.map(q => (prezzoUnit * (1 + getMargine(q)) + getCostoPersonalizzazioni(q)).toFixed(2));
  }

  function getPrezzoScontato(prezzi, sconto) {
    return prezzi.map(p => (p - (p * (sconto / 100))).toFixed(2));
  }

  function getMargine(qty) {
    if (qty <= 5) return 0.9;
    if (qty <= 12) return 0.75;
    if (qty <= 20) return 0.5;
    if (qty <= 25) return 0.4;
    if (qty <= 30) return 0.35;
    if (qty <= 50) return 0.32;
    if (qty <= 75) return 0.31;
    return 0.3;
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

  document.querySelectorAll(".button-group button").forEach(button => {
    button.addEventListener("click", () => {
      const key = button.dataset.key;
      button.classList.toggle("active");
      personalizzazioni[key] = button.classList.contains("active");
      aggiornaTabella();
    });
  });

  document.getElementById("codiceInterno").addEventListener("input", aggiornaTabella);
  document.getElementById("sconto").addEventListener("change", aggiornaTabella);
});
