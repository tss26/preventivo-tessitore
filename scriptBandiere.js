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

  // Costi delle lavorazioni: PUBBLICO
  // Nota: I valori 'rivenditore' non sono più usati per il calcolo diretto delle lavorazioni,
  // ma il prezzo al rivenditore finale è derivato dal totale pubblico scontato.
  const workingPrices = {
    FIN_ASOLA: { pubblico: 1.50 },
    FIN_RINFORZO: { pubblico: 2.00 },
    FIN_ANELLI: { pubblico: 0.60 },
    FIN_OCCHIELLO: { pubblico: 0.60 },
    FIN_CUCITURA: { pubblico: 0.50 },
    FIN_LACCETTO: { pubblico: 1.00 }
  };

  // Lavorazioni per le quali NON deve essere creato un upload box
  const noUploadBoxKeys = ["FIN_CUCITURA"];

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
    const scontoPercentuale = parseFloat(document.getElementById("scontoRivenditore").value) || 0;

    const larghezzaM = larghezzaCm / 100;
    const altezzaM = altezzaCm / 100;
    const areaMq = larghezzaM * altezzaM; // Area in metri quadri
    const perimetroM = 2 * (larghezzaM + altezzaM); // Perimetro in metri

    let costoUnitarioBandieraPubblico = 0; // Costo per UNA singola bandiera (pubblico)

    // 1. Costo Materiale Base (Bandiera) - Calcola per unità
    const materialeButton = document.querySelector('#materialeBandiera button.active');
    if (materialeButton) {
      const prezzoMqPubblico = parseFloat(materialeButton.dataset.prezzomqPubblico) || 0;
      const costoPubblicoMaterialePerUnit = areaMq * prezzoMqPubblico;
      costoUnitarioBandieraPubblico += costoPubblicoMaterialePerUnit;
    }

    // 2. Costi delle Lavorazioni - Calcola per unità
    document.querySelectorAll('#lavorazioniBandiera .working-item').forEach(item => {
      const inputField = item.querySelector('.working-value');
      // Uso parseFloat per convertire il valore, se vuoto sarà NaN e || 0 lo renderà 0
      const inputValue = parseFloat(inputField.value) || 0;
      const key = inputField.dataset.key;
      const unit = inputField.dataset.unit;
      const prices = workingPrices[key];

      let valoreBasePerCalcolo;

      // LOGICA SPECIALE PER CUCITURA PERIMETRALE: CALCOLO AUTOMATICO E AGGIORNAMENTO CAMPO DI SOLA LETTURA
      if (key === "FIN_CUCITURA") {
        valoreBasePerCalcolo = perimetroM;
        inputField.value = perimetroM.toFixed(2); // Aggiorna il valore visualizzato nel campo di sola lettura
      } else {
        valoreBasePerCalcolo = inputValue;
      }
      
      // Aggiunge il costo della lavorazione solo se il valore inserito è maggiore di zero
      if (valoreBasePerCalcolo > 0 && prices) {
        let costoPubblicoLavorazionePerUnit = 0;
        if (unit === "meter" || unit === "piece") {
          costoPubblicoLavorazionePerUnit = prices.pubblico * valoreBasePerCalcolo;
        }
        costoUnitarioBandieraPubblico += costoPubblicoLavorazionePerUnit;

        // Gestione creazione/rimozione upload box
        if (!noUploadBoxKeys.includes(key) && !document.getElementById(`upload-${key}`)) {
          const box = creaUploadBox(key, labelMap[key]);
          uploadContainer.appendChild(box);
        }
      } else {
        // Rimuove l'upload box se il valore è 0 o vuoto
        const existing = document.getElementById(`upload-${key}`);
        if (existing) existing.remove();
        // NON reimpostare a 0 qui, per mantenere la casella vuota se l'utente l'ha lasciata tale
      }
    });

    // Calcola i totali basati sul costo unitario e la quantità
    const totalePubblicoFinale = costoUnitarioBandieraPubblico * quantita;
    const totaleRivenditoreFinale = totalePubblicoFinale * (1 - (scontoPercentuale / 100));

    // Calcola costo unitario rivenditore derivato dal pubblico scontato
    const costoUnitarioBandieraRivenditore = costoUnitarioBandieraPubblico * (1 - (scontoPercentuale / 100));

    return {
      costoUnitarioPubblico: costoUnitarioBandieraPubblico,
      costoUnitarioRivenditore: costoUnitarioBandieraRivenditore,
      totalePubblico: totalePubblicoFinale,
      totaleRivenditore: totaleRivenditoreFinale
    };
  }

  function aggiornaTabella() {
    const datiCalcolati = calcolaDettagliPrezzi();
    
    prezziDettaglioBody.innerHTML = ''; // Svuota i dettagli precedenti
    prezziTotaliFoot.innerHTML = ''; // Svuota i totali precedenti

    // Riga per "Costo al pubblico unitario" (nel tbody)
    const rowUnitario = document.createElement('tr');
    rowUnitario.innerHTML = `
      <td>Costo al pubblico unitario</td>
      <td>${datiCalcolati.costoUnitarioPubblico.toFixed(2)}€</td>
      <td>${datiCalcolati.costoUnitarioRivenditore.toFixed(2)}€</td>
    `;
    prezziDettaglioBody.appendChild(rowUnitario);

    // Riga per "Costo al pubblico totale (unitario * quantità)" (nel tfoot)
    const totalRowFooter = document.createElement('tr');
    totalRowFooter.innerHTML = `
      <td>Costo al pubblico totale (unitario * quantità)</td>
      <td>${datiCalcolati.totalePubblico.toFixed(2)}€</td>
      <td>${datiCalcolati.totaleRivenditore.toFixed(2)}€</td>
    `;
    prezziTotaliFoot.appendChild(totalRowFooter);
  }

  // Event Listeners per aggiornare la tabella
  document.getElementById("larghezzaCm").addEventListener("input", aggiornaTabella);
  document.getElementById("altezzaCm").addEventListener("input", aggiornaTabella);
  document.getElementById("quantita").addEventListener("input", aggiornaTabella);
  
  // Listener per i campi delle lavorazioni (input numerici) che sono ancora modificabili
  document.querySelectorAll('#lavorazioniBandiera .working-item .working-value').forEach(input => {
    // Esclude il campo "Cucitura perimetrale" perché è di sola lettura e viene calcolato automaticamente
    if (input.dataset.key !== "FIN_CUCITURA") { 
      input.addEventListener('input', aggiornaTabella); 
    }
  });

  // Listener per il pulsante materiale (selezione singola)
  document.querySelectorAll('#materialeBandiera button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('#materialeBandiera button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      aggiornaTabella(); 
    });
  });

  // Aggiorna la tabella al caricamento iniziale
  aggiornaTabella();
});
