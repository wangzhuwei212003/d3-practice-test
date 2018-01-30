/**
 * Created by zhuweiwang on 29/01/2018.
 */
/**
 * Created by zhuweiwang on 29/01/2018.
 */
// it looks something wrong with the visualization. not smooth like http://bl.ocks.org/LeeMendelowitz/11383724

import React, {Component} from 'react';
import * as d3 from 'd3';
import './index.css';

class DynamicTable extends Component {
  constructor(props) {
    super(props);
    // const {data} = props;
    // this.state = {data};
    //
    // this.createBarChart = this.createBarChart.bind(this);
  }

  componentDidMount() {
    // console.log(this.state);
    //this.createBarChart();

    this.updateTable(this.generate_data());

    setInterval(() => {
      this.updateTable(this.generate_data());
    }, 4000);

    // setTimeout(() => {
    //   //console.log(this.state)
    //   this.setState({
    //     data: [30, 86, 168, 281, 303, 100]
    //   });
    //   console.log('change the state')
    // }, 1000);

    console.log('didmount occurred');
  }

  componentDidUpdate() {
    this.updateTable(this.generate_data());
    console.log('didupdate occurred');
  }

  // utility functions
  make_key_value(k, v) {
    return {
      key: k,
      value: v
    }
  }

  // return an array of key-value objects
  merge(keys, values) {
    let l = keys.length;
    let d = [], v, k;
    for (let i = 0; i < l; i += 1) {
      v = values[i].slice();
      k = keys[i];
      d.push(this.make_key_value(k, v));
    }
    return d;
  }

  //shuffles the input array
  shuffle(arr) {
    let m = arr.length, t, i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = arr[m], arr[m] = arr[i], arr[i] = t; // 这是什么写法。。。逗号做分隔。洗牌，交换n次。
    }
    return arr; // 这句话可能不需要，js能够直接改变参数。
  }

  // return a random integer between min and max. math.round gives a non-uniform distribution
  get_random_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Resize the array
  update_arr(a, newSize) {
    a = a || [];

    if (a.length > newSize) {
      return a.slice(0, newSize);
    }

    let delta = newSize - a.length;
    for (let i = 0; i < delta; i += 1) {
      a.push(this.get_random_int(0, 9));
    }
    return a;
  }

  // generate data
  generate_data() {
    let alphabet = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
    let letter_to_data = {};
    let row_data = [];

    let i, j, a, l;
    let letters = this.shuffle(alphabet);
    let num_cols = this.get_random_int(3, 10);
    let num_rows = this.get_random_int(5, 15);

    for (i = 0; i < num_rows; i += 1) {
      l = letters[i];
      a = this.update_arr(letter_to_data[l], num_cols); // 返回一个随机整数组成的数组。
      letter_to_data[l] = a;

      row_data.push(a);
    }

    for(i = num_rows; i<letters.length; i+=1){
      delete letter_to_data[i]; // 这个 for 循环到底是干啥的，还是觉得莫名其妙
    }

    letters = letters.slice(0, num_rows); // this is deep copy

    return this.merge(letters, row_data);
  }

  get_key(d){
    return d && d.key
  }

  extract_row_data(d){
    let values = d.value.slice();

    values.unshift(d.key); // add element to the beginning of the array and return the new length
    //console.log(values);
    return values;
  }

  ident(d){
    return d;
  }

  updateTable(tableData){
    const tableRef = this.table;
    const table = d3.select(tableRef);

    const rows = table.selectAll('tr')
        .data(tableData, this.get_key);

    const cells = rows.selectAll('td')
        .data(this.extract_row_data);

    //cells enter selection
    cells.enter().append('td')
        .style('opacity', 0)
        .attr('class', 'enter')
        .transition()
        .delay(900)
        .duration(500)
        .style('opacity', 1);

    //cells.enter().append('td');
    //cells.exit().remove();

    // cells exit selection
    cells.exit()
        .attr('class', 'exit')
        .transition()
        .delay(200)
        .duration(500)
        .style('opacity', 0)
        .remove();

    cells.attr('class', 'update')
        .text(this.ident);

    // row enter selection
    rows.enter().append('tr');

    // rows exit selection
    rows.exit()
        .attr('class', 'exit')
        .transition()
        .delay(200)
        .duration(500)
        .style('opacity', 0)
        .remove();

    // enter-append exit-remove should place in advance
    const cells_in_new_rows = rows
        .selectAll('td')
        .data(this.extract_row_data);

    cells_in_new_rows.enter().append('td')
        .style('opacity', 0)
        .attr('class', 'enter')
        .transition()
        .delay(900)
        .duration(500)
        .style('opacity', 1);

    //cells_in_new_rows.enter().append('td');

    cells_in_new_rows.text(this.ident);



    table.selectAll('tr').select('td').classed('row-header', true);
  }

  render() {
    return (
        <div id="dashboard">
          <table ref={ele => this.table = ele}></table>
        </div>
    );
  }
}

export default DynamicTable

