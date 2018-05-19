/**
 * Created by zhuweiwang on 02/04/2018.
 */

import Heap from 'heap';
import * as Util from '../core/Util';
import Heuristic from '../core/Heuristic';
import Grid from '../core/Grid';

// import * as CONFIG from '../configTeeth';
import * as CONFIG from '../config_V3';

function HCCoopFinder(opt) {
  opt = opt || {};
  this.heuristic = opt.heuristic || Heuristic.huicang;
  this.weight = opt.weight || 1;

}

HCCoopFinder.prototype.findPath = function (startN, endNode, searchDeepth, matrix, rowNum, colNum, ignoreOthers = false, goingUp = false) {

  const startRow = startN[0];
  const startCol = startN[1];
  const endRow = endNode[0];
  const endCol = endNode[1];

  const reservationTable = new Array(searchDeepth + 1); // 这个值应该是 pathtable 最长的一个数组长度
  for (let index = 0; index < reservationTable.length; index += 1) {
    reservationTable[index] = new Grid(colNum, rowNum, matrix);
  }

  // ignoreOthers do nothing

  const openList = new Heap(function (nodeA, nodeB) {
        return nodeA.f - nodeB.f;
      }), // openlist 里的 node 不是同一个 grid, heap 里的对象是所有的 node

      startNode = reservationTable[0].getNodeAt(startRow, startCol),

      heuristic = this.heuristic,
      weight = this.weight, // 这个weight可以说是 g 和 h 的权重
      abs = Math.abs, SQRT2 = Math.SQRT2;

  let node, // openList 里 pop 出来的 f 最小的点。
      nodeNextStep, // 和 node 位置一样，但是是下一个 time step 的
      gridNextStep, // node 下一个 time step 的 grid
      neighbors, // node 下一个 time step 的 grid 里能够考虑的 neighbor 集合
      neighbor, // 所有能够考虑的下一步的点
      i, // for loop 里的临时变量
      l, // for loop 里的临时变量
      col, // 同上
      row, // 同上
      ng; // 同上

  // set the `g` and `f` value of the start node to be 0
  startNode.g = 0;
  startNode.h = weight * heuristic(startRow, startCol, endRow, endCol);
  startNode.f = startNode.h + startNode.g;
  startNode.t = 0; // t 代表时间，个人是觉得能够 f = g + h + t，把时间也考虑进去。

  openList.push(startNode);
  startNode.opened = true; // 这里的 startnode 只是一个引用。

  while (!openList.empty()) {
    //从openlist里找到（哪个值我不确定，如果是 backwards search 的话，应该是 g ）值最小的 node。pop是从heap里删除掉最小的 并返回这个最小的元素。
    node = openList.pop();
    node.closed = true;  // 这一步是必须的，没错，这里要标记一下。。 其实这个地方是 close 了，但是下一个 grid 还是有这个点。所以可以说是一个grid全部都没有了。

    if (node.t >= searchDeepth - 1) {
      return Util.backtrace(node);
    }

    if (ignoreOthers) {
      if (node.row === endRow && node.col === endCol) {
        console.debug('已经到达终点, from pathFinder'); // 如果是仅仅为了计算总齿数，这个找到终点就能够直接返回。
        return Util.backtrace(node);
      }
    }

    // find the node in which grid. 直接查node的index比较直接。还是直接在同一个 grid 里的所有node里添加一个 t 字段比较方便。
    gridNextStep = reservationTable[node.t + 1];
    if (!gridNextStep) {
      console.debug(reservationTable);
      console.debug('超出reservation table范围');
    }

    nodeNextStep = gridNextStep.getNodeAt(node.row, node.col); // 得到下一个grid里的相同位置的node

    if (
        node.row >= 1 && node.row <= CONFIG.rowNum - 2 &&
        node.col >= 8 && node.col <= CONFIG.colNum - 12
    ) {
      // 在中间货位部分，能够上下移动
      if (goingUp) {
        // 如果是向上，那么做出相应的改变。
        neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'UP');
      } else {
        neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'DOWN');
      }
    } else if (
        (node.col === 0 && node.row >= 1)
    ) {
      // 上升列，能够往右上，不能下
      //neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'UPRIGHT');
      neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'UP'); // 上升列只能上
    } else if (
        node.row === 0 &&
        node.col >= 0 && node.col <= CONFIG.colNum - 5
    ) {
      // 最上面一行，除去最右上角的一点，分情况，看目标
      /*
       * 1. 只能往右，目标列不等于当前列
       * 2. 只能往下，目标列等于当前列
       */
      if (node.col === endCol) {
        neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'DOWN');
      } else {
        neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'RIGHT');
      }
    } else if (node.col === CONFIG.colNum - 4 && node.row <= CONFIG.rowNum - 2) {
      // 下降列，只能下，不包括最右下角
      neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'DOWN');
    } else if (
        node.row === CONFIG.rowNum - 1 &&
        (node.col >= 1 && node.col <= CONFIG.colNum - 4)
    ) {
      // 最底部一行，只能往左
      neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'LEFT');
    }

    if (neighbors === undefined) {
      //经常报这个错
      console.warn('不合法的行列数？node.row', node.row, 'node.col', node.col);
    }

    let testArray = [];
    for (i = 0, l = neighbors.length; i < l; i += 1) {
      let test = neighbors[i];

      col = test.col;
      row = test.row;

      if (test.moveTo) {
        //logger.debug(test.moveTo);
        //这里永远不会触发。。如果是有 footprint 是会有moveTo的
      }

      let nodeBeforeTest = reservationTable[node.t].getNodeAt(test.row, test.col); // 得到正确的 timestep 的点。
      if (nodeBeforeTest.moveTo && nodeBeforeTest.moveTo.row === node.row && nodeBeforeTest.moveTo.col === node.col) {
        // 判断为相对互换位置，不合法，跳过
        console.debug('检测到 相对方向');
        continue;
      }
      testArray.push(test);
    } // end for

    if (nodeNextStep.walkable && nodeNextStep.unitWalkable && testArray.length === 0) {
      testArray.push(nodeNextStep); // 如果待在原地是合法的，且没有其他可走的点了.... HC 中，要你能够待在原地。
      nodeNextStep.t = node.t + 1;
    } else if (nodeNextStep.walkable && nodeNextStep.unitWalkable && endRow === node.row && endCol === node.col) {
      testArray.push(nodeNextStep); // 如果已到达终点
      nodeNextStep.t = node.t + 1;
    }

    for (i = 0, l = testArray.length; i < l; i += 1) {

      neighbor = testArray[i];

      col = neighbor.col;
      row = neighbor.row;

      ng = node.g + 1;
      if (node.row === row && node.col === col) {
        ng = node.g; // 停留在原地没有新增 cost
      }
      if (!neighbor.opened || ng < neighbor.g) {
        neighbor.g = ng;
        neighbor.h = neighbor.h || weight * heuristic(row, col, endRow, endCol);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = node;
        if (!neighbor.opened) {
          openList.push(neighbor);
          neighbor.opened = true;
          neighbor.t = node.t + 1;
        } else { // 这里是需要更新 g 的 neighbor。
          openList.updateItem(neighbor);
        }
      }
    } // end for
  } // end while not open list empty
  console.warn('fail to find the path');
  return [];
};

export default HCCoopFinder;
