This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

And this is a collection of d3 examples used in react.

使用方法：

1. 先写一个误差，一般是 0.1 或者 0.2，单位是毫米
2. 点击 calc 按钮，开始计算，最好是把开发者调试窗口 console 打开。
3. 计算完成之后，点击 Download 按钮下载一个 csv 文件。

使用说明：

1. test 算总齿数
    
    一个输入误差的框，用来显示符合要求的可能的数据情况。
    
    一个download按钮，用来下载生成的csv、Excel文件。
    
2. test 算S形弯道齿数，和上面的大同小异。

3. Home, show img标签和svg效果。

4. 我觉得要分就分干脆，这个分支就是和pathfinding不相干的部分。
    
    既不包括 d3 这个库的使用方法、使用样例，也不包括pathfinding的实现。