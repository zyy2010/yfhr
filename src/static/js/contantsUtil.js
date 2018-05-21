/**
 * 一些常量的通用设置
 */
var appId = 'http://192.168.1.225:8082/hr';

var urlId = 'http://192.168.2.70:8082';

if(localStorage.getItem('userInfo')) {
    var userInfo = JSON.parse(localStorage.getItem('userInfo'));
    var token = userInfo.token;
}
// ajax请求的统一处理
$(function() {
    $.ajaxSetup({
        cache : false,
        // 添加token信息
        beforeSend:function(xhr) {
            xhr.setRequestHeader("token", token);
        },
        // 判断token，权限,请求是否成功...
        complete: function(req, status) {
            if (req.readyState == 4 && req.status == 200) {
                try {
                    var reqObj = JSON.parse(req.responseText);
                   // token为空,token错误，token失效
                   if (reqObj.code == 6666 || reqObj.code == 6667 || reqObj.code == 6668) {
                    window.location.href = urlId + '/pages/login.html';
                   }
                } catch(e) {}
            } else {
                console.log("AJAX请求出错了");
            }
            
        }  
    });
});

