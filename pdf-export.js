document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  if (uploadBoxes.length === 0) {
    alert("Nessuna personalizzazione selezionata con immagini o descrizioni. Aggiungi delle sezioni prima di generare il PDF.");
    return;
  }

  const pagesToRender = []; // Array per contenere tutti i div delle pagine

  // --- Processa le personalizzazioni, ORA CIASCUNA ALL\'INTERNO DI UNA TABELLA 1X1 SULLA PROPRIA PAGINA ---
  for (const box of Array.from(uploadBoxes)) {
    // Crea un nuovo div per ogni pagina A4
    const pageDiv = document.createElement("div");
    pageDiv.style.width = "794px"; // Larghezza A4 a 96 DPI (21 cm)
    pageDiv.style.minHeight = "1123px"; // Altezza A4 a 96 DPI
    pageDiv.style.paddingBottom = "40px 19px"; // Padding verticale 40px, orizzontale 19px per lato
    pageDiv.style.boxSizing = "border-box";
    pageDiv.style.fontFamily = "Arial, sans-serif";
    pageDiv.style.display = "flex";
    pageDiv.style.flexDirection = "column";
    pageDiv.style.alignItems = "left"; // Centra il contenuto orizzontalmente (la tabella)
    pageDiv.style.justifyContent = "flex-start"; // Il contenuto inizia dall\'alto
    pageDiv.style.overflow = "hidden";

    // --- Crea la tabella 1x1 per questa personalizzazione ---
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "392.5px"; // Larghezza desiderata (785px / 2)
    table.style.marginTop = "50px"; // Margine superiore per allontanarla dal bordo della pagina

    const tbody = document.createElement("tbody");
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.style.border = "4px solid #ADD8E6"; // Bordo di 1mm (circa 4px) colore celeste
    td.style.padding = "15px"; // Padding interno della cella
    td.style.textAlign = "left"; // Centra il testo nella cella (questo verrà sovrascritto dal contenuto)
    td.style.fontSize = "18px"; // Dimensione del font (anche questa verrà influenzata dal contenuto)

    // --- Crea il box di personalizzazione (itemContainer) ---
    const tipo = box.querySelector("h4").innerText;
    const imgInput = box.querySelector("input[type=\'file\'][data-upload]");
    const descInput = box.querySelector("input[type=\'text\'][data-desc]");

    const itemContainer = document.createElement("div");
    itemContainer.style.width = "100%"; // Occupa tutta la larghezza della cella della tabella
    itemContainer.style.padding = "0"; // Rimuovi padding qui, già gestito dalla cella
    itemContainer.style.border = "none"; // Rimuovi bordo qui, già gestito dalla cella
    itemContainer.style.borderRadius = "0";
    itemContainer.style.backgroundColor = "transparent"; // Sfondo trasparente
    itemContainer.style.boxSizing = "border-box";
    itemContainer.style.marginBottom = "0"; // Gestito dal contenuto interno

    const tipoLabel = document.createElement("h3");
    tipoLabel.innerText = tipo;
    tipoLabel.style.textAlign = "left";
    tipoLabel.style.marginBottom = "10px";
    tipoLabel.style.color = "#007bff";
    tipoLabel.style.fontSize = "20px";
    itemContainer.appendChild(tipoLabel);

    const imgAndDescWrapper = document.createElement("div");
    imgAndDescWrapper.style.display = "flex";
    imgAndDescWrapper.style.flexDirection = "column";
    imgAndDescWrapper.style.alignItems = "left";
    imgAndDescWrapper.style.width = "100%";
    imgAndDescWrapper.style.gap = "10px";

    const imgWrapper = document.createElement("div");
    imgWrapper.style.flexShrink = "0";
    imgWrapper.style.width = "100%";
    imgWrapper.style.height = "auto";
    imgWrapper.style.border = "1px dashed #999";
    imgWrapper.style.display = "flex";
    imgWrapper.style.alignItems = "left";
    imgWrapper.style.justifyContent = "left";
    imgWrapper.style.overflow = "hidden";
    imgWrapper.style.marginBottom = "5px";
    imgAndDescWrapper.appendChild(imgWrapper);

    const desc = document.createElement("p");
    desc.innerText = "DESCRIZIONE: " + (descInput ? descInput.value : "Nessuna descrizione.");
    desc.style.fontSize = "14px";
    desc.style.textAlign = "left";
    desc.style.lineHeight = "1.4";
    desc.style.wordBreak = "break-word";
    desc.style.width = "100%";
    desc.style.maxWidth = "100%";
    imgAndDescWrapper.appendChild(desc);

    itemContainer.appendChild(imgAndDescWrapper);

    // Appendi il box di personalizzazione alla cella della tabella
    td.appendChild(itemContainer);
    tr.appendChild(td);
    tbody.appendChild(tr);
    table.appendChild(tbody);

    // Appendi la tabella alla pagina
    pageDiv.appendChild(table);

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
            // CORREZIONE QUI (riga 126): Aggiunto apici inversi (backticks)
            imgWrapper.innerHTML = `<p style="color: red; font-size: 8px; text-align: center;">Errore caricamento immagine</p>`;
            resolve();
          };
        };
        reader.onerror = (e) => {
          console.error("Errore FileReader:", e);
          // CORREZIONE QUI (riga 132): Aggiunto apici inversi (backticks)
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
      noImgText.style.textAlign = "left";
      imgWrapper.appendChild(noImgText);
    }
    pagesToRender.push(pageDiv); // Aggiungi la pagina di personalizzazione (con la sua tabella 1x1) all\'array
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
