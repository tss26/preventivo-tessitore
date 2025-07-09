document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  if (uploadBoxes.length === 0) {
    alert("Nessuna personalizzazione selezionata con immagini o descrizioni. Aggiungi delle sezioni prima di generare il PDF.");
    return;
  }

  const pdfContentContainer = document.createElement("div");
  pdfContentContainer.style.width = "1050px"; // Larghezza per A4 orizzontale (approx 297mm * 96dpi / 25.4mm/inch)
  pdfContentContainer.style.minHeight = "750px"; // Altezza per A4 orizzontale (approx 210mm * 96dpi / 25.4mm/inch), min-height per espandersi
  pdfContentContainer.style.padding = "20px";
  pdfContentContainer.style.boxSizing = "border-box";
  pdfContentContainer.style.fontFamily = "Arial, sans-serif";
  pdfContentContainer.style.display = "flex";
  pdfContentContainer.style.flexDirection = "column";
  pdfContentContainer.style.alignItems = "center";
  pdfContentContainer.style.justifyContent = "flex-start";
  pdfContentContainer.style.overflow = "hidden";

  const mainTitle = document.createElement("h1");
  mainTitle.innerText = (nota || "Preventivo").toUpperCase();
  mainTitle.style.marginBottom = "20px";
  mainTitle.style.color = "#000";
  mainTitle.style.textAlign = "center";
  pdfContentContainer.appendChild(mainTitle);

  // --- Logica per la quantità e prezzi specifici ---
  const selectedQuantity = parseInt(document.getElementById("quantita").value);
  const quantitaHeaders = document.querySelectorAll("#quantitaRow th");
  let quantityDataColumnIndex = -1;

  // Trova l'indice della colonna della quantità selezionata nella tabella HTML
  for (let i = 1; i < quantitaHeaders.length; i++) { // Inizia da 1 per saltare "Quantità"
    if (parseInt(quantitaHeaders[i].innerText) === selectedQuantity) {
      quantityDataColumnIndex = i;
      break;
    }
  }

  if (quantityDataColumnIndex !== -1) {
    const prezzoBaseRow = document.getElementById("prezzoBaseRow");
    const prezzoScontatoRow = document.getElementById("prezzoScontatoRow");

    const basePriceTd = prezzoBaseRow.querySelectorAll("td")[quantityDataColumnIndex];
    const scontatoPriceTd = prezzoScontatoRow.querySelectorAll("td")[quantityDataColumnIndex];

    if (basePriceTd && scontatoPriceTd) {
      const basePrice = basePriceTd.innerText;
      const scontatoPrice = scontatoPriceTd.innerText;

      const priceInfoDiv = document.createElement("div");
      priceInfoDiv.style.marginBottom = "20px";
      priceInfoDiv.style.padding = "10px";
      priceInfoDiv.style.border = "1px solid #ddd";
      priceInfoDiv.style.borderRadius = "5px";
      priceInfoDiv.style.textAlign = "center";
      priceInfoDiv.style.backgroundColor = "#eaf7ff";
      priceInfoDiv.style.width = "auto"; // Lascia che il contenuto definisca la larghezza

      const quantityTitle = document.createElement("p");
      quantityTitle.innerText = `Dettagli per Quantità: ${selectedQuantity}`;
      quantityTitle.style.fontWeight = "bold";
      quantityTitle.style.fontSize = "16px";
      quantityTitle.style.marginBottom = "5px";
      priceInfoDiv.appendChild(quantityTitle);

      const basePriceText = document.createElement("p");
      basePriceText.innerText = `Prezzo Base: ${basePrice}`;
      basePriceText.style.fontSize = "15px";
      priceInfoDiv.appendChild(basePriceText);

      const scontatoPriceText = document.createElement("p");
      scontatoPriceText.innerText = `Prezzo Scontato: ${scontatoPrice}`;
      scontatoPriceText.style.fontSize = "15px";
      priceInfoDiv.appendChild(scontatoPriceText);

      pdfContentContainer.appendChild(priceInfoDiv);
    }
  }
  // --- Fine Logica per la quantità e prezzi specifici ---


  const customizationsSection = document.createElement("div");
  customizationsSection.style.display = "flex";
  customizationsSection.style.flexDirection = "column";
  customizationsSection.style.width = "100%";
  pdfContentContainer.appendChild(customizationsSection);

  for (const box of Array.from(uploadBoxes)) {
    const tipo = box.querySelector("h4").innerText;
    const imgInput = box.querySelector("input[type='file'][data-upload]");
    const descInput = box.querySelector("input[type='text'][data-desc]");

    const itemContainer = document.createElement("div");
    itemContainer.style.marginBottom = "25px";
    itemContainer.style.padding = "10px";
    itemContainer.style.border = "1px solid #eee";
    itemContainer.style.borderRadius = "8px";
    itemContainer.style.backgroundColor = "#fdfdfd";
    itemContainer.style.width = "calc(100% - 20px)";

    const tipoLabel = document.createElement("h3");
    tipoLabel.innerText = tipo;
    tipoLabel.style.textAlign = "left";
    tipoLabel.style.marginBottom = "10px";
    tipoLabel.style.color = "#007bff";
    itemContainer.appendChild(tipoLabel);

    const imgAndDescWrapper = document.createElement("div");
    imgAndDescWrapper.style.display = "flex";
    imgAndDescWrapper.style.alignItems = "flex-start";
    imgAndDescWrapper.style.gap = "15px";
    imgAndDescWrapper.style.width = "100%";

    const imgWrapper = document.createElement("div");
    imgWrapper.style.flexShrink = "0";
    imgWrapper.style.width = "200px";
    imgWrapper.style.height = "200px";
    imgWrapper.style.border = "1px dashed #999";
    imgWrapper.style.display = "flex";
    imgWrapper.style.alignItems = "center";
    imgWrapper.style.justifyContent = "center";
    imgWrapper.style.overflow = "hidden";

    const desc = document.createElement("p");
    desc.innerText = "DESCRIZIONE: " + (descInput ? descInput.value : "Nessuna descrizione.");
    desc.style.fontSize = "14px";
    desc.style.textAlign = "left";
    desc.style.lineHeight = "1.4";
    desc.style.wordBreak = "break-word";
    desc.style.flexGrow = "1";
    desc.style.maxWidth = "calc(100% - 215px)";

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

  const previewArea = document.createElement("div");
  previewArea.style.position = "absolute";
  previewArea.style.left = "-9999px";
  previewArea.appendChild(pdfContentContainer);
  document.body.appendChild(previewArea);

  setTimeout(() => {
    html2pdf().from(pdfContentContainer).set({
      margin: [10, 10, 10, 10],
      filename: nota.replace(/\s+/g, "_") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: true, useCORS: true },
      // *** CAMBIAMENTO QUI: Orientamento in "landscape" ***
      jsPDF: { unit: "px", format: "a4", orientation: "landscape" },
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
