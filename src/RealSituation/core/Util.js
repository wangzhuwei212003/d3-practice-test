/**
 * Created by zhuweiwang on 29/03/2018.
 */
import {
  rowNum,
  colNum,

  topLeftRow,
  topLeftCol,
  boxRowNum,
  boxColNum,
  pickStationRow,
  shelfColLen,

} from '../CoopDispatch/config';

export const backtrace = function (node) {
  const path = [[node.row, node.col]];
  while (node.parent) {
    node = node.parent;
    path.push([node.row, node.col]);
  }
  return path.reverse();
}; // 这里是用的 row、col，不是之前说的 x、y


export const backtraceNode = function (node) {
  const pathTest = [node];
  while (node.parent) {
    node = node.parent;
    pathTest.push(node);
  }
  return pathTest.reverse();
}; // 这里是用的 row、col，不是之前说的 x、y

/**
 * Huicang priority.
 *
 * @param {number} row - unit 当前点的 row.
 * @param {number} col - unit 当前点的 col
 *
 * @return {number} 具有期望效果的 priority，用来在heap里比较优先级。
 *
 * 分为4个部分
 * 1. 左边拣货台上面一格 到 顶部水平行到最右侧
 * 2. 中间有货位部分
 * 3. 右边下降列到底部
 * 4. 最底一行 到 左边拣货台
 *
 */
export const HCPriority = function (row, col) {

  const topTurnRow = topLeftRow;
  const topTurnCol = topLeftCol;

  const boxRow = boxRowNum;
  const boxCol = boxColNum;

  const btmTurnRow = topTurnRow + boxRow * 3;
  const topEndTurnCol = topTurnCol + (boxCol - 1) * 2;

  const pickRow = pickStationRow; // 这个是根据UI测试的图里定的。可以说是写死了。拣货台的行数。22

  const ShelfCol = shelfColLen;

  // 排错
  if (row > 28 - 5 || row < 8 - 5 || col < 1 || col > 21) {
    console.log('行列数超出范围'); // 当前点的行数、列数。
    return 0; //
  }

  if (
      (row <= pickRow - 1 && row >= topTurnRow - 1 &&
      col >= 1 && col <= 3 ) ||
      (row === topTurnRow - 1)
  ) {// 1 左边拣货台上面一格 到 顶部水平行到最右侧

    return col - 1 + 21 - row; // 直接是返回代表 priority 的数值。

  } else if (
      row >= topTurnRow && row <= btmTurnRow &&
      col >= topTurnCol && col <= topEndTurnCol
  ) {
    // 2 中间货位部分, 19 -1 +21 -8 = 31 是上个部分最大的值
    return 31 + (row - topTurnRow) * boxCol + topEndTurnCol - col;

  } else if (
      row <= btmTurnRow + 1 && row >= topTurnRow - 1 &&
      col >= ShelfCol - 4 && col <= ShelfCol - 2
  ) {
    // 3. 右边下降列到底部 31+(27 - 9)*5 + 15 - 7 = 129
    return 129 + (row - topTurnRow + 1) + (col - ShelfCol + 4);

  } else if (
      (row <= btmTurnRow + 1 && row >= pickRow &&
      col >= 1 && col <= 3 ) ||
      (row === btmTurnRow + 1)
  ) {
    // 4. 最底一行 到 左边拣货台 129 + (28 - 8) + (21 - 19) = 151
    return 151 + 21 - col + btmTurnRow + 1 - row

  } else {
    console.log('some senario not expected!');
    console.log('row, col', row, col);
    debugger;

  }

};

export const generateMatrix = function () {
  // 根据中间货位的行数、列数来得到整个代表物理障碍的 0-1 矩阵
  const matrixData = [];

  for (let row = 0; row < rowNum; row += 1) {
    matrixData.push([]);
    for (let column = 0; column < colNum; column += 1) {
      let ob = 0;
      if (row === rowNum - 1 || row === rowNum - 23 && column > 1 && column < colNum - 2) {
        ob = 1; // 最底部一行和最顶部一行的障碍。
      }
      if (row > rowNum - 22 && row < rowNum - 2 && column % 2 === 0 && column > 0 && column < colNum - 1) {
        ob = 1; // 中间竖直方向，的立柱
      }

      if (row === rowNum - 11  && column === 1) {
        // special point
        ob = 1;
      }
      if (row === rowNum - 11  && column === 2) {
        // special point
        ob = 0;
      }
      if (row === rowNum - 10  && column === 3) {
        // special point
        ob = 1;
      }
      if (row === rowNum - 10  && column === 2) {
        // special point
        ob = 0;
      }
      if (row === rowNum - 11  && column === colNum - 2) {
        // special point
        ob = 1;
      }
      if (row === rowNum - 11 && column === colNum - 3) {
        // special point
        ob = 0;
      }
      if (row === rowNum - 10  && column === colNum - 4) {
        // special point
        ob = 1;
      }
      if (row === rowNum - 10  && column === colNum - 3) {
        // special point
        ob = 0;
      }

      if ((column === 0 || column === colNum - 1) && row < rowNum - 1 && row > rowNum - 11 ) {
        ob = 1; // 最靠左右两边的柱子
      }

      if (row === rowNum - 3 && (column === 3 || column === 5 || column === colNum - 4 || column === colNum - 6 )) {
        ob = 1;
      }
      if (row === rowNum - 21 && (column === 5 || column === colNum - 6 )) {
        ob = 1;
      }
      if (row === rowNum - 22 && (column === 2 || column === colNum - 3)) {
        ob = 1;
      }
      matrixData[row].push(ob);
    }
  } // end of for loop

  return matrixData;
};

export default {}