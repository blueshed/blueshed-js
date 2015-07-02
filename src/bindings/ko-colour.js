define(
	["jquery","knockout","bootstrap-colorselector"],

	function($,ko){
        'use strict';

	    // colorselector support
		var colorselector_ignore = false;
		
	    ko.bindingHandlers.colour = {
		    init: function(element, valueAccessor, allBindingsAccessor) { 
		    	$(element).colorselector({
		            callback: function (value, color, title) {
		            	colorselector_ignore = true;
				    	var ko_value = valueAccessor();
		            	ko_value(color);
		            	colorselector_ignore = false;
		            }
		        });
		    },
		    update: function(element, valueAccessor, allBindingsAccessor) {
		    	var ko_value = valueAccessor();
		    	var color = ko.unwrap(ko_value);
		    	if(colorselector_ignore === false){
		    		$(element).colorselector("setColor",color);	
		    	}
		    }
		};
		// end colorselector support

	}

);