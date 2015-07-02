define([],function(){
	
	function randomStr(m) {
    	var m = m || 9;
    	var s = '', r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    	for (var i=0; i < m; i++) { 
    		s += r.charAt(Math.floor(Math.random()*r.length)); 
    	}
    	return s;
    };
    
    return randomStr;
});