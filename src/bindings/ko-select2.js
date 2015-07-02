define(
	["jquery","knockout","select2"],

	function($,ko){
        'use strict';

	    // select2 support
	    ko.bindingHandlers.select2 = {
		    init: function(element, valueAccessor, allBindingsAccessor) {
		    	var allBindings = allBindingsAccessor();
		    	var update = true;
		        $(element).select2(valueAccessor());
		        $(element).on("change", function(evt){
		        	if(update == true){
		        		update = false;
		        		if(allBindings.select2Data){
		        			allBindings.select2Data($(element).select2("data"));
		        		}
		        		if(allBindings.select2Value){
		        			allBindings.select2Value(evt.val);
		        		}
		        		update = true;
		        	}
		        });

		        var subVal=null,subData=null;
		        if(allBindings.select2Data){
			        subData = allBindings.select2Data.subscribe(function(value){
			        	if(update == true){
			        		$(element).select2('data', value);
			        	}
			        });
			    }
			    if(allBindings.select2Value){
			        subVal = allBindings.select2Value.subscribe(function(value){
			        	if(update == true){
			        		$(element).select2('val', value);
			        	}
			        });
			    }

		        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
		            $(element).select2('destroy');
		            $(element).off("change");
		            if(subVal){
		            	subVal.dispose();
		            }
		            if(subData){
		            	subData.dispose();
		            }
		        });
		    },
		    update: function(element, valueAccessor, allBindingsAccessor) {
		        $(element).trigger('change');
		    }
		};
		// end select2 support

	}

);