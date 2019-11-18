import * as posenet from "@tensorflow-models/posenet";
import dat from "dat.gui";
import Stats from "stats.js";
import "babel-polyfill";
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

const videoWidth = 1280;
const videoHeight = 720;
const stats = new Stats();


export async function chanho(){
    localStorage.setItem('item',"true");
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
    }
    catch (e) {
        let info = document.getElementById("info");
        info.textContent =
            "this browser does not support video capture," +
            "or this device does not have a camera";
        info.style.display = "block";
        throw e;
    }

    setupGui([], net);
    setupFPS();
    detectPoseInRealTime(video, net);
}




async function loadVideo() {
    const video = await setupCamera();
    video.play();

    return video;
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
