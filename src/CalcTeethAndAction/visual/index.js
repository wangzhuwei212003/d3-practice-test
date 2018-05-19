/**
 * Created by zhuweiwang on 2018/5/18.
 */
import React, {Component} from 'react';
import * as d3 from 'd3';
import {Button, Form} from 'antd';
import './index.css';
import {
  rowNum,
  colNum,
  cellW,
  cellH,
  BIGCELLTEXT,
  bigRowNum,
  bigColNum,

  colorSet,

  origin,
  wheel_to_chain,
  divideCell,
} from '../config_V3';
// } from '../configTeeth';

import {
  setGoal,
  goToPickUpSite,
  preGoUp,
  preShutdownGoDown
} from '../testFunction/setGoal';
import {CellToTeeth} from '../testFunction/CellToTeeth';

const SpecificActionsEnum = {
  "SA_PIN_OUTSTRETCH": 0,
  "SA_PIN_RETRIEVE": 1,
  "SA_ODOM_FORWARD_GROUND_AS_REFERENCE": 2,
  "SA_ODOM_BACKWARD_GROUND_AS_REFERENCE": 3,
  "SA_ODOM_UP_GROUND_AS_REFERENCE": 4,
  "SA_ODOM_DOWN_GROUND_AS_REFERENCE": 5,
  "SA_TURNING_BEGIN_POINT": 6,
};

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
          ob: ob,
          row: row,
          column: column,
          teeth: ob === 0 ? CellToTeeth(row, column) : 0,
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

    const rowText = gridMouseover.selectAll('.rowText')
        .data(this.gridDataMax.bind(this, this))
        .enter()
        .append('g');
    const columnText = row.selectAll('.text')
        .data(function (d) {
          return d;
        })
        .enter().append('text')
        .attr("x", function (d) {
          return scales.x(d.column + 0.2);
        })
        .attr("y", function (d) {
          return scales.y(d.row + 0.8);
        })
        .text(function (d, i, arr) {
          if (d.teeth !== 0) return d.teeth;
        });
  }

  // 大格子的辅助线的信息，即是按照大格子的分法，画出大格子边界
  gridDataBigCell() {
    const data = []; // this is preferrable
    let xpos = 1;
    let ypos = 1;
    const width = divideCell * cellW; // 宽度4小格，宽度是一样的，高度是可能会变。
    let height = cellH;

    //iterate for rows
    for (let row = 0; row < bigRowNum; row += 1) {
      data.push([]);
      if (row === 0) {
        height = cellH;
      } else if (row >= 1 && row < bigRowNum - 1) {
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

  // 画辅助线、辅助文字，即是大格子。
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

  // 根据货位数字，算出每个数字的 UI显示属性。
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

  startPointToSingleBoxPoint(rowInput, colInput) {
    console.info(`起点到${rowInput}行${colInput}列货位.`);

    const goingUp = false;
    const pathInfo = setGoal(rowInput, colInput, SpecificActionsEnum["SA_ODOM_DOWN_GROUND_AS_REFERENCE"], wheel_to_chain, goingUp, origin, 0);
    // console.log(pathInfo);
  }

  startPointToAllBoxPoint() {
    console.info(`起点到${BIGCELLTEXT.length * BIGCELLTEXT[0].length}个货位.`);
    for (let row = 0; row < BIGCELLTEXT.length; row += 1) {
      for (let col = 0; col < BIGCELLTEXT[0].length; col += 1) {
        console.log('目标箱位行列数：', row + 1, col + 2);
        this.startPointToSingleBoxPoint(row + 1, col + 2);
        // debugger;
      }
    }
  }

  allBoxPointToStartPoint() {
    console.info(`{BIGCELLTEXT.length * BIGCELLTEXT[0].length}个货位到起点.`);
    for (let row = 0; row < BIGCELLTEXT.length; row += 1) {
      for (let col = 0; col < BIGCELLTEXT[0].length; col += 1) {
        console.log('目标箱位行列数：', row + 1, col + 2);
        //this.startPointToSingleBoxPoint(row + 1, col + 2);
      }
    }
  }

  render() {
    return (
        <div ref={ele => this.grid = ele}>
          <p>货位算总齿数、actions，{BIGCELLTEXT.length}行{BIGCELLTEXT[0].length}列</p>
          <Button onClick={() => this.startPointToSingleBoxPoint(2,2)}>test</Button>

          <Button onClick={this.startPointToAllBoxPoint}>起点到{BIGCELLTEXT.length * BIGCELLTEXT[0].length}个货位</Button>
          <Button>{BIGCELLTEXT.length * BIGCELLTEXT[0].length}个货位到起点</Button>
          <br/>
          <Button>左边（上升列）拣货台到{BIGCELLTEXT.length * BIGCELLTEXT[0].length}个货位</Button>
          <Button>{BIGCELLTEXT.length * BIGCELLTEXT[0].length}个货位到左边拣货台</Button>
          <br/>
          <Button>右边（下降列）拣货台到{BIGCELLTEXT.length * BIGCELLTEXT[0].length}个货位</Button>
          <Button>{BIGCELLTEXT.length * BIGCELLTEXT[0].length}个货位到右边拣货台</Button>
          <br/>
          <Button>{BIGCELLTEXT.length * BIGCELLTEXT[0].length}个货位到顶部停靠点</Button>
          <Button>顶部停靠点到{BIGCELLTEXT.length * BIGCELLTEXT[0].length}个货位</Button>
          <br/>
          <Button>{BIGCELLTEXT.length * BIGCELLTEXT[0].length}个货位互相走，{BIGCELLTEXT.length * BIGCELLTEXT[0].length * BIGCELLTEXT.length * BIGCELLTEXT[0].length}次验算</Button>
          <br/>
        </div>
    )
  }
}

export default Visual