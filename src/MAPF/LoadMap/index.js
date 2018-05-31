/**
 * Created by zhuweiwang on 2018/5/31.
 */

import React, {Component} from 'react';
import * as d3 from 'd3';
import {Button} from 'antd';
import './index.css';

import mapDAO from './Maps/den520d.txt';

const colorSet = ['#D7263D', '#F46036', '#2E294E', '#1B998B', '#C5D86D'];
const colorSetPath = ['#E16171', '#F78B6C', '#67637E', '#59B4AA', '#D4E294'];
const timeGap = 500;
const radio = 0.05; // 一定的几率出现障碍，生成地图的时候

const rowNum = 30;
const colNum = 30;

class LoadMap extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log('component did mount');

    this.gridMouseover = d3.select(this.grid)
        .append('svg')
        .attr('width', '1000px')
        .attr('height', '1000px');

    this.scales = {
      x: d3.scaleLinear().domain([0, 256]).range([0, 800]), // 前面是格子数，后面是实际的 pixel 数。
      y: d3.scaleLinear().domain([0, 256]).range([0, 800]),
    };

    //component did mount 之后就开始画整个网格的地图
    this.drawGridNotInteractive(this.gridMouseover, this.scales);

    this.groups = {
      path: this.gridMouseover.append('g'),
      position: this.gridMouseover.append('g')
    };
  }

  componentDidUpdate() {
    console.log('component did update')
  }

  // 30 * 30 网格数据
  gridDataMax = (reactDom) => {
    //const data = new Array();
    // console.log(reactDom);
    //console.log(this);
    const data = []; // this is preferrable
    let xpos = 1;
    let ypos = 1;
    let click = 0;
    const width = 25;
    const height = 25;
    //iterate for rows
    for (let row = 0; row < 30; row += 1) {
      data.push([]);
      for (let column = 0; column < 30; column += 1) {
        click = 0;
        //click = Math.round(Math.random()*100);
        let obIntheWay = Math.random() < radio;
        data[row].push({
          x: xpos,
          y: ypos,
          width: width,
          height: height,
          click: click,
          ob: obIntheWay
        });
        xpos += width;

        if (obIntheWay) {

        } else {
          // do nothing
        }
      }

      xpos = 1;
      ypos += height;
    }
    return data;
  };

  // load Dragon Age Origin map
  loadDAOMap(){
    console.log("loadDAOMap occur");
    console.log(mapDAO);
    const regS = new RegExp("\\@|O|T", "g");
    const regS2 = new RegExp("\\.|G|S|W", "g");

    const map2 = mapDAO.replace(regS, 1); // 1 means not passable
    const map3 = map2.replace(regS2, 0); // 1 means not passable
    console.log(map3);

    const lines = map3.split('\n');
    console.log(lines);

    console.log(Array.from(lines[10]));

    const result = [];
    for(let startLine = 4; startLine <= lines.length - 1; startLine+=1){
      result.push(Array.from(lines[startLine]));
    }

    const data = []; // this is preferrable
    let xpos = 1;
    let ypos = 1;
    let click = 0;
    const width = 1;
    const height = 1;
    //iterate for rows
    for (let row = 0; row < result.length; row += 1) {
      data.push([]);
      for (let column = 0; column < result[0].length; column += 1) {
        let obIntheWay = result[row][column] === "1";
        data[row].push({
          x: xpos,
          y: ypos,
          width: width,
          height: height,
          ob: obIntheWay
        });
        xpos += width;
      }
      xpos = 1;
      ypos += height;
    }
    return data;
  }

  // Just draw the 30 * 30 grid, no more interaction
  drawGridNotInteractive(gridMouseover, scales) {

    const row = gridMouseover.selectAll('.row')
        .data(this.loadDAOMap.bind(this, this))
        // .data(this.gridDataMax.bind(this, this))
        .enter()
        .append('g')
        .attr('class', 'row');

    const column = row.selectAll('.square')
        .data(function (d) {
          //console.log(d); // this data will be a 1 dimension array of each row .
          return d;
        })
        .enter()
        .append('rect')
        .attr('class', 'square')
        .attr('x', function (d) {
          //console.log(d); //this data is the only object for each cell. 每一次 enter()之后,数组会降维一次。
          return scales.x(d.x);
        })
        .attr('y', function (d) {
          return scales.y(d.y);
        })
        .attr('width', function (d) {
          return scales.x(d.width);
        })
        .attr('height', function (d) {
          return scales.y(d.height);
        })
        .style('fill', function (d) {
          if (d.ob) {
            return '#221E39'
          } else {
            return '#fff'
          }
        })
        .style('stroke', 'rgb(169,138,58)');
  }

  render() {
    return (
        <div ref={ele => this.grid = ele} className="instruction">
          <Button type="primary" onClick={() => this.loadDAOMap()}>test</Button>
          <br/>
        </div>

    );
  }
}

export default LoadMap
