define(["jquery","knockout","datatables"],function(jQuery,ko){

	ko.bindingHandlers.dataTable = {
        init: function(element, valueAccessor){
            var binding = ko.utils.unwrapObservable(valueAccessor());
            
            // If the binding is an object with an options field,
            // initialise the dataTable with those options. 
            if(binding.options){
            	if(binding.options.selected_row !== undefined){
            		binding.options.rowCallback = function( row, data ) {
                    	$(row).data('row-data',data);
                    };
            	}
                var oTable = jQuery(element).DataTable(binding.options);
                if(binding.options.selected_row !== undefined){
                	jQuery(element).delegate("tbody tr","click", function(e){
                		jQuery(element).find("tr").removeClass("selected");
                		jQuery(e.currentTarget).addClass("selected");
                		var data = jQuery(e.currentTarget).data('row-data');
                        binding.options.selected_row(data);
                	});
                }
            }
        },
        update: function(element, valueAccessor){
            var binding = ko.utils.unwrapObservable(valueAccessor());
            
            // If the binding isn't an object, turn it into one. 
            if(binding && binding.options && binding.options.data){
                var data = ko.unwrap(binding.options.data);
            	
                // Clear table
                jQuery(element).DataTable().clear();
                
                // Rebuild table from data source specified in binding
                jQuery(element).DataTable().rows.add(data);

                // update table
                jQuery(element).DataTable().draw();
            } else {
                // Clear table
                jQuery(element).DataTable().clear();
            	jQuery(element).DataTable().draw();
            }
            
        }
    };

});