/**
 * Created by zhuweiwang on 29/03/2018.
 */
//import { shuttles } from '@backend/shuttle/shuttleInstances.js'; // 这个是得到的我所需要的数据

import Heap from 'heap';
import HCCoopFinder from '../finders/HCCoopFinder';

import {
  shuttleAmount,
  rowNum,
  colNum,
  cellW,
  cellH,

  timeGap,
  searchDeepth,

} from './config';
import Util from '../core/Util';

//const exports = module.exports = {};
//
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

export const findPath = function () {
  // 这个将是之后暴露给旭凯那边的 API，每隔一个 timeGap 就调用这个方法。我这边也根据 timeGap 来做出路径规划。
  /*
   * 根据我所需要的数据，来产生路径
   *
   *
   */

};

export const initializePathTable = function () {
  /*
   * 初始化路径。
   *
   * 用到的数据：goalTable，首先这个要求goalTable不为空。
   *
   * 更改的数据：pathTable
   *
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

export default {}