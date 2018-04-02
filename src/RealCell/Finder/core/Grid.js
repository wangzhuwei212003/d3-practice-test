/**
 * Created by zhuweiwang on 31/03/2018.
 */

import Node from './Node';
import * as CONFIG from '../config';


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
Grid.prototype._buildNodes = function (width, height, matrix) {
  let i, j,
      nodes = new Array(height);

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

  for (i = 0; i < height; i += 1) {
    for (j = 0; j < width; j += 1) {
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

Grid.prototype.getNodeAt = function (row, col) {
  return this.nodes[row][col];
};

Grid.prototype.isWalkableAt = function (row, col) {
  return this.isInside(row, col) && this.nodes[row][col].walkable;
};

Grid.prototype.isUnitWalkableAt = function (row, col) {
  //console.log(this.nodes[row][col].unitWalkable);
  return this.isInside(row, col) && this.nodes[row][col].unitWalkable;
};

Grid.prototype.isInside = function (row, col) {
  return (col >= 0 && col < this.width) && (row >= 0 && row < this.height);
};

Grid.prototype.setWalkableAt = function (row, col, walkable) {
  this.nodes[row][col].walkable = walkable;
};

Grid.prototype.HCgetNeighborsOneDirection = function (node, allowDirection) {
  const row = node.row,
      col = node.col,
      neighbors = [],
      nodes = this.nodes;

  let twoWalkable = true;
  let falseExit = false;

  // 大多数位置只允许一个运动方向
  if (allowDirection === 'UP') {
    // ↑
    if (this.isWalkableAt(row - 1, col)) {
      for (let occupyCol = 0; occupyCol < CONFIG.occupyColConfig; occupyCol += 1) {
        for (let occupyRow = 0; occupyRow < CONFIG.occupyRowConfig; occupyRow += 1) {
          // 占位是4行
          twoWalkable = twoWalkable && this.isUnitWalkableAt(row - 1 - occupyRow, col + occupyCol);
          if (twoWalkable === false) {
            return []; // 只要有一个阻挡，就不能移动，返回 []
          }
        }

      }
      // 如果执行完了，没有 return，就没有阻挡，return 一个可走的地方
      neighbors.push(nodes[row - 1][col]);
    }
  } else if (allowDirection === 'DOWN') {
    // ↓
    if (this.isWalkableAt(row + 1, col)) {
      for (let occupyCol = 0; occupyCol < CONFIG.occupyColConfig; occupyCol += 1) {
        for (let occupyRow = 0; occupyRow < CONFIG.occupyRowConfig; occupyRow += 1) {
          twoWalkable = twoWalkable && this.isUnitWalkableAt(row + 1 - occupyRow, col + occupyCol);
          //console.log(twoWalkable);
          if (twoWalkable === false) {
            //console.log('向下有阻挡');
            return []; // 只要有一个阻挡，就不能移动，返回 【】
          }
        }
      }
      neighbors.push(nodes[row + 1][col]);
      //console.log(neighbors);
    }
  } else if (allowDirection === 'LEFT') {
    // ←
    if (this.isWalkableAt(row, col - 1)) {

      for (let occupyCol = 0; occupyCol < CONFIG.occupyColConfig; occupyCol += 1) {
        for (let occupyRow = 0; occupyRow < CONFIG.occupyRowConfig; occupyRow += 1) {
          twoWalkable = twoWalkable && this.isUnitWalkableAt(row - occupyRow, col - 1 + occupyCol);
          //console.log(twoWalkable);
          if (twoWalkable === false) {
            return []; // 只要有一个阻挡，就不能移动，返回 【】
          }
        }
      }

      neighbors.push(nodes[row][col - 1]);
    }
  } else if (allowDirection === 'RIGHT') {
    // →
    if (this.isWalkableAt(row, col + 1)) {

      for (let occupyCol = 0; occupyCol < CONFIG.occupyColConfig; occupyCol += 1) {
        for (let occupyRow = 0; occupyRow < CONFIG.occupyRowConfig; occupyRow += 1) {
          twoWalkable = twoWalkable && this.isUnitWalkableAt(row - occupyRow, col + 1 + occupyCol);
          //console.log(twoWalkable);
          if (twoWalkable === false) {
            return []; // 只要有一个阻挡，就不能移动，返回 【】
          }
        }
      }

      neighbors.push(nodes[row][col + 1]);
    }
  }

  // 双向混合的不存在
  /*else if (allowDirection === 'UPDOWN') {
    // ↑
    if (this.isWalkableAt(row - 1, col)) {
      for (let occupyCol = 0; occupyCol < 3; occupyCol += 1) {
        for (let occupyRow = 0; occupyRow < 4; occupyRow += 1) {
          // 占位是4行
          twoWalkable = twoWalkable && this.isUnitWalkableAt(row - 1 - occupyRow, col - 1 + occupyCol);
          if (twoWalkable === false) {
            falseExit = true;
            break
          }
        }
        if(falseExit){
          break
        }
      }

      if (falseExit) {
        // 如果是因为错误跳出循环 do nothing
      } else {
        neighbors.push(nodes[row - 1][col]);
      }
    }
    // ↓
    if (this.isWalkableAt(row + 1, col)) {

      for (let occupyCol = 0; occupyCol < 3; occupyCol += 1) {
        for (let occupyRow = 0; occupyRow < 4; occupyRow += 1) {
          twoWalkable = twoWalkable && this.isUnitWalkableAt(row + 1 - occupyRow, col - 1 + occupyCol);
          if (twoWalkable === false) {
            return neighbors;
          }
        }
      }
      neighbors.push(nodes[row + 1][col]);
    }
  }
  else if (allowDirection === 'UPRIGHT') {
    // →
    if (this.isWalkableAt(row, col + 1)) {

      for (let occupyCol = 0; occupyCol < 3; occupyCol += 1) {
        for (let occupyRow = 0; occupyRow < 4; occupyRow += 1) {
          twoWalkable = twoWalkable && this.isUnitWalkableAt(row - occupyRow, col - 1 + 1 + occupyCol);
          if (twoWalkable === false) {
            falseExit = true;
            break
          }
        }
        if(falseExit){
          break
        }
      }

      if (falseExit) {
        // 如果是因为错误跳出循环 do nothing
      } else {
        neighbors.push(nodes[row][col + 1]);
      }
    }
    // ↑
    if (this.isWalkableAt(row - 1, col)) {

      for (let occupyCol = 0; occupyCol < 3; occupyCol += 1) {
        for (let occupyRow = 0; occupyRow < 4; occupyRow += 1) {
          // 占位是4行
          twoWalkable = twoWalkable && this.isUnitWalkableAt(row - 1 - occupyRow, col - 1 + occupyCol);
          if (twoWalkable === false) {
            return neighbors;
          }
        }
      }
      neighbors.push(nodes[row - 1][col]);
    }
  }
  else if (allowDirection === 'DOWNRIGHT') {
    // →
    if (this.isWalkableAt(row, col + 1)) {

      for (let occupyCol = 0; occupyCol < 3; occupyCol += 1) {
        for (let occupyRow = 0; occupyRow < 4; occupyRow += 1) {
          twoWalkable = twoWalkable && this.isUnitWalkableAt(row - occupyRow, col - 1 + 1 + occupyCol);
          if (twoWalkable === false) {
            falseExit = true;
            break
          }
        }
        if(falseExit){
          break
        }
      }

      if (falseExit) {
        // 如果是因为错误跳出循环 do nothing
      } else {
        neighbors.push(nodes[row][col + 1]);
      }
    }
    // ↓
    if (this.isWalkableAt(row + 1, col)) {
      for (let occupyCol = 0; occupyCol < 3; occupyCol += 1) {
        for (let occupyRow = 0; occupyRow < 4; occupyRow += 1) {
          twoWalkable = twoWalkable && this.isUnitWalkableAt(row + 1 - occupyRow, col - 1 + occupyCol);
          //console.log(twoWalkable);
          if (twoWalkable === false) {
            return neighbors;
          }
        }
      }
      neighbors.push(nodes[row + 1][col]);
    }
  }*/

  return neighbors;
};

Grid.prototype.clone = function () {
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
