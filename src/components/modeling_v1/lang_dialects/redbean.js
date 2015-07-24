define([], function(){
	/*
		Generates the RedBean representation on the model.
	*/

	function RedBean(){

	}
 

	RedBean.prototype.to_text = function(models){
		var includes = [
			"require \"_db.php\";",
			"",
			""
		];
		var indent = "\t";
		var result = [];
		var my_models = {};
		var many_2_many = [];
		for(var i=0; i < models.length; i++){
			my_models[models[i].name]=models[i].name;
		}
		for(var i=0; i < models.length; i++){
			var model = models[i];
			var statics = [];
			var attributes = [];
			result.push("class Model_" + model.name + " extends RedBean_SimpleModel {");
			result.push(indent);
			attributes.push(indent + "id = Column(Integer, primary_key=True)");
			for(var j=0; j < model.attrs.length; j++){
				var attr = model.attrs[j];
				this.attr_python(attr, attributes, model, statics, my_models, many_2_many, indent);
			}
			for(var j=0; j < models.length; j++){
				var other_model = models[j];
				for(var k=0; k < other_model.attrs.length; k++){
					var attr = other_model.attrs[k];
					if(attr.type == model.name && attr.backref){
						this.rel_attr_python(attr, attributes, other_model, statics, my_models, many_2_many, indent);
					}
				}			
			}
			result = result.concat(statics).concat(attributes);
			result.push("}");
			result.push("");
		}
		result = includes.concat(many_2_many).concat(result);
		result = result.join("\n");
		return {
			body:result, 
			type:"php"
		};
	};



	RedBean.prototype.rel_attr_python = function(attr, out, model, statics, models, many_to_many, indent){
		var scalar = models[attr.type];
		if(attr.m2m === true){
				var fkey_from = model.name.toUnderscore() + ".id";
				var fkey_to = attr.type.toUnderscore() + ".id";
				var field_from = attr.name + "_id";
				var field_to = attr.type.toUnderscore() + "_id";
				var backref = attr.backref ? ", back_populates='" + attr.name + "'" : '';
				var secondary_table = model.name.toLowerCase() + "_" + attr.name + "_" + attr.type.toLowerCase();
				var primaryjoin = model.name + ".id==" + secondary_table + ".c." + field_from;
				var secondaryjoin = attr.type + ".id==" + secondary_table + ".c." + field_to;
							
				out.push(indent + attr.backref + " = relationship('" + model.name + "',");
				out.push(indent + indent + "secondaryjoin='" + primaryjoin + "',");
				out.push(indent + indent + "primaryjoin='" + secondaryjoin + "',");
				out.push(indent + indent + "secondary='" + secondary_table + "',");
				out.push(indent + indent + "lazy='joined'" + backref + ")");
		} else {
			var fkey = attr.type.toUnderscore() + ".id";
			var backref =  attr.backref ? ",\n" + indent + indent + "back_populates='" + attr.name + "'" : '';
			var primaryjoin = model.name + "." + attr.name +"_id==" + attr.type + ".id";
			out.push(indent + attr.backref + " = relationship('" + model.name + "', uselist=True, ");
			out.push(indent + indent + "primaryjoin='"+ primaryjoin + "', remote_side='"+ model.name + "." + attr.name +"_id'" + backref + ")");
		}
	};

	RedBean.prototype.attr_python = function(attr, out, model, statics, models, many_to_many, indent){
	
		if(attr.type === "String"){
			out.push(indent  + attr.name + " = Column(String(" + attr.size + "))");
		}
		else if(attr.type === "Numeric"){
			out.push(indent  +  attr.name + " = Column(Numeric(" + attr.precision + "," + attr.scale + "))");
		}
		else if(attr.type === "Boolean"){
			out.push(indent  +  attr.name + " = Column(Boolean())");
		}
		else if(attr.type === "Enum"){
			var values = attr.values.split(",");
			var enum_list = [];
			for(var i=0; i < values.length; i++){
				enum_list.push("'" + values[i].trim() + "'");
			}
			statics.push(indent + attr.name.toUpperCase() + " = [" + enum_list.join(",") + "]");
			statics.push(indent);
			out.push(indent  +  attr.name + " = Column(Enum(*" + attr.name.toUpperCase() + "))");
		}
		else if(["Datetime"].indexOf(attr.type) !== -1){
			out.push(indent  +  attr.name + " = Column(DateTime)");
		}
		else if(["Integer","Date","Time","Text"].indexOf(attr.type) !== -1){
			out.push(indent  +  attr.name + " = Column(" + attr.type + ")");
		} else {
			var scalar = models[attr.type];
			if(attr.m2m === true){
				var fkey_from = model.name.toUnderscore() + ".id";
				var fkey_to = attr.type.toUnderscore() + ".id";
				var field_from = attr.name + "_id";
				var field_to = attr.type.toUnderscore() + "_id";
				var backref = attr.backref ? ", back_populates='" + attr.backref + "'" : '';
				var secondary_table = model.name.toLowerCase() + "_" + attr.name + "_" + attr.type.toLowerCase();
				var primaryjoin = model.name + ".id==" + secondary_table + ".c." + field_from;
				var secondaryjoin = attr.type + ".id==" + secondary_table + ".c." + field_to;
					
				out.push(indent + attr.name + " = relationship('" + attr.type + "',");
				out.push(indent + indent + "primaryjoin='" + primaryjoin + "',");
				out.push(indent + indent + "secondaryjoin='" + secondaryjoin + "',");
				out.push(indent + indent + "secondary='" + secondary_table + "',");
				out.push(indent + indent + "lazy='joined'" + backref + ")");
			
				many_to_many.push(secondary_table + " = Table('" + secondary_table + "', Base.metadata,");
				many_to_many.push(indent + "Column('" + field_from + "', Integer, ForeignKey('" + fkey_from + "')),");
				many_to_many.push(indent + "Column('" + field_to + "', Integer, ForeignKey('" + fkey_to + "')),");
				many_to_many.push(indent + "mysql_engine='InnoDB')");
				many_to_many.push("");
				many_to_many.push("");

			} else {
				var fkey = attr.type.toUnderscore() + ".id";
				var backref =  attr.backref ? ",\n" + indent + indent + "back_populates='" + attr.backref + "'" : '';
				var primaryjoin = model.name + "." + attr.name +"_id==" + attr.type + ".id";
				out.push(indent + attr.name + "_id = Column(Integer, ForeignKey('" + fkey +"'))");
				out.push(indent + attr.name + " = relationship('" + attr.type + "', uselist=False,");
				out.push(indent + indent + "primaryjoin='"+ primaryjoin + "', remote_side='"+ attr.type +".id'" + backref + ")");
			}
		}
	};
	
	return RedBean;

});