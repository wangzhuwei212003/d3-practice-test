/**
 * Created by zhuweiwang on 2018/6/7.
 */
module.exports = {

  /*
   旧版的库，负一楼
   */
  // 没有用到 // goalRow就是 4，8，12，16，20, goalCol: 8,12,16,20,24,28,32,36,40
  goalTable: [
    [[],[4, 8]],
    [[],[4, 24]],
    [[],[12, 16]],
    [[],[12, 24]],
  ],

  // 总的行列数
  bigRowNum: 8, // 底部是有一行不放箱子的，但是这里是要当做一行，分成4小格
  bigColNum: 13, // yaofei 那边是11没有算下降列拣货台

  boxColNum: 13 - 4,
  boxRowNum: 8 - 2,

  firstGoDownCol: 8, // 第一行下降的列
  lastGoDownCol: 52 - 12, // 最后一行的货位的下降列
  divideCell: 4,

  usedRowNum: 8, // 原来的大格子行列数，不含0
};