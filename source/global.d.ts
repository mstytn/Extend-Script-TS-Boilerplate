/// <reference path="../node_modules/types-for-adobe/InDesign/2023/index.d.ts" />

type Styles = {
    name: string
    grep: RegExp
    styleCheck: boolean
    fontStyle: string
    sizeCheck: boolean
    size: number
    replace: boolean
    from: RegExp
    to: string
}[]

type TableMapping = {
    fontStyle: string
    charStyle: string
}
type ParagraphMapping = {
    fontStyle: string
    charStyle: string
}

type columnWidths = [number, number, number, number, number, number, number]

type ScriptSettings = {
    fontStyles: Styles,
    colWidths: columnWidths,
    paragraphMappings: ParagraphMapping[]
    tableMappings: TableMapping[]
    base: number
    superScriptStyle: string
    tableCellStylesNames: [string, string, string]
    superscriptTableStyle: string
    tableParagraphStyle: string
    useSuffixOnChecks: boolean
    suffix: string
    usePrefixOnChecks: boolean
    prefix: string
    hafSize: boolean
}

type StyleChecker = {
    name: string
    grep: RegExp
    styleCheck: boolean
    fontStyle: string
    sizeCheck: boolean
    size: number
    replace: boolean
    from: RegExp
    to: string
}

enum RunType {
    ALL = 0,
    PARAGRAPH = 1,
    TABLE = 2,
    RESET_TABLE = 3,
    DIALOG = 4,
    TABLE_FIX = 5
}

declare var debug: boolean;