define([
	"knockout",
	"crossroads",
	"hasher",
	"./menu/main"
	],	
	function(ko,crossroads,hasher, MenuBar){


		 ko.components.register("blue-menu-bar",MenuBar);


		function Routes(appl){
			this.appl = appl;
			this.title = ko.observable(appl.title());
			this.services_menu = ko.observableArray();
			this.menu_bar_left = ko.observableArray();
			this.menu_bar_right = ko.observableArray();
			
			this.current_menu = ko.observable();
			crossroads.bypassed.add(function(route){
				this.appl.error("<strong>404</strong> - Page not found - " + route);
			},this);
		}
		
		Routes.prototype.start = function() {
			//setup hasher
			function parseHash(newHash, oldHash){
			  	crossroads.parse(newHash);
			}
		
			hasher.initialized.add(parseHash); //parse initial hash
			hasher.changed.add(parseHash); //parse hash changes
			//hasher.changed.add(console.log, console); // log all hashes
			hasher.init(); //start listening for history change
		};

		Routes.prototype.set_default = function(menu_item){
			crossroads.addRoute("", function(){
				this.current_menu(menu_item);
				menu_item.action();
			}.bind(this));
		};

		Routes.prototype.add_route = function(menu_item){
			if(menu_item.route){
				crossroads.addRoute(menu_item.route, function(){
					this.current_menu(menu_item);
					menu_item.action.apply(this.appl,arguments);
				}.bind(this));
			}
		};

		Routes.prototype.add_to_service_menu = function(params) {
			params.current_menu = this.current_menu;
			this.services_menu.push(params);
			this.add_route(params);
	    	return params;
		};

		Routes.prototype.add_to_left_menu = function(params) {
			params.current_menu = this.current_menu;
			this.menu_bar_left.push(params);
			this.add_route(params);
	    	return params;
		};

		Routes.prototype.add_to_right_menu = function(params) {
			params.current_menu = this.current_menu;
			this.menu_bar_right.push(params);
			this.add_route(params);
	    	return params;
		};
		
		Routes.prototype.set_hash_silently = function(hash){
			hasher.changed.active = false; //disable changed signal
			hasher.setHash(hash); //set hash without dispatching changed signal
			hasher.changed.active = true; //re-enable signal
		};
		
		Routes.prototype.set_hash = function(hash){
			hasher.setHash(hash); //set hash
		};
	
		return Routes;
	}
);