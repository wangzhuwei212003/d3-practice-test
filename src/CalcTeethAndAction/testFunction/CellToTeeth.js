/**
 * Created by zhuweiwang on 2018/5/18.
 */
import {
  rowNum,

  firstGoDownCol,
  lastGoDownPickCol,

  specialTopStartCellCol,
  specialBtmStartCellCol,
  topBoxNormalHeightStartRow,
  topBoxNormalHeightEndRow,
  SDownPartStartRow,
  SDownPartEndRow,
  SUPPartStartRow,
  SUPPartEndRow,
  specialHeightStartRow,

  normalWidth, //水平方向一格的宽度
  normalHeight, // 一般货位高度是 66.83
  topBoxNormalHeight, // 最上面一行货位的高度是 60.23
  specialHeight, // 底部特殊高度，31.62

  specialBottomPart, // 底部的特殊部分
  doubleBottomPart,
  specialTopPart, // 顶部的特殊部分
  SUPPart, // S形弯道上部分齿数
  SDownPart, // S形弯道下部分齿数

// } from '../configTeeth';
} from '../config_V3';

export const CellToTeeth = function (cellRow, cellCol) {
  // 根据行列，对应出齿数。没有考虑补偿。
  // 特殊的先来，从上到下 TODO: 4,7,11,8 配置
  if (
      cellRow === 0 &&
      (cellCol >= specialTopStartCellCol && cellCol < firstGoDownCol)
  ) {
    // 顶部特殊长度 52/4, 这里是 4、5、6、7 四格
    return specialTopPart;
  } else if (
      cellRow === 0
  ) {
    // 除此之外，上面的都是 normal
    return normalWidth;
  } else if (
      cellRow >= topBoxNormalHeightStartRow && cellRow <= topBoxNormalHeightEndRow
  ) {
    // 剩下的最上面一行的货位里的格子
    return topBoxNormalHeight;
  } else if (
      cellRow >= SDownPartStartRow && cellRow <= SDownPartEndRow &&
      (cellCol === 0 || cellCol === lastGoDownPickCol)
  ) {
    // S形弯道下部分
    return SDownPart;
  } else if (
      cellRow >= SUPPartStartRow && cellRow <= SUPPartEndRow &&
      (cellCol === 0 || cellCol === lastGoDownPickCol)
  ) {
    // S形弯道上部分
    return SUPPart;
  } else if (
      cellRow > topBoxNormalHeightEndRow && cellRow < specialHeightStartRow
  ) {
    // 中间正常部分
    return normalHeight;
  } else if (
      cellRow === specialHeightStartRow
  ) {
    // 倒数第二行 特殊高度部分，其他的都不需要补偿
    return specialHeight;
  } else if (
      cellRow === rowNum - 1 &&
      (cellCol >= specialTopStartCellCol && cellCol < firstGoDownCol)
  ) {
    // 倒数第一行 特殊宽度部分
    return specialBottomPart;
  } else if (
      cellRow === rowNum - 1 &&
      (cellCol >= specialBtmStartCellCol && cellCol < lastGoDownPickCol)
  ) {
    // 倒数第一行 特殊宽度部分
    return doubleBottomPart;
  } else if (cellRow === rowNum - 1) {
    return normalWidth;
  } else {
    // logger.debug('some situation senario not considered!!');
  }
};
