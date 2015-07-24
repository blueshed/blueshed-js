define(["jquery",
        "knockout",
        "./defaults",
        "../../modeling/model/attr"],
        function($,ko,defaults,Attr){
	
	function Table(options){
		this.name = ko.observable();
		this.columns = ko.observableArray();
		this.indexes = ko.observableArray();
		this.relations = ko.observableArray();
		this.attrs = ko.observableArray();
		
		if(options){
			this.update(options);
		}
		this.title = ko.computed(function(){
			var result = defaults.camelCase(this.name());
			return result && result.charAt(0).toUpperCase() + result.substring(1);
		},this,{deferEvaluation:true});
		this.pk = ko.computed(function(){
			var i,item,items = this.columns();
			for(i=0;i<items.length;i++){
				item = items[i];
				if(item[3]=="PRI"){
					return item;
				}
			}
			return null;
		},this,{deferEvaluation:true});
		this.m2m = ko.computed(function(){
			if(this.pk() === null && this.relations().length === 2){
				return true;
			}
			return false;
		},this,{deferEvaluation:true});
	}
	
	Table.prototype.update = function(options){
		this.name(options.name);
		options.columns.map(this.add_column,this);
		options.relations.map(this.add_relation,this);
		this.indexes(options.indexes);
	};
	
	Table.prototype.add_column = function(column){
		this.columns.push(column);
		//if(column["Key"] != 'PRI' && column["Key"] != "MUL"){
		if(column["Key"] != 'PRI'){	
			var options = {};
			var type = column["Type"];
			defaults.DEFAULT_SQL_MAP.map(function(item){
				if(type.indexOf(item[0]) == 0){
					type = item[1];
					if(item[2]){
						options = item[2](column);
					}
				}
			});
			var data = {
				name: column["Field"],
				type: type,
			};
			this.attrs.push(new Attr($.extend({},data,options)));
		}
	};
	
	Table.prototype.add_relation = function(relation, local){
		this.relations.push(relation);
		if(local === true){
			var name = relation[0].substring(0,relation[0].length-3);
			var type = defaults.camelCase(relation[1]);
			type = type.charAt(0).toUpperCase() + type.substring(1);
			this.attrs.push(new Attr(name,type,{}));
		}
	};

	return Table;
});