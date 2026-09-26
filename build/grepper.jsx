var ANA_METIN_FONT_SIZE = 9
var DIGER_LEFT_INDENT = 0
var STYLE_NAMES = ["baslik", "dipnot", "ana metin"]

var FINDERS = [
  {
    name: 'Delete Spaces',
    findWhat: '([ ])([ ]+)',
    changeTo: '',
    findStyle: NothingEnum.NOTHING,
    changeStyle: NothingEnum.NOTHING,
  },
  {
    name: 'Delete Direct New Lines',
    findWhat: '^\\r',
    changeTo: '',
    findStyle: NothingEnum.NOTHING,
    changeStyle: NothingEnum.NOTHING,
  },
  {
    name: 'Remove Tabs',
    findWhat: '\\t',
    changeTo: '',
    findStyle: NothingEnum.NOTHING,
    changeStyle: NothingEnum.NOTHING,
  }
]

function getPStyle() {
  var group =
    app.activeDocument.paragraphStyleGroups.itemByName(
      'yasemin'
    )
  if (group.isValid) {
    style = group.paragraphStyles.itemByName('ana metin Y')
    if (style.isValid) {
      return group.paragraphStyles.itemByName('ana metin Y')
    } else {
      return app.activeDocument.paragraphStyles.itemByName(
        'ana metin Y'
      )
    }
  } else {
    return app.activeDocument.paragraphStyles.itemByName(
      'ana metin Y'
    )
  }
}

var SEQUENCE1 = [0, 1, 2]

function grepper(findersIndex, selection) {
  var finder = FINDERS[findersIndex]
  app.findGrepPreferences = NothingEnum.nothing
  app.changeGrepPreferences = NothingEnum.nothing
  app.findGrepPreferences.findWhat = finder.findWhat
  try {
    if (finder.findStyle !== NothingEnum.NOTHING) {
      app.findGrepPreferences.appliedParagraphStyle =
        finder.findStyle
    }
    if (finder.findExtended !== NothingEnum.NOTHING) {
      app.findGrepPreferences.pointSize =
        finder.findExtended.size
      app.leftIndent = finder.findExtended.leftIndent
    }
  } catch (e) {
    $.writeln('Style Error')
  }
  app.changeGrepPreferences.changeTo = finder.changeTo
  if (finder.changeStyle !== NothingEnum.NOTHING) {
    app.changeGrepPreferences.appliedParagraphStyle =
      finder.changeStyle
  }
  try {
    selection.changeGrep()
  } catch (e) {
    $.writeln('Grep Error')
  }
}

function checkParagraphs(selection) {
  var toStyle = getPStyle()
  var changed = 0
  var paragraphs = selection.paragraphs
  for (var i = 0; i < paragraphs.length; i++) {
    try {
      var paragraphStyleName =
        paragraphs[i].appliedParagraphStyle.name
      var isHeader =
        paragraphStyleName.toLowerCase().indexOf(STYLE_NAMES[0]) !== -1
      var isFooter =
        paragraphStyleName.toLowerCase().indexOf(STYLE_NAMES[1]) !== -1
      var isBase =
        paragraphStyleName.toLowerCase().indexOf(STYLE_NAMES[2]) !== -1
      var condition = isHeader || isFooter || isBase
      if (!condition) {
        paragraphs[i].applyParagraphStyle(toStyle, false)
        changed++
      }
    } catch (e) {
      $.writeln(e.message)
    }
  }
  $.writeln(changed + ' paragraphs changed')
}

function main() {
  var sel = app.activeDocument.selection
  if (sel.length < 1) return
  for (var i = 0; i < SEQUENCE1.length; i++) {
    $.writeln(FINDERS[SEQUENCE1[i]].name)
    grepper(SEQUENCE1[i], sel[0])
  }
}

$.gc()
app.scriptPreferences.userInteractionLevel =
  UserInteractionLevels.INTERACT_WITH_ALERTS
$.gc()
app.doScript(
  main,
  undefined,
  undefined,
  UndoModes.ENTIRE_SCRIPT,
  'NOT IMPORTANT' + ' ' + 'PRE-ALPHA'
)
$.gc()
