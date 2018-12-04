# PROJECT 项目介绍

miniapp2vue 是一个将小程序模板(HTML/STYLE/JS)解析为AST, 编译为VueJS单组件的项目, 功能简单, 仅作思路参考使用.

# ENVIRONMENT 开发环境

1. npm install;
2. 新建控制台, 使用`npm start` 运行`rollup -c -w`命令, 监听库文件模块的变动同时重新构建库文件;
3. 新建控制台, 使用`npm run run` 运行`nodemon`命令, 监听库文件的构建, 并运行库文件;

# TODO List 任务清单

* 百度小程序

- [x] template 模板转换
- [x] css 样式转换
- [working on] js 逻辑转换

# AFTER 项目后续

> 完成简单解析小程序JS后, 项目已经完成了小程序模板编译的一个基础功能, 作者将不再维护.
