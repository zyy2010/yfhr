$(function() {
    
    // 默认初始化不显示模态框，点击空白处不关闭模态框
    $('#employeeChange, #regular, #employeeQuit').modal({
        backdrop: 'static',
        show: false
    });
    initData();

    // 查询
    $('#search').on('click', function() {
        initData();
    });

    // 重置
    $('#reset').on('click', function() {
        setTimeout(function() {
            initData();
        }, 100);
    });

    // 员工入职
    $('#entryBtn').on('click', function() {
        parent.parentMethod('bTabs_tab2')
        parent.skiptabs('tab2','员工入职','pages/activities/employeeEntry.html');
    });

    //员工异动
    $('#employeeChangeBtn').on('click', function() {
        var getSelection= $('#table').bootstrapTable('getSelections');
        if(getSelection.length < 1) {
            zq.error('至少选中一条数据');
            dialogClose();
        }else if (getSelection.length > 1) {
            zq.error('只能选中一条数据');
            dialogClose();
        }else {
            if(getSelection[0].status == '离职') {
                zq.error('该员工已离职，不能异动！');
                dialogClose();
                return false;
            }
            $("#employeeChange").modal("show");
            // 获取公司名称
            getCompanyName('company', '#newCompanyName');
            // 获取所属部门
            getCompanyName('depart', '#newDepartName');
            // 获取员工级别
            getStation('stationLevel', '#newStationLevel');
            // 获取岗位名称
            getStation('stationName', '#newStationName');
            for(var v in getSelection[0]) {
                $("#employeeChange .top input[name='"+v+"']").val(getSelection[0][v]);
                $("#employeeChange .bottom input[name='employeeId']").val(getSelection[0].employeeId);
            }
        }
    });

    // 员工异动保存
    $('#changeBtn').on('click', function() {
        var formChage = $$.serializeToJson('#form-change', true);
        $.ajax({
            type: 'POST',
            url: appId + '/employee/change',
            contentType: 'application/json',
            headers: {'token':token},
            data: JSON.stringify(formChage),
            success: function(data) {
                if(data && data.code == 0) {
                    $('#table').bootstrapTable(
                        'refresh',
                        {
                            url:appId + '/employee/list'
                        }
                    );
                    zq.success()
                }else {
                    zq.error(data.msg);
                    dialogClose();
                }
            }
        });
        $('#employeeChange').modal('hide');
        // 清空表单
        clearFrom('#employeeChange');
    });

    // 员工转正保存
    $('#regularBtn').on('click', function() {
        var val = $('#regular').find('input[name="actualRegularTime"]').val();
        if(!val) {
            $('#regular').find('.errorTips').css('display', 'block');
            return false;
        }

        $('#regular').modal('hide');

        var params = $$.serializeToJson('#formRegular', true);
        $.ajax({
            type: 'POST',
            url: appId + '/employee/regular',
            contentType: 'application/json',
            headers: {'token':token},
            data: JSON.stringify(params),
            success: function(data) {
                if(data && data.code == 0) {
                    $('#table').bootstrapTable(
                        'refresh',
                        {
                            url:appId + '/employee/list'
                        }
                    );
                    zq.success()
                }else {
                    zq.error(data.msg);
                    dialogClose();
                }
            }
        });
        // 清空表单
        clearFrom('#formRegular');
    });

    // 实际转正日期失去焦点隐藏提示
    /* $('#regular').find('input[name="actualRegularTime"]').on('blur', function() {
        var val = $('#regular').find('input[name="actualRegularTime"]').val();
        var errorTips = $('#regular').find('.errorTips');
        if(!val) {
            console.log(1)
            errorTips.css('display', 'block');
        }else {
            console.log(2)
            errorTips.css('display', 'none');
        }
    }); */

    // 验证员工异动表单
    $('#form-change').bootstrapValidator({
        live: 'enabled',
        message: '输入的值无效',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            newCompanyName: {
                group: '.input-group',
                validators: {
                    notEmpty: {
                        message: '公司名称不能为空'
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
            newDepartName: {
                group: '.input-group',
                validators: {
                    notEmpty: {
                        message: '所属部门不能为空'
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
            }
        }
    });

    // 员工离职保存
    $('#quitBtn').on('click', function() {
        $('#employeeQuit').modal('hide');

        var params = $$.serializeToJson('#formLeave', true);
        $.ajax({
            type: 'POST',
            url: appId + '/employee/leave',
            contentType: 'application/json',
            headers: {'token':token},
            data: JSON.stringify(params),
            success: function(data) {
                if(data && data.code == 0) {
                    $('#table').bootstrapTable(  
                        "refresh",  
                        {  
                            url:appId + '/employee/list'
                        }  
                    );
                    zq.success();
                }else {
                    zq.error(data.msg);
                    dialogClose();
                }
            }
        });
        // 清空表单
        clearFrom('#employeeQuit');
    });

    // 导出
    $('#export').on('click', function() {
        var jsonData = $$.serializeToJson("#formHeader", true);
        var login_name = encodeURIComponent(token); 
        window.location.href = appId + '/employee/export?exportName=employee&token=' + login_name + '&' + $.param(jsonData);
    });

    // 关闭弹窗,清空表单
    $(document).on('click', '.close, .cancel', function() {
        clearFrom('#employeeChange');
        clearFrom('#regular');
        clearFrom('#employeeQuit');
    });
    
});

function initData() {
    var jsonData = $$.serializeToJson('#formHeader', true);
    $('.panel-body').height($('body').height() - $('.panel-heading').outerHeight() - 32);

    $("#table").bootstrapTable('destroy');

    $('#table').bootstrapTable({
        url: appId + '/employee/list', // 获取表格数据的url
        method: 'GET', // 请求方式
        cache: false, // 设置为false禁用ajax数据缓存， 默认为true
        striped: true, // 表格显示条纹，默认为false
        pagination: true, // 在表格底部显示分页组件，默认为false
        pageList: [10, 20], // 设置页面可以显示的数据条数
        pageSize: 10, // 页面数据条数
        pageNumber: 1, // 首页页码
        sidePagination: 'server', // 设置为服务器端分页
        checkboxHeader: false,
        showRefresh: true,// 是否可刷新
        showColumns: true, // 是否显示内容列下拉框。
        ajaxOptions:{
            headers: {"token": token}
        },
        queryParams: function(params) { // 请求服务器数据时发送的参数，可以在这里添加额外的查询参数，返回false则终止请求
            jsonData.pageSize = params.limit;// 每页要显示的数据条数
            jsonData.pageNum = (params.offset / params.limit) + 1;// 每页显示数据的开始行号
            return jsonData; 
        },
        sortName: 'id', // 要排序的字段
        sortOrder: 'desc', // 排序规则
        fixedColumns: true,
        fixedNumber: 4,// 固定列数
        clickToSelect: true,
        columns: [
            {
                field: 'state',
                checkbox: true, // 显示一个勾选框
                align: 'center', // 居中显示
                formatter: function(value, row, index) {
                    // console.log(row)
                    if (row.state == true){
                        return {
                            checked : true,//设置选中
                        };
                    }
                    return value;
                    // return '<input data-index="'+index+'" type="checkbox" onchange="handle4Checked(\'' + row.employeeId + '\', this)" name="btSelectItem"/>'
                }
            },{
                title: "操作",
                align: 'center',
                valign: 'middle',
                width: 200, // 定义列的宽度，单位为像素px
                formatter: function (value, row, index) {
                    return '<button class="btn btn-default btn-xs" data-toggle="modal" data-target="#myModal" onclick="handle4Detail(\'' + row.employeeId + '\')">详情</button>' + 
                    '<button class="btn btn-default btn-xs '+ (row.status == '离职' ? "gray" : "" ) +'" data-toggle="modal" onclick="handle4Edit(\'' + row.employeeId + '\')" '+(row.status == '离职' ? "disabled=\"disabled\"" : "" )+'>编辑</button>'+
                    '<button class="btn btn-default btn-xs '+ (row.status == '离职' || row.onLineStatus == '已转正' ? "gray" : "" ) +'" data-toggle="modal" data-target="#regular" onclick="handle4Regular(\''+ row.employeeId +'\', \''+ row.employeeNo +'\', \''+ row.name +'\', \''+ row.expectRegularTime +'\')" '+(row.status == '离职' || row.onLineStatus == '已转正' ? "disabled=\"disabled\"" : "" )+'>转正</button>'+
                    '<button class="btn btn-default btn-xs '+ (row.status == '离职' ? "gray" : "" ) +'" data-toggle="modal" data-target="#employeeQuit" onclick="handle4Leave(\''+ row.employeeId +'\', \''+ row.employeeNo +'\', \''+ row.name +'\')" '+(row.status == '离职' ? "disabled=\"disabled\"" : "" )+'>离职</button>';
                }
            }, {
                field: 'companyName',
                title: '公司名称',
                align: 'center',
                valign: 'middle',
                width: 200,
                clickToSelect: true
            }, {
                field: 'employeeNo', // 返回json数据中的name
                title: '员工编号', // 表格表头显示文字
                align: 'center', // 左右居中
                valign: 'middle',// 上下居中
                width: 100,
                // visible:false//隐藏
            }, {
                field: 'name',
                title: '员工姓名',
                align: 'center',
                valign: 'middle',
                width: 120
            }, {
                field: 'phone',
                title: '员工手机号',
                align: 'center',
                valign: 'middle',
                width: 150
            }, {
                field: 'entryTime',
                title: '入职日期',
                align: 'center',
                valign: 'middle',
                width: 150
            }, {
                field: 'status',
                title: '员工状态',
                align: 'center',
                valign: 'middle',
                width: 100
            }, {
                field: 'onLineStatus',
                title: '在职状态',
                align: 'center',
                valign: 'middle',
                width: 100
            }, {
                field: 'expectRegularTime',
                title: '预计转正日期',
                align: 'center',
                valign: 'middle',
                width: 150
            }, {
                field: 'actualRegularTime',
                title: '实际转正日期',
                align: 'center',
                valign: 'middle',
                width: 150
            }, {
                field: 'identityNo',
                title: '身份证号',
                align: 'center',
                valign: 'middle',
                width: 150
            }, {
                field: 'sex',
                title: '性别',
                align: 'center',
                valign: 'middle',
                width: 80
            }, {
                field: 'nation',
                title: '民族',
                align: 'center',
                valign: 'middle',
                width: 80
            }, {
                field: 'education',
                title: '学历',
                align: 'center',
                valign: 'middle',
                width: 80
            }, {
                field: 'maritalStatus',
                title: '婚姻状况',
                align: 'center',
                valign: 'middle',
                width: 80
            }, {
                field: 'height',
                title: '身高',
                align: 'center',
                valign: 'middle',
                width: 80
            }, {
                field: 'weight',
                title: '体重',
                align: 'center',
                valign: 'middle',
                width: 80
            }, {
                field: 'university',
                title: '毕业院校',
                align: 'center',
                valign: 'middle',
                width: 180
            }, {
                field: 'major',
                title: '主修专业',
                align: 'center',
                valign: 'middle',
                width: 150
            }, {
                field: 'salary',
                title: '期望薪资(元)',
                align: 'center',
                valign: 'middle',
                width: 100
            }, {
                field: 'drivingLicense',
                title: '驾照',
                align: 'center',
                valign: 'middle',
                width: 80
            }, {
                field: 'outlook',
                title: '政治面貌',
                align: 'center',
                valign: 'middle',
                width: 80
            }, {
                field: 'placeOrigin',
                title: '籍贯',
                align: 'center',
                valign: 'middle',
                width: 120
            }, {
                field: 'redidenceType',
                title: '户口类别',
                align: 'center',
                valign: 'middle',
                width: 80
            }, {
                field: 'email',
                title: '电子邮箱',
                align: 'center',
                valign: 'middle',
                width: 150
            }, {
                field: 'tempLand',
                title: '暂住地',
                align: 'center',
                valign: 'middle',
                width: 200
            }, {
                field: 'departName',
                title: '所属部门',
                align: 'center',
                valign: 'middle',
                width: 150
            }, {
                field: 'directLeader',
                title: '直接领导',
                align: 'center',
                valign: 'middle',
                width: 100
            }, {
                field: 'stationLevel',
                title: '职位级别',
                align: 'center',
                valign: 'middle',
                width: 80
            }, {
                field: 'pactNo',
                title: '合同编号',
                align: 'center',
                valign: 'middle',
                width: 100
            }, {
                field: 'startTime',
                title: '合同期限(起)',
                align: 'center',
                valign: 'middle',
                width: 150
            }, {
                field: 'endTime',
                title: '合同期限(止)',
                align: 'center',
                valign: 'middle',
                width: 150
            }, {
                field: 'urgentMan',
                title: '紧急联系人姓名',
                align: 'center',
                valign: 'middle',
                width: 120
            }, {
                field: 'urgentRelationship',
                title: '紧急联系人关系',
                align: 'center',
                valign: 'middle',
                width: 120
            }, {
                field: 'urgentWay',
                title: '紧急联系人联系方式',
                align: 'center',
                valign: 'middle',
                width: 150
            }, {
                field: 'recruitChannel',
                title: '招聘渠道',
                align: 'center',
                valign: 'middle',
                width: 100
            }, {
                field: 'recommend',
                title: '推荐人员',
                align: 'center',
                valign: 'middle',
                width: 100
            }, {
                field: 'identityInvidTime',
                title: '身份证有效期',
                align: 'center',
                valign: 'middle',
                width: 120
            }, {
                field: 'hobby',
                title: '兴趣爱好',
                align: 'center',
                valign: 'middle',
                width: 150
            }, {
                field: 'moneyEndTime',
                title: '工薪截止日',
                align: 'center',
                valign: 'middle',
                width: 100
            }, {
                field: 'isFresh',
                title: '应届毕业生',
                align: 'center',
                valign: 'middle',
                width: 100
            }, {
                field: 'isBack',
                title: '储备人才',
                align: 'center',
                valign: 'middle',
                width: 100
            }, {
                field: 'workStartTime',
                title: '计工龄开始日期',
                align: 'center',
                valign: 'middle',
                width: 120
            }, {
                field: 'boonAddress',
                title: '福利缴纳地',
                align: 'center',
                valign: 'middle',
                width: 150
            }, {
                field: 'remark',
                title: '入职备注',
                align: 'center',
                valign: 'middle',
                width: 200
            }, {
                field: 'leaveType',
                title: '离职类型',
                align: 'center',
                valign: 'middle',
                width: 200
            }, {
                field: 'leaveReason',
                title: '离职原因',
                align: 'center',
                valign: 'middle',
                width: 200
            }, {
                field: 'changeReason',
                title: '异动原因',
                align: 'center',
                valign: 'middle',
                width: 200
            }, {
                field: 'creator',
                title: '创建人',
                align: 'center',
                valign: 'middle',
                width: 100
            }, {
                field: 'createTime',
                title: '创建时间',
                align: 'center',
                valign: 'middle',
                width: 150
            }, {
                field: 'updator',
                title: '修改人',
                align: 'center',
                valign: 'middle',
                width: 100
            }, {
                field: 'updateTime',
                title: '修改时间',
                align: 'center',
                valign: 'middle',
                width: 150
            }
        ],
        onLoadSuccess: function(){  //加载成功时执行
            // console.log("加载成功");
        },
        onLoadError: function(){  //加载失败时执行
            // console.info("加载数据失败");
        }
    });

}

// 复选框事件
function handle4Checked(id, _this) {
    var isChecked = $(_this).attr('checked');
    if(!isChecked) {
        $(_this).attr('checked', 'checked');
    }else {
        $(_this).removeAttr('checked')
    }
}

// 详情
function handle4Detail(id) {
    parent.parentMethod('bTabs_tab4');
    parent.skiptabs('tab4','员工详情','pages/activities/employeeEntry.html?employeeId=' + id + '&details=details');
}

// 编辑
function handle4Edit(id) {
    // parent.skiptabs('tab5','员工编辑','pages/activities/employeeEntry.html?employeeId=' + id, 'bTabs_tab3');
    parent.parentMethod('bTabs_tab5');
    parent.skiptabs('tab5','员工编辑','pages/activities/employeeEntry.html?employeeId=' + id);
}

// 员工转正
function handle4Regular(employeeId, employeeNo, name, time) {
    $('#formRegular').find('input[name="employeeId"]').val(employeeId);
    $('#formRegular').find('input[name="employeeNo"]').val(employeeNo);
    $('#formRegular').find('input[name="name"]').val(name);
    $('#formRegular').find('input[name="expectRegularTime"]').val(time != 'null' ? time : '');
}

// 员工离职
function handle4Leave(employeeId, employeeNo, name) {
    $('#formLeave').find('input[name="employeeId"]').val(employeeId);
    $('#formLeave').find('input[name="employeeNo"]').val(employeeNo);
    $('#formLeave').find('input[name="name"]').val(name);
}

// 关闭错误提示
function dialogClose() {
    $('.dialogClose, .dialog button').on('click', function() {
        $('.dialog').fadeOut(500);
    });       
}

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


