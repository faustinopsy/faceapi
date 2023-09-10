const imageInput = document.getElementById('imageUpload1');
const imgCountSpan = document.getElementById('imgCount');

imageInput.addEventListener('change', async function() {
    const file = this.files[0];
    if (file) {
        const base64Image = await toBase64(file);
        const currentCount = parseInt(localStorage.getItem('imgCount') || '0');
        localStorage.setItem(`image_${currentCount + 1}`, base64Image);
        localStorage.setItem('imgCount', (currentCount + 1).toString());
        imgCountSpan.innerText = `${currentCount + 1} Imagens carregadas`;
    }
});

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}


