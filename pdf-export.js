
document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  const pages = await Promise.all(Array.from(uploadBoxes).map((box) => {
    return new Promise(resolve => {
      const tipo = box.querySelector("h4").innerText;
      const imgInput = box.querySelector("input[type='file']");
      const descInput = box.querySelector("input[type='text']");

      const page = document.createElement("div");
      page.style.width = "794px";
      page.style.minHeight = "1123px";
      page.style.boxSizing = "border-box";
      page.style.fontFamily = "Arial, sans-serif";
      page.style.display = "flex";
      page.style.flexDirection = "column";
      page.style.alignItems = "center";
      page.style.justifyContent = "flex-start";
      page.style.padding = "20px";
      page.style.textAlign = "center";

      const tipoLabel = document.createElement("h2");
      tipoLabel.innerText = tipo;
      tipoLabel.style.marginBottom = "20px";

      const imgWrapper = document.createElement("div");
      imgWrapper.style.marginBottom = "20px";

      const desc = document.createElement("p");
      desc.innerText = descInput.value;
      desc.style.fontSize = "16px";
      desc.style.lineHeight = "1.4";
      desc.style.maxWidth = "100%";

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
  wrapper.style.position = "absolute";
  wrapper.style.left = "-9999px";
  document.body.appendChild(wrapper);

  const pdf = new jsPDF("p", "mm", "a4");
  const a4Width = 210;
  const a4Height = 297;

  for (let i = 0; i < pages.length; i++) {
    const pageElement = pages[i];
    wrapper.appendChild(pageElement);
    await new Promise(resolve => setTimeout(resolve, 300));

    await html2canvas(pageElement, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      let width = a4Width;
      let height = width / ratio;

      if (height > a4Height) {
        height = a4Height;
        width = height * ratio;
      }

      const x = (a4Width - width) / 2;
      const y = 10; // margine alto fisso (scrive dall'alto)

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", x, y, width, height);
    });

    wrapper.removeChild(pageElement);
  }

  document.body.removeChild(wrapper);
  pdf.save(nota.replace(/\s+/g, "_") + ".pdf");
});
