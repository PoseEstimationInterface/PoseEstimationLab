import * as estimation from "pose-estimation-lib.js/dist/src/estimation";
import "babel-polyfill"
//import {video} from "./tRexGaemCamera"
//const w = new Worker("./tRexGaemCamera.js");

async function init(){
    console.log("initalize");
    await estimation.initialize();
    console.log("initalize!!!!");

    // w.onmessage = function(event) {
    //     console.log(event.data);
    // };
    return 1;
}
const a = init();

async function detectJump(){
    // if(a != null && a != undefined){
    //     const data = await estimation.estimationPose(vedio, false);
    //     console.log(data);
    // }
    postMessage("test");
    setTimeout(()=>{detectJump()}, 1000);
}
detectJump();
