define(
    ["jquery","knockout"],
    function($,ko){

        var utils = {};

        utils.orientation = function(appl){

	        var isiPad = navigator.userAgent.match(/iPad/i) != null;
            appl.window_width = ko.observable($(window).width());
            appl.window_height = ko.observable($(window).height());

	        function checkorientation(){
	            var orientationLabel = null;
                appl.window_width($(window).width());
                appl.window_height($(window).height());
                if(window.orientation === undefined){
                    if(appl.window_width() > appl.window_height()){
                        appl.orientation("landscape");
                    } else {
                        appl.orientation("portrait");
                    }
                } else {
    	            if(window.orientation === 0){
    	                appl.orientation("portrait");
    	            } else {
    	                appl.orientation("landscape");
    	            }
                }
	            $(window).scrollTop(0);
	        };
	        $(window).on("orientationchange", checkorientation);
	        $(window).on("resize", checkorientation);
	        checkorientation();

        };

         /*
        *   @param      string      parameter to return the value of.
        *   @return     string      value of chosen parameter, if found.
        */
        utils.get_param = function(return_this)
        {
            return_this = return_this.replace(/\?/ig, "").replace(/=/ig, ""); // Globally replace illegal chars.

            var url = window.location.href;                                   // Get the URL.
            var parameters = url.substring(url.indexOf("?") + 1).split("&");  // Split by "param=value".
            var params = [];                                                  // Array to store individual values.

            for(var i = 0; i < parameters.length; i++)
                if(parameters[i].search(return_this + "=") != -1)
                    return parameters[i].substring(parameters[i].indexOf("=") + 1).split("+");

            return null;
        }

        return utils;
    }
);