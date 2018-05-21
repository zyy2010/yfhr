$(function() {
    // 默认初始化不显示模态框，点击空白处不关闭模态框
    $('#myModalAdd, #myModalEdit').modal({
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

    // 点击新增获取上级组织
    $('#newAddBox').on('click', function() {
        $('#formAddInfo').find('.errorTips').css('display', 'none');
        getPcode('#addPcode');
    });
    
    // 新增保存
    $('#newAddBtn').on('click', function() {
        var isAddNameVal = isAddName('#formAddInfo');
        if(!isAddNameVal) {
            return false;
        }
        var params = $$.serializeToJson('#formAddInfo', true);
        $.ajax({
            type: 'POST',
            url: appId + '/organization/add',
            contentType : 'application/json',
            headers: {'token':token},
            data: JSON.stringify(params),
            success : function(data) {
                if(data && data.code == 0) {
                    $('#table').bootstrapTable(  
                        "refresh",  
                        {  
                            url:appId + '/organization/list'  
                        }  
                    );
                    $('#myModalAdd').modal('hide');
                    // 清空表单
                    clearFrom('#formAddInfo');
                }else {
                    zq.error(data.msg);
                    dialogClose();
                }
            }
        });
    });

    // 编辑保存
    $('#editBtn').on('click', function() {
        var isAddNameVal = isAddName('#formEdit');
        if(!isAddNameVal) {
            return false;
        }
        var params = $$.serializeToJson('#formEdit', true);
        $.ajax({
            type: 'PUT',
            url: appId + '/organization/modify',
            contentType : 'application/json',
            headers: {'token':token},
            data: JSON.stringify(params),
            success : function(data) {
                if(data && data.code == 0) {
                    $('#table').bootstrapTable(  
                        "refresh",  
                        {  
                            url:appId + '/organization/list'  
                        }  
                    );
                    $('#myModalEdit').modal('hide');
                    // 清空表单
                    clearFrom('#formAddInfo');
                    
                }else {
                    zq.error(data.msg);
                    dialogClose();
                }
            }
        });
    });

    // 导出
    $('#export').on('click', function() {
        var jsonData = $$.serializeToJson("#formHeader", true);
        var login_name = encodeURIComponent(token); 
        window.location.href = appId + '/organization/export?exportName=organization' + '&token=' + login_name + '&' + $.param(jsonData);
    });

    // 新增组织名称input事件
    $('#formAddInfo').find('input[field="name"]').on('input', function() {
        isAddName('#formAddInfo');
    });

    // 编辑组织名称input事件
    $('#myModalEdit').find('input[field="name"]').on('input', function() {
        isAddName('#myModalEdit');
    });

    // 关闭弹窗,清空表单
    $(document).on('click', '.close, .cancel', function() {
        clearFrom('#formAddInfo');
        clearFrom('#myModalEdit');
    });

});

// 关闭错误提示
function dialogClose() {
    $('.dialogClose, .dialog button').on('click', function() {
        $('.dialog').fadeOut(500);
    });       
}

// 判断新增组织名称是否为空
function isAddName(selector) {
    var name = $(selector).find('input[field="name"]').val();
    if(!name) {
        $(selector).find('.errorTips').css('display', 'block');
        return false;
    }else {
        $(selector).find('.errorTips').css('display', 'none');
        return true;
    }
}

// 编辑
function handle4Edit(id) {
    $('#formEdit').find('.errorTips').css('display', 'none');
    getPcode('#editPcode');
    $.ajax({
        type: 'GET',
        url: appId + '/organization/search/' + id,
        headers: {'token':token},
        success: function(data) {
            if(data && data.code == 0) {
                var oData = data.data;
                for(var s in oData) {
                    $('#formEdit').find('[field = ' + s + ']').val(oData[s]);
                }
            }else {
                zq.error(data.msg);
                dialogClose();
            }
        }
    });
}

// 获取上级组织
function getPcode(selector) {
    $.ajax({
        type: 'GET',
        url: appId + '/organization/comboOrgan',
        headers: {'token':token},
        success: function(data) {
            if(data && data.code == 0) {
                var str = '<option value="">请选择</option>';
                var oData = data.data;
                for(var i=0; i<oData.length; i++) {
                    str += '<option value="'+ oData[i].value +'">'+ oData[i].text +'</option>'
                }
                $(selector).html(str);
            }else {
                zq.error(data.msg);
                dialogClose();
            }
        }
    });
}

// 初始化表格
function initData(data) {

    var jsonData = $$.serializeToJson("#formHeader", true);
    $('.panel-body').height($('body').height() - $('.panel-heading').outerHeight() - 32);
    
    $("#table").bootstrapTable('destroy'); 

    $('#table').bootstrapTable({
        url: appId + '/organization/list', // 获取表格数据的url
        method: 'GET', // 请求方式
        cache: false, // 设置为false禁用ajax数据缓存， 默认为true
        striped: true, // 表格显示条纹，默认为false
        pagination: true, // 在表格底部显示分页组件，默认为false
        pageList: [10, 20], // 设置页面可以显示的数据条数
        pageSize: 10, // 页面数据条数
        pageNumber: 1, // 首页页码
        sidePagination: 'server', // 设置为服务器端分页
        checkboxHeader: false,
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
        columns: [
            // {
            //     checkbox: true, // 显示一个勾选框
            //     align: 'center' // 居中显示
            // }, 
            {
                title: "操作",
                align: 'center',
                valign: 'middle',
                width: 100, // 定义列的宽度，单位为像素px
                formatter: function (value, row, index) {
                    return '<button class="btn btn-primary btn-sm" data-toggle="modal" data-target="#myModalEdit" onclick="handle4Edit(\'' + row.id + '\')">编辑</button>';
                }
            }, {
                field: 'code', // 返回json数据中的name
                title: '组织编号', // 表格表头显示文字
                align: 'center', // 左右居中
                valign: 'middle' ,// 上下居中
                width: 120,
                // sortable : true,
                // sortOrder: "asc",
                // visible:false//隐藏
            }, {
                field: 'name',
                title: '组织名称',
                align: 'center',
                valign: 'middle'
            }, {
                field: 'type',
                title: '组织类型',
                align: 'center',
                valign: 'middle'
            }, {
                field: 'pname',
                title: '上级组织名称',
                align: 'center',
                valign: 'middle'
            }, {
                field: 'master',
                title: '组织负责人',
                align: 'center',
                valign: 'middle'
            }, {
                field: 'siteAddress',
                title: '组织地址',
                align: 'center',
                valign: 'middle'
            }, {
                field: 'creator',
                title: '创建人',
                align: 'center',
                valign: 'middle'
            }, {
                field: 'createTime',
                title: '创建时间',
                align: 'center',
                valign: 'middle'
            }, {
                field: 'updateTime',
                title: '修改时间',
                align: 'center',
                valign: 'middle'
            }
        ],
        onLoadSuccess: function(){  //加载成功时执行
            // console.info("加载成功");
        },
        onLoadError: function(){  //加载失败时执行
            // console.info("加载数据失败");
        }
    });
}
