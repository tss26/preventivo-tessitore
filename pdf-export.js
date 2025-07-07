document.getElementById("generaPdf").addEventListener("click", async () => {
    const nota = document.getElementById("nota").value.trim() || "Documento"; // Trim per pulire spazi extra
    const uploadBoxes = document.querySelectorAll(".upload-box");

    // Disabilita il pulsante per prevenire clic multipli e dare feedback
    const generaPdfBtn = document.getElementById("generaPdf");
    generaPdfBtn.disabled = true;
    generaPdfBtn.innerText = "Generazione PDF in corso...";

    try {
        // Prepara le pagine in parallelo
        const pages = await Promise.all(Array.from(uploadBoxes).map((box, index, arr) => {
            return new Promise((resolve, reject) => {
                const tipo = box.querySelector("h4").innerText.trim(); // Trim del testo del titolo
                const imgInput = box.querySelector("input[type='file']");
                const descInput = box.querySelector("input[type='text']");

                const page = document.createElement("div");
                // Dimensioni A4 in pixel (794x1123 a 96 DPI, che è lo standard di html2canvas)
                page.style.width = "794px";
                page.style.height = "1123px";
                page.style.padding = "40px";
                page.style.boxSizing = "border-box";
                page.style.fontFamily = "Arial, sans-serif";
                page.style.display = "flex";
                page.style.flexDirection = "column";
                page.style.justifyContent = "flex-start";
                page.style.alignItems = "center";
                page.style.overflow = "hidden"; // Importante per layout stabili
                if (index !== arr.length - 1) {
                    page.style.pageBreakAfter = "always"; // Forza il salto di pagina tra i div
                }

                // Titolo della pagina
                const tipoLabel = document.createElement("h2");
                tipoLabel.innerText = tipo;
                tipoLabel.style.textAlign = "center";
                tipoLabel.style.marginBottom = "20px";
                tipoLabel.style.color = "#333";

                // Wrapper per l'immagine per gestire dimensioni e posizionamento
                const imgWrapper = document.createElement("div");
                imgWrapper.style.display = "flex";
                imgWrapper.style.alignItems = "center";
                imgWrapper.style.justifyContent = "center";
                imgWrapper.style.maxHeight = "500px"; // Altezza massima per l'area immagine
                imgWrapper.style.flex = "0 0 auto"; // Non si espande o contrae
                imgWrapper.style.marginBottom = "20px";
                imgWrapper.style.width = "100%"; // Occupa la larghezza disponibile
                imgWrapper.style.backgroundColor = "#eee"; // Sfondo per visualizzare l'area anche senza immagine
                imgWrapper.style.borderRadius = "5px"; // Bordi arrotondati
                imgWrapper.style.overflow = "hidden"; // Nasconde parti di immagini che potrebbero sforare

                // Descrizione
                const desc = document.createElement("p");
                desc.innerText = descInput.value.trim();
                desc.style.fontSize = "16px";
                desc.style.textAlign = "center";
                desc.style.lineHeight = "1.5";
                desc.style.wordBreak = "break-word";
                desc.style.flex = "0 0 auto";
                desc.style.maxWidth = "700px"; // Limita la larghezza del testo
                desc.style.color = "#666";

                const file = imgInput.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const img = new Image();
                        img.src = reader.result;
                        img.style.maxWidth = "100%";
                        img.style.maxHeight = "500px";
                        img.style.objectFit = "contain"; // Mantiene le proporzioni all'interno del wrapper
                        img.style.display = "block"; // Evita spazi bianchi sotto l'immagine
                        
                        img.onload = () => {
                            imgWrapper.innerHTML = ''; // Pulisce il messaggio "Nessuna immagine" se c'era
                            imgWrapper.appendChild(img);
                            page.appendChild(tipoLabel);
                            page.appendChild(imgWrapper);
                            page.appendChild(desc);
                            resolve(page);
                        };
                        // Gestione degli errori di caricamento dell'immagine (es. file corrotto)
                        img.onerror = (e) => {
                            console.error("Errore nel caricamento dell'immagine:", e);
                            imgWrapper.innerHTML = `<p style="color: red;">Errore caricamento immagine.</p>`;
                            page.appendChild(tipoLabel);
                            page.appendChild(imgWrapper);
                            page.appendChild(desc);
                            resolve(page); // Risolvi comunque per non bloccare il processo
                        };
                    };
                    // Gestione degli errori nella lettura del file (es. permessi negati)
                    reader.onerror = (e) => {
                        console.error("Errore FileReader:", e);
                        imgWrapper.innerHTML = `<p style="color: red;">Errore nella lettura del file.</p>`;
                        page.appendChild(tipoLabel);
                        page.appendChild(imgWrapper);
                        page.appendChild(desc);
                        resolve(page); // Risolvi comunque
                    };
                    reader.readAsDataURL(file); // Legge il file come Base64
                } else {
                    // Se nessuna immagine è stata selezionata
                    imgWrapper.innerHTML = `<p style="color: #888;">Nessuna immagine selezionata</p>`;
                    imgWrapper.style.minHeight = "150px"; // Altezza minima per il messaggio
                    page.appendChild(tipoLabel);
                    page.appendChild(imgWrapper);
                    page.appendChild(desc);
                    resolve(page);
                }
            });
        }));

        // Wrapper temporaneo per html2canvas, nascosto fuori schermo
        const wrapper = document.createElement("div");
        wrapper.style.width = "794px"; // Larghezza A4
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";

        pages.forEach(p => wrapper.appendChild(p)); // Aggiunge tutte le pagine al wrapper

        const previewArea = document.createElement("div");
        previewArea.style.position = "absolute";
        previewArea.style.left = "-9999px"; // Sposta l'area fuori dallo schermo
        previewArea.appendChild(wrapper);
        document.body.appendChild(previewArea); // Aggiungi al DOM per il rendering

        // **Punto critico**: Aumentato il timeout per dare più tempo al browser
        // di renderizzare tutti gli elementi e le immagini.
        setTimeout(async () => {
            try {
                // Opzioni di html2pdf
                const pdfOptions = {
                    margin: 0,
                    filename: nota.replace(/\s+/g, "_") + ".pdf",
                    // Configurazione immagine:
                    // type: "jpeg" con qualità alta è una buona scelta per foto.
                    // type: "png" è migliore per grafici, icone o immagini con trasparenze.
                    image: { type: "jpeg", quality: 0.98 }, 
                    // image: { type: "png" }, // Decommenta questa riga e commenta quella sopra se preferisci PNG
                    html2canvas: { 
                        scale: 2, // Aumenta la risoluzione di cattura (migliora la qualità del testo e delle linee)
                        logging: false, // Disabilita i log di html2canvas/html2pdf nella console
                        useCORS: true // Utile se usi immagini da URL esterni (per problemi CORS)
                    },
                    jsPDF: { 
                        unit: "px", // Unità di misura (pixel per corrispondere a html2canvas)
                        format: "a4", // Formato pagina
                        orientation: "portrait" // Orientamento verticale
                    },
                    pagebreak: { mode: ["css", "legacy"] } // Modalità di gestione dei salti di pagina
                };

                await html2pdf().from(wrapper).set(pdfOptions).save();
                console.log("PDF generato con successo!");
                alert("PDF generato e scaricato con successo!");

            } catch (error) {
                console.error("Errore durante la generazione o il salvataggio del PDF:", error);
                alert("Si è verificato un errore durante la generazione del PDF. Controlla la console del browser (F12) per i dettagli.");
            } finally {
                // Pulisci l'area di preview dal DOM
                if (document.body.contains(previewArea)) {
                    document.body.removeChild(previewArea);
                }
                // Riabilita il pulsante
                generaPdfBtn.disabled = false;
                generaPdfBtn.innerText = "Genera PDF";
            }
        }, 1000); // Attendi 1 secondo prima di scattare lo screenshot
    } catch (error) {
        console.error("Errore nel processo di preparazione delle pagine:", error);
        alert("Si è verificato un errore nella preparazione delle pagine. Controlla la console del browser (F12).");
        generaPdfBtn.disabled = false;
        generaPdfBtn.innerText = "Genera PDF";
    }
});
