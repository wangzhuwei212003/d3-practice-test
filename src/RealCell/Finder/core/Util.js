/**
 * Created by zhuweiwang on 31/03/2018.
 */
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

} from '../../config';

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
  if (row > rowNum - 1 || row < 0 || col < 0 || col > colNum - 3) {
    console.log('行列数超出范围'); // 当前点的行数、列数。
    debugger;
    return 0; //
  }

  if (
      (row <= pickRow - 1 && row >= 0 && col === 0 ) ||
      (row === 0)
  ) {// 1 左边拣货台上面一格 到 顶部水平行到最右侧

    // 拣货台的那个点的 priority 最大，拣货台上面一个点的 priority 最小
    return col - row; // 直接是返回代表 priority 的数值。 col越大越重要，row越小越重要

  } else if (
      row >= 1 && row <= rowNum - 2 &&
      col >= 8 && col <= colNum - 12
  ) {
    // 2 中间货位部分, 32 - 0 = 32 是上个部分最大的值
    return 32 + (row ) * (colNum - 4) - col;

  } else if (
      row <= rowNum - 2 && row >= 1 &&
      col === colNum - 4
  ) {
    // 3. 右边下降列到底部（不包括上下两交点）。 上部分最大值：32+(27 -2 )*(36 -4) - 8 = 824
    return 824 + row;

  } else if (
      (row <= rowNum - 1 && row >= pickRow && col === 0 ) ||
      (row === rowNum - 1)
  ) {
    // 4. 最底一行 到 左边拣货台 。上面最大priority是 824 + 25 = 849
    return 849 + colNum - col + rowNum - row

  } else {
    console.log('some senario not expected!');
    console.log('row, col', row, col);
    debugger;
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
          (row === 0 && column < colNum - 3) ||
          (row === rowNum - 1 && column < colNum - 3)
      ) {
        // 第一行、最后一行的点，没有障碍的点
        ob = 0;
      }
      if (
          column === 0 ||
          column === colNum - 4

      ) {
        ob = 0; // 第一列，最后一列没有障碍
      }
      if (
          column > 7 &&
          column < colNum - 11 &&
          (column - 8) % 4 === 0
      ) {
        // 中间正常货位部分，没有障碍
        ob = 0;
      }
      matrixData[row].push(ob);
    }
  }
  // console.log(matrixData);
  // debugger;
  return matrixData;
};

export default {}