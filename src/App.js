import React from 'react';
import './App.css';

import {FaceLandmarks} from './facelandmarks';

function App() {
  return (
    <div className="App">
      <header className="App-header" id="container">
       <form encType="multipart/form-data" method="post">
              <p>
               <b>
                <i> Загрузите фотографию </i>
               </b>
              </p>
              <p>
                  <input
                      type="file"
                      name="photo"
                      multiple accept="image/*,image/jpeg"
                  />
                  <input
                      type="submit"
                      value="Отправить"
                  />
              </p>              
          </form>
        <FaceLandmarks />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
