
var zq = {}
zq.error = function(content) {
    var html = $('<div class="dialog dialogError"><div><a href="javascript:;" class="dialogClose">x</a><h4 class="error">错误</h4><p class="content">'+content+'</p><button>取消</button><button class="sure">确定</button></div></div>');
    html.appendTo('body');
};

zq.success = function() {
    var html = $('<div class="dialog"><div class="successdialog"><img id="animationPic" src="" /></div></div>');
    html.appendTo('body');
    $('#animationPic').attr('src', '../../static/img/success.gif')
    setTimeout(function(){
        $('#animationPic').attr('src', '')
		html.remove();
	},2000)
}

//url查询
zq.request = (function (str, castBoolean) {
    var result = {}, split;
    str = str && str.toString ? str.toString() : '';
    var arr = str.replace(/^.*?\?/, '').split('&'), p;
    for (var i = 0; p = arr[i]; i++) {
        split = p.split('=');
        if (split.length !== 2) continue;
        setParamsObject(result, split[0], decodeURIComponent(split[1]), castBoolean);
    }
    return result;
})(window.location, false);

function setParamsObject(obj, param, value, castBoolean) {
    var reg = /^(.+?)(\[.*\])$/, paramIsArray, match, allKeys, key, k;
    if (match = param.match(reg)) {
        key = match[1];
        allKeys = match[2].replace(/^\[|\]$/g, '').split('][');
        for (var i = 0; k = allKeys[i]; i++) {
            paramIsArray = !k || k.match(/^\d+$/);
            if (!key && isArray(obj)) key = obj.length;
            if (!hasOwnProperty(obj, key)) {
                obj[key] = paramIsArray ? [] : {};
            }
            obj = obj[key];
            key = k;
        }
        if (!key && paramIsArray) key = obj.length.toString();
        setParamsObject(obj, key, value, castBoolean);
    } else if (castBoolean && value === 'true') {
        obj[param] = true;
    } else if (castBoolean && value === 'false') {
        obj[param] = false;
    } else if (castBoolean && zq.validate.number(value)) {
        obj[param] = parseFloat(value, 10);
    } else {
        obj[param] = value;
    }
}
