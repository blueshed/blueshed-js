require.config({
    urlArgs: "v=" +  (new Date()).getTime(),
    baseUrl: "static",
    paths: {
    	"augment":		  		"bower_components/augment.js/augment",

        "knockout":		  		"bower_components/knockout/dist/knockout.debug",
        "knockout-mapping": 	"bower_components/knockout-mapping/knockout.mapping",
        "knockout-validation":  "bower_components/knockout-validation/dist/knockout.validation",

        "domready": 	  		"bower_components/requirejs-domready/domReady",
        "text":           		"bower_components/requirejs-text/text",

        "signals":              "bower_components/js-signals/dist/signals",
        "hasher":               "bower_components/hasher/dist/js/hasher",
        "crossroads":           "bower_components/crossroads/dist/crossroads",

        "jquery" :              "bower_components/jquery/dist/jquery",
        "bootstrap":            "bower_components/bootstrap/dist/js/bootstrap",
        "bootstrap-notify":     "bower_components/bootstrap-notify/js/bootstrap-notify",        

        "blueshed":             "components/blueshed"
    },
    shim: {
        "bootstrap": {
            deps: ["jquery"]
        },
        "bootstrap-notify": {
            deps: ["bootstrap"]
        },
    },
    packages:[]
});

require(
	["appl/main","domready!"], 
	function (Appl) {
        "use strict";

        var appl = window.appl = new Appl();
        
        appl.start();
        
    	return appl;
	}
);
