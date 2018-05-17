/**
 * Created by zhuweiwang on 31/03/2018.
 */

import React, {Component} from 'react';
import * as d3 from 'd3';
import {Button, Form} from 'antd';


import './index.css';
import OdomForm from '../OdomForm';

// const SpecificActionsEnum = {
//   "SA_PIN_OUTSTRETCH": 0,
//   "SA_PIN_RETRIEVE": 1,
//   "SA_ODOM_FORWARD_GROUND_AS_REFERENCE": 2,
//   "SA_ODOM_BACKWARD_GROUND_AS_REFERENCE": 3,
//   "SA_ODOM_UP_GROUND_AS_REFERENCE": 4,
//   "SA_ODOM_DOWN_GROUND_AS_REFERENCE": 5,
//   "SA_TURNING_BEGIN_POINT": 6,
// };

const rowNum = 27;
const colNum = 36;
const cellW = 20;
const cellH = 20;
const BIGCELLTEXT = [
    [25,26,27,28,29],
    [20,21,22,23,24],
    [15,16,17,18,19],
    [10,11,12,13,14],
    [5,6,7,8,9],
    [0,1,2,3,4],
];

const colorSet = ['#D7263D', '#F46036', '#C5D86D', '#1B998B', '#2E294E'];

const OdomFormComponent = Form.create()(OdomForm);

class Visual extends Component {
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

    this.groups = {
      path: this.gridMouseover.append('g'),
      position: this.gridMouseover.append('g')
    };

    this.movingSpot = this.gridMouseover.append('g');
    this.movingSpotOuter = this.gridMouseover.append('g');

    this.auxiliary = this.gridMouseover.append('g');
    this.drawAuxiliary(this.scales);
  }

  componentDidUpdate() {
    console.log('component did update')
  }

  //小格子每个格子的信息，像素坐标、长宽、是否有障碍。
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

  // 大格子的辅助线的信息
  gridDataBigCell() {
    const bigRow = 8;
    const bigCol = 9;

    const data = []; // this is preferrable
    let xpos = 1;
    let ypos = 1;
    const width = 4 * cellW; // 宽度是一样的，高度是可能会变。
    let height = cellH;

    //iterate for rows
    for (let row = 0; row < bigRow; row += 1) {
      data.push([]);
      if (row === 0) {
        height = cellH;
      } else if (row >= 1 && row < bigRow - 1) {
        height = 4 * cellH
      } else {
        height = 2 * cellH;
      }
      for (let column = 0; column < colNum; column += 1) {
        data[row].push({
          x: xpos,
          y: ypos,
          width: width,
          height: height,
        });
        xpos += width;
      }
      xpos = 1;
      ypos += height;
    }
    return data;
  };

  // 画小格子
  drawGridNotInteractive(gridMouseover, scales) {

    const row = gridMouseover.selectAll('.row')
        .data(this.gridDataMax.bind(this, this))
        .enter()
        .append('g');

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

  // 画辅助线、辅助文字
  drawAuxiliary(scales) {
    const row = this.auxiliary.selectAll('.row')
        .data(this.gridDataBigCell())
        .enter()
        .append('g');

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
        .style('fill', colorSet[1])
        .style('stroke', 'blue')
        .style('opacity', '0.6');

    this.auxiliary.selectAll('text').data(this.auxiliaryTextData.bind(this, BIGCELLTEXT))
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
        .attr("class", "cargoBoxNum")
        .text(function (d, i, arr) {
              return d.num;
            }
        );
  }

  auxiliaryTextData(BIGCELLTEXT) {
    const data = []; // this is preferrable
    let xpos = 8; // 0号货位是第8列
    let ypos = 24; // 0号货位是第24列

    // console.log(BIGCELLTEXT);

    //iterate for rows
    for (let row = 0; row < BIGCELLTEXT.length; row += 1) {
      data.push([]);
      for (let column = 0; column < BIGCELLTEXT[0].length; column += 1) {
        data[row].push({
          x: xpos,
          y: ypos,
          num: BIGCELLTEXT[BIGCELLTEXT.length - 1 - row][column]
        });
        xpos += 4;
      }
      xpos = 8;
      ypos -= 4;
    }
    return data;
  }

  render() {

    return (
        <div ref={ele => this.grid = ele}>
          <OdomFormComponent/>
          <br/>
        </div>
    )
  }
}

export default Visual