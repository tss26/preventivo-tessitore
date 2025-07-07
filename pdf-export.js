
function generaPDF() {
  const nota = document.getElementById("nota").value || "Preventivo";
  const doc = new jspdf.jsPDF();
  const tableData = [];

  const descrizioni = {
    "Ricamo lato cuore": "Ricamo lato cuore",
    "Ricamo lato opposto": "Ricamo lato opposto",
    "Ricamo manica SX": "Ricamo manica sinistra",
    "Ricamo manica DX": "Ricamo manica destra",
    "Ricamo sottocollo": "Ricamo sotto il colletto",
    "Ricamo spalle": "Ricamo sulle spalle",
    "Nome ricamato": "Nome personalizzato ricamato",
    "Stampa fronte A4": "Stampa fronte A4",
    "Stampa lato cuore": "Stampa lato cuore",
    "Stampa manica SX": "Stampa manica sinistra",
    "Stampa manica DX": "Stampa manica destra",
    "Stampa sottocollo": "Stampa sotto il colletto",
    "Stampa spalle A4": "Stampa spalle A4",
    "Stampa spalle A3": "Stampa spalle A3",
    "Stampa fronte A3": "Stampa fronte A3",
    "Stampa nome": "Nome stampato"
  };

  const attive = window.attive || [];

  attive.forEach(p => {
    tableData.push([p, "[immagine allegata]", descrizioni[p] || ""]);
  });

  doc.setFontSize(16);
  doc.text(nota, 10, 20);

  doc.autoTable({
    startY: 30,
    head: [["Tipo", "Immagine", "Descrizione"]],
    body: tableData
  });

  doc.setFontSize(10);
  doc.text(
    "Il presente documento è una bozza non vincolante. Il preventivo ufficiale sarà fornito su carta intestata.",
    10,
    290
  );

  // Mostra anteprima in nuova finestra
  window.open(doc.output('bloburl'), '_blank');
}
