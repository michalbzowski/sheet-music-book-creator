export async function resizeImage(dataUrl, maxWidth, maxHeight, dpiScale, quality) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;
            let scale = Math.min(maxWidth / width, maxHeight / height, 1);
            width = width * scale;
            height = height * scale;

            // Zwiększenie rozdzielczości canvas - mnożymy przez współczynnik dpi
            // dpiScale;  // Możesz eksperymentować, np. 2 lub 3

            const canvas = document.createElement("canvas");
            canvas.width = width * dpiScale;
            canvas.height = height * dpiScale;

            const ctx = canvas.getContext("2d");
            // Skalowanie obrazu z uwzględnieniem dpiScale
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Żądana jakość JPEG, np. 0.9
            resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.src = dataUrl;
    });
}