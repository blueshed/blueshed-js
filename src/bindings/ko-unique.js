define(
	["jquery","knockout"],

	function($,ko){
		
		var counter = 0;
		var prefix = "gen_id_unique_";

		ko.bindingHandlers.genUniqueId = {
			    init: function(element, valueAccessor) {
			        var value = valueAccessor();
			        if(value){
			        	counter = counter + 1;
			        }
			        $(element).attr('id', prefix + counter);
			    }
			};

		ko.bindingHandlers.genUniqueHref = {
				    init: function(element, valueAccessor) {
				        var value = valueAccessor();
				        $(element).attr("href", "#" + value + prefix + counter);
				    }
				};

		ko.bindingHandlers.genUniqueChildId = {
				    init: function(element, valueAccessor) {
				        var value = valueAccessor();
				        $(element).attr("id", value + prefix + counter);
				    }
				};

	}

);