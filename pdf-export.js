
async function salvaPDF() {
    const nota = document.getElementById("nota").value || "Preventivo";
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(nota, 10, 15);

    doc.setFontSize(14);
    doc.text("Dettagli personalizzazioni:", 10, 25);

    const tableData = [];

    for (const key of selezionate) {
        const tipo = personalizzazioni[key] || key;
        const descrizione = descrizioni[key] || "";
        const immagine = immagini[key];

        if (immagine) {
            const imgProps = doc.getImageProperties(immagine);
            const ratio = imgProps.width / imgProps.height;
            const imgWidth = 40;
            const imgHeight = imgWidth / ratio;
            const imgY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 35;

            doc.addImage(immagine, "JPEG", 10, imgY, imgWidth, imgHeight);
            tableData.push([
                tipo,
                "[Vedi immagine a sinistra]",
                descrizione
            ]);
        } else {
            tableData.push([
                tipo,
                "(Nessuna immagine)",
                descrizione
            ]);
        }
    }

    doc.autoTable({
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 60 : 60,
        head: [["Tipo Personalizzazione", "Immagine", "Descrizione"]],
        body: tableData,
        styles: { valign: "middle" },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 60 },
            2: { cellWidth: 80 }
        }
    });

    doc.save(nota.replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".pdf");
}

function inviaEmail() {
    const nota = document.getElementById("nota").value || "Preventivo";
    const email = "";
    const subject = encodeURIComponent("Preventivo abbigliamento - " + nota);
    const body = encodeURIComponent("In allegato il preventivo "" + nota + "". Ricorda di allegare il PDF generato dall’app.");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}
