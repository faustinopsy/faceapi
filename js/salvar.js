const imageInput = document.getElementById('imageUpload1');
const imgCountSpan = document.getElementById('imgCount');
let conta= parseInt(localStorage.getItem('imgCount'));

imageInput.addEventListener('change', async function() {
    const file = this.files[0];

    if (file) {
        const base64Image = await toBase64(file);
        const currentCount = parseInt(localStorage.getItem('imgCount') || '0');
        localStorage.setItem(`image_${currentCount + 1}`, base64Image);
        localStorage.setItem('imgCount', (currentCount + 1).toString());
        imgCountSpan.innerText = `${currentCount + 1} Imagens carregadas`;

        let im0=document.getElementById('imagens');
        const img=document.createElement('img');
        img.src=base64Image
        img.style.width="130px";
        im0.appendChild(img);
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


