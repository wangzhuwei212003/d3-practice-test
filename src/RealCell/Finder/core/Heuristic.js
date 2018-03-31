/**
 * Created by zhuweiwang on 31/03/2018.
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

export default {
  /**
   * Huicang distance.
   *
   * @param {number} startRow - unit 当前点的 row.
   * @param {number} startCol - unit 当前点的 col. START 是指的当前作为判断的点，其实就是所有的点都要能够算到。
   *
   * @param {number} endRow - unit 目标终点的 row. END 的点只可能是中间的货位，以及拣货台。
   * @param {number} endCol - unit 目标终点的 col.
   *
   * @return {number} 具有期望效果的 heuristic
   *
   * 运动方向暂定为
   * 1. 顶部的向右
   * 2. 底部的向左、
   * 3. 竖直方向同列能够上下。 // 暂定为只有下。
   *
   */
  huicang: function (startRow, startCol, endRow, endCol) {

    const topTurnRow = topLeftRow;
    const topTurnCol = topLeftCol;

    const boxRow = boxRowNum;
    const boxCol = boxColNum;

    const btmTurnRow = topTurnRow + boxRow * 3; // 中间部分最底一行的格子行数
    const topEndTurnCol = topTurnCol + (boxCol - 1) * 2; // 中间部分最右侧一列的格子列数

    const pickRow = pickStationRow; // 这个是根据UI测试的图里定的。可以说是写死了。拣货台的行数。22

    const ShelfCol = shelfColLen; // 一共有这么多列, 23 列，不从 0 开始。

    // 排错
    if(endRow === pickRow && (endCol === 0 || endCol === colNum - 4)){
      //console.log('目标为拣货台');
    } else if(
      endRow >= 1 && endRow <= rowNum - 2 &&
      endCol >= 8 && endCol <= colNum - 12
    ){
      //console.log('目标为中间货位'); // 目标是中间货位，这个是 HCPriority 一致的计算方法。
    }else{
      console.log('目标设置错误。');
      debugger;
      return 0; // 除了拣货台和中间的货位，其他位置的目标都是不允许的。
    }

    // 分两部分，
    // 1. 可以上下的部分（中间部分，且当前列数和目标列数相同）；
    // 2. 只有唯一路径的部分
    //    1. 上升列到最顶端
    //    2. 顶部一行，一直到最右侧
    //    3. 下降列到最底端
    //    4. 底部一行
    //    5. 中间部分，列数和目标列数不同
    if (
      startRow >= 1 && startRow <= rowNum - 2 &&
      startCol >= 8 && startCol <= colNum - 12 &&
      startCol === endCol
    ) {// 1. 中间货位部分，并且，目标终点位置是相同列
      return Math.abs(startRow - endRow); // 直接是返回的 行数的步数之差。

    } else if (startCol === 0) {
      // 2-1 上升列到刚要转为水平的 一段
      if (endRow === pickRow && (endCol === 0 )) {
        // 目标点是左边拣货台
        if (startRow >= pickRow) {
          // 当前位置在拣货台下方
          return startRow - endRow
        } else {
          //在左边拣货台上方，那就只能绕圈了，到左上方的点的Manhattan + 左上方点到右下点的Manhattan + 终点（左边拣货台）的Manhattan
          return (startRow) +
              (colNum - 4) + (rowNum - 1) +
              (rowNum - 1 - pickRow) + (colNum - 4);
        }
      } else {
        // 除此之外，目标是右边拣货台、中间的拣货位，到左上方的点的Manhattan + 左上方点和终点的 Manhattan 距离
        return (startRow) +
            (endCol) + (endRow);
      }
    } else if (startRow === 0) {
      // 2-2 最上面一行，货位正上方一段，一直到最右侧
      if (endCol < startCol) {
        // 目标点是后面 那就只有绕圈。
        if (endRow === pickRow && (endCol === 0 )) {
          // 目标点是左边拣货台。// 当前到右下点的Manhattan + 终点（左边拣货台）的Manhattan
          return (colNum - 4 - startCol) + (rowNum - 1 - startRow) +
              (rowNum - 1 - pickRow) + (colNum - 4);

        } else {
          // 目标点是中间的货位了。需要绕圈。上面的基础上 左边拣货台到左上方的Manhattan + 左上方到目标的Manhattan
          return (colNum - 4 - startCol) + (rowNum - 1 - startRow) +
              (rowNum - 1 - pickRow) + (colNum - 4) +
              pickRow +
              (endCol) + (endRow);
        }
      } else {
        // 目标是正下方或者是右方、中间的拣货位，直接就是当前点和终点的 Manhattan 距离
        return (endCol - startCol) + (endRow - startRow);
      }
    } else if (startCol === colNum - 4) {
      // 2-3 下降列到最底下水平列。
      if (endRow === pickRow && (endCol === colNum - 4 )) {
        // 目标点是右边拣货台
        if (startRow <= pickRow) {
          // 起点在拣货台上方。
          return (endRow - startRow)
        } else {
          //在右边拣货台下方，那就只能绕圈了，到右下点的Manhattan + 左上方的点的Manhattan + 左上方点到右拣货台的Manhattan
          return (rowNum - 1 - startRow) +
              (rowNum - 1) + (colNum - 4) +
              (pickRow) + (colNum - 4);
        }
      } else if (endRow === pickRow && (endCol === 0 )) {
        // 目标点是左边拣货台
        return (rowNum - 1 - startRow) +
            (rowNum - 1 - pickRow) + (colNum - 4);

      } else {
        // 目标是中间的货位
        return (rowNum - 1 - startRow) +
            (rowNum - 1) + (colNum - 4) +
            (endRow) + (endCol);
      }

    } else if (startRow === rowNum - 1) {
      // 2-4 当前点在最底部一行
      if (endRow === pickRow && (endCol === 0 )) {
        // 目标点是左边拣货台
        return (startRow - endRow ) + (startCol - endCol );
      } else if (endRow === pickRow && (endCol === colNum - 4 )) {
        // 目标点是右边拣货台 到左边拣货台Manhattan + 到左上角的Manhattan + 左上角到右边拣货台Manhattan
        return (startRow - pickRow ) + (startCol) +
            (pickRow) +
            (endCol) + (endRow);
      } else {
        // 目标是中间的货位
        return (startRow - pickRow ) + (startCol) +
            (pickRow) +
            (endCol) + (endRow);
      }

    } else if (
      startRow >= 1 && startRow <= rowNum - 2 &&
      startCol >= 8 && startCol <= colNum - 12 &&
      startCol !== endCol
    ) {
      // 2-5 中间部分，需要绕
      if(endRow === pickRow && (endCol === 0 )){
        // 目标是左边拣货台
        // 当前列数和目标列数不同，到当前列底部 + 左边拣货台Manhattan
        return (rowNum - 1 - startRow) +
            (startCol )+(rowNum -1 -pickRow);
      }else {
        // 目标是中间货位，或者右边拣货台
        // 当前列数和目标列数不同，到当前列底部 + 左边拣货台Manhattan + 左上角Manhattan + 目标位置Manhattan
        return (rowNum - 1 - startRow) +
            (startCol )+(rowNum -1 -pickRow)+
            (pickRow) +
            (endCol ) + (endRow);
      }
    } else {
      console.log('some senario not expected!');
      console.log('startRow, startCol, endRow, endCol',startRow, startCol, endRow, endCol)
      console.log(startRow >= topTurnRow && startRow <= btmTurnRow);
      console.log(startCol >= topTurnCol && startCol <= topEndTurnCol);
      console.log(startCol === endCol);
      debugger;

    }
  }

};
