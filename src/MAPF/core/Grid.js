//var Node = require('./Node');
import Node from './Node';

/**
 * The Grid class, which serves as the encapsulation of the layout of the nodes.
 * @constructor
 * @param {number|Array<Array<(number|boolean)>>} width_or_matrix Number of columns of the grid, or matrix
 * @param {number} height Number of rows of the grid.
 * @param {Array<Array<(number|boolean)>>} [matrix] - A 0-1 matrix
 *     representing the walkable status of the nodes(0 or false for walkable).
 *     If the matrix is not supplied, all the nodes will be walkable.
 *
 *     第三个参数是整个地图的阻挡的矩阵，0-1 矩阵，标识是否 walkable。这个是必须要有的。倒是前面这两个参数是没必要的
 */
function Grid(width_or_matrix, height, matrix) {
  let width;

  if (typeof width_or_matrix !== 'object') {
    width = width_or_matrix;
  } else {
    height = width_or_matrix.length;
    width = width_or_matrix[0].length;
    matrix = width_or_matrix;
  }

  /**
   * The number of columns of the grid.
   * @type number
   */
  this.width = width;
  /**
   * The number of rows of the grid.
   * @type number
   */
  this.height = height;

  /**
   * A 2D array of nodes.
   */
  this.nodes = this._buildNodes(width, height, matrix);
}

/**
 * Build and return the nodes.
 * @private
 * @param {number} width
 * @param {number} height
 * @param {Array<Array<number|boolean>>} [matrix] - A 0-1 matrix representing
 *     the walkable status of the nodes.
 * @see Grid
 */
Grid.prototype._buildNodes = function(width, height, matrix) {
  let i, j,
      nodes = new Array(height);

  // for (i = 0; i < height; ++i) {
  //   nodes[i] = new Array(width);
  //   for (j = 0; j < width; ++j) {
  //     nodes[i][j] = new Node(j, i);
  //   }
  // } 这种写法我深表怀疑，首先是 ++i，然后是 node i、j 为什么要互换位置呢？这里的 i、j 是 row、col 的意思。

  for (i = 0; i < height; i += 1) {
    nodes[i] = new Array(width);
    for (j = 0; j < width; j += 1) {
      nodes[i][j] = new Node(i, j);
    }
  }

  if (matrix === undefined) {
    return nodes;
  }

  if (matrix.length !== height || matrix[0].length !== width) {
    throw new Error('Matrix size does not fit');
  }

  for (i = 0; i < height; i+=1) {
    for (j = 0; j < width; j+=1) {
      if (matrix[i][j]) {
        // 0, false, null will be walkable
        // while others will be un-walkable， 1 或者 true 代表有障碍
        nodes[i][j].walkable = false;
      }
      nodes[i][j].unitWalkable = true;
    }
  }

  return nodes;
};

Grid.prototype.getNodeAt = function(row, col) {
  return this.nodes[row][col];
};


/**
 * Determine whether the node at the given position is walkable.
 * (Also returns false if the position is outside the grid.)
 * @param {number} x - The x coordinate of the node.
 * @param {number} y - The y coordinate of the node.
 * @return {boolean} - The walkability of the node.
 */
Grid.prototype.isWalkableAt = function(row, col) {
  return this.isInside(row, col) && this.nodes[row][col].walkable;
};

Grid.prototype.isUnitWalkableAt = function(row, col) {
  //console.log(this.nodes[row][col].unitWalkable);
  return this.isInside(row, col) && this.nodes[row][col].unitWalkable;
};


/**
 * Determine whether the position is inside the grid.
 * XXX: `grid.isInside(x, y)` is wierd to read.
 * It should be `(x, y) is inside grid`, but I failed to find a better
 * name for this method.
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
Grid.prototype.isInside = function(row, col) {
  return (col >= 0 && col < this.width) && (row >= 0 && row < this.height);
};

/**
 * Set whether the node on the given position is walkable.
 * NOTE: throws exception if the coordinate is not inside the grid.
 * @param {number} x - The x coordinate of the node.
 * @param {number} y - The y coordinate of the node.
 * @param {boolean} walkable - Whether the position is walkable.
 */
Grid.prototype.setWalkableAt = function(row, col, walkable) {
  this.nodes[row][col].walkable = walkable;
};


/**
 * Get the neighbors of the given node.
 *
 *     offsets      diagonalOffsets:
 *  +---+---+---+    +---+---+---+
 *  |   | 0 |   |    | 0 |   | 1 |
 *  +---+---+---+    +---+---+---+
 *  | 3 |   | 1 |    |   |   |   |
 *  +---+---+---+    +---+---+---+
 *  |   | 2 |   |    | 3 |   | 2 |
 *  +---+---+---+    +---+---+---+ 这里删掉了 diagnose 不考虑对角线的走法
 */
Grid.prototype.getNeighbors = function(node) {
  const row = node.row,
      col = node.col,
      neighbors = [],
      nodes = this.nodes;

  //仅考虑 上下左右 四个方向
  // ↑
  if (this.isWalkableAt(row-1, col)) {
    neighbors.push(nodes[row - 1][col]);
  }
  // →
  if (this.isWalkableAt(row, col +1)) {
    neighbors.push(nodes[row][col + 1]);
  }
  // ↓
  if (this.isWalkableAt(row +1, col)) {
    neighbors.push(nodes[row +1][col]);
  }
  // ←
  if (this.isWalkableAt(row, col-1)) {
    neighbors.push(nodes[row][col - 1]);
  }

  return neighbors;
};

Grid.prototype.HCgetNeighbors = function (node, prohibit = false) {
  const row = node.row,
      col = node.col,
      neighbors = [],
      nodes = this.nodes;

  //添加特殊情况：如果目标不是中间货位，不允许从中间货位穿
  if(prohibit){
    // 如果不允许，那么走到最上面一行就只有水平方向。
    // →
    if (this.isWalkableAt(row, col +1)) {
      neighbors.push(nodes[row][col + 1]);
    }
    // ←
    if (this.isWalkableAt(row, col-1)) {
      neighbors.push(nodes[row][col - 1]);
    }
  }else {
    //仅考虑 上下左右 四个方向
    // ↑
    if (this.isWalkableAt(row-1, col)) {
      neighbors.push(nodes[row - 1][col]);
    }
    // →
    if (this.isWalkableAt(row, col +1)) {
      neighbors.push(nodes[row][col + 1]);
    }
    // ↓
    if (this.isWalkableAt(row +1, col)) {
      neighbors.push(nodes[row +1][col]);
    }
    // ←
    if (this.isWalkableAt(row, col-1)) {
      neighbors.push(nodes[row][col - 1]);
    }
  }
  return neighbors;
};

Grid.prototype.HCgetNeighborsOneDirection = function (node, allowDirection) {
  const row = node.row,
      col = node.col,
      neighbors = [],
      nodes = this.nodes;

  let twoWalkable = true;
  let falseExit = true;

  // 大多数位置只允许一个运动方向
  if(allowDirection === 'UP'){
    // ↑
    if (this.isWalkableAt(row-1, col)) {
      for(let occupyCol = 0; occupyCol < 3; occupyCol += 1){
        twoWalkable = twoWalkable && this.isUnitWalkableAt(row -1, col-1+occupyCol);
        if(twoWalkable === false){
          return []; // 只要有一个阻挡，就不能移动，返回 【】
        }
      }
      // 如果执行完了，没有 return，就没有阻挡，return 一个可走的地方
      neighbors.push(nodes[row - 1][col]);
    }
  }else if(allowDirection === 'DOWN'){
    // ↓
    if (this.isWalkableAt(row +1, col)) {
      for(let occupyCol = 0; occupyCol < 3; occupyCol += 1){
        twoWalkable = twoWalkable && this.isUnitWalkableAt(row +1, col-1+occupyCol);
        //console.log(twoWalkable);
        if(twoWalkable === false){
          //console.log('向下有阻挡');
          return []; // 只要有一个阻挡，就不能移动，返回 【】
        }
      }
      neighbors.push(nodes[row +1][col]);
      //console.log(neighbors);
    }
  }else if(allowDirection === 'LEFT'){
    // ←
    if (this.isWalkableAt(row, col-1)) {
      neighbors.push(nodes[row][col - 1]);
    }
  }else if(allowDirection === 'RIGHT'){
    // →
    if (this.isWalkableAt(row, col +1)) {
      neighbors.push(nodes[row][col + 1]);
    }
  }else if(allowDirection === 'UPDOWN'){
    // ↑
    if (this.isWalkableAt(row-1, col)) {

      for(let occupyCol = 0; occupyCol < 3; occupyCol += 1){
        twoWalkable = twoWalkable && this.isUnitWalkableAt(row -1, col-1+occupyCol);
        if(twoWalkable === false){
          falseExit = true;
          break
        }
      }

      if(falseExit){
        // 如果是因为错误跳出循环 do nothing
      }else{
        neighbors.push(nodes[row - 1][col]);
      }
    }
    // ↓
    if (this.isWalkableAt(row +1, col)) {

      for(let occupyCol = 0; occupyCol < 3; occupyCol += 1){
        twoWalkable = twoWalkable && this.isUnitWalkableAt(row +1, col-1+occupyCol);
        //console.log(twoWalkable);
        if(twoWalkable === false){
          //console.log('向下有阻挡');
          return neighbors; //
        }
      }
      neighbors.push(nodes[row +1][col]);
    }
  }else if(allowDirection === 'UPRIGHT'){
    // →
    if (this.isWalkableAt(row, col +1)) {
      neighbors.push(nodes[row][col + 1]);
    }
    // ↑
    if (this.isWalkableAt(row-1, col)) {
      for(let occupyCol = 0; occupyCol < 3; occupyCol += 1){
        twoWalkable = twoWalkable && this.isUnitWalkableAt(row -1, col-1+occupyCol);
        if(twoWalkable === false){
          return []; // 只要有一个阻挡，就不能移动，返回 【】
        }
      }
      neighbors.push(nodes[row - 1][col]);
    }
  }else if(allowDirection === 'DOWNRIGHT'){
    // →
    if (this.isWalkableAt(row, col +1)) {
      neighbors.push(nodes[row][col + 1]);
    }
    // ↓
    if (this.isWalkableAt(row +1, col)) {
      for(let occupyCol = 0; occupyCol < 3; occupyCol += 1){
        twoWalkable = twoWalkable && this.isUnitWalkableAt(row +1, col-1+occupyCol);
        if(twoWalkable === false){
          return []; // 只要有一个阻挡，就不能移动，返回 【】
        }
      }
      neighbors.push(nodes[row +1][col]);
    }
  }

  return neighbors;
};


/**
 * Get a clone of this grid.
 * @return {Grid} Cloned grid.
 */
Grid.prototype.clone = function() {
  let i, j,

      width = this.width,
      height = this.height,
      thisNodes = this.nodes,

      newGrid = new Grid(width, height),
      newNodes = new Array(height);

  for (i = 0; i < height; ++i) {
    newNodes[i] = new Array(width);
    for (j = 0; j < width; ++j) {
      newNodes[i][j] = new Node(j, i, thisNodes[i][j].walkable);
    }
  }

  newGrid.nodes = newNodes;

  return newGrid;
};

export default Grid;
