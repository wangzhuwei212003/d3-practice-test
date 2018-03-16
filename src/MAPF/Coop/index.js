/**
 * Created by zhuweiwang on 12/03/2018.
 */
import React, {Component} from 'react';
import * as d3 from 'd3';
import {Button} from 'antd';
import './index.css';

import CoopAstarFinder from '../finders/CoopAstarFinder';
import Grid from '../core/Grid';

class Coop extends Component {
  constructor(props) {
    super(props);

    this.nowTimeStep = 0;
  }

  componentDidMount() {
    console.log('component did mount');
  }

  componentDidUpdate() {
    console.log('component did update')
  }

  testCoop(){
    const finder = new CoopAstarFinder();

    const index = 0;
    const goalTable = [
      [[3, 4], [13, 14]],
      [[5, 6], [15, 16]],
      [[7, 8], [17, 18]],
      [[9, 10], [19, 20]],
    ];
    const searchDeepth = 40;
    const pathTable = [
      [],
      [],
      [],
      [],
    ];
    const matrixZero = Array(30).fill(Array(30).fill(0)); // fast way to create dimensional array?

    //1. 只要有 unit 走完了一定的步长，开始触发 coopFinder，就把 pathTable里的之前的timestep shift出去，
    // 开始规划的接下来的这一步 timestep 为 0；
    //
    // 更新goaltable里的 start 和 goal（goal 可能不需要更改）；

    // 更新path table，shift掉已经走过的路径；
    // path table里的路径数组不一定是等长的。初始化的 path table 是有梯度的，
    // 此时的梯度我都初始化为wait 是没错的，缺点是可能一开始最差情况要等 n 步（n是unit数量)
    //
    // 除此之外，index、searchDeepth、matrixZero 都是明了的。

    let timestep = 0;

    // update timestep; 需要改变的是 pathtable。

    let optIndex = pathTable.findIndex(function (path) {
      path.length <= searchDeepth;
    }); // 得到path剩余长度 < 某个值的时候，该 unit 就需要重新plan了

    // 重新规划
    console.log('start find');
    console.log(Date.now());
    const starTime = Date.now();

    //const path = finder.findPath(index, goalTable, searchDeepth, pathTable, matrixZero);

    console.log('end find');
    const endTime = Date.now();
    console.log(Date.now());
    console.log('计算用时： ', endTime - starTime);

    // console.log(path);
  }

  coopNextTimeStep(){
    // 更新 timestep，
    // 如果需要重新规划，
    // 1. timestep 归零；
    // 2. unshift掉已经走过的 path table；
    // 3. 规划，并添加新的path到 path table


  }


  render() {
    return (
        <div ref={ele => this.grid = ele} className="instruction">
          <Button type="primary" onClick={() => this.testCoop()} >test</Button>
        </div>

    );
  }
}

export default Coop
