document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  // Array per contenere tutti i rendering delle pagine
  const pagesToRender = [];

  for (const box of Array.from(uploadBoxes)) {
    const tipo = box.querySelector("h4").innerText;
    const imgInput = box.querySelector("input[type='file']");
    const descInput = box.querySelector("input[type='text']");

    const page = document.createElement("div");
    page.style.width = "794px"; // A4 width at 96 DPI
    page.style.height = "1123px"; // A4 height at 96 DPI
    page.style.padding = "40px";
    page.style.boxSizing = "border-box";
    page.style.fontFamily = "Arial, sans-serif";
    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.justifyContent = "flex-start";
    page.style.alignItems = "center";
    page.style.overflow = "hidden";

    const tipoLabel = document.createElement("h2");
    tipoLabel.innerText = tipo;
    tipoLabel.style.textAlign = "center";
    tipoLabel.style.marginBottom = "20px";
    tipoLabel.style.color = "#007bff"; // Coerente con lo stile

    const imgWrapper = document.createElement("div");
    imgWrapper.style.display = "flex";
    imgWrapper.style.alignItems = "center";
    imgWrapper.style.justifyContent = "center";
    imgWrapper.style.maxHeight = "500px";
    imgWrapper.style.flex = "0 0 auto";
    imgWrapper.style.marginBottom = "20px";
    imgWrapper.style.width = "100%"; // Assicura che l'immagine possa espandersi

    const desc = document.createElement("p");
    desc.innerText = descInput.value;
    desc.style.fontSize = "16px";
    desc.style.textAlign = "center";
    desc.style.lineHeight = "1.5";
    desc.style.wordBreak = "break-word";
    desc.style.flex = "0 0 auto";
    desc.style.maxWidth = "700px"; // Limita la larghezza della descrizione

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
          img.style.maxHeight = "500px";
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

  html2pdf().from(wrapper).set({
    margin: 0,
    filename: nota.replace(/\s+/g, "_") + ".pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, logging: true, useCORS: true },
    jsPDF: { unit: "px", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  }).save().then(() => {
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
    console.log("PDF generato con successo!");
  }).catch(error => {
    console.error("Errore durante la generazione del PDF:", error);
    alert("Si è verificato un errore durante la generazione del PDF. Controlla la console per i dettagli.");
  });
});
