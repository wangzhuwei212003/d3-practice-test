/**
 * Created by zhuweiwang on 2018/5/18.
 */
import HCCoopFinder from '../finder/HCCoopFinder';
import {calcTeeth} from './calcTeeth';
import * as Util from '../core/Util';
// import {
//   rowNum,
//   colNum
// } from '../configTeeth';
import {
  rowNum,
  colNum
} from '../config_V3';

export const calTeethAndPinAction = function (startNode, endNode, startShift = 0, endShift = 0, goingUp = false) {

  const matrixZero = Util.generateMatrix();

  const finder = new HCCoopFinder();
  const path = finder.findPath(startNode, endNode, rowNum * 4 + colNum * 4, matrixZero, rowNum, colNum, true, goingUp); // 因为算齿数不考虑其他小车，这里ignore为true。

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

  // console.log('path', path);
  console.log('calcPath', calcPath);

  let teethAndPinAction = calcTeeth(calcPath, startShift, endShift, goingUp); // 根据 path 算齿数。

  return teethAndPinAction;
};

