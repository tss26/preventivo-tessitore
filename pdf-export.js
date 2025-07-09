document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  if (uploadBoxes.length === 0) {
    alert("Nessuna personalizzazione selezionata con immagini o descrizioni. Aggiungi delle sezioni prima di generare il PDF.");
    return;
  }

  const pdfContentContainer = document.createElement("div");
  pdfContentContainer.style.width = "1050px"; // Larghezza per A4 orizzontale
  pdfContentContainer.style.minHeight = "750px"; // Altezza per A4 orizzontale
  pdfContentContainer.style.padding = "15px"; // Rimpicciolito il padding generale
  pdfContentContainer.style.boxSizing = "border-box";
  pdfContentContainer.style.fontFamily = "Arial, sans-serif";
  pdfContentContainer.style.display = "flex";
  pdfContentContainer.style.flexDirection = "column";
  pdfContentContainer.style.alignItems = "center";
  pdfContentContainer.style.justifyContent = "flex-start";
  pdfContentContainer.style.overflow = "hidden";

  const mainTitle = document.createElement("h1");
  mainTitle.innerText = (nota || "Preventivo").toUpperCase();
  mainTitle.style.marginBottom = "15px"; // Rimpicciolito
  mainTitle.style.color = "#000";
  mainTitle.style.textAlign = "center";
  mainTitle.style.fontSize = "26px"; // Rimpicciolito
  pdfContentContainer.appendChild(mainTitle);

  // --- Logica per la quantità e prezzi specifici ---
  const selectedQuantity = parseInt(document.getElementById("quantita").value);
  const quantitaHeaders = document.querySelectorAll("#quantitaRow th");
  let quantityDataColumnIndex = -1;

  for (let i = 1; i < quantitaHeaders.length; i++) {
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
      priceInfoDiv.style.marginBottom = "15px"; // Rimpicciolito
      priceInfoDiv.style.padding = "8px"; // Rimpicciolito
      priceInfoDiv.style.border = "1px solid #ddd";
      priceInfoDiv.style.borderRadius = "5px";
      priceInfoDiv.style.textAlign = "center";
      priceInfoDiv.style.backgroundColor = "#eaf7ff";
      priceInfoDiv.style.width = "auto";

      const quantityTitle = document.createElement("p");
      quantityTitle.innerText = `Dettagli per Quantità: ${selectedQuantity}`;
      quantityTitle.style.fontWeight = "bold";
      quantityTitle.style.fontSize = "15px"; // Rimpicciolito
      quantityTitle.style.marginBottom = "3px"; // Rimpicciolito
      priceInfoDiv.appendChild(quantityTitle);

      const basePriceText = document.createElement("p");
      basePriceText.innerText = `Prezzo Base: ${basePrice}`;
      basePriceText.style.fontSize = "14px"; // Rimpicciolito
      priceInfoDiv.appendChild(basePriceText);

      const scontatoPriceText = document.createElement("p");
      scontatoPriceText.innerText = `Prezzo Scontato: ${scontatoPrice}`;
      scontatoPriceText.style.fontSize = "14px"; // Rimpicciolito
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
    itemContainer.style.marginBottom = "15px"; // Rimpicciolito
    itemContainer.style.padding = "8px"; // Rimpicciolito
    itemContainer.style.border = "1px solid #eee";
    itemContainer.style.borderRadius = "8px";
    itemContainer.style.backgroundColor = "#fdfdfd";
    itemContainer.style.width = "calc(100% - 16px)"; // Adattato al nuovo padding

    const tipoLabel = document.createElement("h3");
    tipoLabel.innerText = tipo;
    tipoLabel.style.textAlign = "left";
    tipoLabel.style.marginBottom = "8px"; // Rimpicciolito
    tipoLabel.style.color = "#007bff";
    tipoLabel.style.fontSize = "18px"; // Rimpicciolito
    itemContainer.appendChild(tipoLabel);

    const imgAndDescWrapper = document.createElement("div");
    imgAndDescWrapper.style.display = "flex";
    imgAndDescWrapper.style.alignItems = "flex-start";
    imgAndDescWrapper.style.gap = "10px"; // Rimpicciolito
    imgAndDescWrapper.style.width = "100%";

    const imgWrapper = document.createElement("div");
    imgWrapper.style.flexShrink = "0";
    imgWrapper.style.width = "150px"; // Rimpicciolito
    imgWrapper.style.height = "150px"; // Rimpicciolito
    imgWrapper.style.border = "1px dashed #999";
    imgWrapper.style.display = "flex";
    imgWrapper.style.alignItems = "center";
    imgWrapper.style.justifyContent = "center";
    imgWrapper.style.overflow = "hidden";

    const desc = document.createElement("p");
    desc.innerText = "DESCRIZIONE: " + (descInput ? descInput.value : "Nessuna descrizione.");
    desc.style.fontSize = "13px"; // Rimpicciolito
    desc.style.textAlign = "left";
    desc.style.lineHeight = "1.4";
    desc.style.wordBreak = "break-word";
    desc.style.flexGrow = "1";
    desc.style.maxWidth = "calc(100% - 160px)"; // Adattato alle nuove dimensioni immagine e gap

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
            imgWrapper.innerHTML = `<p style="color: red; font-size: 9px; text-align: center;">Errore caricamento immagine</p>`; // Rimpicciolito messaggio errore
            resolve();
          };
        };
        reader.onerror = (e) => {
          console.error("Errore FileReader:", e);
          imgWrapper.innerHTML = `<p style="color: red; font-size: 9px; text-align: center;">Errore lettura file</p>`; // Rimpicciolito messaggio errore
          resolve();
        };
        reader.readAsDataURL(file);
      });
    } else {
      const noImgText = document.createElement("p");
      noImgText.innerText = "Nessuna immagine allegata";
      noImgText.style.color = "#888";
      noImgText.style.fontSize = "11px"; // Rimpicciolito
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
      margin: [10, 10, 10, 10], // Margini già abbastanza ridotti
      filename: nota.replace(/\s+/g, "_") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: true, useCORS: true },
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
