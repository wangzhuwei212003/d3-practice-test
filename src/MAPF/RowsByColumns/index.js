/**
 * Created by zhuweiwang on 19/03/2018.
 *
 * 楼下实验库的实际行列是，8行11列
 *
 * 细分之后，我这边是 22行23列
 */

import React, {Component} from 'react';
import * as d3 from 'd3';
import {Button} from 'antd';
import './index.css';

import CoopAstarFinder from '../finders/HCCoopAstarFinder';
// import CoopAstarFinder from '../finders/CoopAstarFinder';
import Grid from '../core/Grid';

const colorSet = ['#D7263D', '#F46036', '#C5D86D', '#1B998B', '#2E294E'];
const colorSetPath = ['#E16171', '#F78B6C', '#D4E294', '#59B4AA', '#67637E'];
const timeGap = 500;

const rowNum = 30;
const colNum = 23;
const cellW = 50;
const cellH = 30;

class RowsByColumn extends Component {
  constructor(props) {
    super(props);

    this.initialized = false;
    this.nowTimeStep = 0;

    this.unitsNum = 4;
    this.searchDeepth = 15; // 至少是 unit 总数 +1？至少为 5
    // this.searchDeepth = 5; // 至少是 unit 总数 +1？
    this.pathTable = Array(this.unitsNum).fill([]); // test 30 units
    // this.pathTable = [
    //   [],
    //   [],
    //   [],
    //   [],
    // ]; // pathtable 初始化是 全空。
    // this.goalTable = [
    //   [[26, 26], [14, 14]],
    //   [[14, 14], [26, 26]],
    //   [[29, 29], [17, 17]],
    //   [[17, 17], [29, 29]],
    // ];
    // this.goalTable = Array(this.unitsNum).fill(Array(2));
    this.goalTable = [
      [],
      [],
      [],
      [],
    ];
    this.matrixZero = Array(rowNum).fill(Array(colNum).fill(0)); // fast way to create dimensional array?
    // 真正事实上的 matrix 是这个 gridUI

    this.reachGoal = [];

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

    // this.groups = Array(4).fill({
    //   path: this.gridMouseover.append('g'),
    //   position: this.gridMouseover.append('g')
    // });

    this.movingSpot = this.gridMouseover.append('g');

    // 画完地图之后，开始画 pathTable 里面的路径
    // 以及 根据timestep和pathtable来画出当前的运动的spot。
    // 上述的画路径、移动的点，由 button 触发。
  }

  componentDidUpdate() {
    console.log('component did update')
  }

  // 30 * 30 网格数据
  gridDataMax = (reactDom) => {
    //const data = new Array();
    console.log(reactDom);
    //console.log(this);
    const data = []; // this is preferrable
    const matrixData = []; // for later calculate
    let xpos = 1;
    let ypos = 1;
    let click = 0;
    const width = cellW;
    const height = cellH;


    //iterate for rows
    for (let row = 0; row < rowNum; row += 1) {

      data.push([]);
      matrixData.push([]);
      for (let column = 0; column < colNum; column += 1) {
        click = 0;
        //click = Math.round(Math.random()*100);
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

        matrixData[row].push(ob);
        data[row].push({
          x: xpos,
          y: ypos,
          width: width,
          height: height,
          click: click,
          ob: ob
        });
        xpos += width;
      }

      xpos = 1;
      ypos += height;
    }

    reactDom.matrixZero = matrixData;
    return data;
  };

  // Just draw the 30 * 30 grid, no more interaction
  drawGridNotInteractive(gridMouseover, scales) {
    let me = this;
    let inputGoalTable = [
      [],
      [],
      [],
      []
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
    this.goalTable = inputGoalTable;
  }

  // 画出 path table 里的规划好的路径。
  drawPath(scales, pathTable) {
    // --画路径。。--
    // 整体的效果就是 线串着中间有是数字的圆圈，数字就是 timestep。

    // 首先这个 path 是有顺序的，
    //const path = [[3,4],[3,5],[3,6],[4,6],[5,6],[6,6],[6,7]];
    //path = [[3,4],[3,5],[3,6],[4,6],[5,6],[6,6],[6,7]];

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
    // position , circle代表一个个位置，
    // this.groups.position.selectAll('rect').remove(); //画之前首先都删掉
    // this.groups.position.selectAll('circle').remove(); //画之前首先都删掉
    // position number
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

      // let circleData = this.groups.position.append('g').selectAll('circle').data(pathTable[index]);
      // let circles = circleData.enter().append('circle');
      // let circleAttributes = circles
      //     .attr("cx", function (d) {
      //       return scales.x(d[1] + 0.5);
      //     })
      //     .attr("cy", function (d) {
      //       return scales.y(d[0] + 0.5);
      //     })
      //     .attr("r", function (d) {
      //       return 10;
      //     })
      //     .attr("class", "position")
      //     .style("fill", function (d) {
      //       return colorSet[index]
      //     });

      // let circleData = this.groups.position.append('g').selectAll('rect').data(pathTable[index]);
      // let circles = circleData.enter().append('rect');
      // let circleAttributes = circles
      //     .attr("x", function (d) {
      //       return scales.x(d[1]);
      //     })
      //     .attr("y", function (d) {
      //       return scales.y(d[0]);
      //     })
      //     .attr("width", function (d) {
      //       return 25;
      //     })
      //     .attr("height", function (d) {
      //       return 25;
      //     })
      //     .attr("class", "position")
      //     .style("fill", function (d) {
      //       return colorSet[index]
      //     });

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
            //console.log('what is this ', arr[i]);
            //console.log('what is this ', pathTable[index][i]);
            //console.log('the text ele', d === pathTable[index][i]);
            //console.log('the text ele', ((i !== 0) && (d === pathTable[index][i-1])));
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

  }

  testCoop() {
    this.CoopTimer = setTimeout(() => {
      if (!this.initialized) {
        this.initializePathTable();
      }
      const stepStart = Date.now();
      this.replanNextTimeStep();
      const endStep = Date.now();
      console.log('每一步用时', endStep - stepStart);
      // console.log('next step');
      //console.log(this.pathTable);
      //debugger;
      this.testCoop();
    }, timeGap);
  }

  initializePathTable() {
    for (let i = 0; i < this.pathTable.length; i += 1) {
      // this.goalTable 不是空的
      // 假设，pathTable 是一个全空的数组。
      const finder = new CoopAstarFinder();
      const path = finder.findPath(i, this.goalTable, this.searchDeepth + 1, this.pathTable, this.matrixZero, rowNum, colNum);
      if(
          path[path.length-1][0] === this.goalTable[i][1][0] &&
          path[path.length-1][1] === this.goalTable[i][1][1]
      ){
        // 即是当前搜索出的路径中已经包含了终点。记录下这个 index
        this.reachGoal.push(i);
      }
      this.pathTable[i] = path.slice(0, path.length - i); // 当 i = 0 的时候，就是整个 path
    } // end for loop 所以 searchDeepth 必须要比 unit 的个数多。
    this.initialized = true;
    // console.log(this.pathTable); // 这个应该是 search deepth + 1 的长度
    // debugger;
  }

  replanNextTimeStep() {
    // 这个方法里，前提是已经 initialize 过了，假设一个 timestep 的时间留给单个 unit 的 replanning（500 毫秒能算完吗？）。也就是：
    // 1. initialize 整个 path table 之后，timestep为 0；
    // 2. timestep 为0的时候，开始重新规划，单个 unit规划时间暂定为 1个timestep
    // 3. timestep 为1的时候，计算已经完成，更新 path table；
    // 4. timestep 重置为 0；

    if (this.nowTimeStep === 0) {
      /*
       * 1. 找到需要重新规划的 unit
       * 2. 准备路径规划需要的参数
       *    1. optIndex 重规划的小车的 index
       *    2. this.goalTable, 起点 - 终点信息，需要重规划的小车的起点、终点。起点是下一个 timestep 的原来的 path 里的点
       *    3. searchDeepth, 搜索的路径长度
       *    4. _pathTable, 下一个 timestep 开始的 pathtable，记录其他小车的位置信息
       *    5. this.matrixZero, 标识障碍的地图信息
       *    6. rowNum, colNum 总地图的二维数组的行列数
       *
       * 3. replanning 得到新的 path
       * 4. 更新 pathtable
       * 5.
       *
       *
       */
      let searchDeepth = this.searchDeepth;
      let optIndex = 0;
      let optPath = this.pathTable.reduce(function (p, c, cIndex) {
        //optIndex += 1; 这样写不行，会一直都是 index = 3
        if (p.length > c.length) {
          // 当前的 length 更小
          optIndex = cIndex;
          //console.log('p >  c,', optIndex);
          //console.log(cIndex);
        }
        return p.length > c.length ? c : p;
      }, {length: searchDeepth});
      // 已经找到了需要 replanning 的 path；

      // 更新 goalTable，更新 startnode
      let startNode = this.pathTable[optIndex][1]; // 把后面一个点当做 start node 来计算。即是 timestep为 1 的点。
      this.goalTable[optIndex][0] = startNode; // 更新 goalTable 中的起点。

      let _pathTable = JSON.parse(JSON.stringify(this.pathTable)); // deep copy
      for (let i = 0; i < _pathTable.length; i += 1) {
        _pathTable[i].shift(); // 去掉第一个点
      }

      const finder = new CoopAstarFinder();
      const path = finder.findPath(optIndex, this.goalTable, searchDeepth, _pathTable, this.matrixZero, rowNum, colNum);
      if(
          path[path.length-1][0] === this.goalTable[optIndex][1][0] &&
          path[path.length-1][1] === this.goalTable[optIndex][1][1]
      ){
        // 即是当前搜索出的路径中已经包含了终点。记录下这个 index
        this.reachGoal.push(optIndex);
      }

      path.unshift(this.pathTable[optIndex][0]); // 现在这个path 应该就是 search deepth + 一个点。长度是 search deepth + 1
      this.pathTable[optIndex] = path;

      // UI 这一步还是画path table路径，以及显示 timestep 为0 的点。
      // 这个时候是没有改变 timestep 为 0 的位置的
      //
      // 画点，画路径.

      this.drawNextStepMovingSpot(this.nowTimeStep, this.scales, this.pathTable, timeGap);
      this.drawPath(this.scales, this.pathTable);

      this.nowTimeStep += 1;
      // timestep 增加为 1 的时候，unit 已经到上面 path 的起点了。此时 path 已经算好。
      //
      // 把所有的path切掉一个，更新optindex的path。timestep 设为 0.
    } else if (this.nowTimeStep === 1) {
      // 更新 pathtable
      for (let i = 0; i < this.pathTable.length; i += 1) {

        this.pathTable[i].shift(); // 去掉第一个点，这个是真的改变 pathtable，上面的 _pathtable 是用来计算的，用来传参数的。

        let path = this.pathTable[i];
        let goal = this.goalTable[i][1];
        if(
            path[path.length-1][0] === goal[0] &&
            path[path.length-1][1] === goal[1]
        ){
          this.pathTable[i].push(goal);
        }
      }

      //console.log(this.pathTable);
      this.nowTimeStep = 0;

      // 画点，画路径，timestep 为 0 的点，以及路径。
      this.drawNextStepMovingSpot(this.nowTimeStep, this.scales, this.pathTable, timeGap);
    }

  }

  render() {
    return (
        <div ref={ele => this.grid = ele} className="BGRowByCol">
          <Button type="primary" onClick={() => this.testCoop()}>test</Button>
          <br/>
        </div>

    );
  }
}

export default RowsByColumn
