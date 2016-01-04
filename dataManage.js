
/* 
 *
 */
module.exports = function(opt){
    
    var dataIndex,
        storageKey, 
        projectName, 
        uid = !!$CONFIG? $CONFIG['uid']: "";

    var tempData = null;
    var localStorage = window.localStorage;
   
    var that = {};

    var core = {
        set: function(key, data, flag){
            try{
                localStorage.setItem(key, data || '');
            }catch(e){
                if(flag) return '[too Long]';
                base.memReplace(data.length);
                core.set(key, data, true);
            }
            //localStorage.setItem(key, data || '');
        },
        get: function(key){
            // var _d = localStorage.getItem(storageKey);
            // return !!_d? _d: null;
            return localStorage.getItem(key);
        },
        remove: function(key){
            localStorage.removeItem(key);
        },
        clear: function(){
            localStorage.clear();
        }
    };


    var base = {
        isArray: function(d){
            return (Object.prototype.toString.call(d) === '[object Array]')
        },
        timeStamp: function(){
            return new Date().getTime();
        },
        genKey: function(){
            projectName = opts.projectName || "Ria";
            uId = opts.uId || "";
            storageKey = [projectName, uId].join("_");
        },
        encode: function(data){
            return encodeURI(JSON.stringify(data));
        },
        decode: function(data){
            return JSON.parse(decodeURI(data));
        },

        setData: function(key, data){
            core.set(key, base.encode(data));
        },
        getData: function(key){
            return base.decode(core.get(key));
        },
        memReplace: function(len){
            //fifo
            var arr = dataIndex.map;
            arr.sort(by("timeStamp"));
            var outLen = 0;
            for(var i=0, l=arr.length;i<l;++i){
                var out = arr.pop();
                outLen += out.len;
                core.remove(out.key);
                if(outLen >= len) return true;
            }
            return false;
        }

    }

    var indexFun = {
        setIndex: function(key, len, cb){
            var ts = base.timeStamp();

            dataIndex.lastread = ts;
            dataIndex.map.push({
                key: key,
                timeStamp:ts,
                len: len,
                cb: cb
            })
            base.setData('storageIndex', dataIndex);
        },
        getIndex: function(){
            var index = base.getData('storageIndex');
            if(index){
                index.uid = uid;
                return index;
            }
            core.clear();
            return indexFun.initIndex();
        },
        updateIndex: function(key, len){
            var arr =  dataIndex.map,
                ts = base.timeStamp();

            dataIndex.lastread = ts;
            for(var i=0, l=arr.length; i<l; ++i){
                if(arr[i].key == key){
                    var item = arr[i];
                    item.timeStamp = ts;
                    item.len = len;     
                }
            }
            // dataIndex[key].timeStamp = base.timeStamp();
            // dataIndex[key].len = len;
            // base.setData('storageIndex', dataIndex);
        },
        initIndex: function(){
            return {uid:uid, map:[]};
        },
        checkHistory: function(){
            return base.timeStamp() - dataIndex.lastread > 300000;//(5min)
        },
        checkUser: function(){
            return dataIndex.uid == uid;
        },
        checkKey: function(key){
            var arr = dataIndex.map;
            for(var i=0,l=arr.length; i<l; ++i){
                if(arr[i].key == key) return true;
            }
            return false;
        }
    }

    var crud = {
        create: function(key, val, callback){
            if(callback){
                callback = callback.toString();
            }

            val = base.encode(val);
            core.set(key, val);

            indexFun.setIndex(key, val.length, callback);
        },
        find: function(key, selector){
            if(dataIndex[key].cb){console.log('hasCB');return;}
            //selector
            var d = base.getData(key);
            return matchSelector(selector, d);
        },
        insert: function(key, selector, val){
            return resultOperation(key, selector, val);
        },
        update: function(key, selector, val){
            return resultOperation(key, selector, val, true);
        },
        del: function(key, selector){
            if(!selector){
                core.remove(key);
            }
            var d = core.get(key);
            if(matchSelector(selector, d)){
                core.set(d);
                return true;
            }
            return false;
        }
    }

    // var eventSys = {

    // }


    init(); 

    that.interData = interData;
    that.table = Table;

    return that;
    
    function init(){
        dataIndex = indexFun.getIndex();
    }

    /*
     * merge new Property to the origin one(won't destroy the origin structure)
     */
    function merge(base, extend){
        for(var key in base){
            if (base.hasOwnProperty(key) && extend.hasOwnProperty(key)){
                base[key] = extend[key];
            }
        }
    }

    /*
     * Array insert/ Object update 
     */
    function resultOperation(data, selector, val, flag){
        //var d = base.getData(key);
        //var t = base.matchSelector.call(this, selector, d);
        var t = matchSelector(selector, data);
        if(!t) return false;

        if(flag){
            merge(t, val);  
        }
        else{            
            val = [].concat(val);
            for(var i=0,l=val.length; i<l; ++i){
                t.push(val[i]);
            }
        };
        var d = base.encode(data);
        core.set(key, d);
        indexFun.updateIndex(key, d.length);
        return true;
    }

    /*
     * find the key-val in data by selector
     */
    function matchSelector(sel, data){

        for(var i in sel){
            if(!i) return data;

            if(sel.hasOwnProperty(i) && data.hasOwnProperty(i)){
                if(typeof sel[i] ===  'object'){
                    if(base.isArray(sel[i])){//arr
                        var ls = sel[i].length;
                        if(ls == 0) return data[i];

                        for(var k=0; k<ls; ++k){
                            for(var j=0, ld=data[i].length; j<ld; ++j){
                                var t = matchSelector(sel[i][k], data[i][j]);
                                if(t) return t;
                            }
                        }
                        return false;
                    }else{//obj
                        return matchSelector(sel[i], data[i])
                    }
                }
                else{//text//
                    if(data[i] == sel[i]){
                        return data;
                    }
                    else{
                        return false;
                    }
                }
            }
            else{
                console.log('[not Found]');
                return false;
            }
        }
    }

    /*
     * sort compare function for Object-key sort
     */
    function by(key){
        return function(o1, o2){
            var v1 = o1[key],
                v2 = o2[key];
            if(v1 < v2){
                return 1;
            }else if(v1 > v2){
                return -1;
            }else{
                return 0;
            }
        }
    }



    function interData(key){
        function F(){
            if(indexFun.checkKey(key)){
                this.data = base.getData(key);
                this.key = key;
            }
            else{
                this.data = null;
                this.key = key;
            }            
        }

        F.prototype.create = interCreate;
        F.prototype.find = interFind;
        F.prototype.insert = interInsert;
        F.prototype.update = interUpdate;
        F.prototype.remove = interRemove;

        return new F();
    }


    function interCreate(val, callback){
        if(callback){
            callback = callback.toString();
        }
        this.data = val;
        console.log(val);
        val = base.encode(val);
        core.set(this.key, val);

        indexFun.setIndex(this.key, val.length, callback);
        return this;
    }
    function interFind(selector){
        if(dataIndex[key].cb){console.log('hasCB');return;}
        //selector
        //var d = base.getData(key);
        var d = this.data;
        return matchSelector(selector, d);
    }

    function interInsert(selector, val){
        return resultOperation(this.data, selector, val);
    }

    function interUpdate(selector, val){
        return resultOperation(this.data, selector, val, true);
    }
    function interRemove(selector){
        // if(!selector){
        //     core.remove(key);
        // }
        // var d = core.get(key);
        // if(matchSelector(selector, d)){
        //     core.set(d);
        //     return true;
        // }
        // return false;
    }

    function Table(key){

    }

    function matchSelectorDel(sel, data){

        for(var i in sel){
            if(!i) return data;

            if(sel.hasOwnProperty(i) && data.hasOwnProperty(i)){
                if(typeof sel[i] ===  'object'){
                    if(base.isArray(sel[i])){//arr
                        var ls = sel[i].length;
                        if(ls == 0) return data[i];

                        for(var k=0; k<ls; ++k){
                            for(var j=0, ld=data[i].length; j<ld; ++j){
                                var t = matchSelectorDel(sel[i][k], data[i][j]);
                                if(t) return t;
                            }
                        }
                        return false;
                    }else{//obj
                        return matchSelectorDel(sel[i], data[i])
                    }
                }
                else{//text//
                    if(data[i] == sel[i]){
                        return data;
                    }
                    else{
                        return false;
                    }
                }
            }
            else{
                console.log('[not Found]');
                return false;
            }
        }
    }
}
