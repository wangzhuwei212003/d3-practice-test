/**
 * Created by zhuweiwang on 2018/5/18.
 */
import {
  divideCell,

  bigRowNum,
  bigColNum,
  rowNum,

  topBoxNormalHeight,
  normalWidth,
  specialTopPart,
  normalHeight,
  SUPPart,
  SDownPart,
  specialBottomPart,
  doubleBottomPart,
  specialHeight,
} from '../config_V3';
// } from '../configTeeth';

const SpecificActionsEnum = {
  "SA_PIN_OUTSTRETCH": 0,
  "SA_PIN_RETRIEVE": 1,
  "SA_ODOM_FORWARD_GROUND_AS_REFERENCE": 2,
  "SA_ODOM_BACKWARD_GROUND_AS_REFERENCE": 3,
  "SA_ODOM_UP_GROUND_AS_REFERENCE": 4,
  "SA_ODOM_DOWN_GROUND_AS_REFERENCE": 5,
  "SA_TURNING_BEGIN_POINT": 6,
};

export const rowColTransfForStartNode = function (odom) {
  /*
   * odom 里面的位置报告，行列数需要特殊处理的。
   * 1. 顶部一行
   * 2. 底部两行
   *
   * 比较一般的
   * 3. 中间剩余部分
   *
   * */
  // logger.info('odom', odom);

  let rowSmall;
  let colSmall = odom.current_column * divideCell; // 稍后返回的小格子行列数，小格子采用的是左上角是（0，0）向右向下增加。大格子是左下角是（0，0）
  let shiftNum; // 算成小格子后还多出的距离 齿数
  let shiftLeft = 0;

  if (odom.current_row === bigRowNum - 1) {
    // 1. 特殊处理的部分，顶部一行. bigRowNum - 1 === 7
    rowSmall = 0;

    // 顶部一行的运动方向，决定了和底部一行的水平移动换算方式不一样。
    if(odom.current_column === 0){
      colSmall = 0 ;
    }else{
      colSmall = 3 + (odom.current_column - 1) * divideCell;
    }
    
    if (
        odom.theoretical_moving_direction.toString() === SpecificActionsEnum['SA_ODOM_FORWARD_GROUND_AS_REFERENCE'].toString() &&
        !odom.turning
    ) {
      // 考虑顶部特殊宽度，特殊宽度是对称的。Fatal: 特殊宽度不是对称，只有上升列是有特殊长度。
      if (odom.current_column === 1) {
        shiftNum = Math.floor(odom.horizontal_offset_from_nearest_coordinate / specialTopPart);
        colSmall += shiftNum;
        shiftLeft = odom.horizontal_offset_from_nearest_coordinate - shiftNum * specialTopPart;
      } else {
        shiftNum = Math.floor(odom.horizontal_offset_from_nearest_coordinate / normalWidth);
        colSmall += shiftNum;
        shiftLeft = odom.horizontal_offset_from_nearest_coordinate - shiftNum * normalWidth;
      }
    } else if (
        odom.theoretical_moving_direction.toString() === SpecificActionsEnum['SA_ODOM_DOWN_GROUND_AS_REFERENCE'].toString() &&
        !odom.turning
    ) {
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / topBoxNormalHeight);
      rowSmall += shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * topBoxNormalHeight;
    } else if (odom.turning) {
      shiftLeft = odom.horizontal_offset_from_nearest_coordinate;
    } else {
      // logger.warn('some senario not considered!!');
      // logger.warn('--------------------------', odom);
    }
    // 顶部一行的判断结束。
  } else if (
      odom.current_row === 1 && odom.current_column === 0
  ) {
    // 2-1. 倒数第二行，就是特殊列的一行。第一列 -- 上升列
    rowSmall = rowNum - 2;

    shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / normalHeight);
    rowSmall -= shiftNum;
    shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * normalHeight;
  } else if (
      odom.current_row === 1 && odom.theoretical_moving_direction.toString() === SpecificActionsEnum['SA_ODOM_DOWN_GROUND_AS_REFERENCE'].toString()
  ) {
    // 2-1. 倒数第二行，就是特殊列的一行。// 下降列
    rowSmall = rowNum - 3;

    shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / specialHeight);
    shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * specialHeight;

  } else if (
      odom.current_row === 0
  ) {
    // 2-2. 大格子里的倒数第一行。
    rowSmall = rowNum - 1;

    // 除了第一列 -- 上升列 都没有问题。
    if (odom.current_column === 0) {
      shiftNum = 0;
      if (
          odom.theoretical_moving_direction.toString() === SpecificActionsEnum['SA_ODOM_UP_GROUND_AS_REFERENCE'].toString() &&
          !odom.turning
      ) {
        shiftLeft = odom.vertical_offset_from_nearest_coordinate;
      } else {
        shiftLeft = odom.horizontal_offset_from_nearest_coordinate;
      }
    } else {
      // logger.info('****************位置报告应该是row = 0');
      // logger.info('action', SpecificActionsEnum);
      // logger.info('turning', odom.turning);
      // logger.info('&&&&&&&&&&&&&&&&&&&&&&判断方向', odom.theoretical_moving_direction.toString() === SpecificActionsEnum['SA_ODOM_BACKWARD_GROUND_AS_REFERENCE'].toString());
      if (
          odom.theoretical_moving_direction.toString() === SpecificActionsEnum['SA_ODOM_BACKWARD_GROUND_AS_REFERENCE'].toString() &&
          !odom.turning
      ) {
        // 考虑底部特殊宽度， 底部没有对称的特殊长度
        if (odom.current_column === 2) {
          shiftNum = Math.floor(odom.horizontal_offset_from_nearest_coordinate / specialBottomPart);
          colSmall -= shiftNum;
          shiftLeft = odom.horizontal_offset_from_nearest_coordinate - shiftNum * specialBottomPart;
        } else if (odom.current_column === bigColNum - 1) {
          // 如果是下降列，特殊宽度
          shiftNum = Math.floor(odom.horizontal_offset_from_nearest_coordinate / doubleBottomPart);
          colSmall -= shiftNum;
          shiftLeft = odom.horizontal_offset_from_nearest_coordinate - shiftNum * doubleBottomPart;
        } else {

          shiftNum = Math.floor(odom.horizontal_offset_from_nearest_coordinate / normalWidth);
          colSmall -= shiftNum;
          shiftLeft = odom.horizontal_offset_from_nearest_coordinate - shiftNum * normalWidth;
          // logger.info('****************位置报告应该是0，1');
          // logger.info(shiftNum, colSmall, shiftLeft);
        }
      } else {
        // 这种情况就是正在转弯的。
        //logger.info('正在转弯');
        shiftLeft = odom.vertical_offset_from_nearest_coordinate;
      }
    }
  } else {
    // 3. 中间部分，odom.current_row 范围是 2 - 6，中间货位部分。
    rowSmall = rowNum - 3 - (odom.current_row - 1) * divideCell;

    // 上升列、下降列，包含S形弯道部分。
    if (
        (odom.current_column === 0) &&
        (odom.current_row === 2 )
    ) {
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / SDownPart);
      rowSmall -= shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * SDownPart;
    } else if (
        (odom.current_column === 0) &&
        (odom.current_row === 3)
    ) {
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / SUPPart);
      rowSmall -= shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * SUPPart;
    } else if (
        (odom.current_column === bigColNum - 1) &&
        (odom.current_row === 4)
    ) {
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / SUPPart);
      rowSmall += shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * SUPPart;
    } else if (
        (odom.current_column === bigColNum - 1) &&
        (odom.current_row === 3)
    ) {
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / SDownPart);
      rowSmall += shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * SDownPart;
    } else if (odom.current_column === 0) {
      // 第一列剩下的
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / normalHeight);
      rowSmall -= shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * normalHeight;
    } else if (odom.current_column === bigColNum - 1) {
      // 最后一列剩下的
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / normalHeight);
      rowSmall += shiftNum;
      shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * normalHeight;
    } else {
      // 剩下的就是 66.83 的
      shiftNum = Math.floor(odom.vertical_offset_from_nearest_coordinate / normalHeight);

      if (odom.theoretical_moving_direction.toString() === SpecificActionsEnum['SA_ODOM_UP_GROUND_AS_REFERENCE'].toString()) {
        // 考虑的就是向上运动的位置报告的转换。如果是中间货位，但是位置报告运动方向是向上的。
        rowSmall -= shiftNum + 1;
        shiftLeft = (shiftNum + 1) * normalHeight - odom.vertical_offset_from_nearest_coordinate; // 这种行为是由于向上运动的位置报告有区别。
      } else {
        rowSmall += shiftNum;
        shiftLeft = odom.vertical_offset_from_nearest_coordinate - shiftNum * normalHeight;
      }
    }
  } // 中间部分结束。

  return {
    rowSmall: rowSmall,
    colSmall: colSmall,
    shiftLeft: shiftLeft,
  };
  //console.log('rowSmall: ', rowSmall, 'colSmall: ', colSmall, 'shiftLeft: ', shiftLeft)
};
