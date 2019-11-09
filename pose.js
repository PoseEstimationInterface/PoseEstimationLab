import * as posenet from "@tensorflow-models/posenet";
import * as tf from "@tensorflow/tfjs";

import {
  isMobile,
  toggleLoadingUI,
  tryResNetButtonName,
  tryResNetButtonText,
  updateTryResNetButtonDatGuiCss
} from "./demo_util";
// clang-format off
import {
  drawBoundingBox,
  drawKeypoints,
  drawSkeleton,
  renderImageToCanvas
} from "./demo_util";
import "babel-polyfill";

const img1Url = require("./img/pose1.jpg");

function drawResults(
  canvas,
  image,
  poses,
  minPartConfidence,
  minPoseConfidence
) {
  renderImageToCanvas(image, [513, 513], canvas);
  const ctx = canvas.getContext("2d");
  poses.forEach(pose => {
    if (pose.score >= minPoseConfidence) {
      drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      drawSkeleton(pose.keypoints, minPartConfidence, ctx);

      drawBoundingBox(pose.keypoints, ctx);
    }
  });
}

async function loadImage(imagePath) {
  const image = new Image();
  const promise = new Promise((resolve, reject) => {
    image.crossOrigin = "";
    image.onload = () => {
      resolve(image);
    };
  });

  image.src = `${imagePath}`;
  return promise;
}

export async function main() {
  const canvas = document.getElementById("output");
  const ctx = canvas.getContext("2d");

  console.log("Loading Model");

  const net = await posenet.load({
    architecture: "ResNet50",
    outputStride: 32,
    inputResolution: { width: 257, height: 200 },
    quantBytes: 2
  });

  console.log("Loaded Model");

  const img1 = await loadImage(`http://localhost:1234/${img1Url}`);

  const input = tf.browser.fromPixels(img1);

  const poses = await net.estimatePoses(input, {
    decodingMethod: "multi-person",
    flipHorizontal: false,
    maxDetections: 5,
    scoreThreshold: 0.1,
    nmsRadius: 30
  });

  console.log(poses);

  drawResults(canvas, img1, poses, 0.1, 0.15);

  return poses;
}

main();
