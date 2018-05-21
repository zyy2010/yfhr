(function() {

    // 获取公司名称
    getCompanyName('company', '#companyName');
    // 获取所属部门
    getCompanyName('depart', '#departName');
    // 获取职位级别
    getStation('stationLevel', '#stationLevel');
    // 获取岗位名称
    getStation('stationName', '#stationName');

    if(zq.request['employeeId']) {
        if(zq.request['details']) {// 判断是详情点进来的
            $('#save').css('display', 'none');
            $('body').find('input, select').attr('disabled', 'disabled');
        }else {// 编辑点进来的，公司名称，部门，实际转正日期不可点击
            $('#actualRegularTime, #companyName, #departName').attr('disabled', 'disabled');
        }
        setTimeout(function() {
            getDetails();
        }, 200);
    }

    // 点击更多按钮
    var numPic = 0;
    $('#more').on('click', function() {
        var picArr = ['/static/img/toggle.png', '/static/img/toggled.png'];
        numPic++;
        numPic = numPic % 2;
        $(this).children('img').attr('src', picArr[numPic]);
        $('#moreInfo').stop().slideToggle();
    });

    // 上传图片
    $('#fileImg').on('change', function() {
        var file = this.files[0];
        var imageType = /^image\//;
        var reader = new window.FileReader();
        // 是否是图片
        if(!imageType.test(file.type)) {
            zq.error('请选择图片！');
            dialogClose();
            return false;
        }
        $('#save').attr('disabled', 'disabled');
        var login_name = encodeURIComponent(token);

        // 上传设置  
        var options = {  
            // 规定把请求发送到那个URL  
            url: appId + "/employee/upload?token=" + login_name,
            // 请求方式  
            type: "post",
            headers: {'token':token},
            // 服务器响应的数据类型  
            dataType: "json",  
            // 请求成功时执行的回调函数  
            success: function(data, status, xhr) {
                var file = data.data.file.file;
                var imgUrl = data.data.fileServerPath;
                // 图片显示地址
                $('#pic').attr('src', imgUrl + file).attr('data-src','true');
                $("#fileImg").attr("data-src", file);  
            }  
        };  
        $("#form1").ajaxSubmit(options);
        reader.onload = function(e) {
            $('#save').removeAttr('disabled');
        }
        reader.readAsDataURL(file);
    });

    // 删除图片
    $('.closePic').on('click', function() {
        $('#pic').attr('src', '../../static/img/file-bg.jpg').attr('data-src', 'false');
    });

    //身高 体重 期望薪资 保留两位小数
    $('#form1').on('blur', 'input[name="height"], input[name="weight"], input[name="salary"]', function() {
        var num = parseFloat($(this).val());
        if(!!num) {
            $(this).val(num.toFixed(2));
        }
    });

    // 招聘渠道判断是否是内部推荐
    $('#recruitChannel').on('change', function() {
        var val = $(this).children('option:selected').val();
        if(val == 'nbtj') {
            $('#recommend').show();
        }else {
            $('#recommend').hide();
        }
    });

    // 单选框
    $('#isBack, #isFresh').on('click', function() {
        var val = $(this).val();
        if(val == 0) {
            $(this).val('1');
        }else {
            $(this).val('0');
        }
    });

    // 取消
    $('#cancel').on('click', function() {
        if(zq.request['employeeId'] && zq.request['details']) {
            parent.parentMethod('bTabs_tab4');
        }else if(zq.request['employeeId']) {
            parent.parentMethod('bTabs_tab5');
        }else {
            parent.parentMethod('bTabs_tab2');
        }
    });

    // 保存
    $('#save').on('click', function() {
    
        $('#form1').bootstrapValidator('validate');

        // 判断日期是否填写
        var entryDateVal = isEntryDate();
        if(!entryDateVal) {
            return false;
        }

        // 判断合同期限(止)与合同期限(始)
        var endTime = $('#form2 input[name="endTime"]').val();
        var startTime = $('#form2 input[name="startTime"]').val();
        if(endTime !='' && startTime != '' && (endTime < startTime)) {
            zq.error('合同期限(止)不能小于合同期限(始)');
            dialogClose();
            return false;
        }

        if ($("#form1").data('bootstrapValidator').isValid()) {//获取验证结果，如果成功，执行下面代码  
            var employeeFamily = $('#moreInfo').find('.employeeFamily');
            var form3 = [];
            var form1 = $$.serializeToJson('#form1', true),
                form2 = $$.serializeToJson('#form2', true),
                form4 = $$.serializeToJson('#form4', true);
            var newform1 = $.extend(form1, form4);
            for(var i=0; i<employeeFamily.length; i++) {
                form3.push($$.serializeToJson(employeeFamily.eq(i).children('form'), true));
            }
            var jsonData = {};
            jsonData.employee = newform1;
            jsonData.employeePact = form2;
            jsonData.employeeFamily = form3;

            if($('#pic').attr('data-src') == 'true') {
                jsonData.employee.image = $('#fileImg').attr('data-src');
            }else {
                jsonData.employee.image = ' ';
            }
            
            if(zq.request['employeeId']) {// 如果是编辑进来的
                jsonData.employee.employeeId = $('#employeeId').val();
                jsonData.employee.companyName = $('#companyName option:selected').val();
                jsonData.employee.departName = $('#departName option:selected').val();
                jsonData.employeePact.actualRegularTime = $('#actualRegularTime').val();
                // console.log(jsonData);
                $.ajax({
                    type: 'PUT',
                    url: appId + '/employee/modify',
                    contentType: 'application/json',
                    headers: {'token':token},
                    data: JSON.stringify(jsonData),
                    success: function(data) {
                        if(data && data.code == 0) {
                            zq.success();
                            setTimeout(function() {
                                // 跳转页面
                                parent.parentMethod('bTabs_tab3');
                                parent.skiptabs('tab3','员工列表','pages/activities/employeeList.html', 'bTabs_tab5');
                            }, 2000);
                        }else {
                            zq.error(data.msg);
                            dialogClose();
                        }
                    }
                });
            }else {
                $.ajax({
                    type: 'POST',
                    url: appId + '/employee/add',
                    contentType: 'application/json',
                    headers: {'token':token},
                    data: JSON.stringify(jsonData),
                    success: function(data) {
                        if(data && data.code == 0) {
                            zq.success();
                            setTimeout(function() {
                                // 跳转页面
                                parent.parentMethod('bTabs_tab3');
                                parent.skiptabs('tab3','员工列表','pages/activities/employeeList.html', 'bTabs_tab2');
                            }, 2000);
                        }else {
                            zq.error(data.msg);
                            dialogClose();
                        }
                    }
                });
            }
        }
    });

    // 验证表单的规则
    $('#form1').bootstrapValidator({
        live: 'disabled',
        message: '输入的值无效',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            name: {
                group: '.input-group',
                validators: {
                    notEmpty: {
                        message: '姓名不能为空'
                    },
                    stringLength: {
                        min: 2,
                        max: 6,
                        message: '用户名长度在2-6个字符之间'
                    }
                }
            },
            phone: {
                group: '.input-group',
                validators: {
                    notEmpty: {
                        message: '手机号码不能为空'
                    },
                    stringlength:  {
                        min: 11,
                        max: 11,
                        message: '请输入11位手机号码'
                    },
                    regexp: {
                        regexp: /^1[0-9]\d{9}$/,
                        message: '请输入正确的手机号码'
                    }
                }
            },
            // entryTime: {
            //     group: '.input-group',
            //     validators: {
            //         notEmpty: {
            //             message: '入职日期不能为空'
            //         }
            //     }
            // },
            identityNo: {
                group: '.input-group',
                validators: {
                    regexp: {
                        regexp: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
                        message: '请输入正确的身份证号码'
                    }
                }
            },
            height: {
                group: '.input-group',
                validators: {
                    regexp: {
                        regexp: /^[\d\.]+$/,
                        message: '只能输入数字'
                    },
                }
            },
            weight: {
                group: '.input-group',
                validators: {
                    regexp: {
                        regexp: /^[\d\.]+$/,
                        message: '只能输入数字'
                    },
                }
            },
            salary: {
                group: '.input-group',
                validators: {
                    regexp: {
                        regexp: /^[\d\.]+$/,
                        message: '只能输入数字'
                    },
                }
            },
            email: {
                group: '.input-group',
                validators: {
                    emailAddress: {
                        message: '不是正确的email地址'  
                    }
                }
            },
            companyName: {
                group: '.input-group',
                validators: {
                    notEmpty: {
                        message: '请选择公司名称'
                    },
                    callback: {
                        message: '请选择公司名称',
                        callback: function(value, validator) {
                            if(value == 0) {
                                return false;
                            }else {
                                return true;
                            }
                        }
                    }
                }
            },
            departName: {
                group: '.input-group',
                validators: {
                    notEmpty: {
                        message: '请选择所属部门'
                    },
                    callback: {
                        message: '请选择所属部门',
                        callback: function(value, validator) {
                            if(value == 0) {
                                return false;
                            }else {
                                return true;
                            }
                        }
                    }
                }
            }
        }
    }).on('success.form1.bv', function(e) {
        // 验证成功
        e.preventDefault();
        // console.log('succss')
    });

    // 监控入职日期是否填写
    $('#entryTime').on('blur', function() {
        isEntryDate();
    });

    // 新增家庭关系
    $(document).on('click', '.plus', function() {
        // 可删除
        $('.minus').attr('disabled', false);
        // 克隆一份
        $('#moreInfo').find('.employeeFamily').eq(0).clone().appendTo($('#moreInfo').children('.box'))
        // 清空新增家庭关系内容
        clearFrom($('#moreInfo').find('.employeeFamily').eq(-1));
    });
    
    // 删除家庭关系
    $(document).on('click', '.minus', function() {
        
        var len = $('#moreInfo').find('.employeeFamily').length;
        if(len > 1) {
            $('#moreInfo').find('.employeeFamily').eq(-1).remove();
        }
        if(len <= 2) {
            $('.minus').attr('disabled', 'disabled');
        }
        
    });

})();

// 获取公司、部门下拉框信息
function getCompanyName(type, selector) {
    $.ajax({
        type: 'GET',
        headers: {'token':token},
        url: appId + '/organization/comboOrgan?type=' + type,
        success: function(data) {
            if(data && data.code == 0) {
                var str = '';
                var oData = data.data;
                str = '<option value="">请选择</option>'
                for(var i=0; i<oData.length; i++) {
                    str += '<option value="'+ oData[i].value +'">'+ oData[i].text +'</option>';
                }
                $(selector).html(str);
            }else {
                zq.error(data.msg);
                dialogClose();
            }
        }
    });
}

// 获取职位级别、岗位名称下拉框信息
function getStation(type, selector) {
    $.ajax({
        type: 'GET',
        headers: {'token':token},
        url: appId + '/datacode/search/' + type,
        success: function(data) {
            if(data && data.code == 0) {
                var str = '';
                var oData = data.data;
                str = '<option value="">请选择</option>'
                for(var i=0; i<oData.length; i++) {
                    str += '<option value="'+ oData[i].value +'">'+ oData[i].text +'</option>';
                }
                $(selector).html(str);
            }else {
                zq.error(data.msg);
                dialogClose();
            }
        }
    });
}

// 判断入职日期是否为空
function isEntryDate() {
    if(!$('#entryTime').val()) {
        $('#entryTime').siblings('small').css('display', 'block').parent('div').addClass('has-error');
        return false;
    }else {
        $('#entryTime').siblings('small').css('display', 'none').parent('div').removeClass('has-error');
        return true;
    }
}

// 上传图片
function getObjectURL(file) {  
    var url = null ;   
    // 下面函数执行的效果是一样的，只是需要针对不同的浏览器执行不同的 js 函数而已  
    if (window.createObjectURL!=undefined) { // basic  
        url = window.createObjectURL(file) ;  
    } else if (window.URL!=undefined) { // mozilla(firefox)  
        url = window.URL.createObjectURL(file) ;  
    } else if (window.webkitURL!=undefined) { // webkit or chrome  
        url = window.webkitURL.createObjectURL(file) ;  
    }  
    return url;  
} 

// 关闭错误提示
function dialogClose() {
    $('.dialogClose, .dialog button').on('click', function() {
        $('.dialog').fadeOut(500);
    });       
}

// 获取内容
function getDetails() {
    $.ajax({
        type: 'GET',
        headers: {'token':token},
        url: appId + '/employee/search/' + zq.request['employeeId'],
        contentType: 'application/json',
        success: function(data) {
            if(data && data.code == 0) {
                var employee = data.data.employee,
                    employeeFamily = data.data.employeeFamily,
                    employeePact = data.data.employeePact;
                $('#employeeNo').show().html('员工编号：' + employee.employeeNo);
                $('#employeeId').val(employee.employeeId);
                for(var v in employee) {
                    // console.log(v)
                    if(v == 'image') {
                        // 设置图片
                        if(employee.image != '' && employee.image != null) {
                            $('#pic').attr('src',employee.image).attr('data-src','true');
                        }else {
                            $('#pic').attr('src', '../../static/img/file-bg.jpg');
                        }
                    }else if(v == 'isBack' || v == 'isFresh') {
                        if(employee[v] == 1) {
                            $('#form4 input[name="'+v+'"]').attr('checked', 'checked');
                        }else {
                            $('#form4 input[name="'+v+'"]').removeAttr('checked');
                        }
                    }else {
                        $('#form1 input[name="'+v+'"]').val(employee[v]);
                    }
                    $('#form1 select[name="'+v+'"] option[value="'+employee[v]+'"]').attr('selected','selected');
                    $('#form4 input[name='+v+']').val(employee[v]);
                    $('#form4 select[name="'+v+'"] option[value="'+employee[v]+'"]').attr('selected','selected');
                }
                for(var v in employeePact) {
                    $('#form2 input[name='+v+']').val(employeePact[v]);
                }
                // 新增家庭关系
                for(var i=0; i<employeeFamily.length - 1; i++) {
                    $('#moreInfo').find('.employeeFamily').eq(0).clone().appendTo($('#moreInfo').children('.box'));
                }
                for(var i=0; i<employeeFamily.length; i++) {
                    for(var v in employeeFamily[i]) {
                        $('.employeeFamily').find('form').eq(i).find('input[name="'+v+'"]').val(employeeFamily[i][v]);
                        $('.employeeFamily').find('form').eq(i).find('select[name="'+v+'"] option[value="'+employeeFamily[i][v]+'"]').prop('selected',true);
                    }
                }

                
            }else {
                zq.error(data.msg);
                dialogClose();
            }
        }
    });
}

