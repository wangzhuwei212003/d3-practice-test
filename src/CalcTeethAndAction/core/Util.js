/**
 * Created by zhuweiwang on 02/04/2018.
 */
// import {
//   rowNum,
//   colNum,
//
//   pickStationRow,
//   firstGoDownCol,
//   lastGoDownCol,
//   lastGoDownPickCol,
//   divideCell,
//   lookUpRowNum,
//
//   occupyRowConfig,
//   occupyColConfig,
// } from '../configTeeth';
import {
  rowNum,
  colNum,

  pickStationRow,
  firstGoDownCol,
  lastGoDownCol,
  lastGoDownPickCol,
  divideCell,
  lookUpRowNum,

  occupyRowConfig,
  occupyColConfig,
} from '../config_V3';


export const backtrace = function (node) {
  const path = [[node.row, node.col]];
  while (node.parent) {
    node = node.parent;
    path.push([node.row, node.col]);
  }
  return path.reverse();
};

export const backtraceNode = function (node) {
  const pathTest = [node];
  while (node.parent) {
    node = node.parent;
    pathTest.push(node);
  }
  return pathTest.reverse();
};

/**
 * Huicang priority.
 *
 * @param {number} row - unit 当前点的 row.
 * @param {number} col - unit 当前点的 col
 *
 * @return {number} 具有期望效果的 priority，用来在heap里比较优先级。
 *
 * 分为6个部分
 * 1. 左边拣货台上面一格 到 顶部水平行开始转弯
 * 2. 中间有货位顶部一行部分
 * 3. 中间货位没有和水平运动交错的部分
 * 4. 右边下降列到底部
 * 5. 最底一行和下降列交汇的部分
 * 6. 剩下的部分到拣货台。
 *
 */

// TODO: 直接存下来，不用每次都算。死数字改配置8..., 单元测试
export const CalcPriority = function (cellRow, cellCol) {
  // 需要用到的数据
  // const pickStationRow = pickStationRow; // 拣货台的行数 21
  // const firstGoDownCol = firstGoDownCol; // 开始下降的第一列列数 8
  // const lastGoDownCol = lastGoDownCol; // 开始下降的有货位的最后一列列数 24
  // const lastGoDownPickCol = lastGoDownPickCol; // 下降列拣货台的列数 32
  const btmInterBeginRow = rowNum - 1 - occupyRowConfig; // 底部开始有交汇的行数，开始进入底部的通道 20
  const btmRow = rowNum - 1; // 最底部一行行数 26
  const lastCol = colNum - 1; // 最后一列列数 35
  const occupyRow = occupyRowConfig; // 占位的行数 6

  if (
      cellRow >= 0 && cellRow < pickStationRow &&
      cellCol >= 0 && cellCol < firstGoDownCol
  ) {
    // 拣货台上方一格到第一列即将转弯下降的一格
    return pickStationRow - cellRow + cellCol;
    // 最小：pickStationRow - (pickStationRow - 1) + 0, 1
    // 最大：pickStationRow - 0 + (firstGoDownCol - 1), 21 + 7 = 28
  } else if (
      cellRow === 0 &&
      cellCol >= firstGoDownCol && cellCol <= lastGoDownCol
  ) {
    // 中间货位顶部一行。
    return pickStationRow + cellCol;
    // 最小：pickStationRow + firstGoDownCol， 21 + 8 = 29，
    // 最大：pickStationRow + lastGoDownCol， 21 + 36 - 12 = 45
  } else if (
      cellRow > 0 && cellRow <= btmInterBeginRow &&
      cellCol >= firstGoDownCol && cellCol <= lastGoDownCol
  ) {
    // 中间货位，不存在和底部横向的小车交汇的区域，不包括顶部一行。
    return pickStationRow + lastGoDownCol + 1 + (lastGoDownCol) * cellRow - cellCol;
    // 最小：pickStationRow + lastGoDownCol + 1 + (lastGoDownCol) * 1 - lastGoDownCol, 46，
    // 最大：pickStationRow + lastGoDownCol + 1 + (lastGoDownCol) * btmInterBeginRow - firstGoDownCol，46 + 24*(26-7) - 8 = 494
  } else if (
      cellRow >= 0 && cellRow <= btmInterBeginRow &&
      cellCol <= lastCol && cellCol > lastGoDownCol
  ) {
    // 下降列 + 一小段水平轨道。
    return pickStationRow + cellCol + cellRow;
    // 最小：pickStationRow + （lastGoDownCol + 1） + 0， 46，
    // 最大：pickStationRow + （lastGoDownPickCol） + btmInterBeginRow，21 + 32 + （27 - 1 - 7）= 72
  } else if (
      cellRow <= btmRow && cellRow > btmInterBeginRow &&
      cellCol <= lastCol && cellCol >= firstGoDownCol
  ) {
    // 中间货位，底部 occupyRow 行数的空间。
    // 从右到左是减小，从上往下，priority 是变大。
    return pickStationRow + lastGoDownCol + 1 + (lastGoDownCol) * btmInterBeginRow - firstGoDownCol
        + cellRow + (lastGoDownPickCol - cellCol) * occupyRow;
    // 最小：494 + （btmInterBeginRow + 1） + (lastGoDownPickCol - （lastGoDownPickCol)) * CONFIG.occupyRowConfig，494+(20) = 514，
    // 最大：494 + （smallRowNum - 1） + (lastGoDownPickCol - 8) * CONFIG.occupyRowConfig = 688，
  } else if (
      cellRow <= btmRow && cellRow >= pickStationRow &&
      cellCol >= 0 && cellCol < firstGoDownCol
  ) {
    // 最后到拣货台部分
    return pickStationRow + lastGoDownCol + 1 + (lastGoDownCol) * btmInterBeginRow - firstGoDownCol
        + btmRow + (lastGoDownPickCol - firstGoDownCol) * occupyRow
        + firstGoDownCol - cellCol + (btmRow - cellRow);
    // 最小：688 + 8 - 7 + 0 = 689，
    // 最大：688 + 8 - 0 + 26 - 21 = 701，
  } else {
    console.warn('some scenario not considered! 行列数超出范围。');
  }
};

export const generateMatrix = function () {
  // 根据中间货位的行数、列数来得到整个代表物理障碍的 0-1 矩阵，看起来并不像实际的地图，这个是根据划分格子方法为了寻路。
  const matrixData = [];
  for (let row = 0; row < rowNum; row += 1) {
    matrixData.push([]);
    for (let column = 0; column < colNum; column += 1) {
      let ob = 1;
      // 0 表示没有障碍，1 表示有障碍。
      // 因为看起来是有障碍的点比较多，默认就是有障碍。
      // 我这边是为了显示的方便，使用的 web 里的坐标系，左上角是（0，0），往右往下变大。
      if (
          (row === 0 && column <= lastGoDownPickCol) ||
          (row === rowNum - 1 && column <= lastGoDownPickCol)
      ) {
        // 第一行、最后一行的点，没有障碍的点
        ob = 0;
      }
      if (
          column === 0 ||
          column === lastGoDownPickCol
      ) {
        ob = 0; // 第一列，最后一列没有障碍
      }
      if (
          column >= firstGoDownCol &&
          column <= lastGoDownCol &&
          (column - firstGoDownCol) % divideCell === 0
      ) {
        // 中间正常货位部分，没有障碍
        ob = 0;
      }
      matrixData[row].push(ob);
    }
  }
  // logger.debug(matrixData);
  return matrixData;
};

export const generateZeroMatrix = function () {
  // 生成全0矩阵，0标识没有障碍
  const matrixData = [];
  for (let row = 0; row < rowNum; row += 1) {
    matrixData.push([]);
    for (let column = 0; column < colNum; column += 1) {
      matrixData[row].push(0);
    }
  }
  // logger.debug(matrixData);
  return matrixData;
};


export default {};
