/**
 * Created by zhuweiwang on 2018/6/28.
 */
import dispatchConfig from './dispatchConfig';

const {
  rowNum,
  colNum,
  usedRowNum,

  pickStationRow,
  firstGoDownCol,
  lastGoDownCol,
  lastGoDownPickCol,
  divideCell,
  lookUpRowNum,

  h2vUpPinOutStretchCell,
  h2vDownSpecialPinOutStretchCell,
  h2vDownNormalPinOutStretchCell,

  specialTopStartCellCol,
  specialBtmStartCellCol,
  topBoxNormalHeightStartRow,
  topBoxNormalHeightEndRow,
  SDownPartStartRow,
  SDownPartEndRow,
  SUPPartStartRow,
  SUPPartEndRow,
  specialHeightStartRow,
  specialHeightEndRow,

  normalWidth, //水平方向一格的宽度
  normalHeight, // 一般货位高度是 66.83
  topBoxNormalHeight, // 最上面一行货位的高度是 60.23
  specialHeight, // 底部特殊高度，31.62
  compensate, // 方向改变的时候，齿数补偿，25 + 90度
  specialBottomPart, // 底部的特殊部分
  doubleBottomPart,
  specialTopPart, // 顶部的特殊部分
  SUPPart, // S形弯道上部分齿数
  SDownPart, // S形弯道下部分齿数
  timeGap,

  pickSitesSmallRow,
  pickSitesRowGap,

  occupyRowConfig,
  occupyColConfig,
  occupyRowConfigUnload,
  delayGap,
  slowPassGate,
  validSpeedDuration,
  avoidDist,
  crossRoadoccupyRowConfig
} = dispatchConfig;

export const CalcPriority = function (cellRow, cellCol) {
  // 需要用到的数据
  // const pickStationRow = pickStationRow; // 拣货台的行数 21
  // const firstGoDownCol = firstGoDownCol; // 开始下降的第一列列数 8
  // const lastGoDownCol = lastGoDownCol; // 开始下降的有货位的最后一列列数 24
  // const lastGoDownPickCol = lastGoDownPickCol; // 下降列拣货台的列数 32
  const btmInterBeginRow = rowNum - 1 - crossRoadoccupyRowConfig; // 底部开始有交汇的行数，开始进入底部的通道 20 。这个地方不能太靠上。和occupyRow这个值不必一样。
  const btmRow = rowNum - 1; // 最底部一行行数 26
  const lastCol = colNum - 1; // 最后一列列数 35

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
      cellRow > 0 && cellRow < btmInterBeginRow &&
      cellCol >= firstGoDownCol && cellCol <= lastGoDownCol
  ) {
    // 中间货位，不存在和底部横向的小车交汇的区域，不包括顶部一行。
    return pickStationRow + lastGoDownCol + 1 + (lastGoDownCol) * cellRow - cellCol;
    // 最小：pickStationRow + lastGoDownCol + 1 + (lastGoDownCol) * 1 - lastGoDownCol, 46，
    // 最大：pickStationRow + lastGoDownCol + 1 + (lastGoDownCol) * btmInterBeginRow - firstGoDownCol，46 + 24*(26-7) - 8 = 494
  } else if (
      cellRow >= 0 && cellRow < btmInterBeginRow &&
      cellCol <= lastCol && cellCol > lastGoDownCol
  ) {
    // 下降列 + 一小段水平轨道。
    return pickStationRow + cellCol + cellRow;
    // 最小：pickStationRow + （lastGoDownCol + 1） + 0， 46，
    // 最大：pickStationRow + （lastGoDownPickCol） + btmInterBeginRow，21 + 32 + （27 - 1 - 7）= 72
  } else if (
      cellRow <= btmRow && cellRow >= btmInterBeginRow &&
      cellCol <= lastCol && cellCol >= firstGoDownCol
  ) {
    // 这里面一个for循环。这里应该构造一个区域就是 occupyRow 高，occupyColConfig宽的一个区域。同样进来的点优先级应该一样。
    if (cellCol === lastGoDownPickCol) {
      return pickStationRow + lastGoDownCol + 1 + (lastGoDownCol) * btmInterBeginRow - firstGoDownCol
          + cellCol + cellRow;
    } else if (cellRow === btmRow) {
      return pickStationRow + lastGoDownCol + 1 + (lastGoDownCol) * btmInterBeginRow - firstGoDownCol
          + lastGoDownPickCol + btmRow
          + lastGoDownPickCol - cellCol;
    } else if ((cellCol - firstGoDownCol) % divideCell === 0) {
      // 刚进入 interSection 区域时，优先级是一样的。这个区域的高度：btmInterBeginRow决定，宽度：occupyColConfig
      return pickStationRow + lastGoDownCol + 1 + (lastGoDownCol) * btmInterBeginRow - firstGoDownCol
          + lastGoDownPickCol + btmRow
          + lastGoDownPickCol - cellCol
          - occupyColConfig + 1 // 让 intersection 区域的区域，和occupyColConfig区域的优先级一样。
          + (occupyColConfig - 1) * Math.floor(2 * (cellRow - btmInterBeginRow) / (btmRow - btmInterBeginRow)); // //要么是0要么是1, occupyCol最好不要再小了
    } else {
      return 0; //阴影部分
    }
    // 最大：pickStationRow + lastGoDownCol + 1 + (lastGoDownCol) * btmInterBeginRow - firstGoDownCol
    //+ lastGoDownPickCol + btmRow
    //+ lastGoDownPickCol - firstGoDownCol
  } else if (
      cellRow <= btmRow && cellRow >= pickStationRow &&
      cellCol >= 0 && cellCol < firstGoDownCol
  ) {
    // 最后到拣货台部分
    return pickStationRow + lastGoDownCol + 1 + (lastGoDownCol) * btmInterBeginRow - firstGoDownCol
        + lastGoDownPickCol + btmRow
        + lastGoDownPickCol - firstGoDownCol
        + firstGoDownCol - cellCol + (btmRow - cellRow);
  } else {
    console.warn('some scenario not considered! 行列数超出范围。');
  }
};
