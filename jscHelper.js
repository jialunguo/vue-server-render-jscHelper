var vueSSR = require('vue-server-renderer');

exports.renderVue = function(vm) {
    if(!global.renderCache) global.renderCache = {};

    var tplId = vm.tplId || vm.template;
    var renderFunc = global.renderCache[tplId];

    if(!renderFunc) {
        renderFunc = global.renderCache[tplId] = new Function('data', makeFunction(genEl(vueSSR.parse(vm.template), vm.data)));
    }

    return renderFunc(vm.data);
};

function makeFunction(code) {
    let str = 'var __p = [];';
    let jscReg = new RegExp(/(?:(?:\r\n|\r|\n)\s*?)?<%([=-]?)([\w\W\r\n]*?)%>(?:\r\n|\r|\n)?/gmi);
    let exec;
    let len;
    let eq;
    let jscode;

    //解析模板
    var index = 0;

    while(exec = jscReg.exec(code)){
        len = exec[0].length;

        if(index !== exec.index){
            str += ("__p.push('");
            str += (
                code
                    .slice(index,exec.index)
                    .replace(/\\/gmi,"\\\\")
                    .replace(/'/gmi,"\\'")
                    .replace(/[\s\t\n\r]+\/\/(?:[^\n\r]*)/gmi,"")
                    .replace(/\r\n|\r|\n/g,"\\n")
            );
            str += ("');\r\n");
        }

        index = exec.index + len;

        eq = exec[1];
        jscode = exec[2];

        if(eq){
            str += ('__p.push(');
            str += (jscode);
            str += (');\r\n');
        } else {
            str += (jscode);
        }
    }

    str += ("__p.push('");
    str += (
        code
            .slice(index)
            .replace(/\\/gmi,"\\\\")
            .replace(/'/gmi,"\\'")
            .replace(/[\s\t\n\r]+\/\/(?:[^\n\r]*)/gmi,"")
            .replace(/\r\n|\r|\n/g,"\\n")
    );
    str += ("');\r\n");

    str += ('\r\nreturn __p.join(\'\');\r\n');

    return str;
}

function genEl(el) {
    var code = '';

    if(el.type === 2) {
        return code += (el.text.replace(/\{\{/g, '<%=').replace(/}}/g, '%>') + '\n');
    }

    if(el.type === 3) {
        return code += ((el.text || '') + '\n');
    }

    if(el.for) {
        code += ('<%for(var ' + (el.iterator1 ? el.iterator1 : 'i') + ' in ' + el.for + ') {var ' + el.alias + ' = ' + el.for + '[' + (el.iterator1 ? el.iterator1 : 'i') + '];%>\n');
    }

    if(el.if) {
        code += '<%if(' + el.if + ') {%>'
    }

    if(el.tag !== 'template') {

        code += ('<' + el.tag);

        var staticStyle = el.attrsMap && el.attrsMap['style'] || '';
        var staticClass = el.staticClass || '';

        //---------attr----------
        var attrObj = el.attrsList || [];
        var attrArr = [];

        for (var i = 0; i < attrObj.length; i++) {
            var attr = attrObj[i];
            if (attr.name === 'style') continue;

            if(attr.name.match(/^(v-bind)?:(.+)/)) {
                attrArr.push(attr.name + '=<%=' + attr.value + '%>');
            } else if(!attr.name.match(/^(v-|@)/)) {
                attrArr.push(attr.name + '=' + attr.value);
            }
        }

        if (attrArr.length) {
            code += (' ' + attrArr.join(' ') + ' ');
        }
        //---------attr----------

        //---------directives--------
        var directivesObj = el.directives || [];
        var directivesArr = [];

        for (var i = 0; i < directivesObj.length; i++) {
            var dir = directivesObj[i];
            if (dir.name === 'show') {
                staticStyle = 'display: <%=' + dir.value + '? \'block\' : \'none\'%>;' + staticStyle;
                continue;
            }
            directivesArr.push(dir);
        }
        //---------directives--------

        //---------class---------
        if (el.classBinding || staticClass) {
            code += (' class="' + (el.classBinding ? '<%var cssMap = ' + el.classBinding + '; for(var i in cssMap){if(cssMap.hasOwnProperty(i) && cssMap[i]) {%><%=i + \' \'%><%}}%>' : '') + (staticClass ? staticClass.substring(1, staticClass.length - 1) : '') + '" ');
        }
        //---------class---------

        //---------style---------
        if (el.styleBinding || staticStyle) {
            code += (' style="' + (el.styleBinding ? '<%var cssMap = ' + el.styleBinding + '; for(var i in cssMap){if(cssMap.hasOwnProperty(i)) {%><%=i + \':\' + cssMap[i] + \';\'%><%}}%>' : '') + staticStyle + '" ');
        }
        //---------style---------

        code += ('>\n');
    }

    if(el.children && el.children.length) {
        for(let i = 0; i < el.children.length; i++) {
            code += genEl(el.children[i]);
        }
    }

    if(el.tag !== 'template') {
        code += ('</' + el.tag + '>\n');
    }

    if(el.if) {
        code += '<%}%>'
    }

    if(el.for) {
        code += ('<%}%>\n');
    }

    if(el.elseBlock) {
        code += ('<% else {%>\n') + genEl(el.elseBlock) + '<%}%>';
    }

    return code;
}
