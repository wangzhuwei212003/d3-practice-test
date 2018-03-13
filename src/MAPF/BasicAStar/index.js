/**
 * Created by zhuweiwang on 12/03/2018.
 */
import React, {Component} from 'react';
import * as d3 from 'd3';
import {Button} from 'antd';

class BasicAStar extends Component {
  constructor(props) {
    super(props);

    this.inputData = {
      startPoint: null, //[row, col]
      endPoint: null, //[row, col]
      grid:[], // 是 0-1 矩阵，1代表有障碍
    }
  }

  componentDidMount() {
    console.log('component did mount');
    this.drawGridMouseover();


  }

  componentDidUpdate() {
    console.log('component did update')
  }

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

  drawGridMouseover() {
    let me = this;
    const gridRef = this.grid;

    const gridMouseover = d3.select(gridRef)
        .append('svg')
        .attr('width', '760px')
        .attr('height', '760px');


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

            me.inputData.startPoint = [(d.y - 1)/25, (d.x -1)/25];

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

  getInputData(){
    console.log('get input data');

    console.log(this.inputData);

    // const startPoint = d3.select('.instruction svg').selectAll('g').selectAll('rect[style = "fill: #fff;"]');
    // console.log(d3.select(this.grid));
    // console.log(startPoint); 本来是想 通过 style 来选出相对应的格子，但是有点陌生，以后有时间再花在这个上面吧
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
          <Button type="primary" onClick={() => this.getInputData()} >START</Button>
        </div>

    );
  }
}

export default BasicAStar