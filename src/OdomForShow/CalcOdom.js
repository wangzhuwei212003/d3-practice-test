/**
 * Created by zhuweiwang on 2018/4/28.
 *
 * 根据大格子位置报告，算出odom中偏移量占下一个格子的百分比。用来给前端显示。
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

  let percent; // 偏移量占下一个格子的百分比

  if (odom.current_row === CONFIG.usedRowNum - 1) {
    // 1. 特殊处理的部分，顶部一行
    if (
        odom.theoretical_moving_direction.toString() === SpecificActionsEnum['SA_ODOM_FORWARD_GROUND_AS_REFERENCE'].toString() &&
        !odom.turning
    ) {
      // 考虑顶部特殊宽度，特殊宽度是对称的。
      if (odom.current_column === 1 || odom.current_column === CONFIG.usedColNum - 2) {

        percent = odom.horizontal_offset_from_nearest_coordinate / 4 * CONFIG.specialBottomPart;

      } else {

        percent = odom.horizontal_offset_from_nearest_coordinate / 4 * CONFIG.normalWidth;

      }
    } else if (
        odom.theoretical_moving_direction.toString() === SpecificActionsEnum['SA_ODOM_DOWN_GROUND_AS_REFERENCE'].toString() &&
        !odom.turning
    ) {

      percent = odom.vertical_offset_from_nearest_coordinate / 4 * CONFIG.topBoxNormalHeight;

    } else if (odom.turning) {
      if (odom.horizontal_offset_from_nearest_coordinate > 4 * CONFIG.normalWidth) {
        percent = 1; // 判断大格子位置变化的规则，没有弄清楚。
      } else {
        percent = odom.horizontal_offset_from_nearest_coordinate / 4 * CONFIG.normalWidth;
      }

    } else {
      console.log('顶部一行 没考虑到的情况', odom);
    }
    // 顶部一行的判断结束。
  } else if (
      odom.current_row === 1 && odom.current_column === 0
  ) {
    // 2-1. 倒数第二行，就是特殊列的一行。第一列 -- 上升列
    percent = odom.vertical_offset_from_nearest_coordinate / 4 * CONFIG.normalHeight;
  } else if (
      odom.current_row === 1 && odom.theoretical_moving_direction.toString() === SpecificActionsEnum['SA_ODOM_DOWN_GROUND_AS_REFERENCE'].toString()
  ) {
    // 2-1. 倒数第二行，就是特殊列的一行。// 下降列
    percent = odom.vertical_offset_from_nearest_coordinate / 4 * CONFIG.specialHeight;
  } else if (
      odom.current_row === 0
  ) {
    // 2-2. 大格子里的倒数第一行。

    // 除了第一列 -- 上升列 都没有问题。
    if (odom.current_column === 0) {
      if (
          odom.theoretical_moving_direction.toString() === SpecificActionsEnum['SA_ODOM_UP_GROUND_AS_REFERENCE'].toString() &&
          !odom.turning
      ) {
        percent = odom.vertical_offset_from_nearest_coordinate / 4 * CONFIG.specialHeight;
      } else {
        // 在转弯
        percent = 0;

      }
    } else {
      if (
          odom.theoretical_moving_direction.toString() === SpecificActionsEnum['SA_ODOM_BACKWARD_GROUND_AS_REFERENCE'].toString() &&
          !odom.turning
      ) {
        // 考虑底部特殊宽度
        if (odom.current_column === 2 || odom.current_column === CONFIG.usedColNum - 1) {
          percent = odom.horizontal_offset_from_nearest_coordinate / 4 * CONFIG.specialBottomPart;
        } else {
          percent = odom.horizontal_offset_from_nearest_coordinate / 4 * CONFIG.normalWidth;
        }
      } else {
        // 这种情况就是正在转弯的。
        percent = 0;
      }
    }
  } else {
    // 3. 中间部分，odom.current_row 范围是 2 - 6，中间货位部分。

    // 上升列、下降列，包含S形弯道部分。
    if (
        (odom.current_column === 0) &&
        (odom.current_row === 2 )
    ) {
      percent = odom.vertical_offset_from_nearest_coordinate / 4 * CONFIG.SDownPart;
    } else if (
        (odom.current_column === 0) &&
        (odom.current_row === 3)
    ) {

      percent = odom.vertical_offset_from_nearest_coordinate / 4 * CONFIG.SUPPart;
    } else if (
        (odom.current_column === CONFIG.usedColNum - 1) &&
        (odom.current_row === 4)
    ) {

      percent = odom.vertical_offset_from_nearest_coordinate / 4 * CONFIG.SUPPart;
    } else if (
        (odom.current_column === CONFIG.usedColNum - 1) &&
        (odom.current_row === 3)
    ) {

      percent = odom.vertical_offset_from_nearest_coordinate / 4 * CONFIG.SDownPart;
    } else if (odom.current_column === 0) {
      // 第一列剩下的

      percent = odom.vertical_offset_from_nearest_coordinate / 4 * CONFIG.normalHeight;
    } else if (odom.current_column === CONFIG.usedColNum - 1) {
      // 最后一列剩下的

      percent = odom.vertical_offset_from_nearest_coordinate / 4 * CONFIG.normalHeight;
    } else {
      // 剩下的就是 66.83 的
      if (odom.theoretical_moving_direction.toString() === SpecificActionsEnum['SA_ODOM_UP_GROUND_AS_REFERENCE'].toString()) {
        // 考虑的就是向上运动的位置报告的转换。如果是中间货位，但是位置报告运动方向是向上的。
        percent = odom.vertical_offset_from_nearest_coordinate / 4 * CONFIG.normalHeight; // 这种行为是由于向上运动的位置报告有区别。
      } else {

        percent = odom.vertical_offset_from_nearest_coordinate / 4 * CONFIG.normalHeight;
      }
    }
  } // 中间部分结束。

  console.log('percent', percent)
};
