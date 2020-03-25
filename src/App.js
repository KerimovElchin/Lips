import React from 'react';
import man from './man.jpg';
import {LipsChanger} from './LipsChanger';
import {SketchPicker} from 'react-color';
import Slider from 'rc-slider';
import styled from "styled-components";
import 'rc-slider/assets/index.css';

const Container = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    padding: 1rem;
    display: flex;
    overflow-y: scroll;
    flex-direction: ${window.innerWidth < 1024 ? "column": "row"}
`;

const Tools = styled.div`
    width: ${window.innerWidth > 1024 ? "250px" : "100%"};
    display: flex;
    flex-direction: column;
`;

const InputTitle = styled.div`
    font-size: 20px;
    font-weight: 600;
    font-style: italic;
`;

const ImgContainer = styled.div`
    display: flex;
    width:  ${window.innerWidth > 1024 ? "fit-content": "calc(100% - 1rem)"};
    min-height: ${window.innerWidth > 1024 ? "unset": "fit-content" };
    ${window.innerHeight < 1024 && "margin-top: 3rem;"}
    overflow: scroll;
    
    border: 2px solid #ebebeb;
    padding: 0.5rem;
    border-radius: 5px;
`;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.lipsChangerRef = 'changer';
    this.state = {
      img: props.img || man,
      color: {
        r: 255,
        g: 0,
        b: 0,
        a: 1
      },
      alpha: 0.5,
    }
  }
  async changeImage(e) {
    const file = e.target.files[0];
    this.refs[this.lipsChangerRef].updateImage(URL.createObjectURL(file));
  }
  async onChangeColor({rgb: color}) {
    this.setState({color});
  }
  render() {
    const {img, color, alpha} = this.state;

    return (
      <Container>
        <Tools>
          <form encType="multipart/form-data" method="post">
            <InputTitle>Upload photo</InputTitle>
            <p>
              <input
                type="file"
                name="photo"
                multiple accept="image/*,image/jpeg"
                onChange={this.changeImage.bind(this)}
              />
            </p>
          </form>
          <InputTitle style={{marginTop: "2rem"}}>Choose color</InputTitle>
          <SketchPicker color={color} onChange={this.onChangeColor.bind(this)}/>
          <InputTitle style={{marginTop: "2rem"}}>Alpha = ({alpha})</InputTitle>
          <Slider
            defaultValue={alpha}
            min={0}
            max={1}
            step={0.01}
            included={false}
            marks={{0: "0", 0.5: "0.5", 1: "1"}}
            onAfterChange={alpha=>this.setState({alpha})}
            style={{width: "90%"}}
          />
        </Tools>
        <ImgContainer>
          <LipsChanger ref={this.lipsChangerRef} src={img} color={color} alpha={alpha}/>
        </ImgContainer>
      </Container>
    );
  }
}

export default App;
