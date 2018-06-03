/**
 * Created by zhuweiwang on 2018/6/3.
 */
import TreeNode from '../TreeNode';
import {findPathByConstraint} from '../lowLevel/finderByConstraints';
import Heap from 'heap';

export const initialRoot = function (goalTable, searchDeepth, matrix) {
  /*
   * 1. 生成 root，起始的treeNode
   * 2. 使用 openList 开始寻找最终 solution
   *
   * */

  // 1
  const constraints = [];
  const rootNode = new TreeNode(constraints);
  rootNode.solution = findPathByConstraint(constraints, goalTable, searchDeepth, matrix);
  rootNode.cost = calcSIC(rootNode.solution);

  // 2.
  const openList = new Heap(function (treeNode1, treeNode2) {
    return treeNode1.cost - treeNode2.cost;
  });
  openList.push(rootNode);

  while (!openList.empty()){
    const curTreeNode = openList.pop();
    const pathTable = curTreeNode.solution;

    let newConstraint = validateNode(pathTable, searchDeepth);
    if(!newConstraint){
      return pathTable; // 没有冲突了，这个就是最终的结果。
    }

    // 有新的conflict，生成新的 treeNode，并更新constraints
    newConstraint.forEach(function (constraint) {
      curTreeNode.constraints[constraint['optIndex']].push(constraint['optConstraint']);
      let newTreeNode = new TreeNode(curTreeNode.constraints);
      newTreeNode.solution = findPathByConstraint(curTreeNode.constraints, goalTable, searchDeepth, matrix);
      newTreeNode.cost = calcSIC(newTreeNode.solution);
      openList.push(newTreeNode);
    })
  }
};

const validateNode = function (pathTable, searchDeepth) {
  // The validation is performed by simulating the set of paths.找完所有路径之后，对 pathTable 做一个检查。看有没有 conflict。
  /*
   * 不合法的行为：
   * 1. 不同的点出现在同一时间，同一地点
   * 2. 互换位置。
   *
   * */

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

    thisStepPosition.forEach(function (position, iUnit) {
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
        console.log('有互换位置的冲突，在pathtable里的index是：', iUnit, oppositeDirectionUnitIndex);
        return [{
          optIndex: iUnit,
          optConstraint: {timeIndex: iStep + 1, row: nextPosition[0], col: nextPosition[1]}
        }, {
          optIndex: oppositeDirectionUnitIndex,
          optConstraint: {timeIndex: iStep + 1, row: position[0], col: position[1]}
        }] // {timeIndex:, row:, col:}
      }
    })// 一步的查找不合法的动作结束。
  }// 整个pathtable的所有步数模拟结束，查找不合法的动作结束。
  return null; // 没有新的constraint
};

const calcSIC = function (pathTable) {
  // calc sum of individual costs. solution其实就是一个三维数组，pathTable
  // 明确的一点是，如果是offline的算法，pathTable里的点的路径长度不一定都是一样长。
  let cost;
  for (let iUnit = 0; iUnit < pathTable.length; iUnit += 1) {
    cost += pathTable[iUnit].length;
  }
  return cost;
};