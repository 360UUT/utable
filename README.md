        <div class="markdown-body">

jquery.utable.js 说明文档

<table>
<tr>
<td>
日期
</td>
<td>
修改人
</td>
<td>
版本
</td>
<td>
说明
</td>
</tr>
<tr>
<td>
2017-5-8
</td>
<td>
苏国潮
</td>
<td>
0.1
</td>
<td>
创建文档
</td>
</tr>
<tr>
<td>
2017-7-1
</td>
<td>
苏国潮
</td>
<td>
1.0
</td>
<td>
完成文档
</td>
</tr>
<tr>
<td>

</td>
<td>

</td>
<td>

</td>
<td>

</td>
</tr>
<tr>
<td>

</td>
<td>

</td>
<td>

</td>
<td>

</td>
</tr>
</table>   

<table summary="Contents"><tr><td>
<div>

## 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#table-of-contents)Table of Contents
</div>

</td></tr></table>

## 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#1%E7%9B%AE%E7%9A%84)<a name="user-content-1"></a><span>1目的</span>

此文档包含了用jquery.utable.js创建业务表格的所有知识。

## 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#2%E8%AF%B4%E6%98%8E)<a name="user-content-2"></a><span>2说明</span>

    本插件提供了列固定的功能，以及可按一系列自定义展示的配置

## 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#3%E8%B5%B7%E6%AD%A5)<a name="user-content-3"></a><span>3起步</span>

### 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#31%E5%88%9B%E5%BB%BA%E4%B8%80%E5%80%8B%E5%AE%B9%E5%99%A8)<a name="user-content-31"></a><span>3.1创建一個容器</span>

    引入依赖文件后，在需要创建表格的地方编写个div标签作为容器，再编写初始化控件的代码即可呈现表格。

例如：

&lt;div id="utable1"&gt;&lt;/div&gt;

### 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#32%E5%87%86%E5%A4%87%E6%95%B0%E6%8D%AE%E6%8E%A5%E5%8F%A3)<a name="user-content-32"></a><span>3.2准备数据接口</span>

    创建一个data.json文件作为请求的数据接口，文件包含的有以下数据，其中TotalCount代表数据总数和，Items为要显示的数据序列，序列项必须保持属性、类型一致且具有唯一键代表数据项。

<table><tr><td>
{

    "TotalCount": 500,

    "Items": [

     {

       ]

  }
</td></tr></table> 

### 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#34%E8%BD%BD%E5%85%A5utable)<a name="user-content-34utable"></a><span>3.4载入utable</span>

由于utable依赖jquery，所以首先引入jquery.js（&gt;=1.8），再引入jquery.utable.js以及样式jquery.utable.css文件。

<table><tr><td>
&lt;link href="jquery.utable.css" rel="stylesheet"&gt;&lt;/link&gt;

&lt;script src="jquery.js"&gt;&lt;/script&gt;

&lt;script src="jquery.utable.js"&gt;&lt;/script&gt;
</td></tr></table>

### 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#35%E5%88%9D%E5%A7%8B%E5%8C%96utable)<a name="user-content-35utable"></a><span>3.5初始化utable</span>

<table><tr><td>
<pre> $("#utable1").uTable({
     Url: 'data.json',
     parseItems: function (response) {
         return response.Result.Items;
     },
     parseTotalCount: function (response) {
         return response.Result.TotalCount;
     },
     TableColumns: [
       {
],
     TableClass: 'table table-bordered',
     PageSize: 5,
     DefaultSortField: 'Id',
     DefaultSortWay: 'Desc',
     KeyField: 'Id',
   }); 
</pre>
</td></tr></table>

## 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#4%E8%AF%A6%E7%BB%86%E8%AF%B4%E6%98%8E)<a name="user-content-4"></a><span>4详细说明</span>

### 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#41%E9%85%8D%E7%BD%AE%E8%AF%B4%E6%98%8E)<a name="user-content-41"></a><span>4.1配置说明</span>

#### 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#411containerselector-jquery%E5%AE%B9%E5%99%A8%E9%80%89%E6%8B%A9%E5%99%A8)<a name="user-content-411containerSelector_jquery"></a><span>4.1.1.containerSelector  jquery容器选择器</span>

如：
$(**containerSelector**).utable(UTableOption) 

#### 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#422-utableoption-%E8%A1%A8%E6%A0%BC%E4%B8%BB%E9%85%8D%E7%BD%AE%E9%A1%B9)<a name="user-content-422_UTableOption_"></a><span>4.2.2. UTableOption 表格主配置项</span>

如：
$(containerSelector).utable(**UTableOption**) 

属性说明： 

<table>
<tr>
<td>
属性名
</td>
<td>
类型
</td>
<td>
说明
</td>
<td>
默认值
</td>
</tr>
<tr>
<td>
condition
</td>
<td>
Object
</td>
<td>
过滤条件
</td>
<td>

</td>
</tr>
<tr>
<td>
TableColumns
</td>
<td>
Array(**UTableColumnOption**)
</td>
<td>
列配置项数组
</td>
<td>

</td>
</tr>
<tr>
<td>
Url
</td>
<td>
String
</td>
<td>
获取数据的地址
</td>
<td>

</td>
</tr>
<tr>
<td>
TableClass
</td>
<td>
String
</td>
<td>
表格样式
</td>
<td>
table  table-bordered
</td>
</tr>
<tr>
<td>
ShowCheckBox
</td>
<td>
Boolean
</td>
<td>
是否显示复选框
</td>
<td>
false
</td>
</tr>
<tr>
<td>
ShowRadioBox
</td>
<td>
Boolean
</td>
<td>
是否显示单选框
</td>
<td>
false
</td>
</tr>
<tr>
<td>
ShowRowIndex
</td>
<td>
Boolean
</td>
<td>
是否显示行索引
</td>
<td>
false
</td>
</tr>
<tr>
<td>
ShowPager
</td>
<td>
Boolean
</td>
<td>
是否显示分页控件
</td>
<td>
true
</td>
</tr>
<tr>
<td>
PageSize
</td>
<td>
Number
</td>
<td>
行页显示行数
</td>
<td>
50
</td>
</tr>
<tr>
<td>
DefaultSortField
</td>
<td>
String
</td>
<td>
用于提供给后端排序的列名
</td>
<td>
<pre> Id
</pre>
</td>
</tr>
<tr>
<td>
DefaultSortWay
</td>
<td>
String(asc|desc
</td>
<td>
提供给后端排序时是正序还是倒序的依据
</td>
<td>
asc
</td>
</tr>
<tr>
<td>
KeyField
</td>
<td>
String
</td>
<td>
数据项的主键
</td>
<td>
Id
</td>
</tr>
<tr>
<td>
MemoryPage
</td>
<td>
Boolean
</td>
<td>
是否内存分页
</td>
<td>

</td>
</tr>
<tr>
<td>
MemoryAllData
</td>
<td>
Array
</td>
<td>
当MemoryPage为true时，要进行内存分页的全部数据
</td>
<td>

</td>
</tr>
<tr>
<td>
IndexColWidth
</td>
<td>
Number
</td>
<td>
索引列的宽度(px)
</td>
<td>
50
</td>
</tr>
<tr>
<td>
CheckWidth
</td>
<td>
Number
</td>
<td>
复选框列的宽度
</td>
<td>
30
</td>
</tr>
<tr>
<td>
TableBodyHeight
</td>
<td>
Number
</td>
<td>
表格内容高度
</td>
<td>
200
</td>
</tr>
<tr>
<td>
FixedColumn
</td>
<td>
Boolean
</td>
<td>
是否启用固定列
</td>
<td>
true
</td>
</tr>
<tr>
<td>
FootAlign
</td>
<td>
String
</td>
<td>
表格脚部的文本对齐方式
</td>
<td>
Center
</td>
</tr>
<tr>
<td>
showNoData
</td>
<td>
Boolean
</td>
<td>
没有数据时是否显示showNoDataText
</td>
<td>
true
</td>
</tr>
<tr>
<td>
showNoDataText
</td>
<td>
String
</td>
<td>
没数据时显示的文本
</td>
<td>
<pre> 暂无更多数据了
</pre>
</td>
</tr>
<tr>
<td>
**FooterOptions**
</td>
<td>
Object
</td>
<td>
表脚的配置
</td>
<td>

</td>
</tr>
</table> 

回调事件和函数

1、rowClickHandler:void

说明：用户点击行事件
参数：    

evt 事件信息    

model 当前行数据项 

2、changeRadioButton:void    

说明：选择单选框时触发

    参数：

    evt事件信息

    model当前行数据项 

3、changeCheckboxButton:void

    说明：选择复选框时触发

    参数：

    evt事件信息

    model当前行数据项 

4、afterLoad:void

    说明：加载数据完成后触发

    参数：

    response 原始 response 对象 

    5、checkAllChangeHandler:void

        说明：选择全部回调方法

        参数：

            evt 事件信息

    6、beforePageChange:void

        说明：跳页前

        参数：            

evt 事件信息             

pageObj 跳页的参数信息                 

currentPageIndex：当前页码                 

pageSize：每页显示行数             

totalCount：总行数             

pageTotal：总页码  

7、parseItems: Array  

说明：本函数接收原始 response 对象，返回可以用于展示的数组
参数     

response    原始 response 对象         

返回    

            Array 展示的数组

#### 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#423utablecolumnoption-%E9%85%8D%E7%BD%AE%E9%A1%B9)<a name="user-content-423UTableColumnOption_"></a><span>4.2.3.UTableColumnOption 配置项</span>

        UtableColumnOption代表表格列的配置项         

<table>
<tr>
<td>
属性
</td>
<td>
说明
</td>
</tr>
<tr>
<td>
head:string
</td>
<td>
列头文本
</td>
</tr>
<tr>
<td>
tag:string
</td>
<td>
数据字段名
</td>
</tr>
<tr>
<td>
width:Number
</td>
<td>
列宽度
</td>
</tr>
<tr>
<td>
sort:Number
</td>
<td>
1为排序，0为不排序
</td>
</tr>
<tr>
<td>
sortTag
</td>
<td>
排序的字段名
</td>
</tr>
<tr>
<td>
format:enum

{

string,money,rate,MoneySN,week,utc@日期格式

}
</td>
<td>
显示类型
</td>
</tr>
<tr>
<td>
addClass:string
</td>
<td>
额外列样式
</td>
</tr>
<tr>
<td>
Img:string
</td>
<td>
图片链接
</td>
</tr>
<tr>
<td>
isLink:bool
</td>
<td>
是否链接
</td>
</tr>
<tr>
<td>
url:string
</td>
<td>
跳转地址
</td>
</tr>
<tr>
<td>
paras:string
</td>
<td>
参数
</td>
</tr>
<tr>
<td>
Text:string
</td>
<td>
显示文本
</td>
</tr>
<tr>
<td>
target:string
</td>
<td>
链接目标(_blank,_self)
</td>
</tr>
<tr>
<td>
linkList:Array&lt;**LinkOption**&gt;
</td>
<td>
按钮列表配置
</td>
</tr>
<tr>
<td>
align:string
</td>
<td>
列表对齐方式，center，left，right
</td>
</tr>
<tr>
<td>
headAlign:string
</td>
<td>
列头对齐方式,center,left,right
</td>
</tr>
<tr>
<td>
isOper:bool
</td>
<td>
是否操作按钮
</td>
</tr>
<tr>
<td>
fixColumn:bool
</td>
<td>
是否固定列
</td>
</tr>
<tr>
<td>
nowrap:bool
</td>
<td>
是否换行
</td>
</tr>
<tr>
<td>
enums
</td>
<td>
枚举对象定义，例子：

{

  Number: {

text: "数字", value: 20

}

}
</td>
</tr>
</table>

回调函数与事件：

1、 clickEvent 点击事件

a)  参数：evt 事件对象

  model 当前行的数据对象

rowTag 当前行的tr对象

2、 func：当没配置format时，每次展示数据时都会执行，执行后的返回值是改单元格显示的结果

参数：

        model 当前行对象

        text  文本

        cell  td Dom对象

link  a 标签对象

rowTag  tr 标签对象

#### 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#424-linkoption%E9%85%8D%E7%BD%AE%E9%A1%B9)<a name="user-content-424_LinkOption"></a><span>4.2.4. LinkOption配置项</span>

<table>
<tr>
<td>
属性
</td>
<td>
说明
</td>
</tr>
<tr>
<td>
img
</td>
<td>
图片路径
</td>
</tr>
<tr>
<td>
target
</td>
<td>
点击的目标
</td>
</tr>
<tr>
<td>
url
</td>
<td>
地址
</td>
</tr>
<tr>
<td>
paras
</td>
<td>
参数
</td>
</tr>
<tr>
<td>
clickEvent
</td>
<td>
点击事件
</td>
</tr>
<tr>
<td>
tip
</td>
<td>
提示
</td>
</tr>
<tr>
<td>
text
</td>
<td>
显示的文本
</td>
</tr>
<tr>
<td>
cssClass
</td>
<td>

</td>
</tr>
</table>
回调函数与事件：

3、 clickEvent 点击事件

a)  参数：evt 事件对象

  model 当前行的数据对象

rowTag 当前行的tr对象 

4、 func：每次展示数据时都会执行，执行后的返回值是改单元格显示的结果

参数：

model 当前行对象

        text  文本

        cell  td Dom对象

link  a 标签对象

rowTag  tr 标签对象

#### 
[<svg aria-hidden="true" class="octicon octicon-link" height="16" version="1.1" viewbox="0 0 16 16" width="16"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>](#425-footeroptions%E8%A1%A8%E8%84%9A%E9%85%8D%E7%BD%AE%E9%A1%B9)<a name="user-content-425_FooterOptions"></a><span>4.2.5 FooterOptions表脚配置项</span>

由于这里内容比较多，贴个示例代码： 

<pre> Rows: [
                 {
                     RowType: "合计",
                     RowTypeNameIndex: 2,
                     Cells: [
                         {
                             CellIndex: 8,
                             // data 为请求回来的数据, cell为当前单元格Dom
                             Func: function (data, cell) {
                              //   console.log(data);
                                 var total=0;
                                 for(var i=0;i&lt;data.Result.Items.length;i++){
                                     total+=data.Result.Items[i].money;
                                 }
                                 return total;
                             }
                         }
                     ]
                 },
                 {
                     RowType: "平均数",
                     RowTypeNameIndex: 2,
                     Cells: [
                         {
                             CellIndex: 8,
                             // data 为请求回来的数据, cell为当前单元格Dom
                             Func: function (data, cell) {
                                 var total=0;
                                 for(var i=0;i&lt;data.Result.Items.length;i++){
                                     total+=data.Result.Items[i].money;
                                 }
                                 return total/data.Result.Items.length;
                             }
                         }
                     ]
                 }
             ] 
</pre>

        </div>
