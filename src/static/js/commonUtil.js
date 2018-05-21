var obj = {
    serializeToJson: function(selector, notEmptyField) {
    	var obj = {};
	    $.each( $(selector).serializeArray(), function(i,o){
			 var n = o.name, 
			 	v = $.trim(o.value);
	        if (!(notEmptyField && "" == v)) {
	        	obj[n] = (obj[n] === undefined) ? v: $.isArray(obj[n]) ? obj[n].concat(v): [obj[n], v];
	        }
	    });
	    return obj;
    },
    
};

var $$ = obj;

// 清空表单
function clearFrom(selector) {
	$(this).find("option").eq(0).prop("selected",true)
	$(':input', selector).not(':button, :submit, :reset, :hidden, input').find('option').eq(0).prop('selected', true);
	$(':input', selector).not(':button, :submit, :reset, :hidden, select').val('').removeAttr('checked').removeAttr('selected');
}
