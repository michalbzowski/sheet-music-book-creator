import { resizeImage } from "../utils/resizeImage.js";


// strategies/SinglePagePdfStrategy.js
export default class SinglePagePdfStrategy {
    static label = "Książeczka (impozycja) - drukuj dwustronnie - krótka krawędź";
    static name = "booklet";
    static description =`
        <p>
            Ten układ to układ ksiązeczki zszytej zszywaczem przez środek.
        </p>
        <p>
            Wczytane obrazki będa ułozone w odpowiedniej kolejności w pliku PDF, który pobierzesz. 
        </p>
        <p>
            Następnie wydrukuj go wybierając druk dwustronny z obrotem wokół krótkiej krawędzi.
        </p>
        <p>
            Po wydruku, zegnij wszystkie strony w pół, aby wyznaczyć środek i zszyj go zszywaczem. 
        </p>

    `

    constructor(dpiScale, jpgQuality) {
        this.dpiScale = dpiScale;
        this.jpgQuality = jpgQuality;
    }

    async createPdf(files) {
        const pdf = new window.jspdf.jsPDF({ orientation: "landscape" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Jeśli liczba plików nieparzysta, dodaj pusty plik, by uzyskać parzystą liczbę stron
        const totalImages = files.length % 2 === 0 ? files.length : files.length + 1;

        const loadImage = async (file) => {
            if (!file) return null;
            let imgData = await this.readFileAsDataURL(file);
            imgData = await resizeImage(imgData,
                pdf.internal.pageSize.getWidth(),
                pdf.internal.pageSize.getHeight(),
                this.dpiScale,
                this.jpgQuality
            );
            const size = await this.getImageSize(imgData);
            return { imgData, size };
        };

        for (let i = 0; i < totalImages / 2; i++) {
            if (i > 0) pdf.addPage();

            let leftIndex;
            let rightIndex;
            if (i % 2 == 0) {
                leftIndex = totalImages - 1 - i;
                rightIndex = i;
            } else {
                leftIndex = i;
                rightIndex = totalImages - 1 - i;
            }

            // Pobierz pliki lub null (dla pustej strony jeśli indeks poza zakres)
            const leftFile = leftIndex < files.length ? files[leftIndex] : null;
            const rightFile = rightIndex < files.length ? files[rightIndex] : null;

            const leftPage = await loadImage(leftFile);
            const rightPage = await loadImage(rightFile);

            const halfPageWidth = pageWidth / 2;
            const maxHeight = pageHeight;

            const drawImage = (img, x) => {
                if (!img) return;
                let w = halfPageWidth;
                let h = (img.size.height * w) / img.size.width;
                if (h > maxHeight) {
                    h = maxHeight;
                    w = (img.size.width * h) / img.size.height;
                }
                pdf.addImage(img.imgData, "JPEG", x, 0, w, h);
            };

            drawImage(leftPage, 0);
            drawImage(rightPage, halfPageWidth);
        }

        return pdf;
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    getImageSize(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () =>
                resolve({
                    width: img.width,
                    height: img.height,
                });
            img.onerror = reject;
            img.src = dataUrl;
        });
    }
}
