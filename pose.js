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

const modelFile = require("./model/model.json");

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
  console.log(
    tf
      .reshape(
        [
          [1, 2, 3],
          [4, 5, 6]
        ],
        [1, 6]
      )
      .toString()
  );

  const data = tf.reshape(
    [
      [0.32446819123767673, 0.6890093085879372],
      [0.2675943247477214, 0.7288776325044178],
      [0.3696891110283988, 0.7388255255562919],
      [0.21030552092052646, 0.6615986760457357],
      [0.44850398472377234, 0.688206532796224],
      [0.13582691919235962, 0.35502221970331105],
      [0.5988278125581288, 0.37863055819556835],
      [0.07856231689453125, 0.09963338942754847],
      [0.7009441702706474, 0.08721294584728428],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0]
    ],
    [1, 34]
  );

  console.log(model.predict(data).toString());

  // const net = await posenet.load({
  //   architecture: "ResNet50",
  //   outputStride: 32,
  //   inputResolution: { width: 257, height: 200 },
  //   quantBytes: 2
  // });

  // console.log("Loaded Model");

  // const img1 = await loadImage(`http://localhost:1234/${img1Url}`);

  // const input = tf.browser.fromPixels(img1);

  // const poses = await net.estimatePoses(input, {
  //   decodingMethod: "multi-person",
  //   flipHorizontal: false,
  //   maxDetections: 5,
  //   scoreThreshold: 0.1,
  //   nmsRadius: 30
  // });

  // console.log(poses);

  // drawResults(canvas, img1, poses, 0.1, 0.15);

  // return poses;
}

main();
