/**
 * Created by zhuweiwang on 30/01/2018.
 *
 * based on , copy from
 * http://blog.dataglot.com/d3js-sandbox/mower-demo/index.html
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
import './index.css';

const squareLength = 40;
const circleRadius = 15;
const ratios = {rock: 0.05, lava: 0.05};
const gridSize = {x: 20, y: 15};

class MowerDemo extends Component {
  constructor(props) {
    super(props);
    this.state={
      inputCommand: ''
    };

    this.executeCommands = this.executeCommands.bind(this); // because the function will use variables outside
  }

  componentDidMount() {
    console.log('didmount occurred');
    //console.log(this.state);
    //this.createBarChart();

    // setTimeout(() => {
    //   //console.log(this.state)
    //   this.setState({
    //     data: [30, 86, 168, 281, 303, 100]
    //   });
    //   console.log('change the state')
    // }, 1000);

    this.svgSize = this.getSvgSize(gridSize, squareLength);
    this.map = this.buildMap(gridSize, ratios);
    this.start = this.pickRandomPosition(this.map);

    this.svgContainer = d3.select(this.display)
        .append("svg")
        .attr("width", this.svgSize.width)
        .attr("height", this.svgSize.height);

    this.scales = this.getScale(gridSize, this.svgSize);

    this.drawCells(this.svgContainer, this.scales, this.map.grass, 'grass');
    this.drawCells(this.svgContainer, this.scales, this.map.rock, 'rock');
    this.drawCells(this.svgContainer, this.scales, this.map.lava, 'lava');

    // this.group should behind the three drawCells function
    this.groups={
      path: this.svgContainer.append('g'),
      position: this.svgContainer.append('g')
    };

    this.drawMowerHistory(this.groups, this.scales, [this.start]);
  }

  componentDidUpdate() {
    console.log('didupdate occurred');
    console.log(this.display);
  }


  getSvgSize(gridSize, squareLength) {
    let width = gridSize.x * squareLength;
    let height = gridSize.y * squareLength;
    return {width: width, height: height};
  }

  getScale(gridSize, svgSize) {
    let xScale = d3.scaleLinear().domain([0, gridSize.x]).range([0, svgSize.width]);
    let yScale = d3.scaleLinear().domain([0, gridSize.y]).range([0, svgSize.height]);
    return {x: xScale, y: yScale};
  }

  isBorder(x, y, gridSize) {
    return x === 0 || y === 0 || x === (gridSize.x - 1) || y === (gridSize.y - 1);
  }

  pickRandomPosition(map){
    const grass = map.grass;
    const i = Math.ceil(Math.random() * grass.length);
    return grass[i];
  }

  getNext(map, current, command){
    switch(command){
      case "U":
        return map.grid[current.x][current.y - 1];
      case "D":
        return map.grid[current.x][current.y + 1];
      case "R":
        return map.grid[current.x + 1][current.y];
      case "L":
        return map.grid[current.x - 1][current.y];
      default:
        throw 'unexpected command : ' + command;
    }
  }

  buildMap(gridSize, ratios) {
    const map = {
      grid: [],
      grass: [],
      rock: [],
      lava: [],
    };

    for (let x = 0; x < gridSize.x; x++) {
      map.grid[x] = [];
      for (let y = 0; y < gridSize.y; y++) {
        let rock = Math.random() < ratios.rock;
        let lava = Math.random() < ratios.lava;
        let type = this.isBorder(x, y, gridSize) ? "rock" : "grass";

        if (rock) {
          type = 'rock';
        }
        if (lava) {
          type = 'lava';
        }
        let cell = {
          x: x,
          y: y,
          type: type,
        };
        map.grid[x][y] = cell; // here dont use push? I doubt it. this will return a undefined?
        map[type].push(cell);
      }
    }
    console.log('map data in buildMap function', map);
    return map;
  }

  drawCells(svgContainer, scales, data, cssClass){
    const gridGroup = svgContainer.append("g");
    const cells = gridGroup.selectAll('rect')
        .data(data)
        .enter()
        .append('rect');

    const cellAttributes = cells
        .attr('x', function (d) {return scales.x(d.x);})
        .attr('y', function (d) {return scales.x(d.y);})
        .attr('width', function (d) {return squareLength;})
        .attr('height', function (d) {return squareLength;})
        .attr('class', cssClass);
  }

  drawMowerHistory(groups, scales, path){
    groups.path.selectAll('.path').remove();

    //const lineFunction = d3.svg.line() //there is no d3.svg
    //.interpolate('linear'); // and there is no interpolate

    const lineFunction = d3.line()
        .x(function (d) {return scales.x(d.x + 0.5);})
        .y(function (d) {return scales.y(d.y + 0.5);})
        .curve(d3.curveLinear);

    const lineGraph = groups.path.append('path')
        .attr('d', lineFunction(path))
        .attr('class', 'path')
        .attr('fill', 'none');

    // position
    const circleData = groups.position.selectAll('circle').data(path);
    circleData.exit().remove();

    const circles = circleData.enter().append('circle');
    const circleAttributes = circles
        .attr("cx", function (d) { return scales.x(d.x + 0.5); })
        .attr("cy", function (d) { return scales.y(d.y + 0.5); })
        .attr("r", function (d) { return circleRadius; })
        .attr("class", "position");

    // position number
    const textData = groups.position.selectAll("text").data(path);
    textData.exit().remove();

    const texts = textData.enter().append("text");
    const textAttributes = texts
        .attr("x", function (d) { return scales.x(d.x + 0.5); })
        .attr("y", function (d) { return scales.y(d.y + 0.5); })
        .attr("dy", ".31em")
        .text(function(d,i) { return i; })
        .attr("class", "positionNumber");
  }

  executeCommands(e){
    // get the input val
    //console.log('command value', e.target.value);

    let content = e.target.value;
    content = content.toUpperCase().replace(/[^UDRL]/g, ""); // 不包含 UDRL 的字符串。
    console.log(content);
    console.log(typeof content);
    console.log(content.length);
    console.log(content[0]); // content is string type, but single alphabet can be accessed like array

    // connect textarea with the react state, and receive value from textarea.
    this.setState({
      inputCommand: content
    });

    const path = [this.start];
    let current = this.start;

    for(let i =0; i<content.length;i+=1){
      const next = this.getNext(this.map, current, content[i]);
      switch (next.type){
        case 'grass':
          path.push(next);
          current = next;
          break;
        case 'rock':
          break; // stay where you are
        case 'lava':
          this.drawMowerHistory(this.groups, this.scales, path);
          alert('The mower turned into lava ashes, as predicted.', 'Start again.');
          this.setState({
            inputCommand:''
          });
          this.drawMowerHistory(this.groups, this.scales, [this.start]); // redraw the start statu of the map
          return;
        default:
          throw 'Unexpected terrian type ' + next.type;

      }
    }// end of content for loop
    this.drawMowerHistory(this.groups, this.scales, path); // everything goes ok, only meet grass and rock. draw the path.
  }

  render() {
    return (
        <div>
          <div className="display" ref={ele => this.display = ele}>
          </div>
          <div className="control">
            <textarea readOnly rows="8" cols="50"
                      defaultValue={"Type commands in the input below in order to move the mower.\n" +
                      "U : move up\n" +
                      "D : move down\n" +
                      "R : move right\n" +
                      "L : move left"}>
            </textarea>
            <br/>
            <textarea id="commands" rows="8" cols="50"
                      value={this.state.inputCommand}
                      onChange={this.executeCommands} ></textarea>
            <br/>
            <textarea readOnly rows="8" cols="50" defaultValue={"Be careful! There are 3 kinds of terrain:\n" +
            "green -> grass, where the mower should be, most of the time\n" +
            "gray -> rock, where the mower can't go\n" +
            "red -> lava, where the mower will turn into ashes\n\n" +
            "This game is a proof of concept using d3js, feel free to fork and improve."}>
            </textarea>
          </div>
          <br/>
        </div>
    );
  }
}

export default MowerDemo



