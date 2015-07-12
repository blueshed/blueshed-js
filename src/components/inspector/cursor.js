define([
		"knockout",
		"text!./main-tmpl.html",
		"blueshed/notify"
	],
	function(ko, main_tmpl, notify){

		var MANY_DIRECTIONS = ["ONETOMANY","MANYTOMANY"];

		function Cursor(params){
			this.store = params.store;
			this.model = this.store.model;
			this.selected = ko.observable();
			this.query_entity = ko.observable();
			this.selected_data = ko.observable();


			this.order_by = ko.observable();
			this.order_by_asc = ko.observable(false);
			this.offset = ko.observable(0);
			this.limit = ko.observable(10);
			this.total = ko.observable(0);
			this.filter_total = ko.observable(0);

			this.id = ko.observable();
			this.attribute = ko.observable();
			this.attribute_value = ko.observable();

			this.items = ko.observableArray();
			this.visible_columns = ko.observableArray();
			this.order_columns = ko.observableArray();

			this.all_columns = ko.computed(function(){
				var result = [];
				if(this.selected()){
					result = this.selected().scalars.
						filter(function(item){
							return item.fkey!==true;
						},this).
						map(function(item){
						var col = {
							search: ko.observable()
						};
						for(name in item){
							col[name] = item[name];
						}
						return col;
					});
				}
				this.visible_columns(result.slice(0));
				this.order_columns(result.slice(0));
				return result;
			},this);
			this.columns = ko.pureComputed(function(){
				return this.order_columns().filter(function(item){
					return this.visible_columns.indexOf(item) != -1;
				},this).slice(0);
			},this);
			this.many_relations = ko.pureComputed(function(){
				if(this.selected()){
					return this.selected().relations.filter(function(item){
						return MANY_DIRECTIONS.indexOf(item.direction) != -1;
					},this);
				}
			},this);


			this.subs = [
			    this.selected.subscribe(function(item){
					this.reset();
					this.load();
				},this),
				this.store.broadcast.subscribe(function(msg){
					if(msg){
						if(msg.signal=="created"){
							// should we add it to the list??
						}
						if(msg.signal=="updated"){
							// noop - our items in items are updated by store
						}
						if(msg.signal=="deleted"){
							var item = this.find_item_by_id(msg.item._type,msg.item.id);
							if(item){
								if(item == this.selected_data()){
									this.selected_data(null);
								}
								this.items.remove(item);
							}
						}
					}
				},this)
			];
		}

		Cursor.prototype.dispose = function() {
			this.subs.map(function(item){
				item.dispose();
			});
		};
		
		
		Cursor.prototype.find_item_by_id = function(type, id){
			return this.items().find(function(item){
				return ko.unwrap(item._type)==type && ko.unwrap(item.id)==id;
			});
		};

		Cursor.prototype.load_entity = function(entity, match, value) {
			this.reset();
			this.attribute(match || null);
			this.attribute_value(value || null);
			this.id(null);
			if(this.selected() != entity){
				this.query_entity(entity);	
				this.selected(entity);	
			} else {
				this.load();
			}
		};

		Cursor.prototype.load_entity_attribute = function(entity, attribute, value) {
			this.reset();
			this.attribute(attribute.name);
			this.id(value);
			var result_entity = this.find(attribute.type);
			if(this.query_entity() != entity){
				this.query_entity(entity);	
				this.selected(result_entity);	
			} else {
				if(this.selected() != result_entity){
					this.selected(result_entity);	
				}
				this.load();
			}
		};

		Cursor.prototype.find = function(name) {
			return this.model().find(function(item){
				return item.name == name;
			},this);
		};

		Cursor.prototype.find_property = function(name) {
			return this.properties().find(function(item){
				return item.name == name;
			},this);
		};

		Cursor.prototype.reset = function() {
			this.order_by(null);
			this.order_by_asc(false);
			this.offset(0);
			this.limit(10);
			this.total(0);
			this.filter_total(0);
			this.selected_data(null);
			this.items.removeAll();
		};

		Cursor.prototype.load = function() {
			if(!this.selected()){
				return;
			}
			var type = this.query_entity().name;
            this.store.fetch({
        		type: type,
        		id: this.id(),
        		attr: this.attribute(),
        		match: this.attribute_value(),
        		offset: this.offset(), 
        		limit: this.limit(),
        		order_by: this.order_by(),
        		order_by_asc: this.order_by_asc(),
        		depth:1
            },
            function(result){
            	this.selected_data(null);
            	this.items.removeAll();
                this.items(result.rows);
                if(this.attribute() && this.attribute_value()){
                	this.filter_total(result.filter_total);
                	this.total(result.filter_total);
					notify("found " + result.filter_total + " " + type);
                } else {
                	this.filter_total(result.filter_total || result.total);
                	this.total(result.total);
                	notify("found " + result.total + " " + type);
                }
            }.bind(this));
		};

		Cursor.prototype.next = function(){
			var new_offset = this.offset() + this.limit();
			if(new_offset > this.total()){
				new_offset = 0;
			}
			this.offset(new_offset);
			this.load();
		};

		Cursor.prototype.prev = function(){
			var new_offset = this.offset() - this.limit();
			if(new_offset < 0){
				new_offset = 0;
			}
			this.offset(new_offset);
			this.load();
		};

		Cursor.prototype.change_order_by = function(value) {
			if(this.selected()){
				if(this.order_by() == value){
					this.order_by_asc(!this.order_by_asc());
				} else {
					this.order_by_asc(false);
					this.order_by(value);
				}
				this.load();
			}
		};

		Cursor.prototype.surrogate_for = function(item){
			item = ko.unwrap(item);
			if(item){
				var text = item._type + "[" + ko.unwrap(item.id) + "]";
				if(item.name){
					text =ko.unwrap(item.name);
				} else if(item.label){
					text =ko.unwrap(item.label);
				}
				return {
					_type: item._type,
					id: ko.unwrap(item.id),
					text: text
				};
			}
		};

		Cursor.prototype.surrogate_text = function(item){
			var result = this.surrogate_for(item);
			if(result){
				return result.text;
			}
			return null;
		};

		return Cursor;
	}
);