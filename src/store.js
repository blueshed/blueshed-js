define([
	"knockout"
	],
	function(ko){

		function Store(){
			this.meta = {};
			this.data = {};
		}

		Store.prototype.add_type = function(meta) {
			this.meta[meta.type] = meta;
			this.data[meta.type.toLowerCase()] = ko.observableArray();
		};

		Store.prototype.meta_for = function(obj) {
			return this.meta[obj._type];
		};

		Store.prototype.get_item_by_id = function(type,id) {
			return this.data[type.toLowerCase()]().find(function(item){
				return item.id==id;
			});
		};

		Store.prototype.save = function(obj) {
			var type = obj._type.toLowerCase();
			var item = this.get_item_by_id(type,obj.id);
			if(item){
				var index = this.data[type].indexOf(item);
				if(index !== -1){
					this.data[type].remove(item);
					this.data[type].splice(index,null,obj);
				}
			} else {
				this.data[type].push(obj);
			}
		};

		Store.prototype.remove = function(item) {
			var value = this.get_item_by_id(item._type,item.id);
			if(value){
				this.data[value._type.toLowerCase()].remove(value);
			}
		};

		return Store;
	}			
);