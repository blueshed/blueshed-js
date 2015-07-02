define([
	"jquery",
	"knockout",
	"bootstrap-notify"
	],	
	function($,ko){
		
		function notify(message, type, location, fade, duration){
			/*
		     * display an info message
		     * type: info, success, warning, error
		     */
			if($(".bottom-right").length == 0){
				$("body").
					append("<div class='notifications top-right'></div>").
					append("<div class='notifications bottom-right'></div>").
					append("<div class='notifications top-left'></div>").
					append("<div class='notifications bottom-left'></div>");
			}
			
			$(location || '.bottom-left').notify({
				type: type || 'info',
				message: { text: message },
				fadeOut: { enabled: fade || true, delay: duration || 2000 }
			}).show();
		}

		return notify;
	}
);