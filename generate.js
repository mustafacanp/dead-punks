const fs = require("fs");
const crypto = require("crypto");
const { createCanvas, loadImage } = require("canvas");

const buildDir = "./build";
const N = 100;
const imageWidth = 24;
const imageHeight = 24;

loadImage("./images/punks.png").then((punks) => {
  let i = 1;
  for (let X = 0; X < N; X++) {
    const startOfX = X * imageWidth;
    for (let Y = 0; Y < N; Y++) {
      const startOfY = Y * imageHeight;
      const canvas = createCanvas(24, 24);
      const context = canvas.getContext("2d");
      // Draw the image to the context
      context.drawImage(
        punks,
        startOfX,
        startOfY,
        imageWidth,
        imageHeight,
        0,
        0,
        imageWidth,
        imageHeight
      );
      // Get image data from context to make computations faster with "Uint8ClampedArray" data type
      const canvasData = context.getImageData(0, 0, imageWidth, imageHeight);
      drawDeadPixel(canvasData, 0, 0);
      updateCanvas(context, canvasData);
      generateImage(canvas, i);
      i++;
    }
  }
});

const drawDeadPixel = (canvasData, startOfX, startOfY) => {
  const x = crypto.randomInt(startOfX, startOfX + imageWidth);
  const y = crypto.randomInt(startOfY, startOfY + imageHeight);

  const i = (x + y * imageWidth) * 4;
  const r = (g = b = 255);

  if (
    canvasData.data[i + 0] === r &&
    canvasData.data[i + 1] === g &&
    canvasData.data[i + 2] === b
  ) {
    // Do not paint over the desired(white) pixel
    return drawDeadPixel(canvasData, x, y);
  } else if (
    canvasData.data[i + 0] === 0 &&
    canvasData.data[i + 1] === 0 &&
    canvasData.data[i + 2] === 0
  ) {
    // Do not paint over the black pixel
    return drawDeadPixel(canvasData, startOfX, startOfY);
  }

  canvasData.data[i + 0] = r;
  canvasData.data[i + 1] = g;
  canvasData.data[i + 2] = b;
  canvasData.data[i + 3] = 255; // alpha value - RGB(A)
};

const updateCanvas = (context, canvasData) => {
  context.putImageData(canvasData, 0, 0);
};

const generateImage = (canvas, i) => {
  const buffer = canvas.toBuffer("image/png");
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }
  fs.writeFileSync(`${buildDir}/${i}.png`, buffer);
  console.log(`${i}.png generated`);
};
