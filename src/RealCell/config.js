/**
 * Created by zhuweiwang on 31/03/2018.
 */

module.exports = {
  shuttleAmount: 4,
  rowNum: 27, // 整个地图转换成寻路的地图，27行36列。注意的一点是，上升列是左边第 0 列。
  colNum: 36,
  cellW: 25, // for visual 这个是为了显示的格子
  cellH: 25,

  pickStationRow: 27 - 6, // 拣货台所在行的index，

  colorSet: ['#D7263D', '#F46036', '#C5D86D', '#1B998B', '#2E294E'],
  colorSetPath: ['#E16171', '#F78B6C', '#D4E294', '#59B4AA', '#67637E'],

  timeGap: 500,

  searchDeepth: 10,

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
  specialHeight:31.62, // 底部特殊高度，31.62
  compensate: 25 + 29/4, // 方向改变的时候，齿数补偿，25 + 90度

  specialBottomPart: 144/4, // 底部的特殊部分
  specialTopPart: 52/4, // 顶部的特殊部分

  SUPPart: 79/4, // S形弯道上部分齿数
  SDownPart: 112/4, // S形弯道下部分齿数

  pickStationHigh: 99, // 拣货台高度（包括特殊高 31.62）

};