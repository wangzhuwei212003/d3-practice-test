/**
 * Created by zhuweiwang on 29/03/2018.
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

  colorSet,
  colorSetPath,

  timeGap
} from '../CoopDispatch/config';

import * as dispatch from '../CoopDispatch/dispatch';
import * as Util from '../core/Util';
import './index.css';

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
        let ob = 0;
        if (row === rowNum - 1 || row === rowNum - 23 && column > 1 && column < colNum - 2) {
          ob = 1;
        }
        if (row > rowNum - 22 && row < rowNum - 2 && column % 2 === 0 && column > 0 && column < colNum - 1) {
          ob = 1;
        }

        if (row === rowNum - 11 && column === 1) {
          // special point
          ob = 1;
        }
        if (row === rowNum - 11 && column === 2) {
          // special point
          ob = 0;
        }
        if (row === rowNum - 10 && column === 3) {
          // special point
          ob = 1;
        }
        if (row === rowNum - 10 && column === 2) {
          // special point
          ob = 0;
        }
        if (row === rowNum - 11 && column === colNum - 2) {
          // special point
          ob = 1;
        }
        if (row === rowNum - 11 && column === colNum - 3) {
          // special point
          ob = 0;
        }
        if (row === rowNum - 10 && column === colNum - 4) {
          // special point
          ob = 1;
        }
        if (row === rowNum - 10 && column === colNum - 3) {
          // special point
          ob = 0;
        }

        if ((column === 0 || column === colNum - 1) && row < rowNum - 1 && row > rowNum - 11) {
          ob = 1;
        }

        if (row === rowNum - 3 && (column === 3 || column === 5 || column === colNum - 4 || column === colNum - 6 )) {
          ob = 1;
        }
        if (row === rowNum - 21 && (column === 5 || column === colNum - 6 )) {
          ob = 1;
        }
        if (row === rowNum - 22 && (column === 2 || column === colNum - 3)) {
          ob = 1;
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

    //reactDom.matrixZero = matrixData; // 这个涉及到后端的matrixZero，0-1矩阵
    dispatch.setMatrixZero(Util.generateMatrix());
    return data;
  };

  drawGridNotInteractive(gridMouseover, scales) {
    let me = this;
    let inputGoalTable = [
      [],
      [],
      [],
      [],
    ];
    // let inputGoalTable = Array(this.unitsNum).fill([]); // fill 和这种写法有这么大区别吗？
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
    //this.goalTable = inputGoalTable; //这里是来输入我所需要的数据，终点。goalTable。
    dispatch.setGoalTable(inputGoalTable); // 更改dispatch里面的数据。
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
          return scales.x(d[nowTimeStep][1] - 1);
        })
        .attr('y', function (d) {
          return scales.y(d[nowTimeStep][0] - 4);
        })
        .attr('width', function (d) {
          return cellW * 3;
        })
        .attr('height', function (d) {
          return cellH * 4;
        })
        .style('fill', 'none')
        .style('stroke-width', '2px')
        .style('stroke', 'red');

    this.movingSpotOuter.selectAll('rect').data(pathTable)
        .transition()
        .attr("x", function (d) {
          return scales.x(d[nowTimeStep][1] - 1);
        })
        .attr("y", function (d) {
          return scales.y(d[nowTimeStep][0] - 3);
        })
        .duration(duration);
  }

  testCoop() {
    this.CoopTimer = setTimeout(() => {
      if (!this.initialized) {
        dispatch.initializePathTable(); // API，更改 dispatch 里的 pathTable。
      }
      const stepStart = Date.now();
      this.initialNextTimeStep();
      const endStep = Date.now();
      console.log('每一步计算用时', endStep - stepStart);

      this.testCoop();
    }, timeGap);
  }

  //那其实每次都是画、算，是不是就直接就 setInterval 就可以了？
  testInterval() {
    this.coopInterval = setInterval(() => {
      this.initialNextTimeStep(); // 画、算。
    }, 1000)
  }

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
    console.log(dispatch.testGet());
    dispatch.testSet();
  }

  render() {
    return (
        <div ref={ele => this.grid = ele} className="RealBGRowByCol">
          <Button type="primary" onClick={() => this.testInterval()}> test </Button>
          <br/>
        </div>
    )
  }
}

export default Visual