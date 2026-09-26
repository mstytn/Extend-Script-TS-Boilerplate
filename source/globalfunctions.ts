function indexOf<T>(arr: T[], value: T): number {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
            return i
        }
    }
    return -1
}

function stringEndsWith(str: string, search: string): boolean {
    if (typeof str !== 'string' || typeof search !== 'string') return false
    if (search.length > str.length) return false
    return str.substring(str.length - search.length, str.length) === search
}

function stringStartsWith(str: string, search: string): boolean {
    if (typeof str !== 'string' || typeof search !== 'string') return false
    if (search.length > str.length) return false
    return str.substring(0, search.length) === search
}

function debugToConsole(message: string): void {
    if (debug) {
        $.writeln(message)
    }
}