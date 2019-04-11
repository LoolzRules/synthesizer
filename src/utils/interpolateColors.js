import numToCol from "./numToCol"

export default ( c1, c2, num ) => {
  const colors = new Array( num ).fill( c1 )
  colors.forEach( ( c, i, cArr ) => {
    cArr[ i ] = c + Math.round( ( c2 - c1 ) * i / ( num - 1 ) )
  } )
  return colors.map( col => numToCol( col ) )
}
