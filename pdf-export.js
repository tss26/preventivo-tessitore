
async function salvaPDF() {
    const nota = document.getElementById("nota").value || "Preventivo";
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(nota, 10, 15);

    doc.setFontSize(14);
    doc.text("Dettagli personalizzazioni:", 10, 25);

    const tableData = [];

    if (typeof selezionate !== 'undefined') {
        for (const key of selezionate) {
            const tipo = personalizzazioni?.[key] || key;
            const descrizione = descrizioni?.[key] || "";
            const immagine = immagini?.[key];

            if (immagine) {
                try {
                    const imgProps = doc.getImageProperties(immagine);
                    const ratio = imgProps.width / imgProps.height;
                    const imgWidth = 40;
                    const imgHeight = imgWidth / ratio;
                    const imgY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 35;

                    doc.addImage(immagine, "JPEG", 10, imgY, imgWidth, imgHeight);
                    tableData.push([tipo, "[Vedi immagine a sinistra]", descrizione]);
                } catch (e) {
                    tableData.push([tipo, "(Errore immagine)", descrizione]);
                }
            } else {
                tableData.push([tipo, "(Nessuna immagine)", descrizione]);
            }
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

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
            "Il presente documento è una bozza non vincolante. Il preventivo ufficiale sarà fornito successivamente su carta intestata.",
            10,
            290
        );
    }

    doc.save(nota.replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".pdf");
}

function inviaEmail() {
    const nota = document.getElementById("nota").value || "Preventivo";
    const subject = encodeURIComponent("Preventivo abbigliamento - " + nota);
    const body = encodeURIComponent("In allegato il preventivo "" + nota + "". Ricorda di allegare il PDF generato dall’app.");
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function condividiWhatsApp() {
    const nota = document.getElementById("nota").value || "Preventivo";
    const messaggio = `Preventivo: ${nota}%0A%0ATi invio la bozza del preventivo. Il PDF è allegato a parte.%0AIl preventivo definitivo arriverà su carta intestata.`;
    const url = `https://wa.me/?text=${messaggio}`;
    window.open(url, "_blank");
}

// Espone le funzioni al browser
window.salvaPDF = salvaPDF;
window.inviaEmail = inviaEmail;
window.condividiWhatsApp = condividiWhatsApp;
