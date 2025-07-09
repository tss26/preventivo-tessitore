
document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Titolo PDF";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  const a4Width = 210;
  const a4Height = 297;
  const maxImgWidthPx = 560;
  const maxImgHeightPx = 597;

  const pdf = new jsPDF("p", "mm", "a4");
  const pxToMm = (px) => px * 0.264583;

  for (const box of uploadBoxes) {
    const tipo = box.querySelector("h4").innerText;
    const imgInput = box.querySelector("input[type='file']");
    const descInput = box.querySelector("input[type='text']");

    const page = document.createElement("div");
    page.style.width = "794px";
    page.style.height = "1123px";
    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.alignItems = "center";
    page.style.justifyContent = "flex-start";
    page.style.padding = "40px";
    page.style.fontFamily = "Arial, sans-serif";
    page.style.boxSizing = "border-box";
    page.style.backgroundColor = "#fff";

    const title = document.createElement("h2");
    title.innerText = nota.toUpperCase();
    title.style.marginBottom = "20px";
    title.style.color = "#000";
    title.style.textAlign = "center";
    page.appendChild(title);

    const desc = document.createElement("p");
    desc.innerText = "DESCRIZIONE: " + descInput.value;
    desc.style.marginBottom = "20px";
    desc.style.fontSize = "16px";
    desc.style.textAlign = "left";
    desc.style.maxWidth = "100%";
    desc.style.wordBreak = "break-word";
    page.appendChild(desc);

    const imgWrapper = document.createElement("div");
    imgWrapper.style.width = maxImgWidthPx + "px";
    imgWrapper.style.height = maxImgHeightPx + "px";
    imgWrapper.style.border = "1px dashed #999";
    imgWrapper.style.display = "flex";
    imgWrapper.style.alignItems = "center";
    imgWrapper.style.justifyContent = "center";
    imgWrapper.style.overflow = "hidden";

    if (imgInput.files.length > 0) {
      const file = imgInput.files[0];
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          img.style.maxWidth = "100%";
          img.style.maxHeight = "100%";
          img.style.objectFit = "contain";
          img.onload = () => {
            imgWrapper.appendChild(img);
            resolve();
          };
        };
        reader.readAsDataURL(file);
      });
    } else {
      const fallback = document.createElement("span");
      fallback.innerText = "Nessuna immagine allegata";
      fallback.style.color = "#888";
      imgWrapper.appendChild(fallback);
    }

    page.appendChild(imgWrapper);

    const hiddenWrapper = document.createElement("div");
    hiddenWrapper.style.position = "absolute";
    hiddenWrapper.style.left = "-9999px";
    hiddenWrapper.appendChild(page);
    document.body.appendChild(hiddenWrapper);

    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(page, { scale: 2 });
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
    const y = (a4Height - height) / 2;

    if (pdf.internal.getNumberOfPages() > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", x, y, width, height);

    document.body.removeChild(hiddenWrapper);
  }

  pdf.save(nota.replace(/\s+/g, "_") + ".pdf");
});
