/**
 * Created by zhuweiwang on 31/01/2018.
 */

/**
 * based on , copy from
 * http://d3tetris.herokuapp.com/
 *
 * d3 part creates
 *  <svg>
 *    <g>
 *      many grass cells <rect></rect>
 *    </g>
 *    <g>
 *      rock cells
 *    </g>
 *    <g>
 *      lava cells
 *    </g>
 *    <g>
 *      One path <path></path>
 *    </g>
 *    <g>
 *      several circles and texts <circle></circle> <text></text>
 *    </g>
 *  </svg>
 */

import React, {Component} from 'react';
import * as d3 from 'd3';
//import './index.css';

class Tetris extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputCommand: ''
    };

    this.gamedata = [];
    this.div = 33;
    this.rows = 18;
    this.cols = 10;
    this.w = this.cols * this.div;
    this.h = this.rows * this.div;
    this.shape = {};
    this.nextShape = {};
    this.next = -1;
    this.timeInterval = 0;
    this.level = 1;
    this.lines = 0;
    this.time = 0;
    this.gameover = false;
    this.paused = false;
    this.grid = false;

    // this.svg;
    // this.svgnext;
    //this.scoreID;

    this.tetris = this.tetris.bind(this);
    this.buildGameData = this.buildGameData.bind(this);
    this.play = this.play.bind(this);
    this.start = this.start.bind(this);
    this.createShape = this.createShape.bind(this);
    this.createBar = this.createBar.bind(this);
    this.toggleGrid = this.toggleGrid.bind(this);
    this.drawGrid = this.drawGrid.bind(this);
    this.attachKeyListeners = this.attachKeyListeners.bind(this);
    this.keyCodeListeners = this.keyCodeListeners.bind(this);
    this.updateGame = this.updateGame.bind(this);
    this.gameOver = this.gameOver.bind(this);
    this.newGame = this.newGame.bind(this);
    this.drawNext = this.drawNext.bind(this);
    this.emptyRow = this.emptyRow.bind(this);
    this.fullRow = this.fullRow.bind(this);
    this.slideDown = this.slideDown.bind(this);
    this.pause = this.pause.bind(this);
  }

  componentDidMount() {
    console.log('didmount occurred');
    //console.log(this.state);

    this.tetris();
    //this.newGame();
  }

  componentDidUpdate() {
    console.log('didupdate occurred');
  }

  tetris() {
    this.svg = d3.select(this.svg_container)
        .append('svg')
        .attr('width', this.w)
        .attr('height', this.h);

    this.svgnext = d3.select(this.nextDOM)
        .append('svg');

    this.attachKeyListeners();
    this.gameOver(); // this is necessary, although the first time is not gameover. 这个是需要的，不然看不到 new game 这个按钮选项。
  }

  play() {
    this.createShape(true); // this will always create bar for test case
    this.timeInterval = setInterval(
        () => {
          this.time++;
          d3.select("#time").text(this.time);
        },
        1000
    ); // change time number in the show panel.

    this.start();
    //this.interval = setInterval(this.start, 650); // interval to update the data
  }

  start() {
    if (this.shape.animate()) {
      this.shape.down().draw();
      // if the shape encounters no obstacle, keep moving down.
      // (还能这样直接链式的调用shape里面的方法的)
      // 处于这一状态的时候，gamedata 除了移动的方块之外，没有在变化，所以直接改变 shape。

      this.timeOut = setTimeout(this.start, 650 - this.level * 50);
    } else {
      //clearInterval(this.interval);  //stop moving the shape down
      clearTimeout(this.timeOut);

      this.updateGame(); // 更新 gamedata 包括空中移动的方块、消除符合条件的行、根据 gamedata 重画整个网页。

      // 生成this.shape / this.nextShape
      this.createShape(false); // 这个false 没有用到。

      if (this.gameover) {
        this.gameOver(); // this.gameover 这个 flag 是在 updateGame 方法里设置的。
        clearTimeout(this.timeOut);
        clearInterval(this.timeInterval);
      } else {
        this.timeOut = setTimeout(this.start, 650 - this.level * 50);
        // 这里不算重复注册 setInterval，else 一进来就清除了。
      }
    }
  }

  // change this.shape and this.nextShape
  createShape(first) { // no need parameter.
    let curr;
    if (this.next >= 0) { // next initial value is -1
      curr = this.next;
      this.next = Math.round(Math.random() * 6); // could be 0 - 6

      if (this.next === curr) {
        this.next = Math.round(Math.random() * 6); // could be 0 - 6, again?
      }

      curr = 0;
      this.next = 0; // for test

    } else {
      this.next = Math.round(Math.random() * 6);
      curr = Math.round(Math.random() * 6);

      curr = 0;
      this.next = 0; // for test

    }

    switch (curr) {
      case 0:
        this.shape = this.createBar();
        break;
      case 1:
        this.shape = this.createL1();
        break;
      case 2:
        this.shape = this.createSquare();
        break;
      case 3:
        this.shape = this.createZ1();
        break;
      case 4:
        this.shape = this.createL2();
        break;
      case 5:
        this.shape = this.createT();
        break;
      case 6:
        this.shape = this.createZ2();
        break;
      default:
        break;
    }

    switch (this.next) {
      case 0:
        this.nextShape = this.createBar('next');
        break;
      case 1:
        this.nextShape = this.createL1('next');
        break;
      case 2:
        this.nextShape = this.createSquare('next');
        break;
      case 3:
        this.nextShape = this.createZ1('next');
        break;
      case 4:
        this.nextShape = this.createL2('next');
        break;
      case 5:
        this.nextShape = this.createT('next');
        break;
      case 6:
        this.nextShape = this.createZ2('next');
        break;
      default:
        break;
    }
  }

  /*
   o = 0
   +--+--+--+--+--+--+--+--+--+--+
   |  |  |  |  |  |  |  |  |  |  |
   +--+--+--+--+--+--+--+--+--+--+
   |  |  |  |  |  |  |  |  |  |  |
   +--+--+--+--+--+--+--+--+--+--+
   |  |  |  |//|//|//|//|  |  |  |
   +--+--+--+--+--+--+--+--+--+--+
   |  |  |  |  |  |  |  |  |  |  |
   +--+--+--+--+--+--+--+--+--+--+

   o = 90
   +--+--+--+--+--+--+--+--+--+--+
   |  |  |  |  |//|  |  |  |  |  |
   +--+--+--+--+--+--+--+--+--+--+
   |  |  |  |  |//|  |  |  |  |  |
   +--+--+--+--+--+--+--+--+--+--+
   |  |  |  |  |//|  |  |  |  |  |
   +--+--+--+--+--+--+--+--+--+--+
   |  |  |  |  |//|  |  |  |  |  |
   +--+--+--+--+--+--+--+--+--+--+
   */
  createBar(next) {
    let d = [[3 * this.div, 0], [4 * this.div, 0], [5 * this.div, 0], [6 * this.div, 0]];
    const dPreview = [[10, 20], [30, 20], [50, 20], [70, 20]]; // DATA for next block 在旁边画下一个方块的类型。
    let o = 0; // orientation
    let f = 'orange';
    let grace = true;
    const bar = {};

    if (next) {
      this.drawNext(dPreview, 20, f); // 如果是有参数传过来，就是在 svgnext 里画。
    } else {
      this.svg.selectAll('rect.active') // 否则就是在游戏框内开始下落了。
          .data(d)
          .enter()
          .append('rect')
          .attr('class', 'active')
          .attr('x', function (d) {
            return d[0] + 1;
          })
          .attr('y', function (d) {
            return d[1] + 1;
          })
          .attr('rx', 1)
          .attr('width', this.div - 3)
          .attr('height', this.div - 3)
          .style('stroke', f)
          .style('stroke-width', 2)
          .style('fill', f)
          .style('fill-opacity', 0.6);
    }

    bar.f = function (value) { // change fill value in this bar, just like the setter function in JAVA.
      if (!arguments.length) {
        return f; // argumnets is the reserveed word ?
      }
      f = value; // if value is not empty.. fill value
      return bar;
    };
    bar.d = function (value) { // setter function change data of the bar .
      if (!arguments.length) {
        return d; //
      }
      d = value; // data
      return bar;
    };
    bar.o = function (value) { // setter function change orientation
      if (!arguments.length) {
        return o; //
      }
      o = value; // orientation
      return bar;
    };

    bar.left = () => {
      const r = d[0][1] / this.div, c = d[0][0] / this.div;
      if (d[0][0] > 0) {
        if ((o === 0 && !this.gamedata[r][c - 1].occupy) ||
            (o === 90 && !this.gamedata[r][c - 1].occupy && !this.gamedata[r - 1][c - 1].occupy &&
            (this.gamedata[r - 2] === undefined || !this.gamedata[r - 2][c - 1].occupy) &&
            (this.gamedata[r - 3] === undefined || !this.gamedata[r - 3][c - 1].occupy))
        ) {
          // two situation, allow to change the bar data.
          for (let i = 0; i < d.length; i += 1) {
            d[i][0] -= this.div;
          }
        }
      }
      return bar;
    };
    bar.right = () => {
      const r = d[0][1] / this.div, c = d[0][0] / this.div;
      if (d[3][0] < this.w - this.div) { // if the orientation is 90, why d[3][0] < w-div is necessary?
        if ((o === 0 && !this.gamedata[r][c + 4].occupy) ||
            (o === 90 && !this.gamedata[r][c + 1].occupy && !this.gamedata[r - 1][c + 1].occupy &&
            (this.gamedata[r - 2] === undefined || !this.gamedata[r - 2][c + 1].occupy) &&
            (this.gamedata[r - 3] === undefined || !this.gamedata[r - 3][c + 1].occupy))
        ) {
          // two situation, allow to change the bar data.
          for (let i = 0; i < d.length; i += 1) {
            d[i][0] += this.div;
          }
        }
      }
      return bar;
    };
    bar.down = () => {
      for (let i = 0; i < d.length; i += 1) {
        d[i][1] += this.div;
      }
      return bar;
    };
    bar.drop = () => {
      let x1, x2, r = d[0][1] / this.div, done = false;
      let i; // this i should be promoted to here.
      if (o === 0) {
        x1 = d[0][0] / this.div;
        x2 = d[3][0] / this.div;

        for (i = r; i < this.rows; i += 1) {
          // this.rows is the total rows, r is the current y coordinate
          for (let j = x1; j <= x2; j += 1) {
            if (this.gamedata[i][j].occupy) {
              done = true; // gamedata 1 means occupied, 0 means empty
              break;
            }
          }
          if (done) {
            break;
          }
        } // find the i number, rows to fall

        for (let k = 0; k < d.length; k += 1) {
          d[k][1] = this.div * (i - 1);
        }
      } else {
        // o is not 0
        x1 = d[0][0] / this.div;

        for (i = r; i < this.rows; i += 1) {
          if (this.gamedata[i][x1].occupy) {
            break;
          }
        }

        for (let k = 0; k < d.length; k += 1) {
          d[k][1] = this.div * (i - k - 1);
        }
      }
      grace = false;
      return bar;
    };
    bar.rotate = () => {
      const r = d[0][1] / this.div, c = d[0][0] / this.div;
      if (o === 0) {
        if (
            r + 1 <= this.rows && !this.gamedata[r + 1][c + 1].occupy &&
            (this.gamedata[r - 1] === undefined || !this.gamedata[r - 1][c + 1].occupy) &&
            (this.gamedata[r - 2] === undefined || !this.gamedata[r - 2][c + 1].occupy)
        ) {
          o = 90;
          d[0][0] += this.div;
          d[0][1] += this.div;
          d[2][0] -= this.div;
          d[2][1] -= this.div;
          d[3][0] -= 2 * this.div;
          d[3][1] -= 2 * this.div;
        }
      } else {
        if (
            !this.gamedata[r - 1][c - 1].occupy && !this.gamedata[r - 1][c + 1].occupy &&
            !this.gamedata[r - 1][c + 2].occupy
        ) {
          o = 0;
          d[0][0] -= this.div;
          d[0][1] -= this.div;
          d[2][0] += this.div;
          d[2][1] += this.div;
          d[3][0] += 2 * this.div;
          d[3][1] += 2 * this.div;
        }
      }
      return bar;
    };

    bar.animate = () => {
      let r, c, animate = true;

      if (d[0][1] === this.div * 17) {
        return false;
      } else if (o === 0) {
        for (let i = 0; i < d.length; i++) {
          r = d[i][1] / this.div + 1;
          c = d[i][0] / this.div;

          if (this.gamedata[r][c].occupy) {
            animate = false;
            break;
          }
        }
        return animate;
      } else if (o === 90) {
        r = d[0][1] / this.div + 1;
        c = d[0][0] / this.div;
        return !this.gamedata[r][c].occupy;
      }
      return bar; // this expression will never execute.
      // animate function will return a boolean value. if there is any obstacle, the animate will return false.
    };

    bar.grace = function (value) { // setter for grace
      if (!arguments.length) {
        return grace;
      }
      grace = false;
    };

    bar.draw = () => { // change the active bar position, and return bar. update position
      this.svg
          .selectAll("rect.active")
          .data(d)
          .attr("x", function (d) {
            return d[0] + 1;
          })
          .attr("y", function (d) {
            return d[1] + 1;
          });
      return bar;
    };

    return bar;
  }

  createL1() {

  }

  createSquare() {

  }

  createZ1() {

  }

  createL2() {

  }

  createT() {

  }

  createZ2() {

  }

  toggleGrid() {
    console.log('this.toggleGrid function');
    if (this.grid) {
      d3.selectAll('line').remove();
      this.grid = false;
    } else {
      this.drawGrid();
      this.grid = true;
    }
  }

  drawGrid() {
    for (let i = 1; i < this.rows; i += 1) {
      this.svg
          .append('line')
          .attr('x1', 0)
          .attr('y1', i * this.div)
          .attr('x2', this.w)
          .attr('y2', i * this.div)
          .attr('stroke', 'lightgray')
          .attr('stroke-width', 0.5);
    }

    for (let j = 1; j < this.cols; j += 1) {
      this.svg
          .append('line')
          .attr('x1', j * this.div)
          .attr('y1', 0)
          .attr('x2', j * this.div)
          .attr('y2', this.h)
          .attr('stroke', 'lightgray')
          .attr('stroke-width', 0.5);
    }
  }

  keyCodeListeners(event) {

    if (d3.event.keyCode === 37) {
      if (!this.paused &&
          (this.shape.animate() || this.shape.grace())
      ) {
        d3.event.preventDefault();
        this.shape.left().draw(); // call function this simple way,,, dot dot()
      }
    } else if (d3.event.keyCode === 39) {
      if (!this.paused &&
          (this.shape.animate() || this.shape.grace())
      ) {
        d3.event.preventDefault();
        this.shape.right().draw();
      }
    } else if (d3.event.keyCode === 40) {
      if (!this.paused &&
          (this.shape.animate() || this.shape.grace())
      ) {
        d3.event.preventDefault();
        this.shape.down().draw();
      }
    } else if (d3.event.keyCode === 32) {
      if (!this.paused &&
          (this.shape.animate() || this.shape.grace())
      ) {
        // d3.event.preventDefault();
        this.shape.drop().draw();
      }
    } else if (d3.event.keyCode === 38) {
      if (!this.paused &&
          (this.shape.animate() || this.shape.grace())
      ) {
        d3.event.preventDefault();
        this.shape.rotate().draw();
      }
    } else if (d3.event.keyCode === 80) {
      // if (this.shape === {}) {
      //   alert('you dont even start');
      //   return;
      // }
      //console.log(this.shape);

      // console.log(!this.paused &&
      //     ((this.shape.animate()) || (this.shape.grace())));

      if (this.timeOut) {
        d3.event.preventDefault();
        this.pause();
      }
    }
  }

  // keyCodeListeners(event) {
  //   if (d3.event.keyCode === 37) {
  //     console.log('left is pressed');
  //   } else if (d3.event.keyCode === 39) {
  //     console.log('right is pressed');
  //   } else if (d3.event.keyCode === 40) {
  //     console.log('down is pressed');
  //   } else if (d3.event.keyCode === 32) {
  //     console.log('drop is pressed');
  //   } else if (d3.event.keyCode === 38) {
  //     console.log('up is pressed');
  //   } else if (d3.event.keyCode === 80) {
  //     console.log('p is pressed');
  //   }
  // }

  attachKeyListeners() {
    // right, left, rotate, down, drop, pause corresponding action..
    const body = this.container;
    d3.select(body).on('keydown', (event) => {
      this.keyCodeListeners(event)
    })
  }

  // 更新 gamedata 包括空中移动的方块、消除符合条件的行、根据 gamedata 重画整个网页。
  updateGame() {
    let a = this.shape.d(), //get d value, parameter not empty get shape
        r, c, j, done = false;

    for (let i = 0; i < 4; i++) {
      r = a[i][1] / this.div; // row number
      c = a[i][0] / this.div; // column number
      this.gamedata[r][c].fill = this.shape.f(); // get the fill color
      this.gamedata[r][c].occupy = true;
    }

    j = this.rows - 1; // this.rows:total rows，从下往上整个查一遍，更改 gamedata 里的信息。
    while (!done && j > 1) {
      if (this.emptyRow(j)) { // check row is empty or not
        done = true;
      } else if (this.fullRow(j)) { // all cells in row is occupied.
        this.slideDown(j); // 删除满行的方块、更改 gamedata 里面的 data 信息。
      } else {
        j--;
      }
    }

    d3.selectAll("rect.active").remove(); // remove moving rect 删除掉所有的 active 在运动的方块
    this.svg.selectAll("g").data([]).exit().remove(); // remove all in svg

    // append g and rects , 这种 enter append attr 里面自带循环.. 但是显然这个后面的 j 不是当前数组的所在的 index
    this.svg
        .selectAll("g")
        .data(this.gamedata)
        .enter()
        .append("g")
        .selectAll("rect")
        .data(function (d) {
          return d;
        })
        .enter()
        .append("rect")
        .attr("x", (d, i, j) => {
          //console.log(d, i, j); // d is the value , i is the value index, j is the array of the data
          //console.log(i * this.div + 1);
          return i * this.div + 1; // 第二个参数是当前元素的 index，
        })
        .attr("y", (d, i, j) => {
          return d.row * this.div + 1; // 第三个参数是当前元素上一级的 index ？
        })
        .attr("rx", 1) // rx and ry round the corner of rectangle.
        .attr("width", (d) => {
          return this.div - 3;
        })
        .attr("height", (d) => {
          return this.div - 3;
        })
        .style("fill", (d, i, j) => {
          return d.fill;
        })
        .style("fill-opacity", function (d, i, j) {
          return d ? 0.7 : "none";
        })
        .style("stroke", function (d, i, j) {
          return d.fill;
        })
        .style("stroke-width", function (d) {
          return d ? 2 : 0;
        });

    if (!this.emptyRow(1)) { // 如果从上往下数第二列不为空，那么 gameOver。
      this.gameover = true;
    }
  }

  buildGameData() {
    // 暂定 18行，10列
    const mapData = [];

    //iterate for rows
    for (let row = 0; row < this.rows; row += 1) {
      mapData.push([]);

      for (let column = 0; column < this.cols; column += 1) {
        mapData[row].push({
          row: row,
          col: column,
          occupy: false,
          fill: 'none'
        });
      }
    }
    console.log(mapData);
    this.gamedata = mapData;
  }

  // 删除空中移动的方块、下一个提示的方块、网格
  gameOver() {
    if (this.gameover) {
      //this.updateScore();
      this.scoreID = null;
    }

    d3.selectAll("rect.active").remove(); // doubt this select way works or not
    this.svgnext.selectAll("rect").data([]).exit().remove(); // remove things in svgnext

    this.svg
        .selectAll("g")
        .data(this.gamedata)
        .selectAll("rect")
        .data(function (d) {
          return d;
        })
        .transition()
        .duration(300)
        .delay(function (d, i, j) {
          return d.row * 100;
        })
        .style("fill-opacity", 0)
        .style("stroke-opacity", 0);
    // 这个没有 enter 和 exit，gamedata不会变。类似写法参见 updateGame 方法。

    d3.select("#modal").classed("active-modal", true); // this html select way works or not.
  }

  newGame() {
    this.buildGameData();

    this.timeInterval = 0;
    this.gameover = false;
    this.shape = {};
    this.nextShape = {};
    this.next = -1;
    this.level = 1;
    this.lines = 0;
    this.time = 0;

    this.svg.selectAll('g').data([]).exit().remove();
    d3.select('#modal').classed('active-modal', false);
    d3.select('#level').text(this.level);
    d3.select('#lines').text(this.lines);
    d3.select('#time').text(this.time);
    //this.createScore();
    this.play();
  }

  // draw next block to fall in DOM
  drawNext(data, length, fill) {
    this.svgnext.selectAll('rect').data([]).exit().remove(); // remove all rect anyway

    this.svgnext.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', function (d) {
          return d[0];
        })
        .attr('y', function (d) {
          return d[1];
        })
        .attr('width', length - 2.5)
        .attr('height', length - 2.5)
        .style('stroke', fill)
        .style('stroke-width', 1.5)
        .style('fill', fill)
        .style('fill-opacity', 0.6);
  }

  emptyRow(j) {
    for (let i = 0; i < this.cols; i += 1) {
      if (this.gamedata[j][i].occupy)
        return false; // any cell is occupied , not 0, means not empty.
    }
    return true;
  }

  fullRow(j) {
    for (let i = 0; i < this.cols; i++) {
      if (!this.gamedata[j][i].occupy)
        return false; // any position is 0, means not full, 1 means occupied.
    }
    return true;
  }

  /*map of the gamedata
   *
   * smaller row num |
   *
   * bigger row num
   * */
  slideDown(j) {
    for (let k = j; k > 0; k--) {
      if (this.emptyRow(k)) {
        break;
      } else {
        for (let i = 0; i < this.cols; i++){
          //this.gamedata[k][i] = Object.assign({}, this.gamedata[k - 1][i]);
          this.gamedata[k][i].occupy = this.gamedata[k - 1][i].occupy;
          this.gamedata[k][i].fill = this.gamedata[k - 1][i].fill;
        }
      }
    }

    this.lines++;
    if (this.lines % 5 === 0)
      this.level++;
    d3.select("#level").text(this.level);
    d3.select("#lines").text(this.lines);
  }

  pause() {
    //console.log('this.paused', this.paused);
    console.log(this.container);
    // switch pause statu
    if (this.paused) {
      this.paused = false;
      this.start();

      this.timeInterval = setInterval(
          () => {
            this.time++;
            d3.select("#time").text(this.time);
          },
          1000
      );

      d3.select('#pause').classed('paused', false);
    }else{
      // if now is not paused.
      this.paused = true;
      clearTimeout(this.timeOut); // timeout for start
      clearInterval(this.timeInterval);

      d3.select('#pause').classed('paused', true);
    }


  }

  createScore() {
  }

  updateScore() {
  }

  render() {
    return (
        <div className="container" ref={ele => this.container = ele} tabIndex={'0'}>
          <div className="svg-container" ref={ele => this.svg_container = ele}>
            <div id="modal">
              <a id="new-game" onClick={this.newGame}>New Game</a>
            </div>

            <div id="pause">
              <p>Paused</p>
              <table>
                <tbody>
                <tr>
                  <td className="hotkey">Left arrow</td>
                  <td className="description"> - move left</td>
                </tr>
                <tr>
                  <td className="hotkey">Right arrow</td>
                  <td className="description"> - move right</td>
                </tr>
                <tr>
                  <td className="hotkey">Down arrow</td>
                  <td className="description"> - move down</td>
                </tr>
                <tr>
                  <td className="hotkey">Up arrow</td>
                  <td className="description"> - rotate</td>
                </tr>
                <tr>
                  <td className="hotkey">Space</td>
                  <td className="description"> - drop</td>
                </tr>
                <tr>
                  <td className="hotkey">p</td>
                  <td className="description"> - pause/unpause</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>

          <aside>
            <div className="next" ref={ele => this.nextDOM = ele}></div>
            <div className="score">
              <table>
                <tbody>
                <tr>
                  <td style={{width: 50 + 'px'}}>Level:</td>
                  <td className="num" id="level">1</td>
                </tr>
                <tr>
                  <td>Lines:</td>
                  <td className="num" id="lines">0</td>
                </tr>
                <tr>
                  <td>Time:</td>
                  <td className="num" id="time">0</td>
                </tr>
                </tbody>
              </table>
            </div>

            <div className="pause">
              <input type="checkbox" onClick={this.toggleGrid}/>Grid<br/>
              <span className="hotkey">p</span> - pause
            </div>
          </aside>

          <footer>
            by
            <a href="" target="">Nikolay Smirnov</a>
          </footer>
        </div>
    );
  }
}

export default Tetris



