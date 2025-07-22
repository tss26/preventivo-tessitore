<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Preventivo Bandiere</title>
  <link rel="stylesheet" href="style.css" /> <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#009dff">
</head>
<body>
  <h1>Preventivo Bandiere</h1>

  <div class="form-section">
    <div class="form-grid">
      <div>
        <label for="larghezzaCm">Larghezza (cm):</label>
        <input type="number" id="larghezzaCm" min="10" value="150"/>
      </div>
      <div>
        <label for="altezzaCm">Altezza (cm):</label>
        <input type="number" id="altezzaCm" min="10" value="100"/>
      </div>
      <div>
        <label for="quantita">Quantità:</label>
        <input type="number" id="quantita" min="1" value="1"/>
      </div>
      <div>
        <label for="scontoRivenditore">Sconto (%) applicato:</label>
        <input type="number" id="scontoRivenditore" value="35" min="0" max="100" readonly/> 
      </div>
    </div>
    
    <label for="nota">Nota (Titolo PDF):</label>
    <input type="text" id="nota" placeholder="Inserisci una nota (facoltativa)"/>
  </div>

  <h2>Opzioni Bandiera e Lavorazioni</h2>

  <div class="custom-section">
    <h3>Materiale</h3>
    <div class="button-group" id="materialeBandiera">
      <button data-key="MAT_FLAG110GR" data-prezzomq-pubblico="12.6" data-prezzomq-rivenditore="14.885" class="active">FLAG 110GR | Raso Spalmato 600D</button>
      </div>
  </div>

  <div class="custom-section" id="lavorazioniBandiera">
    <h3>Lavorazioni</h3>
    <div class="lavorazioni-grid">
      <div class="working-item">
        <label for="asolaValue">Asola (€/mt)</label>
        <input type="number" id="asolaValue" class="working-value" data-key="FIN_ASOLA" data-
