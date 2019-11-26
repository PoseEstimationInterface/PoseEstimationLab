import * as estimation from "pose-estimation-lib.js/dist/src/estimation";
import "babel-polyfill"
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

import {onDocumentLoad} from './t-rex-runner';

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

function detectPoseInRealTime(video) {
  const canvas = document.getElementById("output");
  const ctx = canvas.getContext("2d");

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function poseDetectionFrame() {
    const pose = await estimation.estimatePoses(video, true)

    console.log(pose);

    game.tRex.startJump(game.tRex.currentSpeed);

    ctx.clearRect(0, 0, videoWidth, videoHeight);

    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-videoWidth, 0);
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    ctx.restore();

    ctx.fillText("Hello world", 10, 50);

    requestAnimationFrame(poseDetectionFrame);
  }

  poseDetectionFrame();
}

const exportData = {"name":1,"age":2};
export default exportData;

export async function bindPage() {
  localStorage.setItem('item',"true")

  game = onDocumentLoad();

  console.log("Initialize");
  await estimation.initialize();

  console.log("Estimation Initialized")

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

  detectPoseInRealTime(video);
}

navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;
// kick off the demo
export {video};


let Runner;
document.addEventListener('DOMContentLoaded',  function (){
  bindPage();
});


