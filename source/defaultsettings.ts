function defaults(refs: ParagraphMapping[]): ScriptSettings {
    return {
        base: 1,
        fontStyles: [
            {
                name: refs[0].charStyle,
                grep: /^.{80,}$/gm,
                styleCheck: true,
                fontStyle: refs[0].fontStyle,
                sizeCheck: true,
                size: 11,
                replace: false,
                from: /\t/,
                to: '$1',
            },
            {
                name: refs[0].charStyle,
                grep: /^\r|\n$/gm,
                styleCheck: false,
                fontStyle: refs[0].fontStyle,
                sizeCheck: false,
                size: 11,
                replace: false,
                from: /\t/,
                to: '$1',
            },
            {
                name: 'baslik 1 Y',
                grep: /^\d{1,3}([ ]*\t).+$/gm,
                styleCheck: true,
                fontStyle: 'Bold',
                size: 12,
                sizeCheck: false,
                replace: true,
                from: /\t/,
                to: ' ',
            },
            {
                name: 'baslik 2 Y',
                grep: /^\d{1,3}\.\d{1,3}([ ]*\t).+$/gm,
                styleCheck: true,
                fontStyle: 'Bold',
                size: 12,
                sizeCheck: false,
                replace: true,
                from: /\t/,
                to: ' ',
            },
        ],
        colWidths: [0, 0, 0, 30, 30, 25, 20],
        paragraphMappings: [
            {
                fontStyle: refs[2].fontStyle,
                charStyle: 'bold',
            },
            {
                fontStyle: refs[1].fontStyle,
                charStyle: 'italic',
            },
            {
                fontStyle: refs[3].fontStyle,
                charStyle: 'bolditalic',
            },
        ],
        tableMappings: [
            {
                fontStyle: refs[2].fontStyle,
                charStyle: 'tbold',
            },
            {
                fontStyle: refs[1].fontStyle,
                charStyle: 'titalic',
            },
            {
                fontStyle: refs[3].fontStyle,
                charStyle: 'tbolditalic',
            },
        ],
        superScriptStyle: 'super',
        tableCellStylesNames: [refs[1].charStyle, refs[2].charStyle, refs[3].charStyle],
        superscriptTableStyle: 'tsuper',
        tableParagraphStyle: 'tablo metin Y',
        useSuffixOnChecks: false,
        suffix: ' Y',
        usePrefixOnChecks: false,
        prefix: 'Y ',
        hafSize: false,
    }
}

export { defaults }