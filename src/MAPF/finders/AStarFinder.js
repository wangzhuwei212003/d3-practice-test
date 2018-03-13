import Heap from 'heap';
import Util from '../core/Util';

import Heuristic from '../core/Heuristic';

/**
 * A* path-finder. Based upon https://github.com/bgrins/javascript-astar
 * @constructor
 * @param {Object} opt
 * @param {boolean} opt.allowDiagonal Whether diagonal movement is allowed.
 *     Deprecated, use diagonalMovement instead.
 * @param {boolean} opt.dontCrossCorners Disallow diagonal movement touching
 *     block corners. Deprecated, use diagonalMovement instead.
 * @param {DiagonalMovement} opt.diagonalMovement Allowed diagonal movement.
 * @param {function} opt.heuristic Heuristic function to estimate the distance
 *     (defaults to manhattan).
 * @param {number} opt.weight Weight to apply to the heuristic to allow for
 *     suboptimal paths, in order to speed up the search.
 */
function AStarFinder(opt) {
  opt = opt || {};
  this.heuristic = opt.heuristic || Heuristic.manhattan;
  this.weight = opt.weight || 1;

  // When diagonal movement is allowed the manhattan heuristic is not
  //admissible. It should be octile instead || diagonal is not allowed !!
}

/**
 * Find and return the the path.
 * @return {Array<Array<number>>} The path, including both start and
 *     end positions.
 */
AStarFinder.prototype.findPath = function(startX, startY, endX, endY, grid) {
  const openList = new Heap(function(nodeA, nodeB) {
        return nodeA.f - nodeB.f;
      }),
      startNode = grid.getNodeAt(startX, startY),
      endNode = grid.getNodeAt(endX, endY),
      heuristic = this.heuristic,
      weight = this.weight, // 这个weight可以说是 g 和 h 的权重
      abs = Math.abs, SQRT2 = Math.SQRT2;

  let node, neighbors, neighbor, i, l, x, y, ng;

  // set the `g` and `f` value of the start node to be 0
  startNode.g = 0;
  startNode.f = 0;

  // push the start node into the open list
  openList.push(startNode);
  startNode.opened = true; // 这句话会改变已经 push 到 openList 里面的 startNode 吗？看来是会

  // while the open list is not empty
  while (!openList.empty()) {
    // pop the position of node which has the minimum `f` value. 找到 f 值最小的 node。pop是从heap里删除掉最小的 并返回这个最小的元素。
    node = openList.pop();
    node.closed = true;

    // if reached the end position, construct the path and return it. 如果已经找到了目标点，那么就返回这个路径
    if (node === endNode) {
      return Util.backtrace(endNode);
    }

    // get neigbours of the current node
    neighbors = grid.getNeighbors(node);
    for (i = 0, l = neighbors.length; i < l; ++i) {
      neighbor = neighbors[i];

      if (neighbor.closed) {
        continue;
      }

      x = neighbor.x;
      y = neighbor.y;

      // get the distance between current node and the neighbor
      // and calculate the next g score
      ng = node.g + ((x - node.x === 0 || y - node.y === 0) ? 1 : SQRT2); // if the diagonal move is not allowed, neighbors all either same x or y, the next g score will not add SQRT2

      // check if the neighbor has not been inspected yet, or
      // can be reached with smaller cost from the current node
      if (!neighbor.opened || ng < neighbor.g) {
        neighbor.g = ng;
        neighbor.h = neighbor.h || weight * heuristic(abs(x - endX), abs(y - endY));
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = node;

        if (!neighbor.opened) {
          openList.push(neighbor);
          neighbor.opened = true;
        } else { // 这里是需要更新 g 的 neighbor。
          // the neighbor can be reached with smaller cost.
          // Since its f value has been updated, we have to
          // update its position in the open list
          openList.updateItem(neighbor);
        }
      }
    } // end for each neighbor
  } // end while not open list empty

  // fail to find the path
  return [];
};

module.exports = AStarFinder;
