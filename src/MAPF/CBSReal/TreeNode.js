/**
 * Created by zhuweiwang on 2018/6/1.
 */
/**
 * JavaScript 类 class 是JS现有的基于原型的继承的语法糖
 */

function TreeNode(constraints) {
  /**
   * constraints 格式应该是
   * [
   * [{timeIndex:, row:, col:},{timeIndex:, row:, col:},... ],
   * [],
   * ...
   * ]
   *
   * 这个数组的长度应该是和
   *
   */
  this.constraints = constraints;
  /**
   * solution. A set of k paths, one path for each agent。一个pathTable
   */
  this.solution = [];
  /**
   * cost. (summation over all the single-agent path costs
   */
  this.cost = null;

}

module.exports = TreeNode;