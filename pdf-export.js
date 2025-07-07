
document.getElementById("generaPdf").addEventListener("click", async () => {
  const nota = document.getElementById("nota").value || "Preventivo";

  const pdf = new jsPDF("p", "mm", "a4");
  const a4Width = 210;
  const a4Height = 297;

  const container = document.createElement("div");
  container.style.width = "794px";
  container.style.minHeight = "1123px";
  container.style.padding = "40px";
  container.style.boxSizing = "border-box";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.justifyContent = "flex-start";
  container.style.alignItems = "center";
  container.style.textAlign = "center";

  const title = document.createElement("h2");
  title.innerText = "TITOLO DI TEST";
  title.style.marginBottom = "20px";

  const img = new Image();
  img.src = "https://via.placeholder.com/300x400";
  img.style.width = "300px";
  img.style.height = "400px";
  img.style.marginBottom = "20px";

  const desc = document.createElement("p");
  desc.innerText = "Questa è una descrizione di esempio per testare il rendering PDF in alto.";
  desc.style.fontSize = "16px";
  desc.style.maxWidth = "90%";

  container.appendChild(title);
  container.appendChild(img);
  container.appendChild(desc);

  const wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.left = "-9999px";
  document.body.appendChild(wrapper);
  wrapper.appendChild(container);

  setTimeout(async () => {
    await html2canvas(container, { scale: 2 }).then(canvas => {
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
      const y = 10;

      pdf.addImage(imgData, "JPEG", x, y, width, height);
    });

    document.body.removeChild(wrapper);
    pdf.save(nota.replace(/\s+/g, "_") + ".pdf");
  }, 500);
});
