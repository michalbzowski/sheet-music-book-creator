// app.js
document.addEventListener("DOMContentLoaded", async () => {
    const fileInput = document.getElementById("file-input");
    const fileListEl = document.getElementById("file-list");
    const createBtn = document.getElementById("create-booklet-btn");
    const strategySelect = document.getElementById("strategy-select");
    const descriptionButton = document.getElementById("description-button");

    const filenameInput = document.getElementById("filename");

    let files = [];

    fileInput.addEventListener("change", (event) => {
        const fileArr = Array.from(event.target.files);
        files = fileArr.sort((a, b) => a.name.localeCompare(b.name));
        renderFileList();
        createBtn.disabled = files.length === 0;
    });

    function renderFileList() {
        fileListEl.innerHTML = "";
        files.forEach((file, index) => {
            const li = document.createElement("li");
            li.draggable = true;
            li.textContent = file.name;
            li.dataset.index = index;

            // li.addEventListener("dragstart", onDragStart);
            // li.addEventListener("dragover", onDragOver);
            // li.addEventListener("drop", onDrop);
            // li.addEventListener("dragend", onDragEnd);

            fileListEl.appendChild(li);
        });
    }

    let dragSrcEl = null;

    // function onDragStart(e) {
    //     dragSrcEl = this;
    //     this.classList.add("dragging");
    //     e.dataTransfer.effectAllowed = "move";
    // }

    // function onDragOver(e) {
    //     e.preventDefault();
    //     e.dataTransfer.dropEffect = "move";
    //     return false;
    // }

    // function onDrop(e) {
    //     e.stopPropagation();
    //     if (dragSrcEl !== this) {
    //         const srcIndex = Number(dragSrcEl.dataset.index);
    //         const targetIndex = Number(this.dataset.index);
    //         files.splice(targetIndex, 0, files.splice(srcIndex, 1)[0]);
    //         renderFileList();
    //     }
    //     return false;
    // }

    // function onDragEnd() {
    //     this.classList.remove("dragging");
    // }

    //Wczytywanie strategii
    // Lista plików w katalogu strategies
     let strategyFiles = [];

    await fetch('/public/strategies.json')
        .then(res => res.json())
        .then(filesList => {
            // dynamiczne generowanie wyboru strategii
            filesList.forEach((fileName) => {
                // np. import lub dynamiczne tworzenie opcji w select na podstawie tego pliku
                console.log(fileName);
                strategyFiles.push(fileName)
            });
        });


    // Załaduj moduły strategii
    const strategies = [];
    for (const file of strategyFiles) {
        const module = await import(file);
        const StrategyClass = module.default;
        strategies.push(StrategyClass);
    }

    // Wygeneruj select na podstawie pola label i name każdej strategii
    strategies.forEach((StratClass) => {
        const opt = document.createElement("option");
        opt.value = StratClass.name;
        opt.textContent = StratClass.label;
        opt.title = StratClass.description; // opcjonalnie tooltip
        strategySelect.appendChild(opt);
    });

    strategySelect.addEventListener("change", async () => {
        const selectedName = strategySelect.value;
        const SelectedStrategy = strategies.find(s => s.name === selectedName);
        document.getElementById("strategy-desctiption").innerHTML = SelectedStrategy.description;
        console.log(SelectedStrategy.description);
    });

    descriptionButton.addEventListener("click", async () => {
        const selectedName = strategySelect.value;
        const SelectedStrategy = strategies.find(s => s.name === selectedName);
        document.getElementById("strategy-desctiption").innerHTML = SelectedStrategy.description;
        console.log(SelectedStrategy.description);
    });

    // Dalej podłącz pozostały kod do obsługi wyboru strategii itd...

    // ... Wczytywanie plików, lista plików itd. (jak wcześniej) ...

    createBtn.addEventListener("click", async () => {
        // Pobierz wartości dpiScale, jpgQuality, filename (jak wcześniej)
        const dpiScale = parseFloat(document.getElementById("dpi-scale").value) || 2;
        const jpgQuality = parseFloat(document.getElementById("jpg-quality").value) || 0.9;
        const filename = document.getElementById("filename").value.trim() || "ksiazeczka.pdf";

        // Znajdź wybraną klasę strategii
        const selectedName = strategySelect.value;
        const SelectedStrategy = strategies.find(s => s.name === selectedName);

        if (!SelectedStrategy) {
            alert("Nie wybrano poprawnej strategii");
            return;
        }

        const strategyInstance = new SelectedStrategy(dpiScale, jpgQuality);
        const pdfCreator = new PdfCreator(strategyInstance);
        const pdf = await pdfCreator.create(files);
        pdf.save(filename);
    });


    // Kontekst strategii do tworzenia PDF
    class PdfCreator {
        constructor(strategy) {
            this.strategy = strategy;
        }

        setStrategy(strategy) {
            this.strategy = strategy;
        }

        async create(files) {
            return this.strategy.createPdf(files);
        }
    }

});
