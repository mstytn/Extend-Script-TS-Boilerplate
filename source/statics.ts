/// <reference path='./constants.ts'/>

class StyleHelper {
    constructor(
        public fontStyles: StyleChecker[],
        public doc: Document,
    ) {}

    public checkStyles(paragraph: Paragraph) {
        for (let i = 0; i < SETTINGS.fontStyles.length; i++) {
            const fStyle = this.fontStyles[i].fontStyle
            const fCheck = this.fontStyles[i].styleCheck
            if (fCheck) {
                const contentMatch = this.fontStyles[i].grep.test(paragraph.contents as string)
                const styleMatch = paragraph.fontStyle === fStyle
                if (contentMatch && styleMatch) {
                    return i
                }
            } else {
                if (this.fontStyles[i].grep.test(paragraph.contents as string)) {
                    return i
                }
            }
        }
        return -1
    }

    public gatherCellStyle(styleName: string): CellStyle {
        let cellStyles = this.doc.allCellStyles
        for (let i = 0; i < cellStyles.length; i++) {
            if (cellStyles[i].name === styleName) {
                return cellStyles[i]
            }
        }
        return null
    }

    public gatherParagraphStyle(styleName: string): ParagraphStyle {
        let paragraphStyles = this.doc.allParagraphStyles
        for (let i = 0; i < paragraphStyles.length; i++) {
            const pStyle = paragraphStyles[i].name
            if (pStyle === styleName) {
                return paragraphStyles[i]
            }
        }
        return null
    }

    public gatherCharacterStyle(styleName: string): CharacterStyle {
        let characterStyles = this.doc.allCharacterStyles
        for (let i = 0; i < characterStyles.length; i++) {
            if (characterStyles[i].name === styleName) {
                return characterStyles[i]
            }
        }
        return null
    }

    public checkIfAlreadyChanged(fontStyleNames: string[], paragraphsStyleName: string): boolean {
        let suffixCheck = false
        let prefixCheck = false

        if (SETTINGS.usePrefixOnChecks) {
            suffixCheck = stringStartsWith(paragraphsStyleName, SETTINGS.prefix)
        }
        if (SETTINGS.useSuffixOnChecks) {
            prefixCheck = stringEndsWith(paragraphsStyleName, SETTINGS.suffix)
        }
        return suffixCheck || prefixCheck || indexOf(fontStyleNames, paragraphsStyleName) > -1
    }
}

class StyleChanger {
    static changeCharStyleByStyle<T extends Paragraph | Table>(
        object: T,
        appliedStyleName: string,
        documentCharacterStyleName: string,
        styleHelper: StyleHelper,
    ): void {
        app.findGrepPreferences = NothingEnum.NOTHING
        app.changeGrepPreferences = NothingEnum.NOTHING
        ;(app.findGrepPreferences as unknown as FindGrepPreference).fontStyle = appliedStyleName
        const charStyle = styleHelper.gatherCharacterStyle(documentCharacterStyleName)
        ;(app.changeGrepPreferences as unknown as ChangeGrepPreference).appliedCharacterStyle = charStyle
        try {
            object.changeGrep(true)
        } catch (e) {
            debugToConsole(e)
        }
        app.findGrepPreferences = NothingEnum.NOTHING
        app.changeGrepPreferences = NothingEnum.NOTHING
    }

    static changeCharacterStyleBySupeOrNot<T extends Paragraph | Table>(
        object: T,
        superCharacterStyleName: string,
        styleHelper: StyleHelper,
    ): void {
        app.findGrepPreferences = NothingEnum.NOTHING
        app.changeGrepPreferences = NothingEnum.NOTHING
        ;(app.findGrepPreferences as unknown as FindGrepPreference).position = Position.SUPERSCRIPT
        const charStyle = styleHelper.gatherCharacterStyle(superCharacterStyleName)
        ;(app.changeGrepPreferences as unknown as ChangeGrepPreference).appliedCharacterStyle = charStyle
        try {
            object.changeGrep(true)
        } catch (e) {
            debugToConsole(e)
        }
        app.findGrepPreferences = NothingEnum.NOTHING
        app.changeGrepPreferences = NothingEnum.NOTHING
    }
}

class ParagraphOperations {
    paragraphsToDelete: number[]
    currentParagraph: Paragraph
    paragraphIndex: number
    constructor(
        public paragraphs: Paragraph[],
        public styleHelper: StyleHelper,
    ) {
        this.paragraphsToDelete = []
        this.paragraphIndex = 0
        this.currentParagraph = paragraphs[this.paragraphIndex]
    }

    jump(index: number): ParagraphOperations {
        this.currentParagraph = this.paragraphs[index]
        return this
    }

    count(): number {
        return this.paragraphs.length
    }

    next(): Paragraph | null {
        if (this.paragraphIndex < this.paragraphs.length - 1) {
            this.currentParagraph = this.paragraphs[++this.paragraphIndex]
            return this.paragraphs[++this.paragraphIndex]
        }
        if (this.paragraphIndex === this.paragraphs.length - 1) {
            return null
        }
    }

    previous(): Paragraph | null {
        if (this.paragraphIndex === 0) {
            return null
        } else {
            this.currentParagraph = this.paragraphs[--this.paragraphIndex]
            return this.paragraphs[this.paragraphIndex--]
        }
    }

    checkContents(): boolean {
        const pText = this.currentParagraph.contents as string
        const cnt = pText.replace(/\s+/g, '').replace(/\t/gm, '')
        if (cnt === '' || cnt === '\r' || cnt === '\n') {
            if (this.currentParagraph.insertionPoints[0].contents === SpecialCharacters.PAGE_BREAK) {
                return true
            } else {
                this.paragraphsToDelete.push(this.paragraphIndex)
                return false
            }
        }
        return true
    }

    changeStyle() {
        if (!this.currentParagraph.isValid) return
        const pStyleName = (this.currentParagraph.appliedParagraphStyle as ParagraphStyle).name
        const fStyleNames: string[] = []
        for (let f = 0; f < SETTINGS.fontStyles.length; f++) {
            fStyleNames.push(SETTINGS.fontStyles[f].name)
        }
        const chk = this.styleHelper.checkIfAlreadyChanged(fStyleNames, pStyleName)
        if (chk) return
        const cnt = this.checkContents()
        if (!cnt) return
        const foundStyle = this.styleHelper.checkStyles(this.currentParagraph)
        if (foundStyle === -1) {
            return
        }
        const pStyle = this.styleHelper.gatherParagraphStyle(SETTINGS.fontStyles[foundStyle].name)
        try {
            const baseName = this.styleHelper.fontStyles[SETTINGS.base].name
            if (pStyle.name === baseName) {
                this.currentParagraph.select()
                for (let map = 0; map < SETTINGS.paragraphMappings.length; map++) {
                    const mapping = SETTINGS.paragraphMappings[map]
                    StyleChanger.changeCharStyleByStyle<Paragraph>(
                        this.currentParagraph,
                        mapping.fontStyle,
                        mapping.charStyle,
                        this.styleHelper,
                    )
                }
                StyleChanger.changeCharacterStyleBySupeOrNot(
                    this.currentParagraph,
                    SETTINGS.superScriptStyle,
                    this.styleHelper,
                )
            }
            this.currentParagraph.applyParagraphStyle(pStyle, false)
            this.currentParagraph.clearOverrides(OverrideType.ALL)
        } catch (e) {
            debugToConsole(e)
        }

        if (this.styleHelper.fontStyles[foundStyle].replace) {
            this.currentParagraph.contents = (this.currentParagraph.contents as string).replace(
                this.styleHelper.fontStyles[foundStyle].from,
                this.styleHelper.fontStyles[foundStyle].to,
            )
        }

        this.styleHelper.doc.selection = NothingEnum.NOTHING
    }

    appendEmpties(page: Page) {
        for (let i = 0; i < page.textFrames.length; i++) {
            const paragraphs = page.textFrames[i].paragraphs
            for (let i = paragraphs.length - 1; i >= 0; i--) {
                paragraphs[i].insertionPoints[-1].contents = '\r'
                const newParagraph = paragraphs[i + 1]
                const pStyle = this.styleHelper.gatherParagraphStyle(SETTINGS.fontStyles[SETTINGS.base].name)
                try {
                    newParagraph.applyParagraphStyle(pStyle, true)
                } catch (_e) {}
            }
        }
    }
}

class TableOperations {
    constructor(
        public tables: Tables,
        public styleHelper: StyleHelper,
    ) {}

    run() {
        for (let t = 0; t < this.tables.length; t++) {
            const theTable = this.tables[t]
            if (this._isTableDone(theTable)) {
                continue
            } else {
                this._mapChars(theTable)
                this._rowFix(theTable)
                this._colFix(theTable)
                this._markDone(theTable)
                this._clearMultipleSpace(theTable)
            }
        }
    }

    private _clearMultipleSpace(table: Table) {
        app.findGrepPreferences = NothingEnum.NOTHING
        app.changeGrepPreferences = NothingEnum.NOTHING
        ;(app.findGrepPreferences as unknown as FindGrepPreference).findWhat = '^\\s{2,}'
        ;(app.changeGrepPreferences as unknown as ChangeGrepPreference).changeTo = ''
        try {
            table.changeGrep(true)
        } catch (e) {
            debugToConsole(e)
        }
        ;(app.findGrepPreferences as unknown as FindGrepPreference).findWhat = '\\s{2,}$'
        ;(app.changeGrepPreferences as unknown as ChangeGrepPreference).changeTo = ''
        try {
            table.changeGrep(true)
        } catch (e) {
            debugToConsole(e)
        }
        ;(app.findGrepPreferences as unknown as FindGrepPreference).findWhat = '\\s{2,}'
        ;(app.changeGrepPreferences as unknown as ChangeGrepPreference).changeTo = ' '
        try {
            table.changeGrep(true)
        } catch (e) {
            debugToConsole(e)
        }
        app.findGrepPreferences = NothingEnum.NOTHING
        app.changeGrepPreferences = NothingEnum.NOTHING
    }

    private _markDone(table: Table) {
        table.insertLabel('done', 'true')
    }

    private _isTableDone(table: Table): boolean {
        const val = table.extractLabel('done')
        return val === 'true'
    }

    static clearAllTableDoneLabels(doc: Document) {
        for (var s = 0; s < doc.stories.length; s++) {
            var story = doc.stories[s]
            for (var t = 0; t < story.tables.length; t++) {
                var tbl = story.tables[t]
                tbl.insertLabel('done', '') // overwrite with empty string
            }
        }
    }

    private _mapChars(theTable: Table) {

        const selection: Table = theTable
        for (let map = 0; map < SETTINGS.tableMappings.length; map++) {
            const mapping = SETTINGS.tableMappings[map]
            StyleChanger.changeCharStyleByStyle<Table>(
                selection,
                mapping.fontStyle,
                mapping.charStyle,
                this.styleHelper,
            )
        }

        StyleChanger.changeCharacterStyleBySupeOrNot<Table>(selection, SETTINGS.superscriptTableStyle, this.styleHelper)
    }

    static getEditableWidth(): number {
        const page = (app.activeWindow as LayoutWindow).activePage
        const bounds = page.bounds as [number, number, number, number]
        const marginPrefs = page.marginPreferences

        let pageWidth: number = bounds[3] - bounds[1]
        let margin: number = (marginPrefs.left as number) + (marginPrefs.right as number)
        if (HALF_SIZED_TABLES) {
            pageWidth = pageWidth / 2
            margin = margin / 2 + 4
        }
        const editableWidth = pageWidth - margin

        return editableWidth
    }

    private _colFix(theTable: Table) {
        for (let c = 0; c < theTable.columns.length; c++) {
            const theCol = theTable.columns[c]
            const totalWidth = TableOperations.getEditableWidth()
            if (theTable.columnCount == 1) {
                theCol.width = totalWidth
            }
            if (theTable.columnCount == 2) {
                theCol.width = totalWidth / 2
            }
            if (theTable.columnCount > 2) {
                let tcc = theTable.columnCount
                if (tcc > 6) {
                    tcc = 6
                }
                let lColWidth = totalWidth - SETTINGS.colWidths[tcc] * (tcc - 1)
                let rColWidths = SETTINGS.colWidths[tcc]
                if (lColWidth < rColWidths) {
                    lColWidth = 20
                    rColWidths = 10
                }
                if (c == 0) {
                    theCol.width = lColWidth
                } else {
                    theCol.width = rColWidths
                }
            }
        }
    }

    private _rowFix(theTable: Table) {
        const rows = theTable.rows
        for (let r = rows.length - 1; r >= 0; r--) {
            rows[r].height = 5
            rows[r].autoGrow = true
            this._rowCellsFix(rows, r)
        }
    }

    private _rowCellsFix(rows: Rows, r: number) {
        const row = rows[r] as Row
        for (let c = row.cells.length - 1; c >= 0; c--) {
            const theCell = row.cells[c]
            this._rowCellFix(theCell)
            if (r === 0) {
                try {
                    theCell.appliedCellStyle = this.styleHelper.gatherCellStyle(SETTINGS.tableCellStylesNames[1])
                    theCell.clearCellStyleOverrides(false)
                } catch (_e) {}
            } else {
                try {
                    theCell.appliedCellStyle = this.styleHelper.gatherCellStyle(SETTINGS.tableCellStylesNames[0])
                    theCell.clearCellStyleOverrides(false)
                } catch (_e) {}
            }
        }
    }

    private _rowCellFix(theCell: Cell): void {
        const pStyle = this.styleHelper.gatherParagraphStyle(SETTINGS.tableParagraphStyle)

        // In InDesign, a truly empty cell has 0 characters.
        // We target insertionPoints[0] to set the 'default' size for empty cells.
        if (theCell.characters.length === 0) {
            if (theCell.insertionPoints.length > 0) {
                theCell.insertionPoints[0].pointSize = pStyle.pointSize
            }
        }
        // If it contains only your special marker or a single whitespace/control character
        else if (theCell.characters.length === 1) {
            const ch = theCell.characters[0]
            // Check for your specific marker \u0016 or generic empty markers
            if (ch.contents === '\u0016' || ch.contents === '' || ch.contents === '\r') {
                ch.pointSize = pStyle.pointSize
            }
        }

        // Always run the paragraph fix afterwards
        this._cellParagraphsFix(theCell)
    }

    private _cellParagraphsFix(theCell: Cell) {
        const cellPars = theCell.paragraphs
        for (let p = 0; p < cellPars.length; p++) {
            const par = cellPars[p]
            const just = par.justification
            const lindent = par.leftIndent
            let pStyle = this.styleHelper.gatherParagraphStyle(SETTINGS.tableParagraphStyle)
            if (!pStyle) {
                const baseName = this.styleHelper.fontStyles[SETTINGS.base].name
                pStyle = this.styleHelper.gatherParagraphStyle(baseName)
            }
            try {
                par.applyParagraphStyle(pStyle, true)
            } catch (_e) {
                debugToConsole(_e)
            }
            par.justification = just
            par.leftIndent = lindent
        }
    }
}
