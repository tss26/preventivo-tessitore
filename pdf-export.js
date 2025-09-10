
document.getElementById("generaPdf").addEventListener("click", async () => {
  window.scrollTo(0, 0); // Fix iPhone white space issue

  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  if (uploadBoxes.length === 0) {
    alert("Nessuna personalizzazione selezionata con immagini o descrizioni. Aggiungi delle sezioni prima di generare il PDF.");
    return;
  }

  async function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.9);
          resolve(resizedDataUrl);
        };
        img.onerror = (error) => reject(new Error("Errore nel caricamento dell'immagine."));
      };
      reader.onerror = (error) => reject(new Error("Errore nella lettura del file."));
      reader.readAsDataURL(file);
    });
  }

  const pagesToRender = [];

  for (const box of Array.from(uploadBoxes)) {
    const pageDiv = document.createElement("div");
    pageDiv.style.width = "794px";
    pageDiv.style.minHeight = "1123px";
    pageDiv.style.paddingBottom = "10px";
    pageDiv.style.paddingLeft = "10px";
    pageDiv.style.boxSizing = "border-box";
    pageDiv.style.fontFamily = "Arial, sans-serif";
    pageDiv.style.display = "flex";
    pageDiv.style.flexDirection = "column";
    pageDiv.style.alignItems = "left";
    pageDiv.style.justifyContent = "flex-start";
    pageDiv.style.overflow = "hidden";

    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width = "392.5px";
    table.style.marginTop = "50px";

    const tbody = document.createElement("tbody");
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.style.border = "4px solid #ADD8E6";
    td.style.padding = "15px";
    td.style.textAlign = "left";
    td.style.fontSize = "18px";

    const tipo = box.querySelector("h4").innerText;
    const imgInput = box.querySelector("input[type='file']");
    const descInput = box.querySelector("input[type='text']");

    const itemContainer = document.createElement("div");
    itemContainer.style.width = "100%";
    itemContainer.style.backgroundColor = "transparent";

    const tipoLabel = document.createElement("h3");
    tipoLabel.innerText = tipo;
    tipoLabel.style.textAlign = "left";
    tipoLabel.style.marginBottom = "10px";
    tipoLabel.style.color = "#007bff";
    tipoLabel.style.fontSize = "20px";
    itemContainer.appendChild(tipoLabel);

    const imgAndDescWrapper = document.createElement("div");
    imgAndDescWrapper.style.display = "flex";
    imgAndDescWrapper.style.flexDirection = "column";
    imgAndDescWrapper.style.alignItems = "left";
    imgAndDescWrapper.style.width = "100%";
    imgAndDescWrapper.style.gap = "10px";

    const imgWrapper = document.createElement("div");
    imgWrapper.style.flexShrink = "0";
    imgWrapper.style.width = "100%";
    imgWrapper.style.height = "auto";
    imgWrapper.style.border = "1px dashed #999";
    imgWrapper.style.display = "flex";
    imgWrapper.style.alignItems = "left";
    imgWrapper.style.justifyContent = "left";
    imgWrapper.style.overflow = "hidden";
    imgWrapper.style.marginBottom = "5px";
    imgAndDescWrapper.appendChild(imgWrapper);

    const desc = document.createElement("p");
    desc.innerText = "DESCRIZIONE: " + (descInput ? descInput.value : "Nessuna descrizione.");
    desc.style.fontSize = "14px";
    desc.style.textAlign = "left";
    desc.style.lineHeight = "1.4";
    desc.style.wordBreak = "break-word";
    desc.style.width = "100%";
    desc.style.maxWidth = "100%";
    imgAndDescWrapper.appendChild(desc);

    itemContainer.appendChild(imgAndDescWrapper);
    td.appendChild(itemContainer);
    tr.appendChild(td);
    tbody.appendChild(tr);
    table.appendChild(tbody);
    pageDiv.appendChild(table);

    const file = imgInput ? imgInput.files[0] : null;
    if (file) {
      try {
        const resizedImageDataUrl = await resizeImage(file, 1920, 1080);
        const img = new Image();
        img.src = resizedImageDataUrl;
        img.style.display = "block";
        img.style.width = "360px";
        img.style.height = "auto";
        img.style.objectFit = "contain";
        imgWrapper.appendChild(img);
      } catch (e) {
        imgWrapper.innerHTML = `<p style="color: red; font-size: 8px; text-align: center;">Errore caricamento immagine</p>`;
      }
    } else {
      const noImgText = document.createElement("p");
      noImgText.innerText = "Nessuna immagine allegata";
      noImgText.style.color = "#888";
      noImgText.style.fontSize = "12px";
      noImgText.style.textAlign = "left";
      imgWrapper.appendChild(noImgText);
    }

    pagesToRender.push(pageDiv);
  }

  const finalWrapper = document.createElement("div");
  pagesToRender.forEach((p, index) => {
    finalWrapper.appendChild(p);
    if (index < pagesToRender.length - 1) {
      const pageBreak = document.createElement("div");
      pageBreak.style.pageBreakAfter = "always";
      finalWrapper.appendChild(pageBreak);
    }
  });

  const previewArea = document.createElement("div");
  previewArea.style.position = "absolute";
  previewArea.style.left = "-9999px";
  previewArea.appendChild(finalWrapper);
  document.body.appendChild(previewArea);

  setTimeout(() => {
    html2pdf().from(finalWrapper).set({
      margin: 0,
      filename: nota.replace(/\s+/g, "_") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 1.5, logging: true, useCORS: true },
      jsPDF: { unit: "px", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }).save().then(() => {
      if (previewArea.parentNode) {
        previewArea.parentNode.removeChild(previewArea);
      }
    }).catch(error => {
      if (previewArea.parentNode) {
        previewArea.parentNode.removeChild(previewArea);
      }
      alert("Errore durante la generazione del PDF.");
    });
  }, 100);
});
