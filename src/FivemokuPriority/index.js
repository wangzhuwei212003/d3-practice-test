/**
 * Created by zhuweiwang on 2018/6/28.
 */

import React, {Component} from 'react';
import * as d3 from 'd3';
import {Button} from 'antd';
import {
  CalcPriority
} from './calcPriority';
import dispatchConfig from './dispatchConfig';
const {
  rowNum,
  colNum,
} = dispatchConfig;
// } from '../config';
// import './index.css';


// const SpecificActionsEnum = {
//   "SA_PIN_OUTSTRETCH": 0,
//   "SA_PIN_RETRIEVE": 1,
//   "SA_ODOM_FORWARD_GROUND_AS_REFERENCE": 2,
//   "SA_ODOM_BACKWARD_GROUND_AS_REFERENCE": 3,
//   "SA_ODOM_UP_GROUND_AS_REFERENCE": 4,
//   "SA_ODOM_DOWN_GROUND_AS_REFERENCE": 5,
//   "SA_TURNING_BEGIN_POINT": 6,
// };
const cellW = 30;
const cellH = 30;

class FivemokuP extends Component {
  constructor(props) {
    super(props);

  }

  componentDidMount() {
    console.log('component did mount');

    this.gridMouseover = d3.select(this.grid)
        .append('svg')
        .attr('width', `${colNum * cellW}`)
        .attr('height', `${rowNum * cellH}`);

    this.scales = {
      x: d3.scaleLinear().domain([0, colNum]).range([0, colNum * cellW]), // 前面是格子数，后面是实际的 pixel 数。
      y: d3.scaleLinear().domain([0, rowNum]).range([0, rowNum * cellH]),
    };

    //component did mount 之后就开始画整个网格的地图
    this.drawGridNotInteractive(this.gridMouseover, this.scales);

    this.priority = this.gridMouseover.append('g');
    this.drawPriority(this.scales); // 这一步是画优先级。
  }

  componentDidUpdate() {
    console.log('component did update')
  }

  gridDataMax = (reactDom) => {
    const data = []; // this is preferrable
    let xpos = 1;
    let ypos = 1;
    const width = cellW;
    const height = cellH;

    //iterate for rows
    for (let row = 0; row < rowNum; row += 1) {
      data.push([]);
      for (let column = 0; column < colNum; column += 1) {
        let ob = 1; // 0 表示没有障碍，1 表示有障碍。
        // 因为看起来是有障碍的点比较多，默认就是有障碍。

        // 我这边是为了显示的方便，使用的 web 里的坐标系，左上角是（0，0），往右往下变大。
        if (
            (row === 0 && column < colNum - 3) ||
            (row === rowNum - 1 && column < colNum - 3)
        ) {
          // 第一行、最后一行的点，没有障碍的点
          ob = 0;
        }
        if (
            column === 0 ||
            column === colNum - 4

        ) {
          ob = 0; // 第一列，最后一列没有障碍
        }
        if (
            column > 7 &&
            column < colNum - 11 &&
            (column - 8) % 4 === 0
        ) {
          // 中间正常货位部分，没有障碍
          ob = 0;
        }

        data[row].push({
          x: xpos,
          y: ypos,
          width: width,
          height: height,
          ob: ob
        });
        xpos += width;
      }

      xpos = 1;
      ypos += height;
    }

    return data;
  };

  drawGridNotInteractive(gridMouseover, scales) {
    let me = this;
    const gridRef = this.grid;

    const row = gridMouseover.selectAll('.row')
        .data(this.gridDataMax.bind(this, this))
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
          return d.x;
        })
        .attr('y', function (d) {
          return d.y;
        })
        .attr('width', function (d) {
          return d.width;
        })
        .attr('height', function (d) {
          return d.height;
        })
        .style('fill', function (d) {
          if (d.ob) {
            return '#221E39';
          }
          return '#fff';
        })
        .style('stroke', 'rgb(169,138,58)')
        .style('opacity', '0.4');
  }

  priorityTextData() {
    const data = []; // this is preferrable
    let xpos = 0; // 0号货位是第8列
    let ypos = 0; // 0号货位是第24列

    const testData = [];

    //iterate for rows
    for (let row = 0; row < rowNum; row += 1) {
      data.push([]);
      testData.push([]);
      for (let column = 0; column < colNum; column += 1) {
        data[row].push({
          x: xpos,
          y: ypos,
          num: CalcPriority(row, column)
        });
        xpos += 1;

        testData[row].push(CalcPriority(row, column));
      }
      xpos = 0;
      ypos += 1;
    }
    console.log(JSON.stringify(testData));
    return data;
  }

  // 画出 priority，
  drawPriority(scales) {
    this.priority.selectAll('text').data(this.priorityTextData())
        .enter().append('g').selectAll('text')
        .data(function (d) {
          return d;
        })
        .enter().append('text')
        .attr("x", function (d) {
          return scales.x(d.x + 0.2);
        })
        .attr("y", function (d) {
          return scales.y(d.y + 0.8);
        })
        .attr("class", "priorityNum")
        .text(function (d, i, arr) {
              return d.num;
            }
        );
  }

  render() {
    return (
        <div ref={ele => this.grid = ele}>
          <p>格子里是对应的 priority <br/>
            5 模库 priority<br/>
          </p>

          <br/>
        </div>
    )
  }
}

export default FivemokuP