/* eslint-disable no-magic-numbers */
export default ( hex, a ) => {
  const col = hex.toString( 16 ).padStart( 6, "0" )
  return `rgba(${parseInt( col.substr( 0, 2 ), 16 )}, ${parseInt( col.substr( 2, 2 ), 16 )}, ${parseInt( col.substr( 4, 2 ), 16 )}, ${a})`
}
