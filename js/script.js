let imageProcessed = false;
let firstDescriptor = null;
let continueProcessing = true;
let descriptors = [];
async function loadModels() {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
      await faceapi.nets.ssdMobilenetv1.loadFromUri("./models")
      await faceapi.nets.faceLandmark68Net.loadFromUri("./models")
      await faceapi.nets.faceRecognitionNet.loadFromUri("./models")
    } catch (error) {
        console.error("Erro ao carregar os modelos:", error);
    }
}

async function startVideo() {
    const videoElement = document.getElementById('video');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            videoElement.srcObject = stream;
            processVideoFrame();
        } catch (error) {
            console.error("Erro ao acessar a câmera:", error);
        }
    }
}

async function stopVideo() {
    const videoElement = document.getElementById('video');
    const stream = videoElement.srcObject;

    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }

    videoElement.srcObject = null;
    continueProcessing = false;
}

async function processVideoFrame() {
  if (!imageProcessed || !continueProcessing) {
      return;
  }

  const videoElement = document.getElementById('video');
  const svgElement = document.getElementById('overlay');
  
  if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(processVideoFrame);
      return;
  }

  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 });
  const detectionsVideo = await faceapi.detectAllFaces(videoElement, options).withFaceLandmarks().withFaceDescriptors();

  if (detectionsVideo && detectionsVideo.length > 0) {
    //1º loop
    detectionsVideo.forEach(detectionvideo => {
      let maxSimilarity = 0;
    console.log(detectionvideo)
    //2º loop
      descriptors.forEach(descriptorimg => {
          const distance = Math.round(faceapi.euclideanDistance(descriptorimg, detectionvideo.descriptor) * 100) / 100;
          const similarityPercentage = Math.max(0, (1 - distance / 0.6) * 100);
          maxSimilarity = Math.max(maxSimilarity, similarityPercentage);
      });

      const roundedPercentage = Math.round(maxSimilarity);
      
      let color;
      if (roundedPercentage > 50) {
          color = '#00FF00';
         
      } else {
          color = '#FF0000';
      }

      let rect = document.getElementById('faceRectangle');
      if (!rect) {
          rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
          rect.id = 'faceRectangle';
          svgElement.appendChild(rect);
      }
      rect.setAttribute('x', detectionvideo.detection.box.x);
      rect.setAttribute('y', detectionvideo.detection.box.y);
      rect.setAttribute('width', detectionvideo.detection.box.width);
      rect.setAttribute('height', detectionvideo.detection.box.height);
      rect.setAttribute('fill', 'none');
      rect.setAttribute('stroke', color);
      //operador ternario
      /*
      if(roundedPercentage > 50){
        return 4
      }else{
        return 2
      }
      */
      rect.setAttribute('stroke-width', (roundedPercentage > 50) ? '4' : '2');

      let text = document.getElementById('similarityText');
      if (!text) {
          text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
          text.id = 'similarityText';
          svgElement.appendChild(text);
      }
      text.textContent = `Similaridade: ${roundedPercentage} %`;
      text.setAttribute('x', detectionvideo.detection.box.x);
      text.setAttribute('y', detectionvideo.detection.box.y - 10);
      text.setAttribute('font-family', 'Arial');
      text.setAttribute('font-size', '18');
      text.setAttribute('fill', color);
      if (roundedPercentage > 50) {
        let faceCanvas = document.createElement('canvas');
        faceCanvas.width = detectionvideo.detection.box.width;
        faceCanvas.height = detectionvideo.detection.box.height;
        
        let ctx = faceCanvas.getContext('2d');
        ctx.drawImage(videoElement,
          detectionvideo.detection.box.x, detectionvideo.detection.box.y, detectionvideo.detection.box.width, detectionvideo.detection.box.height,
            0, 0, detectionvideo.detection.box.width, detectionvideo.detection.box.height
        );
        
        const box = detectionvideo.detection.box;
        //const faceId = `face_${Math.round(box.x)}_${Math.round(box.y)}`;
        const faceId = `1`;
        let faceImg = document.getElementById(faceId);
        
        if (!faceImg) {
            faceImg = new Image();
            faceImg.id = faceId;
            document.body.appendChild(faceImg);
        }
        
        faceImg.src = faceCanvas.toDataURL();
        faceImg.style.position = 'absolute';
        faceImg.style.top = `${box.y+30}px`;
        faceImg.style.left = `${box.x+340}px`;
        faceImg.style.zIndex = '99999';  
        faceImg.style.border = '2px solid #333';  
        faceImg.style.boxShadow = '3px 3px 5px rgba(0, 0, 0, 0.3)';
        
        
        alert("Encontrado!!!");
        //continueProcessing = false;
    }
    });
  }

  requestAnimationFrame(processVideoFrame);
}


const checkSimilarityButton = document.getElementById('checkSimilarity');
document.addEventListener("DOMContentLoaded", function() {
  const checkSimilarityButton = document.getElementById('checkSimilarity');
  
  if (checkSimilarityButton) { 
      checkSimilarityButton.addEventListener('click', async function() {
        document.getElementById('loading').style.display = 'flex';

        await loadAllDescriptors();
        
        document.getElementById('loading').style.display = 'none';
          startVideo();
      });
  }
});



let videoStarted = false;

async function processFirstImage(image) {
    const canvas = document.getElementById('canvas1');
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); 

    const detection = await faceapi.detectSingleFace(canvas).withFaceLandmarks().withFaceDescriptor();

    if (detection) {
        firstDescriptor = detection.descriptor;
        imageProcessed = true;
        
        if (!videoStarted) {
            videoStarted = true;
        }
        
        processVideoFrame();  
        return true;
    }

    return false;
}




async function loadAllDescriptors() {
  const currentCount = parseInt(localStorage.getItem('imgCount') || '0');
  
  for (let i = 1; i <= currentCount; i++) {         
      const base64Image = localStorage.getItem(`image_${i}`);
      if (base64Image) {
          const image = new Image();
          image.src = base64Image;
          await new Promise(res => {
              image.onload = async function() {
                  const canvas = document.createElement('canvas');
                 
                  canvas.width = image.width;
                  canvas.height = image.height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                 
                  const detection = await faceapi.detectSingleFace(canvas).withFaceLandmarks().withFaceDescriptor();
                  if (detection) {
                      descriptors.push(detection.descriptor);
                        imageProcessed = true;
                        
                        
                        processVideoFrame();  
                      
                    
                  }
                  res();
              };
              image.onerror = err => {
                  console.error("Erro ao carregar imagem do localStorage:", err);
                  res();
              };
          });
      }
  }
}

// document.getElementById('imageUpload1').addEventListener('change', async function() {
//     const image1 = new Image();
//     image1.src = URL.createObjectURL(document.getElementById('imageUpload1').files[0]);
//     await new Promise(res => {
//         image1.onload = async function() {
//             if (await processFirstImage(image1)) {
//                 startVideo();
//             }
//             res();
//         };
//         image1.onerror = err => {
//             console.error("Erro ao carregar a primeira imagem:", err);
//             res();
//         };
//     });
// });


loadModels();
