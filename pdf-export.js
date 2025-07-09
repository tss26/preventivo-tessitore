document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  if (uploadBoxes.length === 0) {
    alert("Nessuna personalizzazione selezionata con immagini o descrizioni. Aggiungi delle sezioni prima di generare il PDF.");
    return;
  }

  const pagesToRender = []; // Array per contenere tutti i div delle pagine

  // --- Crea la pagina con la tabella ---
  const tablePageDiv = document.createElement("div");
  tablePageDiv.style.width = "794px"; // Larghezza A4 a 96 DPI (21 cm)
  tablePageDiv.style.minHeight = "1123px"; // Altezza A4 a 96 DPI
  tablePageDiv.style.padding = "40px 19px"; // Padding come le pagine di personalizzazione
  tablePageDiv.style.boxSizing = "border-box";
  tablePageDiv.style.fontFamily = "Arial, sans-serif";
  tablePageDiv.style.display = "flex";
  tablePageDiv.style.flexDirection = "column";
  tablePageDiv.style.alignItems = "center";
  tablePageDiv.style.justifyContent = "flex-start";
  tablePageDiv.style.overflow = "hidden";

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse"; // Per unire i bordi
  table.style.width = "378px"; // NUOVO: Larghezza dimezzata (20cm / 2 = 10cm effettivi)
  table.style.marginTop = "50px"; // Margine superiore per allontanarla dal bordo della pagina

  const tbody = document.createElement("tbody");

  for (let i = 1; i <= 3; i++) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.innerText = `Contenuto Riga ${i}`; // Testo di esempio per ogni riga
    td.style.border = "4px solid #ADD8E6"; // Bordo di 1mm (circa 4px) colore celeste
    td.style.padding = "15px"; // Padding interno della cella
    td.style.textAlign = "center"; // Centra il testo nella cella
    td.style.fontSize = "18px"; // Dimensione del font
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  tablePageDiv.appendChild(table);

  pagesToRender.push(tablePageDiv); // Aggiungi la pagina della tabella all'inizio dell'array

  // --- Processa le personalizzazioni (ogni una su una nuova pagina) ---
  for (const box of Array.from(uploadBoxes)) {
    // Crea un nuovo div per ogni pagina A4
    const pageDiv = document.createElement("div");
    pageDiv.style.width = "794px"; // Larghezza A4 a 96 DPI (21 cm)
    pageDiv.style.minHeight = "1123px"; // Altezza A4 a 96 DPI
    pageDiv.style.padding = "40px 19px"; // Padding verticale 40px, orizzontale 19px per lato
    pageDiv.style.boxSizing = "border-box";
    pageDiv.style.fontFamily = "Arial, sans-serif";
    pageDiv.style.display = "flex";
    pageDiv.style.flexDirection = "column";
    pageDiv.style.alignItems = "center"; // Centra il contenuto orizzontalmente
    pageDiv.style.justifyContent = "flex-start"; // Il contenuto inizia dall'alto
    pageDiv.style.overflow = "hidden";

    const tipo = box.querySelector("h4").innerText;
    const imgInput = box.querySelector("input[type='file'][data-upload]");
    const descInput = box.querySelector("input[type='text'][data-desc]");

    const itemContainer = document.createElement("div");
    itemContainer.style.width = "378px"; // NUOVO: Larghezza dimezzata anche per il riquadro personalizzazione
    itemContainer.style.padding = "10px";
    itemContainer.style.border = "1px solid #eee";
    itemContainer.style.borderRadius = "8px";
    itemContainer.style.backgroundColor = "#fdfdfd";
    itemContainer.style.boxSizing = "border-box";
    itemContainer.style.marginBottom = "10px";

    const tipoLabel = document.createElement("h3");
    tipoLabel.innerText = tipo;
    tipoLabel.style.textAlign = "left";
    tipoLabel.style.marginBottom = "10px";
    tipoLabel.style.color = "#007bff";
    tipoLabel.style.fontSize = "20px";
    itemContainer.appendChild(tipoLabel);

    const imgAndDescWrapper = document.createElement("div");
    imgAndDescWrapper.style.display = "flex";
    imgAndDescWrapper.style.flexDirection = "column"; // Immagine sopra la descrizione
    imgAndDescWrapper.style.alignItems = "center"; // Centra immagine e descrizione
    imgAndDescWrapper.style.width = "100%";
    imgAndDescWrapper.style.gap = "10px";

    const imgWrapper = document.createElement("div");
    imgWrapper.style.flexShrink = "0";
    imgWrapper.style.width = "302px"; // Immagine di 8cm (302px)
    imgWrapper.style.height = "302px"; // Immagine di 8cm (302px)
    imgWrapper.style.border = "1px dashed #999";
    imgWrapper.style.display = "flex";
    imgWrapper.style.alignItems = "center";
    imgWrapper.style.justifyContent = "center";
    imgWrapper.style.overflow = "hidden";
    imgWrapper.style.marginBottom = "5px";
    imgAndDescWrapper.appendChild(imgWrapper);

    const desc = document.createElement("p");
    desc.innerText = "DESCRIZIONE: " + (descInput ? descInput.value : "Nessuna descrizione.");
    desc.style.fontSize = "14px";
    desc.style.textAlign = "center";
    desc.style.lineHeight = "1.4";
    desc.style.wordBreak = "break-word";
    desc.style.width = "100%";
    imgAndDescWrapper.appendChild(desc);

    itemContainer.appendChild(imgAndDescWrapper);
    pageDiv.appendChild(itemContainer);

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
      noImgText.style.fontSize = "12px";
      noImgText.style.textAlign = "center";
      imgWrapper.appendChild(noImgText);
    }
    pagesToRender.push(pageDiv);
  }

  // Wrapper finale per html2pdf per gestire i page break tra le pagine generate
  const finalWrapper = document.createElement("div");
  pagesToRender.forEach((p, index) => {
    finalWrapper.appendChild(p);
    if (index < pagesToRender.length - 1) {
      const pageBreak = document.createElement("div");
      pageBreak.style.pageBreakAfter = "always";
      finalWrapper.appendChild(pageBreak);
    }
  });

  const previewArea = document.createElement("div");
  previewArea.style.position = "absolute";
  previewArea.style.left = "-9999px";
  previewArea.appendChild(finalWrapper);
  document.body.appendChild(previewArea);

  setTimeout(() => {
    html2pdf().from(finalWrapper).set({
      margin: 0,
      filename: nota.replace(/\s+/g, "_") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: true, useCORS: true },
      jsPDF: { unit: "px", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
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
