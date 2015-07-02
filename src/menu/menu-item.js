define(["knockout",
		"text!./menu-item-tmpl.html"],
		function(ko, main_tmpl){

		function MenuItem(params){
			this.current_menu = params.current_menu;
			this.route = params.route;
			this.title = params.title;
			this.href = params.href ? params.href : (params.route ? "#/" + params.route: "#");
			this.icon = params.icon;
			this.action = params.action;

			this.is_current = ko.pureComputed(function(){
				return params == ko.unwrap(this.current_menu);
			},this);
		}

		MenuItem.prototype.init = function() {
			
		};

		MenuItem.prototype.dispose = function() {
			
		};

		return {
			viewModel: MenuItem,
			template: main_tmpl
		};
	}
);