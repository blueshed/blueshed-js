define(
    ["jquery","knockout"],

    function($,ko){
        'use strict';
        
        ko.pauseable = function(evaluatorFunction, evaluatorFunctionTarget) {
            var cachedValue = "";
            var isPaused = ko.observable(false);

            //the dependentObservable that we will return
            var result = ko.dependentObservable(function(value) {
            	if(arguments.length > 0){
            		return evaluatorFunction.call(evaluatorFunctionTarget,value);
            	}
                if (!isPaused()) {
                    //call the actual function that was passed in
                    return evaluatorFunction.call(evaluatorFunctionTarget);
                }
                return cachedValue;
            }, evaluatorFunctionTarget);

            //keep track of our current value and set the pause flag to release our actual subscriptions
            result.pause = function() {
                cachedValue = this();
                isPaused(true);
            }.bind(result);

            //clear the cached value and allow our dependentObservable to be re-evaluated
            result.resume = function() {
                cachedValue = "";
                isPaused(false);
            }

            return result;
        };
        
    }
);