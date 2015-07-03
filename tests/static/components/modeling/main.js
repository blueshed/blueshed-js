
 define(
	["jquery",
	 "knockout",
	 "./utils",
	 "./model/model",
	 "./model/default_types",
	 "text!./main-tmpl.html",
	 "./sql_dialects/mysql",
	 "./lang_dialects/sqlalchemy",
	 "./lang_dialects/dot",
     "knockout-switch-case",
     "codemirror/mode/python/python",
     "codemirror/mode/sql/sql",
     "codemirror/mode/javascript/javascript"],
	function (jquery, ko, utils, Model, DEFAULT_TYPES, main_tmpl, MySQL, SQLAlchemy, DotLang) {

	
		function ModellingAppl(params){
			this.appl = params.appl;
			this.view = ko.observable("model-editor-tmpl");
		
			this.models = ko.observableArray(this.appl.get_cached("model",[]));
			this.new_model_name = ko.observable();
			this.new_attr_name = ko.observable();
			this.edit_model = ko.observable();
		
			this.langs = ko.observableArray();
			for(name in this.settings.langs){
				this.langs.push(name);
			}
			this.selected_lang = ko.observable(params.lang_mode || this.langs()[0]);
			this.selected_lang.subscribe(function(){
				this.view("model-editor-tmpl");
			},this);
			
			this.sqls = ko.observableArray();
			for(name in this.settings.sqls){
				this.sqls.push(name);
			}
			this.selected_sql = ko.observable(params.sql_mode || this.sqls()[0]);
			this.selected_sql.subscribe(function(){
				this.view("model-editor-tmpl");
			},this);
		
			this.attribute_types = ko.computed(function(){
				var result = jquery.extend([],DEFAULT_TYPES);
				for(var i=0; i < this.models().length; i++){
					result.push(this.models()[i].name());
				}
				return result;
			},this);
			this.model_names = ko.computed(function(){
				var result = [];
				for(var i=0; i < this.models().length; i++){
					result.push(this.models()[i].name());
				}
				return result;
			},this);

			this.model_view = ko.observable();
			this.model_view_options = ko.observable();

			this.init();
		}
	
		ModellingAppl.prototype.settings = {
			langs:{
				SQLAlchemy: new SQLAlchemy(),
				Dot: new DotLang(),
			},
			sqls: {
				MySQL: new MySQL()
			},
			default_types: DEFAULT_TYPES
		};
	
		ModellingAppl.prototype.wrap = function(name){
			/*
			 * utility function to wrap a function of this object
			 * so that ko can bind it with a closure containing this
			 * as a that variable.
			 */
			var that = this;
			var fn_args = [].splice.call(arguments,1);
			return function(){
				var args = fn_args.concat([].splice.call(arguments,0));
				return that[name].apply(that,args);
			};
		};
	
	
		ModellingAppl.prototype.new_model = function(name){
			var new_model = new Model(name || this.new_model_name());
			var previous_name = new_model.name();
			new_model.name.subscribe(function(value){
				if(value !== previous_name){
					this.update_model_name(value, previous_name);
				}
				previous_name = value;
			},this);
			this.models.push(new_model);
			this.models.sort(function(left, right) { return left.name() == right.name() ? 0 : (left.name() < right.name() ? -1 : 1) });
			this.new_model_name("");
			this.edit_model(new_model);
			return new_model;
		};
	
	
		ModellingAppl.prototype.new_attr = function(name, type, options){
			var new_attr = this.edit_model().add_attr(
				name || this.new_attr_name(),
				type || DEFAULT_TYPES[0],
				options);
			this.new_attr_name("");
			return new_attr;
		};
	
		ModellingAppl.prototype.remove_attr = function(attr){
			this.edit_model().remove_attr(attr);
		};
	
	
		ModellingAppl.prototype.remove_model = function(model){
			this.edit_model(null);
			var model_name = model.name();
			var to_remove = [];
			for(var i=0; i < this.models().length; i++){
				for(var j=0; j < this.models()[i].attrs().length; j++){
					if(this.models()[i].attrs()[j].type() === model_name){
						to_remove.push([this.models()[i], this.models()[i].attrs()[j]]);
					}
				}
			}
			for(var i=0; i < to_remove.length; i++){
				to_remove[i][0].attrs.remove(to_remove[i][1]);
			}
			this.models.remove(model);
			this.models.sort(function(left, right) { return left.name() == right.name() ? 0 : (left.name() < right.name() ? -1 : 1) });
			if(this.models().length > 0){
				this.edit_model(this.models()[0]);
			}
		};
	
		ModellingAppl.prototype.update_model_name = function(new_value,previous_value){
			for(var i=0; i < this.models().length; i++){
				for(var j=0; j < this.models()[i].attrs().length; j++){
					if(this.models()[i].attrs()[j].type() === previous_value){
						this.models()[i].attrs()[j].type(new_value);
					}
				}
			}
			this.models.sort(function(left, right) { return left.name() == right.name() ? 0 : (left.name() < right.name() ? -1 : 1) });
		};
	
		ModellingAppl.prototype.load_model = function(){
			var new_models = JSON.parse(this.model_view());
			this._load_model(new_models);
		};

		ModellingAppl.prototype.read_model = function() {
			var element = document.getElementById("schema_file");
		    var file = element.files[0];

			var reader = new FileReader();
			reader.onload = function(e) {
			  var text = reader.result;
			  this.model_view(text);
			}.bind(this);
			reader.readAsText(file,"utf-8");
		};

		ModellingAppl.prototype.view_model = function() {
			this.model_view_options({ 
				mode: {
		            name: "javascript",
		            version: 2,
		            singleLineStringErrors: false
		         }
		    });
			this.model_view(this.to_json());
			this.view('json-editor-tmpl');
		};
	
		ModellingAppl.prototype._load_model = function(new_models){
			this.edit_model(null);
			this.models.removeAll();
			for(var m=0; m < new_models.length; m++){
				var model_data = new_models[m];
				var model = this.new_model(model_data.name);
				this.edit_model(model);
				for(var a=0; a < model_data.attrs.length; a++){
					var attr_data = model_data.attrs[a];
					this.new_attr(attr_data.name, attr_data.type, attr_data);
				}
			}
			this.models.sort(function(left, right) { return left.name() == right.name() ? 0 : (left.name() < right.name() ? -1 : 1) });
			this.view('model-editor-tmpl');
		};
	
		ModellingAppl.prototype.to_json = function(){
			return ko.toJSON(this.models,null,2);
		};
	
		require(["viz"], function(Viz){
			ModellingAppl.prototype.to_svg = function(){
				return Viz(this.settings.langs.Dot.to_text(ko.toJS(this.models)).body,'svg');
			};
		});
	
		ModellingAppl.prototype.get_lang_text = function(){
			return this.settings.langs[this.selected_lang()].to_text(ko.toJS(this.models));
		};
	
		ModellingAppl.prototype.get_sql_text = function(){
			return this.settings.sqls[this.selected_sql()].to_text(ko.toJS(this.models));
		};

		ModellingAppl.prototype.download_zip = function() {
			require(["jszip"],function(JSZip){

				var zip = new JSZip();

				zip.file("model.json", ko.toJSON(this.models,null,2));

				var content = zip.generate();

				location.href = "data:application/zip;base64," + content;

			}.bind(this));
		};


		ModellingAppl.prototype.init = function() {
			if(this.models().length==0){
			    var customer = this.new_model("Customer");
			    this.new_attr("name", "String",{size:80});
			    this.new_attr("dob", "Date",{});
			    this.new_attr("active", "Boolean",{});
			    this.new_attr("customer_type", "Enum",{values:'retail,wholesale'});
			    this.new_attr("addresses", "Address",{backref:'customers',m2m:true});
			    this.new_attr("delivery_address", "Address",{backref:"delivery_customers"});
			    
			    var address = this.new_model("Address");
			    this.new_attr("line1", "String",{size:100});
			    this.new_attr("line2", "String",{size:80});
			    this.new_attr("town", "String",{size:80});
			    this.new_attr("postcode", "String",{size:10});
			    this.new_attr("county", "String",{size:80});
			}
		};


		return {
			viewModel: ModellingAppl,
			template: main_tmpl
		};
	}
);