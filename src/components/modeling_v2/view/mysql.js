define(["knockout"],
	function(ko){
		
		function MySQL(params){
			this.models = params.models;
			this.body = ko.computed(this.to_text,this,{deferEvalutation:true});
		}
	
		MySQL.prototype.to_text = function(){
			var result = [];
			var my_models = {};
			var constraints = [];
			var many_2_many = [];
			var models = ko.toJS(this.models);
			models.map(function(m){
				my_models[m.name]=m;
				return m;
			},this).map(function(model){
				var keys = ["    PRIMARY KEY (`id`),"];
				result.push("CREATE TABLE IF NOT EXISTS `" + model.name.toUnderscore() + "`(");
				result.push("    `id` int(11) NOT NULL AUTO_INCREMENT,");
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
				result.push(") ENGINE=InnoDB DEFAULT CHARSET=utf8;");
				result.push("");
				result.push("");
			},this);
			result = result.concat(many_2_many).concat(constraints);
			result = result.join("\n");
			
			return result;
		};
	
	
		MySQL.prototype.attr_to_sql = function(attr, out, model, models, many_to_many, keys, constraints){
			if(attr.type === "String"){
				out.push("    `" + attr.name + "` varchar(" + attr.size + ") DEFAULT NULL,");
			}
			else if(attr.type === "Integer"){
				out.push("    `" + attr.name + "` int(11) DEFAULT NULL,");
			}
			else if(attr.type === "Boolean"){
				out.push("    `" + attr.name + "` BOOLEAN DEFAULT NULL,");
			}
			else if(attr.type === "Numeric"){
				out.push("    `" + attr.name + "` decimal(" + attr.precision + "," + attr.scale + ") DEFAULT NULL,");
			}
			else if(attr.type === "Enum"){
				var values = attr.values.split(",");
				var enum_list = [];
				for(var i=0; i < values.length; i++){
					enum_list.push("'" + values[i].trim() + "'");
				}
				out.push("    `" + attr.name + "` enum(" + enum_list.join(",") + ") NOT NULL,");
			}
			else if(["Datetime","Date","Time","Text"].indexOf(attr.type) !== -1){
				out.push("    `"  +  attr.name + "` " + attr.type.toLowerCase() + " DEFAULT NULL,");
			} else {
				var scalar = models[attr.type];
				if(attr.m2m === true){
					var from_field = attr.name + "_id";
					var to_field= attr.type.toLowerCase() + "_id";
					var from_table = model.name.toUnderscore();
					var to_table = attr.type.toUnderscore();
					var secondary_table = model.name.toLowerCase() + "_" + attr.name + "_" + attr.type.toLowerCase();
										
					many_to_many.push("CREATE TABLE IF NOT EXISTS `" + secondary_table + "` (");
					many_to_many.push("    `" + from_field + "` int(11) DEFAULT NULL,");
					many_to_many.push("    `" + to_field + "` int(11) DEFAULT NULL,");
					many_to_many.push("    KEY `" + from_field + "` (`" + from_field + "`),");
					many_to_many.push("    KEY `" + to_field + "` (`" + to_field + "`),");
					many_to_many.push("    CONSTRAINT `" + secondary_table + "_m2m_fk_1` FOREIGN KEY (`" + from_field + "`) REFERENCES `"+ from_table +"` (`id`),");
					many_to_many.push("    CONSTRAINT `" + secondary_table + "_m2m_fk_2` FOREIGN KEY (`" + to_field + "`) REFERENCES `"+ to_table +"` (`id`)");
					many_to_many.push(") ENGINE=InnoDB DEFAULT CHARSET=utf8;");
					many_to_many.push("");
					many_to_many.push("");
	
				} else {
					var from_field = attr.name + "_id";
					var from_table = model.name.toUnderscore();
					var to_table = attr.type.toUnderscore();
					out.push("    `" + from_field + "` int(11) DEFAULT NULL,");
					keys.push("    KEY `" + from_field + "` (`" + from_field + "`),");
					constraints.push("ALTER TABLE `"+ from_table +"` ADD CONSTRAINT `" + 
									  from_table + "_" + from_field + "_fk` FOREIGN KEY (`" + from_field + 
									  "`) REFERENCES `"+ to_table +"` (`id`);");
				}
			}
		};
	
		return {
			template: "<pre data-bind='text:body'></pre>",
			viewModel: MySQL
		};
	}
);