/**
 * Created by zhuweiwang on 2018/5/18.
 *
 * 这里面是能够设置的几个终点
 *
 * 1. 目标是中间货位
 * 2. 目标是拣货台
 * 3. 目标是顶部停靠点
 * 4. 目标是底部停靠点
 *
 * 5. 起点是原点
 */
import {
  pickSitesPosition,
  preGoUpPoint,
  GoDownPoint
} from '../configTeeth';
import {rowColTransfForStartNode} from './rowColTransfForStartNode';
import {calTeethAndPinAction} from './calTeethAndAction';

// 1. 目标是中间货位........因为这个是没有保留什么数据的，不需要其他小车的数据。直接有的数据就是参数穿进去。
export const setGoal = function (rowInput, colInput, SA_ODOM_DOWN_GROUND_AS_REFERENCE, wheel_to_chain, goingUp, startNode, startShift) {
  let goalOdom = {
    horizontal_offset_from_nearest_coordinate: 0,
    vertical_offset_from_nearest_coordinate: wheel_to_chain, //TODO 判断是否为空
    theoretical_moving_direction: SA_ODOM_DOWN_GROUND_AS_REFERENCE,
    current_row: rowInput,
    current_column: colInput,
    turning: false
  }; // 生成一个终点的 odom。
  let positionObj = rowColTransfForStartNode(goalOdom);

  let endNode = [positionObj.rowSmall, positionObj.colSmall];
  let endRow = endNode[0];
  let endCol = endNode[1];
  let endShift = positionObj.shiftLeft; // 设置货位目标的时候，下沉距离

  // 5. 根据goalTable里的起点，接收输入的终点，更新goalTable里的终点，算出总齿数以及action
  let result = calTeethAndPinAction(checkIndex, startNode, endNode, startShift, endShift, goingUp);

  // 6. 结果发给小车。 返回{totalLenghth，actions}
  console.log('设置目标后规划出的总齿数和动作：', result);
  return result;
};

// 2. 目标是拣货台，返回拣货台
export const goToPickUpSite = function (pickSite, startNode, startShift) {
  // 参数可以是 'SiteA' 'SiteB'.
  // startNode 是一个二维数组

  const goingUp = false; // 已经转换成向下的位置报告。
  const endNode = pickSitesPosition[pickSite]; // 返回拣货站位置
  const endShift = 0; // 拣货台的终点的偏移量设为 0

  // 3. 得出结果。
  const result = calTeethAndPinAction(checkIndex, startNode, endNode, startShift, endShift, goingUp);
  console.info('目标为拣货台，规划出的总齿数和动作：', result);
  return result;
};

// 3. 目标是顶部停靠点，小车原点对齐之后去最顶部一行等待
export const preGoUp = async function (startNode, startShift) {

  const goingUp = false;
  const endNode = preGoUpPoint; // 返回拣货站位置
  const endShift = 0; // 拣货台的终点的偏移量设为 0

  // 3. 得出结果。
  if (startNode[0] === 0) { //开机之后，关机。
    const pathinfo = {
      total_teeth: 0,
      Actions: [],
    };
    console.info('目标为顶部停靠点，且小车当前位置在顶部一行，规划出的总齿数和动作：', pathinfo);
  } else {
    const pathinfo = calTeethAndPinAction(checkIndex, startNode, endNode, startShift, endShift, goingUp);
    console.info('目标为顶部停靠点，规划出的总齿数和动作：', pathinfo);
  }
};

// 4. 目标是底部停靠点
export const preShutdownGoDown = async function (startNode, startShift) {

  const goingUp = false;
  const endNode = GoDownPoint; // 返回原点位置
  const endShift = 0; // 拣货台的终点的偏移量设为 0

  // 3. 得出结果。
  const pathinfo = calTeethAndPinAction(checkIndex, startNode, endNode, startShift, endShift, goingUp);
  console.info('目标为底部停靠点，规划出的总齿数和动作：', pathinfo);
};
