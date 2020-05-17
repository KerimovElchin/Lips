const {describe, it} = require("mocha");
const assert = require('assert');
const fetch = require('node-fetch');
const faceApi = require("face-api.js");
const canvas = require("canvas");
var fs = require('fs');

const {Canvas, Image, ImageData} = canvas;
const {pow, sqrt} = Math;

faceApi.env.monkeyPatch({fetch, Canvas, Image, ImageData});

const inputData = JSON.parse(fs.readFileSync(__dirname + '/ans.json', 'utf8'));

const MODEL_URL = __dirname + "/models";

describe('Start test for all cases', function () {
  before(async function() {
    await faceApi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
    await faceApi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  })
  for (const data of inputData) {
    doTest(data);
  }
});

function doTest(data) {
  it(`[${data.srcImg}] should return false when the standard deviation more then allowable error`, async function () {
    const img = await canvas.loadImage(__dirname + '/' + data.srcImg);
    const landmarks = await faceApi.detectAllFaces(img).withFaceLandmarks();

    const upperLip = landmarks[0].landmarks.positions.slice(48, 55)
      .concat(landmarks[0].landmarks.positions.slice(60, 65).reverse())
      .map(({_x, _y}) => ({x: _x, y: _y}));

    const lowerLip = landmarks[0].landmarks.positions.slice(54, 60)
      .concat([landmarks[0].landmarks.positions[48]])
      .concat([landmarks[0].landmarks.positions[60]])
      .concat(landmarks[0].landmarks.positions.slice(64, 68).reverse())
      .map(({_x, _y}) => ({x: _x, y: _y}));

    const libPoints = [...upperLip, ...lowerLip];
    const theoryPoints = [...(data.theoryPoints.upperLip), ...(data.theoryPoints.lowerLip)];

    // Допустимая погрешность
    const allowableError = 20;
    // сумма квадратов всех отклонений по координатам икс и игрик.
    let sumErrors = libPoints.reduce((acc, u, index) => acc + pow(theoryPoints[index].x - u.x, 2) + pow(theoryPoints[index].y - u.y, 2), 0);
    sumErrors /= libPoints.length;

    const standardDeviation = sqrt(sumErrors);
    console.log(standardDeviation);
    assert.equal(standardDeviation < allowableError, true);
  });
}
