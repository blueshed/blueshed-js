define([
		"knockout",
		"text!./main-tmpl.html",
		"./cursor",
		"blueshed/editor",
		"./colours",
		"text!./cursor-table-tmpl.html",
		"text!./editor-form-tmpl.html",
		"text!./field-selector-tmpl.html",
		"blueshed/bindings/ko-popover",
		"knockout-sortable",
		"knockout-switch-case"
	],
	function(ko, main_tmpl, Cursor, Editor, colours,
			cursor_table_tmpl,
			editor_form_tmpl,
			field_selector_tmpl){


		ko.components.register("cursor-table",{template:cursor_table_tmpl});
		ko.components.register("editor-form",{template:editor_form_tmpl});
		$('head').append('<script type="text/html" id="inspector-field-selector">'+
				field_selector_tmpl+'</script>');


		function Panel(params){
			window.panel = this;
			this.appl = params.appl;
			this.cursor = new Cursor({store:this.appl.store});
			this.show_types = ko.observable(0);
			this.display_many = ko.observable();
			this.many_cursor = new Cursor({store:this.appl.store});

			this.editing = ko.observable();
			this.colours = colours;

			this.update_many_model = ko.computed(function(){
				if(this.display_many() && 
				   this.cursor.selected() && 
				   this.cursor.selected_data()){
				   	if(this.display_many().direction == "ONETOMANY"){
						this.many_cursor.load_entity(
							this.cursor.find(this.display_many().type),
							this.display_many().fkey,
							this.cursor.selected_data().id);
					} else {
						this.many_cursor.load_entity_attribute(
							this.cursor.selected(),
							this.display_many(),
							this.cursor.selected_data().id);
					}
					return this.many_cursor;
				}
			},this);

			// respond to navigation
			if(params.args.length){
				var name = params.args[0];
				var item = this.cursor.find(name);
				this.change_entity(item);
			}

			this.subs = [
				this.cursor.selected.subscribe(function(item){
					// adjust naviagtion
	            	if(item){
						this.appl.extend_path([item.name]);
					} else {
						this.appl.extend_path();
					}
				},this),
				this.cursor.selected_data.subscribe(function(item){
					if(!item){
						this.many_cursor.reset();
					}
				},this)
			];
		}

		Panel.prototype.init = function() {
			
		};

		Panel.prototype.dispose = function() {
			this.subs.map(function(item){
				item.dispose();	
			});
			this.many_cursor.dispose();
			this.cursor.dispose();
		};

		Panel.prototype.change_entity = function(value) {
			this.many_cursor.reset();
			this.display_many(null);
			this.cursor.load_entity(value);
		};

		Panel.prototype.add = function() {
			var seed = this.cursor.store.seed_for(this.cursor.selected().name);
			var meta = this.cursor.selected();
			this.editing(new Editor(seed,meta));
		};

		Panel.prototype.add_related = function() {
			if(this.display_many().direction == "ONETOMANY"){
				var fkey_name = this.display_many().fkey;
				var fkey_value = ko.unwrap(this.cursor.selected_data().id);
				var related_property = this.many_cursor.selected().relations.find(function(item){
					return item.fkey == fkey_name;
				});
				var args = {};
				args[fkey_name]=fkey_value;
				args[related_property.name]=this.cursor.selected_data();
				var seed = this.many_cursor.store.seed_for(this.many_cursor.selected().name,args);
				var meta = this.many_cursor.selected();
				this.editing(new Editor(seed,meta));
			}
		};

		Panel.prototype.edit = function() {
			var item = this.cursor.selected_data();
			this.editing(item ? new Editor(ko.toJS(item), 
										   this.cursor.selected()) : null);
		};

		Panel.prototype.edit_related = function() {
			var item = this.many_cursor.selected_data();
			this.editing(item ? new Editor(ko.toJS(item), 
										   this.many_cursor.selected()) : null);
		};

		Panel.prototype.save = function() {
			this.cursor.store.save(this.editing().save(), function(result){
				this.editing(null);
				this.cursor.load(); // NO tbd:signal internally
			}.bind(this));
		};

		Panel.prototype.cancel = function() {
			this.editing(null);
		};

		Panel.prototype.remove = function() {
			if(this.editing()){
				if(!this.editing().id){
					this.cancel();
					return;
				}
			}
			if(this.cursor.selected_data().id){
				this.appl.confirm("Remove Project","Are you sure you want to remove this project?",function(){
					this.appl.close_dialog();
					this.appl.store.remove(this.cursor.selected_data(), function(){
						this.cancel();
						this.appl.notify("Removed!");
					}.bind(this));
				}.bind(this),"Remove","danger");
			}
		};

		Panel.prototype.filter_for = function(meta, query, callback, err_back){
			var target_meta = this.cursor.find(meta.type);
			var field = target_meta.fields.find(function(item){
				return item.name=="name" || item.name=="label";
			});
			var args = { type: meta.type };
			if(field){
				args.filter = query.data.q;
				args.attr = field.name;
			} else {
				args.match = query.data.q;
				args.attr = "id";
			}
			this.appl.store._fetch(args,
				function(result){
					callback({
						results: result.rows.map(function(item){
							return this.cursor.surrogate_for(item);
						}.bind(this))
					});
				}.bind(this));

		};

		Panel.prototype.placeholder_for = function(meta, item){
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

		Panel.prototype.photo_args = function(meta){
			return this.appl.store.photo_args(this.editing().photo,meta.type);
		};

        Panel.prototype.open_photo = function(title,src){
        	src = ko.unwrap(src);
        	if(src){
        		this.appl.open_dialog("photo-dialog",{
        			src: src.replace("/small.","/original."),
        			title: title
        		});
        	}
        };
        
        
        Panel.prototype.table_keydown = function(cursor,d,e){
    	    switch(e.which) {
    	        case 37: // left
    	        break;

    	        case 38: // up
    	        	if(cursor.selected_data()){
    	        		var index = cursor.items.indexOf(cursor.selected_data());
    	        		if(index != 0){
    	        			cursor.selected_data(cursor.items()[index-1]);
    	        		}
    	        	}
    	        break;

    	        case 39: // right
    	        break;

    	        case 40: // down
    	        	if(cursor.selected_data()){
    	        		var index = cursor.items.indexOf(cursor.selected_data());
    	        		if(index < cursor.items().length-1){
    	        			cursor.selected_data(cursor.items()[index+1]);
    	        		}
    	        	}
    	        break;

    	        default: return; // exit this handler for other keys
    	    }
    	    e.preventDefault(); // prevent the default action (scroll / move caret);
        }

		return {
			template: main_tmpl,
			viewModel: Panel
		};
	}
);