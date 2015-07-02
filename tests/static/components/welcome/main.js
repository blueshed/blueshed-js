define(["knockout",
		"text!./main-tmpl.html",
		"blueshed/editor",
		"blueshed/notify",
		"blueshed/dialog",
		"blueshed/templates/main"],
	function(ko, main_tmpl, Editor, notify, dialog){


		function Panel(params){
			this.appl = params.appl;
			this.message = params.message;
			this.params = params;

			this.items = this.appl.store.data.person;
			this.editing = ko.observable();
			this.start_editing = ko.observable();

			this.selected = ko.observable();
			this.selected.subscribe(function(item){
				if(item){
					setTimeout(function(){
						this.editing(new Editor(item, this.appl.store.meta_for(item)));
						this.start_editing(true);
						if(item.id){
							var href = "#welcome/" + item._type.toLowerCase() + "/" + item.id;
							this.appl.routes.set_hash_silently(href);
						}
					}.bind(this),150);
				} 
				this.editing(null);
			},this);
		}

		Panel.prototype.init = function(){
			Editor.prototype.id_seed = 2;

			if(this.params.id){
				var item = this.appl.store.get_item_by_id(this.params.type, this.params.id);
				if(item){
					this.selected(item);	
				} else {
					notify("That person no longer exitsts!","warning",".top-right");
				}
			}
		};

		Panel.prototype.dispose = function(){};

		Panel.prototype.add = function() {
			this.selected({_type:'Person',lastname:'ananymous'});
		};

		Panel.prototype.cancel = function() {
			this.selected(null);
		};

		Panel.prototype.remove = function() {
			var item = this.selected();
			dialog.confirm("Remove item","Are you sure you want to remove this item?",function(){
				this.selected(null);
				dialog.close_dialog();
				this.appl.store.remove(item);
			}.bind(this),"Remove","danger");
		};

		Panel.prototype.save = function() {
			var values = this.editing().save();
			this.appl.store.save(values);
			this.selected(values);
		};

		return {
			viewModel: Panel,
			template: main_tmpl
		};

});