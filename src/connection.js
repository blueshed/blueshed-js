
define(
	["jquery",
     "knockout"], 

	function (jquery,ko) {
    	'use strict';
	
		var RECONNECT_TIME_DEFAULT = 3000;
		var RECONNECT_TIME = RECONNECT_TIME_DEFAULT;
		var RECONNECT_TIMEOUT = null;
		
		function _reconnect_(callback){
			RECONNECT_TIMEOUT = setTimeout(function(){ 
				RECONNECT_TIMEOUT = null;
				callback();
			}, RECONNECT_TIME);
			RECONNECT_TIME = RECONNECT_TIME + RECONNECT_TIME;
		};
		
		function _reconnected_(){
			if(RECONNECT_TIMEOUT !== null){
				clearTimeout(RECONNECT_TIMEOUT);
				RECONNECT_TIMEOUT = null;
			}
		};


		function Connection(ws_url){
			this._ws_ = null;
			this.ws_url = ws_url || "/websocket";	
			this._request_id_seed_ = 0;
			this._request_callbacks_ = {};
			this.status = ko.observable(this.settings.status.DISCONNECTED);
			this.broadcast = ko.observable();
			this.error = ko.observable();
			
			// ping to keep connection alive
			setInterval(function(){
				if(this.is_connected()){
					// send a ping
					this.send({action:"ping"})
				}
			}.bind(this), 30000);
		}
		
		
		Connection.prototype.settings = {
			status: {
				DISCONNECTED: 'Disconnected',
				CONNECTING: 'Connecting',
				CONNECTED:'Connected'
			} 
		};
		
		
		Connection.prototype.is_connected = function(){
			/**
			 * returns true if currently connected
			 */
			return this.status() == this.settings.status.CONNECTED;
		};
		
		Connection.prototype._next_request_id_ = function(callback, target){
			/**
			 * Increment the _request_id_seed_ and use it as key
			 * to add callback,target to _request_callbacks_
			 */
			this._request_id_seed_ = this._request_id_seed_ + 1;
			var request_id = this._request_id_seed_;
			this._request_callbacks_[request_id] = [callback, target];
			return request_id;
		};
		
		
		Connection.prototype.connect = function(callback,target){
			var that = this;
			_reconnected_();
			this.status(that.settings.status.CONNECTING);
			var protocol = document.location.protocol == "https:"? "wss://" : "ws://";
			var ws = new WebSocket(protocol + document.domain + ":" + document.location.port + this.ws_url);
			ws.onopen = function(){
				that._ws_ = ws;
				that.status(that.settings.status.CONNECTED);
				if(callback){
					callback.apply(target || that);
				}
				RECONNECT_TIME = RECONNECT_TIME_DEFAULT;
			};
			ws.onmessage = function (evt) {
				var response = jquery.parseJSON(evt.data);
				try{
					if(response.access_error){
						window.location = "/logout";
						return;
					}
					if(response.response_id && that._request_callbacks_[response.response_id]){
						var callback = that._request_callbacks_[response.response_id]
						if(callback[0]){
							callback[0].call(callback[1] || that,response);
						}
					} else{
						that.broadcast(response);
					}
				}
				catch(err){
					console.log(err.stack);
					debugger;
				}
			};
			ws.onclose = function(evt){
				that._ws_ = null;
				that.status(that.settings.status.DISCONNECTED);
				if('access control failure'==evt.reason){
					that.error("You have been disconnected.");
					return;
				}
				that.status('reconnecting in ' + (RECONNECT_TIME/1000) + ' secs');
				_reconnect_(function(){that.connect()});
			};
			ws.onerror = function(err){
				that.error("ws error " + err);
			};
		};
		
		
		Connection.prototype.send = function(message, callback, target){
			// console.log(message);
			this.error(null);
			message['request_id'] = this._next_request_id_(callback,target);
			if(this.is_connected() === true){
				this._ws_.send(ko.toJSON(message));
			}
		};
		
		
		Connection.prototype.rpc = function(method, args, callback, target){
			this.send({
				action: method,
				args: args
			},callback,target)
		};
		
		return Connection;
	}
);
