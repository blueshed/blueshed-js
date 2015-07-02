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
                var oTable = jQuery(element).dataTable(binding.options);
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
            if(!binding.data){
            	return;
                binding = { data: valueAccessor() }
            }
            
            // Clear table
            jQuery(element).dataTable().fnClearTable();
            
            // Rebuild table from data source specified in binding
            jQuery(element).dataTable().fnAddData(binding.data);
        }
    };

});