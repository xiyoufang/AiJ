# 配置
Hello world new project template.

## 在main.js中添加如下代码，将热更新下载的资源目录加载到Search目录
```js
    var hotUpdateSearchPaths = localStorage.getItem('HotUpdateSearchPaths');
    if (hotUpdateSearchPaths) {
        jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths));
    }
```
## 创建版本信息文件
打包前执行如下脚本
```shell script
node version_generator.js -v 1.0.0 -u http://localhost/tutorial-hot-update/remote-assets/ -s build/jsb-link/ -d assets/
```

