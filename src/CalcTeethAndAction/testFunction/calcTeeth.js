/**
 * Created by zhuweiwang on 2018/5/18.
 */
import {
  rowNum,

  firstGoDownCol,
  lastGoDownCol,
  lastGoDownPickCol,
  divideCell,

  h2vUpPinOutStretchCell,
  h2vDownSpecialPinOutStretchCell,
  h2vDownNormalPinOutStretchCell,

  normalWidth, //水平方向一格的宽度
  compensate, // 方向改变的时候，齿数补偿，25 + 90度
  specialTopPart, // 顶部的特殊部分

} from '../configTeeth';

import {CellToTeeth} from './CellToTeeth';

export const calcTeeth = function (path, shiftLeft, endShift = 0, goingUp = false) {
  // 传进来的是一个 path，二维数组
  // [[row, col], [row, col], [row, col], ... , [row, col]]

  // 目前的做法是加一个判断，是否需要补偿。除此之外，CellToTeeth就不用考虑补偿了。

  // 算总齿数是设目标的时候，就算好。但是和行进过程中没有关系。这个是基于齿数的，所以是不存在不停的重新规划的。
  // 所以是还得有一个 ignore 其他所有小车的寻路的方法。所以在 findPath 里添加了一个 ignore 的 flag。一般情况下是不会 ignore 的

  // 算出总齿数，以及什么时候伸 pin、缩 pin，外加方向变化。
  //logger.info('shiftLeft', shiftLeft, 'endShift', endShift);

  if (!goingUp) {
    // 没有变化，按照正常回拣货台
    let totalTeeth = 0 - shiftLeft;
    let actions = [];

    /* %%%%%%%%%%% 一个 for 循环遍历整个规划出来的 path %%%%%%%%%%% */
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
        // 1. 上升列转为水平，这里不需要伸 pin
        actions.push({
          target_teeth: totalTeeth,
          specific_action: 'SA_TURNING_BEGIN_POINT'
        }); // 补偿前添加 开始转弯 flag
        totalTeeth += compensate; // 如果是有拐角就是添加补偿。
        actions.push({
          target_teeth: totalTeeth,
          specific_action: 'SA_ODOM_FORWARD_GROUND_AS_REFERENCE'
        }); // 方向由向上变为向右。向右是正方向，col变大
      } else if (
          (cellRow === rowNum - 1 && cellCol === 0) &&
          cellNextRow === rowNum - 2 && cellNextCol === 0
      ) {
        // 2. 水平转为上升列，这里需要在前两格伸pin
        actions.push({
          target_teeth: totalTeeth - h2vUpPinOutStretchCell * normalWidth, // 转弯前两小格伸pin
          specific_action: 'SA_PIN_OUTSTRETCH'
        }); // 伸pin动作
        actions.push({
          target_teeth: totalTeeth,
          specific_action: 'SA_TURNING_BEGIN_POINT'
        }); // 补偿前添加 开始转弯 flag
        totalTeeth += compensate;
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
              cellRow === rowNum - 2 && cellCol >= firstGoDownCol && cellCol <= lastGoDownCol && (cellCol - firstGoDownCol) % divideCell === 0
          ) &&
          cellNextRow === rowNum - 1 && cellNextCol === cellCol
      ) {
        // 3. 下降列转弯为水平。下来不需要伸 pin，缩 pin。
        totalTeeth -= CellToTeeth(cellNextRow, cellCol); // 多算了一个横向的格子，这个格子是不走的
        actions.push({
          target_teeth: totalTeeth > 0 ? totalTeeth : 0,
          specific_action: 'SA_TURNING_BEGIN_POINT'
        }); // 补偿前添加 开始转弯 flag
        totalTeeth += compensate;

        actions.push({
          target_teeth: totalTeeth,
          specific_action: 'SA_ODOM_BACKWARD_GROUND_AS_REFERENCE'
        }); // 方向由向下变为向左。向上升列的方向
      } else if (
          cellRow === rowNum - 2 && cellCol === lastGoDownPickCol &&
          cellNextRow === rowNum - 1 && cellNextCol === cellCol
      ) {
        // 4. 最后一列下降列转弯为水平。下来不需要伸 pin，缩 pin
        totalTeeth -= CellToTeeth(cellNextRow, cellCol); // 多算了一个横向的格子，这个格子是不走的
        actions.push({
          target_teeth: totalTeeth > 0 ? totalTeeth : 0,
          specific_action: 'SA_TURNING_BEGIN_POINT'
        }); // 补偿前添加 开始转弯 flag
        totalTeeth += compensate;
        actions.push({
          target_teeth: totalTeeth,
          specific_action: 'SA_ODOM_BACKWARD_GROUND_AS_REFERENCE'
        }); // 方向由向下变为向左。向上升列的方向
      } else if (
          cellRow === 0 && cellCol >= firstGoDownCol && cellCol <= lastGoDownCol && (cellCol - firstGoDownCol) % divideCell === 0 &&
          cellNextRow === 1 && cellNextCol === cellCol
      ) {
        // 5. 水平转为下降，顶部一行下降列，方向改变
        if (cellCol === firstGoDownCol) {
          // 特殊处理
          actions.push({
            target_teeth: totalTeeth - normalWidth - h2vDownSpecialPinOutStretchCell * specialTopPart, // 调整第一列下降时 伸pin 的位置。
            specific_action: 'SA_PIN_OUTSTRETCH'
          }); // 伸pin动作
          totalTeeth -= CellToTeeth(cellRow, cellCol); // 多算了一个横向的格子，这个格子是不走的
          actions.push({
            target_teeth: totalTeeth,
            specific_action: 'SA_TURNING_BEGIN_POINT'
          }); // 补偿前添加 开始转弯 flag
          totalTeeth += compensate;
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
            target_teeth: totalTeeth - normalWidth - h2vDownNormalPinOutStretchCell * normalWidth,
            specific_action: 'SA_PIN_OUTSTRETCH'
          }); // 伸pin动作
          totalTeeth -= CellToTeeth(cellRow, cellCol); // 多算了一个横向的格子，这个格子是不走的
          actions.push({
            target_teeth: totalTeeth,
            specific_action: 'SA_TURNING_BEGIN_POINT'
          }); // 补偿前添加 开始转弯 flag
          totalTeeth += compensate;
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
          cellRow === 0 && cellCol === lastGoDownPickCol
      ) {
        // 6. 水平转为下降，最后一列下降，方向改变
        actions.push({
          target_teeth: totalTeeth - normalWidth - h2vDownNormalPinOutStretchCell * normalWidth, // 最后一列下降同样是在特殊宽度的位置 伸PIN。没有特殊宽度！
          specific_action: 'SA_PIN_OUTSTRETCH'
        }); // 伸pin动作
        totalTeeth -= CellToTeeth(cellRow, cellCol); // 多算了一个横向的格子，这个格子是不走的
        actions.push({
          target_teeth: totalTeeth,
          specific_action: 'SA_TURNING_BEGIN_POINT'
        }); // 补偿前添加 开始转弯 flag
        totalTeeth += compensate;
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
    totalTeeth += endShift;
    return {
      total_teeth: totalTeeth,
      Actions: actions,
    };
    //} // 向上运动捡完箱子的小车回拣货台 不用符号改为负数。
    // 正常取完箱子回拣货台
  } else {
    // 如果是往上走的，即是反方向的
    let totalTeeth = 0 - shiftLeft;
    // let totalTeeth = 0 - shiftLeft;
    let actions = [];

    // 去掉头一格， goingUp 不能去掉头一格，应该去掉末尾一格。
    for (let step = 0; step < path.length - 1; step += 1) {
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

      totalTeeth -= CellToTeeth(cellRow, cellCol); // 没有考虑补偿的。距离方向是负方向
      // totalTeeth += CellToTeeth(cellRow, cellCol); // 没有考虑补偿的。

    } // end for loop 根据一条路径算总齿数、伸pin、缩pin点，算完。

    // 返回最终结果
    totalTeeth += endShift;
    return {
      total_teeth: totalTeeth,
      Actions: actions,
    };
  } // 两个特殊的 flag 情况，判断结束
};

