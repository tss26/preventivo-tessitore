document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  // Se non ci sono uploadBoxes, mostra un alert e non generare il PDF
  if (uploadBoxes.length === 0) {
    alert("Nessuna personalizzazione selezionata con immagini o descrizioni. Aggiungi delle sezioni prima di generare il PDF.");
    return;
  }

  // Crea un unico contenitore per tutto il contenuto che andrà nella singola pagina PDF
  const pdfContentContainer = document.createElement("div");
  pdfContentContainer.style.width = "794px"; // Larghezza A4 a 96 DPI
  pdfContentContainer.style.minHeight = "1123px"; // Altezza A4 a 96 DPI, min-height per espandersi se necessario
  pdfContentContainer.style.padding = "20px"; // Ridotto il padding generale
  pdfContentContainer.style.boxSizing = "border-box";
  pdfContentContainer.style.fontFamily = "Arial, sans-serif";
  pdfContentContainer.style.display = "flex";
  pdfContentContainer.style.flexDirection = "column";
  pdfContentContainer.style.alignItems = "center"; // Centra orizzontalmente il contenuto
  pdfContentContainer.style.justifyContent = "flex-start"; // Allinea in alto
  pdfContentContainer.style.overflow = "hidden"; // Nascondi overflow, html2pdf gestirà le pagine

  // Aggiungi il titolo principale del PDF, come in BOZZA PP3.pdf
  const mainTitle = document.createElement("h1");
  mainTitle.innerText = (nota || "Preventivo").toUpperCase(); // Prende il titolo dalla nota
  mainTitle.style.marginBottom = "20px";
  mainTitle.style.color = "#000";
  mainTitle.style.textAlign = "center";
  pdfContentContainer.appendChild(mainTitle);

  // Aggiungi le informazioni sulla quantità e sconto se vuoi che appaiano nel PDF
  const quantitaInput = document.getElementById("quantita").value;
  const scontoInput = document.getElementById("sconto").value;

  if (quantitaInput || scontoInput !== "0") { // Mostra solo se ci sono valori
      const infoText = document.createElement("p");
      infoText.innerText = `Quantità: ${quantitaInput} - Sconto: ${scontoInput}%`;
      infoText.style.fontSize = "16px";
      infoText.style.marginBottom = "15px";
      infoText.style.textAlign = "center";
      pdfContentContainer.appendChild(infoText);
  }


  // Aggiungi la tabella dei prezzi se vuoi che appaia nel PDF
  const tableContainer = document.querySelector(".table-container");
  if (tableContainer) {
    const clonedTable = tableContainer.cloneNode(true);
    clonedTable.style.marginBottom = "20px";
    // Rimuovi eventuali larghezze fisse che potrebbero causare problemi nel PDF
    clonedTable.style.width = "auto"; // Lascia che html2pdf gestisca la larghezza
    clonedTable.querySelector('table').style.width = "auto";
    pdfContentContainer.appendChild(clonedTable);
  }


  // Contenitore per le sezioni di personalizzazione (immagini e descrizioni)
  const customizationsSection = document.createElement("div");
  customizationsSection.style.display = "flex";
  customizationsSection.style.flexDirection = "column";
  customizationsSection.style.width = "100%"; // Occupa tutta la larghezza disponibile
  pdfContentContainer.appendChild(customizationsSection);


  for (const box of Array.from(uploadBoxes)) {
    const tipo = box.querySelector("h4").innerText;
    const imgInput = box.querySelector("input[type='file'][data-upload]");
    const descInput = box.querySelector("input[type='text'][data-desc]");

    const itemContainer = document.createElement("div");
    itemContainer.style.marginBottom = "25px"; // Spazio tra le personalizzazioni
    itemContainer.style.padding = "10px";
    itemContainer.style.border = "1px solid #eee";
    itemContainer.style.borderRadius = "8px";
    itemContainer.style.backgroundColor = "#fdfdfd";
    itemContainer.style.width = "calc(100% - 20px)"; // Per compensare il padding

    const tipoLabel = document.createElement("h3"); // h3 per i titoli delle personalizzazioni
    tipoLabel.innerText = tipo;
    tipoLabel.style.textAlign = "left";
    tipoLabel.style.marginBottom = "10px";
    tipoLabel.style.color = "#007bff";
    itemContainer.appendChild(tipoLabel);

    const imgAndDescWrapper = document.createElement("div");
    imgAndDescWrapper.style.display = "flex";
    imgAndDescWrapper.style.alignItems = "flex-start"; // Allinea immagine e descrizione in alto
    imgAndDescWrapper.style.gap = "15px"; // Spazio tra immagine e descrizione
    imgAndDescWrapper.style.width = "100%"; // Occupa tutta la larghezza

    const imgWrapper = document.createElement("div");
    imgWrapper.style.flexShrink = "0"; // Non si restringe
    imgWrapper.style.width = "200px"; // Larghezza fissa per l'immagine
    imgWrapper.style.height = "200px"; // Altezza fissa per l'immagine
    imgWrapper.style.border = "1px dashed #999";
    imgWrapper.style.display = "flex";
    imgWrapper.style.alignItems = "center";
    imgWrapper.style.justifyContent = "center";
    imgWrapper.style.overflow = "hidden"; // Importante per tagliare l'immagine se più grande

    const desc = document.createElement("p");
    desc.innerText = "DESCRIZIONE: " + (descInput ? descInput.value : "Nessuna descrizione.");
    desc.style.fontSize = "14px";
    desc.style.textAlign = "left";
    desc.style.lineHeight = "1.4";
    desc.style.wordBreak = "break-word";
    desc.style.flexGrow = "1"; // Permette alla descrizione di occupare lo spazio rimanente
    desc.style.maxWidth = "calc(100% - 215px)"; // Larghezza rimanente dopo l'immagine + gap

    imgAndDescWrapper.appendChild(imgWrapper);
    imgAndDescWrapper.appendChild(desc);
    itemContainer.appendChild(imgAndDescWrapper);

    const file = imgInput ? imgInput.files[0] : null;
    if (file) {
      await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          img.style.maxWidth = "100%";
          img.style.maxHeight = "100%";
          img.style.objectFit = "contain";
          img.onload = () => {
            imgWrapper.appendChild(img);
            resolve();
          };
          img.onerror = (e) => {
            console.error("Errore caricamento immagine:", e);
            imgWrapper.innerHTML = `<p style="color: red; font-size: 10px; text-align: center;">Errore caricamento immagine</p>`;
            resolve();
          };
        };
        reader.onerror = (e) => {
          console.error("Errore FileReader:", e);
          imgWrapper.innerHTML = `<p style="color: red; font-size: 10px; text-align: center;">Errore lettura file</p>`;
          resolve();
        };
        reader.readAsDataURL(file);
      });
    } else {
      const noImgText = document.createElement("p");
      noImgText.innerText = "Nessuna immagine allegata";
      noImgText.style.color = "#888";
      noImgText.style.fontSize = "12px";
      noImgText.style.textAlign = "center";
      imgWrapper.appendChild(noImgText);
    }
    customizationsSection.appendChild(itemContainer);
  }

  // Aggiungi il contenitore principale al body (fuori dallo schermo) per il rendering
  const previewArea = document.createElement("div");
  previewArea.style.position = "absolute";
  previewArea.style.left = "-9999px";
  previewArea.appendChild(pdfContentContainer); // Aggiungi il container unico qui
  document.body.appendChild(previewArea);

  setTimeout(() => {
    html2pdf().from(pdfContentContainer).set({ // Ora html2pdf renderizza l'unico contenitore
      margin: [10, 10, 10, 10], // Margini ridotti per massimizzare lo spazio
      filename: nota.replace(/\s+/g, "_") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: true, useCORS: true },
      jsPDF: { unit: "px", format: "a4", orientation: "portrait" },
      pagebreak: { mode: 'avoid-all', before: '.page-break-before' } // Modificato per evitare rotture non desiderate
    }).save().then(() => {
      if (previewArea.parentNode) {
        previewArea.parentNode.removeChild(previewArea);
      }
      console.log("PDF generato con successo!");
    }).catch(error => {
      if (previewArea.parentNode) {
        previewArea.parentNode.removeChild(previewArea);
      }
      console.error("Errore durante la generazione del PDF:", error);
      alert("Errore durante la generazione del PDF. Controlla la console per maggiori dettagli.");
    });
  }, 100);
});
