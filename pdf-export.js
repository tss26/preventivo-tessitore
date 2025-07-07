
function esportaPDF() {
    const nota = document.getElementById("nota").value || "Preventivo";
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(nota, 10, 10);

    doc.setFontSize(12);
    doc.text("Personalizzazioni selezionate:", 10, 20);

    let y = 30;
    selezionate.forEach(key => {
        doc.text("- " + (personalizzazioni[key] || key), 10, y);
        y += 10;
    });

    doc.text("Tabella prezzi unitari (con e senza sconto):", 10, y + 10);
    y += 20;

    const headers = fasce.map(q => q.toString());
    const base = Array.from(document.getElementById("prezzi-base").children).map(td => td.textContent);
    const scontato = Array.from(document.getElementById("prezzi-sconto").children).map(td => td.textContent);

    doc.autoTable({
        startY: y,
        head: [["Quantità", ...headers]],
        body: [
            ["Prezzo Base", ...base],
            ["Prezzo Scontato", ...scontato]
        ]
    });

    doc.save(nota.replace(/[^a-z0-9]/gi, '_').toLowerCase() + ".pdf");
}
