document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  // Array per contenere tutti i rendering delle pagine
  const pagesToRender = [];

  // Se non ci sono uploadBoxes, mostra un alert e non generare il PDF
  if (uploadBoxes.length === 0) {
    alert("Nessuna personalizzazione selezionata con immagini o descrizioni. Aggiungi delle sezioni prima di generare il PDF.");
    return;
  }

  for (const box of Array.from(uploadBoxes)) {
    const tipo = box.querySelector("h4").innerText;
    // Seleziona gli input usando gli attributi data-* come nel tuo script.js
    const imgInput = box.querySelector("input[type='file'][data-upload]");
    const descInput = box.querySelector("input[type='text'][data-desc]");

    const page = document.createElement("div");
    page.style.width = "794px"; // A4 width at 96 DPI
    page.style.height = "1123px"; // A4 height at 96 DPI
    page.style.padding = "40px 10px"; // Modificato: padding a 40px sopra/sotto, 10px a destra/sinistra
    page.style.boxSizing = "border-box";
    page.style.fontFamily = "Arial, sans-serif";
    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.justifyContent = "flex-start";
    page.style.alignItems = "flex-start"; // Modificato: Allinea gli elementi all'inizio (sinistra)
    page.style.overflow = "hidden";

    const tipoLabel = document.createElement("h2");
    tipoLabel.innerText = tipo;
    tipoLabel.style.textAlign = "left"; // Modificato: Allinea il testo a sinistra
    tipoLabel.style.marginBottom = "20px";
    tipoLabel.style.color = "#007bff";

    const imgWrapper = document.createElement("div");
    imgWrapper.style.display = "flex";
    imgWrapper.style.alignItems = "center";
    imgWrapper.style.justifyContent = "flex-start"; // Modificato: Allinea l'immagine a sinistra
    imgWrapper.style.maxHeight = "500px";
    imgWrapper.style.flex = "0 0 auto";
    imgWrapper.style.marginBottom = "20px";
    imgWrapper.style.width = "100%";
    imgWrapper.style.overflow = "hidden";

    const desc = document.createElement("p");
    // Usa il valore dell'input testuale, con un fallback per prevenire 'null'
    desc.innerText = descInput ? descInput.value : "";
    desc.style.fontSize = "16px";
    desc.style.textAlign = "left"; // Modificato: Allinea il testo a sinistra
    desc.style.lineHeight = "1.5";
    desc.style.wordBreak = "break-word";
    desc.style.flex = "0 0 auto";
    desc.style.maxWidth = "700px";

    page.appendChild(tipoLabel);
    page.appendChild(imgWrapper);
    page.appendChild(desc);

    const file = imgInput ? imgInput.files[0] : null;
    if (file) {
      await new Promise((resolve, reject) => { // Aggiunto reject per la gestione errori
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          img.style.maxWidth = "100%";
          img.style.maxHeight = "500px";
          img.style.objectFit = "contain";
          img.onload = () => {
            imgWrapper.appendChild(img);
            resolve(); // Risolve la Promise quando l'immagine è caricata
          };
          img.onerror = (e) => { // Gestione errori caricamento immagine
            console.error("Errore caricamento immagine:", e);
            imgWrapper.innerHTML = `<p style="color: red;">Impossibile caricare l'immagine.</p>`;
            resolve(); // Risolve comunque per non bloccare il PDF, ma con un messaggio di errore
          };
        };
        reader.onerror = (e) => { // Gestione errori FileReader
          console.error("Errore FileReader:", e);
          imgWrapper.innerHTML = `<p style="color: red;">Errore nella lettura del file immagine.</p>`;
          resolve(); // Risolve comunque
        };
        reader.readAsDataURL(file);
      });
    } else {
      const noImgText = document.createElement("p");
      noImgText.innerText = "Nessuna immagine allegata";
      noImgText.style.color = "#888";
      noImgText.style.width = "100%";
      noImgText.style.textAlign = "left";
      imgWrapper.appendChild(noImgText);
    }
    pagesToRender.push(page);
  }

  if (pagesToRender.length === 0) {
    alert("Nessuna sezione con personalizzazioni trovata da esportare nel PDF.");
    return;
  }

  // Crea un wrapper temporaneo per html2pdf per processare tutte le pagine
  const wrapper = document.createElement("div");
  wrapper.style.width = "794px"; // Corrisponde alla larghezza della pagina per un rendering consistente
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";

  pagesToRender.forEach((p, index) => {
    wrapper.appendChild(p);
    // Aggiungi un'interruzione di pagina dopo ogni pagina eccetto l'ultima
    if (index < pagesToRender.length - 1) {
      const pageBreak = document.createElement("div");
      pageBreak.style.pageBreakAfter = "always";
      wrapper.appendChild(pageBreak);
    }
  });

  // Aggiungi il wrapper al body fuori dallo schermo per il rendering di html2pdf
  const previewArea = document.createElement("div");
  previewArea.style.position = "absolute";
  previewArea.style.left = "-9999px"; // Sposta fuori dallo schermo
  previewArea.appendChild(wrapper);
  document.body.appendChild(previewArea);

  // Usa un piccolo timeout per assicurarsi che il DOM sia aggiornato prima che html2pdf renderizzi
  setTimeout(() => {
    html2pdf().from(wrapper).set({
      margin: 0,
      filename: nota.replace(/\s+/g, "_") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: true, useCORS: true },
      jsPDF: { unit: "px", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }).save().then(() => {
      // Pulisci l'area di preview temporanea dopo la generazione del PDF
      if (previewArea.parentNode) {
        previewArea.parentNode.removeChild(previewArea);
      }
      console.log("PDF generato con successo!");
    }).catch(error => {
      // Pulisci anche in caso di errore
      if (previewArea.parentNode) {
        previewArea.parentNode.removeChild(previewArea);
      }
      console.error("Errore durante la generazione del PDF:", error);
      alert("Errore durante la generazione del PDF. Controlla la console per maggiori dettagli.");
    });
  }, 100);
});
