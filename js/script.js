async function loadModels() {
  try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  } catch (error) {
      console.error("Error loading models:", error);
  }
}

async function detectFacesOnImage(image) {
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;
  context.drawImage(image, 0, 0, image.width, image.height);

  try {
      const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
      console.log(detections);
      
      if (detections && detections.length > 0) {
          const displaySize = { width: image.width, height: image.height };
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      } else {
          console.log("No faces detected.");
      }
  } catch (error) {
      console.error("Error during face detection:", error);
  }
}

document.getElementById('detectButton').addEventListener('click', function() {
  const image = new Image();
  image.src = URL.createObjectURL(document.getElementById('imageUpload').files[0]);
  image.onload = function() {
      detectFacesOnImage(image);
  };
});

loadModels();
