
define(
    ["jquery","knockout"],

    function($,ko){
        'use strict';

       ko.bindingHandlers.numericValue = {
            init : function(element, valueAccessor, allBindingsAccessor) {
                var underlyingObservable = valueAccessor();
                var interceptor = ko.dependentObservable({
                    read: underlyingObservable,
                    write: function(value) {
                        if (!isNaN(value)) {
                            underlyingObservable(parseFloat(value));
                        }                
                    } 
                });
                ko.bindingHandlers.value.init(element, function() { return interceptor }, allBindingsAccessor);
            },  
            update : ko.bindingHandlers.value.update
        };
       
		ko.bindingHandlers.numericText = {
		    update: function(element, valueAccessor, allBindingsAccessor) {
		       var value = ko.utils.unwrapObservable(valueAccessor()) || 0;
		       var precision = ko.utils.unwrapObservable(allBindingsAccessor().precision);
		       if(precision === undefined){
		       	 precision = ko.bindingHandlers.numericText.defaultPrecision;
		       };
		       var formattedValue = value.toFixed(precision);
		        
		        ko.bindingHandlers.text.update(element, function() { return formattedValue; });
		    },
		    defaultPrecision: 1  
		};

        

        ko.extenders.numeric = function(target, precision) {
            //create a writable computed observable to intercept writes to our observable
            var result = ko.pureComputed({
                read: target,  //always return the original observables value
                write: function(newValue) {
                    var current = target(),
                        roundingMultiplier = Math.pow(10, precision),
                        newValueAsNum = isNaN(newValue) ? 0 : parseFloat(+newValue),
                        valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;
         
                    //only write if it changed
                    if (valueToWrite !== current) {
                        target(valueToWrite);
                    } else {
                        //if the rounded value is the same, but a different value was written, force a notification for the current field
                        if (newValue !== current) {
                            target.notifySubscribers(valueToWrite);
                        }
                    }
                }
            }).extend({ notify: 'always' });
         
            //initialize with current value to make sure it is rounded appropriately
            result(target());
         
            //return the new computed observable
            return result;
        };


    }

);