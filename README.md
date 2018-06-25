# vue-server-render-jscHelper

```
cd vue-server-render-jscHelper
npm install
```

find build.js in node_modules/vue-server-renderer, add these code to the end:

```
exports.parse = function(tplStr, options) {
    options = options
        ? extend(extend({}, baseOptions), options)
        : baseOptions;
    return parse((tplStr || '').trim(), options);
};
```

run 
```
cd vue-server-render-jscHelper
node index.js
```

result will show in the console

example result:

```
vue-server-render-jscHelper:  389 ms
vue-server-render:  4977 ms
```
