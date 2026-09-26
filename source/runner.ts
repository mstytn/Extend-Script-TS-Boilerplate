import { Runner} from './runnerclass'

function runner(doc: Document, runType: RunType = RunType.ALL) {
    return new Runner(doc, runType).run()
}

export { runner }
