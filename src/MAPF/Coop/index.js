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

    this.nowTimeStep = 0;
    this.pathTable = [
      [[3, 4]],
      [[5, 6],[5, 6]],
      [[7, 8],[7, 8],[7, 8]],
      [[9, 10],[9, 10],[9, 10],[9, 10]],
    ];
    this.searchDeepth = 40;
    this.goalTable = [
      [[3, 4], [13, 14]],
      [[5, 6], [15, 16]],
      [[7, 8], [17, 18]],
      [[9, 10], [19, 20]],
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

    this.groups= [{
      path: this.gridMouseover.append('g'),
      position: this.gridMouseover.append('g')
    },{
      path: this.gridMouseover.append('g'),
      position: this.gridMouseover.append('g')
    },{
      path: this.gridMouseover.append('g'),
      position: this.gridMouseover.append('g')
    },{
      path: this.gridMouseover.append('g'),
      position: this.gridMouseover.append('g')
    }];

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
        .x(function (d) {return scales.x(d[1] + 0.5);}) // 这个里面要有一点变化的是，x 对应的是 col，y 对应的是 row。
        .y(function (d) {return scales.y(d[0] + 0.5);})
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
        .attr("cx", function (d) { return scales.x(d[1] + 0.5); })
        .attr("cy", function (d) { return scales.y(d[0] + 0.5); })
        .attr("r", function (d) { return 10; })
        .attr("class", "position");

    // position number
    const textData = groups.position.selectAll("text").data(path);
    textData.exit().remove();

    const texts = textData.enter().append("text");
    const textAttributes = texts
        .attr("x", function (d) { return scales.x(d[1] + 0.5); })
        .attr("y", function (d) { return scales.y(d[0] + 0.5); })
        .attr("dy", ".31em")
        .text(function(d,i) { return i; })
        .attr("class", "positionNumber");
  }

  // 画出 能够移动、能够显示当前位置的小圈。
  drawNextStepMovingSpot(nowTimeStep, scales, pathTable, duration = 1000) {
    //console.log('next step');

    //判断传进来的参数 timeStep 的合法性
    if(nowTimeStep >= pathTable[0].length){
      console.log('this timeStep is beyond the total timeStep');
      return;
    }

    // if(nowTimeStep === 0){
    //   this.movingSpot.selectAll('circle').data(pathTable)
    //       .enter().append('circle')
    //       .attr("cx", function (d) { return scales.x(d[nowTimeStep][1] + 0.5); })
    //       .attr("cy", function (d) { return scales.y(d[nowTimeStep][0] + 0.5); })
    //       .attr("r", function (d) { return 10; })
    //       .attr("class", "movingSpot");
    //
    //   //this.nowTimeStep += 1;// 这里不做数据上的改变的操作，只是负责显示
    // }else{
    //   this.movingSpot.selectAll('circle').data(pathTable)
    //       .transition()
    //       .attr("cx", function (d) { return scales.x(d[nowTimeStep][1] + 0.5); })
    //       .attr("cy", function (d) { return scales.y(d[nowTimeStep][0] + 0.5); })
    //       .duration(duration);
    //
    //   //this.nowTimeStep += 1;
    // }


      this.movingSpot.selectAll('circle').data(pathTable)
          .enter().append('circle')
          .attr("cx", function (d) { return scales.x(d[nowTimeStep][1] + 0.5); })
          .attr("cy", function (d) { return scales.y(d[nowTimeStep][0] + 0.5); })
          .attr("r", function (d) { return 10; })
          .attr("class", "movingSpot");

      this.movingSpot.selectAll('circle').data(pathTable)
          .transition()
          .attr("cx", function (d) { return scales.x(d[nowTimeStep][1] + 0.5); })
          .attr("cy", function (d) { return scales.y(d[nowTimeStep][0] + 0.5); })
          .duration(duration);

  }

  testCoop(){

    //1. 只要有 unit 走完了一定的步长，开始触发 coopFinder，就把 pathTable里的之前的timestep shift出去，
    // 开始规划的接下来的这一步 timestep 为 0；
    //
    // 更新goaltable里的 start 和 goal（goal 可能不需要更改）；

    // 更新path table，shift掉已经走过的路径；
    // path table里的路径数组不一定是等长的。初始化的 path table 是有梯度的，
    // 此时的梯度我都初始化为wait 是没错的，缺点是可能一开始最差情况要等 n 步（n是unit数量)
    //
    // 除此之外，index、searchDeepth、matrixZero 都是明了的。

    this.CoopTimer = setTimeout(() => {
      this.coopNextTimeStep();
      console.log('next step');
      //console.log(this.pathTable);
      //debugger;
      this.testCoop();
    }, 500);

  }

  coopNextTimeStep(){
    // 更新 timestep，

    // 如果需要重新规划，
    // 1. timestep 归零；
    // 2. unshift掉已经走过的 path table；更新 goalTable
    // 3. 规划，并添加新的path到 path table


    let optIndex = this.pathTable.findIndex((path) => {
      return (path.length - this.nowTimeStep) < 20;
    }); // 得到path剩余长度 < 某个值的时候，该 unit 就需要重新plan了

    if(optIndex === -1){
      // no unit need to replanning
      // 这个 return 是不是能够不要？
      //console.log('不需要重新规划');
    }else{
      // some unit going to replan
      for(let i = 0; i < this.pathTable.length; i +=1){
        //console.log(this.nowTimeStep);

        //this.pathTable[i].shift(); // remove the first element and return the removed ele
        this.pathTable[i] = this.pathTable[i].slice(this.nowTimeStep); // 保留 index 为 nowTimeStep 的值以及以后的值。
        // 那么重新规划的时候 起始点 应该更新为 pathTable[i][0], 也就是之前的 pathTable[i][this.nowTimeStep]
        //console.log(this.pathTable[i]);

        // pathTable 的第一个点应该和 goalTable 里的第一个点相同。。。如果是在一个 timestep 的时间内计算出剩下的路径。
        // 那么其实 goalTable 是不是多余了，直接就从 pathTable 里取就行了？只是第一次的时候没有
        this.goalTable[i][0] = this.pathTable[i][0]; // 更新 goalTable。
      } // end for loop
      // patTable and goalTable is updated ( sliced )

      const finder = new CoopAstarFinder();
      const path = finder.findPath(optIndex, this.goalTable, this.searchDeepth, this.pathTable, this.matrixZero);

      console.log('规划出来的路径： ', path);
      // 不出意外的话，这里会得到一条 path。添加到相对应的 pathTable 里去。
      path.shift(); // the first startNode is duplicate
      this.pathTable[optIndex] = this.pathTable[optIndex].concat(path);

      this.nowTimeStep = 0; // timestep 归零

    } // end else


    // 这里开始，path table 应该是已经更新完毕，剩下的就是根据 pathTable 画出数据，展示数据。
    // for(let i = 0; i < this.pathTable.length; i +=1){
    //   // 开始依次给所有小车 画路径以及移动点
    //   //this.drawPath(i, this.groups[i], this.scales, this.pathTable[i]);
    // }

    this.drawNextStepMovingSpot(this.nowTimeStep, this.scales, this.pathTable, 500);

    this.nowTimeStep += 1;
  }


  render() {
    return (
        <div ref={ele => this.grid = ele} className="instruction">
          <Button type="primary" onClick={() => this.testCoop()} >test</Button>
          <br/>
        </div>

    );
  }
}

export default Coop
