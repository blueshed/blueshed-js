define(["knockout",
        "knockout-mapping",
    "blueshed/utils/random-str"],
    function(ko, mapping, randomStr){

        var DEFAULT_TYPES = [
            "String","Integer","Numeric",
            "DateTime","Date","Time",
            "Enum","Boolean","Text"
        ];
        var MANY_DIRECTIONS = ["ONETOMANY","MANYTOMANY"];

        function Store(connection, error, notify){
            this.connection = connection;
            this.error = error;
            this.notify = notify;
            this.open = ko.observable(false);

            this.model = ko.observableArray();
            this._meta = {};
            this._objs = {};
        }

        Store.prototype.init = function(sqla_model){
            if(this.open()){
                return;
            }
            this.sqla_model = sqla_model;
            sqla_model.map(function(clazz){
                var properties = Object.keys(clazz.properties).map(function(n){
                    return clazz.properties[n];
                });
                var obj = {
                    name: clazz.name,
                    type: clazz.name,
                    model: clazz,
                    // load fields
                    fields: properties.filter(function(property){
                        return DEFAULT_TYPES.indexOf(property.type) != -1 ||
                            (property.attr=="hybrid" && property.read_only==true);
                    },this),
                    scalars: properties.filter(function(property){
                        return DEFAULT_TYPES.indexOf(property.type) != -1 ||
                            (property.direction == "MANYTOONE") ||
                            (property.attr=="hybrid" && property.read_only==true);
                    },this),
                    // load relations
                    relations: properties.filter(function(property){
                        return property.direction;
                    },this)
                };
                // default mapping
                obj.mapping = {
                    copy:["_type","id"],
                    ignore:["_meta_","model"],
                    observable: obj.fields.map(function(i){ return i.name})
                };
                this._objs[clazz.name] = ko.observableArray();
                this._meta[clazz.name] = obj;
                this.model.push(obj);
            },this);
            this.model().map(function(obj){
                obj.relations.map(function(item){
                    var related = this.model().find(function(rel){
                        return rel.name == item.type;
                    });
                    if(MANY_DIRECTIONS.indexOf(item.direction) != -1){
                        obj.mapping[item.name] = {
                            key: function(data) {
                                return ko.utils.unwrapObservable(data.id);
                            }.bind(this),
                            update: function(options){
                                return this._update(related,options.target,options.data)
                            }.bind(this)
                        };
                    } else if(item.direction == "MANYTOONE"){
                        obj.mapping[item.name] = {
                            update: function(options){
                                return this._update(related,options.target,options.data)
                            }.bind(this)
                        };

                    }
                },this);
            },this);

            this.sub = this.connection.broadcast.subscribe(this._handle_update,this);
            this.open(true);
        };

        Store.prototype.dispose = function() {
            this.sub.dispose();
        };


        Store.prototype.get = function(type,id,values) {
            var meta = this._meta[type];
            return this._get(meta,id,values);
        };

        Store.prototype._get = function(meta,id,values) {
            if(id){
                var item = this._find_by_id(meta,this._objs[meta.type],id);
                if(!item){
                    item = this._map(meta,this.seed_for(meta.type,values || {id:id}));
                    this._objs[meta.type].push(item);
                    if(!values){
                        this._fetch({type:meta.type,id:id},function(result){
                            this._update(meta,item,result.value);
                        }.bind(this));
                    }
                }
                return item;
            }
        };

        Store.prototype.list = function(type) {
            var collection = this.collection(type);
            if(collection().length == 0){
                var meta = this._meta[type];
                this._fetch({type: type},
                            function(result){
                                collection(result.rows.map(function(item){
                                    return this._get(meta,item.id,item);
                                },this));
                                this.notify("found " + result.total + " " + type);
                            }.bind(this));
            }
            return collection;
        };

        Store.prototype.filter = function(type, attr, term, target) {
            var collection = target || ko.observableArray();
            if(collection().length == 0){
                var meta = this._meta[type];
                this._fetch({
                                type: type,
                                attr: attr,
                                filter: term
                            },
                            function(result){
                                collection.removeAll();
                                collection(result.rows.map(function(item){
                                    // todo: should look for existing item??
                                    return this._get(meta,item.id,item);
                                },this));
                                this.notify("found " + result.rows.length + " " + type);
                            }.bind(this));
            }
            return collection;
        };

        Store.prototype.collection = function(type) {
            var collection = this._objs[type];
            return collection;
        };

        Store.prototype.load_relation = function(item, relation){
            var meta = this._meta[item._type];
            var attr_meta = meta.relations.find(function(r){
                 return r.name == relation;
            });
            var rel_meta = this._meta[attr_meta.type];
            if(attr_meta.direction){
                var collection = item[relation] || ko.observableArray();
                this._fetch({
                        type: meta.type,
                        id: ko.unwrap(item.id),
                        attr: relation
                    }, function(result){
                        collection.removeAll();
                        collection(result.rows.map(function(item){
                            return this._get(rel_meta,item.id,item);
                        },this));
                        this.notify("found " + result.total + " " + attr_meta.type);
                    }.bind(this));
                return collection;
            } else {
                var attribute = item[relation] || ko.observable();
                this._fetch({
                        type: meta.type,
                        id: ko.unwrap(item.id),
                        attr: relation
                    }, function(result){
                        attribute(this._get(rel_meta,result.id,result.value));
                    }.bind(this));
                return attribute;
            }
        };

        Store.prototype.save = function(item, callback, err_back) {
            this.connection.send({
                    action: 'carry',
                    args: {
                        item:item
                    }
                },function(response){
                    if(response.error){
                        if(err_back){
                            err_back(response.error, response);
                        } else {
                            this.error(response.error);
                        }
                    } else {
                        if(callback){
                            callback(response.result, response);
                        } else{
                            this.notify("Saved!");
                        }
                    }
                }.bind(this));
        };

        Store.prototype.remove = function(item, callback, err_back) {
            this.connection.send({
                    action: 'carry',
                    args: {
                        item:{_type:item._type, id:-ko.unwrap(item.id)}
                    }
                },function(response){
                    if(response.error){
                        if(err_back){
                            err_back(response.error, response);
                        } else {
                            this.error(response.error);
                        }
                    } else {
                        if(callback){
                            callback(response.result, response);
                        } else{
                            this.notify("Removed!");
                        }
                    }
                }.bind(this));
        };



        Store.prototype.fetch = function(args,callback,err_back) {
            var meta = this._meta[args.type];
            this._fetch(args,
                        function(result){
                            if(result.type){
                                meta = this._meta[result.type];
                            }
                            result.rows = result.rows.map(function(item){
                                return this._get(meta,item.id,item);
                            },this);
                            callback(result);
                        }.bind(this));
        };


        Store.prototype._fetch = function(args, callback, err_back){
            this.connection.send({
                action: 'fetch',
                args: {
                    type: args.type,
                    id: args.id || null,
                    attr: args.attr || null,
                    filter: args.filter || null,
                    match: args.match || null,
                    limit: args.limit || null,
                    offset: args.offset || null,
                    order_by: args.order_by || null,
                    order_by_asc: args.order_by_asc || null,
                    depth: args.depth || null,
                    include: args.include || null,
                    ignore: args.ignore || null
                }
            },
            function(response){
                if(response.error){
                    if(err_back){
                        err_back(response.error, response);
                    } else {
                        this.error(response.error);
                    }
                } else {
                    if(callback){
                        callback(response.result, response);
                    }
                }
            }.bind(this));
        };

        Store.prototype._handle_update = function(msg){
            if(msg.signal.indexOf("created ") == 0){
                var meta = this._get_message_type_meta(msg);
                this._objs[meta.type].push(this._map(meta,msg.message));
                // todo: watch relations and see if it should
                // be put into any collection
            }
            else if(msg.signal.indexOf("saved ") == 0){
                var meta = this._get_message_type_meta(msg);
                var item = this._find_by_id(meta, this._objs[meta.type],msg.message.id);
                if(item){
                    this._update(meta,item,msg.message);
                }
            }
            else if(msg.signal.indexOf("deleted ") == 0){
                var meta = this._get_message_type_meta(msg);
                var item = this._find_by_id(meta, this._objs[meta.type],msg.message.id);
                if(item){
                    this._objs[meta.type].remove(item);
                    // todo: walk relations and see if it should
                    // be removed from any collection
                }
            }
            else if(msg.signal.indexOf("added") != -1){
                // todo: find target and items
                // if target has collection add item
            }
            else if(msg.signal.indexOf("removed") != -1){
                // todo: find target and items
                // if target has collection remove item
            }
        };

        Store.prototype.seed_for = function(type, defaults){
            var meta = this._meta[type];
            result = {
                id: null,
                _type: meta.type
            };
            meta.fields.map(function(field){
                result[field.name]=field.default_value || null;
            },this);
            return ko.utils.extend(result,defaults || {});
        };

        Store.prototype._get_message_type_meta = function(msg) {
            var type = msg.message._type;
            if(type && this._meta[type]){
                return this._meta[type];
            }
        };

        Store.prototype._find_by_id = function(meta, items, id){
            return ko.unwrap(items).find(function(item){
                return ko.unwrap(item.id)==id;
            });
        };

        Store.prototype._map = function(meta, options){
            return mapping.fromJS(options,meta.mapping,{_meta_:meta});
        };

        Store.prototype._update = function(meta, item, options){
            return mapping.fromJS(options,meta.mapping,item);
        };

        Store.prototype._save = function(meta, item){
            return mapping.toJS(item,meta.mapping);
        };

        Store.prototype.photo_args = function(photo, prefix){
            var args = {
                url: "/images/",
                maxFiles:1,
                createImageThumbnails: true,
                success: function(file,response){
                    photo(response.result.file.small);
                }.bind(this),
                sending: function(file, xhr, formData) {
                    formData.append("prefix", prefix + '/' + randomStr(8));
                }.bind(this),
                complete:function(file){
                    this.removeFile(file);
                },
                dictDefaultMessage:"Drop files here or 'click' to add image"
            };
            return args;
        };

        return Store;
    }
);
