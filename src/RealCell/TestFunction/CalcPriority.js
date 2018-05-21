/**
 * Created by zhuweiwang on 10/04/2018.
 */
import * as CONFIG from './configDATA';
import * as CONFIGV3 from '../config_priority_V003';

// TODO: 死数字改配置
export const CalcPriority = function (cellRow, cellCol) {

  const pickStationRow = CONFIG.pickStationRow; // 拣货台的行数 21
  const firstGoDownCol = 8; // 开始下降的第一列列数 8
  const lastGoDownCol = CONFIG.smallColNum - 12; // 开始下降的有货位的最后一列列数 24
  const lastGoDownPickCol = CONFIG.smallColNum - 4; // 下降列拣货台的列数 32
  const btmInterBeginRow = CONFIG.smallRowNum - 1 - CONFIG.occupyRowConfig; // 底部开始有交汇的行数，开始进入底部的通道 20
  const btmRow = CONFIG.smallRowNum - 1; // 最底部一行行数 26
  const lastCol = CONFIG.smallColNum - 1; // 最后一列列数 35
  const occupyRow = CONFIG.occupyRowConfig; // 占位的行数 6

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
        + cellRow + (lastGoDownPickCol - cellCol) * CONFIG.occupyRowConfig;
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
    console.log('some scenario not considered! 行列数超出范围。');
  }
};

export const CalcPriorityV3 = function (cellRow, cellCol) {

  const pickStationRow = CONFIGV3.pickStationRow; // 拣货台的行数 21
  const firstGoDownCol = 8; // 开始下降的第一列列数 8
  const lastGoDownCol = CONFIGV3.smallColNum - 12; // 开始下降的有货位的最后一列列数 24
  const lastGoDownPickCol = CONFIGV3.smallColNum - 4; // 下降列拣货台的列数 32
  const btmInterBeginRow = CONFIGV3.smallRowNum - 1 - CONFIGV3.occupyRowConfig; // 底部开始有交汇的行数，开始进入底部的通道 20
  const btmRow = CONFIGV3.smallRowNum - 1; // 最底部一行行数 26
  const lastCol = CONFIGV3.smallColNum - 1; // 最后一列列数 35
  const occupyRow = CONFIGV3.occupyRowConfig; // 占位的行数 6

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
    console.log('some scenario not considered! 行列数超出范围。');
  }
};
