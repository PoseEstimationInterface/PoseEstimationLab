import {
  drawBoundingBox,
  drawKeypoints,
  drawSkeleton,
  isMobile,
  toggleLoadingUI,
  tryResNetButtonName,
  tryResNetButtonText,
  updateTryResNetButtonDatGuiCss
} from "./tRexGameUtil";
import "babel-polyfill";

import { onDocumentLoad } from "./t-rex-runner";

const videoWidth = 1280;
const videoHeight = 720;

let video;
let game;

async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Browser API navigator.mediaDevices.getUserMedia not available"
    );
  }

  video = document.getElementById("video");
  video.width = videoWidth;
  video.height = videoHeight;

  const mobile = isMobile();
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      width: mobile ? undefined : videoWidth,
      height: mobile ? undefined : videoHeight
    }
  });
  video.srcObject = stream;

  return new Promise(resolve => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function loadVideo() {
  const video = await setupCamera();
  video.play();

  return video;
}

var worker = new Worker("worker.js");

function detectPoseInRealTime(video) {
  const canvas = document.getElementById("output");
  const ctx = canvas.getContext("2d");

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  // const offscreen = canvas.transferControlToOffscreen();
  // console.log(offscreen);

  async function poseDetectionFrame() {
    // game.tRex.startJump(game.tRex.currentSpeed);

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    ctx.restore();

    requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame();
}

const exportData = { name: 1, age: 2 };
export default exportData;

export async function bindPage() {
  localStorage.setItem("item", "true");

  game = onDocumentLoad();

  let video;
  try {
    video = await loadVideo();
  } catch (e) {
    let info = document.getElementById("info");
    info.textContent =
      "this browser does not support video capture," +
      "or this device does not have a camera";
    info.style.display = "block";
    throw e;
  }

  // worker.postMessage({ method: "init", video });
  // worker.onmessage = function(e) {
  //   console.log(e.data);
  // };

  detectPoseInRealTime(video);
}

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;
// kick off the demo
export { video };

let Runner;
document.addEventListener("DOMContentLoaded", function() {
  bindPage();
});
