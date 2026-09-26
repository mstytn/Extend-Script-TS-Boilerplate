/**
 * Global interface for the JSON polyfill provided by json2.js.
 * This provides ES5 JSON capabilities to ES3 systems like ExtendScript.
 */
interface JSON {
    /**
     * Produces a JSON text from a JavaScript value.
     * @param value Any JavaScript value, usually an object or array.
     * @param replacer An optional parameter that determines how object values are stringified.
     * It can be a function or an array of strings/numbers.
     * @param space An optional parameter that specifies the indentation of nested structures.
     * If it is a number, it specifies the number of spaces; if a string, it is used for indentation.
     */
    stringify(
        value: any,
        replacer?: ((key: string, value: any) => any) | (string | number)[] | null,
        space?: string | number,
    ): string

    /**
     * Parses a JSON text to produce an object or array.
     * @param text The JSON text to parse.
     * @param reviver An optional function that can filter and transform the results.
     */
    parse(text: string, reviver?: (key: string, value: any) => any): any
}

/**
 * Declares the global JSON object.
 */
declare var JSON: JSON
