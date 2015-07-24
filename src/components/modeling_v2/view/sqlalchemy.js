define(["knockout"], 
		function(ko){
	/*
		Generates the SQLAlchemy representation on the model.
	*/

	function SQLAlchemy(params){
		this.models = params.models;
		this.body = ko.computed(this.to_text,this,{deferEvalutation:true});
	}
 

	SQLAlchemy.prototype.to_text = function(models){
		var includes = [
		    "from blueshed.model_helpers.base import Base",
			"from sqlalchemy.types import String, Integer, Numeric, DateTime, Date, Time, Enum, Boolean, Text",
			"from sqlalchemy.schema import Table, Column, ForeignKey",
			"from sqlalchemy.orm import relationship, backref", 
			"from sqlalchemy.ext.declarative.api import declared_attr, has_inherited_table, declarative_base",
			"import re",
			"",
			"",
			""
		];
		var indent = "    ";
		var result = [];
		var my_models = {};
		var many_2_many = [];
		var models = ko.toJS(this.models);
		models.map(function(m){
			my_models[m.name]=m;
			return m;
		},this).map(function(model){
			var statics = [];
			var attributes = [];
			result.push("class " + model.name + "(Base):");
			result.push(indent);
			attributes.push(indent + "id = Column(Integer, primary_key=True)");
			model.attrs.map(function(attr){
				this.attr_python(attr, attributes, model, statics, my_models, many_2_many, indent);
			},this);
			models.map(function(other_model){
				other_model.attrs.map(function(attr){
					if(attr.type == model.name && attr.backref){
						this.rel_attr_python(attr, attributes, other_model, statics, my_models, many_2_many, indent);
					}
				},this);
			},this);
			result = result.concat(statics).concat(attributes);
			result.push("");
			result.push("");
		},this);
		result = includes.concat(many_2_many).concat(result);
		result = result.join("\n");
		return result;
	};



	SQLAlchemy.prototype.rel_attr_python = function(attr, out, model, statics, models, many_to_many, indent){
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
			if(attr.cascade==true){
				out.push(indent + indent + "cascade='all,delete-orphan, passive_deletes=True, ");
			}
			out.push(indent + indent + "primaryjoin='"+ primaryjoin + "',");
			out.push(indent + indent + "remote_side='"+ model.name + "." + attr.name +"_id'" + backref + ")");
		}
	};

	SQLAlchemy.prototype.attr_python = function(attr, out, model, statics, models, many_to_many, indent){
		var doc = attr.doc ? ", doc='"+ attr.doc + "'" :"";
		if(attr.type === "String"){
			out.push(indent  + attr.name + " = Column(String(" + attr.size + ")" + doc + ")");
		}
		else if(attr.type === "Numeric"){
			out.push(indent  +  attr.name + " = Column(Numeric(" + attr.precision + "," + attr.scale + ")" + doc + ")");
		}
		else if(attr.type === "Boolean"){
			out.push(indent  +  attr.name + " = Column(Boolean()" + doc + ")");
		}
		else if(attr.type === "Enum"){
			var values = attr.values.split(",");
			var enum_list = [];
			for(var i=0; i < values.length; i++){
				enum_list.push("'" + values[i].trim() + "'");
			}
			statics.push(indent + attr.name.toUpperCase() + " = [" + enum_list.join(",") + "]");
			statics.push(indent);
			out.push(indent  +  attr.name + " = Column(Enum(*" + attr.name.toUpperCase() + ")" + doc + ")");
		}
		else if(["Datetime"].indexOf(attr.type) !== -1){
			out.push(indent  +  attr.name + " = Column(DateTime" + doc + ")");
		}
		else if(["Integer","Date","Time","Text"].indexOf(attr.type) !== -1){
			out.push(indent  +  attr.name + " = Column(" + attr.type + "" + doc + ")");
		} else {
			var scalar = models[attr.type];
			if(attr.m2m === true){
				var fkey_from = model.name.toUnderscore() + ".id";
				var fkey_to = attr.type.toUnderscore() + ".id";
				var field_from = attr.name + "_id";
				var field_to = attr.type.toUnderscore() + "_id";
				var backref = attr.backref ? ", back_populates='" + attr.backref + "'" : '';
				var comment = attr.backref ? 
					"mysql_comment='{\\\"back_ref\\\":\\\""+model.name+"."+attr.name+"\\\", \\\"back_populates\\\":\\\""+attr.type+"."+attr.backref + "\\\"}'" :
					"mysql_comment='{\\\"back_ref\\\":\\\""+attr.type+"."+attr.name+"\\\"}'";
				var secondary_table = model.name.toLowerCase() + "_" + attr.name + "_" + attr.type.toLowerCase();
				var primaryjoin = model.name + ".id==" + secondary_table + ".c." + field_from;
				var secondaryjoin = attr.type + ".id==" + secondary_table + ".c." + field_to;
					
				out.push(indent + attr.name + " = relationship('" + attr.type + "',");
				out.push(indent + indent + "primaryjoin='" + primaryjoin + "',");
				out.push(indent + indent + "secondaryjoin='" + secondaryjoin + "',");
				out.push(indent + indent + "secondary='" + secondary_table + "',");
				out.push(indent + indent + "lazy='joined'" + backref + doc + ")");
			
				many_to_many.push(secondary_table + " = Table('" + secondary_table + "', Base.metadata,");
				many_to_many.push(indent + "Column('" + field_from + "', Integer, ForeignKey('" + fkey_from + "')),");
				many_to_many.push(indent + "Column('" + field_to + "', Integer, ForeignKey('" + fkey_to + "')),");
				many_to_many.push(indent + comment + ",");
				many_to_many.push(indent + "mysql_engine='InnoDB')");
				many_to_many.push("");
				many_to_many.push("");

			} else {
				var fkey = attr.type.toUnderscore() + ".id";
				var backref =  attr.backref ? ",\n" + indent + indent + "back_populates='" + attr.backref + "'" : '';
				var primaryjoin = model.name + "." + attr.name +"_id==" + attr.type + ".id";
				out.push(indent + attr.name + "_id = Column(Integer, ForeignKey('" + fkey + "'" + (
						attr.cascade ? ", ondelete='CASCADE'" : "" 
						) +  "))");
				out.push(indent + attr.name + " = relationship('" + attr.type + "', uselist=False,");
				out.push(indent + indent + "primaryjoin='"+ primaryjoin + "', ");
				out.push(indent + indent + "remote_side='"+ attr.type +".id'" + backref + "" + doc + ")");
			}
		}
	};
	
	return {
		template: "<pre data-bind='text:body'></pre>", 
		viewModel: SQLAlchemy
	};

});