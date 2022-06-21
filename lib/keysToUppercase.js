/**  
 * Helper function to convert keys to upper case. 
 * The conversion is shallow. 
 * If there are any deeper keys, we need a different solution.
 */
const keysToUpperCase = (input) => { 
  return Object.fromEntries(
    Object.entries(input).map(([k, v]) => [k.toUpperCase(), v])
  );
}

module.exports = keysToUpperCase;