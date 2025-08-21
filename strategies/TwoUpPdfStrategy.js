import { resizeImage } from "../utils/resizeImage.js";

// strategies/TwoUpPdfStrategy.js
export default class TwoUpPdfStrategy {
    static label = "Dwa obrazki na stronę";
    static name = "two-up";
    static description = `
                <p>
                    Ten układ to poprostu dwa wczytane orazki na jednej stronie.
                </p>
        <p>
                Po kolei, pierwszy i drugi wczytany obrazek będzie na pierwszej stronie. 
                Drugi i trzeci na drugiej itp.
        </p>
    `;

    constructor(dpiScale, jpgQuality) {
        this.dpiScale = dpiScale;
        this.jpgQuality = jpgQuality;
    }

    async createPdf(files) {
        // Ustawiamy orientację poziomą dla kartki A4: "landscape"
        const pdf = new window.jspdf.jsPDF({ orientation: "landscape" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        for (let i = 0; i < files.length; i += 2) {
            if (i > 0) pdf.addPage();

            // ładowanie pierwszego obrazka
            let imgData1 = await this.readFileAsDataURL(files[i]);
            imgData1 = await resizeImage(
                imgData1,
                pdf.internal.pageSize.getWidth(),
                pdf.internal.pageSize.getHeight(),
                this.dpiScale,
                this.jpgQuality
            );
            const imgSize1 = await this.getImageSize(imgData1);

            // skalowanie pierwszego obrazka do max połowy szerokości strony - z zachowaniem proporcji
            const maxWidth = pageWidth / 2;
            const maxHeight = pageHeight;
            let scaleWidth1 = maxWidth;
            let scaleHeight1 = (imgSize1.height * maxWidth) / imgSize1.width;
            if (scaleHeight1 > maxHeight) {
                scaleHeight1 = maxHeight;
                scaleWidth1 = (imgSize1.width * maxHeight) / imgSize1.height;
            }

            pdf.addImage(imgData1, "JPEG", 0, 0, scaleWidth1, scaleHeight1);

            // jeśli jest drugi obrazek parzysty
            if (i + 1 < files.length) {
                let imgData2 = await this.readFileAsDataURL(files[i + 1]);
                imgData2 = await resizeImage(
                    imgData2,
                    pdf.internal.pageSize.getWidth(),
                    pdf.internal.pageSize.getHeight(),
                    this.dpiScale,
                    this.jpgQuality
                );
                const imgSize2 = await this.getImageSize(imgData2);

                let scaleWidth2 = maxWidth;
                let scaleHeight2 = (imgSize2.height * maxWidth) / imgSize2.width;
                if (scaleHeight2 > maxHeight) {
                    scaleHeight2 = maxHeight;
                    scaleWidth2 = (imgSize2.width * maxHeight) / imgSize2.height;
                }

                // Drugi obrazkek po prawej, start x na połowie szerokości strony
                pdf.addImage(imgData2, "JPEG", maxWidth, 0, scaleWidth2, scaleHeight2);
            }
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
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = reject;
            img.src = dataUrl;
        });
    }
}
