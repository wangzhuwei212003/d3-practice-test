/**
 * Created by zhuweiwang on 10/03/2018.
 */
import React, {Component} from 'react';

import logo from '../logo.svg';
import '../App.css';

import box from '../SvgFile/box.svg';
import marked from '../SvgFile/marked.svg';
import markedBox from '../SvgFile/markedBox.svg';

class Home extends Component {
  render() {
    return (
        <div className="App">
          <header >
            <img src={logo} className="App-logo" alt="logo"/>
            <h1 className="App-title">Welcome to React</h1>
          </header>
          <p className="App-intro">
            这是一个项目，包含了basic A star算法、cooperative path finding算法、不成熟的模拟立体库的算法；<br/>
            包含了一些移植到react里的使用 D3 库的项目，有关路径模拟的。<br/>
            To get started, edit <code>src/App.js</code> and save to reload.
          </p>
          <div className="svg-outer">
            <img src={box} className="box-svg" alt="box"/>
            <img src={markedBox} className="markedBox-svg" alt="marked"/>
            {/*<img src={marked} className="mark-svg mark-delay" alt="marked" />*/}
          </div>
        </div>
    );

  }
}

export default Home;
