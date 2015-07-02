define(["knockout",
		"./appl",
		"./routes",
		"./notify",
		"./dialog",
		"./templates/main",
		"knockout-validation"],
	function(ko, 
			 Appl, 
			 notify, 
			 dialog){

		Appl.prototype.init_routes = function(){
			this.routes = new Routes(this);
		};

		Appl.prototype.add_page = function(title,action,route,href,icon){
			return this.routes.add_to_service_menu({
				route:route,  // the name to pass to hasher
				title:title,  // the menu title
				href:href,    // the href for the menu item
				icon:icon,    // the fa icon to set in menu item
				action:action // the function to perform
			});
		};

		Appl.prototype.set_default_page = function(page){
			this.routes.set_default(page);
		};

		Appl.prototype.open_dialog = function(component,params){
			return dialog.open_dialog(component,params);
		};

		Appl.prototype.close_dialog = function(){
			return dialog.close_dialog();
		};

		Appl.prototype.confirm = function(title,message,action,action_label,css) {
			return dialog.confirm(title,message,action,action_label,css);
		};

		Appl.prototype.notify = function(message, type, location, fade, duration){
			return notify(message, type, location, fade, duration);
		};

	return Appl;
});