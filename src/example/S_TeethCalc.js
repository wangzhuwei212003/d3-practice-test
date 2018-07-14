/**
 * Created by zhuweiwang on 24/02/2018.
 */

/**
 * Created by zhuweiwang on 29/01/2018.
 */

import React, {Component} from 'react';
import {Table, InputNumber, Button} from 'antd';

const moshu = 4;

//首尾距离
const headTail = 37;

// 孔间距
const holeGap = 60;

// 齿距
const pitch = 6.2832;

// 可接受的误差
const errorAccept = 0;

// const columns = [{
//   title: '首尾间距',
//   dataIndex: 'headTail',
//   sorter: (a, b) => a.headTail - b.headTail,
// }, {
//   title: '孔距',
//   dataIndex: 'holeGap',
//   sorter: (a, b) => a.holeGap - b.holeGap,
// }, {
//   title: '孔距数',
//   dataIndex: 'holeNum',
//   sorter: (a, b) => a.holeNum - b.holeNum,
// }, {
//   title: '总长',
//   dataIndex: 'totalLen',
//   defaultSortOrder: 'descend',
//   sorter: (a, b) => a.totalLen - b.totalLen,
// }, {
//   title: '总长/齿距',
//   dataIndex: 'totalLenDivide',
// }, {
//   title: '总长误差',
//   dataIndex: 'totalLengthError',
//   sorter: (a, b) => a.totalLengthError - b.totalLengthError,
// }];

const columns = [{
  title: '半径1',
  dataIndex: 'radius_1',
  sorter: (a, b) => a.radius_1 - b.radius_1,
}, {
  title: '半径2',
  dataIndex: 'radius_2',
  sorter: (a, b) => a.radius_2 - b.radius_2,
}, {
  title: '角度',
  dataIndex: 'degree',
  sorter: (a, b) => a.degree - b.degree,
}, {
  title: '弧长1',
  dataIndex: 'arc_1',
  sorter: (a, b) => a.arc_1 - b.arc_1,
}, {
  title: '弧长1余数',
  dataIndex: 'remainder_1',
  sorter: (a, b) => a.remainder_1 - b.remainder_1,
}, {
  title: '弧长2',
  dataIndex: 'arc_2',
  sorter: (a, b) => a.arc_2 - b.arc_2,
}, {
  title: '弧长2余数',
  dataIndex: 'remainder_2',
  sorter: (a, b) => a.remainder_2 - b.remainder_2,
}, {
  title: '斜杠',
  dataIndex: 'slash',
  sorter: (a, b) => a.slash - b.slash,
}, {
  title: '斜杠余数',
  dataIndex: 'slash_remainder',
  sorter: (a, b) => a.slash_remainder - b.slash_remainder,
}, {
  title: '竖直高度',
  dataIndex: 'verticalDist',
  sorter: (a, b) => a.verticalDist - b.verticalDist,
}, {
  title: '竖直高度余数',
  dataIndex: 'verticalDist_remainder',
  sorter: (a, b) => a.verticalDist_remainder - b.verticalDist_remainder,
}, {
  title: '水平宽度',
  dataIndex: 'horizontalDist',
  sorter: (a, b) => a.horizontalDist - b.horizontalDist,
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
    this.calc = this.calc.bind(this);

    this.state = ({
      result: [],
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

    //this.loopHole();
  }

  componentDidUpdate() {
    console.log('didupdate occurred');
  }

  // loop from 1 to 200, 孔距数
  loopHole(acceptError) {
    console.log('loopHole');
    console.log(this.state.errorAccept);

    let temp = []; // 重新算，result 临时数据。

    // 600 是以 20 为下界的估计的一个数字。首尾间距范围暂定【20，50】，孔距范围暂定【45，75】
    for (let testHeadTail = 20; testHeadTail < 51; testHeadTail += 1) {

      for (let testHoleGap = 45; testHoleGap < 76; testHoleGap += 1) {

        // 往 result 里面添加数据的时候，考虑首先是 headTail 和 holeGap 一样，然后能够达到这4个档的高度。
        let candidate = [];

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
          if (errorNum <= acceptError &&
              (
                  (totalLen > 2200 && totalLen < 2800) ||
                  (totalLen > 4200 && totalLen < 4800) ||
                  (totalLen > 6200 && totalLen < 6800) ||
                  (totalLen > 8200 && totalLen < 8800)
              )
          ) {
            let tableKey = temp.length + '-' + candidate.length;

            candidate.push({
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

        if (candidate.length > 3) {
          temp = temp.concat(candidate);
        }
      } // end of test holeGap loop
    } // end of test headTail loop

    this.setState({
      result: temp
    }); // 触发 react 里面 update 机制。没有 setState 这一步，this.state.result 也是已经改了。正规的是 [].concat 或者 object.assign, 突出一个深拷贝的做法。

    console.log(this.state.result);

  }

  // 这个是供下载成 csv Excel文件的功能。
  JSON2CSV(JSONData, title, showLabel) {
    const arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData;

    let CSV = '';

    //CSV += title + '\r\n\n';

    if (showLabel) {
      let row = '';

      for (let property in arrData[0]) {
        row += property + ',';
      }

      row = row.slice(0, -1); // 最后一个逗号去掉。截取

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
    //let uri = 'data:text/csv;charset=utf-8,' + escape(CSV); // 这里为什么会提示 deprecated symbol escape ？
    //let uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(CSV); // 这里为什么会提示 deprecated symbol escape ？
    let uri = 'data:text/csv;charset=utf-8,' + encodeURI(CSV); // 这里为什么会提示 deprecated symbol escape ？

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
    console.log('onchange', v);
    this.loopHole(v); // 还是直接传进来了？

    // this.setState({
    //   errorAccept: v
    // }, this.loopHole());

    //this.loopHole(); // 如果写在这里是不同步的。。。

  }; // 上面那个函数能 不用箭头函数，但是这个函数必须要。

  S_inputNumChange = (v) => {
    console.log('onchange', v);
    //this.calc(v); // 还是直接传进来了？
    this.setState({
      errorAccept: v
    });

  }; // 上面那个函数能 不用箭头函数，但是这个函数必须要。

  startCalc = () => {
    this.calc(this.state.errorAccept);
  }

  download = () => {
    this.JSON2CSV(this.state.result, "resultData", true)
  };

  calc(acceptErr = 1) {
    console.info('calc occurred!');
    console.info('acceptErr', acceptErr);
    let self = this;
    /*
     * S形弯道角度可以变、半径长度可以变。大概是有三个 for 循环，两个半径、一个角度
     *
     * 根据这些算出余数，余数要尽可能的接近 0
     *
     * 最后的结果是一个数组，里面是 obj，放进 this.state.result
     *
     */


    const temp = [];

    for (let horizontalDiv = 37; horizontalDiv <= 40; horizontalDiv += 1) {
      const horizontalDist = horizontalDiv * moshu * Math.PI;
      for (let degree = 65; degree <= 80; degree += 0.01) {
        // degree [30, 70]
        const radian = degree * Math.PI / 180; // 将角度转为弧度，以下 Math 三角函数参数是弧度。
        for (let radius_1 = 100; radius_1 <= 300; radius_1 += moshu/2) {
          for (let radius_2 = 100; radius_2 <= 300; radius_2 += moshu/2) {
            // 直径被5整除，就是半径被2.5整除。
            let sample = self.calcBy3(radius_1, radius_2, radian, horizontalDist);
            if (
                sample.remainder_1 < acceptErr &&
                sample.remainder_2 < acceptErr &&
                sample.slash_remainder < acceptErr &&
                sample.verticalDist_remainder < acceptErr
            ) {
              console.log('pass +1');
              temp.push(sample);
            } else {
              continue
            }
          } // r2 loop
        } // r1 loop
      } // degree loop
    }

    console.log(temp);

    this.setState({
      result: temp
    })
  }

  calcBy3(r1, r2, radian, horizontalDist) {
    // 根据两个半径、一个弧长算出余数

    // 1. 第一段弧长
    // 2. 第二段弧长
    // 3. 中间倾斜的长条
    // 4. 整个的竖直高度；

    let arc_1 = r1 * radian;
    let remainder_1 = arc_1 % (moshu * Math.PI); // 第一段弧长除以 moshu pi 的余数

    let arc_2 = r2 * radian;
    let remainder_2 = arc_2 % (moshu * Math.PI); // 第二段弧长除以 moshu pi 的余数

    let slash = (horizontalDist - r1 + r1 * Math.cos(radian) - r2 + r2 * Math.cos(radian)) / Math.sin(radian); // 中间倾斜的长条
    let slash_remainder = slash % (moshu * Math.PI); // 斜条余数

    let verticalDist = r1 * Math.sin(radian) + r2 * Math.sin(radian) + slash * Math.cos(radian);
    let verticalDist_remainder = verticalDist % (moshu * Math.PI); // 整个的竖直高度余数

    let tableKey = radian + '-' + r1 + '-' + r2;
    let degree = radian * 180 / Math.PI;
    return {
      key: tableKey,
      radius_1: r1,
      radius_2: r2,
      radian: radian,
      degree: degree,
      arc_1: arc_1.toFixed(5),
      remainder_1: remainder_1.toFixed(5),
      arc_2: arc_2.toFixed(5),
      remainder_2: remainder_2.toFixed(5),
      slash: slash.toFixed(5),
      slash_remainder: slash_remainder.toFixed(5),
      verticalDist: verticalDist.toFixed(5),
      verticalDist_remainder: verticalDist_remainder.toFixed(5),
      horizontalDist: horizontalDist.toFixed(5)
    }
  }

  testMath_Trigonometric() {
    console.info(Math.PI);
    console.info('Math.sin(Math.PI)', Math.sin(Math.PI));
    console.info('Math.sin(Math.PI/2)', Math.sin(Math.PI / 2));
    console.info('Math.sin(Math.PI/3)', Math.sin(Math.PI / 3));
    console.info('Math.sin(Math.PI/4)', Math.sin(Math.PI / 4));
    console.info('Math.cos(Math.PI)', Math.cos(Math.PI));
    console.info('Math.cos(Math.PI/2)', Math.cos(Math.PI / 2));
    console.info('Math.cos(Math.PI/3)', Math.cos(Math.PI / 3));
    console.info('Math.cos(Math.PI/4)', Math.cos(Math.PI / 4));
  }

  render() {
    return (
        <div style={{'width': 1500, 'height': 1000}}>
          {/*<svg ref={node => this.node = node}*/}
          {/*width={500} height={500}*/}
          {/*></svg>*/}
          <p>Instruction</p>
          <p>数字输入框中标识允许误差，startCalc：调用 calc 和 calcBy3 方法</p>
          <p>根据模数以及开贵的要求凑齿数</p>
          <p>允许误差</p>
          {/*<InputNumber min={0} max={10} defaultValue={0} step={0.1} onChange={this.inputNumChange} />*/}
          <InputNumber min={0} max={10} defaultValue={0} step={0.1} onChange={this.S_inputNumChange}/>
          {/*<Button type="primary" size={'small'} onClick={this.testMath_Trigonometric}>Test Trigonometric</Button>*/}
          {/*<Button type="primary" size={'small'} onClick={() => this.calc()}>Test calc</Button>*/}
          <Button type="primary" size={'small'} onClick={this.startCalc}>start calc</Button>
          <Button type="primary" size={'small'} onClick={this.download}>download</Button>
          <Table columns={columns} dataSource={this.state.result} size={"small"} pagination={{pageSize: 25}}/>
        </div>

    )
  }
}

export default Test
