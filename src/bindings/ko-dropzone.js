
define(["jquery","knockout","dropzone"], function($,ko,DropZone){
	ko.bindingHandlers.dropzone = {
        init: function(element, valueAccessor)
        {
            var value = ko.unwrap(valueAccessor());
 
            var options = {
                maxFileSize: 15,
                createImageThumbnails: false,
            };
 
            $.extend(options, value);
 
            $(element).addClass('dropzone').dropzone(options);
//            new Dropzone(element, options); // jshint ignore:line
        }
    };
});