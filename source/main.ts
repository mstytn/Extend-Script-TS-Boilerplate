import './pollyfills'
import { runner } from './runner'

debug = true


function main(): void {
    function getDoc(): Document | null {
        try {
            return app.activeDocument
        } catch (e) {
            return null
        }
    }
    const doc = getDoc()
    if (!doc) {
        $.writeln('No active document')
        return
    }
    runner(doc, RunType.TABLE_FIX)
    return
}
