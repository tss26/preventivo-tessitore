
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

const valoriPersonalizzazioni = {
    D3: { K6:5, K7:5, K8:5, K9:5, K10:5, K11:10, M6:3.5, K14:4.5, K15:4.5, K16:4.5, K17:4.5, K18:4.5, K19:4, M19:6, M14:4.8, M15:1.7 },
    E3: { K6:5, K7:5, K8:5, K9:5, K10:5, K11:10, M6:3.2, K14:4, K15:4, K16:4, K17:4, K18:4, K19:3.5, M19:4.8, M14:4.3, M15:1.6 },
    F3: { K6:5, K7:5, K8:5, K9:5, K10:5, K11:10, M6:3, K14:3.25, K15:3.25, K16:3.25, K17:3.25, K18:3.25, K19:2.9, M19:4.2, M14:3.5, M15:1.5 },
    G3: { K6:4.5, K7:4.5, K8:4.5, K9:4.5, K10:4.5, K11:8.5, M6:2.8, K14:3, K15:3, K16:3, K17:3, K18:3, K19:2, M19:3.2, M14:3.25, M15:1.4 },
    D7: { K6:4.2, K7:4.2, K8:4.2, K9:4.2, K10:4.2, K11:8.3, M6:2.6, K14:2.5, K15:2.5, K16:2.5, K17:2.5, K18:2.5, K19:1.7, M19:2.9, M14:2.75, M15:1.3 },
    E7: { K6:3.8, K7:3.8, K8:3.8, K9:3.8, K10:3.8, K11:7.5, M6:2.4, K14:2.3, K15:2.3, K16:2.3, K17:2.3, K18:2.3, K19:1.6, M19:2.5, M14:2.5, M15:1.2 },
    F7: { K6:3.3, K7:3.3, K8:3.3, K9:3.3, K10:3.3, K11:8, M6:2.2, K14:2, K15:2, K16:2, K17:2, K18:2, K19:1.5, M19:2.5, M14:2.2, M15:1.1 },
    G7: { K6:3.3, K7:3.3, K8:3.3, K9:3.3, K10:3.3, K11:8, M6:2, K14:1.35, K15:1.35, K16:1.35, K17:1.35, K18:1.35, K19:1.4, M19:2.5, M14:1.45, M15:1 }
};

const moltiplicatori = [0.9, 0.75, 0.5, 0.4, 0.35, 0.32, 0.31, 0.3];
const chiavi = ["D3", "E3", "F3", "G3", "D7", "E7", "F7", "G7"];

let selezionate = [];

function creaBottoni() {
    const ricamiBox = document.getElementById("ricami");
    const stampeBox = document.getElementById("stampe");
    Object.entries(personalizzazioni).forEach(([key, label]) => {
        const btn = document.createElement("button");
        btn.textContent = label;
        btn.onclick = () => {
            btn.classList.toggle("active");
            if (selezionate.includes(key)) {
                selezionate = selezionate.filter(k => k !== key);
            } else {
                selezionate.push(key);
            }
            aggiornaTabella();
        };
        if (ricami.includes(key)) {
            ricamiBox.appendChild(btn);
        } else {
            stampeBox.appendChild(btn);
        }
    });
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
        const key = chiavi[i];
        const perc = moltiplicatori[i];
        const base = codice * (1 + perc);
        let extra = 0;
        const valori = valoriPersonalizzazioni[key] || {};
        selezionate.forEach(p => { extra += valori[p] || 0; });
        const prezzo = (base + extra).toFixed(2);
        const prezzoScontato = (prezzo * (1 - sconto / 100)).toFixed(2);
        baseRow.innerHTML += `<td>${prezzo}</td>`;
        scontoRow.innerHTML += `<td>${prezzoScontato}</td>`;
    }
}

document.getElementById("codice").addEventListener("input", aggiornaTabella);
document.getElementById("sconto").addEventListener("change", aggiornaTabella);

creaBottoni();
aggiornaTabella();
