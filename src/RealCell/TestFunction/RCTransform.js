/**
 * Created by zhuweiwang on 10/04/2018.
 */
import * as CONFIG from './configDATA';
import HCCoopFinder from '../Finder/HCCoopFinder';

const SpecificActionsEnum = {
  "SA_PIN_OUTSTRETCH": 0,
  "SA_PIN_RETRIEVE": 1,
  "SA_ODOM_FORWARD_GROUND_AS_REFERENCE": 2,
  "SA_ODOM_BACKWARD_GROUND_AS_REFERENCE": 3,
  "SA_ODOM_UP_GROUND_AS_REFERENCE": 4,
  "SA_ODOM_DOWN_GROUND_AS_REFERENCE": 5,
  "SA_TURNING_BEGIN_POINT": 6,
};


export const RCTransform = function (odom) {
  /*
   * odom 里面的位置报告，行列数需要特殊处理的。
   * 1. 顶部一行
   * 2. 底部两行
   *
   * 比较一般的
   * 3. 中间剩余部分
   *
   * */
  let rowSmall;
  let colSmall = odom.current_column * 4; // 稍后返回的小格子行列数，小格子采用的是左上角是（0，0）向右向下增加。大格子是左下角是（0，0）
  let shiftNum; // 算成小格子后还多出的距离 齿数
  let shiftLeft;

  if (odom.current_row === CONFIG.usedRowNum - 1) {
    // 1. 特殊处理的部分，顶部一行
    rowSmall = 0;
    if (
        odom.theoretical_moving_direction === SpecificActionsEnum['SA_ODOM_FORWARD_GROUND_AS_REFERENCE'] &&
        !odom.turning
    ) {
      // 考虑顶部特殊宽度，特殊宽度是对称的。
      if (odom.current_column === 1 || odom.current_column === CONFIG.usedColNum - 2) {
        shiftNum = Math.floor(odom.horizontal_offset_from_nearest_coordinate / CONFIG.specialTopPart);
        colSmall += shiftNum;
        shiftLeft = odom.horizontal_offset_from_nearest_coordinate - shiftNum * CONFIG.specialTopPart;
      } else {
        shiftNum = Math.floor(odom.horizontal_offset_from_nearest_coordinate / CONFIG.normalWidth);
        colSmall += shiftNum;
        shiftLeft = odom.horizontal_offset_from_nearest_coordinate - shiftNum * CONFIG.normalWidth;
      }
    } else if (
        odom.theoretical_moving_direction === SpecificActionsEnum['SA_ODOM_DOWN_GROUND_AS_REFERENCE'] &&
        !odom.turning
    ) {
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / CONFIG.topBoxNormalHeight);
      rowSmall += shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * CONFIG.topBoxNormalHeight;
    } else {
      console.log('some senario not considered!!');
    }
    // 顶部一行的判断结束。
  } else if (
      odom.current_row === 1
  ) {
    // 2-1. 倒数第二行，就是特殊列的一行

    // 除了第一列 -- 上升列 都没有问题。
    if (odom.current_column === 0) {
      rowSmall = CONFIG.smallRowNum - 2; //

      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / CONFIG.normalHeight);
      rowSmall -= shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * CONFIG.normalHeight;
    } else {
      // 下降列，
      rowSmall = CONFIG.smallRowNum - 3; // 小格子应该是相当于大格子的货位的位置报告。

      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / CONFIG.specialHeight);
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * CONFIG.specialHeight;
    }
  } else if (
      odom.current_row === 0
  ) {
    // 2-2. 大格子里的倒数第一行。
    rowSmall = CONFIG.smallRowNum - 1;

    // 除了第一列 -- 上升列 都没有问题。
    if (odom.current_column === 0) {
      shiftNum = 0;
      if (
          odom.theoretical_moving_direction === SpecificActionsEnum['SA_ODOM_UP_GROUND_AS_REFERENCE'] &&
          !odom.turning
      ) {
        shiftLeft = odom.vertical_offset_from_nearest_coordinate;
      } else {
        shiftLeft = odom.horizontal_offset_from_nearest_coordinate;
      }
    } else {
      if (
          odom.theoretical_moving_direction === SpecificActionsEnum['SA_ODOM_BACKWARD_GROUND_AS_REFERENCE'] &&
          !odom.turning
      ) {
        // 考虑底部特殊宽度
        if (odom.current_column === 2 || odom.current_column === CONFIG.usedColNum - 1) {
          shiftNum = Math.floor(odom.horizontal_offset_from_nearest_coordinate / CONFIG.specialBottomPart);
          colSmall -= shiftNum;
          shiftLeft = odom.horizontal_offset_from_nearest_coordinate - shiftNum * CONFIG.specialBottomPart;
        } else {
          shiftNum = Math.floor(odom.horizontal_offset_from_nearest_coordinate / CONFIG.normalWidth);
          colSmall -= shiftNum;
          shiftLeft = odom.horizontal_offset_from_nearest_coordinate - shiftNum * CONFIG.normalWidth;
        }
      } else {
        // 这种情况就是正在转弯的。
        shiftLeft = odom.vertical_offset_from_nearest_coordinate;
      }
    }
  } else {
    // 3. 中间部分，odom.current_row 范围是 2 - 6，中间货位部分。
    rowSmall = CONFIG.smallRowNum - 3 - (odom.current_row - 1) * 4;

    // 上升列、下降列，包含S形弯道部分。
    if (
        (odom.current_column === 0) &&
        (odom.current_row === 2 )
    ) {
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / CONFIG.SDownPart);
      rowSmall -= shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * CONFIG.SDownPart;
    } else if (
        (odom.current_column === 0) &&
        (odom.current_row === 3)
    ) {
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / CONFIG.SUPPart);
      rowSmall -= shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * CONFIG.SUPPart;
    } else if (
        (odom.current_column === CONFIG.usedColNum - 1) &&
        (odom.current_row === 4)
    ) {
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / CONFIG.SUPPart);
      rowSmall += shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * CONFIG.SUPPart;
    } else if (
        (odom.current_column === CONFIG.usedColNum - 1) &&
        (odom.current_row === 3)
    ) {
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / CONFIG.SDownPart);
      rowSmall += shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * CONFIG.SDownPart;
    } else if (odom.current_column === 0) {
      // 第一列剩下的
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / CONFIG.normalHeight);
      rowSmall -= shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * CONFIG.normalHeight;
    } else if (odom.current_column === CONFIG.usedColNum - 1) {
      // 最后一列剩下的
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / CONFIG.normalHeight);
      rowSmall += shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * CONFIG.normalHeight;
    } else {
      // 剩下的就是 66.83 的
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / CONFIG.normalHeight);
      rowSmall += shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * CONFIG.normalHeight;
    }
  } // 中间部分结束。

  console.log('current_row', odom.current_row, 'current_col', odom.current_column, 'rowSmall: ', rowSmall, 'colSmall: ', colSmall, 'shift: ', shiftLeft)
};

export const calcTeeth = function (path, shiftLeft = 0) {
  // 传进来的还有一个偏移量，默认是 0
  // 算出总齿数，以及什么时候伸 pin、缩 pin，外加方向变化。

  let totalTeeth = 0 - shiftLeft;
  let actions = [];

  // 去掉头一格
  for (let step = 1; step < path.length; step += 1) {
    let cell = path[step]; // 这个是 [row, col]
    let cellNext;
    if (step !== path.length - 1) {
      cellNext = path[step + 1];
    } else {
      cellNext = path[step];
    }

    let cellRow = cell[0];
    let cellCol = cell[1];
    let cellNextRow = cellNext[0];
    let cellNextCol = cellNext[1];

    totalTeeth += CellToTeeth(cellRow, cellCol); // 没有考虑补偿的。

    //判断如果是转弯了，就加补偿
    if (
        cellRow === 1 && cellCol === 0 &&
        cellNextRow === 0 && cellNextCol === 0
    ) {
      // 这里不需要伸 pin
      actions.push({
        target_teeth: totalTeeth,
        specific_action: 'SA_TURNING_BEGIN_POINT'
      }); // 补偿前添加 开始转弯 flag
      totalTeeth += CONFIG.compensate; // 如果是有拐角就是添加补偿。
      actions.push({
        target_teeth: totalTeeth,
        specific_action: 'SA_ODOM_FORWARD_GROUND_AS_REFERENCE'
      }); // 方向由向上变为向右。向右是正方向，col变大
    } else if (
        (cellRow === CONFIG.smallRowNum - 1 && cellCol === 0) &&
        cellNextRow === CONFIG.smallRowNum - 2 && cellNextCol === 0
    ) {
      // 这里需要在前两格伸pin
      actions.push({
        target_teeth: totalTeeth - 2 * CONFIG.normalWidth,
        specific_action: 'SA_PIN_OUTSTRETCH'
      }); // 伸pin动作
      actions.push({
        target_teeth: totalTeeth,
        specific_action: 'SA_TURNING_BEGIN_POINT'
      }); // 补偿前添加 开始转弯 flag
      totalTeeth += CONFIG.compensate;
      actions.push({
        target_teeth: totalTeeth,
        specific_action: 'SA_ODOM_UP_GROUND_AS_REFERENCE'
      }); // 方向由向右变为向上。
      actions.push({
        target_teeth: totalTeeth,
        specific_action: 'SA_PIN_RETRIEVE'
      }); // 缩pin动作

    } else if (
        (
            cellRow === CONFIG.smallRowNum - 2 && cellCol >= 8 && cellCol <= CONFIG.smallColNum - 12 && (cellCol - 8) % 4 === 0
        ) &&
        cellNextRow === CONFIG.smallRowNum - 1 && cellNextCol === cellCol
    ) {
      // 下降列转弯了。下来不需要伸 pin，缩 pin。
      totalTeeth -= CellToTeeth(cellNextRow, cellCol); // 多算了一个横向的格子，这个格子是不走的
      actions.push({
        target_teeth: totalTeeth,
        specific_action: 'SA_TURNING_BEGIN_POINT'
      }); // 补偿前添加 开始转弯 flag
      totalTeeth += CONFIG.compensate;

      actions.push({
        target_teeth: totalTeeth,
        specific_action: 'SA_ODOM_BACKWARD_GROUND_AS_REFERENCE'
      }); // 方向由向下变为向左。向上升列的方向
    } else if (
        cellRow === CONFIG.smallRowNum - 2 && cellCol === CONFIG.smallColNum - 4 &&
        cellNextRow === CONFIG.smallRowNum - 1 && cellNextCol === cellCol
    ) {
      // 最后一列下降列。下来不需要伸 pin，缩 pin
      totalTeeth -= CellToTeeth(cellNextRow, cellCol); // 多算了一个横向的格子，这个格子是不走的
      actions.push({
        target_teeth: totalTeeth,
        specific_action: 'SA_TURNING_BEGIN_POINT'
      }); // 补偿前添加 开始转弯 flag
      totalTeeth += CONFIG.compensate;
      actions.push({
        target_teeth: totalTeeth,
        specific_action: 'SA_ODOM_BACKWARD_GROUND_AS_REFERENCE'
      }); // 方向由向下变为向左。向上升列的方向
    } else if (
        cellRow === 0 && cellCol >= 8 && cellCol <= CONFIG.smallColNum - 12 && (cellCol - 8) % 4 === 0 &&
        cellNextRow === 1 && cellNextCol === cellCol
    ) {
      // 顶部一行下降列，方向改变
      if (cellCol === 8) {
        // 特殊处理
        actions.push({
          target_teeth: totalTeeth - CONFIG.normalWidth - 2 * CONFIG.specialTopPart,
          specific_action: 'SA_PIN_OUTSTRETCH'
        }); // 伸pin动作
        totalTeeth -= CellToTeeth(cellRow, cellCol); // 多算了一个横向的格子，这个格子是不走的
        actions.push({
          target_teeth: totalTeeth,
          specific_action: 'SA_TURNING_BEGIN_POINT'
        }); // 补偿前添加 开始转弯 flag
        totalTeeth += CONFIG.compensate;
        actions.push({
          target_teeth: totalTeeth,
          specific_action: 'SA_ODOM_DOWN_GROUND_AS_REFERENCE'
        }); // 方向由向前（右）变为向下。
        actions.push({
          target_teeth: totalTeeth,
          specific_action: 'SA_PIN_RETRIEVE'
        }); // 缩pin动作

      } else {
        actions.push({
          target_teeth: totalTeeth - 3 * CONFIG.normalWidth,
          specific_action: 'SA_PIN_OUTSTRETCH'
        }); // 伸pin动作
        totalTeeth -= CellToTeeth(cellRow, cellCol); // 多算了一个横向的格子，这个格子是不走的
        actions.push({
          target_teeth: totalTeeth,
          specific_action: 'SA_TURNING_BEGIN_POINT'
        }); // 补偿前添加 开始转弯 flag
        totalTeeth += CONFIG.compensate;
        actions.push({
          target_teeth: totalTeeth,
          specific_action: 'SA_ODOM_DOWN_GROUND_AS_REFERENCE'
        }); // 方向由向前（右）变为向下。
        actions.push({
          target_teeth: totalTeeth,
          specific_action: 'SA_PIN_RETRIEVE'
        }); // 缩pin动作

      }
    } else if (
        cellRow === 0 && cellCol === CONFIG.smallColNum - 4
    ) {
      // 最后一列下降，方向改变
      actions.push({
        target_teeth: totalTeeth - 3 * CONFIG.normalWidth,
        specific_action: 'SA_PIN_OUTSTRETCH'
      }); // 伸pin动作
      totalTeeth -= CellToTeeth(cellRow, cellCol); // 多算了一个横向的格子，这个格子是不走的
      actions.push({
        target_teeth: totalTeeth,
        specific_action: 'SA_TURNING_BEGIN_POINT'
      }); // 补偿前添加 开始转弯 flag
      totalTeeth += CONFIG.compensate;
      actions.push({
        target_teeth: totalTeeth,
        specific_action: 'SA_ODOM_DOWN_GROUND_AS_REFERENCE'
      }); // 方向由向前（右）变为向下。
      actions.push({
        target_teeth: totalTeeth,
        specific_action: 'SA_PIN_RETRIEVE'
      }); // 缩pin动作

    }
    //logger.debug('total teeth: ', totalTeeth);
    //logger.debug('cellRow cellCol: ', cellRow, cellCol);
  } // end for loop 根据一条路径算总齿数、伸pin、缩pin点，算完。

  // 返回最终结果
  return {
    total_teeth: totalTeeth,
    Actions: actions,
  };
};

const CellToTeeth = function (cellRow, cellCol) {
  // 根据行列，对应出齿数。没有考虑补偿。
  // 特殊的先来，从上到下
  if (
      cellRow === 0 &&
      ((cellCol >= 4 && cellCol <= 7) || (cellCol >= CONFIG.smallColNum - 5 && cellCol <= CONFIG.smallColNum - 8))
  ) {
    // 顶部特殊长度 52/4
    return CONFIG.specialTopPart;
  } else if (
      cellRow === 0
  ) {
    // 除此之外，上面的都是 normal
    return CONFIG.normalWidth;
  } else if (
      cellRow >= 1 && cellRow <= 4
  ) {
    // 剩下的最上面一行的货位里的格子
    return CONFIG.topBoxNormalHeight;
  } else if (
      cellRow >= CONFIG.smallRowNum - 10 && cellRow <= CONFIG.smallRowNum - 7 &&
      (cellCol === 0 || cellCol === CONFIG.smallColNum - 4)
  ) {
    // S形弯道下部分
    return CONFIG.SDownPart;
  } else if (
      cellRow >= CONFIG.smallRowNum - 14 && cellRow <= CONFIG.smallRowNum - 11 &&
      (cellCol === 0 || cellCol === CONFIG.smallColNum - 4)
  ) {
    // S形弯道上部分
    return CONFIG.SUPPart;
  } else if (
      cellRow >= 5 && cellRow <= CONFIG.smallRowNum - 3
  ) {
    // 中间正常部分
    return CONFIG.normalHeight;
  } else if (
      cellRow === CONFIG.smallRowNum - 2
  ) {
    // 倒数第二行 特殊高度部分，其他的都不需要补偿
    return CONFIG.specialHeight;
  } else if (
      cellRow === CONFIG.smallRowNum - 1 &&
      ((cellCol >= 4 && cellCol <= 7) || (cellCol >= CONFIG.smallColNum - 5 && cellCol <= CONFIG.smallColNum - 8))
  ) {
    // 倒数第一行 特殊宽度部分
    return CONFIG.specialBottomPart;
  } else if (cellRow === CONFIG.smallRowNum - 1) {
    return CONFIG.normalWidth;
  } else {
    console.debug('some situation senario not considered!!');
  }

};

// 和实际使用情况一致，在设置终点的时候根据两个点来算路径以及总齿数
export const setGoal = function (rowInput, colInput) {
  // 更新目标接口，设置终点。更新 goalTable，算出总齿数以及Action发给小车。
  // 测试条件下，不需要更新 goalTable，仅仅是根据两个点，规划出路径，算出总齿数以及action


  // 2. 传进来的 row、col 需要转换成我这里的坐标系
  let endNode = rowColTransform(rowInput, colInput); // 因为这里终点都是货位，所以能够这样简单的转换
  let endRow = endNode[0];
  let endCol = endNode[1];

  // 5. 根据goalTable里的起点，接收输入的终点，更新goalTable里的终点，算出总齿数以及action
  let result = calTeethAndPinAction(0, endNode);

  // 6. 结果发给小车。 返回{totalLenghth，actions}
  return result;
};

export const backToPickUpSite = function (rowInput, colInput, shiftLeft = 0) {
  // 回到拣货台，这里接收的是起点的位置，实际auto-pick中，是直接读位置报告里的起点。。

  // 2. 传进来的 row、col 需要转换成我这里的坐标系
  // let endNode = rowColTransform(CONFIG.PickUPSite[0], CONFIG.PickUPSite[1]); // 这个简单的转换是够用的。拣货台的点。
  // let endRow = endNode[0];
  // let endCol = endNode[1];
  let endNode = [21, 0]; // 这个简单的转换是够用的。拣货台的点。
  let endRow = endNode[0];
  let endCol = endNode[1];

  let startNode = rowColTransform(rowInput, colInput); // 这个简单的转换是够用的。拣货台的点。
  let startRow = startNode[0];
  let startCol = startNode[1];

  // 5. 根据goalTable里的起点，接收输入的终点，更新goalTable里的终点，算出总齿数以及action
  let result = calTeethAndPinAction(0, endNode, startNode);

  // 6. 结果发给小车。 返回{totalLenghth，actions}
  return result;
};

const rowColTransform = function (rowInput, colInput) {
  // 输入的行列数，转为适用的行列数。这里针对的是设置终点对应的我这里的位置。
  // 这个transform是适用于设置终点，货位、拣货台。
  let col = colInput * 4;
  let row = CONFIG.smallRowNum - 1 - (rowInput * 4 - 2); // 转换为 从上到下 由0开始增大

  return [row, col];
};

const calTeethAndPinAction = function (optIndex = 0, endNode, startnode = [26, 4]) {

  let _pathTable = Array(1).fill([]); // 这里应该是根据当前已注册的小车数量，目前是一个车
  //goalTable[optIndex][1] = endNode; // 更改 goalTable 里面的路径。
  let goalTable = [
    [startnode, endNode]
  ]; // 目前是一个小车
  let matrixZero = generateMatrix();

  const finder = new HCCoopFinder();
  const path = finder.findPath(optIndex, goalTable, CONFIG.smallRowNum * 4 + CONFIG.smallColNum * 4, _pathTable, matrixZero, CONFIG.smallRowNum, CONFIG.smallColNum, true); // 因为算齿数不考虑其他小车，这里ignore为true。


  // console.log(JSON.stringify(path)); // for save as in console

  //去掉相同的点

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

  console.log(path, calcPath);
  // console.log(JSON.stringify(path), JSON.stringify(calcPath));

  // let teethAndPinAction = calcTeeth(path, 0); // 根据 path 算齿数。
  let teethAndPinAction = calcTeeth(calcPath, 0); // 根据 path 算齿数。用不用 reduce 影响的时间 10- 20ms

  //console.log(teethAndPinAction);
  // console.log(JSON.stringify(teethAndPinAction)); // for save console

  return teethAndPinAction;
};

const generateMatrix = function () {
  const matrixData = [];
  for (let row = 0; row < CONFIG.smallRowNum; row += 1) {
    matrixData.push([]);
    for (let column = 0; column < CONFIG.smallColNum; column += 1) {
      let ob = 1;
      if (
          (row === 0 && column < CONFIG.smallColNum - 3) ||
          (row === CONFIG.smallRowNum - 1 && column < CONFIG.smallColNum - 3)
      ) {
        ob = 0;
      }
      if (
          column === 0 ||
          column === CONFIG.smallColNum - 4
      ) {
        ob = 0;
      }
      if (
          column > 7 &&
          column < CONFIG.smallColNum - 11 &&
          (column - 8) % 4 === 0
      ) {
        ob = 0;
      }
      matrixData[row].push(ob);
    }
  }
  // logger.debug(matrixData);
  return matrixData;
};

// 特殊处理，是在 setGoal 方法前面再加一层判断
// 即：现在 没有上面的车子在 目标和要执行的任务路径之间的。优先级还是按照原来的，下面的高。
// 这个方法返回的是 true or false，判断是否应该往上运动。
const checkGoUp = function (uid, rowInput, colInput, goalTable) {
  // 对于一个目标，根据 uid、目标判断是否进一步判断

  // 转换大格子到小格子
  const smallCellGoal = rowColTransform(rowInput, colInput); // [smallRow, smallCol]
  const goalRow = smallCellGoal[0];
  const goalCol = smallCellGoal[1]; // 目标位置的小格子行列数

  if (goalCol < 8 || goalCol > CONFIG.smallColNum - 12) {
    console.log('目标不是中间货位，不需要上升拣货');
    return false
  }

  // 1. 根据 uid 找出对应小车在dispatch文件里的 index
  let optIndex;

  const currentRow = goalTable[optIndex][0][0];
  const currentCol = goalTable[optIndex][0][1]; // 选中的小车的小格子行列数


  // 2. goaltable里的第一个值是小车起点。判断
  //    2-1. 小车当前的位置 和 目标的位置是同一列，
  //    2-2. 且中间没有其他小车，这个时候是认为能够向上走了

  if (goalTable[optIndex][0][1] === smallCellGoal[1]) {
    // 2-1. 小车当前的位置 和 目标的位置是同一列，
    for (let i = 0; i < goalTable.length; i += 1) {
      if(i === optIndex){
        continue // 如果是当前的小车，继续
      }
      let obRow = goalTable[i][0][0]; // 循环中的小车的小格子行数
      let obCol = goalTable[i][0][1]; // 循环中的小车的小格子列数
      if(
          obCol >= currentCol - 1 && obCol <= currentCol + 1 &&
          obRow <= currentRow && obRow >= goalRow - 4
      ){
        // 如果是和当前的小车相邻 && 在小车和目标行之间。那就不能够向上走。保护的行数是4行。
        return false
      }
    } // end of for loop

    return true; // 如果for循环下来没有 false，就判断能够向上走。
  }else{
    // 小车当前的位置 和 目标的位置不是同一列，直接就 return false
    return false;
  }
};