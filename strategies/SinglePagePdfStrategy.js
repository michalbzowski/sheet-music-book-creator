import { resizeImage } from "../utils/resizeImage.js";

// strategies/SinglePagePdfStrategy.js
export default class SinglePagePdfStrategy {
    static label = "Jeden obrazek na stronę";
    static name = "single";
    static description = "Prosta strategia, jeden obrazek na stronę PDF.";

    constructor(dpiScale, jpgQuality) {
        this.dpiScale = dpiScale;
        this.jpgQuality = jpgQuality;
    }

    async createPdf(files) {
        const pdf = new window.jspdf.jsPDF();
        for (let i = 0; i < files.length; i++) {
            let imgData = await this.readFileAsDataURL(files[i]);
            imgData = await resizeImage(
                imgData, 
                pdf.internal.pageSize.getWidth(), 
                pdf.internal.pageSize.getHeight(),
                this.dpiScale,
                this.jpgQuality
            );
            const imgSize = await this.getImageSize(imgData);

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            let widthScale = pdfWidth;
            let heightScale = (imgSize.height * pdfWidth) / imgSize.width;
            if (heightScale > pdfHeight) {
                heightScale = pdfHeight;
                widthScale = (imgSize.width * pdfHeight) / imgSize.height;
            }

            if (i > 0) pdf.addPage();
            pdf.addImage(imgData, "JPEG", 0, 0, widthScale, heightScale);
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
