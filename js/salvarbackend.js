const imageInput = document.getElementById('imageUpload1');
const imgCountSpan = document.getElementById('imgCount');
let im0 = document.getElementById('imagens');

function carregarImagens() {
    fetch('app/Usuarios.php', { 
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        im0.innerHTML = ''; 
        data.usuarios.forEach((usuario, index) => {
            const img = document.createElement('img');
            img.id = "ix_" + (index + 1);
            img.src = usuario.rosto; 
            img.style.width = "130px";
            im0.appendChild(img);
        });
        imgCountSpan.innerText = `${data.usuarios.length} Imagens carregadas`;
    })
    .catch(error => console.error('Error:', error));
}

carregarImagens();

imageInput.addEventListener('change', async function() {
    const file = this.files[0];

    if (file) {
        const base64Image = await toBase64(file);
        
        const data = {
            nome: 'Nome da Imagem', 
            rosto: base64Image
        };
        
        fetch('app/Usuarios.php', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => response.json())
          .then(data => {
            if(data.status){
                carregarImagens(); 
            }
           
          })
          .catch((error) => {
            console.error('Error:', error);
          });
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
