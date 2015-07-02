define(
	["jquery","knockout"],

	function($,ko){

		ko.bindingHandlers.enter = {
		  init: function(element, valueAccessor, allBindingsAccessor, viewModel) {

		    var value = ko.utils.unwrapObservable(valueAccessor());

		    $(element).keypress(function(e) {
		      if (e.which === 13) {
		    	  value(viewModel);
		      }
		    });
		  }
		};

	}

);