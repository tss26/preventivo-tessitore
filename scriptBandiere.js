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
    FIN_ANELLI: { publico: 0.60, rivenditore: 0.60 },
    FIN_OCCHIELLO: { pubblico: 0.50, rivenditore: 0.50 },
    FIN_CUCITURA: { pubblico: 0.50, rivenditore: 0.50 }, 
    FIN_LACCETTO: { pubblico: 1.00, rivenditore: 1.00 }
  };

  // Lavorazioni per le quali NON deve essere creato un upload box
  const noUploadBoxKeys = ["FIN_CUCITURA"]; // Mantiene questa lista per prevenire l'upload box

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
    // const perimetroM = 2 * (larghezzaM + altezzaM); // Non più usato per calcolo cucitura, ma mantenuto se servisse altrove

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

      // Ora valoreBasePerCalcolo è sempre inputValue, senza logiche speciali
      const valoreBasePerCalcolo = inputValue; 
      
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
        // Se il valore è 0 o negativo, rimuovi l'upload box se presente
        const existing = document.getElementById(`upload-${key}`);
        if (existing) existing.remove();
        // Reset del valore dell'input a 0 se la lavorazione non è attiva
        inputField.value = 0;
      }
    });

    // Applica lo sconto al Prezzo al Rivenditore Totale
    const totaleRivenditoreScontato = totaleRivenditore * (1 - (scontoRivenditore / 100));

    return {
      dettagli: dettagli,
      totalePubblico: totalePubblico,
      totaleRivenditore: totaleRivenditoreScontato
    };
  }

  function aggiornaTabella() {
    const datiCalcolati = calcolaDettagliPrezzi();
    
    // Pulisci le tabelle
    prezziDettaglioBody.innerHTML = '';
    prezziTotaliFoot.innerHTML = '';

    // Popola i dettagli
    if (datiCalcolati.dettagli.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="3">Nessun dettaglio da mostrare. Inserisci dimensioni e/o lavorazioni.</td>`;
        prezziDettaglioBody.appendChild(row);
    } else {
        datiCalcolati.dettagli.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.desc}</td>
                <td>${item.pubblico.toFixed(2)}€</td>
                <td>${item.rivenditore.toFixed(2)}€</td>
            `;
            prezziDettaglioBody.appendChild(row);
        });
    }

    // Popola i totali
    const totalRow = document.createElement('tr');
    totalRow.innerHTML = `
      <td>TOTALE</td>
      <td>${datiCalcolati.totalePubblico.toFixed(2)}€</td>
      <td>${datiCalcolati.totaleRivenditore.toFixed(2)}€</td>
    `;
    prezziTotaliFoot.appendChild(totalRow);
  }

  // Event Listeners per aggiornare la tabella
  document.getElementById("larghezzaCm").addEventListener("input", aggiornaTabella);
  document.getElementById("altezzaCm").addEventListener("input", aggiornaTabella);
  document.getElementById("quantita").addEventListener("input", aggiornaTabella);
  
  // Listener per tutti i campi delle lavorazioni (input numerici)
  // Rimosso il controllo specifico per FIN_CUCITURA, ora tutti triggerano l'aggiornamento manualmente
  document.querySelectorAll('#lavorazioniBandiera .working-item .working-value').forEach(input => {
    input.addEventListener('input', aggiornaTabella); // Aggiornamento in tempo reale
  });

  // Listener per il pulsante materiale (selezione singola)
  document.querySelectorAll('#materialeBandiera button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('#materialeBandiera button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      aggiornaTabella(); // Aggiorna quando cambia il materiale
    });
  });

  // Aggiorna la tabella al caricamento iniziale
  aggiornaTabella();
});
