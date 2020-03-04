import * as faceapi from 'face-api.js';
import * as React from 'react';
import man from './man.jpg';
import './hidden.css';


export class FaceLandmarks extends React.Component {
  constructor(props) {
    super(props)
    this.img = get(props, 'src', man)
    this.face_id = 'face'
  }

  async findFaceLandmarks() {
    const canvas = this.refs.canvas
    const ctx = canvas.getContext("2d")
    let img = document.getElementById(this.face_id)

    const displaySize = { width: img.width, height: img.height }
    faceapi.matchDimensions(canvas, displaySize)

    ctx.drawImage(img, 0, 0)

    let landmarks = await detect(img.id)
    const resizedResults = faceapi.resizeResults(landmarks, displaySize)
    faceapi.draw.drawDetections(canvas, resizedResults)
    faceapi.draw.drawFaceLandmarks(canvas, resizedResults)

    const upperLip = landmarks[0].landmarks.positions.slice(48, 55)
        .concat(landmarks[0].landmarks.positions.slice(60, 65).reverse())
    const lowerLip = landmarks[0].landmarks.positions.slice(54, 60)
        .concat([landmarks[0].landmarks.positions[48]])
        .concat([landmarks[0].landmarks.positions[60]])
        .concat(landmarks[0].landmarks.positions.slice(64, 68).reverse())

    ctx.fillStyle = '#aaa';
    ctx.beginPath()
    ctx.moveTo(upperLip[0].x, upperLip[0].y)
    for (let i=1; i < upperLip.length-1; i += 1) {
      ctx.lineTo(upperLip[i].x, upperLip[i].y)
    }
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(lowerLip[0].x, lowerLip[0].y)
    for (let i=1; i < lowerLip.length-1; i += 1) {
      ctx.lineTo(lowerLip[i].x, lowerLip[i].y)
    }
    ctx.closePath()
    ctx.fill()
  }

  async componentDidMount() {
    await loadModels()
    await this.findFaceLandmarks()
  }

  async updateImage(newImg) {
    let img = document.getElementById(this.face_id)
    img.src = newImg
    await this.findFaceLandmarks()
  }

  render() {
    return(
        <div>
          <canvas ref="canvas" width={0} height={0} />
          <img id={this.face_id} ref="face" src={man} className="hidden" alt='Man face'/>
        </div>
    )
  }
}

async function loadModels()
{
  const MODEL_URL = process.env.PUBLIC_URL + '/models';
  console.log(MODEL_URL)
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
  ]).catch(error => {
    console.error(error)
  })
}

export async function detect(img_id)
{
  return faceapi.detectAllFaces(img_id, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
}

function get(object, key, default_value) {
  var result = object[key];
  return (typeof result !== "undefined") ? result : default_value;
}