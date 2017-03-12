var SSR = require('vue-server-renderer').createRenderer();
var Vue = require('vue');
var jscHelper = require('./jscHelper');

var tplStr = [
    '<div>',
    '<nav class="ui-nav j-tabs">',
    '<button v-for="(tab, index) in data.tabList" class="item-nav" :class="{current: data.curTab === tab.id}">{{tab.name}}</button>',
    '</nav>',
    '<main class="gift-list">',
    '<ul>',
    '<li class="item" ',
        'v-for="(item, index) in data.curList.items" ',
        ':class="{\'vip-item\': item.type === 15, \'valentine-gift\': item.type === 16}" ',
        ':style="{display: (data.platform === \'aa\' && item.isMusic) || (data.forbidden && [233, 221, 222].indexOf(item.id) !== -1) ? \'none\' : \'inline-block\'}">',
    '<i class="gift-pic" :style="{\'background-image\': \'url(//test.test.com/cdn/\' + item.id % 16 + \'/\' + item.id + (item.format === \'gif\' ? \'_100.gif\' : \'_100.png\') + \')\'}"></i>',
    '<span class="gift-name">{{item.name}}</span> ',
    '</li>',
    '</ul>',
    '</main>',
    '</div>'
].join('');

var data = {
    platform: 'aa',
    forbidden: true,
    tabList: [{id: 123, name: 'test'}, {id: 123, name: 'test'}, {id: 123, name: 'test'}, {id: 123, name: 'test'}],
    curList: {
        items: []
    }
};

for(var i = 0; i < 30; i++) data.curList.items.push({
    id: 1,
    type: 2,
    name: 'test',
    isMusic: false,
    format: 'png'
});

var htmlStr = '';

var t0 = Date.now();

for(var i = 0; i < 10000; i++) {
    htmlStr = jscHelper.renderVue({
        template: tplStr,
        data: data
    });
}

//console.log(htmlStr);
console.log('jscHelper: ', Date.now() - t0, 'ms');

var vueObj = new Vue({
    template: tplStr,
    data: {
        data: data
    }
});

var t1 = Date.now();

for(var i = 0; i < 10000; i++) {
    SSR.renderToString(vueObj, function(error, bodyStr) {
        if (error) {
            console.log('模板渲染错误');
        } else {
            htmlStr = bodyStr;
        }
    });
}

//console.log(htmlStr);
console.log('vue-server-render: ', Date.now() - t1, 'ms');
