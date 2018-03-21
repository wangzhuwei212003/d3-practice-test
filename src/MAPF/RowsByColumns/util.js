/**
 * Created by zhuweiwang on 22/03/2018.
 */

module.exports = {

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
  HCPriority: function (row, col) {

    const topTurnRow = 9; // 由于前端界面的问题，这里的值是特殊的，代表最顶部一行刚拐弯。即是最顶部一行减 1
    const topTurnCol = 7; // 同上一个点的 col

    const boxRow = 6; // 中间有箱子的行数、列数
    const boxCol = 5;

    const btmTurnRow = topTurnRow + boxRow * 3;
    const topEndTurnCol = topTurnCol + (boxCol - 1) * 2; // 15

    const pickRow = 22; // 这个是根据UI测试的图里定的。可以说是写死了。

    const ShelfCol = 23; // 一共有这么多列 
    // 行数取值范围 [8,28]
    // 列数取值范围 [1,21]

    // 排错
    if (row > 28 || row < 8 || col < 1 || col > 21) {
      console.log('行列数超出范围');
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
  }

};
