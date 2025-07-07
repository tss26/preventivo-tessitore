
function salvaPDF() {
  const nota = document.getElementById("nota").value || "Preventivo";
  const doc = new jspdf.jsPDF();
  const tableData = [];

  const selezionate = window.selezionate || [];
  const descrizioni = window.descrizioni || {};
  const immagini = window.immagini || {};

  selezionate.forEach(key => {
    tableData.push([
      key,
      immagini[key] ? { image: immagini[key], width: 30, height: 30 } : "",
      descrizioni[key] || ""
    ]);
  });

  doc.setFontSize(16);
  doc.text(nota, 10, 20);

  doc.autoTable({
    startY: 30,
    head: [["Tipo Personalizzazione", "Immagine", "Descrizione"]],
    body: tableData,
    styles: { valign: "middle" },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 60 },
      2: { cellWidth: 80 }
    }
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      "Il presente documento è una bozza non vincolante. Il preventivo ufficiale sarà fornito su carta intestata.",
      10,
      290
    );
  }

  doc.save(nota.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".pdf");
}

function inviaEmail() {
  const nota = document.getElementById("nota").value || "Preventivo";
  const subject = encodeURIComponent("Preventivo abbigliamento - " + nota);
  const body = encodeURIComponent(
    "In allegato il preventivo "" + nota + "". Ricorda di allegare il file PDF generato."
  );
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function condividiWhatsApp() {
  const nota = document.getElementById("nota").value || "Preventivo";
  const messaggio = `Preventivo: ${nota}\nTi invio la bozza del preventivo. Il PDF è allegato.`;
  const url = `https://wa.me/?text=${encodeURIComponent(messaggio)}`;
  window.open(url, "_blank");
}

window.salvaPDF = salvaPDF;
window.inviaEmail = inviaEmail;
window.condividiWhatsApp = condividiWhatsApp;
