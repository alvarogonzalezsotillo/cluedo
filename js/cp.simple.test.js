

if( typeof require != "undefined32"){
    var cp = require("./cp");

    var common = require("./common");
    CPManager = cp.CPManager;
    assert = common.assert;
    describe = common.describe;

}




function test(){

    var tests = [
        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var notA = CP.Not(a);

            assert(!notA.defined());

            notA.remove(true);

            assert(a.isTrue() );
        },

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var notA = CP.Not(a);

            a.remove(false);

            assert(notA.isFalse() );
        },

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var andAB = CP.And([a,b]);

            a.remove(true);

            assert(andAB.isFalse());
        },


        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var andAB = CP.And([a,b]);

            andAB.remove(false);

            assert(a.isTrue());
            assert(b.isTrue());
        },


        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var orAB = CP.Or([a,b]);

            a.remove(false);

            assert(orAB.isTrue());
        },


        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var orAB = CP.Or([a,b]);

            orAB.remove(true);

            assert(a.isFalse());
            assert(b.isFalse());
        },

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var orAB = CP.Or([a,b]);

            orAB.remove(false);
            b.remove(true);

            assert(a.isTrue());
        },

        function(){
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

        function(){
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

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var or = CP.Or([a]);
            or.remove(false);
            assert(a.isTrue());
        },

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var or = CP.Or([a]);
            or.remove(true);
            assert(a.isFalse());
        },


        function(){
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

        function(){
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


        function(){
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

        function(){
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


        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var st = CP.SomeTrue([a,b],1);

            st.remove(false);
            a.remove(false);

            assert(b.isFalse());
        },

        
        function(){
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

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            a.remove(true);
            try{
                a.remove(false);
            }
            catch(e){
                assert(e.cp === a);
                return;
            }
            assert(false);
        },

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var st = CP.SomeTrue([a],1);
            var nst = CP.Not(CP.SomeTrue([a],1));

            st.remove(false);
            try{
                nst.remove(false);
            }
            catch(e){
                return;
            }
            assert(false);
        },

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var st = CP.Or([a]);
            var nst = CP.Not(CP.Or([a]));

            st.remove(false);
            try{
                nst.remove(false);
            }
            catch(e){
                return;
            }
            assert(false);
        },

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var ifthen = CP.IfThen(a,b);
            ifthen.remove(false);
            a.remove(false);

            assert(b.isTrue());
        },


        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var ifthen = CP.IfThen(a,b);
            ifthen.remove(false);
            b.remove(true);

            assert(a.isFalse());
        },

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var ifthen = CP.IfThen(a,b);
            ifthen.remove(false);
            b.remove(false);

            assert(!a.defined());
        },

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");

            var ifthen = CP.IfThen(a,b);
            ifthen.remove(false);
            a.remove(true);

            assert(!b.defined());
        },

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var i = CP.Rename(a,"otro nombre");
            i.remove(false);
            assert(a.isTrue());
        },

        function(){
            var CP = new CPManager();
            var aReal = CP.Boolean("a");
            var a = CP.Rename(aReal,"a cambiado");
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

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var iff = CP.Iff(a,b);
            a.remove(true);
            iff.remove(false);
            assert(b.isFalse());
        },

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var iff = CP.Iff(a,b);
            a.remove(false);
            iff.remove(false);
            assert(b.isTrue());
        },

        function(){
            var CP = new CPManager();
            var a = CP.Boolean("a");
            var b = CP.Boolean("b");
            var iff = CP.Iff(a,b);
            a.remove(true);
            iff.remove(true);
            assert(b.isTrue());
        },


    ];

    
    for( var i = 0 ; i < tests.length ; i++ ){
        console.log( "----- Test " + i );
        try{
            tests[i]();
        }
        catch(e){
            console.log(e.stack);
        }
    }
    
    
}

test();
