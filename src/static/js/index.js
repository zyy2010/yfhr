$(function() {

    if(!token || token == '') {
        window.location.href = urlId + '/pages/login.html';
    }

    // 默认初始化不显示模态框，点击空白处不关闭模态框
    $('#infoPorp, #changePassword, #signOutPopup').modal({
        backdrop: 'static',
        show: false
    });

    var menuLeft = document.getElementById( 'cbp-spmenu-s1' ),
        showLeftPush = document.getElementById( 'showLeftPush' ),
        body = document.body;
        
    showLeftPush.onclick = function() {
        classie.toggle( this, 'active' );
        classie.toggle( body, 'cbp-spmenu-push-left' );
        classie.toggle( menuLeft, 'cbp-spmenu-open' );
        disableOther( 'showLeftPush' );
    };
    function disableOther( button ) {
        if( button !== 'showLeftPush' ) {
            classie.toggle( showLeftPush, 'disabled' );
        }
    }

    //导航区域项目点击增加标签页处理
    //仅演示功能
    $('a',$('#side-menu')).on('click', function(e) {
        e.stopPropagation();
        var li = $(this).closest('li');
        var menuId = $(li).attr('mid');
        var url = $(li).attr('funurl');
        var title = $(this).text();
        //校验登录是否超时，通常使用ajax访问服务端测试登录是否超时
        //若页面端已有超时自动跳转的处理，则不需要设置该回调
        var checkLogin = function(){
            return true
        };
        $('#mainFrameTabs').bTabsAdd(menuId,title,url,checkLogin);
    });
    
    //插件的初始化
    $('#mainFrameTabs').bTabs({
        //登录界面URL，用于登录超时后的跳转
        'loginUrl' : 'http://xxx.com/login',
        //用于初始化主框架的宽度高度等，另外会在窗口尺寸发生改变的时候，也自动进行调整
        'resize' : function(){
            var waph=$(window).height()-77
            // // 这里只是个样例，具体的情况需要计算
            $('#mainFrameTabs').height(waph);
        }
    });

    // 个人信息事件
    $('#userInfo').on('mouseover', function() {
        $(this).children('.infoMenu').stop().slideDown();
    });
    $('#userInfo').on('mouseout', function() {
        $(this).children('.infoMenu').stop().slideUp();
    });

    // 我的信息
    $('#users').on('click', function() {
        $.ajax({
            type: 'GET',
            url: appId + '/userinfo',
            success: function(data) {
                if(data && data.code == 0) {
                    $('#infoPorp').modal('show');
                    for (var v in data.data) {
                        $('#infoPorp input[name="' + v + '"]').val(data.data[v]);
                        $('#infoPorp select[name="' + v + '"] option[value="'+data.data[v]+'"]').prop('selected',true);
                    }
                }else {
                    zq.error(data.msg);
                    dialogClose();
                }
            }
        });
    });

    // 修改密码保存
    $('#changePasswordBtn').on('click', function() {
        $('#changePasswordForm').bootstrapValidator('validate');
        if ($("#changePasswordForm").data('bootstrapValidator').isValid()) {
            var jsonData = $$.serializeToJson('#changePasswordForm', true);
            var oldpass = jsonData.oldpass,
                newPass = jsonData.newPass,
                surePass = jsonData.surePass;
            $.ajax({
                type: 'POST',
                url: appId + '/changePass',
                headers: {'token':token},
                data: {oldpass: sha256(oldpass), newPass: sha256(newPass), surePass: sha256(surePass)},
                success: function(data) {
                    if(data && data.code == 0) {
                        zq.success();
                    }else {
                        zq.error(data.msg);
                        dialogClose();
                    }
                    $('#changePassword').modal('hide');
                    // 清空表单
                    $('#changePassword').find('.has-feedback').removeClass('has-success').children('i').attr('class', 'form-control-feedback bv-no-label');
                    clearFrom('#changePassword');
                }
            });
        }
    });

    $('#changePasswordForm').bootstrapValidator({
        live: 'disabled',
        message: '输入的值无效',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            oldpass: {
                group: '.col-sm-6',
                validators: {
                    notEmpty: {
                        message: '旧密码不能为空'
                    }
                }
            },
            newPass: {
                group: '.col-sm-6',
                validators: {
                    notEmpty: {
                        message: '新密码不能为空'
                    }
                }
            },
            surePass: {
                group: '.col-sm-6',
                validators: {
                    notEmpty: {
                        message: '确认密码不能为空'
                    },
                    identical: {
                        field: 'newPass',
                        message: '用户新密码与确认密码不一致！'
                    },
                }
            }
        }
    }).on('success.form1.bv', function(e) {
        // console.log('success')
    }).on('error.form1.bv', function(e) {
        // console.log('error')
    });

    // 退出
    $('#signOutBtn').on('click', function() {
        $('#signOutPopup').modal('hide');
        $.ajax({
            type: 'GET',
            url: appId + '/loginout',
            beforeSend: function(request) {                
                request.setRequestHeader("token", token);
            },
            // headers: { 'token':token },
            success: function(data) {
                if(data && data.code == 0) {
                    var str = '<div id="boxbg"><div id="gooutlog"><img src="static/img/duihao.png"><div class="movbox"></div><p>退出成功</p></div></div>';
                    $('body').append(str);
                    localStorage.setItem('userInfo', '');
                    setTimeout(function() {
                        window.location.href = urlId + '/pages/login.html';
                    }, 1000);
                }else {
                    zq.error(data.msg);
                    dialogClose();
                }
            }
        });
    });

    // 关闭弹窗,清空表单
    $('#changePassword').on('click', '.close, .cancel', function() {
        clearFrom('#changePassword');
    });

});

// 关闭错误提示
function dialogClose() {
    $('.dialogClose, .dialog button').on('click', function() {
        $('.dialog').fadeOut(500);
    });       
}

function skiptabs(menuId,title,url,menuIdOld) {
    if(menuIdOld) {
        $('#mainFrameTabs').bTabsClose(menuIdOld);
    }
    $('#mainFrameTabs').bTabsAdd(menuId,title,url);
}

function parentMethod(menuId) {
    $('#mainFrameTabs').bTabsClose(menuId);
}

