/**
 * Created by zhuweiwang on 20/03/2018.
 */
/**
 * Created by zhuweiwang on 14/03/2018.
 */

import Heap from 'heap';
import Util from '../core/Util';
import Heuristic from '../core/Heuristic';
import Grid from '../core/Grid';

const topTurnRow = 9; // 由于前端界面的问题，这里的值是特殊的，代表最顶部一行刚拐弯。即是最顶部一行减 1
const topTurnCol = 7; // 同上一个点的 col

const boxRow = 6; // 中间有箱子的行数、列数
const boxCol = 5;

const btmTurnRow = topTurnRow + boxRow * 3;
const topEndTurnCol = topTurnCol + (boxCol - 1) * 2;

const pickRow = 22; // 这个是根据UI测试的图里定的。可以说是写死了。

const ShelfCol = 23; // 一共有这么多列

function HCCoopAstarFinder(opt) {
  opt = opt || {};
  this.heuristic = opt.heuristic || Heuristic.huicang;
  this.weight = opt.weight || 1;

}

HCCoopAstarFinder.prototype.findPath = function (index, goalTable, searchDeepth, pathTable, matrix, rowNum, colNum) {

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

  const reservationTable = new Array(searchDeepth +1); // 这个值应该是 pathtable 最长的一个数组长度
  for (let index = 0; index < reservationTable.length; index += 1) {
    reservationTable[index] = new Grid(colNum, rowNum, matrix)
  }
  // 根据 path table 添加相对应的 node 的占位。这里其实我是不用管具体是哪辆车
  let pathNode, reservedNode;

  for (let i = 0; i < pathTable.length; i += 1) { // i is the index of unit
    if(i === index){
      continue
    }
    for (let j = 0; j < pathTable[i].length; j += 1) {
      // 精确到每一条路径中的每一个点了。 j 是一条路径中的 timestep。
      pathNode = pathTable[i][j]; // [row, col]
      // j时刻的grid

      // // 考虑 footprint，先考虑1行3列。
      // for(){
      //
      // }


      reservedNode = reservationTable[j].getNodeAt(pathNode[0], pathNode[1]); // 根据路径中的 row、col 得到相对应的点 {row: col: walkable:}
      reservedNode.walkable = false;
      reservedNode.moveTo = (j === pathTable[i].length - 1) ? {
        row: pathNode[0],
        col: pathNode[1]
      } : {row: pathTable[i][j + 1][0], col: pathTable[i][j + 1][1]} // 存上下一时刻的动作。
      //console.log(reservedNode);
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

    if(node.t >= searchDeepth -1){
      //console.log(`寻路暂停，beyond the deepth，${searchDeepth}`);
      //console.log('规划出来的路径：', Util.backtraceNode(node));
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

    /*
    * 如果是这么特殊的情况，周围的运动方向只有一个，只有中间能上下移动
    *
    */
    if(
        node.row >= topTurnRow && node.row <= btmTurnRow &&
        node.col >= topTurnCol && node.col <= topEndTurnCol
    ){
      // 在中间货位部分，能够上下移动
      neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'UPDOWN');
    }else if (
        (node.col <= 3 && node.row <= btmTurnRow) ||
        (node.col === 1 && node.row === btmTurnRow + 1)
    ){
      // 上升列，能够往右上，不能下
      neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'UPRIGHT');
    }else if (
        node.row === topTurnRow - 1 &&
        node.col >= 3 && node.col < ShelfCol - 4
    ){
      // 最上面一行，分情况，看目标
      /*
      * 1. 只能往右，目标列不等于当前列
      * 2. 只能往下，目标列等于当前列
      */
      if(node.col === endCol){
        neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'DOWN');
      }else{
        neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'RIGHT');
      }
    } else if (node.col >= ShelfCol - 4 && node.row <= btmTurnRow){
      // 下降列，只能右下
      neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'DOWNRIGHT');
    } else if (
        node.row === btmTurnRow + 1 &&
        (node.col >=2 && node.col <= ShelfCol -2)
    ){
      // 最底部一行，只能往左
      neighbors = gridNextStep.HCgetNeighborsOneDirection(nodeNextStep, 'LEFT');
    }

    let testArray = [];
    for(i = 0, l = neighbors.length; i < l; i +=1){
      let test = neighbors[i];

      col = test.col;
      row = test.row;

      if(test.moveTo){
        console.log(test.moveTo);
        debugger; //这里永远不会触发。。
      }

      let nodeBeforeTest = reservationTable[node.t].getNodeAt(test.row, test.col); // 得到正确的 timestep 的点。
      if(nodeBeforeTest.moveTo && nodeBeforeTest.moveTo.row === node.row && nodeBeforeTest.moveTo.col === node.col){
        // 判断为相对互换位置，不合法，跳过
        console.log('检测到 相对方向');
        continue
      }
      testArray.push(test);
    } // end for

    // 然后 探索下一个 grid 里的这些选出来的点。
    // 这里所有的点都是根据上面 pop 出来的点得出的一系列的相关的点。
    if(nodeNextStep.walkable && testArray.length === 0){
    // if(nodeNextStep.walkable ){
      testArray.push(nodeNextStep); // 如果待在原地是合法的话。来一剂猛药，且没有其他可走的点了.... HC 中，要你能够待在原地。
      //neighbors.unshift(nodeNextStep); // 如果待在原地是合法的话。unshift 会不会有改变
      nodeNextStep.t = node.t + 1;
    }else if(nodeNextStep.walkable && endRow === node.row && endCol === node.col ){
      testArray.push(nodeNextStep); // 如果待在原地是合法的 且已到达终点
      nodeNextStep.t = node.t + 1;
    }else if(nodeNextStep.walkable && testArray.length === 1 &&
        node.row >= topTurnRow && node.row <= btmTurnRow &&
        node.col >= topTurnCol && node.col <= topEndTurnCol
    ){
      // 如果如果是中间列只有一个 neighbor 可走，那应该就是堵住了，这个时候应该停。
      // 这个地方有个bug，就是上面的车下来的时候，可能会挡道，导致停止。

      // 目前想到的方法，如果是 neighbor 只有一个，但是不是下面的一个，那就是下面堵住了，要后退了，这个时候是要停的。
      // 如果 neighbor 的 neighbor 还是只有一个，那就待在原地。
      let nei = testArray[0];
      // 判断 nei方向和终点的方向，如果是方向相同，那就运动，但是如果是方向相反，那么就老实待在原点。
      if(
          (nei.row - node.row <=0 && endRow - node.row <= 0) ||
          (nei.row - node.row > 0 && endRow - node.row <= 0)
      ){
        // 方向相同，do nothing，no need to push the nodeNextStep
      }else{
        // 否则方向不同，就待在原地
        testArray.push(nodeNextStep);
        nodeNextStep.t = node.t + 1;
      }
    }

    if(testArray.length === 0){
      console.log('没有符合要求的neighbor，添加当前点');
      testArray.push(nodeNextStep);
      nodeNextStep.t = node.t + 1;
    }

    for(i = 0, l = testArray.length; i < l; i +=1){
      // 探索所有的合法的点。此时 neighbors 里的点都是下一步没有占用的点
      // 还有一点是要 剔除 掉对向互换位置的点

      neighbor = testArray[i];

      // if(neighbor.closed){
      //   continue
      // }

      col = neighbor.col;
      row = neighbor.row;

      ng = node.g + 1 ;
      if(node.row === row && node.col === col){
        ng = node.g ; // 停留在原地没有新增 cost
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
  return [];
  // return [[startRow, startCol], ];
};

export default HCCoopAstarFinder;
