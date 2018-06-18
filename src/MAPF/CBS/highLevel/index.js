/**
 * Created by zhuweiwang on 2018/6/3.
 */
import TreeNode from '../TreeNode';
import {findPathByConstraint} from '../lowLevel/finderByConstraints';
import Heap from 'heap';

export const initialRoot = function (goalTable, searchDeepth, matrix, offLine, executeTime = 10) {

  let timesup = false;
  let limit = setTimeout(() => {
    timesup = true;
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$, timesup')
  }, executeTime);

  // let test = setInterval(() => {
  //   console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$, timesup', timesup)
  // }, executeTime);
  /*
   * 1. 生成 root，起始的treeNode
   * 2. 使用 openList 开始寻找最终 solution
   *
   * */

  // console.log('initialRoot occur', goalTable, searchDeepth, matrix, offLine);

  // 1
  const constraints = Array(goalTable.length).fill([]);
  const rootNode = new TreeNode(constraints);
  rootNode.solution = findPathByConstraint(constraints, goalTable, searchDeepth, matrix, offLine);
  // console.log(rootNode.solution);
  rootNode.cost = calcSIC(rootNode.solution);
  // console.log(rootNode);

  // 2.
  const openList = new Heap(function (treeNode1, treeNode2) {
    return treeNode1.cost - treeNode2.cost;
  });
  openList.push(rootNode);

  while (!openList.empty()) {
    console.log(timesup);
    if(timesup){
      return false;
    }

    const curTreeNode = openList.pop();
    const pathTable = curTreeNode.solution;

    let newConstraint = validateNode(pathTable, searchDeepth, offLine);
    if (newConstraint.length === 0) {
      console.log('没有冲突了，这个就是最终的结果', pathTable);
      clearTimeout(limit);
      console.log('clearTimeout limit');
      return pathTable; // 没有冲突了，这个就是最终的结果。
    }

    // 有新的conflict，生成新的 treeNode，并更新constraints
    newConstraint.forEach(function (constraint) {
      curTreeNode.constraints[constraint['optIndex']].push(constraint['optConstraint']);
      let newTreeNode = new TreeNode(curTreeNode.constraints);
      newTreeNode.solution = findPathByConstraint(curTreeNode.constraints, goalTable, searchDeepth, matrix, offLine);
      newTreeNode.cost = calcSIC(newTreeNode.solution);
      openList.push(newTreeNode);
    })
  }
};

const validateNode = function (pathTable, searchDeepth, offLine) {
  // The validation is performed by simulating the set of paths.找完所有路径之后，对 pathTable 做一个检查。看有没有 conflict。
  /*
   * 不合法的行为：
   * 1. 不同的点出现在同一时间，同一地点
   * 2. 互换位置。
   *
   * */
  const result = [];

  if (offLine) {
    // 如果是offline，那么就是要遍历pathTable最长的路径的长度。
    let maxStep = 0;
    for (let iUnit = 0; iUnit < pathTable.length; iUnit += 1) {
      if (maxStep < pathTable[iUnit].length) {
        maxStep = pathTable[iUnit].length;
      }
    }

    for (let iStep = 0; iStep < maxStep; iStep += 1) {
      // searchdeepth应该是这个方法检查的步数，这个如果是offline的规划算法，就是pathtable里最长的路径的长度。
      const thisStepPosition = []; // index 就是 unit 在 pathtable 的index。这个是放在searchdeepth里面的。每一个istep都要做一遍。
      const nextStepPosition = [];

      for (let iUnit = 0; iUnit < pathTable.length; iUnit += 1) {
        thisStepPosition[iUnit] = pathTable[iUnit][iStep]; // [row, col]
        if (iStep === pathTable[iUnit].length - 1) {
          // do nothing
          nextStepPosition[iUnit] = null;
        } else {
          nextStepPosition[iUnit] = pathTable[iUnit][iStep + 1];
        }
      }

      for (let iUnit = 0; iUnit < thisStepPosition.length; iUnit += 1) {
        const position = thisStepPosition[iUnit]; // 有可能是undefined
        if (iUnit < thisStepPosition.length - 1 && position) {
          // console.log(position, thisStepPosition.slice(iUnit + 1));
          let anotherUnitIndex = thisStepPosition.slice(iUnit + 1).findIndex((ele) => {
            if (!ele) {
              return false; // 这个数组里可能有undefined的值
            }
            return ele[0] === position[0] && ele[1] === position[1];
          });
          if (anotherUnitIndex === -1) {
            // 如果是等于 -1 就是说没有找到这一个时刻相同占位的点。
          } else {
            // 有相同占位的 unit。冲突1
            // console.log('有相同占位的冲突，在pathtable里的index是：', iUnit, anotherUnitIndex);
            return [{
              optIndex: iUnit,
              optConstraint: {timeIndex: iStep, row: position[0], col: position[1]}
            }, {
              optIndex: anotherUnitIndex,
              optConstraint: {timeIndex: iStep, row: position[0], col: position[1]}
            }] // {timeIndex:, row:, col:}
          }
        }// 排除最后两个点的情况。

        // 检测互换位置的动作。往 iUnit 增大的方向找就可以了，就是往数组后面找就行了。
        let nextPosition = nextStepPosition[iUnit]; // [row, col]，当前这个点的下一个位置
        // console.log(nextPosition);
        if (!nextPosition) continue;
        let oppositeDirectionUnitIndex = thisStepPosition.findIndex((ele, index) => {
          if (!ele) {
            return false; // 这个数组里可能有undefined的值
          }
          return ele[0] === nextPosition[0] &&
              ele[1] === nextPosition[1] &&
              nextStepPosition[index][0] === position[0] &&
              nextStepPosition[index][1] === position[1]
        });
        if (oppositeDirectionUnitIndex === -1) {
          // 如果是等于 -1 就是说没有找到互换位置的点。
        } else {
          // 有互换位置的 unit。冲突2
          // console.log('有互换位置的冲突，在pathtable里的index是：', iUnit, oppositeDirectionUnitIndex);
          return [{
            optIndex: iUnit,
            optConstraint: {timeIndex: iStep + 1, row: nextPosition[0], col: nextPosition[1]}
          }, {
            optIndex: oppositeDirectionUnitIndex,
            optConstraint: {timeIndex: iStep + 1, row: position[0], col: position[1]}
          }] // {timeIndex:, row:, col:}
        }
      }// 一步的查找不合法的动作结束。
    }// 整个pathtable的所有步数模拟结束，查找不合法的动作结束。

  } else {
    for (let iStep = 0; iStep < searchDeepth; iStep += 1) {
      // searchdeepth应该是这个方法检查的步数，这个如果是offline的规划算法，就是pathtable里最长的路径的长度。
      const thisStepPosition = []; // index 就是 unit 在 pathtable 的index。这个是放在searchdeepth里面的。每一个istep都要做一遍。
      const nextStepPosition = [];

      for (let iUnit = 0; iUnit < pathTable.length; iUnit += 1) {
        thisStepPosition[iUnit] = pathTable[iUnit][iStep]; // [row, col]
        if (iStep === searchDeepth - 1) {
          // do nothing
          nextStepPosition[iUnit] = null;
        } else {
          nextStepPosition[iUnit] = pathTable[iUnit][iStep + 1];
        }
      }

      for (let iUnit = 0; iUnit < thisStepPosition.length; iUnit += 1) {
        const position = thisStepPosition[iUnit];
        let anotherUnitIndex = thisStepPosition.slice(iUnit + 1).findIndex((ele) => {
          return ele[0] === position[0] && ele[1] === position[1];
        });
        if (anotherUnitIndex === -1) {
          // 如果是等于 -1 就是说没有找到这一个时刻相同占位的点。
        } else {
          // 有相同占位的 unit。冲突1
          console.log('有相同占位的冲突，在pathtable里的index是：', iUnit, anotherUnitIndex);
          return [{
            optIndex: iUnit,
            optConstraint: {timeIndex: iStep, row: position[0], col: position[1]}
          }, {
            optIndex: anotherUnitIndex,
            optConstraint: {timeIndex: iStep, row: position[0], col: position[1]}
          }] // {timeIndex:, row:, col:}
        }

        // 检测互换位置的动作。往 iUnit 增大的方向找就可以了，就是往数组后面找就行了。
        let nextPosition = nextStepPosition[iUnit]; // [row, col]，当前这个点的下一个位置
        // console.log(nextPosition);
        if (!nextPosition) continue;
        let oppositeDirectionUnitIndex = thisStepPosition.findIndex((ele, index) => {
          return ele[0] === nextPosition[0] &&
              ele[1] === nextPosition[1] &&
              nextStepPosition[index][0] === position[0] &&
              nextStepPosition[index][1] === position[1]
        });
        if (oppositeDirectionUnitIndex === -1) {
          // 如果是等于 -1 就是说没有找到互换位置的点。
        } else {
          // 有互换位置的 unit。冲突2
          // console.log('有互换位置的冲突，在pathtable里的index是：', iUnit, oppositeDirectionUnitIndex);
          return [{
            optIndex: iUnit,
            optConstraint: {timeIndex: iStep + 1, row: nextPosition[0], col: nextPosition[1]}
          }, {
            optIndex: oppositeDirectionUnitIndex,
            optConstraint: {timeIndex: iStep + 1, row: position[0], col: position[1]}
          }] // {timeIndex:, row:, col:}
        }
      }// 一步的查找不合法的动作结束。
    }// 整个pathtable的所有步数模拟结束，查找不合法的动作结束。

  }

  return result; // 没有新的constraint
};

const calcSIC = function (pathTable) {
  // calc sum of individual costs. solution其实就是一个三维数组，pathTable
  // 明确的一点是，如果是offline的算法，pathTable里的点的路径长度不一定都是一样长。
  let cost = 0;
  for (let iUnit = 0; iUnit < pathTable.length; iUnit += 1) {
    cost += pathTable[iUnit].length;
  }
  // console.log(cost);
  return cost;
};