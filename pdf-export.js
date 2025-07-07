
document.getElementById("generaPdf").addEventListener("click", () => {
  const nota = document.getElementById("nota").value || "Titolo PDF";
  const contenuto = `
    <h1 style='font-family: Arial;'>${nota}</h1>
    <p>Questo è un test base per verificare se html2pdf funziona correttamente.</p>
  `;
  html2pdf().from(contenuto).set({
    margin: 0.5,
    filename: nota.replace(/\s+/g, "_") + ".pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
  }).save();
});
