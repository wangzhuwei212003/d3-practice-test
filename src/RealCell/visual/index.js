/**
 * Created by zhuweiwang on 31/03/2018.
 */

import React, {Component} from 'react';
import * as d3 from 'd3';
import {Button} from 'antd';
import {
  shuttleAmount,
  rowNum,
  colNum,
  cellW,
  cellH,

  BIGCELL,
  BIGCELLTEXT,

  colorSet,
  colorSetPath,

  timeGap,
} from '../config';
import {
  A0
} from '../TestFunction/configDATA';

import * as dispatch from '../dispatch';
import * as Util from '../Finder/core/Util';
import './index.css';

import {
  RCTransform,
  calcTeeth,
  setGoal,
  backToPickUpSite
} from '../TestFunction/RCTransform';

// const SpecificActionsEnum = {
//   "SA_PIN_OUTSTRETCH": 0,
//   "SA_PIN_RETRIEVE": 1,
//   "SA_ODOM_FORWARD_GROUND_AS_REFERENCE": 2,
//   "SA_ODOM_BACKWARD_GROUND_AS_REFERENCE": 3,
//   "SA_ODOM_UP_GROUND_AS_REFERENCE": 4,
//   "SA_ODOM_DOWN_GROUND_AS_REFERENCE": 5,
//   "SA_TURNING_BEGIN_POINT": 6,
// };

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

    dispatch.setMatrixZero(Util.generateMatrix());
    // console.log(data);
    // debugger;
    return data;
  };

  drawGridNotInteractive(gridMouseover, scales) {
    let me = this;
    let inputGoalTable = [];
    for(let i = 1; i<=shuttleAmount; i+=1){
      inputGoalTable.push([]);
    }
    // let inputGoalTable = Array(shuttleAmount).fill([]); // fill 和这种写法有这么大区别吗？
    console.log(inputGoalTable);
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
        .style('opacity', '0.4')
        .on("mousedown", function (d) {
          console.log('mouse down');
          console.log('[row, col]', [(d.y - 1) / cellH, (d.x - 1) / cellW]);

          if (inputGoalTable[0].length < 2) {
            d3.select(this).style('fill', colorSetPath[0]);
            inputGoalTable[0].push([(d.y - 1) / cellH, (d.x - 1) / cellW]); // push 第一个unit起 / 终点
          }
          else if (inputGoalTable[1].length < 2) {
            d3.select(this).style('fill', colorSetPath[1]);
            inputGoalTable[1].push([(d.y - 1) / cellH, (d.x - 1) / cellW]); // push 第一个unit起 / 终点

          } else if (inputGoalTable[2].length < 2) {
            d3.select(this).style('fill', colorSetPath[2]);
            inputGoalTable[2].push([(d.y - 1) / cellH, (d.x - 1) / cellW]); // push 第一个unit起 / 终点

          } else if (inputGoalTable[3].length < 2) {
            d3.select(this).style('fill', colorSetPath[3]);
            inputGoalTable[3].push([(d.y - 1) / cellH, (d.x - 1) / cellW]); // push 第一个unit起 / 终点

          }

        });
    dispatch.setGoalTable(inputGoalTable); // 更改dispatch里面的数据。接收用来路径规划的数据。
    console.log('inputGoalTable', inputGoalTable);
  }

  // 画辅助线、辅助文字
  drawAuxiliary(scales) {
    this.auxiliary.selectAll('rect').data(BIGCELL[5])
        .enter().append('rect')
        .attr('x', function (d, i, arr) {
          return scales.x(i) * 4;
        })
        .attr('y', function (d) {
          return 0;
        })
        .attr('width', function (d) {
          return cellW * 4;
        })
        .attr('height', function (d) {
          return cellH * rowNum;
        })
        .style('fill', 'none')
        .style('stroke-width', '2px')
        .style('stroke', 'grey');

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

  // 画出 path table 里的规划好的路径。
  drawPath(scales, pathTable) {
    const lineFunction = d3.line()
        .x(function (d) {
          return scales.x(d[1] + 0.5);
        }) // 这个里面要有一点变化的是，x 对应的是 col，y 对应的是 row。
        .y(function (d) {
          return scales.y(d[0] + 0.5);
        })
        .curve(d3.curveLinear);

    // 这里的 Group 是d3 select 后面加上 append('g')；首先是删除掉之前所有的 path。
    this.groups.path.selectAll('.path').remove();
    this.groups.position.selectAll("text").remove();

    for (let i = 0; i < pathTable.length; i += 1) {
      let index = i;
      let lineGraph = this.groups.path.append('path')
          .attr('d', lineFunction(pathTable[index]))
          .attr('class', 'path')
          .attr('fill', 'none')
          .style("stroke", function (d) {
            return colorSetPath[index]
          });

      let textData = this.groups.position.append('g').selectAll("text").data(pathTable[index]);
      let texts = textData.enter().append("text");
      let textAttributes = texts
          .attr("x", function (d) {
            return scales.x(d[1] + 0.5);
          })
          .attr("y", function (d) {
            return scales.y(d[0] + 0.5);
          })
          .attr("dy", ".5em")
          // .attr("dy", ".31em")
          .text(function (d, i, arr) {
            if ((i !== 0) && (d[0] === pathTable[index][i - 1][0]) && (d[1] === pathTable[index][i - 1][1])) {
              return;
              // return i-1;
            } else {
              return i;
              // return i;
            }
          })
          .attr("class", "positionNumber");
    }
  }

  // 画出 能够移动、能够显示当前位置的小圈。
  drawNextStepMovingSpot(nowTimeStep, scales, pathTable, duration = timeGap) {
    //console.log('next step');

    //判断传进来的参数 timeStep 的合法性
    if (nowTimeStep >= pathTable[0].length) {
      console.log('this timeStep is beyond the total timeStep');
      return;
    }
    // 这一句是刚开始添加圆圈的时候，其他时候都是下面的一段，没有enter（）的
    this.movingSpot.selectAll('circle').data(pathTable)
        .enter().append('circle')
        .attr("cx", function (d) {
          return scales.x(d[nowTimeStep][1] + 0.5);
        })
        .attr("cy", function (d) {
          return scales.y(d[nowTimeStep][0] + 0.5);
        })
        .attr("r", function (d) {
          return 10;
        })
        .attr("class", "movingSpot")
        .style("fill", function (d, i) {
          return colorSet[i]
        });

    this.movingSpot.selectAll('circle').data(pathTable)
        .transition()
        .attr("cx", function (d) {
          return scales.x(d[nowTimeStep][1] + 0.5);
        })
        .attr("cy", function (d) {
          return scales.y(d[nowTimeStep][0] + 0.5);
        })
        .duration(duration);

    this.movingSpotOuter.selectAll('rect').data(pathTable)
        .enter().append('rect')
        .attr('x', function (d) {
          return scales.x(d[nowTimeStep][1]);
        })
        .attr('y', function (d) {
          return scales.y(d[nowTimeStep][0] - 5);
        })
        .attr('width', function (d) {
          return cellW * 4;
        })
        .attr('height', function (d) {
          return cellH * 6;
        })
        .style('fill', 'none')
        .style('stroke-width', '5px')
        .style('stroke', 'red');

    this.movingSpotOuter.selectAll('rect').data(pathTable)
        .transition()
        .attr("x", function (d) {
          return scales.x(d[nowTimeStep][1]);
        })
        .attr("y", function (d) {
          return scales.y(d[nowTimeStep][0] - 5);
        })
        .duration(duration);
  }

  //那其实每次都是画、算，是不是就直接就 setInterval 就可以了？
  testInterval() {
    this.coopInterval = setInterval(() => {

      const startT = Date.now();
      this.initialNextTimeStep(); // 画、算。
      const endT = Date.now();
      console.log('calculate time: ', endT - startT);
    }, 1000)
  }

  // 向前模拟一步
  testOneStep() {
    this.initialNextTimeStep(); // 画、算，测试用。
  };

  initialNextTimeStep() {
    /*
     * 1. 第一次重新规划后，goalTable、pathtable 都有了，且他们的第一个点相同
     * 2. 画、算（每一次都是画出来然后，再算。）
     *
     */

    dispatch.initialNextTimeStep(); // 应该先算，再画，第一次是要初始化的。

    // 画点，画路径.
    this.drawNextStepMovingSpot(0, this.scales, dispatch.getPathTable(), timeGap);
    this.drawPath(this.scales, dispatch.getPathTable());

  }

  test() {
    console.log('test function occurred');
    //console.log(dispatch.testGet());
    //dispatch.testSet();
  }

  calcTeethTest() {
    console.log('calc teeth and pin action');

    const startT = Date.now();
    // dispatch.calTeethAndPinAction(0, [26,3], [4,8]); // 从起点到 25 号箱位
    dispatch.calTeethAndPinAction(0, [26, 3], [24, 24]); // 从起点到 4 号箱位
    const endT = Date.now();
    console.log('算齿数用时：', endT - startT);
  }

  testIntervalDispatch() {
    dispatch.initializeInterval();
  }

  testClearInterval() {
    dispatch.clearInitialInterval();
  }

  // 大格子转小格子
  testRCTransform(bigRow, bigCol) {
    console.log('bigRow: ', bigRow, 'bigCol: ', bigCol);
    RCTransform({
      horizontal_offset_from_nearest_coordinate: 0,
      vertical_offset_from_nearest_coordinate: 0,
      theoretical_moving_direction: 5, // moving down
      current_row: bigRow,
      current_column: bigCol,
      turning: false
    });
  }

  // 测试所有的目标点向小格子的转换。
  testAllCellTransform() {
    for (let bigRow = 1; bigRow <= 6; bigRow += 1) {
      for (let bigColumn = 2; bigColumn <= 6; bigColumn += 1) {
        //console.log('bigRow: ', bigRow, 'bigColumn: ', bigColumn);
        RCTransform({
          horizontal_offset_from_nearest_coordinate: 0,
          vertical_offset_from_nearest_coordinate: 0,
          theoretical_moving_direction: 5, // moving down
          current_row: bigRow,
          current_column: bigColumn,
          turning: false
        });
      }
    }
  }

  // 测试起点到30个货位的算齿。
  testStartNodeToAllCargoBox() {
    //测试从起点到30个箱位的齿数、action是否正确，
    // 起点位置用标准的odom，终点仅仅是位置报告的两个行列数。
    // 起点默认位置报告是 0，1, 起点转换过来小格子位置报告是 26，4
    for (let bigRow = 1; bigRow <= 6; bigRow += 1) {
      for (let bigColumn = 2; bigColumn <= 6; bigColumn += 1) {
        setGoal(bigRow, bigColumn);
      }
    }
  }

  // 测试所有30个箱位到拣货台的算齿
  testAllCargoBoxToPickUpSite() {
    //测试从 30个箱位 到 起点 的齿数、action是否正确，
    // 起点位置用标准的odom，终点仅仅是拣货台-位置报告的两个行列数。
    // 起点默认位置报告是 0，1, 起点转换过来小格子位置报告是 26，4
    const startT = Date.now();
    for (let bigRow = 1; bigRow <= 6; bigRow += 1) {
      for (let bigColumn = 2; bigColumn <= 6; bigColumn += 1) {
        backToPickUpSite(bigRow, bigColumn);
      }
    }
    const endT = Date.now();
    console.log('计算用时：', endT - startT);
  }

  // 单个箱位到拣货台的总齿数
  testCargoBoxToPickSite(bigRow, bigColumn) {
    const startT = Date.now();
    // 取值范围，row 1-6，col 2-6
    backToPickUpSite(bigRow, bigColumn);
    const endT = Date.now();
    console.log('计算用时：', endT - startT);
  }

  // 特定路径的总齿数
  testCalcTeeth() {
    const path = [
      [15, 8], [16, 8], [17, 8], [18, 8], [19, 8], [20, 8], [21, 8], [22, 8], [23, 8], [24, 8], [24, 8]
    ];
    let distToStop_obj = calcTeeth(path.slice(1, 9));
    let distToStop = distToStop_obj.total_teeth;
    console.log(distToStop);
  }

  // 算特定路径的总齿数
  testBoxTeeth() {
    const path = A0;
    let distToStop_obj = calcTeeth(path, 0);
    let distToStop = distToStop_obj.total_teeth;
    console.log(distToStop);
  }



  render() {
    return (
        <div ref={ele => this.grid = ele}>
          {/*<Button type="primary" onClick={() => this.testInterval()}> 连续的向前模拟 </Button>*/}
          <Button type="primary" onClick={() => this.testOneStep()}> 向前模拟一步 </Button>

          {/*<Button type="primary" onClick={() => this.calcTeethTest()}> calc teeth and pin action </Button>*/}
          {/*<Button type="primary" onClick={() => this.testIntervalDispatch()}> initialize interval </Button>*/}
          {/*<Button type="primary" onClick={() => this.testClearInterval()}> clear initialize interval </Button>*/}
          {/*<Button type="primary" onClick={() => this.testRCTransform(2, 0)}> RCTransform! </Button>*/}
          {/*<Button type="primary" onClick={() => this.testCalcTeeth()}> calcTeeth! </Button>*/}
          {/*<Button type="primary" onClick={() => this.testBoxTeeth()}> calcTeeth A0 ! </Button>*/}
          {/*<Button type="primary" onClick={() => this.testAllCellTransform()}> testAllCellTransform ! </Button>*/}
          {/*<Button type="primary" onClick={() => this.testStartNodeToAllCargoBox()}> test StartNode To AllCargoBox*/}
            {/*! </Button>*/}
          {/*<Button type="primary" onClick={() => this.testAllCargoBoxToPickUpSite()}> test AllCargoBox To*/}
            {/*PickUpSite! </Button>*/}
          {/*<Button type="primary" onClick={() => this.testCargoBoxToPickSite(1, 2)}> test Single CargoBox To*/}
            {/*PickUpSite! </Button>*/}

          <br/>
        </div>
    )
  }
}

export default Visual