define(["knockout",
		"blueshed/appl",
		"blueshed/routes",
		"blueshed/notify",
		"blueshed/dialog",
		"blueshed/connection",
		"blueshed/store",
		"components/welcome/main",
		"components/good-bye/main",
		"blueshed/components/modeling/main"],
	function(ko, 
			 Appl, Routes, notify, dialog,
			 Connection, Store,
			 Welcome, 
			 GoodBye,
			 Modeling){

		ko.components.register("welcome",Welcome);
		ko.components.register("good-bye",GoodBye);
		ko.components.register("modeling",Modeling);

		Appl.prototype.init = function(){
			this.title("BootApp4");

			this.store = new Store();
			this.store.add_type({
				type: "Person",
				fields:[
					{name:'firstname', type:'string', validation:{minLength:3,required:true}},
					{name:'lastname', type:'string', validation:{minLength:3,required:true}},
					{name:'email', type:'string', validation:{required:true,email:true}}
				]
			});
			this.store.save({_type:'Person',id:1,email:'pete@blueshed.co.uk',firstname:'Peter',lastname:'Bunyan'});
			this.store.save({_type:'Person',id:2,email:'sam@blueshed.co.uk',firstname:'Samantha',lastname:'Campbell-Jones'});

			this.connection = new Connection();
			this.connection.error = this.error;
			this.connected = ko.pureComputed(function(){
				return this.connection.is_connected();
			},this);

			this.user = ko.observable();

			this.routes = new Routes(this);
			this.routes.title("<img src='static/images/favicon.png'/>");

			this.routes.set_default(
				this.routes.add_to_left_menu({
					route: "modeling", 
					action: this.modeling.bind(this), 
					href: "#/modeling",
					title: "Modeling"}
				));

			this.routes.add_to_left_menu({
				route: "welcome/:type:/:id:", 
				action: this.welcome.bind(this), 
				href: "#/welcome",
				title: "Welcome"}
			);

			this.routes.add_to_right_menu({
				route: "finish", 
				action: this.finish.bind(this), 
				title: "Exit"
			});

			this.routes.add_to_service_menu({
				action: this.edit_profile.bind(this), 
				title: "Edit Profile"
			});

			this.routes.add_to_service_menu({
				action: this.change_password.bind(this), 
				title: "Change Password"
			});

			this.routes.add_to_service_menu({
				title: "-"
			});

			this.routes.start();
		};


		Appl.prototype.modeling = function(){
			this.component_params={appl:this};
			this.component("modeling");
		};


		Appl.prototype.welcome = function(type,id){
			this.component_params={appl:this,message:"Hello!",type:type,id:id};
			this.component("welcome");		
			notify("welcome");
		};


		Appl.prototype.finish = function(){
			this.component_params={appl:this,message:"Good Bye!"};
			this.component("good-bye");	
			notify("good-bye");
		};

		Appl.prototype.edit_profile = function(){
			dialog.confirm(
				"Edit Profile",
				"Are you sure you want to edit your profile?",
				dialog.close_dialog.bind(dialog));
		};


		Appl.prototype.change_password = function(){
			dialog.confirm(
				"Change Password",
				"Are you sure you want to chnage your password?",
				dialog.close_dialog.bind(dialog),
				"Yes",
				'danger');
		};

	return Appl;
});