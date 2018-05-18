/**
 * Created by zhuweiwang on 2018/5/18.
 */

module.exports = {
  usedRowNum: 8, // 原来的大格子行列数，不含0
  usedColNum: 9,

  smallRowNum: 27,
  smallColNum: 36, // 小格子的总行列数

  pickStationRow: 21, // 拣货台所在行的index，

  occupyRowConfig: 7,
  occupyColConfig: 5, // 实际每列划分为4格，避免相邻列，使用5列。

  // 计算齿数
  normalWidth: 23, //水平方向一格的宽度
  normalHeight: 16.7075, // 一般货位高度是 66.83
  topBoxNormalHeight: 15.0575, // 最上面一行货位的高度是 60.23
  specialHeight: 31.62, // 底部特殊高度，31.62
  compensate: 25 + 29 / 4, // 方向改变的时候，齿数补偿，25 + 90度

  specialBottomPart: 144 / 4, // 底部的特殊部分
  specialTopPart: 52 / 4, // 顶部的特殊部分

  SUPPart: 78.66 / 4, // S形弯道上部分齿数
  SDownPart: 112 / 4, // S形弯道下部分齿数

  pickStationHigh: 99, // 拣货台高度（包括特殊高 31.62

  // 模拟路径
  A0: [
    [26, 4], [26, 3], [26, 2], [26, 1], [26, 0], // 开始上升列
    [25, 0], [24, 0], [23, 0], [22, 0], [21, 0], [20, 0],
    [19, 0], [18, 0], [17, 0], [16, 0], [15, 0], [14, 0], [13, 0], [12, 0], [11, 0],
    [10, 0], [9, 0], [8, 0], [7, 0], [6, 0], [5, 0], [4, 0], [3, 0], [2, 0], [1, 0], [0, 0], // 开始在顶部水平运动
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], // 开始下降
    [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8],
    [11, 8], [12, 8], [13, 8], [14, 8], [15, 8], [16, 8], [17, 8], [18, 8], [19, 8], [20, 8],
    [21, 8], [22, 8], [23, 8], [24, 8] // 终点是大格子的行列数：1，2
  ],
  A1: [
    [26, 4], [26, 3], [26, 2], [26, 1], [26, 0], // 开始上升列
    [25, 0], [24, 0], [23, 0], [22, 0], [21, 0], [20, 0],
    [19, 0], [18, 0], [17, 0], [16, 0], [15, 0], [14, 0], [13, 0], [12, 0], [11, 0],
    [10, 0], [9, 0], [8, 0], [7, 0], [6, 0], [5, 0], [4, 0], [3, 0], [2, 0], [1, 0], [0, 0], // 开始在顶部水平运动
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], // 开始下降
    [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8],
    [11, 8], [12, 8], [13, 8], [14, 8], [15, 8], [16, 8], [17, 8], [18, 8], [19, 8], [20, 8],
    [21, 8], [22, 8], [23, 8], [24, 8] // 终点是大格子的行列数：1，2
  ],

  // 拣货位正好是 小格子21,0
  PickUPSiteSmallCell: [21, 0],

  /*
   旧版的库，负一楼
   */
  mainShelfMap_V2: [
    [-1, -1, -1, -1, -1, -1, -1, -1, -1],// 实际中的最上面一行
    [-1, -1, 25, 26, 27, 28, 29, -1, -1],
    [-1, -1, 20, 21, 22, 23, 24, -1, -1],
    [-1, -1, 15, 16, 17, 18, 19, -1, -1],
    [-1, -1, 10, 11, 12, 13, 14, -1, -1],
    [-1, -1, 5, 6, 7, 8, 9, -1, -1],
    [-1, -1, 0, 1, 2, 3, 4, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1], // 实际中的位置最下面一行(第0行)
  ],

  // 总的行列数
  bigRowNum: 8,
  bigColNum: 9,

  divideCell: 4,
  // 小格子行列数
  rowNum: 27,
  colNum: 36,
  //显示的像素长宽
  cellW: 20,
  cellH: 20,

  // 中间货位的数字
  BIGCELLTEXT: [
    [25, 26, 27, 28, 29],
    [20, 21, 22, 23, 24],
    [15, 16, 17, 18, 19],
    [10, 11, 12, 13, 14],
    [5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4],
  ],

  // 计算齿数
  normalWidth: 23, //水平方向一格的宽度 92/4
  normalHeight: 16.7075, // 一般货位高度是 66.83
  normalHeightBIG: 66.83, // 一般货位高度是 66.83
  topBoxNormalHeight: 15.0575, // 最上面一行货位的高度是 60.23
  specialHeight: 31.62, // 底部特殊高度，31.62
  compensate: 25 + 29 / 4, // 方向改变的时候，齿数补偿，25 + 90度

  specialBottomPart: 144 / 4, // 底部的特殊部分
  doubleBottomPart: 2 * 92 / 4, // 下降列底部的特殊部分是两个正常的宽度。
  specialTopPart: 52 / 4, // 顶部的特殊部分

  SUPPart: 78.66 / 4, // S形弯道上部分齿数
  SDownPart: 112 / 4, // S形弯道下部分齿数

  pickStationHigh: 99, // 拣货台高度（包括特殊高 31.62）

  // 特殊行列数。CalcPriority 用到
  pickStationRow: 21, // 拣货台所在行的index，这个是根据测试调好的。
  firstGoDownCol: 8, // 开始下降的第一列列数 8
  lastGoDownCol: 36 - 12, //开始下降的有货位的最后一列列数 24
  lastGoDownPickCol: 36 - 4, // 下降列拣货台的列数 32
  divideCell:4, // 一大格分4个格子
  lookUpRowNum: 6, // 上升列往上检查有没有小车的方法。

  // calcTeeth 用到
  h2vUpPinOutStretchCell: 2, // 水平转为上升列，这里需要在前两格伸pin
  h2vDownSpecialPinOutStretchCell: 3, // 调整第一列下降时 伸pin 的位置 3小格
  h2vDownNormalPinOutStretchCell: 2, // 水平转为上升列，这里需要在前两格伸pin

  // cellToTeeth 用到
  specialTopStartCellCol: 4, // 从第 4 列开始是顶部特殊长度，包含第 4 列。
  specialBtmStartCellCol: 36 - 8, //colNum - 8, // 底部特殊长度，包含第 colNum - 8 列。
  topBoxNormalHeightStartRow:1,
  topBoxNormalHeightEndRow:4, // 最上面一行货位的高度是 60.23, 起始行、结束行
  SDownPartStartRow: 27 - 10, //rowNum - 10, S形弯道下部分
  SDownPartEndRow:27 - 7, // rowNum - 7, S形弯道下部分
  SUPPartStartRow: 27 - 14, //rowNum - 14, S形弯道上部分
  SUPPartEndRow:27 - 11, // rowNum - 11, S形弯道上部分
  specialHeightStartRow: 27 - 2, //rowNum - 2, 底部特殊高度一行
  specialHeightEndRow: 27 - 2, //rowNum - 2, 底部特殊高度一行

  pickSitesPosition: {
    SiteA: [21, 0],
    SiteB: [21, 36 - 4],
  },

  pickSitesSmallRow: 21, //回拣货台，上升列开始进入S行弯道的行数
  pickSitesRowGap: 8, // S形弯道 占有的小格子行数

  // 开机、关机相关
  preGoUpPoint: [0, 36 - 9], //顶部停靠的列数，顶部差两格需要开始伸pin
  GoDownPoint: [26, 4 + 2], // 原点前两小格，即是半大格。

  //相对于左下角的轮子为基准，小车占位行列数。
  occupyRowConfig: 6, // 考虑最底一行，
  occupyColConfig: 5, // 实际每列划分为4格，避免相邻列，使用5列。至少是5列，考虑相邻列

  // 起点行列数
  startROW: 26, // 只能是最底下一行，heuristic里面默认
  startCOL: 4,
};