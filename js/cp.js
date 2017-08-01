function InheritAndExtend(src,dst,ext){
    for( p in src.prototype){
        dst.prototype[p] = src.prototype[p];
    }
    if( ext ){
        for( p in ext){
            dst.prototype[p] = ext[p];
        }
    }
}

function describe(o){
    console.log( "describe:" + o );
    for( i in o ){
        console.log( "  " + i + ":" + o[i] );
    }
}

function log(s){
    //console.log(s);
}

function assert(b){
    if( !b ){
        undefined();
    }
}



function CPBase(name, observed ){

    this._name =name;
    this._containers = [];
    this._observed = [];
    if( observed ){
        this._observed = observed;
    }

    for( var  i = 0 ; i < this._observed.length ; i++ ){
        this._observed[i].addContainer(this);
    }
}



CPBase.prototype = {

    addContainer : function(d){
        this._containers.push(d);
    },

    notifyContainers : function(){
        log( this.name() + ": notifyContainers ");
        for( var i = 0 ; i < this._containers.length ; i++ ){
            var cp = this._containers[i];
            log( "  " + this.name() + ": notifyContainers: " + cp.name() );
            cp.notified();
        }
    },

    notified: function(){
        this.reduceOwnDomain();
        this.reduceObservedDomain();
    },

    describe : function(level){

        var log = console.log;
        if( !level ){
            level = 0;
            log( "DESCRIBE: " + this.name() );
        }
        
        var s = "";
        for( var i = 0 ; i < level ; i++ ){
            s += "  ";
        }
        log( s + this.toString() );

        for( var i = 0; i < this.observed().length ; i++ ){
            this.observed()[i].describe(level+1);
        }
    },

    observed : function(){
        return this._observed;
    },
    
    toString: function(){
        return this.name() + ":[" + (this.canBeTrue()?"t":"_") + (this.canBeFalse()?"f":"_") + "]";
    },

    defined: function(){
        return (this.canBeTrue() && !this.canBeFalse()) || (!this.canBeTrue() && this.canBeFalse());
    },
    
    name: function(){
        return this._name;
    },

    impossible: function(){
        return !this.canBeTrue() && !this.canBeFalse();
    },

    canBeTrue: function(){
        return this._canBeTrue;
    },

    canBeFalse: function(){
        return this._canBeFalse;
    },

    isFalse: function(){
        return this.defined() && this.canBeFalse();
    },

    isTrue: function(){
        return this.defined() && this.canBeTrue();
    },

    reduceOwnDomain: function(){
        return false;
    },

    reduceObservedDomain: function(){
        return false;
    }


};

function CPBoolean(name,observed){
    CPBase.call(this,name,observed);
    this._canBeTrue = true;
    this._canBeFalse = true;
}


InheritAndExtend(CPBase,CPBoolean, {
    remove: function(value){
        log( this.name() + ": remove:" + value );
        if( value && this._canBeTrue ){
            log( "  " + this.name() + ": remove: removed true");
            this._canBeTrue = false;
            this.reduceObservedDomain();
            this.notifyContainers();
            return true;
        }
        
        if( !value && this._canBeFalse ){
            log( "  " + this.name() + ":  remove: removed false");
            this._canBeFalse = false;
            this.reduceObservedDomain();
            this.notifyContainers();
            return true;
        }
        
        return false;
    },
});

function CPNumberTrue(cps,number){
    this._number = number;
    var names = "";
    for( var i = 0 ; i < cps.length ; i++ ){
        names += " " + cps[i].name();
    }
    CPBoolean.call(this,"AreTrue(" + number + ")(" + names + ")", cps );
}

InheritAndExtend(CPBoolean,CPNumberTrue, {

    number : function(){
        return this._number;
    },

    status : function(){
        var cps = this.observed();

        var ret = {
            falses : [],
            trues : [],
            undefineds : []
        }

        for( var i = 0 ; i < cps.length ; i++ ){
            if( cps[i].isFalse() ){
                ret.falses.push(cps[i]);
            }
            if( cps[i].isTrue() ){
                ret.trues.push(cps[i]);
            }
            if( !cps[i].defined() ){
                ret.undefineds.push(cps[i]);
            }
        }
        
        return ret;
    },
    
    reduceOwnDomain: function(){
        var cps = this.observed();

        //var log = function(s){ console.log(s); };

        
        var s = this.status();
        
        log( this.name() + ": reduceOwndomain" );

        var ret = false;
        
        if( s.trues.length > this.number() ){
            log( "  " + this.name() + ": trueNumber:" + s.trues.length + ": more true than expected");
            ret |= this.remove(true);
        }
        else if( s.falses.length > cps.length - this.number() ){
            log( "  " + this.name() + ": falses.length:" + s.falses.length + ": more false than expected" );
            ret |= this.remove(true);
        }
        else if( s.falses.length  + s.trues.length == cps.length ){
            log( "  " + this.name() + ": all defined and number correct" );
            ret |= this.remove(false);
        }
        return ret;
    },

    reduceObservedDomain: function(){
        var cps = this.observed();
        var log = function(){};

        var s = this.status();
        var remainingTrues = this.number() - s.trues.length;
        var possibleTrues = s.undefineds.length;
        
        if( this.isTrue() ){
            assert( s.trues.length <= this.number() );
            if( remainingTrues == possibleTrues ){
                log( this.name() + ": needed some more trues, the same as undefined");
                for( var i = 0 ; i < s.undefineds.length ; i++ ){
                    s.undefineds[i].remove(false);
                }
                return true;
            }
        }

        if( this.isFalse() ){

            if( s.trues.length == this.number()-1 && possibleTrues == 1 ){
                log( this.name() + ": since I am false, at least one of my possible trues can not be true");
                for( var i = 0 ; i < s.undefineds.length ; i++ ){
                    s.undefineds[i].remove(true);
                }
                return true;
            }
        }

        return false;
    }
});


function CPNot(cp){
    CPBase.call(this,"Not(" + cp.name() + ")", [cp] ); 
    this._cp = cp;
}

InheritAndExtend(CPBase,CPNot, {
    
    defined: function(){
        return this._cp.defined();
    },

    canBeTrue: function(){
        return this._cp.canBeFalse();
    },

    canBeFalse: function(){
        return this._cp.canBeTrue();
    },

    remove: function(value){
        var changed = this._cp.remove(!value);
        if( changed ){
            this.notifyContainers();
        }
        return changed;
    },

    reduceOwnDomain: function(){
        var ret = this._cp.reduceOwnDomain();
        if( ret ){
            this.notifyContainers();
        }
    },

    notified: function(){
        this.notifyContainers();
    },

    reduceObservedDomain: function(){
        return this._cp.reduceObservedDomain();
    },

});


var CP = {
    Boolean : function(name){
        return new CPBoolean(name);
    },
    And : function(cps){
        return new CPNumberTrue(cps,cps.length)
    },
    Not : function(cp){
        return new CPNot(cp);
    },
    SomeTrue : function(cps,number){
        return new CPNumberTrue(cps,number);
    },
    Or : function(cps){
        var negatedCPS = [];
        var names = "";
        for( var i = 0 ; i < cps.length ; i++ ){
            negatedCPS.push( CP.Not(cps[i]) );
            names += cps[i].name() + " ";
        }
        var ret =  CP.Not( CP.And(negatedCPS) );
        ret.name = function(){ return "Or(" + names + ")"; };
        return ret;
    }
};



function test(){

    var tests = [
        function(){
            var a = CP.Boolean("a");
            var notA = CP.Not(a);

            assert(!notA.defined());

            notA.remove(true);

            assert(a.isTrue() );
        },

        function(){
            var a = CP.Boolean("a");
            var notA = CP.Not(a);

            a.remove(false);

            assert(notA.isFalse() );
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var andAB = CP.And([a,b]);

            a.remove(true);

            assert(andAB.isFalse());
        },


        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var andAB = CP.And([a,b]);

            andAB.remove(false);

            assert(a.isTrue());
            assert(b.isTrue());
        },


        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var orAB = CP.Or([a,b]);

            a.remove(false);

            assert(orAB.isTrue());
        },


        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var orAB = CP.Or([a,b]);

            orAB.remove(true);

            assert(a.isFalse());
            assert(b.isFalse());
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var orAB = CP.Or([a,b]);

            orAB.remove(false);
            b.remove(true);

            assert(a.isTrue());
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var and = CP.And([a,b,c]);
            and.remove(false);
            assert(a.isTrue());
            assert(b.isTrue());
            assert(c.isTrue());
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var or = CP.Or([a,b,c]);
            or.remove(true);
            assert(a.isFalse());
            assert(b.isFalse());
            assert(c.isFalse());
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var or = CP.Or([a,b,c]);
            or.remove(false);
            a.remove(true);
            b.remove(true);

            
            assert(a.isFalse());
            assert(b.isFalse());
            assert(c.isTrue());
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var d = CP.Boolean("d");
            var st = CP.SomeTrue([a,b,c,d],2);

            a.remove(true);

            b.remove(true);

            c.remove(true);

            
            assert(st.isFalse());
        },


        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var d = CP.Boolean("d");
            var st = CP.SomeTrue([a,b,c,d],2);
        
            a.remove(true);
            b.remove(true);
            c.remove(false);
            assert(!st.defined());

            d.remove(false);
            assert(st.isTrue());
        },

        function(){
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var d = CP.Boolean("d");
            var st = CP.SomeTrue([a,b,c,d],2);

            a.remove(true);
            b.remove(true);
            st.remove(false);

            assert(c.isTrue());
            assert(d.isTrue());
        }


        
        
    ];


    
    for( var i = 0 ; i < tests.length ; i++ ){
        console.log( "----- Test " + i );
        tests[i]();
    }
    
    
}

test();
