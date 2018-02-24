/**
 * Created by zhuweiwang on 29/01/2018.
 */

import React, {Component} from 'react';
import * as d3 from 'd3';
//import './index.css';

class SimpleBarChart extends Component {
  constructor(props) {
    super(props);
    const {data} = props;
    this.state = {data};

    this.createBarChart = this.createBarChart.bind(this);
  }

  componentDidMount() {
    console.log(this.state);
    this.createBarChart();

    setTimeout(() => {
      //console.log(this.state)
      this.setState({
        data: [30, 86, 168, 281, 303, 100]
      });
      console.log('change the state')
    }, 1000);

    console.log('didmount occurred');
  }

  componentDidUpdate() {
    this.createBarChart();
    console.log('didupdate occurred');
  }

  createBarChart() {
    const node = this.chart;
    const dataMax = d3.max(this.state.data);
    console.log('datamax', dataMax);

    // const scale = d3.scale.linear() // this api has changed to scaleLinear.
    //     .domain([0.365])
    //     .range([0, 300]);

    const yScale = d3.scaleLinear()
        .domain([0, dataMax])
        .range([0, 300]);

    d3.select(node)
        .selectAll('div')
        .data(this.state.data)
        .enter()
        .append('div');

    d3.select(node)
        .selectAll('div')
        .data(this.state.data)
        .exit()
        .remove();

// remove or add element in dom;

    d3.select(node)
        .selectAll('div')
        .data(this.state.data)
        .style('width', function (d) {
          return yScale(d) + 'px'
        })
        .text(function (d) {
          return d;
        })
        .on('mouseover', function () {
          //d3.select(this).style('fill', 'aliceblue'); //not work?
          d3.select(this).text(function (d) {
            return 'mouseover'
          });
          console.log('mouseover.')
        })
        .on('mouseout', function () {
          d3.select(this).text(function (d) {
            return d;
          })
        })

  }

  render() {
    return (
        <div id="dashboard">
          <p>Earnings</p>
          <div className="chart" ref={ele => this.chart = ele}></div>
        </div>
    );
  }
}

export default SimpleBarChart

