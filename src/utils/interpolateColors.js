/* eslint-disable no-magic-numbers */
import numToCol from "./numToCol"

export default ( c1, c2, num ) => {
  const colors = new Array( num ).fill( 0 )

  const c1R = ( c1 & 0xff0000 ) >> 16
  const c1G = ( c1 & 0x00ff00 ) >> 8
  const c1B = ( c1 & 0x0000ff ) >> 0
  const c2R = ( c2 & 0xff0000 ) >> 16
  const c2G = ( c2 & 0x00ff00 ) >> 8
  const c2B = ( c2 & 0x0000ff ) >> 0

  colors.forEach( ( _, i, cArr ) => {
    const factor = i / ( num - 1 )
    cArr[ i ] =
      Math.round( ( ( c2R - c1R ) * factor ) << 16 ) +
      Math.round( ( ( c2G - c1G ) * factor ) << 8 ) +
      Math.round( ( ( c2B - c1B ) * factor ) << 0 ) +
      c1
  } )
  return colors.map( col => numToCol( col ) )
}
