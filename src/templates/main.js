define(
	["knockout",
     "text!./blue-error-tmpl.html",
     "text!./blue-confirm-tmpl.html",
     "text!./blue-string-field-tmpl.html",
     "text!./blue-value-field-tmpl.html",
     "text!./blue-text-field-tmpl.html"],
	function(ko, 
			blue_error_tmpl,
            blue_confirm_tmpl,
			blue_string_field_tmpl,
			blue_value_field_tmpl,
			blue_text_field_tmpl){
		
        ko.components.register("blue-string-field",{
            template: blue_string_field_tmpl
        });
		
        ko.components.register("blue-value-field",{
            template: blue_value_field_tmpl
        });
		
        ko.components.register("blue-text-field",{
            template: blue_text_field_tmpl
        });

        ko.components.register("blue-error",{
            template: blue_error_tmpl
        });

        ko.components.register("blue-confirm",{
            template: blue_confirm_tmpl
        });
    } 
);