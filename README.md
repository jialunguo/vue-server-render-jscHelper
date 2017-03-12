# vue-server-render-jscHelper

```
npm install vue.

npm install vue-server-renderer
```

find build.js in vue-server-renderer, add below code at the end:

```
exports.parse = function(tplStr, options) {
    options = options
        ? extend(extend({}, baseOptions), options)
        : baseOptions;
    return parse((tplStr || '').trim(), options);
};
```

put index.js and jscHelper.js where can require vue and vue-server-renderer

run 
```
node index.js
```

result will show in the console

example result:

```
vue-server-render-jscHelper:  389 ms
vue-server-render:  4977 ms
```
