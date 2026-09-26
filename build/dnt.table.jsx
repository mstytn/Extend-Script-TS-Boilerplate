if (typeof JSON !== "object") {
    JSON = {};
}
(function () {
    "use strict";
    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    function f(n) {
        return (n < 10)
            ? "0" + n
            : n;
    }
    function this_value() {
        return this.valueOf();
    }
    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function () {
            return isFinite(this.valueOf())
                ? (this.getUTCFullYear()
                    + "-"
                    + f(this.getUTCMonth() + 1)
                    + "-"
                    + f(this.getUTCDate())
                    + "T"
                    + f(this.getUTCHours())
                    + ":"
                    + f(this.getUTCMinutes())
                    + ":"
                    + f(this.getUTCSeconds())
                    + "Z")
                : null;
        };
        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }
    var gap;
    var indent;
    var meta;
    var rep;
    function quote(string) {
        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }
    function str(key, holder) {
        var i;
        var k;
        var v;
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];
        if (value
            && typeof value === "object"
            && typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }
        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
            case "string":
                return quote(value);
            case "number":
                return (isFinite(value))
                    ? String(value)
                    : "null";
            case "boolean":
            case "null":
                return String(value);
            case "object":
                if (!value) {
                    return "null";
                }
                gap += indent;
                partial = [];
                if (Object.prototype.toString.apply(value) === "[object Array]") {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || "null";
                    }
                    v = partial.length === 0
                        ? "[]"
                        : gap
                            ? ("[\n"
                                + gap
                                + partial.join(",\n" + gap)
                                + "\n"
                                + mind
                                + "]")
                            : "[" + partial.join(",") + "]";
                    gap = mind;
                    return v;
                }
                if (rep && typeof rep === "object") {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === "string") {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + ((gap)
                                    ? ": "
                                    : ":") + v);
                            }
                        }
                    }
                }
                else {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + ((gap)
                                    ? ": "
                                    : ":") + v);
                            }
                        }
                    }
                }
                v = partial.length === 0
                    ? "{}"
                    : gap
                        ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                        : "{" + partial.join(",") + "}";
                gap = mind;
                return v;
        }
    }
    if (typeof JSON.stringify !== "function") {
        meta = {
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = "";
            indent = "";
            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }
            }
            else if (typeof space === "string") {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== "function" && (typeof replacer !== "object"
                || typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }
            return str("", { "": value });
        };
    }
    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            }
                            else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return ("\\u"
                        + ("0000" + a.charCodeAt(0).toString(16)).slice(-4));
                });
            }
            if (rx_one.test(text
                .replace(rx_two, "@")
                .replace(rx_three, "]")
                .replace(rx_four, ""))) {
                j = eval("(" + text + ")");
                return (typeof reviver === "function")
                    ? walk({ "": j }, "")
                    : j;
            }
            throw new SyntaxError("JSON.parse");
        };
    }
}());
var RunType;
(function (RunType) {
    RunType[RunType["ALL"] = 0] = "ALL";
    RunType[RunType["PARAGRAPH"] = 1] = "PARAGRAPH";
    RunType[RunType["TABLE"] = 2] = "TABLE";
    RunType[RunType["RESET_TABLE"] = 3] = "RESET_TABLE";
    RunType[RunType["DIALOG"] = 4] = "DIALOG";
})(RunType || (RunType = {}));
function defaults(refs) {
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
    };
}
var References = (function () {
    function References() {
        this.refs = this._getReferences();
    }
    References.searchCharacterReference = function (name, cStyles) {
        for (var i = 0; i < cStyles.length - 1; i++) {
            var cStyle = cStyles[i];
            if (cStyle.name === name) {
                return i;
            }
        }
        return -1;
    };
    References.normalizeResult = function (index, cStyles, defaultName, defaultParagraphStyleName) {
        if (index > -1) {
            return {
                fontStyle: cStyles[index].fontStyle,
                charStyle: defaultParagraphStyleName,
            };
        }
        else {
            return {
                fontStyle: defaultName,
                charStyle: defaultParagraphStyleName,
            };
        }
    };
    References.prototype._getReferences = function () {
        var cStyles = app.activeDocument.allCharacterStyles;
        var q = [];
        var reg = References.searchCharacterReference('references:regular', cStyles);
        var ital = References.searchCharacterReference('references:italic', cStyles);
        var bold = References.searchCharacterReference('references:bold', cStyles);
        var boldItalic = References.searchCharacterReference('references:bolditalic', cStyles);
        q.push(References.normalizeResult(reg, cStyles, 'Regular', 'ana metin Y'));
        q.push(References.normalizeResult(ital, cStyles, 'Italic', 'italic'));
        q.push(References.normalizeResult(bold, cStyles, 'Bold', 'bold'));
        q.push(References.normalizeResult(boldItalic, cStyles, 'Bold Italic', 'bolditalic'));
        return q;
    };
    return References;
}());
var ScriptSettingsManager = (function () {
    function ScriptSettingsManager(DEFAULT_SETTINGS) {
        this.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
        this.settingsFilePath = this._settingsFile();
        var loadedSettings = this.loadSettings();
        this.settings = loadedSettings !== null ? loadedSettings : DEFAULT_SETTINGS;
    }
    ScriptSettingsManager.prototype._settingsFile = function () {
        var filePath = $.fileName.split('/');
        filePath.pop();
        var settingsPath = filePath.join('/') + '/scriptsettings.json';
        return settingsPath;
    };
    ScriptSettingsManager.prototype.loadSettings = function () {
        var settingsPath = this.settingsFilePath;
        var file = new File(settingsPath);
        if (!file.exists) {
            return null;
        }
        file.open('r');
        var jsonString = file.read();
        file.close();
        return $.global.JSON.parse(jsonString, function (key, value) {
            if (value && value.__is_regexp__) {
                var flags = '';
                if (value.global)
                    flags += 'g';
                if (value.ignoreCase)
                    flags += 'i';
                if (value.multiline)
                    flags += 'm';
                if (flags === '')
                    flags = undefined;
                return new RegExp(value.source, flags);
            }
            return value;
        });
    };
    ScriptSettingsManager.prototype.saveSettings = function (settings) {
        if (settings === void 0) { settings = SETTINGS; }
        var settingsPath = this.settingsFilePath;
        var jsonString = $.global.JSON.stringify(settings, function (key, value) {
            if (value instanceof RegExp) {
                return {
                    __is_regexp__: true,
                    source: value.source,
                    global: value.global,
                    ignoreCase: value.ignoreCase,
                    multiline: value.multiline,
                };
            }
            return value;
        }, 4);
        var file = new File(settingsPath);
        file.open('w');
        file.write(jsonString);
        file.close();
    };
    return ScriptSettingsManager;
}());
var StyleCreator = (function () {
    function StyleCreator(doc) {
        this.doc = doc;
    }
    StyleCreator.prototype.ensureGenericCharacterStylesExist = function () {
        var doc = this.doc;
        var pMap = SETTINGS.paragraphMappings;
        var tMap = SETTINGS.tableMappings;
        var styleConfigs = [
            { name: pMap[0].charStyle, fontStyle: pMap[0].fontStyle },
            { name: pMap[1].charStyle, fontStyle: pMap[1].fontStyle },
            { name: pMap[2].charStyle, fontStyle: pMap[2].fontStyle },
            { name: SETTINGS.superScriptStyle, position: Position.SUPERSCRIPT },
            { name: tMap[0].charStyle, fontStyle: tMap[0].fontStyle },
            { name: tMap[1].charStyle, fontStyle: tMap[1].fontStyle },
            { name: tMap[2].charStyle, fontStyle: tMap[2].fontStyle },
            { name: SETTINGS.superscriptTableStyle, position: Position.SUPERSCRIPT },
        ];
        var allCharStyles = doc.allCharacterStyles;
        var rootCharStyles = doc.characterStyles;
        for (var i = 0; i < styleConfigs.length; i++) {
            var config = styleConfigs[i];
            var targetStyle = null;
            for (var j = 0; j < allCharStyles.length; j++) {
                if (allCharStyles[j].name === config.name) {
                    targetStyle = allCharStyles[j];
                    break;
                }
            }
            if (targetStyle === null) {
                targetStyle = rootCharStyles.add({
                    name: config.name,
                });
            }
            try {
                if ('fontStyle' in config) {
                    targetStyle.fontStyle = config.fontStyle;
                }
                else if ('position' in config) {
                    targetStyle.position = config.position;
                }
            }
            catch (e) {
                $.writeln('Error applying properties to ' + config.name + ': ' + e);
            }
        }
    };
    StyleCreator.prototype.ensureReferenceCharacterStylesExist = function () {
        var doc = this.doc;
        var styleConfigs = [
            { name: 'references:regular', fontStyle: 'Regular' },
            { name: 'references:italic', fontStyle: 'Italic' },
            { name: 'references:bold', fontStyle: 'Bold' },
            { name: 'references:bolditalic', fontStyle: 'Bold Italic' },
        ];
        var allCharStyles = doc.allCharacterStyles;
        var rootCharStyles = doc.characterStyles;
        for (var i = 0; i < styleConfigs.length; i++) {
            var config = styleConfigs[i];
            var targetStyle = null;
            for (var j = 0; j < allCharStyles.length; j++) {
                if (allCharStyles[j].name === config.name) {
                    targetStyle = allCharStyles[j];
                    break;
                }
            }
            if (targetStyle === null) {
                targetStyle = rootCharStyles.add({
                    name: config.name,
                    fontStyle: config.fontStyle,
                });
            }
            if (config.fontStyle !== 'Regular') {
                try {
                    targetStyle.fontStyle = config.fontStyle;
                }
                catch (e) {
                    $.writeln('Font style hatası: ' + config.fontStyle + ' uygulanamadı.');
                }
            }
        }
    };
    StyleCreator.prototype.ensureCellStylesExist = function () {
        var doc = this.doc;
        var styleConfigs = [
            { name: 'cizgili Y', isFirst: false },
            { name: 'ilk Y', isFirst: true },
        ];
        var allCellStyles = doc.allCellStyles;
        var blackColor = doc.swatches.itemByName('Black');
        var noneColor = doc.swatches.itemByName('None');
        for (var i = 0; i < styleConfigs.length; i++) {
            var config = styleConfigs[i];
            var targetStyle = null;
            for (var j = 0; j < allCellStyles.length; j++) {
                if (allCellStyles[j].name === config.name) {
                    targetStyle = allCellStyles[j];
                    break;
                }
            }
            if (targetStyle === null) {
                targetStyle = doc.cellStyles.add({ name: config.name });
            }
            targetStyle.topInset = 1;
            targetStyle.leftInset = 1;
            targetStyle.bottomInset = 1;
            targetStyle.rightInset = 1;
            targetStyle.verticalJustification = VerticalJustification.BOTTOM_ALIGN;
            targetStyle.bottomEdgeStrokeWeight = 0.2;
            targetStyle.topEdgeStrokeWeight = 0.2;
            targetStyle.leftEdgeStrokeWeight = 0.2;
            targetStyle.rightEdgeStrokeWeight = 0.2;
            targetStyle.bottomEdgeStrokeColor = blackColor;
            targetStyle.leftEdgeStrokeColor = noneColor;
            targetStyle.rightEdgeStrokeColor = noneColor;
            if (config.isFirst) {
                targetStyle.topEdgeStrokeColor = blackColor;
            }
            else {
                targetStyle.topEdgeStrokeColor = noneColor;
            }
        }
    };
    return StyleCreator;
}());
var settingsManager = new ScriptSettingsManager(defaults(new References().refs));
var SETTINGS = settingsManager.settings;
var HALF_SIZED_TABLES = SETTINGS.hafSize;
var styleCreator = new StyleCreator(app.activeDocument);
var StyleHelper = (function () {
    function StyleHelper(fontStyles, doc) {
        this.fontStyles = fontStyles;
        this.doc = doc;
    }
    StyleHelper.prototype.checkStyles = function (paragraph) {
        for (var i = 0; i < SETTINGS.fontStyles.length; i++) {
            var fStyle = this.fontStyles[i].fontStyle;
            var fCheck = this.fontStyles[i].styleCheck;
            if (fCheck) {
                var contentMatch = this.fontStyles[i].grep.test(paragraph.contents);
                var styleMatch = paragraph.fontStyle === fStyle;
                if (contentMatch && styleMatch) {
                    return i;
                }
            }
            else {
                if (this.fontStyles[i].grep.test(paragraph.contents)) {
                    return i;
                }
            }
        }
        return -1;
    };
    StyleHelper.prototype.gatherCellStyle = function (styleName) {
        var cellStyles = this.doc.allCellStyles;
        for (var i = 0; i < cellStyles.length; i++) {
            if (cellStyles[i].name === styleName) {
                return cellStyles[i];
            }
        }
        return null;
    };
    StyleHelper.prototype.gatherParagraphStyle = function (styleName) {
        var paragraphStyles = this.doc.allParagraphStyles;
        for (var i = 0; i < paragraphStyles.length; i++) {
            var pStyle = paragraphStyles[i].name;
            if (pStyle === styleName) {
                return paragraphStyles[i];
            }
        }
        return null;
    };
    StyleHelper.prototype.gatherCharacterStyle = function (styleName) {
        var characterStyles = this.doc.allCharacterStyles;
        for (var i = 0; i < characterStyles.length; i++) {
            if (characterStyles[i].name === styleName) {
                return characterStyles[i];
            }
        }
        return null;
    };
    StyleHelper.prototype.checkIfAlreadyChanged = function (fontStyleNames, paragraphsStyleName) {
        var suffixCheck = false;
        var prefixCheck = false;
        if (SETTINGS.usePrefixOnChecks) {
            suffixCheck = stringStartsWith(paragraphsStyleName, SETTINGS.prefix);
        }
        if (SETTINGS.useSuffixOnChecks) {
            prefixCheck = stringEndsWith(paragraphsStyleName, SETTINGS.suffix);
        }
        return suffixCheck || prefixCheck || indexOf(fontStyleNames, paragraphsStyleName) > -1;
    };
    return StyleHelper;
}());
var StyleChanger = (function () {
    function StyleChanger() {
    }
    StyleChanger.changeCharStyleByStyle = function (object, appliedStyleName, documentCharacterStyleName, styleHelper) {
        app.findGrepPreferences = NothingEnum.NOTHING;
        app.changeGrepPreferences = NothingEnum.NOTHING;
        app.findGrepPreferences.fontStyle = appliedStyleName;
        var charStyle = styleHelper.gatherCharacterStyle(documentCharacterStyleName);
        app.changeGrepPreferences.appliedCharacterStyle = charStyle;
        try {
            object.changeGrep(true);
        }
        catch (e) {
            debugToConsole(e);
        }
        app.findGrepPreferences = NothingEnum.NOTHING;
        app.changeGrepPreferences = NothingEnum.NOTHING;
    };
    StyleChanger.changeCharacterStyleBySupeOrNot = function (object, superCharacterStyleName, styleHelper) {
        app.findGrepPreferences = NothingEnum.NOTHING;
        app.changeGrepPreferences = NothingEnum.NOTHING;
        app.findGrepPreferences.position = Position.SUPERSCRIPT;
        var charStyle = styleHelper.gatherCharacterStyle(superCharacterStyleName);
        app.changeGrepPreferences.appliedCharacterStyle = charStyle;
        try {
            object.changeGrep(true);
        }
        catch (e) {
            debugToConsole(e);
        }
        app.findGrepPreferences = NothingEnum.NOTHING;
        app.changeGrepPreferences = NothingEnum.NOTHING;
    };
    return StyleChanger;
}());
var ParagraphOperations = (function () {
    function ParagraphOperations(paragraphs, styleHelper) {
        this.paragraphs = paragraphs;
        this.styleHelper = styleHelper;
        this.paragraphsToDelete = [];
        this.paragraphIndex = 0;
        this.currentParagraph = paragraphs[this.paragraphIndex];
    }
    ParagraphOperations.prototype.jump = function (index) {
        this.currentParagraph = this.paragraphs[index];
        return this;
    };
    ParagraphOperations.prototype.count = function () {
        return this.paragraphs.length;
    };
    ParagraphOperations.prototype.next = function () {
        if (this.paragraphIndex < this.paragraphs.length - 1) {
            this.currentParagraph = this.paragraphs[++this.paragraphIndex];
            return this.paragraphs[++this.paragraphIndex];
        }
        if (this.paragraphIndex === this.paragraphs.length - 1) {
            return null;
        }
    };
    ParagraphOperations.prototype.previous = function () {
        if (this.paragraphIndex === 0) {
            return null;
        }
        else {
            this.currentParagraph = this.paragraphs[--this.paragraphIndex];
            return this.paragraphs[this.paragraphIndex--];
        }
    };
    ParagraphOperations.prototype.checkContents = function () {
        var pText = this.currentParagraph.contents;
        var cnt = pText.replace(/\s+/g, '').replace(/\t/gm, '');
        if (cnt === '' || cnt === '\r' || cnt === '\n') {
            if (this.currentParagraph.insertionPoints[0].contents === SpecialCharacters.PAGE_BREAK) {
                return true;
            }
            else {
                this.paragraphsToDelete.push(this.paragraphIndex);
                return false;
            }
        }
        return true;
    };
    ParagraphOperations.prototype.changeStyle = function () {
        if (!this.currentParagraph.isValid)
            return;
        var pStyleName = this.currentParagraph.appliedParagraphStyle.name;
        var fStyleNames = [];
        for (var f = 0; f < SETTINGS.fontStyles.length; f++) {
            fStyleNames.push(SETTINGS.fontStyles[f].name);
        }
        var chk = this.styleHelper.checkIfAlreadyChanged(fStyleNames, pStyleName);
        if (chk)
            return;
        var cnt = this.checkContents();
        if (!cnt)
            return;
        var foundStyle = this.styleHelper.checkStyles(this.currentParagraph);
        if (foundStyle === -1) {
            return;
        }
        var pStyle = this.styleHelper.gatherParagraphStyle(SETTINGS.fontStyles[foundStyle].name);
        try {
            var baseName = this.styleHelper.fontStyles[SETTINGS.base].name;
            if (pStyle.name === baseName) {
                this.currentParagraph.select();
                for (var map = 0; map < SETTINGS.paragraphMappings.length; map++) {
                    var mapping = SETTINGS.paragraphMappings[map];
                    StyleChanger.changeCharStyleByStyle(this.currentParagraph, mapping.fontStyle, mapping.charStyle, this.styleHelper);
                }
                StyleChanger.changeCharacterStyleBySupeOrNot(this.currentParagraph, SETTINGS.superScriptStyle, this.styleHelper);
            }
            this.currentParagraph.applyParagraphStyle(pStyle, false);
            this.currentParagraph.clearOverrides(OverrideType.ALL);
        }
        catch (e) {
            debugToConsole(e);
        }
        if (this.styleHelper.fontStyles[foundStyle].replace) {
            this.currentParagraph.contents = this.currentParagraph.contents.replace(this.styleHelper.fontStyles[foundStyle].from, this.styleHelper.fontStyles[foundStyle].to);
        }
        this.styleHelper.doc.selection = NothingEnum.NOTHING;
    };
    ParagraphOperations.prototype.appendEmpties = function (page) {
        for (var i = 0; i < page.textFrames.length; i++) {
            var paragraphs = page.textFrames[i].paragraphs;
            for (var i_1 = paragraphs.length - 1; i_1 >= 0; i_1--) {
                paragraphs[i_1].insertionPoints[-1].contents = '\r';
                var newParagraph = paragraphs[i_1 + 1];
                var pStyle = this.styleHelper.gatherParagraphStyle(SETTINGS.fontStyles[SETTINGS.base].name);
                try {
                    newParagraph.applyParagraphStyle(pStyle, true);
                }
                catch (_e) { }
            }
        }
    };
    return ParagraphOperations;
}());
var TableOperations = (function () {
    function TableOperations(tables, styleHelper) {
        this.tables = tables;
        this.styleHelper = styleHelper;
    }
    TableOperations.prototype.run = function () {
        for (var t = 0; t < this.tables.length; t++) {
            var theTable = this.tables[t];
            if (this._isTableDone(theTable)) {
                continue;
            }
            else {
                this._mapChars(theTable);
                this._rowFix(theTable);
                this._colFix(theTable);
                this._markDone(theTable);
                this._clearMultipleSpace(theTable);
            }
        }
    };
    TableOperations.prototype._clearMultipleSpace = function (table) {
        app.findGrepPreferences = NothingEnum.NOTHING;
        app.changeGrepPreferences = NothingEnum.NOTHING;
        app.findGrepPreferences.findWhat = '^\\s{2,}';
        app.changeGrepPreferences.changeTo = '';
        try {
            table.changeGrep(true);
        }
        catch (e) {
            debugToConsole(e);
        }
        ;
        app.findGrepPreferences.findWhat = '\\s{2,}$';
        app.changeGrepPreferences.changeTo = '';
        try {
            table.changeGrep(true);
        }
        catch (e) {
            debugToConsole(e);
        }
        ;
        app.findGrepPreferences.findWhat = '\\s{2,}';
        app.changeGrepPreferences.changeTo = ' ';
        try {
            table.changeGrep(true);
        }
        catch (e) {
            debugToConsole(e);
        }
        app.findGrepPreferences = NothingEnum.NOTHING;
        app.changeGrepPreferences = NothingEnum.NOTHING;
    };
    TableOperations.prototype._markDone = function (table) {
        table.insertLabel('done', 'true');
    };
    TableOperations.prototype._isTableDone = function (table) {
        var val = table.extractLabel('done');
        return val === 'true';
    };
    TableOperations.clearAllTableDoneLabels = function (doc) {
        for (var s = 0; s < doc.stories.length; s++) {
            var story = doc.stories[s];
            for (var t = 0; t < story.tables.length; t++) {
                var tbl = story.tables[t];
                tbl.insertLabel('done', '');
            }
        }
    };
    TableOperations.prototype._mapChars = function (theTable) {
        var selection = theTable;
        for (var map = 0; map < SETTINGS.tableMappings.length; map++) {
            var mapping = SETTINGS.tableMappings[map];
            StyleChanger.changeCharStyleByStyle(selection, mapping.fontStyle, mapping.charStyle, this.styleHelper);
        }
        StyleChanger.changeCharacterStyleBySupeOrNot(selection, SETTINGS.superscriptTableStyle, this.styleHelper);
    };
    TableOperations.getEditableWidth = function () {
        var page = app.activeWindow.activePage;
        var bounds = page.bounds;
        var marginPrefs = page.marginPreferences;
        var pageWidth = bounds[3] - bounds[1];
        var margin = marginPrefs.left + marginPrefs.right;
        if (HALF_SIZED_TABLES) {
            pageWidth = pageWidth / 2;
            margin = margin / 2 + 4;
        }
        var editableWidth = pageWidth - margin;
        return editableWidth;
    };
    TableOperations.prototype._colFix = function (theTable) {
        for (var c = 0; c < theTable.columns.length; c++) {
            var theCol = theTable.columns[c];
            var totalWidth = TableOperations.getEditableWidth();
            if (theTable.columnCount == 1) {
                theCol.width = totalWidth;
            }
            if (theTable.columnCount == 2) {
                theCol.width = totalWidth / 2;
            }
            if (theTable.columnCount > 2) {
                var tcc = theTable.columnCount;
                if (tcc > 6) {
                    tcc = 6;
                }
                var lColWidth = totalWidth - SETTINGS.colWidths[tcc] * (tcc - 1);
                var rColWidths = SETTINGS.colWidths[tcc];
                if (lColWidth < rColWidths) {
                    lColWidth = 20;
                    rColWidths = 10;
                }
                if (c == 0) {
                    theCol.width = lColWidth;
                }
                else {
                    theCol.width = rColWidths;
                }
            }
        }
    };
    TableOperations.prototype._rowFix = function (theTable) {
        var rows = theTable.rows;
        for (var r = rows.length - 1; r >= 0; r--) {
            rows[r].height = 5;
            rows[r].autoGrow = true;
            //this._rowCellsFix(rows, r);
        }
    };
    TableOperations.prototype._rowCellsFix = function (rows, r) {
        var row = rows[r];
        for (var c = row.cells.length - 1; c >= 0; c--) {
            var theCell = row.cells[c];
            //this._rowCellFix(theCell);
            if (r === 0) {
                try {
                    theCell.appliedCellStyle = this.styleHelper.gatherCellStyle(SETTINGS.tableCellStylesNames[1]);
                    theCell.clearCellStyleOverrides(false);
                }
                catch (_e) { }
            }
            else {
                try {
                    theCell.appliedCellStyle = this.styleHelper.gatherCellStyle(SETTINGS.tableCellStylesNames[0]);
                    theCell.clearCellStyleOverrides(false);
                }
                catch (_e) { }
            }
        }
    };
    TableOperations.prototype._rowCellFix = function (theCell) {
        var pStyle = this.styleHelper.gatherParagraphStyle(SETTINGS.tableParagraphStyle);
        if (theCell.characters.length === 0) {
            if (theCell.insertionPoints.length > 0) {
                try {
                    theCell.insertionPoints[0].pointSize = pStyle.pointSize;
                }
                catch (_e) { 
                    $.writeln('Hata: ' + _e);
                }
            }
        }
        else if (theCell.characters.length === 1) {
            var ch = theCell.characters[0];
            if (ch.contents === '\u0016' || ch.contents === '' || ch.contents === '\r') {
                ch.pointSize = pStyle.pointSize;
            }
        }
        this._cellParagraphsFix(theCell);
    };
    TableOperations.prototype._cellParagraphsFix = function (theCell) {
        var cellPars = theCell.paragraphs;
        for (var p = 0; p < cellPars.length; p++) {
            var par = cellPars[p];
            var just = par.justification;
            var lindent = par.leftIndent;
            var pStyle = this.styleHelper.gatherParagraphStyle(SETTINGS.tableParagraphStyle);
            if (!pStyle) {
                var baseName = this.styleHelper.fontStyles[SETTINGS.base].name;
                pStyle = this.styleHelper.gatherParagraphStyle(baseName);
            }
            try {
                par.applyParagraphStyle(pStyle, false);
            }
            catch (_e) {
                debugToConsole(_e);
            }
            par.justification = just;
            par.leftIndent = lindent;
        }
    };
    return TableOperations;
}());
function showMainInterface(ensureReferenceCharacterStylesExist, ensureGenericCharacterStylesExist, resetAllTablesStatus) {
    var win = new Window("dialog", "Toolset Manager");
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 10;
    win.margins = 20;
    var btnRef = win.add("button", undefined, "Create Reference Styles");
    btnRef.onClick = function () {
        try {
            ensureReferenceCharacterStylesExist();
            alert("Reference styles created.");
        }
        catch (e) {
            alert("Error: " + e);
        }
    };
    var btnTable = win.add("button", undefined, "Create Table Styles");
    btnTable.onClick = function () {
        try {
            ensureGenericCharacterStylesExist();
            alert("Table styles created.");
        }
        catch (e) {
            alert("Error: " + e);
        }
    };
    var btnReset = win.add("button", undefined, "Reset Tables' Status");
    btnReset.onClick = function () {
        try {
            resetAllTablesStatus();
            alert("Tables reset successfully.");
        }
        catch (e) {
            alert("Error: " + e);
        }
    };
    var btnClose = win.add("button", undefined, "Close", { name: "cancel" });
    btnClose.onClick = function () {
        win.close();
    };
    win.center();
    win.show();
}
function indexOf(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
            return i;
        }
    }
    return -1;
}
function stringEndsWith(str, search) {
    if (typeof str !== 'string' || typeof search !== 'string')
        return false;
    if (search.length > str.length)
        return false;
    return str.substring(str.length - search.length, str.length) === search;
}
function stringStartsWith(str, search) {
    if (typeof str !== 'string' || typeof search !== 'string')
        return false;
    if (search.length > str.length)
        return false;
    return str.substring(0, search.length) === search;
}
var debug = true;
function debugToConsole(obj) {
    debug && $.writeln(obj);
}
var Runner = (function () {
    function Runner(doc, runType) {
        this.doc = doc;
        this.runType = runType;
        this.activePage = app.activeWindow.activePage;
        this.styleHelper = new StyleHelper(SETTINGS.fontStyles, this.doc);
    }
    Runner.prototype.run = function () {
        var _this = this;
        if (!this.activePage) {
            debugToConsole('No Page is Active');
            return;
        }
        if (this.runType === RunType.DIALOG) {
            showMainInterface(styleCreator.ensureReferenceCharacterStylesExist, styleCreator.ensureGenericCharacterStylesExist, function () { return TableOperations.clearAllTableDoneLabels(_this.doc); });
        }
        if (this.runType === RunType.ALL || this.runType === RunType.PARAGRAPH) {
            this._paragraphs();
        }
        if (this.runType === RunType.ALL || this.runType === RunType.TABLE) {
            this._tables();
        }
        if (this.runType === RunType.ALL || this.runType === RunType.PARAGRAPH) {
            this._selectAllTextOnPage();
            this._grepFix();
        }
    };
    Runner.prototype._paragraphs = function () {
        var textFrames = this.activePage.textFrames;
        var paragraphs = [];
        for (var tf = 0; tf < textFrames.length; tf++) {
            for (var j = 0; j < textFrames[tf].paragraphs.length; j++) {
                paragraphs.push(textFrames[tf].paragraphs[j]);
            }
        }
        var po = new ParagraphOperations(paragraphs, this.styleHelper);
        for (var i = po.count() - 1; i >= 0; i--) {
            po.jump(i).changeStyle();
        }
        po.appendEmpties(this.activePage);
    };
    Runner.prototype._tables = function () {
        var textFrames = this.activePage.textFrames;
        for (var tf = 0; tf < textFrames.length; tf++) {
            var tables = textFrames[tf].tables;
            var tb = new TableOperations(tables, this.styleHelper);
            tb.run();
        }
    };
    Runner.prototype._selectAllTextOnPage = function () {
        var targetPage = this.activePage;
        if (!targetPage || !targetPage.isValid) {
            return;
        }
        var frames = targetPage.textFrames;
        if (frames.length > 0) {
            try {
                app.select(frames.everyItem(), SelectionOptions.REPLACE_WITH);
            }
            catch (e) {
                $.writeln('An error occurred during selection: ' + e.message);
            }
        }
        else {
            $.writeln('No text frame found on the specified page.');
        }
    };
    Runner.prototype._grepFix = function () {
        var targetPage = this.activePage;
        if (!targetPage)
            return;
        app.findGrepPreferences = NothingEnum.NOTHING;
        app.changeGrepPreferences = NothingEnum.NOTHING;
        var findPrefs = app.findGrepPreferences;
        var changePrefs = app.changeGrepPreferences;
        var frames = targetPage.textFrames;
        var frameCount = frames.length;
        for (var i = 0; i < frameCount; i++) {
            var frame = frames.item(i);
            if (frame.locked || frame.texts.length === 0)
                continue;
            var textRange = frame.texts.item(0);
            try {
                findPrefs.findWhat = '~M';
                changePrefs.changeTo = '\\x{E000}';
                textRange.changeGrep(false);
                findPrefs.findWhat = '~R';
                changePrefs.changeTo = '\\x{E001}';
                textRange.changeGrep(false);
                findPrefs.findWhat = '~P';
                changePrefs.changeTo = '\\x{E002}';
                textRange.changeGrep(false);
                findPrefs.findWhat = '^\\h+\\r';
                changePrefs.changeTo = '\\r';
                textRange.changeGrep(false);
                findPrefs.findWhat = '\\r{3,}';
                changePrefs.changeTo = '\\r\\r';
                textRange.changeGrep(false);
            }
            catch (_e) {
                $.writeln('An error occurred during GREP operations: ' + _e.message);
            }
            var firstChar = textRange.characters.item(0);
            while (firstChar && firstChar.isValid && String(firstChar.contents) === '\r') {
                firstChar.remove();
                if (textRange.characters.length > 0) {
                    firstChar = textRange.characters.item(0);
                }
                else {
                    break;
                }
            }
            try {
                findPrefs.findWhat = '\\x{E000}';
                changePrefs.changeTo = '~M';
                textRange.changeGrep(false);
                findPrefs.findWhat = '\\x{E001}';
                changePrefs.changeTo = '~R';
                textRange.changeGrep(false);
                findPrefs.findWhat = '\\x{E002}';
                changePrefs.changeTo = '~P';
                textRange.changeGrep(false);
            }
            catch (_e) {
                $.writeln('An error occurred during GREP operations: ' + _e.message);
            }
        }
        app.findGrepPreferences = NothingEnum.NOTHING;
        app.changeGrepPreferences = NothingEnum.NOTHING;
    };
    return Runner;
}());
function runner(doc, runType) {
    if (runType === void 0) { runType = RunType.ALL; }
    return new Runner(doc, runType).run();
}
function main() {
    function getDoc() {
        try {
            return app.activeDocument;
        }
        catch (e) {
            return;
        }
    }
    var doc = getDoc();
    if (!doc) {
        $.writeln('No active document');
        return;
    }
    runner(doc, RunType.TABLE);
    return;
}
$.gc();
app.scriptPreferences.userInteractionLevel =
    UserInteractionLevels.INTERACT_WITH_ALL;
$.gc();
app.doScript(main, undefined, undefined, UndoModes.ENTIRE_SCRIPT, 'NOT IMPORTANT' + ' ' + 'PRE-ALPHA');
