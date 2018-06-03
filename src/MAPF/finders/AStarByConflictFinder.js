/**
 * Created by zhuweiwang on 2018/6/3.
 */
/**
 * Created by zhuweiwang on 14/03/2018.
 */

import Heap from 'heap';
import Util from '../core/Util';
import Heuristic from '../core/Heuristic';
import Grid from '../core/Grid';

function AStarByConflictFinder(opt) {
  opt = opt || {};
  this.heuristic = opt.heuristic || Heuristic.manhattan;
  this.weight = opt.weight || 1;

}

AStarByConflictFinder.prototype.findPath = function (index, goalTable, searchDeepth, constraints, matrix, offLine) {
  /*
   * 参数：
   * 1. constraints，一维数组，包含了相应unit应该满足的constraint，[{}...]
   * 2. index、正在操作的optIndex
   * 3. goalTable（其实就是正在操作的unit的起点、终点。）、
   * 4. searchDeepth
   * 5. matrix，地图的障碍信息
   * 6. 其实不需要 rownum、colnum，地图matrix里就包含了这个信息。
   *
   * */
  const startRow = goalTable[index][0][0];
  const startCol = goalTable[index][0][1];
  const endRow = goalTable[index][1][0];
  const endCol = goalTable[index][1][1];

  const conflictTable = new Array(searchDeepth);
  for (let i = 0; i < conflictTable.length; i += 1) {
    conflictTable[i] = new Grid(matrix);
  }
  // 添加当前小车的constraint，就是在某一个时刻不能经过的点。
  let conflictNode, reservedNode; // 这里假定是传进来的conflictTable就是对应的这个unit的。
  for (let i = 0; i < constraints.length; i += 1) { // i is the index of unit
    const timeIndex = constraints[i].timeIndex;
    const row = constraints[i].row;
    const col = constraints[i].col; //在第几步不能出现在哪一个点。

    reservedNode = conflictTable[timeIndex].getNodeAt(row, col);
    reservedNode.walkable = false;
    //console.log(reservedNode);
  } // end for loop。
  // conflictTable ready ！！！

  const openList = new Heap(function (nodeA, nodeB) {
        return nodeA.f - nodeB.f;
      }), // openlist 里的 node 不是同一个 grid, heap 里的对象是所有的 node

      startNode = conflictTable[0].getNodeAt(startRow, startCol),

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
  startNode.h = weight * heuristic(abs(startCol - endCol), abs(startRow - endRow));
  startNode.f = startNode.h + startNode.g;
  startNode.t = 0; // t 代表时间，个人是觉得能够 f = g + h + t，把时间也考虑进去。不能

  openList.push(startNode);
  startNode.opened = true; // 这里的 startnode 只是一个引用。

  while (!openList.empty()) {
    node = openList.pop(); // 找到 f 值最小的点
    node.closed = true;  // 其实这个地方是 close 了，但是下一个 grid 还是有这个点。所以可以说是一个grid全部都没有了。

    // 如果是一次找到一直到终点的路径，这个是要返回的。如果是实时的，就是不返回继续寻找路径。
    if(offLine){
      if (node.row === endRow && node.col === endCol){
        console.log('offLine, find the path'); // 如果这个是已经找了，前提是我也不知道endpoint是哪个timestep里的，所以只能这样来判断。
        return Util.backtrace(node);
      } //这段注释是因为，即使是到达了终点，也要继续计算。
    }

    // searchDeepth是总步数，不是从0开始。返回searchDeepth长度的路径
    if (node.t >= searchDeepth - 1) {
      console.log(`寻路停止，beyond the deepth，${searchDeepth}`);
      //console.log('规划出来的路径：', Util.backtraceNode(node));
      return Util.backtrace(node);
    }

    // find the node in which grid. 直接查node的index比较直接。还是直接在同一个 grid 里的所有node里添加一个 t 字段比较方便。
    gridNextStep = conflictTable[node.t + 1];
    if (!gridNextStep) {
      console.log(node.t);
      console.log(conflictTable);
      debugger; // 这一步应该是不会进来的，上一步就return了。
    }

    nodeNextStep = gridNextStep.getNodeAt(node.row, node.col); // 得到下一个grid里的相同位置的node
    // 当前的点不一定能够 wait，因为可能别的小车要过来。这样的情况就要其他的小车让路了。

    neighbors = gridNextStep.getNeighbors(nodeNextStep); // 得到下一个 grid 里的node。可能是下一步的点。

    // 一下是能够待在原地的情况，其他都是要动的。
    if (nodeNextStep.walkable && neighbors.length === 0) {
      neighbors.push(nodeNextStep); // 如果待在原地是合法的话。来一剂猛药，且没有其他可走的点了
      nodeNextStep.t = node.t + 1;
    } else if (nodeNextStep.walkable && endRow === node.row && endCol === node.col) {
      neighbors.push(nodeNextStep); // 如果待在原地是合法的 且已到达终点
      nodeNextStep.t = node.t + 1;
    }

    for (i = 0, l = neighbors.length; i < l; ++i) {
      // 探索所有的合法的点。此时 neighbors 里的点都是下一步没有占用的点
      // 还有一点是要 剔除 掉对向互换位置的点

      neighbor = neighbors[i];

      // if(neighbor.closed){
      //   continue
      // } 这里不可能是已经探索过的，因为已经是不同的 grid 了。

      col = neighbor.col;
      row = neighbor.row;

      // ng = node.g + 1 + node.t + 1; // new g is the sum of the moving cost and the time cost.
      // time cost ignore ? 1代表的是1个timestep，另外的我觉得还应该加上一个1 路程的cost
      ng = node.g + 1; // wait will gain a time cost 1. no time cost

      if (node.row === row && node.col === col) {
        ng = node.g; // plus time cost 1 , no no time cost 如果是在原地 wait，cost不增加。
      }

      if (!neighbor.opened || ng < neighbor.g) {
        neighbor.g = ng;
        neighbor.h = neighbor.h || weight * heuristic(abs(col - endCol), abs(row - endRow));
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
    //debugger;
  } // end while not open list empty
  // fail to find the path
  console.log('fail to find the path');
  return [];
};

export default AStarByConflictFinder;
