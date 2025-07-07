
document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  const container = document.createElement("div");
  container.style.fontFamily = "Arial, sans-serif";
  container.style.width = "794px"; // larghezza A4 in px @96dpi

  const title = document.createElement("h2");
  title.innerText = nota;
  container.appendChild(title);

  const cards = Array.from(uploadBoxes).map(box => {
    return new Promise(resolve => {
      const tipo = box.querySelector("h4").innerText;
      const imgInput = box.querySelector("input[type='file']");
      const descInput = box.querySelector("input[type='text']");

      const card = document.createElement("div");
      card.style.border = "1px solid #000";
      card.style.marginBottom = "20px";
      card.style.padding = "10px";
      card.style.pageBreakInside = "avoid";

      const titolo = document.createElement("h3");
      titolo.innerText = tipo;
      card.appendChild(titolo);

      const imgWrapper = document.createElement("div");
      imgWrapper.style.textAlign = "center";
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
            card.appendChild(imgWrapper);
            card.appendChild(desc);
            container.appendChild(card);
            resolve();
          };
        };
        reader.readAsDataURL(file);
      } else {
        imgWrapper.innerText = "Nessuna immagine";
        card.appendChild(imgWrapper);
        card.appendChild(desc);
        container.appendChild(card);
        resolve();
      }
    });
  });

  await Promise.all(cards);

  const previewArea = document.createElement("div");
  previewArea.style.position = "absolute";
  previewArea.style.left = "-9999px";
  previewArea.appendChild(container);
  document.body.appendChild(previewArea);

  setTimeout(() => {
    html2pdf().from(container).set({
      margin: 10,
      filename: nota.replace(/\s+/g, "_") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "px", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] }
    }).save().then(() => {
      document.body.removeChild(previewArea);
    });
  }, 500);
});
