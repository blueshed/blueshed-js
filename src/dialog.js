define([
	"jquery",
	"knockout",
	"./templates/main",
	"bootstrap"
	],	
	function($,ko){

    	function Appl(){}

		Appl.prototype.open_dialog = function(component,params){
			if($('#modal-dialog').length==0){
				$("body").append('<div id="modal-dialog" class="modal fade"></div>');
			}
			var dlog = $('#modal-dialog').empty();
			var div = $("<div>").appendTo(dlog);
			div.attr('data-bind',"component:{name:'"+component+"',params:$data}");
			dlog.modal("show");
			ko.applyBindingsWithValidation(params, div[0]);
			return dlog;
		};

		
		Appl.prototype.close_dialog = function(){
			$(".modal .close").click();
		};

		
		Appl.prototype.confirm = function(title,message,action,action_label,css){
			this.open_dialog("blue-confirm",{
				title: title,
				message: message,
				header_css: css ? "bg-" + css : {},
				action_css: css ? "btn-" + css : "btn-default",
				action_label: action_label || "OK",
				action: action
			});
		};
	
		return new Appl();
	}
);