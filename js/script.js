async function loadModels() {
  try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('./models');
      await faceapi.nets.ssdMobilenetv1.loadFromUri("./models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("./models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("./models");
  } catch (error) {
      console.error("Erro ao carregar os modelos:", error);
  }
}

let firstDescriptor = null;

async function processFirstImage(image) {
  const canvas = document.getElementById('canvas1');
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height); // Desenha a imagem no canvas

  const detection = await faceapi.detectSingleFace(canvas).withFaceLandmarks().withFaceDescriptor();

  if (detection) {
      firstDescriptor = detection.descriptor;
      return true;
  }

  return false;
}

async function processSecondImage(image) {
  const canvas = document.getElementById('canvas2');
  const context = canvas.getContext('2d');

  context.drawImage(image, 0, 0, canvas.width, canvas.height); 

  const detections = await faceapi.detectAllFaces(canvas).withFaceLandmarks().withFaceDescriptors();

  detections.forEach(det => {
    const distance = Math.round(faceapi.euclideanDistance(firstDescriptor, det.descriptor) * 100) / 100; 
    const similarityPercentage = Math.max(0, (1 - distance / 0.6) * 100);
    const roundedPercentage = Math.round(similarityPercentage);
    
    if (roundedPercentage > 80) {
      context.lineWidth = 4; 
        context.strokeStyle = '#00FF00'; 
        context.fillStyle = '#00FF00';
    } else {
      context.lineWidth = 2; 
        context.strokeStyle = '#FF0000'; 
        context.fillStyle = '#FF0000';
    }

    context.strokeRect(det.detection.box.x, det.detection.box.y, det.detection.box.width, det.detection.box.height);

    context.font = '18px Arial'; 
    context.fillText(`Similaridade: ${roundedPercentage} %`, det.detection.box.x, det.detection.box.y - 10); 
});

}


document.getElementById('imageUpload2').addEventListener('change', async function() {
  const image1 = new Image();
  image1.src = URL.createObjectURL(document.getElementById('imageUpload1').files[0]);
  await new Promise(res => {
      image1.onload = async function() {
          if (await processFirstImage(image1)) {
              const image2 = new Image();
              image2.src = URL.createObjectURL(document.getElementById('imageUpload2').files[0]);
              image2.onload = function() {
                  processSecondImage(image2);
              };
          }
      };
      image1.onerror = err => {
          console.error("Erro ao carregar a primeira imagem:", err);
          res();
      };
  });
});

loadModels();
