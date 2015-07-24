define([
		"knockout",
		"text!./main-tmpl.html",
	    "blueshed/notify",
	    "../model/defaults",
	    "../model/schema",
		"../components",
		"blueshed/bindings/ko-datatables",
		"datatables-bs3"
	],
	function(ko, main_tmpl, Notify, defaults, Schema){

		function Panel(appl){
			window.spanel = this;
			this.appl = appl;
			this.default_types = defaults.DEFAULT_TYPES;
			
			this.schemas = ko.observableArray();
			this.selected_schema = ko.observable();
			this.schema = ko.observable();
			this.selected_table = ko.observable();
			this.table_data = ko.observable();

			this.selected_schema.subscribe(this.load_schema,this);
			this.selected_table.subscribe(this.load_data,this);
			

			this.types = ko.pureComputed(function(){
				if(this.schema()){
					return this.schema().tables().map(function(item){
						return ko.unwrap(item.name);
					});
				}
			},this,{deferEvalutation:true});
			
			this.table_options = ko.pureComputed(function(){
				if(this.selected_table()){
					var attributes = this.selected_table().columns().map(function(item){
						return item.Field;
					}).join(",");
					var aoColumns = this.selected_table().columns().map(function(item){
						return { mData: item.Field, sTitle: item.Field};
					});
					var result = {
		                bProcessing: true,
		                bServerSide: true,
		                sAjaxSource: "/select",
		                fnServerParams: function ( aoData ) {
		                    aoData.push( { "name": "source", "value": this.selected_schema() } );
		                    aoData.push( { "name": "bean", "value": this.selected_table().name() } );
		                    aoData.push( { "name": "attributes", "value": attributes } );
		                }.bind(this),
		                aoColumns: aoColumns,
		                selected_row: ko.observable()
		            };
					return result;
				}
			},this,{deferEvalutation:true});
		}

		Panel.prototype.init = function() {
			this.load_schemas();
		};

		Panel.prototype.dispose = function() {
			window.spanel = null;
		};
		
		Panel.prototype.load_schemas = function(){
			this.appl.connection.rpc("get_schemas",{},function(response){
				if(response.error){
					Notify.error(response.error);
					return;
				}
				this.selected_schema(null);
				this.schemas(response.result.sort());
			}.bind(this));
		};
		
		Panel.prototype.load_schema = function(name){
			if(name){
				this.appl.connection.rpc("get_schema",{name:name},function(response){
					if(response.error){
						Notify.error(response.error);
						return;
					}
					this.selected_table(null);
					this.schema(new Schema(response.result));
				}.bind(this));	
			} else {
				this.selected_table(null);
			}
		};
		
		Panel.prototype.load_data = function(table){
			if(table){
				var tablename = ko.unwrap(table.name);
				var dbname = ko.unwrap(this.selected_schema);
				this.appl.connection.rpc("select",{
					tablename:tablename,
					dbname:dbname
				},function(response){
					if(response.error){
						Notify.error(response.error);
						return;
					}
					this.table_data(response.result);
				}.bind(this));
			} else {
				this.table_data(null);
			}
		};

		return {
			template: main_tmpl,
			viewModel: Panel
		};
	}
);