
// 🔥 Firebase config (তোমারটাই)
firebase.initializeApp({
  apiKey: "AIzaSyAiwI-tw9KvI1iTsQJsMnlKbD8wAnk5gDI",
  authDomain: "my-site-online.firebaseapp.com",
  databaseURL: "https://my-site-online-default-rtdb.firebaseio.com",
  projectId: "my-site-online",
  storageBucket: "my-site-online.firebasestorage.app",
  messagingSenderId: "137426435698",
  appId: "1:137426435698:web:aef5eb11d7459863728ceb"
});

const db = firebase.database();
let localStream;
let peers = {};
let userId = Math.random().toString(36).substr(2, 9);

async function joinRoom() {
  const roomId = document.getElementById("roomId").value;
  if (!roomId) return alert("Room ID দাও");

  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });

  db.ref(`rooms/${roomId}/users/${userId}`).set(true);
  db.ref(`rooms/${roomId}/signals`).on("child_added", snap => handleSignal(roomId, snap.val()));
}

function createPeer(remoteId, roomId, isOffer) {
  const pc = new RTCPeerConnection();

  localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

  pc.ontrack = e => {
    let audio = document.createElement("audio");
    audio.srcObject = e.streams[0];
    audio.autoplay = true;
    document.getElementById("audios").appendChild(audio);
  };

  pc.onicecandidate = e => {
    if (e.candidate) {
      db.ref(`rooms/${roomId}/signals`).push({
        from: userId,
        to: remoteId,
        candidate: e.candidate
      });
    }
  };

  peers[remoteId] = pc;

  if (isOffer) {
    pc.createOffer().then(o => {
      pc.setLocalDescription(o);
      db.ref(`rooms/${roomId}/signals`).push({
        from: userId,
        to: remoteId,
        offer: o
      });
    });
  }
}

function handleSignal(roomId, data) {
  if (data.to !== userId) return;

  let pc = peers[data.from] || createPeer(data.from, roomId, false);

  if (data.offer) {
    pc.setRemoteDescription(new RTCSessionDescription(data.offer));
    pc.createAnswer().then(a => {
      pc.setLocalDescription(a);
      db.ref(`rooms/${roomId}/signals`).push({
        from: userId,
        to: data.from,
        answer: a
      });
    });
  }

  if (data.answer) {
    pc.setRemoteDescription(new RTCSessionDescription(data.answer));
  }

  if (data.candidate) {
    pc.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
}
