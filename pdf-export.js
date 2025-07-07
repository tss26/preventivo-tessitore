
document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  const pages = await Promise.all(Array.from(uploadBoxes).map((box, index, arr) => {
    return new Promise(resolve => {
      const tipo = box.querySelector("h4").innerText;
      const imgInput = box.querySelector("input[type='file']");
      const descInput = box.querySelector("input[type='text']");

      // Contenitore singola pagina
      const page = document.createElement("div");
      page.style.width = "794px"; // A4 width @96dpi
      page.style.height = "1123px"; // A4 height
      page.style.display = "flex";
      page.style.flexDirection = "column";
      page.style.justifyContent = "center";
      page.style.alignItems = "center";
      page.style.padding = "40px";
      page.style.boxSizing = "border-box";
      page.style.fontFamily = "Arial, sans-serif";
      if (index !== arr.length - 1) {
        page.style.pageBreakAfter = "always";
      }

      // Tipo personalizzazione
      const tipoLabel = document.createElement("h2");
      tipoLabel.innerText = tipo;
      tipoLabel.style.marginBottom = "20px";
      tipoLabel.style.textAlign = "center";

      // Immagine
      const imgWrapper = document.createElement("div");
      imgWrapper.style.flex = "0 0 auto";
      imgWrapper.style.maxHeight = "600px";
      imgWrapper.style.marginBottom = "20px";
      imgWrapper.style.display = "flex";
      imgWrapper.style.justifyContent = "center";
      imgWrapper.style.alignItems = "center";

      // Descrizione
      const desc = document.createElement("p");
      desc.innerText = descInput.value;
      desc.style.fontSize = "16px";
      desc.style.textAlign = "center";
      desc.style.lineHeight = "1.5";
      desc.style.wordBreak = "break-word";
      desc.style.maxWidth = "100%";

      const file = imgInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          img.style.maxWidth = "312px"; // 11 cm
          img.style.maxHeight = "600px";
          img.style.objectFit = "contain";
          img.onload = () => {
            imgWrapper.appendChild(img);
            page.appendChild(tipoLabel);
            page.appendChild(imgWrapper);
            page.appendChild(desc);
            resolve(page);
          };
        };
        reader.readAsDataURL(file);
      } else {
        imgWrapper.innerText = "Nessuna immagine";
        page.appendChild(tipoLabel);
        page.appendChild(imgWrapper);
        page.appendChild(desc);
        resolve(page);
      }
    });
  }));

  const wrapper = document.createElement("div");
  wrapper.style.width = "794px";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";

  pages.forEach(p => wrapper.appendChild(p));

  const previewArea = document.createElement("div");
  previewArea.style.position = "absolute";
  previewArea.style.left = "-9999px";
  previewArea.appendChild(wrapper);
  document.body.appendChild(previewArea);

  setTimeout(() => {
    html2pdf().from(wrapper).set({
      margin: 0,
      filename: nota.replace(/\s+/g, "_") + ".pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }
    }).save().then(() => {
      document.body.removeChild(previewArea);
    });
  }, 500);
});
