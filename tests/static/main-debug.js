require.config({
    urlArgs: "v=" +  (new Date()).getTime(),
    baseUrl: "static",
    paths: {
    	"augment":		  		"bower_components/augment.js/augment",

        "knockout":		  		"bower_components/knockout/dist/knockout.debug",
        "knockout-mapping": 	"bower_components/knockout-mapping/knockout.mapping",
        "knockout-validation":  "bower_components/knockout-validation/dist/knockout.validation",
        "knockout-switch-case":  "bower_components/knockout-switch-case/knockout-switch-case",

        "domready": 	  		"bower_components/requirejs-domready/domReady",
        "text":           		"bower_components/requirejs-text/text",

        "signals":              "bower_components/js-signals/dist/signals",
        "hasher":               "bower_components/hasher/dist/js/hasher",
        "crossroads":           "bower_components/crossroads/dist/crossroads",

        "jquery" :              "bower_components/jquery/dist/jquery",
        "bootstrap":            "bower_components/bootstrap/dist/js/bootstrap",
        "bootstrap-notify":     "bower_components/bootstrap-notify/js/bootstrap-notify",        

        "blueshed":             "components/blueshed",
        
        'jszip':                'bower_components/jszip/jszip',
        'viz':                  'viz'
    },
    shim: {
        "bootstrap": {
            deps: ["jquery"]
        },
        "bootstrap-notify": {
            deps: ["bootstrap"]
        },
        "viz": {
          exports: "Viz"
        },
        "jszip": {
          exports: "JSZip"
        }
    },
    packages: [{
        name: "codemirror",
        location: "bower_components/codemirror",
        main: "lib/codemirror"
    }]
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
