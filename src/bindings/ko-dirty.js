define(
    ["jquery","knockout"],

    function($,ko){
        'use strict';


        ko.dirtyFlag = function(root, isInitiallyDirty, ratelimit) {
        	var to_json = function(){
        		if(root.to_json){
        			return ko.toJSON(root.to_json());
        		}
        		return ko.toJSON(root);
        	}
            var result = function() {},
                _initialState = ko.observable(to_json()),
                _isInitiallyDirty = ko.observable(isInitiallyDirty);
            
            if(ratelimit){
            	_initialState = _initialState.extend({
            		rateLimit:{
            			timeout:ratelimit,
            			method:'notifyWhenChangesStop'
            		}
            	});
            }
            
            result.isDirty = ko.pureComputed(function() {
                return _isInitiallyDirty() || _initialState() !== to_json();
            });
            
            result.reset = function() {
                _initialState(to_json());
                _isInitiallyDirty(false);
            };
            
            result.flush = function(){
            	_isInitiallyDirty(!_isInitiallyDirty());
            };

            return result;
        };
        
    }
);