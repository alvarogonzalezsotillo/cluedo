function MixIn(dst,src){
    for( p in src){
        dst[p] = src[p];
    }
}

function assert(b){
    if( !b ){
        undefined();
    }
}


function log(s){
    //console.log(s);
}

function describe(o){
    console.log( "describe:" + o );
    for( i in o ){
        console.log( "  " + i + ":" + o[i] );
    }
}

if( typeof module == "undefined" ){
    module = {};
}

module.exports = {
    MixIn: MixIn,
    assert : assert,
    log : log,
    describe : describe
};
