define(
	[], 
	function(){
		/*
			Generates the Javascript representation on the model.
		*/

		function Javascript(){

		}

		Javascript.prototype.header = function(models) {
			return "define(\n\t['jquery','knockout'],\n\tfunction(jquery,knockout){\n\t\t'use strict';\n";
		};

		Javascript.prototype.body = function(models) {
			var i, model, result="\n\t\tfunction Model(options){\n";
   			result += "\t\t\tjquery.extend(this,options || {});\n";
			result += "\t\t\tthis._instances_ = {};\n"
			result += "\t\t}\n";
			for(i=0; i < models.length; i++){
				model = models[i];
				result += this.output_model(models, model);
			}
			result += "\n\t\tModel.prototype.get_object_by_id = function(type, id, options){\n";
			result += "\t\t\tvar obj = this._instances_[type + '_' + id];\n";
			result += "\t\t\tif(!obj){\n";
			result += "\t\t\t\tobj = new this[type](options || {});\n";
			result += "\t\t\t\tobj.id = id;\n";
			result += "\t\t\t\tobj._type = type;\n";
			result += "\t\t\t\tthis._instances_[type + '_' + id] = obj;\n";
			result += "\t\t\t\tthis._load_object_(obj);\n";
			result += "\t\t\t}\n";
			result += "\t\t\treturn obj;\n";
			result += "\t\t};\n";
			
			result += "\n\t\t/* override this function to load the object from the server */";
			result += "\n\t\tModel.prototype._load_object_ = function(obj){};\n";
			
			result += "\n\t\treturn Model;\n"
			return result;
		};

		Javascript.prototype.footer = function(models) {
			return "\t}\n);\n";
		};

		Javascript.prototype.output_model = function(models, model) {
			var i,attr,attrs = model.attrs;
			result = "\n\t\tModel.prototype." + model.name + " = function(options){\n";
			for (i = 0; i < attrs.length; i++) {
				attr = attrs[i];
				if(attr.m2m === true){
					result += "\t\t\tthis." + attr.name + 
						" = knockout.observableArray(options." + attr.name + " || []);\n"; 
				} else {
					result += "\t\t\tthis." + attr.name + 
						" = knockout.observable(options." + attr.name + " || null);\n"; 
				}
			};
			var k,other,other_attr;
			for (i = 0; i < models.length; i++) {
				other = models[i];
				if(other == model) continue;
				for (k = 0; k < other.attrs.length; k++) {
					other_attr = other.attrs[k];
					if(other_attr.type == model.name && other_attr.backref){
						result += "\t\t\tthis." + other_attr.backref + 
							" = knockout.observableArray(options." + other_attr.backref + " || []);\n";
					}
				};
			};
			result += "\t\t\tthis._init_(options);\n";
			result += "\t\t};\n"
			result += "\n\t\t/* override this function to add knockout computed attributes */";
			result += "\n\t\tModel.prototype." + model.name + ".prototype._init_ = function(options){};\n";
			return result;
		};


		Javascript.prototype.to_text = function(models){
			var result =  this.header(models) +
				   		  this.body(models) +
				   		  this.footer(models);
			return {
				body: result, 
				type: "javascript"
			};
		}

		return Javascript;
	}
);