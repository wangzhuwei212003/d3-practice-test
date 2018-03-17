/**
 * Created by zhuweiwang on 12/03/2018.
 */
import React, {Component} from 'react';
import * as d3 from 'd3';
import {Button} from 'antd';
import './index.css';

import CoopAstarFinder from '../finders/CoopAstarFinder';
import Grid from '../core/Grid';

const colorSet = ['#D7263D', '#F46036', '#2E294E', '#1B998B', '#C5D86D'];

class Coop extends Component {
  constructor(props) {
    super(props);

    this.initialized = false;
    this.nowTimeStep = 0;
    this.pathTable = [
      [],
      [],
      [],
      [],
    ]; // pathtable 初始化是 全空。
    this.searchDeepth = 10;
    this.goalTable = [
      [[26, 26], [14, 14]],
      [[14, 14], [26, 26]],
      [[29, 29], [17, 17]],
      [[17, 17], [29, 29]],
    ];
    this.matrixZero = Array(30).fill(Array(30).fill(0)); // fast way to create dimensional array?
    this.gridUI = [];
  }

  componentDidMount() {
    console.log('component did mount');

    this.gridMouseover = d3.select(this.grid)
        .append('svg')
        .attr('width', '760px')
        .attr('height', '760px');

    this.scales = {
      x: d3.scaleLinear().domain([0, 30]).range([0, 750]), // 前面是格子数，后面是实际的 pixel 数。
      y: d3.scaleLinear().domain([0, 30]).range([0, 750]),
    };

    //component did mount 之后就开始画整个网格的地图
    this.drawGridNotInteractive(this.gridMouseover);

    this.groups = {
      path: this.gridMouseover.append('g'),
      position: this.gridMouseover.append('g')
    };

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
    let xpos = 1;
    let ypos = 1;
    let click = 0;
    const width = 25;
    const height = 25;

    //iterate for rows
    for (let row = 0; row < 30; row += 1) {
      data.push([]);

      reactDom.gridUI.push([]);

      for (let column = 0; column < 30; column += 1) {
        click = 0;
        //click = Math.round(Math.random()*100);
        data[row].push({
          x: xpos,
          y: ypos,
          width: width,
          height: height,
          click: click
        });
        xpos += width;

        reactDom.gridUI[row].push(0);
      }

      xpos = 1;
      ypos += height;
    }
    return data;
  };

  // Just draw the 30 * 30 grid, no more interaction
  drawGridNotInteractive(gridMouseover) {
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
          return '#fff'
        })
        .style('stroke', 'rgb(169,138,58)');
  }

  // 画出 path table 里的规划好的路径。
  drawPath(index, groups, scales, path) {
    // --画路径。。--
    // 整体的效果就是 线串着中间有是数字的圆圈，数字就是 timestep。

    // 首先这个 path 是有顺序的，
    //const path = [[3,4],[3,5],[3,6],[4,6],[5,6],[6,6],[6,7]];
    //path = [[3,4],[3,5],[3,6],[4,6],[5,6],[6,6],[6,7]];

    // 这里的 Group 是d3 select 后面加上 append('g')；首先是删除掉之前所有的 path。
    groups.path.selectAll('.path').remove();

    const lineFunction = d3.line()
        .x(function (d) {
          return scales.x(d[1] + 0.5);
        }) // 这个里面要有一点变化的是，x 对应的是 col，y 对应的是 row。
        .y(function (d) {
          return scales.y(d[0] + 0.5);
        })
        .curve(d3.curveLinear);

    const lineGraph = groups.path.append('path')
        .attr('d', lineFunction(path))
        .attr('class', 'path')
        .attr('fill', 'none');

    // position , circle代表一个个位置，
    const circleData = groups.position.selectAll('circle').data(path);
    circleData.exit().remove();
    const circles = circleData.enter().append('circle');
    const circleAttributes = circles
        .attr("cx", function (d) {
          return scales.x(d[1] + 0.5);
        })
        .attr("cy", function (d) {
          return scales.y(d[0] + 0.5);
        })
        .attr("r", function (d) {
          return 10;
        })
        .attr("class", "position");

    // position number
    const textData = groups.position.selectAll("text").data(path);
    textData.exit().remove();

    const texts = textData.enter().append("text");
    const textAttributes = texts
        .attr("x", function (d) {
          return scales.x(d[1] + 0.5);
        })
        .attr("y", function (d) {
          return scales.y(d[0] + 0.5);
        })
        .attr("dy", ".31em")
        .text(function (d, i) {
          return i;
        })
        .attr("class", "positionNumber");
  }

  // 画出 能够移动、能够显示当前位置的小圈。
  drawNextStepMovingSpot(nowTimeStep, scales, pathTable, duration = 500) {
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
      if(!this.initialized){
        this.initializePathTable();
      }
      this.replanNextTimeStep();
      console.log('next step');
      //console.log(this.pathTable);
      //debugger;
      this.testCoop();
    }, 1000);
  }

  initializePathTable(){
    for (let i = 0; i < this.pathTable.length; i += 1) {
      // 假设，pathTable 是一个全空的数组。
      const finder = new CoopAstarFinder();
      const path = finder.findPath(i, this.goalTable, this.searchDeepth, this.pathTable, this.matrixZero);

      this.pathTable[i] = path.slice(0, path.length - i); // 当 i = 0 的时候，就是整个 path
    } // end for loop 所以 searchDeepth 必须要比 unit 的个数多。
    this.initialized = true;
  }

  replanNextTimeStep() {
    // 这个方法里，前提是已经 initialize 过了，假设一个 timestep 的时间留给单个 unit 的 replanning（500 毫秒能算完吗？）。也就是：
    // 1. initialize 整个 path table 之后，timestep为 0；
    // 2. timestep 为0的时候，开始重新规划，单个 unit规划时间暂定为 1个timestep
    // 3. timestep 为1的时候，计算已经完成，更新 path table；
    // 4. timestep 重置为 0；

    if(this.nowTimeStep === 0){
      // it is time to replanning for unit with the shortest path
      let searchDeepth = this.searchDeepth;
      let optIndex = 0;

      let optPath = this.pathTable.reduce(function (p, c, cIndex) {
        //optIndex += 1; 这样写不行，会一直都是 index = 3
        if(p.length > c.length){
          // 当前的 length 更小
          optIndex = cIndex;
          //console.log('p >  c,', optIndex);
          console.log(cIndex);
        }

        return p.length > c.length? c: p;
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
      for (let i =0; i< _pathTable.length; i+=1){
        _pathTable[i].shift(); // 去掉第一个点
      }

      // console.log(JSON.parse(JSON.stringify(this.pathTable)));
      // console.log(JSON.parse(JSON.stringify(_pathTable)));
      // debugger;

      // 更新 goalTable，更新 startnode
      let startNode = this.pathTable[optIndex][1]; // 把后面一个点当做 start node 来计算。即是 timestep为 1 的点。

      this.goalTable[optIndex][0] = startNode; // 更新 goalTable 中的起点。

      const finder = new CoopAstarFinder();
      const path = finder.findPath(optIndex, this.goalTable, searchDeepth, _pathTable, this.matrixZero);

      path.unshift(this.pathTable[optIndex][0]);
      this.pathTable[optIndex] = path;

      // UI 这一步还是画path table路径，以及显示 timestep 为0 的点。
      // 这个时候是没有改变 timestep 为 0 的位置的
      //
      // 画点，画路径.
      console.log(this.pathTable);
      //debugger;
      this.drawNextStepMovingSpot(this.nowTimeStep, this.scales, this.pathTable, 1000);


      this.nowTimeStep +=1;
      // timestep 增加为 1 的时候，unit 已经到上面 path 的起点了。此时 path 已经算好。
      //
      // 把所有的path切掉一个，更新optindex的path。timestep 设为 0.
    }else if(this.nowTimeStep === 1){
      // 更新 pathtable
      for (let i =0; i< this.pathTable.length; i+=1){
        this.pathTable[i].shift(); // 去掉第一个点
      }

      this.nowTimeStep = 0;

      // 画点，画路径，timestep 为 0 的点，以及路径。
      this.drawNextStepMovingSpot(this.nowTimeStep, this.scales, this.pathTable, 1000);
    }

  }

  render() {
    return (
        <div ref={ele => this.grid = ele} className="instruction">
          <Button type="primary" onClick={() => this.testCoop()}>test</Button>
          <br/>
        </div>

    );
  }
}

export default Coop