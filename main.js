async function startLive() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });

    document.getElementById("localVideo").srcObject = stream;

  } catch (e) {
    alert("Camera permission deny হয়েছে");
    console.error(e);
  }
}