define([], function(){
	/*
		Generates the GoLang representation on the model.
	*/

	function GoLang(){

	}
 
 
 	function json_tag(what){
 		return "\t'json:\""+ what + "\"'";
 	}

 	function backref_tag(what){
 		/* to do
 		if(what){
	 		return "\t'backref:\""+ what + "\"'";
	 	}
	 	*/
	 	return '';
 	}

	GoLang.prototype.to_text = function(models){
		var indent = "\t";
		var includes = [
			"package main",
			"",
			"import (",  
			indent+'"time"',
			indent+'"database/sql"',
			")",
			"",
			""
		];
		var result = [];
		var my_models = {};
		for(var i=0; i < models.length; i++){
			my_models[models[i].name]=models[i].name;
		}
		for(var i=0; i < models.length; i++){
			var model = models[i];
			var statics = [];
			var attributes = [];
			attributes.push(indent + "Id int64" + json_tag("id"));
			for(var j=0; j < model.attrs.length; j++){
				var attr = model.attrs[j];
				this.attr_out(attr, attributes, model, statics, my_models, indent);
			}
			for(var j=0; j < models.length; j++){
				var other_model = models[j];
				for(var k=0; k < other_model.attrs.length; k++){
					var attr = other_model.attrs[k];
					if(attr.type == model.name && attr.backref){
						if(attr.m2m === true){
							attributes.push(indent + attr.backref + " []*" + other_model.name + backref_tag(attr.name));
						} else {
							attributes.push(indent + attr.backref + " []*" + other_model.name + backref_tag(attr.name));
						}
					}
				}			
			}
			result = result.concat(statics)
			result.push("type " + model.name + " struct {");
			result = result.concat(attributes);
			result.push("}");
			result.push("");
			result.push("");
			this.list_out(result, model, models, indent);
		}
		result = includes.concat(result);
		result = result.join("\n");
		return {
			body:result, 
			type:"text/x-go"
		};
	};

	GoLang.prototype.attr_out = function(attr, out, model, statics, models, indent){
	
		if(["String","Text"].indexOf(attr.type) !== -1){
			out.push(indent  + attr.name.toTitleCase() + " string" + json_tag(attr.name));
		}
		else if(attr.type === "Integer"){
			out.push(indent  +  attr.name.toTitleCase() + " int64" + json_tag(attr.name));
		}
		else if(attr.type === "Numeric"){
			out.push(indent  +  attr.name.toTitleCase() + " float64" + json_tag(attr.name));
		}
		else if(attr.type === "Enum"){
			var values = attr.values.split(",");
			statics.push("type " + attr.name.toUpperCase() + " int");
			statics.push("const (");
			for(var i=0; i < values.length; i++){
				var line = indent + values[i].trim();
				if(i==0){
					line = line + " " + attr.name.toUpperCase() + " = iota"
				}
				statics.push(line);
			}
			statics.push(")");
			statics.push("");
			out.push(indent  +  attr.name.toTitleCase() + " " + attr.name.toUpperCase() + json_tag(attr.name));
		}
		else if(["Datetime","Date","Time"].indexOf(attr.type) !== -1){
			out.push(indent  +  attr.name.toTitleCase() + " time.Time" + json_tag(attr.name));
		} else {
			var scalar = models[attr.type];
			if(attr.m2m === true){
				out.push(indent + attr.name + " []*" + attr.type + backref_tag(attr.backref));
			} else {
				out.push(indent + attr.name + " *" + attr.type + backref_tag(attr.backref));
			}
		}
	};

	GoLang.prototype.list_out = function(out, model, models, indent){
		var flds = ["id"];
		var vars = ["&item.id"];
		for(var i=0; i < model.attrs.length; i++){
			var attr = model.attrs[i];
			if(["String","Text"].indexOf(attr.type) !== -1){
				flds.push(attr.name);
				vars.push("&item." + attr.name);
			}
			else if(attr.type === "Integer"){
				flds.push(attr.name);
				vars.push("&item." + attr.name);
			}
			else if(attr.type === "Numeric"){
				flds.push(attr.name);
				vars.push("&item." + attr.name);
			}
			else if(["Datetime","Date","Time"].indexOf(attr.type) !== -1){
				flds.push(attr.name);
				vars.push("&item." + attr.name);
			}
		}
		var cols = flds.join(",");
		var pointers = vars.join(",");
		out.push("func List" + model.name + "(db *sql.DB) ([]*" + model.name + ", error) {");
		out.push("");
		out.push(indent + "result := make([]*" + model.name + ",0)");
		out.push("");
		out.push(indent + 'rows, err := db.Query("SELECT ' + cols + ' FROM ' + model.name.toUnderscore() + '")');
		out.push(indent + "if err != nil{");
		out.push(indent + indent + "return nil, err");
		out.push(indent + "}");
		out.push(indent + "defer func(){ rows.Close() }()");
		out.push("");
		out.push(indent + "for rows.Next() {");
		out.push(indent + indent + "item := new(" + model.name + ")");
		out.push(indent + indent + "err = rows.Scan(" + pointers + ")");
		out.push(indent + indent + "if err != nil{");
		out.push(indent + indent + indent + "return nil, err");
		out.push(indent + indent + "}");
		out.push(indent + indent + "result = append(result, item)");
		out.push(indent + "}");
		out.push(indent + "err = rows.Err()");
		out.push(indent + "return result, err");
		out.push("}");
		out.push("");
		out.push("");
	};
	
	return GoLang;

});