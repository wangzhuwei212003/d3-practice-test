/**
 * Created by zhuweiwang on 12/03/2018.
 */

module.exports = {

  /**
   * Manhattan distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} dx + dy
   */
  manhattan: function (dx, dy) {
    return dx + dy;
  },

  /**
   * Euclidean distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} sqrt(dx * dx + dy * dy)
   */
  euclidean: function (dx, dy) {
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Octile distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} sqrt(dx * dx + dy * dy) for grids
   */
  octile: function (dx, dy) {
    var F = Math.SQRT2 - 1;
    return (dx < dy) ? F * dx + dy : F * dy + dx;
  },

  /**
   * Chebyshev distance.
   * @param {number} dx - Difference in x.
   * @param {number} dy - Difference in y.
   * @return {number} max(dx, dy)
   */
  chebyshev: function (dx, dy) {
    return Math.max(dx, dy);
  },

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
   * 3. 竖直方向同列能够上下
   *
   */
  huicang: function (startRow, startCol, endRow, endCol) {

    const topTurnRow = 9; // 由于前端界面的问题，这里的值是特殊的，代表最顶部一行刚拐弯。即是最顶部一行减 1
    const topTurnCol = 7; // 同上一个点的 col

    const boxRow = 6; // 中间有箱子的行数、列数
    const boxCol = 5;

    const btmTurnRow = topTurnRow + boxRow * 3;
    const topEndTurnCol = topTurnCol + (boxCol - 1) * 2;

    const pickRow = 22; // 这个是根据UI测试的图里定的。可以说是写死了。

    const ShelfCol = 23; // 一共有这么多列

    // 排错, TODO
    if(endRow === pickRow && (endCol === 1 || endCol === ShelfCol - 2)){
      //console.log('目标为拣货台');
    } else if(endRow >= topTurnRow && endRow <= btmTurnRow &&
        endCol >= topTurnCol && endCol <= topEndTurnCol){
      //console.log('目标为中间货位');
    }else{
      console.log('目标设置错误。');
      return 0; //让小车待在原地
    }

    // 分两部分，
    // 1. 可以上下的部分（中间部分，且当前列数和目标列数相同）；
    // 2. 只有唯一路径的部分
    //    1. 上升列到最顶端
    //    2. 顶部一行，一直到最右侧
    //    3. 下降列到最底端
    //    4. 底部一行
    //    5. 中间部分，列数和目标列数不同
    if (startRow >= topTurnRow && startRow <= btmTurnRow &&
        startCol >= topTurnCol && startCol <= topEndTurnCol &&
        startCol === endCol
    ) {// 1 可以上下运动部分，中间部分，并且，目标终点位置是相同列
      return Math.abs(startRow - endRow); // 直接是返回的 行数的步数之差。

    } else if (startCol <= 3 && startRow <= btmTurnRow) {
      // 2-1 上升列到刚要转为水平的 一段
      if (endRow === pickRow && (endCol === 1 )) {
        // 目标点是左边拣货台
        if (startRow >= pickRow) {
          return startRow - endRow
        } else {
          //在左边拣货台上方，那就只能绕圈了，到左上方的点的Manhattan + 左上方点到右下点的Manhattan + 终点（左边拣货台）的Manhattan
          return (3 - startCol) + (startRow - topTurnRow + 1) +
              (ShelfCol - 2 - 3) + (btmTurnRow + 1 - topTurnRow + 1) +
              (btmTurnRow + 1 - pickRow) + (ShelfCol - 2 - 1);
        }
      } else {
        // 除此之外，目标是右边拣货台、中间的拣货位，到左上方的点的Manhattan + 左上方点和终点的 Manhattan 距离
        return (3 - startCol) + (startRow - topTurnRow + 1) +
            (endCol - 3) + (endRow - topTurnRow + 1);
      }
    } else if (startRow === topTurnRow - 1) {
      // 2-2 最上面一行，货位正上方一段，一直到最右侧
      if (endCol < startCol) {
        // 目标点是后面 那就只有绕圈。
        if (endRow === pickRow && (endCol === 1 )) {
          // 目标点是左边拣货台。// 当前到右下点的Manhattan + 终点（左边拣货台）的Manhattan
          return (ShelfCol - 2 - startCol) + (btmTurnRow + 1 - startRow) +
              (btmTurnRow + 1 - pickRow) + (ShelfCol - 2 - 1);
        } else {
          // 这里不用 if 了，直接就是中间的货位了。上面的基础上 左边拣货台到左上方的Manhattan + 左上方到目标的Manhattan
          return (ShelfCol - 2 - startCol) + (btmTurnRow + 1 - startRow) +
              (btmTurnRow + 1 - pickRow) + (ShelfCol - 2 - 1) +
              (3 - 1) + (pickRow - topTurnRow + 1) +
              (endCol - 3) + (endRow - topTurnRow + 1);
        }
      } else {
        // 目标是正下方或者是右方、中间的拣货位，直接就是当前点和终点的 Manhattan 距离
        return (endCol - startCol) + (endRow - startRow);
      }
    } else if (startCol >= ShelfCol - 4 && startRow <= btmTurnRow) {
      // 2-3 下降列到最底下水平列。
      if (endRow === pickRow && (endCol === ShelfCol - 2 )) {
        // 目标点是右边拣货台
        if (startRow <= pickRow) {
          return (endRow - startRow) + (ShelfCol - 2 - startCol)
        } else {
          //在右边拣货台下方，那就只能绕圈了，到右下点的Manhattan + 左上方的点的Manhattan + 左上方点到右拣货台的Manhattan
          return (ShelfCol - 2 - startCol) + (btmTurnRow + 1 - startRow) +
              (btmTurnRow + 1 - pickRow) + (ShelfCol - 2 - 1) + (3 - 1) + (pickRow - topTurnRow + 1) +
              (pickRow - topTurnRow + 1) + (ShelfCol - 2 - 3);
        }
      } else if (endRow === pickRow && (endCol === 1 )) {
        // 目标点是左边拣货台
        return (ShelfCol - 2 - startCol) + (btmTurnRow + 1 - startRow) +
            (btmTurnRow + 1 - pickRow) + (ShelfCol - 2 - 1);
      } else {
        // 目标是中间的货位
        return (ShelfCol - 2 - startCol) + (btmTurnRow + 1 - startRow) +
            (btmTurnRow + 1 - pickRow) + (ShelfCol - 2 - 1) + (3 - 1) + (pickRow - topTurnRow + 1) +
            (endRow - topTurnRow + 1) + (endCol - 3);
      }

    } else if (startRow === btmTurnRow + 1) {
      // 2-4 当前点在最底部一行
      if (endRow === pickRow && (endCol === 1 )) {
        // 目标点是左边拣货台
        return (startRow - endRow ) + (startCol - endCol );
      } else if (endRow === pickRow && (endCol === ShelfCol - 2 )) {
        // 目标点是右边拣货台 到左边拣货台Manhattan + 到左上角的Manhattan + 左上角到右边拣货台Manhattan
        return (startRow - pickRow ) + (startCol - 1 ) +
            (3 - 1) + (pickRow - topTurnRow + 1) +
            (endCol - 3) + (endRow - topTurnRow + 1);
      } else {
        // 目标是中间的货位
        return (startRow - pickRow ) + (startCol - 1 ) +
            (3 - 1) + (pickRow - topTurnRow + 1) +
            (endCol - 3) + (endRow - topTurnRow + 1);
      }

    } else if (startRow >= topTurnRow && startRow <= btmTurnRow &&
        startCol >= topTurnCol && startCol <= topEndTurnCol &&
        startCol !== endCol) {
      // 2-5 中间部分，
      if(endRow === pickRow && (endCol === 1 )){
        // 目标是左边拣货台
        // 当前列数和目标列数不同，到当前列底部 + 左边拣货台Manhattan
        return (btmTurnRow + 1 - startRow) +
            (startCol - 1)+(btmTurnRow +1 -pickRow);
      }else {
        // 目标是中间货位，或者右边拣货台
        // 当前列数和目标列数不同，到当前列底部 + 左边拣货台Manhattan + 左上角Manhattan + 目标位置Manhattan
        return (btmTurnRow + 1 - startRow) +
            (startCol - 1)+(btmTurnRow +1 -pickRow)+
            (3 - 1) + (pickRow - topTurnRow + 1) +
            (endCol - 3) + (endRow - topTurnRow + 1);
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
