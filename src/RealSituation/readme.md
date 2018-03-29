This is a document for putting PathFinder code in the auto-pick-system.



几个大部分：

1. 尧飞或者旭凯那边的数据转换成我这里需要的数据 API(application program interface)
    1. 比如小车的位置报告、小车的目标设置
    2. 待续
    
    
2. 我这边根据得到的数据，算出路径
    1. 算出来的结果，准备发给小车去执行的数据。
    
    
3. 提供给旭凯调用路径规划的 API


首先让自己这边使用的数据格式定下来。

参照现在的已有的shuttleDispatch的写法，有一些是我需要保存的数据。
以及数据的 getter、setter 的方法，主要是 setter。
以及调用现有的数据来算出结果。




