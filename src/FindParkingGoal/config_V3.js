/**
 * Created by zhuweiwang on 2018/5/18.
 *
 * 新版 V3 库
 */

module.exports = {

  /*
   旧版的库，负一楼
   */
  // 没有用到
  mainShelfMap_V3: [
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, 36, 37, 38, 39, 40, 41, 42, 43, 44, -1, -1],
    [-1, -1, 27, 28, 29, 30, 31, 32, 33, 34, 35, -1, -1],
    [-1, -1, 18, 19, 20, 21, 22, 23, 24, 25, 26, -1, -1],
    [-1, -1, 9, 10, 11, 12, 13, 14, 15, 16, 17, -1, -1],
    [-1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  ],

  // 总的行列数
  bigRowNum: 8, // 底部是有一行不放箱子的，但是这里是要当做一行，分成4小格
  bigColNum: 13, // yaofei 那边是11没有算下降列拣货台

  // 小格子行列数
  rowNum: 27, // 顶部一行，中间货箱每行4小行，特殊高度1行，底部1行，1 + 4 * (8 - 2) + 1 + 1 = 27
  colNum: 13 * 4, // 52
  //显示的像素长宽
  cellW: 20,
  cellH: 20,

  // 中间货位的数字
  BIGCELLTEXT: [
    ['(4-8)', '(4-12)', '(4-16)', '(4-20)', '(4-24)', '(4-28)', '(4-32)', '(4-36)', '(4-40)'],
    ['(8-8)', '(8-12)', '(8-16)', '(8-20)', '(8-24)', '(8-28)', '(8-32)', '(8-36)', '(8-40)'],
    ['(12-8)', '(12-12)', '(12-16)', '(12-20)', '(12-24)', '(12-28)', '(12-32)', '(12-36)', '(12-40)'],
    ['(16-8)', '(16-12)', '(16-16)', '(16-20)', '(16-24)', '(16-28)', '(16-32)', '(16-36)', '(16-40)'],
    ['(20-8)', '(20-12)', '(20-16)', '(20-20)', '(20-24)', '(20-28)', '(20-32)', '(20-36)', '(20-40)'],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1],
  ],

  // 计算齿数
  normalWidth: 23, //水平方向一格的宽度 92/4
  normalHeight: 16.5, // 一般货位高度是 66/4
  normalHeightBIG: 66, // 一般货位高度是 66
  topBoxNormalHeight: 52.432516 / 4, // 最上面一行货位的高度是 52.432516/4
  specialHeight: 13.567484, // 底部特殊高度，13.567484
  compensate: 25 + 28 / 4, // 方向改变的时候，齿数补偿，25 + 90度 同一个库里所有车同一个齿数

  specialBottomPart: 144 / 4, // 底部的特殊部分
  doubleBottomPart: 2 * 92 / 4, // 下降列底部的特殊部分是两个正常的宽度。
  specialTopPart: 52 / 4, // 顶部的特殊部分

  SUPPart: 76.567484 / 4, // S形弯道上部分齿数
  SDownPart: 112.432516 / 4, // S形弯道下部分齿数

  pickStationHigh: 36, // 拣货台高度（包括特殊高 13.567484）

  // 特殊行列数。CalcPriority 用到
  pickStationRow: 24, // 拣货台所在行的index，这个是根据测试调好的。27 - 3 = 24，加上往上偏移量
  firstGoDownCol: 8, // 开始下降的第一列列数 8
  lastGoDownCol: 52 - 12, //开始下降的有货位的最后一列列数 24
  lastGoDownPickCol: 52 - 4, // 下降列拣货台的列数 32
  divideCell: 4, // 一大格分4个格子
  lookUpRowNum: 6, // 上升列往上检查有没有小车的方法。

  // 特殊的格子数，calcTeeth 用到
  h2vUpPinOutStretchCell: 2, // 水平转为上升列，这里需要在前两格伸pin
  h2vDownSpecialPinOutStretchCell: 3, // 调整第一列下降时 伸pin 的位置 3小格
  h2vDownNormalPinOutStretchCell: 2, // 水平转为上升列，这里需要在前两格伸pin

  // 特殊的格子数，cellToTeeth 用到
  specialTopStartCellCol: 4, // 从第 4 列开始是顶部特殊长度，包含第 4 列。
  specialBtmStartCellCol: 52 - 8, //colNum - 8, // 底部特殊长度，包含第 colNum - 8 列。
  topBoxNormalHeightStartRow: 1,
  topBoxNormalHeightEndRow: 4, // 最上面一行货位的高度是 60.23, 起始行、结束行
  SDownPartStartRow: 27 - 6, //rowNum - 10, S形弯道下部分
  SDownPartEndRow: 27 - 3, // rowNum - 7, S形弯道下部分
  SUPPartStartRow: 27 - 10, //rowNum - 14, S形弯道上部分
  SUPPartEndRow: 27 - 7, // rowNum - 11, S形弯道上部分
  specialHeightStartRow: 27 - 2, //rowNum - 2, 底部特殊高度一行
  specialHeightEndRow: 27 - 2, //rowNum - 2, 底部特殊高度一行

  // 特殊的格子数
  pickSitesPosition: {
    SiteA: [24, 0],
    SiteB: [24, 52 - 4],
  },

  // 开机、关机相关
  preGoUpPoint: [0, 52 - 9], //顶部停靠的列数，顶部差两格需要开始伸pin
  GoDownPoint: [26, 4 + 2], // 原点前两小格，即是半大格。

  //相对于左下角的轮子为基准，小车占位行列数。
  occupyRowConfig: 6, // 考虑最底一行，
  occupyColConfig: 5, // 实际每列划分为4格，避免相邻列，使用5列。至少是5列，考虑相邻列

  // 起点行列数
  startROW: 26, // 只能是最底下一行，heuristic里面默认
  startCOL: 4,

  colorSet: ['#D7263D', '#F46036', '#C5D86D', '#1B998B', '#2E294E'],

  // 测试相关
  origin: [26, 4],
  wheel_to_chain: 21,

};