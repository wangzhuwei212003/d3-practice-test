/**
 * Created by zhuweiwang on 29/03/2018.
 */

function Node(row, col, walkable) {
  // 这里传进来的行数，列数, 都是左上角为原点，向右下增大
  /**
   * The x coordinate of the node on the grid.
   * @type number
   */
  this.row = row;
  /**
   * The y coordinate of the node on the grid.
   * @type number
   */
  this.col = col;
  /**
   * Whether this node can be walked through.
   * @type boolean
   */
  this.walkable = (walkable === undefined ? true : walkable);
}

module.exports = Node;