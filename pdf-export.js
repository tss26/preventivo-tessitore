
document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  const pages = await Promise.all(Array.from(uploadBoxes).map(box => {
    return new Promise(resolve => {
      const tipo = box.querySelector("h4").innerText;
      const imgInput = box.querySelector("input[type='file']");
      const descInput = box.querySelector("input[type='text']");

      const page = document.createElement("div");
      page.style.width = "794px"; // A4 width in px @96dpi
      page.style.height = "1123px"; // A4 height in px @96dpi
      page.style.padding = "40px";
      page.style.boxSizing = "border-box";
      page.style.fontFamily = "Arial, sans-serif";
      page.style.display = "flex";
      page.style.flexDirection = "column";
      page.style.justifyContent = "flex-start";
      page.style.pageBreakAfter = "always";

      const titolo = document.createElement("h2");
      titolo.innerText = nota;
      titolo.style.marginBottom = "10px";

      const tipoLabel = document.createElement("h3");
      tipoLabel.innerText = tipo;
      tipoLabel.style.marginTop = "20px";

      const imgWrapper = document.createElement("div");
      imgWrapper.style.textAlign = "center";
      imgWrapper.style.margin = "20px 0";

      const desc = document.createElement("p");
      desc.innerText = descInput.value;
      desc.style.marginTop = "10px";

      const file = imgInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          img.style.width = "255px"; // 9cm
          img.style.height = "auto";
          img.style.display = "block";
          img.style.margin = "0 auto";
          img.onload = () => {
            imgWrapper.appendChild(img);
            page.appendChild(titolo);
            page.appendChild(tipoLabel);
            page.appendChild(imgWrapper);
            page.appendChild(desc);
            resolve(page);
          };
        };
        reader.readAsDataURL(file);
      } else {
        imgWrapper.innerText = "Nessuna immagine";
        page.appendChild(titolo);
        page.appendChild(tipoLabel);
        page.appendChild(imgWrapper);
        page.appendChild(desc);
        resolve(page);
      }
    });
  }));

  const wrapper = document.createElement("div");
  wrapper.style.width = "794px";
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
      html2canvas: { scale: 2 },
      jsPDF: { unit: "px", format: [794, 1123], orientation: "portrait" },
      pagebreak: { mode: ["avoid-all"] }
    }).save().then(() => {
      document.body.removeChild(previewArea);
    });
  }, 500);
});
