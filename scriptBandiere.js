document.addEventListener("DOMContentLoaded", function () {
  const uploadContainer = document.getElementById("uploadContainer");
  const prezziDettaglioBody = document.getElementById("prezziDettaglioBody");
  const prezziTotaliFoot = document.getElementById("prezziTotaliFoot");

  // Mappa delle descrizioni per i PDF/UI
  const labelMap = {
    MAT_FLAG110GR: "Bandiera Base (FLAG 110GR | Raso Spalmato 600D)",
    FIN_ASOLA: "Asola",
    FIN_RINFORZO: "Rinforzo laterale",
    FIN_ANELLI: "Anelli D-ring ferro",
    FIN_OCCHIELLO: "Occhiello",
    FIN_CUCITURA: "Cucitura perimetrale",
    FIN_LACCETTO: "Laccetto"
  };

  // Costi delle lavorazioni: PUBBLICO e RIVENDITORE sono uguali per ogni lavorazione.
  const workingPrices = {
    FIN_ASOLA: { pubblico: 1.50, rivenditore: 1.50 },
    FIN_RINFORZO: { pubblico: 2.00, rivenditore: 2.00 },
    FIN_ANELLI: { pubblico: 0.60, rivenditore: 0.60 },
    FIN_OCCHIELLO: { pubblico: 0.50, rivenditore: 0.50 },
    FIN_CUCITURA: { pubblico: 0.50, rivenditore: 0.50 }, // Il prezzo unitario è ancora qui, ma il valore 'Mt' sarà calcolato
    FIN_LACCETTO: { pubblico: 1.00, rivenditore: 1.00 }
  };

  // Lavorazioni per le quali NON deve essere creato un upload box
  const noUploadBoxKeys = ["FIN_CUCITURA"]; // Aggiungi qui altre chiavi se necessario in futuro

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

  function calcolaDettagliPrezzi() {
    const larghezzaCm = parseFloat(document.getElementById("larghezzaCm").value) || 0;
    const altezzaCm = parseFloat(document.getElementById("altezzaCm").value) || 0;
    const quantita = parseFloat(document.getElementById("quantita").value) || 1;
    const scontoRivenditore = parseFloat(document.getElementById("scontoRivenditore").value) || 0;

    const larghezzaM = larghezzaCm / 100;
    const altezzaM = altezzaCm / 100;
    const areaMq = larghezzaM * altezzaM; // Area in metri quadri
    const perimetroM = 2 * (larghezzaM + altezzaM); // Perimetro in metri

    const dettagli = [];
    let totalePubblico = 0;
    let totaleRivenditore = 0;

    // 1. Costo Materiale Base (Bandiera)
    const materialeButton = document.querySelector('#materialeBandiera button.active');
    if (materialeButton) {
      const prezzoMqPubblico = parseFloat(materialeButton.dataset.prezzomqPubblico) || 0;
      const prezzoMqRivenditore = parseFloat(materialeButton.dataset.prezzomqRivenditore) || 0;

      const costoPubblicoMateriale = areaMq * prezzoMqPubblico;
      const costoRivenditoreMateriale = areaMq * prezzoMqRivenditore;

      dettagli.push({
        desc: labelMap[materialeButton.dataset.key],
        pubblico: costoPubblicoMateriale * quantita,
        rivenditore: costoRivenditoreMateriale * quantita
      });
      totalePubblico += costoPubblicoMateriale * quantita;
      totaleRivenditore += costoRivenditoreMateriale * quantita;
    }

    // 2. Costi delle Lavorazioni (leggendo direttamente il valore del campo input)
    document.querySelectorAll('#lavorazioniBandiera .working-item').forEach(item => {
      const inputField = item.querySelector('.working-value');
      const inputValue = parseFloat(inputField.value) || 0; // Il valore inserito dall'utente
      const key = inputField.dataset.key;
      const unit = inputField.dataset.unit;
      const prices = workingPrices[key];

      let valoreBasePerCalcolo = inputValue; // Default: usa il valore inserito dall'utente

      // **LOGICA SPECIALE PER CUCITURA PERIMETRALE**
      if (key === "FIN_CUCITURA") {
        valoreBasePerCalcolo = perimetroM; // Sovrascrive l'input utente con il perimetro calcolato
        // Imposta il valore nel campo input della cucitura in modo che l'utente veda il valore calcolato
        // Questo non lo rende editabile, ma mostra il dato usato.
        // Se vuoi che il campo sia sempre vuoto o solo visivo, puoi rimuovere questa riga.
        inputField.value = perimetroM.toFixed(2);
      }

      if (valoreBasePerCalcolo > 0 && prices) { // Considera la lavorazione attiva solo se il valore per il calcolo è > 0
          let costoPubblicoLavorazione = 0;
          let costoRivenditoreLavorazione = 0;
          
          if (unit === "meter") {
            costoPubblicoLavorazione = prices.pubblico * valoreBasePerCalcolo;
            costoRivenditoreLavorazione = prices.rivenditore * valoreBasePerCalcolo;
          } else if (unit === "piece") {
            costoPubblicoLavorazione = prices.pubblico * valoreBasePerCalcolo;
            costoRivenditoreLavorazione = prices.rivenditore * valoreBasePerCalcolo;
          }

          // La descrizione mostra il valore effettivo usato per il calcolo
          dettagli.push({
            desc: `${labelMap[key]} (${valoreBasePerCalcolo.toFixed(2)} ${unit === 'meter' ? 'Mt' : 'Pz'})`,
            pubblico: costoPubblicoLavorazione * quantita,
            rivenditore: costoRivenditoreLavorazione * quantita
          });
          totalePubblico += costoPubblicoLavorazione * quantita;
          totaleRivenditore += costoRivenditoreLavorazione * quantita;

          // Gestione upload box: crea solo se la chiave NON è nella lista noUploadBoxKeys
          if (!noUploadBoxKeys.includes(key) && !document.getElementById(`upload-${key}`)) {
            const box = creaUploadBox(key, labelMap[key]);
            uploadContainer.appendChild(box);
          }
      } else {
        // Se il valore è 0 o negativo, o se la lavorazione non è attiva, rimuovi l'upload box se presente
        const existing = document.getElementById(`upload-${key}`);
        if (existing) existing.remove();
        // Reset del valore dell'input se non è la cucitura perimetrale (perché quella ha un valore calcolato)
        if (key !== "FIN_CUCITURA") {
             inputField.value = 0;
        }
      }
    });

    // Applica lo sconto al Prezzo al Rivenditore Totale
    const totaleRivend
