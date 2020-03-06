import * as faceapi from 'face-api.js';
import * as React from 'react';
import './hidden.css';


export class LipsChanger extends React.Component {
  constructor(props) {
    super(props)
    this.tempImgId = 'face'
    this.state = {
      imgLoaded: false
    }
    this.modelsLoaded = false
  }

  async showLipsFilled() {
    const canvas = this.refs.canvas
    const ctx = canvas.getContext("2d")
    let img = document.getElementById(this.tempImgId)

    const displaySize = { width: img.width, height: img.height }
    faceapi.matchDimensions(canvas, displaySize)
    
    ctx.drawImage(img, 0, 0)

    let landmarks = await detect(img.id)
    this.drawLips(ctx, landmarks)
  }

  drawLips(ctx, landmarks) {
    const upperLip = landmarks[0].landmarks.positions.slice(48, 55)
        .concat(landmarks[0].landmarks.positions.slice(60, 65).reverse())
    const lowerLip = landmarks[0].landmarks.positions.slice(54, 60)
        .concat([landmarks[0].landmarks.positions[48]])
        .concat([landmarks[0].landmarks.positions[60]])
        .concat(landmarks[0].landmarks.positions.slice(64, 68).reverse())

    ctx.fillStyle = this.props.color;
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
    if (!this.modelsLoaded) {
      await loadModels()
      this.modelsLoaded = true
    }
    let img = document.getElementById(this.tempImgId)
    if (this.state.imgLoaded || img.complete) {
      await this.showLipsFilled()
    }
  }

  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (!this.modelsLoaded) {
      await loadModels()
      this.modelsLoaded = true
    }
    await this.showLipsFilled()
  }


  updateImage(newImg) {
    const canvas = this.refs.canvas
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
    
    let img = document.getElementById(this.tempImgId)
    this.setState({imgLoaded: false})
    img.src = newImg
  }

  render() {
    return (
        <div>
          <canvas ref="canvas" width={0} height={0} />
          <img id={this.tempImgId} ref="face" onLoad={() => {this.setState({imgLoaded: true})}} src={this.props.src} className="hidden" alt='Man face'/>
        </div>
    )
  }
}

async function loadModels()
{
  const MODEL_URL = process.env.PUBLIC_URL + '/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
  ]).catch(error => {
    console.error(error)
  })
}

async function detect(img_id)
{
  return faceapi.detectAllFaces(img_id, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks(true)
}
