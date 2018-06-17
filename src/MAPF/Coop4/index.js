/**
 * Created by zhuweiwang on 19/03/2018.
 */
/**
 * Created by zhuweiwang on 12/03/2018.
 */
import React, {Component} from 'react';
import * as d3 from 'd3';
import {Button, Collapse} from 'antd';
import './index.css';

import CoopAstarFinder from '../finders/CoopAstarFinder';

const Panel = Collapse.Panel;
const customPanelStyle = {
  background: '#f7f7f7',
  borderRadius: 4,
  marginBottom: 24,
  border: 0,
  overflow: 'hidden',
};

const colorSet = ['#D7263D', '#F46036', '#2E294E', '#1B998B', '#C5D86D'];
const colorSetPath = ['#E16171', '#F78B6C', '#67637E', '#59B4AA', '#D4E294'];
const timeGap = 200;
const radio = 0.2; // 一定的几率出现障碍，生成地图的时候

const rowNum = 30;
const colNum = 30;
const gridPixelwidth = 760;
const gridPixelheight = 760;
const unitsNum = 5;
const searchDeepth = 50; // searchDeepth 必须至少比 unitNum 大

class Coop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: []
    };

    this.initialized = false;
    this.nowTimeStep = 0;

    this.searchDeepth = searchDeepth; // 至少是 unit 总数 +1？至少为 5
    // this.searchDeepth = 5; // 至少是 unit 总数 +1？
    this.pathTable = Array(unitsNum).fill([]); // test 30 units
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
    // this.goalTable = Array(unitsNum).fill(Array(2));
    // [
    // [start, end],
    // [start, end],
    // ...
    // ]
    this.goalTable = [];
    this.matrixZero = Array(rowNum).fill(Array(colNum).fill(0)); // fast way to create dimensional array?
    this.gridUI = Array(rowNum).fill(Array(colNum).fill(0));
    // 真正事实上的 matrix 是这个 gridUI
    this.makespan = 0;
    this.sumCost = 0;
    this.movingArr = Array(unitsNum).fill(1); // 1表示在移动。一开始的时候，每一个车都是在运动的。sum cost是会增加的。
  }

  componentDidMount() {
    console.log('component did mount');

    this.gridMouseover = d3.select(this.grid)
        .append('svg')
        .attr('width', gridPixelwidth + 'px')
        .attr('height', gridPixelheight + 'px');

    this.scales = {
      x: d3.scaleLinear().domain([0, colNum]).range([0, gridPixelwidth]), // 前面是格子数，后面是实际的 pixel 数。
      y: d3.scaleLinear().domain([0, rowNum]).range([0, gridPixelheight]),
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

    this.goalTableUI = this.gridMouseover.append('g'); // 这个是画出起点和终点。

    // 画完地图之后，开始画 pathTable 里面的路径
    // 以及 根据timestep和pathtable来画出当前的运动的spot。
    // 上述的画路径、移动的点，由 button 触发。
  }

  componentDidUpdate() {
    console.log('component did update')
  }

  // 30 * 30 网格数据 rowNum
  gridDataMax = (reactDom) => {
    const data = []; // this is preferrable
    let xpos = 0;
    let ypos = 0;
    let click = 0;
    const width = 1; // 格子的 pixel 的大小宽度
    const height = 1;
    let aa = [];
    //iterate for rows
    for (let row = 0; row < rowNum; row += 1) {
      aa[row] = [];
      data.push([]);
      for (let column = 0; column < colNum; column += 1) {
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
          // window.aaa += 1;
          // this.gridUI[row][column] = 1; // 这个会有bug，得出来的都是乱码
          aa[row][column] = 1; // 1表示有障碍。

        } else {
          // do nothing
          aa[row][column] = 0;
        }
      }

      xpos = 0;
      ypos += height;
    }
    //console.log(aa);
    this.gridUI = aa; // 这个是整个地图的 matrix 0-1 矩阵。

    return data;
  };

  // Just draw the 30 * 30 grid, no more interaction
  drawGridNotInteractive(gridMouseover, scales) {

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
            .style('stroke', 'rgb(169,138,58)')
        /*.on("mousedown", function (d) {
         console.log('mouse down');
         if (inputGoalTable[0].length < 2) {
         d3.select(this).style('fill', colorSetPath[0]);
         inputGoalTable[0].push([(d.y - 1) / 25, (d.x - 1) / 25]); // push 第一个unit起 / 终点

         } else if (inputGoalTable[1].length < 2) {
         d3.select(this).style('fill', colorSetPath[1]);
         inputGoalTable[1].push([(d.y - 1) / 25, (d.x - 1) / 25]); // push 第一个unit起 / 终点

         } else if (inputGoalTable[2].length < 2) {
         d3.select(this).style('fill', colorSetPath[2]);
         inputGoalTable[2].push([(d.y - 1) / 25, (d.x - 1) / 25]); // push 第一个unit起 / 终点

         } else if (inputGoalTable[3].length < 2) {
         d3.select(this).style('fill', colorSetPath[3]);
         inputGoalTable[3].push([(d.y - 1) / 25, (d.x - 1) / 25]); // push 第一个unit起 / 终点

         }
         })*/;
  }

  randomGoalTable(pairNum = unitsNum) {
    // 接收一个数字代表多少对起点、终点。改变goalTable
    // goalTable [
    // [[startRow, startCol], [goalRow, goalCol]]
    // ...
    // ]
    const _goalTable = [];

    // 连着生成pairNum * 2个数，不能有重叠。pairNum 个起点不能重叠，也不能和障碍重叠。pairNum 个终点不能重叠。
    for (let i = 0; i < pairNum; i += 1) {
      let newPair = []; // 这个应该在for循环里，这句话放在for循环外面就会导致之前的newPair都变成一样的。
      newPair[0] = this.generateValidPoint(_goalTable, "START");
      newPair[1] = this.generateValidPoint(_goalTable, "END");
      // if (newPair[0] && newPair[1]) {
      _goalTable.push(newPair); // 这里会推进来undefined ？
      // _goalTable[i] = newPair; //
      // }
      console.log('一次找点结束，_goalTable', JSON.stringify(_goalTable), 'newPair:', JSON.stringify(newPair));
      // debugger;
    }
    console.log(_goalTable);
    this.goalTable = _goalTable;
    // this.drawGoalTableUI(this.scales, _goalTable);
  }

  generateRandomPoint() {
    let randomRow = Math.floor(Math.random() * Math.floor(rowNum));
    let randomCol = Math.floor(Math.random() * Math.floor(colNum)); // Math.random 范围是 【0， 1）。所以这个范围是【0，29】是可以的，就是index
    console.log([randomRow, randomCol]);
    return [randomRow, randomCol];
  }

  validatePoint(row, col) {
    // 判断生成的点没有在障碍上
    if (this.gridUI[row][col] === 1) {
      return false
    } else {
      return true
    }
  }

  generateValidPoint(goalTable, startOrEnd) {
    // goalTable就是三维数组(已经生成的起点、终点)，startOrEnd可以是 "START""END"
    let can = this.generateRandomPoint();
    let overlayOtherUnits = false; // 检测点之间的重叠
    for (let i = 0; i < goalTable.length; i += 1) {
      if (startOrEnd === "START") {
        if (goalTable[i][0][0] === can[0] && goalTable[i][0][1] === can[1]) {
          console.log('起点有重叠', i);
          console.log('can', can);
          console.log('goalTable', goalTable);
          overlayOtherUnits = true; // 起点行数有重叠
        }
      } else if (startOrEnd === "END") {
        if (goalTable[i][1][0] === can[0] && goalTable[i][1][1] === can[1]) {
          console.log('终点有重叠', i);
          console.log('can', can);
          console.log('goalTable', goalTable);
          overlayOtherUnits = true; // 终点行数有重叠
        }
      } else {
        console.log('unexpect')
      }
    }
    if (this.validatePoint(can[0], can[1]) && !overlayOtherUnits) {
      console.log('判断是合格的can， 返回', can);
      return can;
    } else {
      // return false;
      // this.generateValidPoint(goalTable, startOrEnd); 这种写法会返回 undefined
      return (this.generateValidPoint(goalTable, startOrEnd));
    }
  }

  drawGoalTableUI(scales, goalTable) {
    for (let i = 0; i < goalTable.length; i += 1) {
      let index = i;

      let textData = this.goalTableUI.append('g').selectAll("text").data(goalTable[index]);
      // let textData = this.groups.position.append('g').selectAll("text").data(pathTable[index]); .append('g')不能删掉。
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

            // i === 0 表示是起点，i === 1 表示终点。index应该就是标识第几个小车。
            if (i === 0) {
              return 'S' + index;
            } else {
              return 'G' + index;
            }
          })
          .attr("class", "GoalPositionNumber");
    }

  }

  // 画出 path table 里的规划好的路径。
  drawPath(scales, pathTable) {
    // --画路径。。--
    // 整体的效果就是 线串着中间有是数字的圆圈，数字就是 timestep。目前是没有圈的。

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
    this.CoopTimer = setTimeout(async () => {
      if (!this.initialized) {
        this.initializePathTable();
      }
      const stepStart = Date.now();
      const res = await this.replanNextTimeStep();
      if (res) {
        // this.testCoop();
      }
      this.replanNextTimeStep(); // 这个是关键的一步。循环的就是这一步。
      const endStep = Date.now();
      console.log('每一步用时', endStep - stepStart);
      // console.log('next step');
      //console.log(this.pathTable);
      //debugger;
      //this.testCoop();
    }, timeGap);
  }

  initializePathTable() {
    for (let i = 0; i < this.pathTable.length; i += 1) {
      // 假设，pathTable 是一个全空的数组。
      const finder = new CoopAstarFinder();
      console.log(this.goalTable);
      // console.log(this.pathTable);
      // console.log(this.gridUI);
      //
      // debugger;
      const path = finder.findPath(i, this.goalTable, this.searchDeepth, this.pathTable, this.gridUI, rowNum, colNum);
      // const path = finder.findPath(i, this.goalTable, this.searchDeepth, this.pathTable, this.matrixZero);

      this.pathTable[i] = path.slice(0, path.length - i); // 当 i = 0 的时候，就是整个 path
    } // end for loop 所以 searchDeepth 必须要比 unit 的个数多。
    this.initialized = true;
  }

  replanNextTimeStep(stepStart = 0) {
    // 这个方法里，前提是已经 initialize 过了，假设一个 timestep 的时间留给单个 unit 的 replanning（500 毫秒能算完吗？）。也就是：
    // 1. initialize 整个 path table 之后，timestep为 0；
    // 2. timestep 为0的时候，开始重新规划，单个 unit规划时间暂定为 1个timestep
    // 3. timestep 为1的时候，计算已经完成，更新 path table；
    // 4. timestep 重置为 0；

    if (this.nowTimeStep === 0) {
      // it is time to replanning for unit with the shortest path
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

      // console.log(this.pathTable);
      // console.log('找到需要更新的 path：', optIndex);
      // debugger;

      // 得到 用来计算的 pathtable
      //let _pathTable = [].concat([], this.pathTable); // deep copy, not deep
      let _pathTable = JSON.parse(JSON.stringify(this.pathTable)); // deep copy
      // console.log(this.pathTable);
      // console.log(_pathTable);
      // debugger;
      for (let i = 0; i < _pathTable.length; i += 1) {
        _pathTable[i].shift(); // 去掉第一个点
      }

      // console.log(JSON.parse(JSON.stringify(this.pathTable)));
      // console.log(JSON.parse(JSON.stringify(_pathTable)));
      // debugger;

      // 更新 goalTable，更新 startnode
      let startNode = this.pathTable[optIndex][1]; // 把后面一个点当做 start node 来计算。即是 timestep为 1 的点。

      this.goalTable[optIndex][0] = startNode; // 更新 goalTable 中的起点。

      const finder = new CoopAstarFinder();
      // const path = finder.findPath(optIndex, this.goalTable, searchDeepth, _pathTable, this.matrixZero);
      // console.log('optIndex', JSON.stringify(optIndex), 'this.goalTable', JSON.stringify(this.goalTable));
      // debugger;
      const path = finder.findPath(optIndex, this.goalTable, searchDeepth, _pathTable, this.gridUI, rowNum, colNum);

      path.unshift(this.pathTable[optIndex][0]);
      this.pathTable[optIndex] = path;

      // UI 这一步还是画path table路径，以及显示 timestep 为0 的点。
      // 这个时候是没有改变 timestep 为 0 的位置的
      //
      // 画点，画路径.
      //console.log(this.pathTable);
      //debugger;
      // this.drawNextStepMovingSpot(this.nowTimeStep, this.scales, this.pathTable, timeGap);

      // this.drawPath(this.scales, this.pathTable);


      this.nowTimeStep += 1;
      // timestep 增加为 1 的时候，unit 已经到上面 path 的起点了。此时 path 已经算好。
      this.makespan += 1; // timestep 加一的时候，makespan也加一。
      //
      // 把所有的path切掉一个，更新optindex的path。timestep 设为 0.
      return true
    } else if (this.nowTimeStep === 1) {
      // 更新 pathtable
      for (let i = 0; i < this.pathTable.length; i += 1) {
        // 如果是第一个点已经到达终点了。就认为是已经结束了一个 cost 的累加。
        if (
            this.pathTable[i][0][0] === this.goalTable[i][1][0] &&
            this.pathTable[i][0][1] === this.goalTable[i][1][1]
        ) {
          this.movingArr[i] = 0;
          // console.log(this.movingArr);
        }

        this.sumCost += this.movingArr[i];

        this.pathTable[i].shift(); // 去掉第一个点
      }

      this.nowTimeStep = 0;

      // 画点，画路径，timestep 为 0 的点，以及路径。
      // this.drawNextStepMovingSpot(this.nowTimeStep, this.scales, this.pathTable, timeGap);

      // console.log(this.checkAllGoalReached());
      // 判断一下，如果是所有agent已经到达终点，那么
      if (this.checkAllGoalReached()) {
        console.log('end ');

        console.log('this.makespan', this.makespan, 'this.sumCost', this.sumCost, 'eachStepTimeCost:', Date.now() - stepStart);
        this.state.result.push({
          unitNum: this.goalTable.length,
          finder: "HCA",
          makespan: this.makespan,
          sumCost: this.sumCost,
          eachStepTimeCost: Date.now() - stepStart
        });
        clearTimeout(this.CoopTimer);

        // reset the count data per run
        this.makespan = 0;
        this.sumCost = 0;
        this.movingArr = Array(this.goalTable.length).fill(1); // 1表示在移动。一开始的时候，每一个车都是在运动的。sum cost是会增加的。

        return false
      }
      return true
    }
  }

  checkAllGoalReached() {
    // console.log(this.pathTable, this.goalTable);
    for (let i = 0; i < this.pathTable.length; i += 1) {
      if (
          this.pathTable[i][0][0] !== this.goalTable[i][1][0] ||
          this.pathTable[i][0][1] !== this.goalTable[i][1][1]
      ) {
        return false; // 每一个 agent 的第一个点。[start, end]
      }
    }
    return true;
  }

  generateDataSet = async (totalObservation = 10, maxStep = 100, unitsNum = 5) => {
    // 自动生成实验结果，需要的实验数据。totalObservation 条记录。
    // maxStep 判断失败的最长步数限制

    for (let obIndex = 0; obIndex < totalObservation; obIndex += 1) {
      // 1. 生成若干个起点终点对
      this.randomGoalTable(unitsNum);

      // 2. 开始实时寻路。有一个总的路数的上限，比如10000
      for (let step = 0; step < maxStep; step += 1) {

        if (!this.initialized) {
          this.initializePathTable(); // 不需要units参数
        }
        const stepStart = Date.now();
        const res = await this.replanNextTimeStep(stepStart);
        if (res) {
          if(step === maxStep - 1){
            // 最后的一步都还是没有走到
            console.log('失败一次');
            this.state.result.push({
              unitNum: unitsNum,
              finder: "HCA",
              makespan: 'NA',
              sumCost: 'NA',
              eachStepTimeCost: 'NA'
            });

            // reset the count data per run
            this.makespan = 0;
            this.sumCost = 0;
            this.movingArr = Array(unitsNum).fill(1); // 1表示在移动。一开始的时候，每一个车都是在运动的。sum cost是会增加的。
          }
          continue
        } else {
          break
        }
      }
// console.log('teste')

      // 3. 添加一个observation
    }
  };

  // 这个是供下载成 csv Excel文件的功能。
  // JSONData 是一个数组，里面的元素都是object，object里的键值对都是一个observation的属性。
  // title 是一个文件名称。
  // showLabel 是一个bool值，true标识在最终的文件中保留属性作为第一行。
  JSON2CSV(JSONData, title, showLabel) {
    const arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;

    let CSV = '';

    //CSV += title + '\r\n\n';

    if (showLabel) {
      let row = '';

      for (let property in arrData[0]) {
        row += property + ',';
      }

      row = row.slice(0, -1); // 最后一个逗号去掉。截取

      // append label row with line break
      CSV += row + '\r\n';
    }

    // 1st loop to extract each row
    for (let i = 0; i < arrData.length; i += 1) {
      let row = '';

      // 2nd loop to extract each column and convert it in string comma-seprated
      for (let index in arrData[i]) {
        row += '"' + arrData[i][index] + '",';
      }

      row.slice(0, row.length - 1);

      // add a line break after each row
      CSV += row + '\r\n';
    }

    if (CSV === '') {
      alert('invalid data');
      return;
    }

    //Generate a file name
    let fileName = 'MyReport_';
    fileName += title.replace(/ /g, "_");

    // initialize file format you want csv or xls
    //let uri = 'data:text/csv;charset=utf-8,' + escape(CSV); // 这里为什么会提示 deprecated symbol escape ？
    //let uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(CSV); // 这里为什么会提示 deprecated symbol escape ？
    let uri = 'data:text/csv;charset=utf-8,' + encodeURI(CSV); // 这里为什么会提示 deprecated symbol escape ？

    var link = document.createElement("a");
    link.href = uri;

    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }

  download() {
    this.JSON2CSV(this.state.result, 'Coop4_result', true);
  }

  render() {
    return (
        <div ref={ele => this.grid = ele} className="instruction">
          <p>关闭了点击网格面板设置起点、终点的功能。（没有找到比较好的写法）。直接就是随机下起点、终点。 <br/>
            换行, 如果是要手点手动下任务，就改一改drawGridNotInteractive方法。下面的 coop30的代码和这个一样，没有新的东西 <br/>
            直接改代码 class 上面的几个参数。就能够得到实验数据。TODO：sum of cost 和 makespan 需要计算。
          </p>

          {/*<Collapse>*/}
          {/*<Panel header="README" key="1" style={customPanelStyle}>*/}
          {/*<p>{`关闭了点击网格面板设置起点、终点的功能。（没有找到比较好的写法）。直接就是随机下起点、终点。 \r\n adfasdf  asfsdaf asasdf`}</p>*/}
          {/*</Panel>*/}
          {/*</Collapse>*/}
          <Button type="primary" onClick={() => this.randomGoalTable()}>生成若干个起点终点对，并在图上画出</Button>
          <Button type="primary" onClick={() => this.testCoop()}>开始实时寻路，并画出路径和移动的点</Button>
          <Button type="primary" onClick={() => this.generateDataSet()}>teste</Button>
          <Button type="primary" onClick={() => this.download()}>Download</Button>
          <br/>
        </div>

    );
  }
}

export default Coop
