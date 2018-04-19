/**
 * Created by zhuweiwang on 31/03/2018.
 */
/**
 * Created by zhuweiwang on 29/03/2018.
 */
import {
  rowNum,
  colNum,

  pickStationRow,

  normalWidth, //水平方向一格的宽度
  normalHeight, // 一般货位高度是 66.83
  topBoxNormalHeight, // 最上面一行货位的高度是 60.23
  specialHeight, // 底部特殊高度，31.62
  compensate, // 方向改变的时候，齿数补偿，25 + 90度

  specialBottomPart, // 底部的特殊部分
  specialTopPart, // 顶部的特殊部分

  SUPPart, // S形弯道上部分齿数
  SDownPart, // S形弯道下部分齿数

  pickStationHigh
}
  from
      '../../config';

export const backtrace = function (node) {
  const path = [[node.row, node.col]];
  while (node.parent) {
    node = node.parent;
    path.push([node.row, node.col]);
  }
  return path.reverse();
}; // 这里是用的 row、col，不是之前说的 x、y


export const backtraceNode = function (node) {
  const pathTest = [node];
  while (node.parent) {
    node = node.parent;
    pathTest.push(node);
  }
  return pathTest.reverse();
}; // 这里是用的 row、col，不是之前说的 x、y

/**
 * Huicang priority.
 *
 * @param {number} row - unit 当前点的 row.
 * @param {number} col - unit 当前点的 col
 *
 * @return {number} 具有期望效果的 priority，用来在heap里比较优先级。
 *
 * 分为4个部分
 * 1. 左边拣货台上面一格 到 顶部水平行到最右侧
 * 2. 中间有货位部分
 * 3. 右边下降列到底部
 * 4. 最底一行 到 左边拣货台
 *
 */
export const HCPriority = function (row, col, endRow, endCol) {

  const pickRow = pickStationRow; // 这个是根据UI测试的图里定的。可以说是写死了。拣货台的行数。21

  // 排错
  if (row > rowNum - 1 || row < 0 || col < 0 || col > colNum - 3) {
    console.log('行列数超出范围'); // 当前点的行数、列数。
    debugger;
    return 0; //
  }

  let extra = 0;
  // 加餐，如果是目标点就是在最下面一行，就 priority + （912 - 32）保证priority比横向过来的大。
  if (
      endRow === rowNum - 3 && endCol === col
  ) {
    // 目标终点是最下面一行拣货位，当前列数和目标终点的列数一致。
    extra = 880;
  }

  if (
      (row <= pickRow - 1 && row >= 0 && col === 0 ) ||
      (row === 0)
  ) {// 1 左边拣货台上面一格 到 顶部水平行到最右侧

    // 拣货台的那个点的 priority 最大，拣货台上面一个点的 priority 最小
    return col - row; // 直接是返回代表 priority 的数值。 col越大越重要，row越小越重要

  } else if (
      row >= 1 && row <= rowNum - 2 &&
      col >= 8 && col <= colNum - 12
  ) {
    // 2 中间货位部分, 32 - 0 = 32 是上个部分最大的值
    return extra + 32 + (row ) * (colNum - 4) - col;

  } else if (
      row <= rowNum - 2 && row >= 1 &&
      col === colNum - 4
  ) {
    // 3. 右边下降列到底部（不包括上下两交点）。 上部分最大值：32+(27 -2 )*(36 -4) - 8 = 824
    return 824 + row;

  } else if (
      (row <= rowNum - 1 && row >= pickRow && col === 0 ) ||
      (row === rowNum - 1)
  ) {
    // 4. 最底一行 到 左边拣货台 。上面最大priority是 824 + 25 = 849。最底部一行的上限是 849 + 36 + 27 = 912
    return 849 + colNum - col + rowNum - row

  } else {
    console.log('some senario not expected!');
    console.log('row, col', row, col);
    debugger;
  }

};

export const generateMatrix = function () {
  // 根据中间货位的行数、列数来得到整个代表物理障碍的 0-1 矩阵，看起来并不像实际的地图，这个是根据划分格子方法为了寻路。
  const matrixData = [];

  for (let row = 0; row < rowNum; row += 1) {
    matrixData.push([]);
    for (let column = 0; column < colNum; column += 1) {
      let ob = 1;
      // 0 表示没有障碍，1 表示有障碍。
      // 因为看起来是有障碍的点比较多，默认就是有障碍。

      // 我这边是为了显示的方便，使用的 web 里的坐标系，左上角是（0，0），往右往下变大。
      if (
          (row === 0 && column < colNum - 3) ||
          (row === rowNum - 1 && column < colNum - 3)
      ) {
        // 第一行、最后一行的点，没有障碍的点
        ob = 0;
      }
      if (
          column === 0 ||
          column === colNum - 4

      ) {
        ob = 0; // 第一列，最后一列没有障碍
      }
      if (
          column > 7 &&
          column < colNum - 11 &&
          (column - 8) % 4 === 0
      ) {
        // 中间正常货位部分，没有障碍
        ob = 0;
      }
      matrixData[row].push(ob);
    }
  }
  // console.log(matrixData);
  // debugger;
  return matrixData;
};

export const calcTeeth = function (path) {
  // 传进来的是一个 path，二维数组
  // [[row, col], [row, col], [row, col], ... , [row, col]]

  // 目前的做法是加一个判断，是否需要补偿。除此之外，CellToTeeth就不用考虑补偿了。

  // 算总齿数是设目标的时候，就算好。但是和行进过程中没有关系。这个是基于齿数的，所以是不存在不停的重新规划的。
  // 所以是还得有一个 ignore 其他所有小车的寻路的方法。所以在 findPath 里添加了一个 ignore 的 flag。一般情况下是不会 ignore 的

  // 算出总齿数，以及什么时候伸 pin、缩 pin。

  /* 返回的数据格式
   * {
   *   totalTeeth：double数值
   *   stretchPin：[], 伸pin的点，是齿数，到达相应的齿数开始伸pin
   *   retrivePin: []
   * }
   *
   * */
  let totalTeeth = 0;
  let stretchPin = [];
  let retrivePin = [];
  let actions = [];

  //console.log(path);

  for (let step = 0; step < path.length; step += 1) {
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

    // if(cellRow === cellNextRow && cellCol === cellNextCol){
    //   // 如果是已经到达终点了，就停止计算。
    //   break
    // } 这句话不能写，会导致不算最后一个终点。而且，起点的设置也是有讲究的。

    totalTeeth += CellToTeeth(cellRow, cellCol); // 没有考虑补偿的。

    //判断如果是转弯了，就加补偿
    /*  // 首先判断是潜在的补偿点。
     if (
     cellRow === 1 && cellCol === 0 ||
     (cellRow === rowNum - 1 && cellCol === 0) ||
     (
     cellRow === rowNum - 2 && cellCol >= 8 && cellCol <= colNum - 12 && (cellCol - 8) % 4 === 0
     ) ||
     (
     cellRow === rowNum - 2 && cellCol === colNum - 4
     ) ||
     (
     cellRow === 0 && cellCol >= 8 && cellCol <= colNum - 12 && (cellCol - 8) % 4 === 0
     ) ||
     (
     cellRow === 0 && cellCol === colNum - 4
     )
     ) {
     // 这个里面是可能走到的点


     }*/

    if (
        cellRow === 1 && cellCol === 0 &&
        cellNextRow === 0 && cellNextCol === 0
    ) {
      // 这里不需要伸 pin
      totalTeeth += compensate; // 如果是有拐角就是添加补偿。第一行上升列
    } else if (
        (cellRow === rowNum - 1 && cellCol === 0) &&
        cellNextRow === rowNum - 2 && cellNextCol === 0
    ) {
      // 这里需要在前两格伸pin，第一列上升列
      // stretchPin.push(totalTeeth - 2*normalWidth);
      // totalTeeth += compensate;
      // retrivePin.push(totalTeeth);

      //stretchPin.push(totalTeeth - 2 * normalWidth);
      actions.push({
        position: totalTeeth - 2 * normalWidth,
        action: 'stretchPin'
      }); // 伸pin动作
      totalTeeth += compensate;
      //retrivePin.push(totalTeeth);
      actions.push({
        position: totalTeeth,
        action: 'retrivePin'
      }); // 缩pin动作

    } else if (
        (
            cellRow === rowNum - 2 && cellCol >= 8 && cellCol <= colNum - 12 && (cellCol - 8) % 4 === 0
        ) &&
        cellNextRow === rowNum - 1 && cellNextCol === cellCol
    ) {
      // 下降列转弯了。下来不需要伸 pin，缩 pin。下降列，下降到最底部一行
      totalTeeth += compensate;
      totalTeeth -= CellToTeeth(cellNextRow, cellCol); // 多算了一个，最底部的横向的这一个是不用算的。
    } else if (
        cellRow === rowNum - 2 && cellCol === colNum - 4 &&
        cellNextRow === rowNum - 1 && cellNextCol === cellCol
    ) {
      // 最后一列下降列。下来不需要伸 pin，缩 pin
      totalTeeth += compensate;
      totalTeeth -= CellToTeeth(cellNextRow, cellCol); // 多算了一个，最底部的横向的这一个是不用算的。
    } else if (
        cellRow === 0 && cellCol >= 8 && cellCol <= colNum - 12 && (cellCol - 8) % 4 === 0 &&
        cellNextRow === 1 && cellNextCol === cellCol
    ) {
      // 顶部一行下降列，方向改变
      if (cellCol === 8) {
        // // 特殊处理
        // stretchPin.push(totalTeeth - normalWidth - 2*specialTopPart );
        // totalTeeth += compensate;
        // retrivePin.push(totalTeeth);

        actions.push({
          position: totalTeeth - normalWidth - 2 * specialTopPart,
          action: 'stretchPin'
        }); // 伸pin动作
        totalTeeth += compensate;
        totalTeeth -= CellToTeeth(cellRow, cellCol); // 多算了一个，横向的这一个是不用算的。
        //console.log(CellToTeeth(cellRow, cellCol));
        //debugger;
        //retrivePin.push(totalTeeth);
        actions.push({
          position: totalTeeth,
          action: 'retrivePin'
        }); // 缩pin动作
      } else {
        // stretchPin.push(totalTeeth - 3*normalWidth );
        // totalTeeth += compensate;
        // retrivePin.push(totalTeeth);

        actions.push({
          position: totalTeeth - 3 * normalWidth,
          action: 'stretchPin'
        }); // 伸pin动作
        totalTeeth += compensate;
        totalTeeth -= CellToTeeth(cellRow, cellCol); // 多算了一个，横向的这一个是不用算的。
        //retrivePin.push(totalTeeth);
        actions.push({
          position: totalTeeth,
          action: 'retrivePin'
        }); // 缩pin动作
      }
    } else if (
        cellRow === 0 && cellCol === colNum - 4
    ) {
      // 最后一列下降，方向改变
      // stretchPin.push(totalTeeth - 3*normalWidth );
      // totalTeeth += compensate;
      // retrivePin.push(totalTeeth);

      actions.push({
        position: totalTeeth - 3 * normalWidth,
        action: 'stretchPin'
      }); // 伸pin动作
      totalTeeth += compensate;
      totalTeeth -= CellToTeeth(cellRow, cellCol); // 多算了一个，横向的这一个是不用算的。
      //retrivePin.push(totalTeeth);
      actions.push({
        position: totalTeeth,
        action: 'retrivePin'
      }); // 缩pin动作
    }

    console.log('total teeth: ', totalTeeth);
    console.log('cellRow cellCol: ', cellRow, cellCol);
  } // end for loop 根据一条路径算总齿数、伸pin、缩pin点，算完。

  // 返回一个 object
  // return {
  //   totalTeeth: totalTeeth,
  //   stretchPin: stretchPin,
  //   retrivePin: retrivePin
  // }

  return {
    totalTeeth: totalTeeth,
    actions: actions,
  };
};

const CellToTeeth = function (cellRow, cellCol) {
  // 根据行列，对应出齿数。没有考虑补偿。
  // 特殊的先来，从上到下
  if (
      cellRow === 0 &&
      cellCol >= 4 && cellCol <= 7
  ) {
    // 顶部特殊长度 52/4
    return specialTopPart
  } else if (
      cellRow === 0
  ) {
    // 除此之外，上面的都是 normal
    return normalWidth
  } else if (
      cellRow >= 1 && cellRow <= 4
  ) {
    // 剩下的最上面一行的货位里的格子
    return topBoxNormalHeight
  } else if (
      cellRow >= rowNum - 10 && cellRow <= rowNum - 7 &&
      (cellCol === 0 || cellCol === colNum - 4)
  ) {
    // S形弯道下部分
    return SDownPart
  } else if (
      cellRow >= rowNum - 14 && cellRow <= rowNum - 11 &&
      (cellCol === 0 || cellCol === colNum - 4)
  ) {
    // S形弯道上部分
    return SUPPart
  } else if (
      cellRow >= 5 && cellRow <= rowNum - 3
  ) {
    // 中间正常部分
    return normalHeight
  } else if (
      cellRow === rowNum - 2
  ) {
    // 倒数第二行 特殊高度部分，其他的都不需要补偿
    return specialHeight
  } else if (
      cellRow === rowNum - 1 &&
      cellCol >= 4 && cellCol <= 7
  ) {
    // 倒数第一行 特殊宽度部分
    return specialBottomPart
  } else if (cellRow === rowNum - 1) {
    return normalWidth
  } else {
    console.log('some situation senario not considered!!');
    debugger;
  }

};


export default {}