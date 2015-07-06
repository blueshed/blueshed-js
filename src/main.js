define(["knockout",
		"./appl",
		"./routes",
		"./notify",
		"./dialog",
		"./templates/main",
		"knockout-validation"],
	function(ko, 
			 Appl,
			 Routes, 
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
    	
    	Appl.prototype.add_service_menu = function(label, component, route, icon, href){
    		return this.add_page(label,function(){
    			this.component_params.args=arguments;
        		this.component(component);
        	}.bind(this),route,href,icon);
    	};

		Appl.prototype.add_menu_left = function(label, component, route, icon, href){
			return this.routes.add_to_left_menu({
				route:route,  // the name to pass to hasher
				title:label,  // the menu title
				href:href,    // the href for the menu item
				icon:icon,    // the fa icon to set in menu item
				action: function(){
					this.component_params.args=arguments;
		        	this.component(component);
		        }.bind(this)
			});
		};

		Appl.prototype.add_menu_right = function(label, component, route, icon, href){
			return this.routes.add_to_right_menu({
				route:route,  // the name to pass to hasher
				title:label,  // the menu title
				href:href,    // the href for the menu item
				icon:icon,    // the fa icon to set in menu item
				action: function(){
					this.component_params.args=arguments;
		        	this.component(component);
		        }.bind(this)
			});
		};

		Appl.prototype.extend_path = function(values){
			var menu = this.routes.current_menu();
			if(menu && menu.route){
				var path = menu.href;
				if(values && values.length > 0){
					var extension = values.join("/");
					path = path + "/" + extension;
				}
				if(path.indexOf("#/") == 0){
					path = path.substring(2);
				}
				this.routes.set_hash_silently(path);
			}
		};
		
		Appl.prototype.content_height = function(delta){
			var height = $(window).height();
			if(delta){
				height = height + delta;
			}
			return height + "px";
		};

	return Appl;
});