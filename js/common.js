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

function describe(o, level){

    level = level || 0;
    
    var indent = "";
    for( var i = 0 ; i < level ; i++ ){
        indent += "  ";
    }

    if( typeof o == "undefined" ){
        console.log( indent + "describe:" + undefined );
        return;
    }
    if( o == null ){
        console.log( indent + "describe:" + null );
        return;
    }
    console.log( indent + "describe:"  );
    let keys = Object.getOwnPropertyNames(o)
    for( let i in keys ){
        if( typeof keys[i] == "undefined "){
            continue;
        }
        let value = "null";
        if( typeof o[keys[i]] != "undefined" && o[keys[i]] != null ){
            value = o[keys[i]].toString();
        }
        console.log( indent + "  " + keys[i] + ":" + value.replace( /\n/g, " ").substr(0,90) );
    }
    describe( Object.getPrototypeOf(o), level+1);
}

if( typeof module == "undefined" ){
    module = {};
}

module.exports = {
    MixIn: MixIn,
    assert : assert,
    log : log,
    describe : describe,
};
