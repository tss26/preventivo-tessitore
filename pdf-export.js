
document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  const a4Width = 210;
  const a4Height = 297;

  const pdf = new jsPDF("p", "mm", "a4");

  const wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  document.body.appendChild(wrapper);

  for (let i = 0; i < uploadBoxes.length; i++) {
    const box = uploadBoxes[i];
    const tipo = box.querySelector("h4").innerText;
    const imgInput = box.querySelector("input[type='file']");
    const descInput = box.querySelector("input[type='text']");

    const page = document.createElement("div");
    page.style.width = "794px";
    page.style.height = "1123px";
    page.style.padding = "40px 30px";
    page.style.boxSizing = "border-box";
    page.style.fontFamily = "Arial, sans-serif";
    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.justifyContent = "center";
    page.style.alignItems = "center";
    page.style.textAlign = "center";
    page.style.background = "#fff";

    const titolo = document.createElement("h2");
    titolo.innerText = tipo;
    titolo.style.marginBottom = "20px";

    const imgWrapper = document.createElement("div");
    imgWrapper.style.marginBottom = "20px";

    const desc = document.createElement("p");
    desc.innerText = descInput.value;
    desc.style.fontSize = "16px";
    desc.style.lineHeight = "1.5";
    desc.style.maxWidth = "90%";
    desc.style.marginTop = "10px";

    page.appendChild(titolo);

    if (imgInput.files.length > 0) {
      const file = imgInput.files[0];
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          img.style.maxWidth = "100%";
          img.style.width = "390px"; // ≈ 13.7 cm
          img.style.objectFit = "contain";
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

    page.appendChild(imgWrapper);
    page.appendChild(desc);
    wrapper.appendChild(page);

    await new Promise(resolve => setTimeout(resolve, 300));

    await html2canvas(page, { scale: 2 }).then(canvas => {
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
      const y = 0;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", x, y, width, height);
    });

    wrapper.removeChild(page);
  }

  document.body.removeChild(wrapper);
  pdf.save(nota.replace(/\s+/g, "_") + ".pdf");
});
