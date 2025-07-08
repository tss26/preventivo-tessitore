
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

    const table = document.createElement("table");
    table.style.width = "794px";
    table.style.height = "1123px";
    table.style.borderCollapse = "collapse";
    table.style.fontFamily = "Arial, sans-serif";
    table.style.textAlign = "center";
    table.style.tableLayout = "fixed";

    // riga 1 - titolo
    const row1 = document.createElement("tr");
    row1.style.height = "15%";
    const cell1 = document.createElement("td");
    cell1.innerText = tipo;
    cell1.style.fontSize = "22px";
    row1.appendChild(cell1);
    table.appendChild(row1);

    // riga 2 - immagine
    const row2 = document.createElement("tr");
    row2.style.height = "65%";
    const cell2 = document.createElement("td");

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
            cell2.appendChild(img);
            resolve();
          };
        };
        reader.readAsDataURL(file);
      });
    } else {
      cell2.innerText = "Nessuna immagine";
    }
    row2.appendChild(cell2);
    table.appendChild(row2);

    // riga 3 - descrizione
    const row3 = document.createElement("tr");
    row3.style.height = "20%";
    const cell3 = document.createElement("td");
    cell3.innerText = descInput.value;
    cell3.style.fontSize = "16px";
    cell3.style.padding = "10px";
    cell3.style.wordBreak = "break-word";
    row3.appendChild(cell3);
    table.appendChild(row3);

    wrapper.appendChild(table);

    await new Promise(resolve => setTimeout(resolve, 300));

    await html2canvas(table, { scale: 2 }).then(canvas => {
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

    wrapper.removeChild(table);
  }

  document.body.removeChild(wrapper);
  pdf.save(nota.replace(/\s+/g, "_") + ".pdf");
});
