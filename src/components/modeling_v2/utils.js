define(
   [],
   function () {

      var utils = {};
   
      String.prototype.toUnderscore = function(){
         var result = this.replace(/([A-Z])/g, function($1){return "_"+$1.toLowerCase();});
         if(result.charAt(0)==="_"){
            result = result.substring(1,result.length);
         }
         return result;
      };
   
      String.prototype.toTitleCase = function(){
         return this.charAt(0).toUpperCase() + this.substring(1,this.length).toLowerCase();
      };
   
   
      utils.default_options = function(options,name,default_value){
         if(options && options[name] !== undefined){
            return options[name];
         }
         return default_value;
      }

      return utils;
   }
);