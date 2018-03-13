/**
 * Created by zhuweiwang on 12/03/2018.
 */
import React, {Component} from 'react';
import * as d3 from 'd3';
import {Button} from 'antd';
import './index.css';

import AStarFinder from '../finders/AStarFinder';
import Grid from '../core/Grid';

class BasicAStar extends Component {
  constructor(props) {
    super(props);

    this.inputData = {
      startPoint: null, //[row, col]
      endPoint: null, //[row, col]
      grid:[], // 是 0-1 矩阵，1代表有障碍
    }; // 这句话要放在 constructor 里，componentDidMount 里是执行顺序不对，得出 undefined。

    this.nowTimeStep = 0;
  }

  componentDidMount() {
    console.log('component did mount');

    this.gridMouseover = d3.select(this.grid)
        .append('svg')
        .attr('width', '760px')
        .attr('height', '760px');

    this.scales = {
      x: d3.scaleLinear().domain([0, 30]).range([0, 760]), // 前面是格子数，后面是实际的 pixel 数。
      y: d3.scaleLinear().domain([0, 30]).range([0, 760]),
    };


    console.log(this.gridMouseover);
    this.drawGridMouseover(this.gridMouseover);

    this.groups={
      path: this.gridMouseover.append('g'),
      position: this.gridMouseover.append('g')
    };

    this.movingSpot = this.gridMouseover.append('g');

  }

  componentDidUpdate() {
    console.log('component did update')
  }

  // 生成初始的 matrix，供显示使用以及 input 数据使用。
  gridDataMax = (reactDom) => {
    //const data = new Array();
    console.log(reactDom);
    console.log(this);
    const data = []; // this is preferrable
    let xpos = 1;
    let ypos = 1;
    let click = 0;
    const width = 25;
    const height = 25;

    //iterate for rows
    for (let row = 0; row < 30; row += 1) {
      data.push([]);

      reactDom.inputData.grid.push([]);

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

        reactDom.inputData.grid[row].push(0);
      }

      xpos = 1;
      ypos += height;
    }

    //console.log(data);

    return data;
  };

  drawGridMouseover(gridMouseover) {

    console.log(gridMouseover);

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
          if (d.click % 6 === 0) {
            return '#fff'
          }
          if (d.click % 6 === 1) {
            return 'green'
          }
          if (d.click % 6 === 2) {
            return 'red'
          }
          if (d.click % 6 === 3) {
            return '#838690'
          }
        })
        .style('stroke', '#222')
        .on("mousedown", function (d) {
          console.log('mouse down');
          me.isMouseDown = true;
          if (d.click % 6 === 0) {
            d.click = 1;
            d3.select(this).style('fill', 'green');
            console.log('change to green');
            console.log(d);
            console.log('x: ', (d.x -1)/25, 'y: ', (d.y - 1)/25); // row = y 这里是包含0的，其实是index的意思

            if(!me.inputData.startPoint){
              // 如果是已经有 start point 的话，就不会再次去改变了。即是第一次设置 起始点算话，其他都不算。
              me.inputData.startPoint = [(d.y - 1)/25, (d.x -1)/25];
            }else{
              console.log('已经设置好了起始点。如果需要重新设置，直接刷新界面。')
            }

            console.log(me.inputData);

          } else if (d.click % 6 === 1) {
            d.click = 2;
            d3.select(this).style('fill', 'red');

            console.log('change to red');
            console.log(d);

            me.inputData.endPoint = [(d.y - 1)/25, (d.x -1)/25];

          } else if (d.click % 6 === 2) {
            d.click = 0;
            d3.select(this).style('fill', '#fff');
            console.log('change to white');

            me.inputData.grid[(d.y - 1)/25][(d.x -1)/25] = 0; // 0 代表没有有障碍
          }

        })
        .on("mouseup", function () {
          console.log('mouse up'); // 如果是白色，且不是红色不是绿色，且没有别的绿色，那么就定位为 start point，绿色。
          me.isMouseDown = false;
        })
        .on('mouseover', function (d) {
          if (me.isMouseDown) {
            d.click += 3;
            if (d.click % 6 === 0) {
              d3.select(this).style('fill', '#fff');
              me.inputData.grid[(d.y - 1)/25][(d.x -1)/25] = 0; // 0 代表没有有障碍
            }
            if (d.click % 6 === 1) {
              d3.select(this).style('fill', '#F56C4E')
            }
            if (d.click % 6 === 2) {
              d3.select(this).style('fill', '#2C93E8')
            }
            if (d.click % 6 === 3) {
              d3.select(this).style('fill', '#838690');

              me.inputData.grid[(d.y - 1)/25][(d.x -1)/25] = 1; // 1 代表有障碍
            }
          }
        });
  }

  startPlan() {
    // get the input data: start point, end point, 0-1 matrix,

    // calculate the path, will be [[row, col],[row, col]...[row, col]]

    // draw the path

    // animate the path moving
  }

  animateMoving() {

  }

  drawPath(groups, scales, path) {
    // 首先这个 path 是有顺序的，
    //const path = [[3,4],[3,5],[3,6],[4,6],[5,6],[6,6],[6,7]];
    //path = [[3,4],[3,5],[3,6],[4,6],[5,6],[6,6],[6,7]];

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

  getInputData(){
    // console.log('get input data');
    // console.log(this.inputData);

    if(!this.inputData.startPoint || !this.inputData.endPoint){
      //console.log('no start point or end point');
      return
    }
    this.calculatePath();

    //this.drawPath(this.groups, this.scales);

    // const startPoint = d3.select('.instruction svg').selectAll('g').selectAll('rect[style = "fill: #fff;"]');
    // console.log(d3.select(this.grid));
    // console.log(startPoint); 本来是想 通过 style 来选出相对应的格子，但是有点陌生，以后有时间再花在这个上面吧
  }

  calculatePath(){
    // 现在目前来是实现 A star
    const startRow = this.inputData.startPoint[0],
        startCol = this.inputData.startPoint[1],
        endRow = this.inputData.endPoint[0],
        endCol = this.inputData.endPoint[1];

    const matrix = this.inputData.grid;
    const height = matrix.length;
    const width = matrix[0].length;

    const grid = new Grid(width, height, matrix); // 这个 grid 是一个新的 grid，
    const finder = new AStarFinder();

    const path = finder.findPath(startRow, startCol, endRow, endCol, grid);
    //console.log('input data is: ', this.inputData);
    console.log('path result is: ', path);

    // draw path
    this.drawPath(this.groups, this.scales, path);
  }

  nextStep(nowTimeStep, scales){
    console.log('next step');
    // 想了一下，整个的数据应该是一个 三维数组
    const reservationTable = [
        [[3,4],[3,5],[3,6]], // 第一辆小车的路径，每次横纵坐标增加一格。
        [[13,4],[13,5],[13,6]], // 第二辆小车的路径
    ];

    //判断传进来的参数 timeStep 的合法性
    if(nowTimeStep >= reservationTable[0].length){
      console.log('this timeStep is beyond the total timeStep');
      return;
    }

    // 首先是画出 several unit，多个小车，当然在这里是一个

    // 然后是根据path，路径来模拟出一步步的动画效果。也就是上面的 reservation table。

    if(nowTimeStep === 0){
      this.movingSpot.selectAll('circle').data(reservationTable)
          .enter().append('circle')
          .attr("cx", function (d) { return scales.x(d[nowTimeStep][0] + 0.5); })
          .attr("cy", function (d) { return scales.y(d[nowTimeStep][1] + 0.5); })
          .attr("r", function (d) { return 10; })
          .attr("class", "movingSpot");

      this.nowTimeStep += 1;
    }else{
      this.movingSpot.selectAll('circle').data(reservationTable)
          .transition()
          .attr("cx", function (d) { return scales.x(d[nowTimeStep][0] + 0.5); })
          .attr("cy", function (d) { return scales.y(d[nowTimeStep][1] + 0.5); })
          .duration(1000);

      this.nowTimeStep += 1;
    }

  }

  resetTimeStep(scales){
    const reservationTable = [
      [[3,4],[3,5],[3,6]], // 第一辆小车的路径，每次横纵坐标增加一格。
      [[13,4],[13,5],[13,6]], // 第二辆小车的路径
    ];
    // reset the time step
    this.nowTimeStep = 0;
    this.movingSpot.selectAll('circle').data(reservationTable)
        .transition()
        .attr("cx", function (d) { return scales.x(d[0][0] + 0.5); })
        .attr("cy", function (d) { return scales.y(d[0][1] + 0.5); })
        .duration(500);
  }

  render() {
    return (
        <div ref={ele => this.grid = ele} className="instruction">
          {/*<textarea readOnly rows="8" cols="50" defaultValue={"Instructions:\n" +*/}
          {/*"green cell -> start point, 点击空白格子改变颜色\n" +*/}
          {/*"red cell -> destination，点击绿色格子改变颜色\n" +*/}
          {/*"white -> click the white cell and drag to draw obstacles\n\n" +*/}
          {/*"Click start button to start the animation."}>*/}
        {/*</textarea>*/}
          <Button type="primary" onClick={() => this.getInputData()} >Search And draw path</Button>
          <Button type="primary" onClick={() => this.nextStep(this.nowTimeStep, this.scales)} >Next Step</Button>
          <Button type="primary" onClick={() => this.resetTimeStep(this.scales)} >Reset Time Step</Button>
        </div>

    );
  }
}

export default BasicAStar