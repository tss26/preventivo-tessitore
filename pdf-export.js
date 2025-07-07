
document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  const container = document.createElement("div");
  container.style.fontFamily = "Arial, sans-serif";

  const title = document.createElement("h2");
  title.innerText = nota;
  container.appendChild(title);

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.marginTop = "20px";
  table.innerHTML = `
    <thead>
      <tr>
        <th style='border:1px solid #000;padding:5px;'>Tipo</th>
        <th style='border:1px solid #000;padding:5px;'>Immagine</th>
        <th style='border:1px solid #000;padding:5px;'>Descrizione</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  const promises = Array.from(uploadBoxes).map(box => {
    return new Promise(resolve => {
      const tipo = box.querySelector("h4").innerText;
      const imgInput = box.querySelector("input[type='file']");
      const descInput = box.querySelector("input[type='text']");
      const row = document.createElement("tr");

      const tdTipo = document.createElement("td");
      tdTipo.style.border = "1px solid #000";
      tdTipo.style.padding = "5px";
      tdTipo.innerText = tipo;

      const tdImg = document.createElement("td");
      tdImg.style.border = "1px solid #000";
      tdImg.style.padding = "5px";

      const tdDesc = document.createElement("td");
      tdDesc.style.border = "1px solid #000";
      tdDesc.style.padding = "5px";
      tdDesc.innerText = descInput.value;

      const file = imgInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = document.createElement("img");
          img.src = reader.result;
          img.style.maxWidth = "100px";
          img.style.maxHeight = "100px";
          img.onload = () => {
            tdImg.appendChild(img);
            row.appendChild(tdTipo);
            row.appendChild(tdImg);
            row.appendChild(tdDesc);
            tbody.appendChild(row);
            resolve();
          };
        };
        reader.readAsDataURL(file);
      } else {
        tdImg.innerText = "Nessuna immagine";
        row.appendChild(tdTipo);
        row.appendChild(tdImg);
        row.appendChild(tdDesc);
        tbody.appendChild(row);
        resolve();
      }
    });
  });

  await Promise.all(promises);
  container.appendChild(table);

  // Inserisci nel DOM temporaneamente per garantire rendering su Safari
  const previewArea = document.createElement("div");
  previewArea.style.position = "absolute";
  previewArea.style.left = "-9999px";
  previewArea.appendChild(container);
  document.body.appendChild(previewArea);

  setTimeout(() => {
    html2canvas(container, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      const pdfWidth = pageWidth - 20;
      const pdfHeight = pdfWidth / ratio;

      pdf.addImage(imgData, "JPEG", 10, 10, pdfWidth, pdfHeight);
      pdf.save(nota.replace(/\s+/g, "_") + ".pdf");
      document.body.removeChild(previewArea);
    });
  }, 500);
});
