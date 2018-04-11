/**
 * Created by zhuweiwang on 10/04/2018.
 */
import * as CONFIG from './configDATA';

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
    rowSmall = CONFIG.smallRowNum - 2 - (odom.current_row - 1) * 4;

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

  console.log('rowSmall: ', rowSmall, 'colSmall: ', colSmall, 'shift: ', shiftLeft)
};

export const calcTeeth = function (path) {
  // 传进来的是一个 path，二维数组
  // [[row, col], [row, col], [row, col], ... , [row, col]]

  // 目前的做法是加一个判断，是否需要补偿。除此之外，CellToTeeth就不用考虑补偿了。

  // 算总齿数是设目标的时候，就算好。但是和行进过程中没有关系。这个是基于齿数的，所以是不存在不停的重新规划的。
  // 所以是还得有一个 ignore 其他所有小车的寻路的方法。所以在 findPath 里添加了一个 ignore 的 flag。一般情况下是不会 ignore 的

  // 算出总齿数，以及什么时候伸 pin、缩 pin，外加方向变化。

  let totalTeeth = 0;
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
