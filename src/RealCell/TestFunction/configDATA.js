/**
 * Created by zhuweiwang on 10/04/2018.
 */
module.exports = {
  usedRowNum: 8, // 原来的大格子行列数，不含0
  usedColNum: 9,

  smallRowNum: 27,
  smallColNum: 36, // 小格子的总行列数

  // 计算齿数
  normalWidth: 23, //水平方向一格的宽度
  normalHeight: 16.7075, // 一般货位高度是 66.83
  topBoxNormalHeight: 15.0575, // 最上面一行货位的高度是 60.23
  specialHeight:31.62, // 底部特殊高度，31.62
  compensate: 25 + 29/4, // 方向改变的时候，齿数补偿，25 + 90度

  specialBottomPart: 144/4, // 底部的特殊部分
  specialTopPart: 52/4, // 顶部的特殊部分

  SUPPart: 78.66/4, // S形弯道上部分齿数
  SDownPart: 112/4, // S形弯道下部分齿数

  pickStationHigh: 99, // 拣货台高度（包括特殊高 31.62

};