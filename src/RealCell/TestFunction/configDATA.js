/**
 * Created by zhuweiwang on 10/04/2018.
 */
module.exports = {
  usedRowNum: 8, // 原来的大格子行列数，不含0
  usedColNum: 9,

  smallRowNum: 27,
  smallColNum: 36, // 小格子的总行列数

  pickStationRow: 21, // 拣货台所在行的index，

  occupyRowConfig: 6,
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
  PickUPSiteSmallCell: [21,0]
}
;