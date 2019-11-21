/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import dat from "dat.gui";
import Stats from "stats.js";
import "babel-polyfill";
import fs from "fs";

import {
  drawBoundingBox,
  drawKeypoints,
  drawSkeleton,
  isMobile,
  toggleLoadingUI,
  tryResNetButtonName,
  tryResNetButtonText,
  updateTryResNetButtonDatGuiCss
} from "./demo_util";

const videoWidth = 600;
const videoHeight = 600;
const stats = new Stats();
var ground = [0,0];
var ground_val = 0;

const model = require("./model/model.json");

/**
 * Loads a the camera to be used in the demo
 *
 */
function sum(array) {
  var result = 0.0;

  for (var i = 0; i < array.length; i++)
    result += array[i];

  return result;
}

function whereGround(pose)
{
  var rightGround = pose['keypoints'][16]['position']['y'];
  rightGround = rightGround - ((rightGround-ground_val)*0.2);
  if(ground.length > 30)
  {
    ground.pop();
  }
  if(pose['keypoints'][16]['score']>0.5)
  {
    ground.unshift(rightGround);
  }
  console.log(ground);
  ground_val = sum(ground)/ground.length;


}
function WhatLen(point_1,point_2)
{
  var point_1_x=point_1['x'];
  var point_1_y=point_1['y'];

  var point_2_x=point_2['x'];
  var point_2_y=point_2['y'];

  var vector1_x = point_2_x - point_1_x;
  var vector1_y = point_2_y - point_1_y;

  return Math.sqrt((vector1_x*vector1_x)+(vector1_y*vector1_y));
}

function WhatAngle(point_1,point_mid,point_2)
{
  var point_1_x=point_1['x'];
  var point_1_y=point_1['y'];

  var point_mid_x=point_mid['x'];
  var point_mid_y=point_mid['y'];

  var point_2_x=point_2['x'];
  var point_2_y=point_2['y'];
  
  var vector1_x = point_mid_x - point_1_x;
  var vector1_y = point_mid_y - point_1_y;

  var vector2_x = point_mid_x - point_2_x;
  var vector2_y = point_mid_y - point_2_y;

  
  var abs1 = Math.sqrt((vector1_x*vector1_x)+(vector1_y*vector1_y));
  var abs2 = Math.sqrt((vector2_x*vector2_x)+(vector2_y*vector2_y));
  var naej = (vector1_x*vector2_x)+(vector1_y*vector2_y);
  var cosVal = naej/(abs1*abs2);

  return Math.acos(cosVal)*(180/Math.PI);
  

}

function left_handsup(pose)
{
  var lefthip = pose['keypoints'][11]['position'];
  var leftshouler = pose['keypoints'][5]['position']
  var leftElbow = pose['keypoints'][7]['position']
  var leftWrist = pose['keypoints'][9]['position']

  var angle = WhatAngle(leftElbow,leftshouler,lefthip)
  if(leftWrist['y']-leftElbow['y'] < 0)
  {
    if(angle>90)
    {
      return 2; //Big hands up
    }
    else
    {
      return 1; //Small hands up
    }
  }
  return 0;
}

function right_handsup(pose)
{
  var righthip = pose['keypoints'][12]['position'];
  var rightshouler = pose['keypoints'][6]['position']
  var rightElbow = pose['keypoints'][8]['position']
  var rightWrist = pose['keypoints'][10]['position']

  var angle = WhatAngle(rightElbow,rightshouler,righthip)
  if(rightWrist['y']-rightElbow['y'] < 0)
  {
    if(angle>90)
    {
      return 2; //Big hands up
    }
    else
    {
      return 1; //Small hands up
    }
  }
  return 0;
}

function left_handsupL(pose)
{
  var nose = pose['keypoints'][0]['position'];
  var leftwrist = pose['keypoints'][9]['position']
  
  if(nose['y']-leftwrist['y'] < 0)
  {
    return 1;
  }
  return 0;
}

function right_handsupL(pose)
{
  var nose = pose['keypoints'][0]['position'];
  var rightwrist = pose['keypoints'][10]['position']
  
  if(nose['y']-rightwrist['y'] < 0)
  {
    return 1;
  }
  return 0;
}

function sitdown(pose)
{
  var lefthip = pose['keypoints'][11]['position'];
  var leftankle = pose['keypoints'][15]['position'];
  var leftshoulder = pose['keypoints'][5]['position'];

  var righthip = pose['keypoints'][12]['position'];
  var rightankle = pose['keypoints'][16]['position'];
  var rightshoulder = pose['keypoints'][6]['position'];

  var len1 = lefthip['y'] - leftshoulder['y'];
  var len2 = leftankle['y'] - lefthip['y'];

  var len3 = righthip['y'] - rightshoulder['y'];
  var len4 = rightankle['y'] - righthip['y'];

  if(len2 < len1*0.9  && len4 < len3*0.9 )
  {
    return 1;
  }
  return 0;
}


function sangsang(pose)
{
  var righthip = pose['keypoints'][12]['position'];
  var rightshouler = pose['keypoints'][6]['position']
  var rightElbow = pose['keypoints'][8]['position']
  var rightWrist = pose['keypoints'][10]['position']

  var angle1 = WhatAngle(rightWrist,rightElbow,rightshouler)

  var lefthip = pose['keypoints'][11]['position'];
  var leftshouler = pose['keypoints'][5]['position']
  var leftElbow = pose['keypoints'][7]['position']
  var leftWrist = pose['keypoints'][9]['position']

  var angle2 = WhatAngle(leftWrist,leftElbow,leftshouler)

  if(angle1>80 && angle2>80 && leftElbow['y']-leftWrist['y']<0 && rightElbow['y']-rightWrist['y']>0)
  {
    return 1;
  }
  
  return 0;
}


async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Browser API navigator.mediaDevices.getUserMedia not available"
    );
  }

  const video = document.getElementById("video");
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

const defaultQuantBytes = 2;

const defaultMobileNetMultiplier = isMobile() ? 0.5 : 0.75;
const defaultMobileNetStride = 16;
const defaultMobileNetInputResolution = 500;

const defaultResNetMultiplier = 1.0;
const defaultResNetStride = 32;
const defaultResNetInputResolution = 250;

const guiState = {
  algorithm: "multi-pose",
  input: {
    architecture: "MobileNetV1",
    outputStride: defaultMobileNetStride,
    inputResolution: defaultMobileNetInputResolution,
    multiplier: defaultMobileNetMultiplier,
    quantBytes: defaultQuantBytes
  },
  singlePoseDetection: {
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5
  },
  multiPoseDetection: {
    maxPoseDetections: 5,
    minPoseConfidence: 0.15,
    minPartConfidence: 0.1,
    nmsRadius: 30.0
  },
  output: {
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    showBoundingBox: false
  },
  net: null
};

/**
 * Sets up dat.gui controller on the top-right of the window
 */
function setupGui(cameras, net) {
  guiState.net = net;

  if (cameras.length > 0) {
    guiState.camera = cameras[0].deviceId;
  }

  const gui = new dat.GUI({ width: 300 });

  let architectureController = null;
  guiState[tryResNetButtonName] = function() {
    architectureController.setValue("ResNet50");
  };
  gui.add(guiState, tryResNetButtonName).name(tryResNetButtonText);
  updateTryResNetButtonDatGuiCss();

  // The single-pose algorithm is faster and simpler but requires only one
  // person to be in the frame or results will be innaccurate. Multi-pose works
  // for more than 1 person
  const algorithmController = gui.add(guiState, "algorithm", [
    "single-pose",
    "multi-pose"
  ]);

  // The input parameters have the most effect on accuracy and speed of the
  // network
  let input = gui.addFolder("Input");
  // Architecture: there are a few PoseNet models varying in size and
  // accuracy. 1.01 is the largest, but will be the slowest. 0.50 is the
  // fastest, but least accurate.
  architectureController = input.add(guiState.input, "architecture", [
    "MobileNetV1",
    "ResNet50"
  ]);
  guiState.architecture = guiState.input.architecture;
  // Input resolution:  Internally, this parameter affects the height and width
  // of the layers in the neural network. The higher the value of the input
  // resolution the better the accuracy but slower the speed.
  let inputResolutionController = null;
  function updateGuiInputResolution(inputResolution, inputResolutionArray) {
    if (inputResolutionController) {
      inputResolutionController.remove();
    }
    guiState.inputResolution = inputResolution;
    guiState.input.inputResolution = inputResolution;
    inputResolutionController = input.add(
      guiState.input,
      "inputResolution",
      inputResolutionArray
    );
    inputResolutionController.onChange(function(inputResolution) {
      guiState.changeToInputResolution = inputResolution;
    });
  }

  // Output stride:  Internally, this parameter affects the height and width of
  // the layers in the neural network. The lower the value of the output stride
  // the higher the accuracy but slower the speed, the higher the value the
  // faster the speed but lower the accuracy.
  let outputStrideController = null;
  function updateGuiOutputStride(outputStride, outputStrideArray) {
    if (outputStrideController) {
      outputStrideController.remove();
    }
    guiState.outputStride = outputStride;
    guiState.input.outputStride = outputStride;
    outputStrideController = input.add(
      guiState.input,
      "outputStride",
      outputStrideArray
    );
    outputStrideController.onChange(function(outputStride) {
      guiState.changeToOutputStride = outputStride;
    });
  }

  // Multiplier: this parameter affects the number of feature map channels in
  // the MobileNet. The higher the value, the higher the accuracy but slower the
  // speed, the lower the value the faster the speed but lower the accuracy.
  let multiplierController = null;
  function updateGuiMultiplier(multiplier, multiplierArray) {
    if (multiplierController) {
      multiplierController.remove();
    }
    guiState.multiplier = multiplier;
    guiState.input.multiplier = multiplier;
    multiplierController = input.add(
      guiState.input,
      "multiplier",
      multiplierArray
    );
    multiplierController.onChange(function(multiplier) {
      guiState.changeToMultiplier = multiplier;
    });
  }

  // QuantBytes: this parameter affects weight quantization in the ResNet50
  // model. The available options are 1 byte, 2 bytes, and 4 bytes. The higher
  // the value, the larger the model size and thus the longer the loading time,
  // the lower the value, the shorter the loading time but lower the accuracy.
  let quantBytesController = null;
  function updateGuiQuantBytes(quantBytes, quantBytesArray) {
    if (quantBytesController) {
      quantBytesController.remove();
    }
    guiState.quantBytes = +quantBytes;
    guiState.input.quantBytes = +quantBytes;
    quantBytesController = input.add(
      guiState.input,
      "quantBytes",
      quantBytesArray
    );
    quantBytesController.onChange(function(quantBytes) {
      guiState.changeToQuantBytes = +quantBytes;
    });
  }

  function updateGui() {
    if (guiState.input.architecture === "MobileNetV1") {
      updateGuiInputResolution(defaultMobileNetInputResolution, [
        200,
        250,
        300,
        350,
        400,
        450,
        500,
        550,
        600,
        650,
        700,
        750,
        800
      ]);
      updateGuiOutputStride(defaultMobileNetStride, [8, 16]);
      updateGuiMultiplier(defaultMobileNetMultiplier, [0.5, 0.75, 1.0]);
    } else {
      // guiState.input.architecture === "ResNet50"
      updateGuiInputResolution(defaultResNetInputResolution, [
        200,
        250,
        300,
        350,
        400,
        450,
        500,
        550,
        600,
        650,
        700,
        750,
        800
      ]);
      updateGuiOutputStride(defaultResNetStride, [32, 16]);
      updateGuiMultiplier(defaultResNetMultiplier, [1.0]);
    }
    updateGuiQuantBytes(defaultQuantBytes, [1, 2, 4]);
  }

  updateGui();
  input.open();
  // Pose confidence: the overall confidence in the estimation of a person's
  // pose (i.e. a person detected in a frame)
  // Min part confidence: the confidence that a particular estimated keypoint
  // position is accurate (i.e. the elbow's position)
  let single = gui.addFolder("Single Pose Detection");
  single.add(guiState.singlePoseDetection, "minPoseConfidence", 0.0, 1.0);
  single.add(guiState.singlePoseDetection, "minPartConfidence", 0.0, 1.0);

  let multi = gui.addFolder("Multi Pose Detection");
  multi
    .add(guiState.multiPoseDetection, "maxPoseDetections")
    .min(1)
    .max(20)
    .step(1);
  multi.add(guiState.multiPoseDetection, "minPoseConfidence", 0.0, 1.0);
  multi.add(guiState.multiPoseDetection, "minPartConfidence", 0.0, 1.0);
  // nms Radius: controls the minimum distance between poses that are returned
  // defaults to 20, which is probably fine for most use cases
  multi
    .add(guiState.multiPoseDetection, "nmsRadius")
    .min(0.0)
    .max(40.0);
  multi.open();

  let output = gui.addFolder("Output");
  output.add(guiState.output, "showVideo");
  output.add(guiState.output, "showSkeleton");
  output.add(guiState.output, "showPoints");
  output.add(guiState.output, "showBoundingBox");
  output.open();

  architectureController.onChange(function(architecture) {
    // if architecture is ResNet50, then show ResNet50 options
    updateGui();
    guiState.changeToArchitecture = architecture;
  });

  algorithmController.onChange(function(value) {
    switch (guiState.algorithm) {
      case "single-pose":
        multi.close();
        single.open();
        break;
      case "multi-pose":
        single.close();
        multi.open();
        break;
    }
  });
}

/**
 * Sets up a frames per second panel on the top-left of the window
 */
function setupFPS() {
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.getElementById("main").appendChild(stats.dom);
}

/**
 * Feeds an image to posenet to estimate poses - this is where the magic
 * happens. This function loops with a requestAnimationFrame method.
 */
function detectPoseInRealTime(video, net) {
  const canvas = document.getElementById("output");
  const ctx = canvas.getContext("2d");
  var txt = canvas.getContext("2d");
  txt.font = "40px malgun gothic";
  txt.fillStyle = "rgb(255,255,255)";
  // since images are being fed from a webcam, we want to feed in the
  // original image and then just flip the keypoints' x coordinates. If instead
  // we flip the image, then correcting left-right keypoint pairs requires a
  // permutation on all the keypoints.
  const flipPoseHorizontal = true;

  canvas.width = videoWidth;
  canvas.height = videoHeight;

  async function poseDetectionFrame() {
    if (guiState.changeToArchitecture) {
      // Important to purge variables and free up GPU memory
      guiState.net.dispose();
      toggleLoadingUI(true);
      guiState.net = await posenet.load({
        architecture: guiState.changeToArchitecture,
        outputStride: guiState.outputStride,
        inputResolution: guiState.inputResolution,
        multiplier: guiState.multiplier
      });
      toggleLoadingUI(false);
      guiState.architecture = guiState.changeToArchitecture;
      guiState.changeToArchitecture = null;
    }

    if (guiState.changeToMultiplier) {
      guiState.net.dispose();
      toggleLoadingUI(true);
      guiState.net = await posenet.load({
        architecture: guiState.architecture,
        outputStride: guiState.outputStride,
        inputResolution: guiState.inputResolution,
        multiplier: +guiState.changeToMultiplier,
        quantBytes: guiState.quantBytes
      });
      toggleLoadingUI(false);
      guiState.multiplier = +guiState.changeToMultiplier;
      guiState.changeToMultiplier = null;
    }

    if (guiState.changeToOutputStride) {
      // Important to purge variables and free up GPU memory
      guiState.net.dispose();
      toggleLoadingUI(true);
      guiState.net = await posenet.load({
        architecture: guiState.architecture,
        outputStride: +guiState.changeToOutputStride,
        inputResolution: guiState.inputResolution,
        multiplier: guiState.multiplier,
        quantBytes: guiState.quantBytes
      });
      toggleLoadingUI(false);
      guiState.outputStride = +guiState.changeToOutputStride;
      guiState.changeToOutputStride = null;
    }

    if (guiState.changeToInputResolution) {
      // Important to purge variables and free up GPU memory
      guiState.net.dispose();
      toggleLoadingUI(true);
      guiState.net = await posenet.load({
        architecture: guiState.architecture,
        outputStride: guiState.outputStride,
        inputResolution: +guiState.changeToInputResolution,
        multiplier: guiState.multiplier,
        quantBytes: guiState.quantBytes
      });
      toggleLoadingUI(false);
      guiState.inputResolution = +guiState.changeToInputResolution;
      guiState.changeToInputResolution = null;
    }

    if (guiState.changeToQuantBytes) {
      // Important to purge variables and free up GPU memory
      guiState.net.dispose();
      toggleLoadingUI(true);
      guiState.net = await posenet.load({
        architecture: guiState.architecture,
        outputStride: guiState.outputStride,
        inputResolution: guiState.inputResolution,
        multiplier: guiState.multiplier,
        quantBytes: guiState.changeToQuantBytes
      });
      toggleLoadingUI(false);
      guiState.quantBytes = guiState.changeToQuantBytes;
      guiState.changeToQuantBytes = null;
    }

    // Begin monitoring code for frames per second
    stats.begin();

    let poses = [];
    let minPoseConfidence;
    let minPartConfidence;
    switch (guiState.algorithm) {
      case "single-pose":
        const pose = await guiState.net.estimatePoses(video, {
          flipHorizontal: flipPoseHorizontal,
          decodingMethod: "single-person"
        });
        poses = poses.concat(pose);
        minPoseConfidence = +guiState.singlePoseDetection.minPoseConfidence;
        minPartConfidence = +guiState.singlePoseDetection.minPartConfidence;
        break;
      case "multi-pose":
        let all_poses = await guiState.net.estimatePoses(video, {
          flipHorizontal: flipPoseHorizontal,
          decodingMethod: "multi-person",
          maxDetections: guiState.multiPoseDetection.maxPoseDetections,
          scoreThreshold: guiState.multiPoseDetection.minPartConfidence,
          nmsRadius: guiState.multiPoseDetection.nmsRadius
        });
        poses = poses.concat(all_poses);
        minPoseConfidence = +guiState.multiPoseDetection.minPoseConfidence;
        minPartConfidence = +guiState.multiPoseDetection.minPartConfidence;
        break;
    }
    ctx.clearRect(0, 0, videoWidth, videoHeight);

    if (guiState.output.showVideo) {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-videoWidth, 0);
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      ctx.restore();
    }

    // For each pose (i.e. person) detected in an image, loop through the poses
    // and draw the resulting skeleton and keypoints if over certain confidence
    // scores
    if (recorded) {
      recordedPoses.push(poses[0]);
    }

    poses.forEach(({ score, keypoints }) => {
      if (score >= minPoseConfidence) {
        if (guiState.output.showPoints) {
          drawKeypoints(keypoints, minPartConfidence, ctx);
        }
        if (guiState.output.showSkeleton) {
          drawSkeleton(keypoints, minPartConfidence, ctx);
        }
        if (guiState.output.showBoundingBox) {
          drawBoundingBox(keypoints, ctx);
        }
      }
    });
    
    if (poses[0]['keypoints'][15]['score']>0.5&&sitdown(poses[0])==1)
    {
      txt.font = "40px malgun gothic";
      txt.fillStyle = "rgba(255,0,255,1)";
      txt.fillText("Sit Down",poses[0]['keypoints'][0]['position']['x'],poses[0]['keypoints'][0]['position']['y']);
    }
    
    if (poses[0]['keypoints'][10]['score']>0.5&&right_handsup(poses[0])==1)
    {
      txt.font = "40px malgun gothic";
      txt.fillStyle = "rgba(255,0,255,1)";
      txt.fillText("small Hand up",poses[0]['keypoints'][10]['position']['x'],poses[0]['keypoints'][10]['position']['y']);
    }
    else if (poses[0]['keypoints'][10]['score']>0.5&&right_handsup(poses[0])==2)
    {
      txt.font = "40px malgun gothic";
      txt.fillStyle = "rgba(255,0,255,1)";
      txt.fillText("BBBBBBIIIG Hand up",poses[0]['keypoints'][10]['position']['x'],poses[0]['keypoints'][10]['position']['y']);
    }
    if (poses[0]['keypoints'][9]['score']>0.5&&left_handsup(poses[0])==1)
    {
      txt.font = "40px malgun gothic";
      txt.fillStyle = "rgba(255,0,255,1)";
      txt.fillText("small Hand up",poses[0]['keypoints'][9]['position']['x'],poses[0]['keypoints'][9]['position']['y']);
    }
    else if (poses[0]['keypoints'][9]['score']>0.5&&left_handsup(poses[0])==2)
    {
      txt.font = "40px malgun gothic";
      txt.fillStyle = "rgba(255,0,255,1)";
      txt.fillText("BBBBBIIIIIG Hand up",poses[0]['keypoints'][9]['position']['x'],poses[0]['keypoints'][9]['position']['y']);
    }

    if (poses[0]['keypoints'][9]['score']>0.5&&sangsang(poses[0])==1)
    {
      txt.font = "40px malgun gothic";
      txt.fillStyle = "rgba(255,0,255,1)";
      txt.fillText("상상도 못한 정체 !!!!",poses[0]['keypoints'][9]['position']['x'],poses[0]['keypoints'][0]['position']['y']);
    }
    
    whereGround(poses[0]);

    txt.font = "20px malgun gothic";
    txt.fillStyle = "rgba(255,0,0,1)";
    txt.fillText("여기가 바닥 여기가 바닥 여기가 바닥 여기가 바닥",20,ground_val);
    console.log(ground_val);

    
    // End monitoring code for frames per second
    stats.end();

    requestAnimationFrame(poseDetectionFrame);
    
    
  }

  poseDetectionFrame();
}

let recordedPoses = [];
let recorded = false;

function startRecord() {
  console.log("start record...");
  recordedPoses = [];
  recorded = true;
}

function stopRecord() {
  console.log(JSON.stringify(recordedPoses));
  console.log(recordedPoses.length + " recorded");

  console.log("stop record...");
}

async function setupRecord() {
  let c = 0;
  document
    .getElementById("record-button")
    .addEventListener("click", async () => {
      // const model = await tf.loadLayersModel(model);
      // model.summary();
      setTimeout(() => {
        startRecord();
        setTimeout(() => {
          stopRecord();
        }, 20 * 1000);
      }, 1000);
    });
}

/**
 * Kicks off the demo by loading the posenet model, finding and loading
 * available camera devices, and setting off the detectPoseInRealTime function.
 */
export async function bindPage() {
  toggleLoadingUI(true);
  const net = await posenet.load({
    architecture: guiState.input.architecture,
    outputStride: guiState.input.outputStride,
    inputResolution: guiState.input.inputResolution,
    multiplier: guiState.input.multiplier,
    quantBytes: guiState.input.quantBytes
  });
  toggleLoadingUI(false);

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

  setupGui([], net);
  setupRecord();
  setupFPS();

  detectPoseInRealTime(video, net);
}

navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;
// kick off the demo
bindPage();
