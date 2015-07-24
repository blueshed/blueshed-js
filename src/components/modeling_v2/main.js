define(["jquery",
		"knockout",
		"text!./main-tmpl.html",
		"text!./open-dialog-tmpl.html",
	    "./model/defaults",
		"./model/model",
		"./components"
	],
	function($, ko, 
			 main_tmpl, 
			 open_dialog,
			 defaults,
			 Model,
			 components){
	
	
		ko.components.register("modeling-open-dialog",{template:open_dialog});
		
		
		$(function(){
			$(document).on('change', '.btn-file :file', function() {
				var input = $(this),
				numFiles = input.get(0).files ? input.get(0).files.length : 1,
				label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
				input.trigger('fileselect', [numFiles, label]);
				var display =  $(this).parents('.input-group').find(':text'),
					log = numFiles > 1 ? numFiles + ' files selected' : label;
				if( display.length ) {
					display.val(log);
				} else {
					if( log ) alert(log);
				}
			});
		});
		

		function Panel(params){
			window.mpanel = this;
			this.appl = params.appl;
			this.models = ko.observableArray();
			this.selected_model = ko.observable();
			this.edit_name = ko.observable();
			
			this.default_types = defaults.DEFAULT_TYPES;
			this.types = ko.pureComputed(function(){
				return this.models().map(function(item){
					return ko.unwrap(item.name);
				});
			},this);
			
			this.edit_model_name = ko.observable(false);
			this.previous_name = null;
			this.edit_name_sub = this.edit_name.subscribe(this.name_changed,this);
			this.selected_model.subscribe(function(value){
				this.edit_name_sub.dispose();
				if(value){
					var name = value ? ko.unwrap(value.name) : null;
					this.previous_name = name;
					this.edit_name(name);
					this.edit_name.subscribe(this.name_changed,this);
					this.edit_model_name(true);
				}
			},this);
		}

		Panel.prototype.init = function() {
			if(this.appl.fetch_model){
				this.appl.fetch_model(function(models){
					this.models(models.map(function(item){
						return new Model(item);
					}));
					if(this.models().length > 0){
						this.selected_model(this.models()[0]);
					}
				}.bind(this));
			} else {
				var customer = new Model({name:"Customer"});
				customer.add_attr({name:"name", type:"String", size:80});
				customer.add_attr({name:"dob", type:"Date"});
				customer.add_attr({name:"active", type:"Boolean"});
				customer.add_attr({name:"customer_type", type:"Enum",values:'retail,wholesale'});
				customer.add_attr({name:"addresses", type:"Address",backref:'customers',m2m:true});
				customer.add_attr({name:"delivery_address", type:"Address",backref:"delivery_customers"});

				var address = new Model({name:"Address"});
				address.add_attr({name:"line1", type:"String",size:100});
				address.add_attr({name:"line2", type:"String",size:80});
				address.add_attr({name:"town", type:"String",size:80});
				address.add_attr({name:"postcode", type:"String",size:10});
				address.add_attr({name:"county", type:"String",size:80});

				var keyword = new Model({name:"Keyword"});
				keyword.add_attr({name:"value", type:"String",size:100});
				keyword.add_attr({name:"owners", type:"Customer",backref:'keywords',cascade:true});

				this.models.push(customer);
				this.models.push(address);
				this.models.push(keyword);
				this.selected_model(customer);
			}
		};

		Panel.prototype.dispose = function() {
			if(this.edit_name_sub){
				this.edit_name_sub.dispose();
			}
			window.mpanel = null;
		};
		
		Panel.prototype.add_model = function(options){
			var result = new Model(options);
			result.add_attr();
			this.models.push(result);
			this.selected_model(result);
			return result;
		};
		
		
		Panel.prototype.remove_model = function(item){
			if(this.selected_model() == item){
				this.selected_model(null);
			}
			this.models.remove(item);
		};
		
		Panel.prototype.name_changed = function(value){
			if(value){
				var attrs = [];
				var previous_value = this.previous_name;
				this.models().map(function(model){
					model.attrs().map(function(attr){
						if(attr.type() == previous_value){
							attrs.push(attr);
						}
					});
				});
				this.selected_model().name(value);
				attrs.map(function(attr){
					attr.type(value);
				});
				this.previous_name = value;	
			}
		};
		

		Panel.prototype.download_zip = function() {
			components.download_zip(this.models());
		};
		

		Panel.prototype.open = function() {
			this.appl.open_dialog("modeling-open-dialog",{
				submit: function(){
					var element = document.getElementById("schema_file");
					var file = element.files[0];
					this.read_model(file);
					this.appl.close_dialog();
				}.bind(this)
			});
		};

		Panel.prototype.read_model = function(file) {
			var reader = new FileReader();
			reader.onload = function(e) {
			  var text = reader.result;
			  var new_models = JSON.parse(text);
			  this.selected_model(null);
			  this.models.removeAll();
			  this.models(new_models.map(function(options){
				  return new Model(options);
			  }));
			}.bind(this);
			reader.readAsText(file,"utf-8");
		};

		
		return {
			template: main_tmpl,
			viewModel: Panel
		};
	}
);