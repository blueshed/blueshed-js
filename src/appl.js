define(["knockout",
		"knockout-validation",
		"./utils"],
	function(ko){
        'use strict';

		function Appl(){
			this.title = ko.observable("");
			this.error = ko.observable();
			this.loading = ko.observable();
			
			this.component = ko.observable();
			this.component_params = { appl: this };
    		
    		this._cache_ = {};
			this.init();
		}
		
		Appl.prototype.init = function(){};
		
		Appl.prototype.start = function(){
    		ko.applyBindings(this);
    	};
		
		Appl.prototype.get_cached = function(key,default_value){
			var value = this._cache_[key];
			if(!value){
				this._cache_[key] = default_value;
				return default_value;
			}
			return value;
		};

		return Appl;
	}
);