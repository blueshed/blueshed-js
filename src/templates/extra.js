define(
	["knockout",
     "text!./blue-date-field-tmpl.html",
     "text!./blue-colour-field-tmpl.html",
     "text!./blue-select2-field-tmpl.html",
     "text!./blue-select2-cell-tmpl.html",
     "../bindings/ko-colour",
     "../bindings/ko-datetimepicker",
     "bootstrap-datetimepicker",
     "select2"],
	function(ko, 
			blue_date_tmpl, blue_colour_tmpl, 
            blue_select2_field,blue_select2_cell){
		
		ko.components.register("blue-date-field",{
            template: blue_date_tmpl
        });

        ko.components.register("blue-colour-field",{
            template: blue_colour_tmpl
        });

        ko.components.register("blue-select2-field",{
            template: blue_select2_field
        });

        ko.components.register("blue-select2-cell",{
            template: blue_select2_cell
        });
    } 
);