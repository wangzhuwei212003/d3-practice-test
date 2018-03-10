/**
 * based on http://www.cagrimmett.com/til/2016/08/17/d3-lets-make-a-grid.html
 *
 * think about how an svg grid is structured
 <svg>
 <g>
 <rect></rect>
 <rect></rect>
 <rect></rect>
 </g>
 <g>
 <rect></rect>
 <rect></rect>
 <rect></rect>
 </g>
 <g>
 <rect></rect>
 <rect></rect>
 <rect></rect>
 </g>
 </svg>
 */

/**
 * Created by zhuweiwang on 29/01/2018.
 */

import React, {Component} from 'react';
import * as d3 from 'd3';
//import './index.css';

class MakeGrid extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

    console.log('didmount occurred');
    this.drawGrid();
    this.drawGridMouseover();
  }

  // componentDidUpdate() {
  //   this.createBarChart();
  //   console.log('didupdate occurred');
  // }

  gridData() {
    //const data = new Array();
    const data = []; // this is preferrable
    let xpos = 1;
    let ypos = 1;
    let click = 0;
    const width = 50;
    const height = 50;

    //iterate for rows
    for (let row = 0; row < 10; row += 1) {
      data.push([]);

      for (let column = 0; column < 10; column += 1) {
        click = Math.round(Math.random()*100);
        data[row].push({
          x: xpos,
          y: ypos,
          width: width,
          height: height,
          click: click
        });
        xpos += width;
      }

      xpos = 1;
      ypos += height;
    }

    //console.log(data);

    return data;
  }
  gridDataMax() {
    //const data = new Array();
    const data = []; // this is preferrable
    let xpos = 1;
    let ypos = 1;
    let click = 0;
    const width = 10;
    const height = 10;

    //iterate for rows
    for (let row = 0; row < 50; row += 1) {
      data.push([]);

      for (let column = 0; column < 50; column += 1) {
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
      }

      xpos = 1;
      ypos += height;
    }

    //console.log(data);

    return data;
  }

  drawGrid() {
    const gridRef = this.grid;

    const grid = d3.select(gridRef)
        .append('svg')
        .attr('width', '510px')
        .attr('height', '510px');


    const row = grid.selectAll('.row')
        .data(this.gridData)
        .enter()
        .append('g')
        .attr('class', 'row');

    const column = row.selectAll('.square')
        .data(function (d) {
          console.log(d); // this data will be a 1 dimension array of each row .
          return d;
        })
        .enter()
        .append('rect')
        .attr('class', 'square')
        .attr('x', function (d) {
          console.log(d); //this data is the only object for each cell. 每一次 enter()之后,数组会降维一次。
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
          if(d.click % 4 === 0){return '#fff'}
          if(d.click % 4 === 1){return '#2C93E8'}
          if(d.click % 4 === 2){return '#F56C4E'}
          if(d.click % 4 === 3){return '#838690'}
        })
        .style('stroke', '#222')
        .on('click', function (d) {
          d.click ++;
          if(d.click % 4 === 0){d3.select(this).style('fill', '#fff')}
          if(d.click % 4 === 1){d3.select(this).style('fill', '#2C93E8')}
          if(d.click % 4 === 2){d3.select(this).style('fill', '#F56C4E')}
          if(d.click % 4 === 3){d3.select(this).style('fill', '#838690')}
        });

  }

  drawGridMouseover() {
    const gridRef = this.grid;

    const gridMouseover = d3.select(gridRef)
        .append('svg')
        .attr('width', '510px')
        .attr('height', '510px');


    const row = gridMouseover.selectAll('.row')
        .data(this.gridDataMax)
        .enter()
        .append('g')
        .attr('class', 'row');

    const column = row.selectAll('.square')
        .data(function (d) {
          console.log(d); // this data will be a 1 dimension array of each row .
          return d;
        })
        .enter()
        .append('rect')
        .attr('class', 'square')
        .attr('x', function (d) {
          console.log(d); //this data is the only object for each cell. 每一次 enter()之后,数组会降维一次。
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
          if(d.click % 2 === 0){return '#fff'}
          if(d.click % 2 === 1){return '#2C93E8'}
          if(d.click % 2 === 2){return '#F56C4E'}
          if(d.click % 2 === 3){return '#838690'}
        })
        .style('stroke', '#222')
        .on('mouseover', function (d) {
          d.click ++;
          if(d.click % 2 === 0){d3.select(this).style('fill', '#fff')}
          if(d.click % 2 === 1){d3.select(this).style('fill', '#2C93E8')}
          if(d.click % 2 === 2){d3.select(this).style('fill', '#F56C4E')}
          if(d.click % 2 === 3){d3.select(this).style('fill', '#838690')}
        });

  }

  render() {
    return (
        <div ref={ele => this.grid = ele}></div>
    );
  }
}

export default MakeGrid



