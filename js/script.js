async function loadModels() {
  try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  } catch (error) {
      console.error("Erro ao carregar os modelos:", error);
  }
}

async function detectFacesOnImage(image) {
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, 400, 400); 

  try {
      const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
      
      if (detections && detections.length > 0) {
          faceapi.draw.drawDetections(canvas, detections);
          faceapi.draw.drawFaceLandmarks(canvas, detections);
      } else {
          console.log("Nenhuma face detectada.");
      }
  } catch (error) {
      console.error("Erro durante a detecção:", error);
  }
}

document.getElementById('imageUpload').addEventListener('change', function() {
  const image = new Image();
  image.src = URL.createObjectURL(document.getElementById('imageUpload').files[0]);
  image.onload = function() {
      detectFacesOnImage(image);
  };
});

loadModels();
