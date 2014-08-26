'use strict';
// init
var qrScanner = null,
    stratDrawID = null;
const WIDTH = 160;
const HEIGHT = 120;

window.addEventListener('load', function init (argument) {
  qrScanner = new QRScanner();
});

function QRScanner() {
  this.paintPad = document.getElementById('paintPad');
  this.cameraSource = document.getElementById('cameraSource');
  this.videoSource = document.getElementById('videoSource');
  this.switcher = document.getElementById('switcher');
  this.consoleBox = document.getElementById('consoleBox');
  this.myCamera = null;
  this.currentVideo = null;
  // mode === 0 then use videoSource
  // mode === 1 then uses cameraSource
  this.mode = 1;

  this.switcher.addEventListener('click', this.changeMode.bind(this));
}

QRScanner.prototype = {
  changeMode: function qr_changeMode() {
    console.log('pizza:' + this.mode);
    this.mode = (this.mode +1) % 2;
    var msg = 'Use Video Source';
    // stop current video
    this.stopVideo();
    switch (this.mode) {
      case 0:
        this.currentVideo = this.videoSource;
        break;
      case 1:
        this.currentVideo = this.cameraSource;
        msg = 'Use Camera Source';
        break;
      default:
        this.currentVideo = this.videoSource;
        break;
    }
    if (this.currentVideo !== null) {
      this.playVideo();
    }
    this.consoleBox.innerHTML = msg;
  },

  releaseCamera: function qr_releaseCamera() {
    // releaseCamera
    function onReleasedCamera() {
      console.log("The camera is now free to be used by another Apps");
    }
    if (this.myCamera) {
      this.myCamera.release(onReleasedCamera);
      this.myCamera = null;
    }
  },

  setupCamera: function qr_setupCamera(callback) {
    var camera = navigator.mozCameras.getListOfCameras()[0];
    var self = this;
    var options = {
      mode: 'picture',
      recorderProfile: 'jpg',
      previewSize: {
        width: WIDTH,
        height: HEIGHT
      }
    };

    function onAccessCamera(camera) {
      self.myCamera = camera;
      self.currentVideo.mozSrcObject = self.myCamera;
      if (callback) {
        callback();
      }
    };

    function onError(error) {
      console.warn(error);
    };
    navigator.mozCameras.getCamera(camera, options, onAccessCamera, onError);
  },

  stopVideo: function qr_stopVideo() {
    if (this.currentVideo === null) {
      return;
    }
    clearInterval(stratDrawID);
    this.currentVideo.removeEventListener('play', this.drawCanvas.bind(this));
    this.currentVideo.pause();
    this.clearCanvas();

    if (this.myCamera) {
      this.releaseCamera();
    }
  },

  playVideo: function qr_playVideo() {
    var self = this;
    function _playVideo() {
      self.currentVideo.addEventListener('play', self.drawCanvas.bind(self));
      self.currentVideo.play();
    }
    if (this.mode === 1) {
      this.setupCamera(_playVideo);
    } else {
      _playVideo();
    }
  },

  clearCanvas: function qr_clearCanvas() {
    var context = this.paintPad.getContext("2d");
    context.clearRect(0, 0, WIDTH, HEIGHT);
  },

  drawCanvas: function qr_drawCanvas() {
    var context = this.paintPad.getContext("2d");
    var self = this;
    clearInterval(stratDrawID);
    stratDrawID = setInterval(function(){
      context.drawImage(self.currentVideo, 0, 0, WIDTH, HEIGHT);
    }, 1000);
  }
};
