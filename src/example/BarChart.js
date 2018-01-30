/**
 * Created by zhuweiwang on 29/01/2018.
 */

import React, {Component} from 'react';
import {scaleLinear} from 'd3-scale';
import {max} from 'd3-array';
import {select} from 'd3-selection';

import * as d3 from 'd3';

class BarChart extends Component {
  constructor(props) {
    super(props);
    const {data, size} = props;
    this.state = {data, size};

    this.createBarChart = this.createBarChart.bind(this);
  }

  componentDidMount() {
    console.log(this.state);
    this.createBarChart();

    setTimeout(() => {
      //console.log(this.state)
      this.setState({
        data:[5,8,5,6]
      })

    }, 1000);

    console.log('didmount occurred');
  }

  componentDidUpdate() {
    this.createBarChart();
    console.log('didupdate occurred');
  }

  createBarChart() {
    const node = this.node;
    const dataMax = max(this.state.data);
    const yScale = scaleLinear()
        .domain([0,dataMax])
        .range([0, this.state.size[1]]);

    d3.select(node)
        .selectAll('rect')
        .data(this.state.data)
        .enter()
        .append('rect');

    select(node)
        .selectAll('rect')
        .data(this.state.data)
        .exit()
        .remove();

    select(node)
        .selectAll('rect')
        .data(this.state.data)
        .style('fill', 'blue')
        .attr('x', (d, i) => i*25)
        .attr('y', d => this.state.size[1] - yScale(d))
        .attr('height', d => yScale(d))
        .attr('width', 25)

  }

  render() {
    return <svg ref={node => this.node = node}
    width={500} height={500}
    ></svg>
  }
}

export default BarChart
