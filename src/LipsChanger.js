import * as faceapi from 'face-api.js';
import * as React from 'react';
import styled from "styled-components";

const ERROR_FACE_NOT_FOUND = "ERROR_FACE_NOT_FOUND";

const ResultContainer = styled.div`
  position: relative;
  width: 90%;
  display: flex;
  flex-direction: column;
`;



const ImgContainer = styled.div`
  width: 100%;
  
  ${props => props.invisable && "display: none;"}
`;

export class LipsChanger extends React.Component {
  constructor(props) {
    super(props);
    this.tempImgId = 'face';
    this.modelsLoaded = false;

    this.state = {
      imgLoaded: false,
      needRecognize: true,
      landmarks: null,
      needDraw: true
    };
  }
  async componentDidMount() {
    if (!this.modelsLoaded) {
      await this.loadModels();
      this.modelsLoaded = true
    }

    let img = document.getElementById(this.tempImgId);
    if (this.state.imgLoaded || img.complete) {
      await this.showLipsFilled()
    }

    const {landmarks} = this.state;
    this.drawLips(landmarks);
  }
  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (!this.modelsLoaded) {
      await this.loadModels();
      this.modelsLoaded = true;
    }
    if (this.state.needRecognize) {
      await this.showLipsFilled();
    }
    const {landmarks, needDraw} = this.state;
    if (needDraw) this.drawLips(landmarks);
  }
  getRectBound(points) {
    let maxY = 0,
      minY = window.innerHeight,
      maxX = 0,
      minX = window.innerWidth;

    points.forEach(({_x: x, _y: y}) => {
      if (x > maxX) maxX = x;
      if (x < minX) minX = x;
      if (y > maxY) maxY = y;
      if (y < minY) minY = y;
    });

    return {
      minX,
      minY,
      maxX,
      maxY
    }
  }
  inside(point, vs) {
    const x = point.x, y = point.y;

    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      let xi = vs[i]._x, yi = vs[i]._y;
      let xj = vs[j]._x, yj = vs[j]._y;

      let intersect = ((yi >= y) !== (yj >= y)) && (x <= (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  };
  async showLipsFilled() {
    const {setError} = this.props;
    const canvas = this.refs.canvas;
    if (!canvas) return;
    let img = document.getElementById(this.tempImgId);

    const {width, height} = img;
    const displaySize = { width, height };

    faceapi.matchDimensions(canvas, displaySize);

    const landmarks = await this.detect(img.id);

    if (landmarks.length < 1) {
      this.setState({
        needRecognize: false,
        landmarks: null
      });
      setError(ERROR_FACE_NOT_FOUND);
      return;
    }
    this.setState({
      needRecognize: false,
      landmarks
    });
  }
  drawLips(landmarks) {
    const canvas = this.refs.canvas;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let img = document.getElementById(this.tempImgId);

    const {width, height} = img;
    ctx.drawImage(img, 0, 0, width, height);
    if (!landmarks) return;

    const upperLip = landmarks[0].landmarks.positions.slice(48, 55)
      .concat(landmarks[0].landmarks.positions.slice(60, 65).reverse());

    const lowerLip = landmarks[0].landmarks.positions.slice(54, 60)
      .concat([landmarks[0].landmarks.positions[48]])
      .concat([landmarks[0].landmarks.positions[60]])
      .concat(landmarks[0].landmarks.positions.slice(64, 68).reverse());

    const {color, alpha} = this.props;
    const upperRect = this.getRectBound(upperLip);
    for (let x = Math.round(upperRect.minX); x < Math.round(upperRect.maxX); x++) {
      for (let y = Math.round(upperRect.minY); y < Math.round(upperRect.maxY); y++) {
        if (this.inside({x, y}, upperLip)) {
          const data = this.refs.canvas.getContext('2d').getImageData(x, y, 1, 1).data;
          let r = data[0];
          let g = data[1];
          let b = data[2];
          let a = data[3];
          ctx.fillStyle = "rgba(" + ( r * (1-alpha) + color.r * alpha)+","+ (g*(1-alpha) + color.g*alpha) +","+ (b*(1-alpha) + color.b * alpha)+","+(a * (1-alpha) + color.a * alpha)+")";
          ctx.fillRect(x, y, 1, 1 );
        }
      }
    }

    const lowerRect = this.getRectBound(lowerLip);
    for (let x = Math.round(lowerRect.minX); x < Math.round(lowerRect.maxX); x++) {
      for (let y = Math.round(lowerRect.minY); y < Math.round(lowerRect.maxY); y++) {
        if (this.inside({x, y}, lowerLip)) {
          const data = this.refs.canvas.getContext('2d').getImageData(x, y, 1, 1).data;
          let r = data[0];
          let g = data[1];
          let b = data[2];
          let a = data[3];
          ctx.fillStyle = "rgba(" + ( r * (1-alpha) + color.r * alpha)+","+ (g*(1-alpha) + color.g*alpha) +","+ (b*(1-alpha) + color.b * alpha)+","+(a * (1-alpha) + color.a * alpha)+")";
          ctx.fillRect(x, y, 1, 1 );
        }
      }
    }

    this.setState({needRecognize: false, needDraw: false});
  }
  async detect(img_id) {
    return await faceapi.detectAllFaces(img_id, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true);
  }
  reDraw() {
    this.setState({
      needDraw: true
    })
  }
  async loadModels() {
    const MODEL_URL = process.env.PUBLIC_URL + '/models';
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    ]).catch(error => {
      console.error(error)
    })
  }
  updateImage(newImg) {
    const {setError} = this.props;
    const canvas = this.refs.canvas;
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
    
    let img = document.getElementById(this.tempImgId);
    this.setState({imgLoaded: false, needRecognize: true, needDraw: true});
    setError(null);
    img.src = newImg
  }
  render() {
    const {src} = this.props;
    const {imgLoaded} = this.state;
    return (
      <React.Fragment>
        <ResultContainer>
          {imgLoaded &&
            <ImgContainer>
              <canvas ref="canvas"/>
            </ImgContainer>
          }
        </ResultContainer>
        <ImgContainer invisable>
          <img
            id={this.tempImgId}
            ref="face"
            src={src}
            alt='Man face'
            onLoad={() => {this.setState({imgLoaded: true})}}
          />
        </ImgContainer>
      </React.Fragment>

    )
  }
}

