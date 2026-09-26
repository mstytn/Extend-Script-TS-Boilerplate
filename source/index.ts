/// <reference types="types-for-adobe/InDesign/2023"/>
/// <reference path='./main.ts'/>

$.gc()
app.scriptPreferences.userInteractionLevel =
    UserInteractionLevels.INTERACT_WITH_ALL
$.gc()
app.doScript(
    main,
    undefined,
    undefined,
    UndoModes.ENTIRE_SCRIPT,
    'NOT IMPORTANT' + ' ' + 'PRE-ALPHA'
)