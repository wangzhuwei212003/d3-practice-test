/**
 * Created by zhuweiwang on 2018/5/18.
 */
import HCCoopFinder from '../finder/HCCoopFinder';
import {calcTeeth} from './calcTeeth';

export const calTeethAndPinAction = function (optIndex, startNode, endNode, startShift = 0, endShift = 0, goingUp = false) {
  // goingUp 默认是 false

  // 根据起点、终点算路径。调用这个方法的时候，其实是设置 goalTable 的一个过程。
  // let _pathTable = Array(shuttleAmount).fill([]);
  let _pathTable = Array(uidArr.length).fill([]); // 这里应该是根据当前已注册的小车数量

  // 注意这里是应该要确保 matrixZero 是有的
  if (matrixZero.length === 0) {
    if (!!showDispatchLog) LOGGER.error('matrixZero 矩阵未设置！');
    return 0;
  }

  const finder = new HCCoopFinder();
  const path = finder.findPath(optIndex, goalTable, rowNum * 4 + colNum * 4, _pathTable, matrixZero, rowNum, colNum, true, goingUp); // 因为算齿数不考虑其他小车，这里ignore为true。

  let calcPath = path.reduce(function (accu, currentV, currentInx, arr) {
    if (accu.length === 0) {
      accu.push(currentV);
      return accu;
    } else if (accu[accu.length - 1][0] !== currentV[0] || accu[accu.length - 1][1] !== currentV[1]) {
      accu.push(currentV);
      return accu;
    } else {
      return accu;
    }
  }, []);

  console.log('path', path);
  console.log('calcPath', calcPath);

  let teethAndPinAction = calcTeeth(calcPath, startShift, endShift, goingUp); // 根据 path 算齿数。

  return teethAndPinAction;
};

