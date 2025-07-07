
document.getElementById("generaPdf").addEventListener("click", () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const container = document.createElement("div");

  const title = document.createElement("h1");
  title.innerText = nota;
  container.appendChild(title);

  const table = document.createElement("table");
  table.border = "1";
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.innerHTML = `
    <thead>
      <tr>
        <th>Tipo personalizzazione</th>
        <th>Immagine</th>
        <th>Descrizione</th>
      </tr>
    </thead>
    <tbody id="pdfTableBody"></tbody>
  `;

  const body = table.querySelector("tbody");

  document.querySelectorAll(".upload-box").forEach(box => {
    const key = box.id.replace("upload-", "");
    const label = box.querySelector("h4").innerText;
    const imgInput = box.querySelector(`input[data-upload="${key}"]`);
    const descInput = box.querySelector(`input[data-desc="${key}"]`);

    const row = document.createElement("tr");

    const tdTipo = document.createElement("td");
    tdTipo.innerText = label;

    const tdImg = document.createElement("td");
    const imgFile = imgInput.files[0];
    if (imgFile) {
      const img = document.createElement("img");
      img.style.maxWidth = "100px";
      img.style.maxHeight = "100px";
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result;
        tdImg.appendChild(img);
        row.appendChild(tdTipo);
        row.appendChild(tdImg);
        row.appendChild(tdDesc);
        body.appendChild(row);

        if (body.children.length === document.querySelectorAll(".upload-box").length) {
          generaPdfFinale(container.innerHTML, nota);
        }
      };
      reader.readAsDataURL(imgFile);
    } else {
      tdImg.innerText = "Nessuna immagine";
      const tdDesc = document.createElement("td");
      tdDesc.innerText = descInput.value;
      row.appendChild(tdTipo);
      row.appendChild(tdImg);
      row.appendChild(tdDesc);
      body.appendChild(row);
    }
  });

  if (document.querySelectorAll(".upload-box input[type='file']:not(:valid)").length === document.querySelectorAll(".upload-box").length) {
    generaPdfFinale(container.innerHTML, nota);
  }
});

function generaPdfFinale(content, title) {
  const opt = {
    margin:       0.5,
    filename:     `${title.replace(/\s+/g, "_")}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().from(content).set(opt).save();
}
