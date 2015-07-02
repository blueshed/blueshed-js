define([
		"knockout",
		"text!./main-tmpl.html",
		"./menu-item"
	],
	function(ko, main_tmpl, MenuItem){

		 ko.components.register("blue-menu-item",MenuItem);

		function Menu(params){
			this.appl = params.appl;
		}

		Menu.prototype.init = function() {
			
		};

		Menu.prototype.dispose = function() {
			
		};

		return {
			template: main_tmpl,
			viewModel: Menu
		};
	}
);