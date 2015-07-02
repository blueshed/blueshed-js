define(["knockout",
		"text!./main-tmpl.html"],
	function(ko, main_tmpl){

		function Panel(params){
			this.appl = params.appl;
			this.message = params.message;
		}

		Panel.prototype.init = function(){};

		Panel.prototype.dispose = function(){};

		return {
			viewModel: Panel,
			template: main_tmpl
		};

});