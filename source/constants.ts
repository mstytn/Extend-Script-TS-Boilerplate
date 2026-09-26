
class ScriptSettingsManager {
    public settingsFilePath: string
    public settings: ScriptSettings
    constructor(public DEFAULT_SETTINGS: ScriptSettings) {
        this.settingsFilePath = this._settingsFile()
        const loadedSettings = this.loadSettings()
        this.settings = loadedSettings !== null ? loadedSettings : DEFAULT_SETTINGS
    }

    private _settingsFile(): string {
        const filePath = $.fileName.split('/')
        filePath.pop()
        const settingsPath = filePath.join('/') + '/scriptsettings.json'
        return settingsPath
    }

    public loadSettings(): ScriptSettings | null {
        const settingsPath = this.settingsFilePath
        const file = new File(settingsPath)
        if (!file.exists) {
            return null
        }
        file.open('r')
        const jsonString = file.read()
        file.close()
        return $.global.JSON.parse(jsonString, function (key: string, value: any) {
            if (value && value.__is_regexp__) {
                let flags: string | undefined = ''
                if (value.global) flags += 'g'
                if (value.ignoreCase) flags += 'i'
                if (value.multiline) flags += 'm'
                if (flags === '')
                    flags = undefined
                return new RegExp(value.source, flags)
            }
            return value
        }) as ScriptSettings
    }

    public saveSettings(settings: ScriptSettings): void {
        const settingsPath = this.settingsFilePath
        const jsonString = $.global.JSON.stringify(
            settings,
            function (key: string, value: any) {
                if (value instanceof RegExp) {
                    return {
                        __is_regexp__: true,
                        // @ts-ignore
                        source: value.source,
                        // @ts-ignore
                        global: value.global,
                        // @ts-ignore
                        ignoreCase: value.ignoreCase,
                        // @ts-ignore
                        multiline: value.multiline,
                    }
                }
                return value
            },
            4,
        )
        const file = new File(settingsPath)
        file.open('w')
        file.write(jsonString)
        file.close()
    }
}

class StyleCreator {
    constructor(public doc: Document) {}

    public ensureGenericCharacterStylesExist(): void {}

    public ensureReferenceCharacterStylesExist(): void {}

    public ensureCellStylesExist(): void {}
}

// const settingsManager = new ScriptSettingsManager(defaults(new References().refs))
// const SETTINGS = settingsManager.settings
const styleCreator: StyleCreator = new StyleCreator(app.activeDocument)

export { ScriptSettingsManager, StyleCreator, styleCreator }