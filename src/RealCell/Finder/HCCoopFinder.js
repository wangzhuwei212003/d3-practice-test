/**
 * Created by zhuweiwang on 31/03/2018.
 */

import Heap from 'heap';
import * as Util from './core/Util';
import Heuristic from './core/Heuristic';
import Grid from './core/Grid';
import {

  occupyRowConfig,
  occupyColConfig
} from '../config';

import * as CONFIG from '../config';

function HCCoopFinder(opt) {
  opt = opt || {};
  this.heuristic = opt.heuristic || Heuristic.huicang;
  this.weight = opt.weight || 1;

}

HCCoopFinder.prototype.findPath = function (index, goalTable, searchDeepth, pathTable, matrix, rowNum, colNum) {

  const startRow = goalTable[index][0][0];
  const startCol = goalTable[index][0][1];
  const endRow = goalTable[index][1][0];
  const endCol = goalTable[index][1][1];

  const reservationTable = new Array(searchDeepth + 1); // 这个值应该是 pathtable 最长的一个数组长度
  for (let index = 0; index < reservationTable.length; index += 1) {
    reservationTable[index] = new Grid(colNum, rowNum, matrix)
  }

  let pathNode, reservedNode;

  for (let i = 0; i < pathTable.length; i += 1) { // i is the index of unit
    if (i === index) {
      continue
    }
    for (let j = 0; j < pathTable[i].length; j += 1) {
      pathNode = pathTable[i][j]; // [row, col]
      // j时刻的grid

      // 考虑 footprint，按照现在的划格子方法，横向占位4格，竖向占位6格。pathnode是左下角的点。
      for (let occupyCol = 0; occupyCol < occupyColConfig; occupyCol += 1) {
        for (let occupyRow = 0; occupyRow < occupyRowConfig; occupyRow += 1) {
          // 根据路径中的 row、col 得到相对应的点 {row: col: walkable:}
          // 如果是超过了就直接跳过。
          let nodeRow = pathNode[0] - occupyRow; // for循环里的row
          let nodeCol = pathNode[1] + occupyCol; // for循环里的col

          if (
              nodeRow < 0 || nodeRow > CONFIG.rowNum - 1 ||
              nodeCol < 0 || nodeCol > CONFIG.colNum - 1
          ) {
            continue
          }

          reservedNode = reservationTable[j].getNodeAt(pathNode[0] - occupyRow, pathNode[1] + occupyCol);

          // reservedNode.walkable = false; 注意这里已经删除了 walkable,这里仅仅会影响到 getNeighbors 方法。
          reservedNode.unitWalkable = false; // 把横向的三个点都设为 unitWalkable 为 false
          reservedNode.moveTo = (j === pathTable[i].length - 1) ? {
            row: pathNode[0] - occupyRow,
            col: pathNode[1] + occupyCol
          } : {row: pathTable[i][j + 1][0] - occupyRow, col: pathTable[i][j + 1][1] + occupyCol} // 存上下一时刻的动作。
        }
      } // 每一个点有4行3列的占位。
    } // 对于每条路径中的每个点，都有一个4 * 3格的占位
  } // end for loop，所有pathtable里的点占位情况更新完毕。
  // reservation table ready ！！！

  // 1. Heap 还是 heap，push、pop 都是要用到的。
  // 2. 有5种 action，上下左右以及停止. 所有的 action 每一步的cost都是 1，和一个timestep相对应。
  // 3. 一个动作合法，意味着符合一些规则，没有障碍，没有别的小车再占用，还有没有其他小车的互换位置。这些规则还要增加。
  const openList = new Heap(function (nodeA, nodeB) {
        return nodeA.f - nodeB.f;
      }), // openlist 里的 node 不是同一个 grid, heap 里的对象是所有的 node

      // startnode 是对应index的点的 timestep 为 0 的grid里的点。
      // 如果是要规划，肯定 startNode 对应的就是time step 是 0 的 grid map 里的点。
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
      //console.log(`寻路暂停，beyond the deepth，${searchDeepth}`);
      //console.log('规划出来的路径：', Util.backtraceNode(node));
      return Util.backtrace(node);
    }

    // 根据当前的这个格子找下一个要搜索的点，这些点应该是下一个 timestep 里的，也就是下一个 grid。
    // 这里的点应该是包括自身node + 周围的node。分别对应的就是在原处停止 wait，和其他的 action。

    // find the node in which grid. 直接查node的index比较直接。还是直接在同一个 grid 里的所有node里添加一个 t 字段比较方便。
    gridNextStep = reservationTable[node.t + 1];
    if (!gridNextStep) {
      console.log(node.t);
      console.log(reservationTable);
      debugger;
    }

    nodeNextStep = gridNextStep.getNodeAt(node.row, node.col); // 得到下一个grid里的相同位置的node
    // 当前的点不一定能够 wait，因为可能别的小车要过来。这样的情况就要其他的小车让路了。

    /*
     * 如果是这么特殊的情况，周围的运动方向只有一个，只有中间能上下移动
     *
     */
    if (
        node.row >= 1 && node.row <= CONFIG.rowNum - 2 &&
        node.col >= 8 && node.col <= CONFIG.colNum - 12
    ) {
      // 在中间货位部分，能够上下移动
      neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'DOWN');
      //  neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'UPDOWN');
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
        // console.log(nodeNextStep);
        // console.log(neighbors);
        // debugger;
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

    let testArray = [];
    for (i = 0, l = neighbors.length; i < l; i += 1) {
      let test = neighbors[i];

      col = test.col;
      row = test.row;

      if (test.moveTo) {
        //console.log(test.moveTo);
        //debugger; //这里永远不会触发。。如果是有 footprint 是会有moveTo的
      }

      let nodeBeforeTest = reservationTable[node.t].getNodeAt(test.row, test.col); // 得到正确的 timestep 的点。
      if (nodeBeforeTest.moveTo && nodeBeforeTest.moveTo.row === node.row && nodeBeforeTest.moveTo.col === node.col) {
        // 判断为相对互换位置，不合法，跳过
        console.log('检测到 相对方向');
        continue
      }
      testArray.push(test);
    } // end for

    // 然后 探索下一个 grid 里的这些选出来的点。
    // 这里所有的点都是根据上面 pop 出来的点得出的一系列的相关的点。
    if (nodeNextStep.walkable && nodeNextStep.unitWalkable && testArray.length === 0) {
      // if(nodeNextStep.walkable ){
      testArray.push(nodeNextStep); // 如果待在原地是合法的，且没有其他可走的点了.... HC 中，要你能够待在原地。
      nodeNextStep.t = node.t + 1;
    } else if (nodeNextStep.walkable && nodeNextStep.unitWalkable && endRow === node.row && endCol === node.col) {
      testArray.push(nodeNextStep); // 如果已到达终点
      nodeNextStep.t = node.t + 1;
    } else if (nodeNextStep.walkable && nodeNextStep.unitWalkable && testArray.length === 1 &&
        node.row >= 1 && node.row <= CONFIG.rowNum - 2 &&
        node.col >= 8 && node.col <= CONFIG.colNum - 12
    ) {
      // 如果如果是中间列只有一个 neighbor 可走，那应该就是堵住了，这个时候应该停。
      // 这个地方有个bug，就是上面的车下来的时候，可能会挡道，导致停止。

      // 目前想到的方法，如果是 neighbor 只有一个，但是不是下面的一个，那就是下面堵住了，要后退了，这个时候是要停的。
      // 如果 neighbor 的 neighbor 还是只有一个，那就待在原地。
      let nei = testArray[0];
      // 判断 nei方向和终点的方向，如果是方向相同，那就运动，但是如果是方向相反，那么就老实待在原点。
      if (
          (nei.row - node.row <= 0 && endRow - node.row <= 0) ||
          (nei.row - node.row > 0 && endRow - node.row > 0)
      ) {
        // 方向相同，do nothing，no need to push the nodeNextStep
      } else {
        // 否则方向不同，就待在原地
        testArray.push(nodeNextStep);
        nodeNextStep.t = node.t + 1;
      }
    }

    // 下面这句是罪恶之源，上面那么多行就是为了确保不随便加原地点。
    // 如果经过上面的判断都没加上，那就是不应该加。除非上面的判断考虑的不够。
    // if(testArray.length === 0){
    //   console.log('没有符合要求的neighbor，添加当前点');
    //   testArray.push(nodeNextStep);
    //   nodeNextStep.t = node.t + 1;
    // }

    for (i = 0, l = testArray.length; i < l; i += 1) {
      // 探索所有的合法的点。此时 neighbors 里的点都是下一步没有占用的点
      // 还有一点是要 剔除 掉对向互换位置的点

      neighbor = testArray[i];

      // if(neighbor.closed){
      //   continue
      // }

      col = neighbor.col;
      row = neighbor.row;

      ng = node.g + 1;
      if (node.row === row && node.col === col) {
        ng = node.g; // 停留在原地没有新增 cost
      }

      if (!neighbor.opened || ng < neighbor.g) {
        neighbor.g = ng;
        neighbor.h = neighbor.h || weight * heuristic(row, col, endRow, endCol);
        // neighbor.h = neighbor.h || weight * heuristic(abs(col - endCol), abs(row - endRow));
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
  debugger;
  return [];
  // return [[startRow, startCol], ];
};

export default HCCoopFinder;
