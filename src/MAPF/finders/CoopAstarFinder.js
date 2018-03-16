/**
 * Created by zhuweiwang on 14/03/2018.
 */

import Heap from 'heap';
import Util from '../core/Util';
import Heuristic from '../core/Heuristic';
import Grid from '../core/Grid';

function CoopAstarFinder(opt) {
  opt = opt || {};
  this.heuristic = opt.heuristic || Heuristic.manhattan;
  this.weight = opt.weight || 1;

}

CoopAstarFinder.prototype.findPath = function (index, goalTable, searchDeepth, pathTable, matrix) {
  // grid 包含的应该是固有的障碍，ignoring other agents

// path table 是3维数组，表示所有小车的路径。而且 path table 里应该是像一种 window的感觉，时间窗。已经执行过的timestep往前删除掉，剩下的保留，以及新规划的路径往里添加。
// 这么写出来之后再来看，应该是规划的 depth 不是越长越好.
// [
//  [[],[],[],[],[]],
//  [[],[],[],[],[]],
//  [[],[],[],[],[]],
//  [[],[],[],[],[]],
// ]
// 如上是4个小车的 path table 的样子。。
// 初始数据应该至少也是 [[],[],[],[]], 首先多少个车是定的。可能为空数组。
//
// 还有一个多对多的点对点的数组。这个数组是在上面的调用 path finder 的代码块里。 goalTable
// [
//  [[start-row, start-col], [end-row, end-col]],
//  [[start-row, start-col], [end-row, end-col]],
//  [[start-row, start-col], [end-row, end-col]],
//  [[start-row, start-col], [end-row, end-col]],
// ]。

  const startRow = goalTable[index][0][0];
  const startCol = goalTable[index][0][1];
  const endRow = goalTable[index][1][0];
  const endCol = goalTable[index][1][1];

  // 根据这些参数，首先我能够知道的是 特定的小车（index）特定的目标（index + goalTable）其他小车的路径（path table）固有的地形障碍（matrix）搜索的步长（searchDeepth）。
  // 步骤：
  // 1. 生成用于寻路的reservation table；
  // 2. 根据当前的点，得到后面的一个timestep里的相关的点。
  // 3. 对这些点进行 loop 更新、push、pop 寻路。得到一条路径。
  // 4. 循环对所有的小车执行这样的操作。

  const reservationTable = new Array(searchDeepth * 2);
  for (let index = 0; index < reservationTable.length; index += 1) {
    reservationTable[index] = new Grid(30, 30, matrix)
  }
  // 根据 path table 添加相对应的 node 的占位。这里其实我是不用管具体是哪辆车
  let pathNode, reservedNode;

  //console.log(pathTable);

  for (let i = 0; i < pathTable.length; i += 1) {
    if(i === index){
      continue
    }
    for (let j = 0; j < pathTable[i].length; j += 1) {
      // 精确到每一条路径中的每一个点了。 j 是一条路径中的 timestep。
      pathNode = pathTable[i][j]; // [row, col]
      // j时刻的grid
      reservedNode = reservationTable[j].getNodeAt(pathNode[0], pathNode[1]); // 根据路径中的 row、col 得到相对应的点 {row: col: walkable:}
      reservedNode.walkable = false;
      reservedNode.moveTo = (j === pathTable[i].length - 1) ? {
        row: pathNode[0],
        col: pathNode[1]
      } : {row: pathTable[i][j + 1][0], col: pathTable[i][j + 1][1]} // 存上下一时刻的动作。
    }
  } // end for loop。
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

      //endnode 应该是暂时不知道哪个点，只是知道 row、col. 到时候判断到达不用 ===，直接判断 row、col 的值。
      //endNode = grid.getNodeAt(endRow, endCol),

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
  startNode.f = 0;
  startNode.t = 0; // t 代表时间，个人是觉得能够 f = g + h + t，把时间也考虑进去。

  openList.push(startNode);
  startNode.opened = true; // 这里的 startnode 只是一个引用。

  while (!openList.empty()) {
    //从openlist里找到（哪个值我不确定，如果是 backwards search 的话，应该是 g ）值最小的 node。pop是从heap里删除掉最小的 并返回这个最小的元素。
    node = openList.pop();
    node.closed = true;  // 这一步是必须的，没错，这里要标记一下。。 其实这个地方是 close 了，但是下一个 grid 还是有这个点。所以可以说是一个grid全部都没有了。

    // 如果反向找到了起始点，那么路径已找到，并返回这个路径
    // if (node.row === endRow && node.col === endCol){
    //   console.log('find the path'); // 如果这个是已经找了，前提是我也不知道endpoint是哪个timestep里的，所以只能这样来判断。
    //   return Util.backtrace(node);
    // } 这段注释是因为，即使是到达了终点，也要继续计算。

    if(node.t >= searchDeepth -1){
      console.log(`寻路暂停，beyond the deepth，${searchDeepth}`);
      console.log(Util.backtraceNode(node));
      return Util.backtrace(node);
    }

    // 根据当前的这个格子找下一个要搜索的点，这些点应该是下一个 timestep 里的，也就是下一个 grid。
    // 这里的点应该是包括自身node + 周围的node。分别对应的就是在原处停止 wait，和其他的 action。

    // find the node in which grid. 直接查node的index比较直接。还是直接在同一个 grid 里的所有node里添加一个 t 字段比较方便。
    gridNextStep = reservationTable[node.t + 1];
    if(!gridNextStep){
      console.log(node.t);
      console.log(reservationTable);
      debugger;
    }

    nodeNextStep = gridNextStep.getNodeAt(node.row, node.col); // 得到下一个grid里的相同位置的node
    // 当前的点不一定能够 wait，因为可能别的小车要过来。这样的情况就要其他的小车让路了。

    neighbors = gridNextStep.getNeighbors(nodeNextStep); // 得到下一个 grid 里的node。

    // 然后 探索下一个 grid 里的这些选出来的点。
    // 这里所有的点都是根据上面 pop 出来的点得出的一系列的相关的点。
    if(nodeNextStep.walkable){
      neighbors.push(nodeNextStep); // 如果待在原地是合法的话。
      nodeNextStep.t = node.t + 1;
    }

    for(i = 0, l = neighbors.length; i < l; ++i){
      // 探索所有的合法的点。此时 neighbors 里的点都是下一步没有占用的点
      // 还有一点是要 剔除 掉对向互换位置的点

      neighbor = neighbors[i];

      col = neighbor.col;
      row = neighbor.row;

      if(neighbor.moveTo && neighbor.moveTo.row === node.row && neighbor.moveTo.col === node.col){
        // 判断为相对互换位置，不合法，跳过
        continue
      }

     // ng = node.g + 1 + node.t + 1; // new g is the sum of the moving cost and the time cost.
       // time cost ignore ? 1代表的是1个timestep，另外的我觉得还应该加上一个1 路程的cost
      ng = node.g + 1; // wait will gain a time cost 1

      if(node.row === row && node.col === col){
        ng = node.g;
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

export default CoopAstarFinder;
