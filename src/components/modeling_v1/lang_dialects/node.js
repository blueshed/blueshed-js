define(
	[], 
	function(){
		/*
			Generates the Javascript representation on the model.
		*/

		var DEFAULT_TYPES = ModellingAppl.prototype.settings.default_types;

		function Javascript(){

		}

		Javascript.prototype.header = function(models) {
			return "var rdb = require('rdb');\n\n";
		};

		Javascript.prototype.body = function(models) {
			var result = [];
			models.map(this.output_model.bind(this,result,models));
			models.map(function(model){
				model.attrs.map(function(attr){
					if(DEFAULT_TYPES.indexOf(attr.type) == -1){
						this.add_relation(result,models,model,attr);
					}
				},this);
			},this);
			result.push("module.exports = {");
			result.push(models.map(function(model){
				return "\t"+model.name + ": " + model.name;
			}).join(",\n"));
			result.push("};");
			return result.join("\n");
		};

		Javascript.prototype.footer = function(models) {
			return "\n";
		};

		Javascript.prototype.output_model = function(result, models, model) {
			result.push("var " + model.name + " = rdb.table('" + model.name.toUnderscore() + "');\n");
			result.push(model.name + ".primaryColumn('id').numeric();");
			model.attrs.map(function(attr){
				if(attr.type === "String"){
					result.push(model.name + ".column('"+ attr.name +"').string();");
				}
				else if(attr.type === "Numeric"){
					result.push(model.name + ".column('"+ attr.name +"').numeric();");
				}
				else if(attr.type === "Boolean"){
					result.push(model.name + ".column('"+ attr.name +"').boolean();");
				}
				else if(attr.type === "Enum"){
					result.push(model.name + ".column('"+ attr.name +"').string();");
				}
				else if(["Text"].indexOf(attr.type) !== -1){
					result.push(model.name + ".column('"+ attr.name +"').string();");
				}
				else if(["Datetime","Date","Time"].indexOf(attr.type) !== -1){
					result.push(model.name + ".column('"+ attr.name +"').date();");
				} else if(attr.m2m !== true){
					var fkey = attr.name + "_id";
					result.push(model.name + ".column('"+ fkey + "').numeric();");
				}
			},this);
			result.push("\n");
		};


		Javascript.prototype.add_relation = function(result, models, model, attr) {
			var scalar = models[attr.type];
			if(attr.m2m === true){

			}
			else{
				var fkey = attr.name + "_id";
				var rel_name = ( "_" + model.name + "_" + attr.name + "_" ).toLowerCase();
				result.push("var " + rel_name + " = " + model.name + ".join("+ attr.type + ").by('" + fkey + "').as('" + attr.name + "');");
				if(attr.backref){
					result.push(attr.type + ".hasMany("+ rel_name + ").as('"+attr.backref+"');");
				}
				result.push("\n");
			}
		};


		Javascript.prototype.to_text = function(models){
			var result =  this.header(models) +
				   		  this.body(models) +
				   		  this.footer(models);
			return {
				body: result, 
				type: "javascript"
			};
		};

		return Javascript;
	}
);