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
    page.style.padding = "40px 10px"; // Modificato: padding a 40px sopra/sotto, 10px a destra/sinistra
    page.style.boxSizing = "border-box";
    page.style.fontFamily = "Arial, sans-serif";
    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.justifyContent = "flex-start";
    page.style.alignItems = "flex-start"; // Modificato: Allinea gli elementi all'inizio (sinistra)
    page.style.overflow = "hidden";

    const tipoLabel = document.createElement("h2");
    tipoLabel.innerText = tipo;
    tipoLabel.style.textAlign = "left"; // Modificato: Allinea il testo a sinistra
    tipoLabel.style.marginBottom = "20px";
    tipoLabel.style.color = "#007bff";

    const imgWrapper = document.createElement("div");
    imgWrapper.style.display = "flex";
    imgWrapper.style.alignItems = "center";
    imgWrapper.style.justifyContent = "flex-start"; // Modificato: Allinea l'immagine a sinistra
    imgWrapper.style.maxHeight = "500px";
    imgWrapper.style.flex = "0 0 auto";
    imgWrapper.style.marginBottom = "20px";
    imgWrapper.style.width = "100%";

    const desc = document.createElement("p");
    desc.innerText = descInput.value;
    desc.style.fontSize = "16px";
    desc.style.textAlign = "left"; // Modificato: Allinea il testo a sinistra
    desc.style.lineHeight = "1.5";
    desc.style.wordBreak = "break-word";
    desc.style.flex = "0 0 auto";
    desc.style.maxWidth = "700px";

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
