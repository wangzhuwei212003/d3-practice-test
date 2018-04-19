/**
 * Created by zhuweiwang on 31/03/2018.
 */

module.exports = {
  shuttleAmount: 2,
  rowNum: 27, // 整个地图转换成寻路的地图，27行36列。注意的一点是，上升列是左边第 0 列。
  colNum: 36,
  cellW: 25, // for visual 这个是为了显示的格子
  cellH: 25,

  pickStationRow: 21, // 拣货台所在行的index，

  colorSet: ['#D7263D', '#F46036', '#C5D86D', '#1B998B', '#2E294E'],
  colorSetPath: ['#E16171', '#F78B6C', '#D4E294', '#59B4AA', '#67637E'],

  timeGap: 500,

  searchDeepth: 9,

  // grid 相关
  verticalAvoidRow: 4,
  horizontalAvoidCol: 3,
  // 基本设定还是小车本身占位4行3列，
  // 但是getNeighbor检测能够移动的格子的时候，可以扩大避障检测范围；
  // grid里就这个数字是需要将来配置的。


  // heuristic 相关，以及 HCCoopFinder 相关。
  // 中间部分的左上角的行数、列数
  topLeftRow: 9 - 5,
  topLeftCol: 7,
  // 中间部分箱子行数、列数
  boxRowNum: 6,
  boxColNum: 5,
  // 拣货台的行数，从零开始、从上往下数

  // 总共的列数，length
  //shelfColLen: 23, 没用

  //相对于左下角的轮子为基准，小车占位行列数。
  occupyRowConfig: 6,
  occupyColConfig: 5, // 实际每列划分为4格，避免相邻列，使用5列。

  // 计算齿数
  //
  normalWidth: 23, //水平方向一格的宽度
  normalHeight: 16.7075, // 一般货位高度是 66.83
  topBoxNormalHeight: 15.0575, // 最上面一行货位的高度是 60.23
  specialHeight: 31.62, // 底部特殊高度，31.62
  compensate: 25 + 29 / 4, // 方向改变的时候，齿数补偿，25 + 90度

  specialBottomPart: 144 / 4, // 底部的特殊部分
  specialTopPart: 52 / 4, // 顶部的特殊部分

  SUPPart: 78.66 / 4, // S形弯道上部分齿数
  SDownPart: 112 / 4, // S形弯道下部分齿数

  pickStationHigh: 99, // 拣货台高度（包括特殊高 31.62）

  // 辅助线数组
  BIGCELL: [
    [-1, -1, 25, 26, 27, 28, 29, -1, -1],
    [-1, -1, 20, 21, 22, 23, 24, -1, -1],
    [-1, -1, 15, 16, 17, 18, 19, -1, -1],
    [-1, -1, 10, 11, 12, 13, 14, -1, -1],
    [-1, -1, 5, 6, 7, 8, 9, -1, -1],
    [-1, -1, 0, 1, 2, 3, 4, -1, -1],
  ],
  BIGCELLTEXT: [
    [25, 26, 27, 28, 29],
    [20, 21, 22, 23, 24],
    [15, 16, 17, 18, 19],
    [10, 11, 12, 13, 14],
    [5, 6, 7, 8, 9],
    [0, 1, 2, 3, 4],
  ],

  // 左边是上升列
  mainShelfMap: [
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],// 实际中的最上面一行

    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, 25, -1, -1, -1, 26, -1, -1, -1, 27, -1, -1, -1, 28, -1, -1, -1, 29, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], // 货位点

    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, 20, -1, -1, -1, 21, -1, -1, -1, 22, -1, -1, -1, 23, -1, -1, -1, 24, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], // 货位点

    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, 15, -1, -1, -1, 16, -1, -1, -1, 17, -1, -1, -1, 18, -1, -1, -1, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],

    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, 10, -1, -1, -1, 11, -1, -1, -1, 12, -1, -1, -1, 13, -1, -1, -1, 14, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],

    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, 5, -1, -1, -1, 6, -1, -1, -1, 7, -1, -1, -1, 8, -1, -1, -1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],

    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    [-1, -1, -1, -1, -1, -1, -1, -1, 0, -1, -1, -1, 1, -1, -1, -1, 2, -1, -1, -1, 3, -1, -1, -1, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],

    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], // 特殊行。

    [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], // 实际中的位置最下面一行(第0行)
  ],

  // test initial goalTable


}
;