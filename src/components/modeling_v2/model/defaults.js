define([],function(){
	
	var DEFAULT_SQL_MAP = [
 		["varchar", "String", function(c){ 
 			return { size:c["Type"].split("(")[1].split(')')[0] }; 
 		}],
 		["int", "Integer", null],
 		["bigint", "Integer", null],
 		["float", "Float", null],
 		["decimal","Numeric", function(c){
 			var v = c["Type"].split("(")[1].split(')')[0].split(',')
 			return { precision:v[0], scale:v[1] }; 
 		}],
 		["datetime", "Datetime", null],
 		["date", "Date", null],
 		["time", "Time", null],
 		["enum", "Enum", function(c){ 
 			return { values:c["Type"].split("(")[1].split(')')[0].split("'").join("") }; 
 		}],
 		["text", "Text", null],
 		["blob", "Text", null]
 	];
	
	var DEFAULT_TYPES = [
 		"String","Integer","Numeric","Datetime","Date","Time","Enum","Boolean","Text"
 	];
	
	var MYSQL_TYPES = {
		0:"DECIMAL",
		1:"TINY",
		2:"SHORT",
		3:"LONG",
		4:"FLOAT",
		5:"DOUBLE",
		6:"NULL",
		7:"TIMESTAMP",
		8:"LONGLONG",
		9:"INT24",
		10:"DATE",
		11:"TIME",
		12:"DATETIME",
		13:"YEAR",
		14:"NEWDATE",
		15:"VARCHAR",
		16:"BIT",
		246:"NEWDECIMAL",
		247:"ENUM",
		248:"SET",
		249:"TINY_BLOB",
		250:"MEDIUM_BLOB",
		251:"LONG_BLOB",
		252:"BLOB",
		253:"VAR_STRING",
		254:"STRING",
		255:"GEOMETRY"
	};
	
	var camelCase = (function () {
	    var DEFAULT_REGEX = /[-_]+(.)?/g;

	    function toUpper(match, group1) {
	        return group1 ? group1.toUpperCase() : '';
	    }
	    return function (str, delimiters) {
	        return str.replace(delimiters ? new RegExp('[' + delimiters + ']+(.)?', 'g') : DEFAULT_REGEX, toUpper);
	    };
	})();
	
	function default_options(options,name,default_value){
		if(options && options[name] !== undefined){
			return options[name];
		}
		return default_value;
	}
	
	return {
		DEFAULT_SQL_MAP: DEFAULT_SQL_MAP,
		DEFAULT_TYPES: DEFAULT_TYPES,
		default_options: default_options,
		camelCase: camelCase
	}

});