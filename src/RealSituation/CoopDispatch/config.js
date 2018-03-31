/**
 * Created by zhuweiwang on 29/03/2018.
 */

module.exports = {
  shuttleAmount: 4,
  rowNum: 30 - 5, // 整个地图总共的行数 length
  colNum: 23, // 整个地图总共的列数 length
  cellW: 50,
  cellH: 25,

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
  pickStationRow: 22 - 5,
  // 总共的列数，length
  shelfColLen: 23,



};