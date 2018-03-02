import React, {Component} from 'react';
import logo from './logo.svg';
import box from './box.svg';
import marked from './marked.svg';
import markedBox from './markedBox.svg';
import './App.css';

import 'antd/dist/antd.css';

import BarChart from './example/BarChart';
import SimpleBarChart from './Tutorials/SimpleBarChart/SimpleBarChart';
import DynamicTable from './Tutorials/DynamicTable/DynamicTable';
import Grid from './Tutorials/MakeGrid';
import Mower from './Tutorials/mowerDemo';
import Tetris from './Tutorials/Tetris';

import Test from './example/Test';


class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>

        <div className="svg-outer">
          <img src={box} className="box-svg" alt="box" />
          <img src={markedBox} className="markedBox-svg"  alt="marked" />
          {/*<img src={marked} className="mark-svg mark-delay" alt="marked" />*/}
        </div>

{/*
        <BarChart data={[5,10,1,3]} size={[500, 500]} />
*/}
        {/*<SimpleBarChart data={[30, 86, 168, 281, 303, 365]} />*/}
        {/*<DynamicTable/>*/}

        {/*<Grid/>*/}
        {/*<Mower/>*/}
        {/*<Tetris/>*/}
      </div>
    );

    // return (
    //     <Tetris/>
    // )

    // return (
    //     <div className="App">
    //
    //       <Mower/>
    //     </div>
    // )
  }
}

export default App;
