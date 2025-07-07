
document.getElementById("generaPdf").addEventListener("click", () => {
  const nota = document.getElementById("nota").value || "Preventivo";
  const contenutoTest = `
    <h1>${nota}</h1>
    <table border="1" style="width:100%; border-collapse:collapse;">
      <tr>
        <th>Tipo</th>
        <th>Immagine</th>
        <th>Descrizione</th>
      </tr>
      <tr>
        <td>Ricamo lato cuore</td>
        <td>Nessuna immagine</td>
        <td>Esempio descrizione</td>
      </tr>
    </table>
  `;
  html2pdf().from(contenutoTest).save(`${nota.replace(/\s+/g, "_")}.pdf`);
});
