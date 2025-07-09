document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  if (uploadBoxes.length === 0) {
    alert("Nessuna personalizzazione selezionata con immagini o descrizioni. Aggiungi delle sezioni prima di generare il PDF.");
    return;
  }

  const pdfContentContainer = document.createElement("div");
  // Dimensioni in pixel per 20cm x 18cm (circa 756px x 680px a 96 DPI)
  pdfContentContainer.style.width = "756px";
  pdfContentContainer.style.minHeight = "680px";
  pdfContentContainer.style.padding = "10px";
  pdfContentContainer.style.boxSizing = "border-box";
  pdfContentContainer.style.fontFamily = "Arial, sans-serif";
  pdfContentContainer.style.display = "flex";
  pdfContentContainer.style.flexDirection = "column";
  pdfContentContainer.style.alignItems = "center";
  pdfContentContainer.style.justifyContent = "flex-start";
  pdfContentContainer.style.overflow = "hidden";

  // --- Nuova logica per l'intestazione principale su una riga ---
  const topHeaderSummary = document.createElement("div");
  topHeaderSummary.style.display = "flex";
  topHeaderSummary.style.justifyContent = "space-between";
  topHeaderSummary.style.alignItems = "center"; // Allinea verticalmente al centro
  topHeaderSummary.style.width = "100%";
  topHeaderSummary.style.marginBottom = "15px"; // Spazio sotto questa riga

  const selectedQuantity = parseInt(document.getElementById("quantita").value);

  const titleAndNota = document.createElement("span");
  titleAndNota.innerText = `Preventivo: ${nota.toUpperCase()}`; // Combina "Preventivo" con il titolo PDF
  titleAndNota.style.fontSize = "16px";
  titleAndNota.style.fontWeight = "bold";
  topHeaderSummary.appendChild(titleAndNota);

  const quantityText = document.createElement("span");
  quantityText.innerText = `Quantità: ${selectedQuantity}`;
  quantityText.style.fontSize = "16px";
  topHeaderSummary.appendChild(quantityText);

  pdfContentContainer.appendChild(topHeaderSummary);
  // --- Fine Nuova logica per l'intestazione principale ---


  const customizationsSection = document.createElement("div");
  customizationsSection.style.display = "flex";
  customizationsSection.style.flexDirection = "column";
  customizationsSection.style.width = "100%";
  customizationsSection.style.marginTop = "10px";
  pdfContentContainer.appendChild(customizationsSection);

  for (const box of Array.from(uploadBoxes)) {
    const tipo = box.querySelector("h4").innerText;
    const imgInput = box.querySelector("input[type='file'][data-upload]");
    const descInput = box.querySelector("input[type='text'][data-desc]");

    const itemContainer = document.createElement("div");
    itemContainer.style.marginBottom = "10px";
    itemContainer.style.padding = "6px";
    itemContainer.style.border = "1px solid #eee";
    itemContainer.style.borderRadius = "8px";
    itemContainer.style.backgroundColor = "#fdfdfd";
    itemContainer.style.width = "calc(100% - 12px)";

    const tipoLabel = document.createElement("h3");
    tipoLabel.innerText = tipo;
    tipoLabel.style.textAlign = "left";
    tipoLabel.style.marginBottom = "5px";
    tipoLabel.style.color = "#007bff";
    tipoLabel.style.fontSize = "16px";
    itemContainer.appendChild(tipoLabel);

    const imgAndDescWrapper = document.createElement("div");
    imgAndDescWrapper.style.display = "flex";
    imgAndDescWrapper.style.flexDirection = "column"; // CAMBIATO: Descrizione sotto l'immagine
    imgAndDescWrapper.style.alignItems = "flex-start"; // Allinea immagine/descrizione a sinistra
    imgAndDescWrapper.style.gap = "5px"; // Rimpicciolito il gap tra immagine e descrizione
    imgAndDescWrapper.style.width = "100%";

    const imgWrapper = document.createElement("div");
    imgWrapper.style.flexShrink = "0";
    imgWrapper.style.width = "302px"; // NUOVO: Immagine di 8cm (302px)
    imgWrapper.style.height = "302px"; // NUOVO: Immagine di 8cm (302px)
    imgWrapper.style.border = "1px dashed #999";
    imgWrapper.style.display = "flex";
    imgWrapper.style.alignItems = "center";
    imgWrapper.style.justifyContent = "center";
    imgWrapper.style.overflow = "hidden";
    imgWrapper.style.marginBottom = "5px"; // Spazio tra immagine e descrizione

    const desc = document.createElement("p");
    desc.innerText = "DESCRIZIONE: " + (descInput ? descInput.value : "Nessuna descrizione.");
    desc.style.fontSize = "12px";
    desc.style.textAlign = "left";
    desc.style.lineHeight = "1.3";
    desc.style.wordBreak = "break-word";
    // Rimosse flexGrow e maxWidth, la descrizione occupa ora l'intera larghezza disponibile sotto l'immagine.

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
            imgWrapper.innerHTML = `<p style="color: red; font-size: 8px; text-align: center;">Errore caricamento immagine</p>`;
            resolve();
          };
        };
        reader.onerror = (e) => {
          console.error("Errore FileReader:", e);
          imgWrapper.innerHTML = `<p style="color: red; font-size: 8px; text-align: center;">Errore lettura file</p>`;
          resolve();
        };
        reader.readAsDataURL(file);
      });
    } else {
      const noImgText = document.createElement("p");
      noImgText.innerText = "Nessuna immagine allegata";
      noImgText.style.color = "#888";
      noImgText.style.fontSize = "10px";
      noImgText.style.textAlign = "center";
      imgWrapper.appendChild(noImgText);
    }
    customizationsSection.appendChild(itemContainer);
  }

  const previewArea = document.createElement("div");
  previewArea.style.position = "absolute";
  previewArea.style.left = "-9999px";
  previewArea.appendChild(pdfContentContainer);
  document.body.appendChild(previewArea);

  setTimeout(() => {
    html2pdf().from(pdfContentContainer).set({
      margin: [5, 5, 5, 5],
      filename: nota.replace(/\s+/g, "_") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: true, useCORS: true },
      jsPDF: { unit: "mm", format: [200, 180], orientation: "portrait" }, // 200mm base x 180mm altezza
      pagebreak: { mode: 'avoid-all', before: '.page-break-before' }
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
