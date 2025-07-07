
document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  const pages = await Promise.all(Array.from(uploadBoxes).map((box, index, arr) => {
    return new Promise(resolve => {
      const tipo = box.querySelector("h4").innerText;
      const imgInput = box.querySelector("input[type='file']");
      const descInput = box.querySelector("input[type='text']");

      const page = document.createElement("div");
      page.style.width = "794px"; // A4 width
      page.style.minHeight = "1000px"; // lasciamo html2pdf adattare l'altezza
      page.style.padding = "40px";
      page.style.boxSizing = "border-box";
      page.style.fontFamily = "Arial, sans-serif";
      page.style.display = "flex";
      page.style.flexDirection = "column";
      page.style.justifyContent = "flex-start";
      page.style.alignItems = "center";
      if (index !== arr.length - 1) {
        page.style.pageBreakAfter = "always";
      }

      const tipoLabel = document.createElement("h2");
      tipoLabel.innerText = tipo;
      tipoLabel.style.textAlign = "center";
      tipoLabel.style.marginBottom = "20px";

      const imgWrapper = document.createElement("div");
      imgWrapper.style.display = "flex";
      imgWrapper.style.alignItems = "center";
      imgWrapper.style.justifyContent = "center";
      imgWrapper.style.marginBottom = "20px";
      imgWrapper.style.maxHeight = "600px";

      const desc = document.createElement("p");
      desc.innerText = descInput.value;
      desc.style.fontSize = "16px";
      desc.style.textAlign = "center";
      desc.style.lineHeight = "1.5";
      desc.style.wordBreak = "break-word";

      const file = imgInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          img.style.maxWidth = "100%";
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
      margin: [20, 20, 20, 20],
      filename: nota.replace(/\s+/g, "_") + ".pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "px", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }
    }).save().then(() => {
      document.body.removeChild(previewArea);
    });
  }, 500);
});
