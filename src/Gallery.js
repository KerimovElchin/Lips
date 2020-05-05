import React, {Component} from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 90%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const ImgWrapper = styled.div`
  position: relative;
  width: 30%;
  box-shadow: 0px 11px 10px -5px rgba(0,0,0,0.5);
  margin-bottom: 1rem;
  cursor: pointer;
  
  > img {
    width: 100%;
    height: 100%; 
    object-fit: cover;
    overflow: hidden;
    border-radius: 5px;
  }
`;

class Gallery extends Component {
  render() {
    const {photos, onSelect} = this.props;

    return (
      <Container>
        {photos.map((photo, i) => (
          <ImgWrapper key={i}>
            <img src={photo} onClick={() => onSelect(photo)} alt={"img"}/>
          </ImgWrapper>
        ))}
      </Container>
    );
  }
}

export default Gallery;