

if( typeof require != "undefined32"){
    var cp = require("./cp");

    var common = require("./common");
    CPManager = cp.CPManager;
    assert = common.assert;
    describe = common.describe;

}




function test(){

    var tests = {

        or1: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            a.remove(false)

            var or = CP.Or([a]);
            

            assert(or.isTrue());
        },
        
        not1: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var notA = CP.Not(a);

            assert(!notA.defined());

            notA.remove(true);

            assert(a.isTrue() );
        },

        not2 : function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var notA = CP.Not(a);

            a.remove(false);

            assert(notA.isFalse() );
        },

        and1: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var andAB = CP.And([a,b]);

            a.remove(true);

            assert(andAB.isFalse());
        },


        and2: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var andAB = CP.And([a,b]);

            andAB.remove(false);

            assert(a.isTrue());
            assert(b.isTrue());
        },


        or2: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var orAB = CP.Or([a,b]);

            a.remove(false);

            assert(orAB.isTrue());
        },


        or3: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var orAB = CP.Or([a,b]);

            orAB.remove(true);

            assert(a.isFalse());
            assert(b.isFalse());
        },

        or4: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var orAB = CP.Or([a,b]);

            orAB.remove(false);
            b.remove(true);

            assert(a.isTrue());
        },

        and3: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var and = CP.And([a,b,c]);
            and.remove(false);
            assert(a.isTrue());
            assert(b.isTrue());
            assert(c.isTrue());
        },

        or5: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var or = CP.Or([a,b,c]);
            or.remove(true);
            assert(a.isFalse());
            assert(b.isFalse());
            assert(c.isFalse());
        },

        or6: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var or = CP.Or([a]);
            or.remove(false);
            assert(a.isTrue());
        },

        orConUnaVariable: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var or = CP.Or([a]);
            or.remove(true);
            assert(a.isFalse());
        },


        orDefinido: function(){
            var CP = new CPManager();
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

        someTrueDefinido: function(){
            var CP = new CPManager();
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


        someTrueIndefinido: function(){
            var CP = new CPManager();
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

        someTrueDefineCotenido: function(){
            var CP = new CPManager();
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
        },


        someTrueAFalse: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var st = CP.SomeTrue([a,b],1);

            st.remove(false);
            a.remove(false);

            assert(b.isFalse());
        },

        
        someTrueDefineContenidos2: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var d = CP.Boolean("d");
            var st = CP.SomeTrue([a,b,c,d],1);

            st.remove(false);
            a.remove(false);

            assert(b.isFalse());
            assert(c.isFalse());
            assert(d.isFalse());
        },

        emptyDomain1: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");

            var failed = false;
            var failedCP = null;
            CP.pushEmptyDomainHandler(function(e){failedCP=e;failed=true;});
            a.remove(false);
            a.remove(true);
            assert(failed);
            assert(failedCP === a);
        },

        emptyDomain2: function(){
            var CP = new CPManager();

            var a = CP.Boolean("a");
            var st = CP.SomeTrue([a],1);
            var nst = CP.Not(CP.SomeTrue([a],1));

            var failed = false;
            CP.pushEmptyDomainHandler(function(){failed=true;});

            st.remove(false);
            nst.remove(false);
            assert(failed);
        },

        emtpyDomain3: function(){
            var CP = new CPManager();

            var a = CP.Boolean("a");
            var st = CP.Or([a]);
            var nst = CP.Not(CP.Or([a]));

            var failed = false;
            CP.pushEmptyDomainHandler(function(){failed=true;});

            st.remove(false);
            nst.remove(false);
            assert(failed);
        },

        ifThen: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var ifthen = CP.IfThen(a,b);
            ifthen.remove(false);
            a.remove(false);

            assert(b.isTrue());
        },


        ifThen2: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var ifthen = CP.IfThen(a,b);
            ifthen.remove(false);
            b.remove(true);

            assert(a.isFalse());
        },

        ifThen3: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var ifthen = CP.IfThen(a,b);
            ifthen.remove(false);
            b.remove(false);

            assert(!a.defined());
        },

        ifThen4: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var ifthen = CP.IfThen(a,b);
            ifthen.remove(false);
            a.remove(true);

            assert(!b.defined());
        },


        someTrueOtraVez: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");
            var d = CP.Boolean("d");
            var st = CP.SomeTrue([a,b,c,d],1);

            st.remove(false);
            a.remove(false);

            assert(b.isFalse());
            assert(c.isFalse());
            assert(d.isFalse());
        },

        iif: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var iff = CP.Iff(a,b);
            a.remove(true);
            iff.remove(false);
            assert(b.isFalse());
        },

        iif2: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var iff = CP.Iff(a,b);
            a.remove(false);
            iff.remove(false);
            assert(b.isTrue());
        },

        iif3: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var iff = CP.Iff(a,b);
            a.remove(true);
            iff.remove(true);
            assert(b.isTrue());
        },

        cacheBooleans: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var a2 = CP.Boolean("a");
            assert(a === a2);
        },


        forAllSimple: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var f = CP.ForAll([a,b], CP.IfThen( CP.And([a,b]), CP.Or([a,b]) ));

            assert(f.isTrue());
        },

        forAllCon3: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var c = CP.Boolean("c");

            var f = CP.ForAll([a,b,c], CP.IfThen( CP.And([a,b,c]), CP.Or([a,b,c]) ));
            
            assert(f.isTrue());
        },

        forAllCon1: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");

            var f = CP.ForAll([a], CP.Or( [a, CP.Not(a)] ) );
            
            assert(f.isTrue());
        },

        forAllIndefinido: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var f = CP.ForAll([a], b );
            
            assert(!f.defined());
        },
        
        forAllLimitado: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            a.remove(false);
            var f = CP.ForAll([a,b], CP.Or([a,b]) );
            
            assert(f.isTrue());
        },

        forAllSoloUno: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");

            var f = CP.ForAll([a], CP.IfThen( a, a ) );
            
            assert(f.isTrue());
        },

        bindImposible: function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");


            var failed = false;
            CP.pushEmptyDomainHandler(function(){failed=true;});
            CP.Bind(a,CP.Not(a));
            a.remove(true);
            assert(failed);
        }
        

    };


    
    for( var t  in  tests ){
        console.log( "----- Test " + t );
        try{
            tests[t]();
        }
        catch(e){
            console.log(e.stack);
        }
    }
    
    
}

test();
