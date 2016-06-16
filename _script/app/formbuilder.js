var FORMEDITOR = {
    TEXT : {id: 1, inlineStyle: "col"},
    TEXTAREA : {id: 2, inlineStyle: "col"},
    HTML : {id: 3, inlineStyle: "col"},
    SELECT : {id: 4, inlineStyle: "colsmall"},
    DATE: {id: 5, inlineStyle: "col"},
    CHECKBOX: {id: 6, inlineStyle: "box"},
    FILEUPLOAD: {id: 7, inlineStyle: "col"},
    HIDDEN: {id: 8, inlineStyle: "col"}
};

var FormBuilder = (function () {

    var self = {};
    var formContainer;
    var postProccessing;
    var hasHTML;

    var onAddTag;
    var onRemoveTag;

    self.setContainerElm = function(elm){
        formContainer = elm;
        clearFormPostProcessor();
        hasHTML = false;
    };

    self.getContainerElm = function(){
        return formContainer;
    };

    self.setCommonEditors = function(ext){
        var select = el("commoncategory");
        $(select).empty();
        if (ext.categories){
            for (var i= 0, len = ext.categories.length; i<len;i++){
                var v = ext.categories[i];

                var opt = document.createElement("option");
                opt.value = v;
                opt.innerHTML = v.capitalize();
                select.appendChild(opt);
            }
        }

        var select = el("commonaccess");
        $(select).empty();
        if (ext.access){
            for (var i= 0, len = ext.access.length; i<len;i++){
                var v = ext.access[i];

                var opt = document.createElement("option");
                opt.value = v;
                opt.innerHTML = v.capitalize();
                select.appendChild(opt);
            }
        }
    };


    self.addEditor = function(type,name,value,ext,hasMultipleLanguages){
        var editor = createDiv("editor");

        var handled = false;
        var input;
        var lanValues;

        var mainValue = value;
        if (hasMultipleLanguages){
            lanValues = value[Config.defaultLanguage] || [];
            mainValue = lanValues[name] || "";
        }


        // prehandle common record fields
        switch (name){
            case "id":
            case "isdeleted":
            case "created":
            case "lastmodified":
                //ignore - should never be updated
                handled = true;
                break;
            case "state":
                input = createHidden(name,name + "_value",mainValue);
                editor.appendChild(input);

                $("#commonstate").val(mainValue);
                $("#commonrecordstate").removeClass("hidden");
                handled = true;
                break;

            case "publishfrom":
                input = createHidden(name,name + "_value",mainValue);
                editor.appendChild(input);

                $("#commonpublishfrom").val(mainValue);
                $("#commonpublishdate").removeClass("hidden");
                handled = true;
                break;

            case "publishto":
                input = createHidden(name,name + "_value",mainValue);
                editor.appendChild(input);

                $("#commonpublishto").val(mainValue);
                handled = true;
                break;

            case "category":
                input = createHidden(name,name + "_value",mainValue);
                editor.appendChild(input);

                $("#commoncategory").val(mainValue);
                $("#commonrecordcategory").removeClass("hidden");
                handled = true;
                break;
            case "access":
                input = createHidden(name,name + "_value",mainValue);
                editor.appendChild(input);

                $("#commonaccess").val(mainValue);
                $("#commonrecordaccess").removeClass("hidden");
                handled = true;
                break;
            case "tags":
                input = createHidden(name,name + "_value",mainValue);
                editor.appendChild(input);

                $("#commontags").val(mainValue);
                $("#commontagsinput").removeClass("hidden");

                var tagListContainer = UI.getNavigationPane(NAVIGATIONPANE.TAGLIST);
                tagListContainer.addClass("editor").removeClass("hidden");
                handled = true;
                break;
        }

        if (!handled){
            var label = createDiv("itemcaption");
            label.innerHTML = name;
            editor.appendChild(label);

            if (hasMultipleLanguages){
                var multiEditors = createDiv("languages");
                $(multiEditors).data("type",type);
                $(multiEditors).data("name",name);
                $(multiEditors).data("ext",ext);

                Config.languages.forEach(function(lan){
                    lanValues = value[lan];
                    if (lanValues){
                        var lanName = lan + ":" + name;
                        var lanValue = lanValues[name] || "";
                        var lanEditor = createDiv("languageeditor language_" + lan  + " flag_" + lan);
                        self.addEditorElement(lanEditor,type,lanName,lanValue,ext);
                        multiEditors.appendChild(lanEditor);
                    }
                });

                editor.appendChild( multiEditors);
            }else{
                self.addEditorElement(editor,type,name,mainValue,ext);
            }

        }

        formContainer.append(editor);
    };

    self.addEditorElement = function(parent,type,name,value,ext,language){
        var input;

        switch (type){
            case FORMEDITOR.TEXT:
                input = createInput("inputBox",name,null,value);
                parent.appendChild(input);
                break;

            case FORMEDITOR.TEXTAREA:
                input = createTextarea(null,name,null,value);
                parent.appendChild(input);
                break;

            case FORMEDITOR.HTML:
                input = createTextarea("htmltextarea",name,null,value);
                parent.appendChild(input);
                hasHTML = true;

                postProccessing.push(function(){
                    HTMLEDITOR.init(name);
                });
                break;

            case FORMEDITOR.SELECT:
                var values = ext.values;
                if (values){
                    values = values.split(",");
                }
                input = document.createElement("select");
                input.name = name;


                for (var i = 0, len = values.length; i<len; i++){
                    var v = values[i];
                    var opt = document.createElement("option");
                    opt.value = v;
                    opt.innerHTML = v;
                    if (value == v) opt.selected = "selected";
                    input.appendChild(opt);
                }

                parent.appendChild(input);
                break;
            case FORMEDITOR.DATE:
                value = formatDate(value);
                input = createInput("inputBox",name,null,value);

                var dateTime = moment(value,'DD/MM/YYYY');
                var inputTime = createHidden(name + "_time",null,dateTime.format("x"));

                parent.appendChild(input);
                parent.appendChild(inputTime);

                postProccessing.push(function(){
                    var picker = new Pikaday({
                        field: input,
                        format: 'DD/MM/YYYY',
                        onSelect: function() {
                            inputTime.value = this.getMoment().format('x');
                            //console.log(this.getMoment().format('Do MMMM YYYY'));
                        }
                    });
                });

                break;
            case FORMEDITOR.FILEUPLOAD:
                console.error("files",value);
                var uploader = createUpload(name,'',value,"articles");
                parent.appendChild(uploader);

                break;

            case FORMEDITOR.HIDDEN:
                console.error("files",value);
                input = createHidden(name,null,value);
                parent.appendChild(input);
                break;
        }
    }

    self.addInlineEditor = function(container,type,name,value,ext,index){

        var input;
        var handled = false;

        var editorId = numeric(container.id);
        var id = name + "_" + editorId;

        if (!handled){
            var className = type.inlineStyle || "";
            if (index == 0) className += " first";

            switch (type){
                case FORMEDITOR.TEXT:
                    input = createInput("inputBox inlineinput " + className,name,id,value);
                    container.appendChild(input);
                    break;

                case FORMEDITOR.TEXTAREA:
                    input = createTextarea("inlineinput " + className,name,id,value);
                    container.appendChild(input);
                    break;

                case FORMEDITOR.HTML:
                    input = createTextarea("inlineinput " + className,name,id,value);
                    container.appendChild(input);
                    break;

                case FORMEDITOR.SELECT:
                    var values = ext.values;
                    if (values){
                        values = values.split(",");
                    }
                    input = document.createElement("select");
                    input.name = name;
                    input.className = "inlineinput " + className;


                    for (var i = 0, len = values.length; i<len; i++){
                        var v = values[i];
                        var opt = document.createElement("option");
                        opt.value = v;
                        opt.innerHTML = v;
                        if (value == v) opt.selected = "selected";
                        input.appendChild(opt);
                    }


                    container.appendChild(input);
                    break;
                case FORMEDITOR.DATE:
                    input = createInput("inputBox inlineinput " + className,name,id,value);

                    container.appendChild(input);

                    postProccessing.push(function(){
                        var picker = new Pikaday({
                            field: input,
                            format: 'DD/MM/YYYY',
                            onSelect: function() {
                                //console.log(this.getMoment().format('Do MMMM YYYY'));
                            }
                        });
                    });

                    break;
                case FORMEDITOR.CHECKBOX:
                    var box = createDiv("inline " + className);
                    input = createInput("checkbox inlineinput",name,id,value);
                    input.type = "checkbox";
                    input.checked = value;
                    box.appendChild(input);
                    container.appendChild(box);
                    break;
            }
        }


    };

    self.renderInlineForm = function(container,data,fields){
        for (var i = 0, len = fields.length; i<len; i++){
            var field = fields[i];
            var value = data[field.name];
            if (typeof value == "undefined") value = "";

            var editorType = self.getEditorTypeForField(field);
            self.addInlineEditor(container,editorType,field.name,value,field,i);

        }
    };

    self.addEditorFromTemplate = function(template,data){
        var editor = Mustache.render(template,data);
        console.log(editor);
        formContainer.append(editor);
    };

    self.wrap = function(){
        executeFormPostProcessor();
    };

    var clearFormPostProcessor = function(){
        HTMLEDITOR.clear();
        postProccessing = [];
    };

    var executeFormPostProcessor = function(){
        if (postProccessing.length > 0){
            for (var i = 0, len = postProccessing.length; i<len;i++){
                var f = postProccessing[i];
                f();
            }
        }
    };

    self.prepareSubmit = function(){
        if (hasHTML){
            HTMLEDITOR.updateElements();
        }

        // update common editors
        var elm = el("state_value");
        if (elm) elm.value = $("#commonstate").val();

        elm = el("publishfrom_value");
        if (elm) elm.value = $("#commonpublishfrom").val();

        elm = el("publishto_value");
        if (elm) elm.value = $("#commonpublishto").val();

        elm = el("category_value");
        if (elm) elm.value = $("#commoncategory").val();

        elm = el("tags_value");
        if (elm) elm.value = $("#commontags").val();

        elm = el("access_value");
        if (elm) elm.value = $("#commonaccess").val();
    };

    self.getEditorTypeForField = function(field){
        var result = FORMEDITOR.TEXT;
        var type = field.type;
        var editor = field.editor;


        if (type){
           switch (type){

               case "int":
                   result = FORMEDITOR.TEXT;
                   break;
               case "text":
                   if (editor == "html"){
                       result = FORMEDITOR.HTML;
                   }
                   if (editor == "plain"){
                       result = FORMEDITOR.TEXTAREA;
                   }
                   break;
               case "date":
                   result = FORMEDITOR.DATE;
                   break;
               case "enum":
                   result = FORMEDITOR.SELECT;
                   break;
               case "checkbox":
                   result = FORMEDITOR.CHECKBOX;
                   break;
               case "file":
                   result = FORMEDITOR.FILEUPLOAD;
                   break;
           }
        }

        return result;
    };


    self.initTagEditor = function(tags,onAdd,onRemove){

        var tagListContainer = UI.getNavigationPane(NAVIGATIONPANE.TAGLIST);
        tagListContainer.addClass("editor");
        //tagListContainer.find(".tag").addClass("selected");

        tagListContainer.find(".tag").each(function(){
            var tag = this.innerHTML;
            $(this).toggleClass("selected",tags.includes(tag));
        });

        $("#commontags").val(tags.join(","));
        $("#commontagsinput").removeClass("hidden");

        onAddTag = onAdd;
        onRemoveTag = onRemove;
    };

    self.clearTagEditor = function(){

        var tagListContainer = UI.getNavigationPane(NAVIGATIONPANE.TAGLIST);
        tagListContainer.removeClass("editor");
        $("#commontags").val("");
        $("#commontagsinput").addClass("hidden");

        onAddTag = undefined;
        onRemoveTag = undefined;
    };

    self.handeTagClick = function(elm){
        var tagListContainer = UI.getNavigationPane(NAVIGATIONPANE.TAGLIST);
        if (tagListContainer.hasClass("editor")){
            if (elm.classList.contains("selected")){
                if (onRemoveTag) onRemoveTag(elm);
            }else{
                if (onAddTag) onAddTag(elm);
            }
            $(elm).toggleClass("selected");
        }else{
            DataStore.listTag(elm.innerHTML);
        }
    };

    self.setLanguageList = function(activeLanguages){
        $("#commonrecordlanguage").removeClass("hidden");
        var container = $("#languagelist");
        container.empty();
        var lanActive = {};
        activeLanguages.forEach(function(lan){
            var lanSelect = createDiv("languageselect flag_" + lan,"languageselect_" + lan);
            lanSelect.innerHTML = Config.languageNames[lan];
            container.append(lanSelect);
            lanActive[lan] = true;
        });

        container = $("#addlanguagelist");
        container.empty().addClass('hidden');
        Config.languages.forEach(function(lan){
            if (!lanActive[lan]){
                var lanSelect = createDiv("languageselect flag_" + lan,"languageselect_" + lan);
                lanSelect.innerHTML = Config.languageNames[lan];
                container.append(lanSelect);
            }
        });
    };

    self.toggleLanguage = function(lan){
        $(".language_" + lan).toggle();
        $("#languageselect_" + lan).toggleClass("inactive");
    };

    self.addLanguage = function(lan){
        postProccessing = [];
        var editors = $(".formcontent").find(".languages");

        editors.each(function(index,editor){
            var type = $(editor).data("type");
            var name = $(editor).data("name");
            var ext = $(editor).data("ext");

            var lanName = lan + ":" + name;
            var lanValue = "";
            var lanEditor = createDiv("languageeditor language_" + lan + " flag_" + lan);
            self.addEditorElement(lanEditor,type,lanName,lanValue,ext);
            editor.appendChild(lanEditor);

        });

        executeFormPostProcessor();

        var input = document.getElementsByName("activelanguages");
        if (input && input.length) input = input[0];
        if (input){
            input.value += "," + lan;
        }

        $('#languagelist').append($('#languageselect_' + lan));


    };

    return self;
})();
