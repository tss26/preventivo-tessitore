document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  const pagesToRender = [];

  for (const box of Array.from(uploadBoxes)) {
    const tipo = box.querySelector("h4").innerText;
    const imgInput = box.querySelector("input[type='file']");
    const descInput = box.querySelector("input[type='text']");

    const page = document.createElement("div");
    page.style.width = "794px"; // A4 width at 96 DPI
    page.style.height = "1123px"; // A4 height at 96 DPI
    page.style.padding = "40px"; // Padding uniforme su tutti i lati
    page.style.boxSizing = "border-box"; // Include padding nella larghezza/altezza
    page.style.fontFamily = "Arial, sans-serif";
    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.justifyContent = "flex-start"; // Allinea gli elementi dall'alto
    page.style.alignItems = "flex-start"; // Allinea gli elementi a sinistra
    page.style.overflow = "hidden"; // Nasconde contenuto che esce dai bordi

    const tipoLabel = document.createElement("h2");
    tipoLabel.innerText = tipo;
    tipoLabel.style.textAlign = "left"; // Allinea il testo a sinistra
    tipoLabel.style.marginBottom = "20px";
    tipoLabel.style.color = "#007bff";
    tipoLabel.style.width = "100%"; // Occupa tutta la larghezza disponibile

    const desc = document.createElement("p");
    desc.innerText = descInput.value;
    desc.style.fontSize = "16px";
    desc.style.textAlign = "left"; // Allinea il testo a sinistra
    desc.style.lineHeight = "1.5";
    desc.style.wordBreak = "break-word"; // Forza la rottura delle parole lunghe
    desc.style.marginBottom = "20px";
    desc.style.flex = "0 1 auto"; // Permette alla descrizione di restringersi se necessario
    desc.style.maxWidth = "100%"; // Limita la larghezza al 100% del contenitore
    desc.style.overflowWrap = "break-word"; // Per una migliore gestione delle parole

    const imgWrapper = document.createElement("div");
    imgWrapper.style.display = "flex";
    imgWrapper.style.alignItems = "center";
    imgWrapper.style.justifyContent = "flex-start"; // Allinea l'immagine a sinistra
    imgWrapper.style.flex = "1 1 auto"; // Permette all'immagine di crescere e restringersi per occupare lo spazio disponibile
    imgWrapper.style.marginBottom = "20px";
    imgWrapper.style.width = "100%"; // Occupa tutta la larghezza disponibile
    imgWrapper.style.overflow = "hidden"; // Importante per nascondere parti dell'immagine che superano il wrapper

    page.appendChild(tipoLabel);
    page.appendChild(imgWrapper);
    page.appendChild(desc);

    const file = imgInput.files[0];
    if (file) {
      await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          img.style.maxWidth = "100%";
          img.style.maxHeight = "calc(100% - 120px)"; // Stima di 120px per titolo e descrizione, potrebbe richiedere aggiustamenti
          img.style.objectFit = "contain";
          img.onload = () => {
            imgWrapper.appendChild(img);
            resolve();
          };
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
    alert("Nessuna personalizzazione selezionata o nessuna immagine/descrizione aggiunta per generare il PDF.");
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.style.width = "794px";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";

  // Aggiungi le pagine al wrapper
  pagesToRender.forEach((p, index) => {
    wrapper.appendChild(p);
    // Aggiungi un page break tra le pagine, tranne l'ultima
    if (index < pagesToRender.length - 1) {
      const pageBreak = document.createElement("div");
      pageBreak.style.pageBreakAfter = "always";
      wrapper.appendChild(pageBreak);
    }
  });

  // Reintroduci l'area di anteprima temporanea
  const previewArea = document.createElement("div");
  previewArea.style.position = "absolute";
  previewArea.style.left = "-9999px"; // Sposta fuori schermo
  previewArea.appendChild(wrapper);
  document.body.appendChild(previewArea); // Aggiungi al body

  // Aggiungi un piccolo ritardo per assicurare l'aggiornamento del DOM
  setTimeout(() => {
    html2pdf().from(wrapper).set({
      margin: 0,
      filename: nota.replace(/\s+/g, "_") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: true, useCORS: true },
      jsPDF: { unit: "px", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }).save().then(() => {
      // Pulisci l'elemento temporaneo
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
      alert("Si è verificato un errore durante la generazione del PDF. Controlla la console per i dettagli.");
    });
  }, 100); // Ritardo di 100ms
});
