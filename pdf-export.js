
document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const uploadBoxes = document.querySelectorAll(".upload-box");

  const container = document.createElement("div");
  container.style.fontFamily = "Arial, sans-serif";
  container.style.width = "794px"; // A4 210mm in px at 96dpi

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
        <th style='border:1px solid #000;padding:5px;width:60%;'>Immagine</th>
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
      row.style.pageBreakInside = "avoid"; // evita taglio dentro la riga

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
          const img = new Image();
          img.src = reader.result;
          img.style.width = "255px";
          img.style.height = "auto";
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
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "px", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }).save().then(() => {
      document.body.removeChild(previewArea);
    });
  }, 500);
});
