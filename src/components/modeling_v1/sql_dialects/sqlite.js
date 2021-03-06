define([], function(){

	/*
		Generates the SQLite representation on the model.
	*/
	function SQLite(){

	}


	SQLite.prototype.to_text = function(models){
		var result = [];
		var my_models = {};
		var constraints = [];
		var many_2_many = [];
		for(var i=0; i < models.length; i++){
			my_models[models[i].name]=models[i].name;
		}
		for(var i=0; i < models.length; i++){
			var model = models[i];
			var keys = [];
			result.push("CREATE TABLE IF NOT EXISTS `" + model.name.toUnderscore() + "`(");
			result.push("    `id` INTEGER PRIMARY KEY AUTOINCREMENT,");
			for(var j=0; j < model.attrs.length; j++){
				var attr = model.attrs[j];
				this.attr_to_sql(attr, result, model, my_models, many_2_many, keys, constraints);
			}
			result = result.concat(keys);
			// remove trailing comma
			if(result.length && 
			   result[result.length-1].length &&
			   result[result.length-1].charAt(result[result.length-1].length-1)===","){
				result[result.length-1] = result[result.length-1].substring(0,result[result.length-1].length-1);
			}
			result.push(");");
			result.push("");
			result.push("");
		}
		result = result.concat(many_2_many).concat(constraints);
		result = result.join("\n");
		result = result.replace(/`/g,"\"");
		return {
			body: result, 
			type: "text/x-sql"
		};
	};


	SQLite.prototype.attr_to_sql = function(attr, out, model, models, many_to_many, keys, constraints){
		if(attr.type === "String" || attr.type === "Enum"){
			out.push("    `" + attr.name + "` TEXT,");
		}
		else if(attr.type === "Integer" || attr.type === "Boolean"){
			out.push("    `" + attr.name + "` INTEGER,");
		}
		else if(attr.type === "Numeric"){
			out.push("    `" + attr.name + "` REAL,");
		}
		else if(["Datetime","Date","Time","Text"].indexOf(attr.type) !== -1){
			out.push("    `"  +  attr.name + "` " + attr.type.toUpperCase() + ",");
		} else {
			var scalar = models[attr.type];
			if(attr.m2m === true){
				var from_field = attr.name + "_id";
				var to_field= attr.type.toLowerCase() + "_id";
				var from_table = model.name.toUnderscore();
				var to_table = attr.type.toUnderscore();
				var secondary_table = model.name.toLowerCase() + "_" + attr.name + "_" + attr.type.toLowerCase();
									
				many_to_many.push("CREATE TABLE IF NOT EXISTS `" + secondary_table + "` (");
				many_to_many.push("    `" + from_field + "` INTEGER,");
				many_to_many.push("    `" + to_field + "` INTEGER,");
				many_to_many.push("    FOREIGN KEY (`" + from_field + "`) REFERENCES `"+ from_table +"` (`id`),");
				many_to_many.push("    FOREIGN KEY (`" + to_field + "`) REFERENCES `"+ to_table +"` (`id`)");
				many_to_many.push(");");
				many_to_many.push("");
				many_to_many.push("");

			} else {
				var from_field = attr.name + "_id";
				var from_table = model.name.toUnderscore();
				var to_table = attr.type.toUnderscore();
				out.push("    `" + from_field + "` INTEGER,");
				keys.push("    FOREIGN KEY (`" + from_field + "`) REFERENCES `"+ to_table +"` (`id`)");
			}
		}
	};

	return SQLite;

});