/**
 * Created by zhuweiwang on 2018/6/1.
 *
 * Low-level: Find Paths for CT Nodes. 根据 treeNode 给每个单位找路径
 *
 * 输入：一个treeNNode
 * 输出：一个pathTable
 *
 * 准确的说，这个是根据constraint生成一个TreeNode
 */
import AStarByConflictFinder from '../../finders/AStarByConflictFinder';

export const findPathByConstraint = function (constriants, goalTable, searchDeepth, matrix) {
  // constraints [{optIndex:, timeIndex:, row:, col:},{}, ...]
  // optIndex 是小车在数组中的 index

  /*
   * 1. 直接一个 for 循环，遍历constraints里的obj，constraints长度和unitNum一样。依次规划出对应的路径。
   * 2. 再
   *
   * */
  const pathTable = [];

  for (let i = 0; i < constriants.length; i += 1) {
    const singleConstraints = constriants[i];
    const finder = new AStarByConflictFinder();
    const path = finder.findPath(i, goalTable, searchDeepth, singleConstraints, matrix);
    if(path.length === 0){
      console.warn('没有找到路径，i：', i);
    }
    pathTable[i] = path;
  }

  return pathTable;
};