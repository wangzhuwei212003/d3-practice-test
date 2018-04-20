/**
 * Created by zhuweiwang on 10/04/2018.
 */
import * as CONFIG from './configDATA';

export const CalcPriority = function (cellRow, cellCol) {
  let priority = 1;

  if (
      cellRow < CONFIG.pickStationRow &&
      cellCol >= 0 && cellCol < 8
  ) {
    // 拣货台上方一格到即将转弯下降的一格

    return CONFIG.pickStationRow - cellRow + cellCol; // 最小值 1，最大 21 + 7 = 28
  } else if (
      cellRow === 0 &&
      cellCol >= 8 && cellCol <= CONFIG.smallColNum - 12
  ) {
    // 中间货位顶部一行。

    return 21 + cellCol; // 最小值 21 + 8 = 29，最大 21+36-12 = 45
  } else if (
      cellRow > 0 && cellRow <= CONFIG.smallRowNum - 1 - CONFIG.occupyRowConfig &&
      cellCol >= 8 && cellCol <= CONFIG.smallColNum - 12
  ) {
    // 中间货位，不存在和底部横向的小车交汇的区域，不包括顶部一行。

    return 45 + 1 + 24 * cellRow - cellCol; // 最小值 46，最大 46 + 24*(26-5) - 8 = 542
  } else if (
      cellRow >= 0 && cellRow <= CONFIG.smallRowNum - 1 - CONFIG.occupyRowConfig &&
      cellCol > CONFIG.smallColNum - 12
  ) {
    // 下降列 + 一小段水平轨道。
    return 45 + cellCol - (CONFIG.smallColNum - 12) + cellRow; // 最小值 45 + 1 = 46，最大 56+ 21= 77
  } else if (
      cellRow > CONFIG.smallRowNum - 1 - CONFIG.occupyRowConfig &&
      cellCol >= 8
  ) {
    // 从右到左是减小，从上往下，priority 是变大。 // 最小值 542 + 1 = 543，最大 542 + 5 +  24*5= 667
    return 542 + (cellRow - (CONFIG.smallRowNum - 1 - CONFIG.occupyRowConfig)) + (CONFIG.smallColNum - 4 - cellCol) * CONFIG.occupyRowConfig;
  } else if (
      cellRow >= CONFIG.pickStationRow &&
      cellCol < 8
  ) {
    // 最后到拣货台部分
    return 667 - (8 - cellCol) - (CONFIG.smallRowNum - 1 - cellRow)
  } else {
    console.log('some scenario not considered!');
  }
};
