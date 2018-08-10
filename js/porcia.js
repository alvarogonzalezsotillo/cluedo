if( typeof require != "undefined" ){
    var common = require("./common");
    var cp = require("./cp");
    var cpb = require("./cp.backtrack.js");
    log = common.log;
    CPManager = cp.CPManager;
    CPBacktrack = cpb.CPBacktrack;
    CPAllPosibilities = CPManager.CPAllPosibilities;
}


class Cofre{
    constructor(manager,nombre){
        this._manager = manager;
        this._nombre = nombre;
        this._cofreLleno = manager.Boolean( "El cofre " + this._nombre + " está lleno" );
    }

    get nombre(){
        return this._nombre;
    }

    set inscripciones(ins){
        if( typeof this._inscripciones != "undefined" ){
            throw new Error("No se pueden cambiar las inscripciones de un cofre");
        }
   
        this._inscripciones = ins.slice(0);

        this._diceLaVerdad = [];
        this._implicaciones = [];
        for( let i = 0 ; i < ins.length ; i++ ){
            this._diceLaVerdad.push( this.manager.Boolean("La inscripción " + i + " del cofre " + this._nombre + " dice la verdad") );
            this._implicaciones.push( this.manager.Iff( this._diceLaVerdad[i], ins[i] ).asTrue() );
        }
    }

    get inscripciones(){
        return this._inscripciones.slice(0);
    }
    

    get implicaciones(){
        return this._implicaciones.slice(0);
    }

    get cofreLleno(){
        return this._cofreLleno;
    }

    get manager(){
        return this._manager;
    }

    static soloUnCofreLleno(cofres){
        var llenos = cofres.map( c => c.cofreLleno );
        let manager = cofres[0].manager;
        var soloUnoLleno = manager.SomeTrue(llenos,1).
            rename("Solo un cofre lleno en total").
            asTrue();
        return soloUnoLleno;
    }

    static creaCofres(CP,nombres){
        var ret = nombres.map( n => new Cofre(CP,n) );
        Cofre.soloUnCofreLleno(ret);
        return ret;
    }

}



function porcia(cofres,buscarCofreLleno){
    const CP = cofres[0].manager;
    const inscripciones = cofres.
          map(c=>c.inscripciones).
          reduce( (accum,value) => accum.concat(value) );

    const llenos = cofres.map( c=> c.cofreLleno);

    const eleccion = cofres.map( c=> CP.Boolean("Elección cofre " + c.nombre ) );

    const llenoSiempre = cofres.map(
        c => CP.ForAll(inscripciones,c.cofreLleno)
    );


    // POSIBILIDADES DE COFRES LLENOS
    const posibilidadesLlenos = CPAllPosibilities(llenos);
    if( posibilidadesLlenos.length == 1 ){
        const indice = posibilidadesLlenos[0].indexOf(buscarCofreLleno);
        if( indice < 0 ){
            throw new Error("No se encuentra el cofre en la única combinación posible");
        }
        return cofres[indice];
    }

    // POSIBILIDADES DE INSCRIPCIONES CIERTAS
    const posibilidadesInscripciones = CPAllPosibilities(inscripciones,llenos);
    if( posibilidadesInscripciones.length < 1 ){
        throw new Error("No hay ninguna posibilidad en las inscripciones");
    }
    for( let indice = 0 ; indice < cofres.length ; indice++ ){
        const lleno = posibilidadesInscripciones.map( p => p[indice] );
        if( lleno.every( b => b == buscarCofreLleno ) ){
            return cofres[indice];
        }
    }
    throw new Error("No hay ninguna posibilidad válida en las inscripciones");
}


if( typeof module == "undefined" ){
    module = {};
}

module.exports = {
    porcia: porcia,
    Cofre: Cofre
};

