define(["knockout",
		"./appl",
		"./routes",
		"./notify",
		"./dialog",
		"./connection",
		"./store",
		"../templates/main"],
	function(ko, 
			 Appl, Routes, notify, dialog,
			 Connection, Store){



	return Appl;
});