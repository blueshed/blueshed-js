define([
        "knockout",
        "./table"],
        function(ko,Table){
	
	function Schema(options){
		this.tables = ko.observableArray();
		if(options){
			this.update(options);
		}
	}
	
	Schema.prototype.update = function(options){
		this.tables.removeAll();
		options.map(function(item){
			this.tables.push(new Table(item));
		},this);
	};
	
	return Schema;
	
});