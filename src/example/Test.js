/**
 * Created by zhuweiwang on 24/02/2018.
 */

/**
 * Created by zhuweiwang on 29/01/2018.
 */

import React, {Component} from 'react';
import {Table, InputNumber, Button} from 'antd';


//首尾距离
const headTail = 37;

// 孔间距
const holeGap = 60;

// 齿距
const pitch = 6.2832;

// 可接受的误差
const errorAccept = 0.1;

const columns = [{
  title: '首尾间距',
  dataIndex: 'headTail',
  sorter: (a, b) => a.headTail - b.headTail,
}, {
  title: '孔距',
  dataIndex: 'holeGap',
  sorter: (a, b) => a.holeGap - b.holeGap,
}, {
  title: '孔距数',
  dataIndex: 'holeNum',
  sorter: (a, b) => a.holeNum - b.holeNum,
}, {
  title: '总长',
  dataIndex: 'totalLen',
  defaultSortOrder: 'descend',
  sorter: (a, b) => a.totalLen - b.totalLen,
}, {
  title: '总长/齿距',
  dataIndex: 'totalLenDivide',
}, {
  title: '总长误差',
  dataIndex: 'totalLengthError',
  sorter: (a, b) => a.totalLengthError - b.totalLengthError,
}];

const data = [{
  key: '1',
  headTail: 1234234,
  holeGap: 1234234,
  holeNum: 1234234,
  totalLen: 32,
  totalLenDivide: 1234,
  totalLengthError: 1
}, {
  key: '2',
  headTail: 1234234,
  holeGap: 1234234,
  holeNum: 1234234,
  totalLen: 42,
  totalLenDivide: 1234234,
  totalLengthError: 1
}, {
  key: '3',
  headTail: 1234234,
  holeGap: 1234234,
  holeNum: 124234,
  totalLen: 32,
  totalLenDivide: 124234234,
  totalLengthError: 1
}];


class Test extends Component {
  constructor(props) {
    super(props);
    //结果放在 this.state 里, 还是 this 里？放在 this.state 里面就是会有变化的时候就 update
    //this.result = [];

    // field 包括 孔距数 holeNum、总长 totalLen、总长/齿距 totalLenDivide、总长误差 totalLengthError

    this.state=({
      result:[],
      errorAccept: errorAccept
    })
  }

  componentDidMount() {
    console.log(this.state);

    console.log('didmount occurred');
    // this.JSON2CSV([{
    //   "Vehicle": "BMW",
    //   "Date": "30, Jul 2013 09:24 AM",
    //   "Location": "Hauz Khas, Enclave, New Delhi, Delhi, India",
    //   "Speed": 42
    // }, {
    //   "Vehicle": "Honda CBR",
    //   "Date": "30, Jul 2013 12:00 AM",
    //   "Location": "Military Road,  West Bengal 734013,  India",
    //   "Speed": 0
    // }], "vehicle", true);

    //this.JSON2CSV(data, "testData", true)

    this.loopHole();
  }

  componentDidUpdate() {

    console.log('didupdate occurred');
  }

  // loop from 1 to 200, 孔距数
  loopHole(acceptError) {
    console.log('loopHole');
    console.log(this.state.errorAccept);

    let temp = []; // 重新算

    // 600 是以 20 为下界的估计的一个数字。首尾间距范围暂定【20，50】，孔距范围暂定【45，75】
    for(let testHeadTail = 20; testHeadTail < 51; testHeadTail += 1 ){

      for(let testHoleGap = 45; testHoleGap < 76; testHoleGap +=1){
        for (let i = 0; i < 600; i += 1) {

          // 根据孔间距数算出总长
          const totalLen = testHeadTail + testHoleGap * i;

          // 如果超出了12米的长度，就终止当前运算
          if (totalLen > 12000) {
            break;
          }

          // 根据齿距算出齿数，以及总长误差
          const doubleDiv = totalLen / pitch; // this is supposed to be a double num
          const floorDiv = Math.floor(doubleDiv); // this is supposed to be an int
          const errorNum = (doubleDiv - floorDiv) * pitch; // 总长误差

          // 如果符合误差范围内，就添加到 result 里。
          if (errorNum <= acceptError) {
            let tableKey = temp.length;

            temp.push({
              key: tableKey,
              headTail: testHeadTail,
              holeGap: testHoleGap,
              holeNum: i,
              totalLen: totalLen,
              totalLenDivide: doubleDiv,
              totalLengthError: errorNum
            });
          }
        } // end of 200 times for loop
      } // end of test holeGap loop
    } // end of test headTail loop

    this.setState({
      result:temp
    }); // 触发 react 里面 update 机制。没有 setState 这一步，this.state.result 也是已经改了。正规的是 [].concat 或者 object.assign, 突出一个深拷贝的做法。

    console.log(this.state.result);

  }

  // 这个是供下载成 csv Excel文件的功能。
  JSON2CSV(JSONData, title, showLabel) {
    const arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

    let CSV = '';

    //CSV += title + '\r\n\n';

    if (showLabel) {
      let row = '';

      for (let index in arrData[0]) {
        row += index + ',';
      }

      row = row.slice(0, -1);

      // append label row with line break
      CSV += row + '\r\n';
    }

    // 1st loop to extract each row
    for (let i = 0; i < arrData.length; i += 1) {
      let row = '';

      // 2nd loop to extract each column and convert it in string comma-seprated
      for (let index in arrData[i]) {
        row += '"' + arrData[i][index] + '",';
      }

      row.slice(0, row.length - 1);

      // add a line break after each row
      CSV += row + '\r\n';
    }

    if (CSV === '') {
      alert('invalid data');
      return;
    }

    //Generate a file name
    let fileName = 'MyReport_';
    fileName += title.replace(/ /g, "_");

    // initialize file format you want csv or xls
    let uri = 'data:text/csv;charset=utf-8,' + escape(CSV); // 这里为什么会提示 deprecated symbol escape ？

    var link = document.createElement("a");
    link.href = uri;

    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  }

  inputNumChange = (v) => {
    console.log('onchange',v);
    this.loopHole(v); // 还是直接传进来了？

    // this.setState({
    //   errorAccept: v
    // }, this.loopHole());

    //this.loopHole(); // 如果写在这里是不同步的。。。

  }; // 上面那个函数能 不用箭头函数，但是这个函数必须要。

  download = () => {
    this.JSON2CSV(this.state.result, "resultData", true)
  };

  render() {
    return (
        <div style={{'width': 850, 'height': 1000}}>
          {/*<svg ref={node => this.node = node}*/}
          {/*width={500} height={500}*/}
          {/*></svg>*/}
          <p>允许误差</p>
          <InputNumber min={0} max={10} defaultValue={0} step={0.1} onChange={this.inputNumChange} />
          <Button type="primary" size={'small'} onClick={this.download} >download</Button>
          <Table columns={columns} dataSource={this.state.result} size={"small"} pagination={{ pageSize: 25 }} />
        </div>

    )
  }
}

export default Test
