let imageProcessed = false;
let firstDescriptor = null;
let continueProcessing = true;

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
  const detection = await faceapi.detectSingleFace(videoElement, options).withFaceLandmarks().withFaceDescriptor();
  if (detection) {
      const distance = Math.round(faceapi.euclideanDistance(firstDescriptor, detection.descriptor) * 100) / 100;
      const similarityPercentage = Math.max(0, (1 - distance / 0.6) * 100);
      const roundedPercentage = Math.round(similarityPercentage);
      
      let color;
      if (roundedPercentage > 80) {
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
      rect.setAttribute('x', detection.detection.box.x);
      rect.setAttribute('y', detection.detection.box.y);
      rect.setAttribute('width', detection.detection.box.width);
      rect.setAttribute('height', detection.detection.box.height);
      rect.setAttribute('fill', 'none');
      rect.setAttribute('stroke', color);
      rect.setAttribute('stroke-width', (roundedPercentage > 80) ? '4' : '2');

      let text = document.getElementById('similarityText');
      if (!text) {
          text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
          text.id = 'similarityText';
          svgElement.appendChild(text);
      }
      text.textContent = `Similaridade: ${roundedPercentage} %`;
      text.setAttribute('x', detection.detection.box.x);
      text.setAttribute('y', detection.detection.box.y - 10);
      text.setAttribute('font-family', 'Arial');
      text.setAttribute('font-size', '18');
      text.setAttribute('fill', color);
  }

  requestAnimationFrame(processVideoFrame);
}




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


document.getElementById('imageUpload1').addEventListener('change', async function() {
    const image1 = new Image();
    image1.src = URL.createObjectURL(document.getElementById('imageUpload1').files[0]);
    await new Promise(res => {
        image1.onload = async function() {
            if (await processFirstImage(image1)) {
                startVideo();
            }
            res();
        };
        image1.onerror = err => {
            console.error("Erro ao carregar a primeira imagem:", err);
            res();
        };
    });
});

document.getElementById('stopButton').addEventListener('click', stopVideo);

loadModels();
