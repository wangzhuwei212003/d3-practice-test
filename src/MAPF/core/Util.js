/**
 * Created by zhuweiwang on 12/03/2018.
 */

function backtrace(node) {
  const path = [[node.row, node.col]];
  while (node.parent) {
    node = node.parent;
    path.push([node.row, node.col]);
  }
  return path.reverse();
}// 这里是用的 row、col，不是之前说的 x、y

exports.backtrace = backtrace;

function backtraceNode(node) {
  const pathTest = [node];
  while (node.parent) {
    node = node.parent;
    pathTest.push(node);
  }
  return pathTest.reverse();
}// 这里是用的 row、col，不是之前说的 x、y

exports.backtraceNode = backtraceNode;