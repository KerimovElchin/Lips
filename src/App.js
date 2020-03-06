import React from 'react';
import './App.css';

import man from './man.jpg';

import { LipsChanger } from './LipsChanger';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.img = get(props, 'src', man)
    this.color = get(props, 'color', '#f00')
    this.lipsChangerRef = 'changer'

  }

  async changeImage(e) {
    const file = e.target.files[0];
    this.refs[this.lipsChangerRef].updateImage(URL.createObjectURL(file))
  }

  render() {
    return (
      <div className="App">
        <header className="App-header" id="container">
         <form encType="multipart/form-data" method="post">
                <p><b><i> Загрузите фотографию </i></b></p>
                <p>
                    <input
                        type="file"
                        name="photo"
                        multiple accept="image/*,image/jpeg"
                        onChange={this.changeImage.bind(this)}
                    />
                </p>              
          </form>
          <LipsChanger ref={this.lipsChangerRef} src={this.img} color={this.color}/>
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
        </header>
      </div>
    );
  }
}


function get(object, key, default_value) {
  var result = object[key];
  return (typeof result !== "undefined") ? result : default_value;
}

export default App;
