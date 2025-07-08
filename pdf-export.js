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
    page.style.width = "794px"; // Larghezza A4 a 96 DPI
    page.style.height = "1123px"; // Altezza A4 a 96 DPI
    page.style.padding = "40px"; // Padding uniforme su tutti i lati
    page.style.boxSizing = "border-box"; // Include padding nella larghezza/altezza
    page.style.fontFamily = "Arial, sans-serif";
    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.justifyContent = "flex-start"; // Allinea gli elementi dall'alto
    page.style.alignItems = "flex-start"; // Allinea gli elementi a sinistra
    page.style.overflow = "hidden"; // Nasconde contenuto che esce dai bordi

    const tipoLabel = document.createElement("h2");
    tipoLabel.innerText = tipo;
    tipoLabel.style.textAlign = "left"; // Allinea il testo a sinistra
    tipoLabel.style.marginBottom = "20px";
    tipoLabel.style.color = "#007bff";
    tipoLabel.style.width = "100%"; // Occupa tutta la larghezza disponibile

    const desc = document.createElement("p");
    desc.innerText = descInput.value;
    desc.style.fontSize = "16px";
    desc.style.textAlign = "left"; // Allinea il testo a sinistra
    desc.style.lineHeight = "1.5";
    desc.style.wordBreak = "break-word"; // Forza la rottura delle parole lunghe
    desc.style.marginBottom = "20px";
    desc.style.flex = "0 1 auto"; // Permette alla descrizione di restringersi se necessario
    desc.style.maxWidth = "100%"; // Limita la larghezza al 100% del contenitore
    desc.style.overflowWrap = "break-word"; // Per una migliore gestione delle parole

    const imgWrapper = document.createElement("div");
    imgWrapper.style.display = "flex";
    imgWrapper.style.alignItems = "center";
    imgWrapper.style.justifyContent = "flex-start"; // Allinea l'immagine a sinistra
    imgWrapper.style.flex = "1 1 auto"; // Permette all'immagine di crescere e restringersi per occupare lo spazio disponibile
    imgWrapper.style.marginBottom = "20px";
    imgWrapper.style.width = "100%"; // Occupa tutta la larghezza disponibile
    imgWrapper.style.overflow = "hidden"; // Importante per nascondere parti dell'immagine che superano il wrapper

    page.appendChild(tipoLabel);
    page.appendChild(imgWrapper);
    page.appendChild(desc);

    const file = imgInput.files[0];
    if (file) {
      await new Promise(resolve => {
        const reader = new FileReader();
        reader
