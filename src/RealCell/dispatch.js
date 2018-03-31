/**
 * Created by zhuweiwang on 31/03/2018.
 */
/**
 * Created by zhuweiwang on 29/03/2018.
 */
import Heap from 'heap';
import HCCoopFinder from './Finder/HCCoopFinder';

import {
  shuttleAmount,
  rowNum,
  colNum,
  cellW,
  cellH,

  timeGap,
  searchDeepth,

} from './config';
import * as Util from './Finder/core/Util';

// /* 这里需要保存的数据，
//  * 1. pathTable 三维数组
//  * [
//  *  [[row, col], [row, col], [row, col], ... , [row, col]],
//  *  [[row, col], [row, col], [row, col], ... , [row, col]],
//  *  .
//  *  .
//  *  .
//  * ]
//  *
//  * 2. goalTable 三维数组，当前的起点和终点
//  * [
//  *  [[row, col], [row, col]],
//  *  [[row, col], [row, col]],
//  *  .
//  *  .
//  *  .
//  * ]
//  *
//  */
//
let pathTable = [];
let goalTable = [];
let matrixZero = []; // 0-1矩阵，用来记录除其他小车之外的障碍。

let asdf = 1;

export const testSet = function () {
  asdf += 1
};
export const testGet = function () {
  return asdf;
};

export const setPathTable = function (newPathTable) {
  pathTable = newPathTable;
};

export const setGoalTable = function (newGoalTable) {
  goalTable = newGoalTable;
};

export const setMatrixZero = function (newMatrixZero) {
  matrixZero = newMatrixZero;
};

export const getPathTable = function () {
  return pathTable;
};

export const initializePathTable = function () {
  /*
   * 初始化路径。
   *
   * 用到的数据：goalTable，首先这个要求goalTable不为空。
   *
   * 更改的数据：pathTable
   */

  const _unitsNum = shuttleAmount;
  const _searchDeepth = searchDeepth;
  const _matrixZero = matrixZero; // matrixZero 是不会变的。
  let _goalTable = JSON.parse(JSON.stringify(goalTable)); // deep copy 深拷贝当前的 goalTable
  let startRow, startCol; // 这个是为了寻找当前点的 priority，是 this.goalTable 里的第一个元素
  let _pathTable = Array(_unitsNum).fill([]); // 重置 pathtable，初始化当前的 pathTable。

  const priorityHeap = new Heap(function (nodeA, nodeB) {
    return -(nodeA.p - nodeB.p); // priority 大的先pop出来
  });

  // 两个for循环，
  // 1. 把所有 goalTable 里的起点放进 heap，
  // 2. 按照 priority 排序，并依次进行寻路。
  for (let i = 0; i < _goalTable.length; i += 1) {
    startRow = _goalTable[i][0][0]; // 起点的行数，当前点的行数
    startCol = _goalTable[i][0][1]; // 起点的列数，当前点的列数
    priorityHeap.push({
      index: i,
      p: Util.HCPriority(startRow, startCol)
    });
  }
  for (let i = 0; i < _unitsNum; i += 1) {
    let obj = priorityHeap.pop();
    let optIndex = obj['index'];
    //console.log(optIndex);
    const finder = new HCCoopFinder();
    const path = finder.findPath(optIndex, _goalTable, _searchDeepth + 1, _pathTable, _matrixZero, rowNum, colNum);

    _pathTable[optIndex] = path.slice(0, path.length - optIndex); // 当 i = 0 的时候，就是整个 path
  } // end for loop 所以 searchDeepth 必须要比 unit 的个数多。

  pathTable = _pathTable; // 更新当前保存的数据里的 pathtable。

};

export const initialNextTimeStep = function () {
  /*
   * 初始化路径之后，这个是连续地隔一段时间重新规划一次的方法。
   *
   * 根据 pathTable 前端显示的方法这里是肯定不需要的。
   * 1. 这里更新 goalTable 的起点，
   * 2. 重新规划
   * 3. 更新 pathtable
   */

  if(!checkGoalTable(goalTable)){
    // 如果是没有通过测试，那么就是应该是报错了！
    console.log('goalTable illegal');
    debugger;
    return
  }

  if(!checkPathTable(pathTable)){
    // 如果是 pathTable 为空，那么是应该 initialize path，否则就不用了。
    console.log('直接初始化路径。');
    initializePathTable();
  }else{
    // 如果是正在进行中，就是应该有更新 goalTable 之后再去算路径、更新 pathTable。
    //console.log('initial next step occurred!!');
    let _goalTable = JSON.parse(JSON.stringify(goalTable)); // deep copy 当前的 goalTable

    // 更新 goaltable 的起点，用来路径规划的起点是 pathTable 的下一个点，也就是。
    for (let i = 0; i < _goalTable.length; i += 1) {
      _goalTable[i][0] = pathTable[i][1];
    }
    goalTable = _goalTable;
    // 算路径，按照优先级
    initializePathTable();
  }
};

const checkGoalTable = function (goalTable) {
  // 应该是一个三维数组，格式参考上面。
  //
  // true means GOOD to run the nextStep. 为了确定goalTable不为空，且符合上面的格式。

  return goalTable.length === shuttleAmount &&
      goalTable[0].length === 2 && goalTable[0][1].length === 2 &&
      goalTable[shuttleAmount-1].length === 2 && goalTable[shuttleAmount-1][1].length === 2;

};
const checkPathTable = function (pathTable) {
  // 应该是一个三维数组，格式参考上面
  // true means GOOD to run the nextStep. 每个小车的路径不为空。

  return pathTable.length === shuttleAmount &&
      pathTable[0][1].length === 2 &&
      pathTable[shuttleAmount-1][1].length === 2;

};

export default {}