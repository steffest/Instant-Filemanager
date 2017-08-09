var FILETYPE = {
    TEXT:{name: "text file", textEditor: true, iconClass: "text"},
    HTML:{name: "html file", textEditor: true, htmlEditor: true , codeEditor: true, iconClass: "text"},
    IMAGE: {name: "image", iconClass: "img", imageEditor: true},
    VECTORIMAGE: {name: "vectorimage", iconClass: "img", imageEditor: false, textEditor: true, codeEditor: true},
    CODE: {name: "code file" , textEditor: true, codeEditor: true},
    CSS: {name: "stylesheet" , textEditor: true, codeEditor: true},
    VIDEO: {name: "video", iconClass: "video"},
    AUDIO: {name: "audio" , iconClass: "audio"},
    FILE:{name: "file"}
};

var FORMEDITOR = {
    TEXT : {id: 1, inlineStyle: "col"},
    TEXTAREA : {id: 2, inlineStyle: "col"},
    HTML : {id: 3, inlineStyle: "col"},
    SELECT : {id: 4, inlineStyle: "colsmall"},
    DATE: {id: 5, inlineStyle: "col"},
    CHECKBOX: {id: 6, inlineStyle: "box"},
    FILEUPLOAD: {id: 7, inlineStyle: "col"},
    HIDDEN: {id: 8, inlineStyle: "col"},
    IMAGE: {id: 9, inlineStyle: "col"},
    PASSWORD: {id: 11, inlineStyle: "col"},
    CUSTOM: {id: 11, inlineStyle: "col"}
};

var NAVIGATIONPANE = {
    FOLDERS : 1,
    FILES :2,
    DETAIL : 3,
    MAIN: 4,
    TEXTEDITOR : 4,
    TAGLIST : 5
};

var UISCOPE = {
    FILES: 1,
    PROFILES: 2,
    PROFILEEDITOR: 3,
    LISTEDITOR: 4,
    TAGS: 5
};

var DIALOGTYPE = {
    CONFIRMATION : {id: 1, className: "confirmation"},
    WARNING : {id: 2, className: "warning"},
    ERROR : {id: 3, className: "error"},
    INPUT : {id: 4, className: "input"}
};

var LISTDISPLAYMODE = {
    LIST: {id: 1, className: "displaylist"},
    ICONS: {id: 1, className: "displayicons" , iconSize: 150},
    THUMBS: {id: 1, className: "displaythumbs", iconSize: 300}
};