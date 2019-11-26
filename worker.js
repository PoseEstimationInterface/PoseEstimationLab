import * as estimation from "pose-estimation-lib.js/dist/src/estimation";
import "babel-polyfill";

self.onmessage = function(e) {
  if (e.data.method === "init") {
    estimation.initialize().then(() => {
      setInterval(() => {
        estimation
          .estimatePoses(e.data.video, true)
          .then(poses => this.postMessage(poses));
      }, 100);
    });
  }
};
