
const fasce = [5, 12, 20, 25, 30, 50, 75, 100];
const personalizzazioni = {
    K6: "Ricamo lato cuore",
    K7: "Ricamo lato opposto",
    K8: "Ricamo manica sinistra",
    K9: "Ricamo manica destra",
    K10: "Ricamo sottocollo",
    K11: "Ricamo spalle",
    M6: "Nome ricamato",
    K14: "Stampa fronte A4",
    M14: "Stampa fronte A3",
    K15: "Stampa lato cuore",
    K16: "Stampa manica sinistra",
    K17: "Stampa manica destra",
    K18: "Stampa sottocollo",
    K19: "Stampa spalle A4",
    M15: "Stampa nome",
    M19: "Stampa spalle A3"
};

const ricami = ["K6", "K7", "K8", "K9", "K10", "K11", "M6"];
const stampe = ["K14", "M14", "K15", "K16", "K17", "K18", "K19", "M15", "M19"];

const selezionate = [];
const immagini = {};
const descrizioni = {};

function creaBottoni() {
    const ricamiBox = document.getElementById("ricami");
    const stampeBox = document.getElementById("stampe");
    Object.entries(personalizzazioni).forEach(([key, label]) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.onclick = () => {
            btn.classList.toggle("active");
            if (selezionate.includes(key)) {
                selezionate.splice(selezionate.indexOf(key), 1);
                delete immagini[key];
                delete descrizioni[key];
            } else {
                selezionate.push(key);
            }
            aggiornaDettagliPersonalizzazioni();
            aggiornaTabella();
        };
        (ricami.includes(key) ? ricamiBox : stampeBox).appendChild(btn);
    });
}

function aggiornaDettagliPersonalizzazioni() {
    const container = document.getElementById("dettagli-personalizzazioni");
    container.innerHTML = "";
    selezionate.forEach(key => {
        const div = document.createElement("div");
        div.classList.add("upload-entry");
        div.innerHTML = `
            <label><strong>${personalizzazioni[key]}</strong></label><br/>
            <input type="file" accept="image/*" onchange="caricaImmagine(event, '${key}')"/><br/>
            <textarea placeholder="Descrizione..." onchange="salvaDescrizione(event, '${key}')">${descrizioni[key] || ""}</textarea>
            <hr/>
        `;
        container.appendChild(div);
    });
}

function caricaImmagine(event, key) {
    const reader = new FileReader();
    reader.onload = function(e) {
        immagini[key] = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

function salvaDescrizione(event, key) {
    descrizioni[key] = event.target.value;
}

function aggiornaTabella() {
    const codice = parseFloat(document.getElementById("codice").value);
    const sconto = parseFloat(document.getElementById("sconto").value);
    const thead = document.querySelector("#tabella-prezzi thead");
    const baseRow = document.getElementById("prezzi-base");
    const scontoRow = document.getElementById("prezzi-sconto");

    thead.innerHTML = "<tr>" + fasce.map(q => `<th>${q}</th>`).join("") + "</tr>";
    baseRow.innerHTML = "";
    scontoRow.innerHTML = "";

    for (let i = 0; i < fasce.length; i++) {
        const prezzo = (codice * (1 + 0.9 - i * 0.1) + selezionate.length * 2).toFixed(2);
        const prezzoScontato = (prezzo * (1 - sconto / 100)).toFixed(2);
        baseRow.innerHTML += `<td>${prezzo}</td>`;
        scontoRow.innerHTML += `<td>${prezzoScontato}</td>`;
    }
}

document.getElementById("codice").addEventListener("input", aggiornaTabella);
document.getElementById("sconto").addEventListener("change", aggiornaTabella);

creaBottoni();
aggiornaTabella();
