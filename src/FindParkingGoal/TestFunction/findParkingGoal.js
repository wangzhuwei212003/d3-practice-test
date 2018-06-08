/**
 * Created by zhuweiwang on 2018/6/7.
 */
import {
  boxColNum,
  boxRowNum,

  goalTable,
  firstGoDownCol,
  lastGoDownCol,
  divideCell,

  usedRowNum,
} from './testConfig';


/*
* 这个方法是根据 goalTable 找到相应的大格子行列数的目标
*
* 输入参数：是 goalTable 里的 index，就是第几个车。以及goalTable。
*
* */


//TODO: 给空闲小车分配的目标位置，都在前面的几列。to fix 待测试
export const findParkingGoal = function (optIndex) {
  // optIndex 是当前空闲小车的索引。

  // 需要知道goalTable里终点的行数、列数，小格子的

  // 1. 先找列。距离顶部剩余部分最多的列；
  // 2. 再确定行。。
  let goalRow;
  let goalCol; //左上角的货位。按照大格子的行列数报告。
  let minShuttleNumInCol; // 最少车数量的列, 列数
  let minShuttleNum;

  // 按照大格子的位置报告来做
  let rowRemainColArr = Array(boxColNum).fill(boxRowNum);
  let goalShuttleNumArr = Array(boxColNum).fill(0); // 每一列包含有多少小车的终点

  // 从左往右，到顶部还剩多少大格子。如果是默认的就是没有车，就是6行箱位
  for (let i = 0; i < goalTable.length; i += 1) {
    if (i === optIndex) {
      continue; // 如果是当前的小车，跳过，继续循环
    }

    let curGoalRow = goalTable[i][1][0]; // 终点的行数
    let curGoalCol = goalTable[i][1][1]; // 终点的列数

    // 如果终点不是在中间货位，那就没有必要更新。
    if (
        curGoalCol < firstGoDownCol || curGoalCol > lastGoDownCol
    ) {
      continue;
    }

    // 剩下的是终点在中间货位。如果终点是中间货位的话，goalRow就是 4，8，12，16，20
    let remainRow = curGoalRow / divideCell - 1; // 距离顶部的行数，就是往上还剩多少行货位
    // 对应大格子里的列数、索引
    let bigCellCol = (curGoalCol - firstGoDownCol) / divideCell; // 第一列就是对应0，这个也是没错
    if (remainRow < rowRemainColArr[bigCellCol]) {
      rowRemainColArr[bigCellCol] = remainRow; // 如果剩下的行数比原来的小，那么就更新。
    }// rowRemainColArr逻辑没问题。

    let goalShuttleNum = goalShuttleNumArr[bigCellCol];
    goalShuttleNumArr[bigCellCol] = goalShuttleNum + 1; // 在原来的基础上加 1。每一列有多少辆车。
  }

  console.log('rowRemainColArr，根据goalTable计算每一列上面剩多少行。', rowRemainColArr)
  console.log('goalShuttleNumArr，每一列有多少小车。', goalShuttleNumArr)

  // for循环完了之后，rowRemainColArr 可以用了。列数和行数都能确定了。
  for (let i = 0; i < rowRemainColArr.length; i += 1) {
    if (i === 0) {
      let tmpRow = usedRowNum - 2 - Math.min(rowRemainColArr[0], rowRemainColArr[1]); // 剩的多的那一行去。得出来的是大格子的行数索引。
      let smallerShuttleNumInCol = Math.max(goalShuttleNumArr[0], goalShuttleNumArr[1]);
      minShuttleNum = smallerShuttleNumInCol; // 最少车数量的列所包含的车数量。
      minShuttleNumInCol = 0; // 最少车数量的列数

      goalRow = tmpRow; //这个可以说是初始化 goalRow goalCol
      goalCol = firstGoDownCol / divideCell + i;
      console.log('初始化 goalCol');
      console.log(goalRow, goalCol);

    } else if (i === rowRemainColArr.length - 1) {
      let tmpRow = usedRowNum - 2 - Math.min(rowRemainColArr[i], rowRemainColArr[i - 1]);
      let smallerShuttleNumInCol = Math.max(goalShuttleNumArr[i], goalShuttleNumArr[i - 1]);

      if(smallerShuttleNumInCol < minShuttleNum || tmpRow < goalRow){
        minShuttleNum = smallerShuttleNumInCol;
        goalCol = firstGoDownCol / divideCell + i;
        goalRow = tmpRow; // 如果更小就往底下排。
        console.log('更新 goalCol');
        console.log(goalRow, goalCol);
      }
    } else {
      let tmpRow = usedRowNum - 2 - Math.min(rowRemainColArr[i + 1], rowRemainColArr[i], rowRemainColArr[i - 1]);
      let smallerShuttleNumInCol = Math.max(goalShuttleNumArr[i + 1], goalShuttleNumArr[i], goalShuttleNumArr[i - 1]);

      if(smallerShuttleNumInCol < minShuttleNum || tmpRow < goalRow){
        minShuttleNum = smallerShuttleNumInCol;
        goalRow = tmpRow;
        goalCol = firstGoDownCol / divideCell + i;
        console.log('更新 goalCol');
        console.log(goalRow, goalCol);
      }
    }
  }

  // 最后应该避免停在最底下一行货位。漏考虑的情况，横着过来的车，被停在最底下一行的车挡住。
  if (goalRow <= 3) {
    goalRow = 4;
  }

  return [goalRow, goalCol]; // 返回找到的停靠的点。这个return的是大格子的目标，行列数。
};