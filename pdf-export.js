document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  const pagesToRender = [];

  for (const box of Array.from(uploadBoxes)) {
    const tipo = box.querySelector("h4").innerText;
    const imgInput = box.querySelector("input[type='file']");
    const descInput = box.querySelector("input[type='text']");

    const page = document.createElement("div");
    page.style.width = "794px"; // A4 width in px at 96 DPI
    page.style.height = "1123px"; // A4 height in px at 96 DPI
    page.style.padding = "40px";
    page.style.boxSizing = "border-box";
    page.style.fontFamily = "Arial, sans-serif";
    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.justifyContent = "flex-start";
    page.style.alignItems = "flex-start";
    page.style.overflow = "hidden"; // Ensures content stays within bounds

    const tipoLabel = document.createElement("h2");
    tipoLabel.innerText = tipo;
    tipoLabel.style.textAlign = "left";
    tipoLabel.style.marginBottom = "20px";
    tipoLabel.style.color = "#007bff";
    tipoLabel.style.width = "100%";

    const desc = document.createElement("p");
    desc.innerText = descInput.value;
    desc.style.fontSize = "16px";
    desc.style.textAlign = "left";
    desc.style.lineHeight = "1.5";
    desc.style.wordBreak = "break-word";
    desc.style.marginBottom = "20px";
    desc.style.flexShrink = "1";
    desc.style.maxWidth = "100%";
    desc.style.overflowWrap = "break-word"; // For long words

    const imgWrapper = document.createElement("div");
    imgWrapper.style.display = "flex";
    imgWrapper.style.alignItems = "center";
    imgWrapper.style.justifyContent = "flex-start";
    imgWrapper.style.maxHeight = "700px"; // Max height for image container
    imgWrapper.style.marginBottom = "20px";
    imgWrapper.style.width = "100%";
    imgWrapper.style.overflow = "hidden";

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
          img.style.maxHeight = "100%";
          img.style.objectFit = "contain"; // Ensures image fits without cropping
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

  // Create a temporary wrapper for html2pdf to process all pages
  const wrapper = document.createElement("div");
  wrapper.style.width = "794px"; // Match page width for consistent rendering
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";

  pagesToRender.forEach((p, index) => {
    wrapper.appendChild(p);
    // Add page break after each page except the last one
    if (index < pagesToRender.length - 1) {
      const pageBreak = document.createElement("div");
      pageBreak.style.pageBreakAfter = "always";
      wrapper.appendChild(pageBreak);
    }
  });

  // Append wrapper to body off-screen for html2pdf to render
  const previewArea = document.createElement("div");
  previewArea.style.position = "absolute";
  previewArea.style.left = "-9999px"; // Move off-screen
  previewArea.appendChild(wrapper);
  document.body.appendChild(previewArea);

  // Use a small timeout to ensure the DOM is updated before html2pdf renders
  setTimeout(() => {
    html2pdf().from(wrapper).set({
      margin: 0,
      filename: nota.replace(/\s+/g, "_") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, logging: true, useCORS: true },
      jsPDF: { unit: "px", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }).save().then(() => {
      // Clean up the temporary preview area after PDF generation
      if (previewArea.parentNode) {
        previewArea.parentNode.removeChild(previewArea);
      }
      console.log("PDF generato con successo!");
    }).catch(error => {
      // Clean up even if there's an error
      if (previewArea.parentNode) {
        previewArea.parentNode.removeChild(previewArea);
      }
      console.error("Errore durante la generazione del PDF:", error);
      alert("Errore durante la generazione del PDF. Controlla la console.");
    });
  }, 100);
});
