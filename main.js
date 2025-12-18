
let stream;

async function startLive() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    document.getElementById("video").srcObject = stream;

  } catch (err) {
    alert("Camera permission deny হয়েছে");
    console.error(err);
  }
}

function stopLive() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    document.getElementById("video").srcObject = null;
  }
}
