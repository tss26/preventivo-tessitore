
document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  const wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  wrapper.style.width = "794px";
  wrapper.style.background = "#fff";
  wrapper.style.padding = "0";
  document.body.appendChild(wrapper);

  const pdf = new jsPDF("p", "mm", "a4");
  const a4Width = 210;
  const a4Height = 297;

  for (let i = 0; i < uploadBoxes.length; i++) {
    const box = uploadBoxes[i];
    const tipo = box.querySelector("h4").innerText;
    const imgInput = box.querySelector("input[type='file']");
    const descInput = box.querySelector("input[type='text']");

    const pageElement = document.createElement("div");
    pageElement.style.width = "794px";
    pageElement.style.minHeight = "1123px";
    pageElement.style.display = "flex";
    pageElement.style.flexDirection = "column";
    pageElement.style.alignItems = "center";
    pageElement.style.justifyContent = "flex-start";
    pageElement.style.fontFamily = "Arial, sans-serif";
    pageElement.style.padding = "40px 20px";
    pageElement.style.boxSizing = "border-box";
    pageElement.style.textAlign = "center";

    const titolo = document.createElement("h2");
    titolo.innerText = tipo;
    titolo.style.marginBottom = "20px";

    const imgWrapper = document.createElement("div");
    imgWrapper.style.marginBottom = "20px";
    const desc = document.createElement("p");
    desc.innerText = descInput.value;
    desc.style.fontSize = "16px";
    desc.style.lineHeight = "1.4";
    desc.style.maxWidth = "100%";

    pageElement.appendChild(titolo);

    const file = imgInput.files[0];
    if (file) {
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          img.style.maxWidth = "312px";
          img.style.maxHeight = "600px";
          img.onload = () => {
            imgWrapper.appendChild(img);
            resolve();
          };
        };
        reader.readAsDataURL(file);
      });
    } else {
      imgWrapper.innerText = "Nessuna immagine";
    }

    pageElement.appendChild(imgWrapper);
    pageElement.appendChild(desc);
    wrapper.appendChild(pageElement);

    await new Promise(resolve => setTimeout(resolve, 200));

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
      const y = 10;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", x, y, width, height);
    });

    wrapper.removeChild(pageElement);
  }

  document.body.removeChild(wrapper);
  pdf.save(nota.replace(/\s+/g, "_") + ".pdf");
});
