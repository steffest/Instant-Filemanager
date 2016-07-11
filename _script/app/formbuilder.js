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
    CUSTOM: {id: 10, inlineStyle: "col"}
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

        select = el("commonaccess");
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


    self.addEditor = function(type,name,value,editorProperties,hasMultipleLanguages){
        var editor = createDiv("editor");

        if (editorProperties && editorProperties.extention) editor.className += " extended";

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
                editor.className += " hidden";

                $("#commonstate").val(mainValue);
                $("#commonrecordstate").removeClass("hidden");
                handled = true;
                break;

            case "publishfrom":
                input = createHidden(name,name + "_value",mainValue);
                editor.appendChild(input);
                editor.className += " hidden";

                $("#commonpublishfrom").val(mainValue);
                $("#commonpublishdate").removeClass("hidden");
                handled = true;
                break;

            case "publishto":
                input = createHidden(name,name + "_value",mainValue);
                editor.appendChild(input);
                editor.className += " hidden";

                $("#commonpublishto").val(mainValue);
                handled = true;
                break;

            case "category":
                input = createHidden(name,name + "_value",mainValue);
                editor.appendChild(input);
                editor.className += " hidden";

                $("#commoncategory").val(mainValue);
                $("#commonrecordcategory").removeClass("hidden");
                handled = true;
                break;
            case "access":
                input = createHidden(name,name + "_value",mainValue);
                editor.appendChild(input);
                editor.className += " hidden";

                $("#commonaccess").val(mainValue);
                $("#commonrecordaccess").removeClass("hidden");
                handled = true;
                break;
            case "tags":
                input = createHidden(name,name + "_value",mainValue);
                editor.appendChild(input);
                editor.className += " hidden";

                var tagInput = $("#commontags");

                tagInput.val(mainValue);
                $("#commontagsinput").removeClass("hidden");

                var tagListContainer = UI.getNavigationPane(NAVIGATIONPANE.TAGLIST);
                tagListContainer.addClass("editor").removeClass("hidden");

                // tageeditor
                var tags = mainValue.split(",");
                FormBuilder.initTagEditor(tags,
                    function(me){
                        var tag = me.innerHTML;
                        tagInput.val(concatStringAdd(tagInput.val(),tag));
                    },
                    function(me){
                        var tag = me.innerHTML;
                        tagInput.val(concatStringRemove(tagInput.val(),tag));
                    });

                handled = true;
                break;
        }

        if (!handled){
            editorProperties = editorProperties || {};
            editorProperties.data = lanValues || value;


            if (type == FORMEDITOR.HIDDEN) {
                editor.className += " hidden";
            }else{
                var toggleIcon = createFaIcon("caret-down");
                var label = createDiv("itemcaption action_toggleformeditor");
                label.innerHTML =  editorProperties.label || name;
                $(label).prepend(toggleIcon);
                if (editorProperties.info) label.innerHTML += " <small>(" + editorProperties.info + ")</small>";
                editor.appendChild(label);
            }

            var multiEditors;

            if (hasMultipleLanguages){
                if (editorProperties.global){
                    multiEditors = createDiv("languageeditor_all language_all flag_all");
                    self.addEditorElement(multiEditors,type,name,mainValue,editorProperties);
                }else{
                    multiEditors = createDiv("languages");
                    $(multiEditors).data("type",type);
                    $(multiEditors).data("name",name);
                    $(multiEditors).data("ext",editorProperties);

                    Config.languages.forEach(function(lan){
                        lanValues = value[lan];
                        if (lanValues){
                            var lanName = lan + ":" + name;
                            var lanValue = lanValues[name] || "";
                            var lanEditor = createDiv("languageeditor language_" + lan  + " flag_" + lan);

                            if (type == FORMEDITOR.HIDDEN){
                                lanEditor.className = "";
                            }
                            self.addEditorElement(lanEditor,type,lanName,lanValue,editorProperties);
                            multiEditors.appendChild(lanEditor);
                        }
                    });
                }


                editor.appendChild( multiEditors);
            }else{
                self.addEditorElement(editor,type,name,mainValue,editorProperties);
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

                var config = {
                    name: name,
                    id: '',
                    value: value,
                    path: "articles"
                };

                var uploader = createUpload(config);
                parent.appendChild(uploader);

                break;

            case FORMEDITOR.HIDDEN:
                input = createHidden(name,null,value);
                parent.appendChild(input);
                break;

            case FORMEDITOR.IMAGE:

                function showImage(value,forceRefresh){

                    if (value && ext && ext.iconBaseUrl){
                        var img;
                        $(parent).find(".imagepreview").remove();
                        var imgcontainer = createDiv("imagepreview");

                        var imgUrl = ext.iconBaseUrl;
                        if (forceRefresh) imgUrl += "refresh/";
                        imgUrl += value;

                        img = document.createElement("img");
                        img.src = imgUrl;
                        if (ext.baseUrl){
                            img.onclick = function(){
                                window.open(ext.baseUrl + value);
                            }
                        }
                        imgcontainer.appendChild(img);
                        if (ext.uploadPath){
                            var actions = createDiv();

                            var url = value;
                            if (url.indexOf("/")<0 && ext.uploadPath) url =  ext.uploadPath + "/" + url;

                            var editUrl =  "plugin/imageeditor/?f=" +  url;
                            actions.innerHTML = '<a href="'+editUrl+'" target="_blank" class="action"><i class="fa fa-edit"></i> Edit</a>';
                            actions.innerHTML += ' <a href="javascript:onImageEditorUpdate()" class="action"><i class="fa fa-refresh"></i> Refresh</a>';
                            imgcontainer.appendChild(actions);

                            window.onImageEditorUpdate = function(){
                                showImage(value,true);
                            }
                        }

                        parent.appendChild(imgcontainer);
                    }
                }

                input = createInput("inputBox",name,null,value);
                input.onchange = function(){showImage(this.value)};
                showImage(value);
                parent.appendChild(input);

                var select = createDiv("textlink action");
                select.innerHTML = '<i class="fa fa-folder-open-o"></i> Browse';
                select.onclick = function(){
                    UI.showDialog({
                        onSelect: function (name) {
                            input.value = name;
                            showImage(name);
                        }
                    });
                };
                parent.appendChild(select);

                if (ext.uploadPath){


                    var uploadUrl = ext.uploadPath || "articles";
                    if (ext.addCategoryToUploadPath && ext.data && ext.data.category){
                        uploadUrl += ext.data.category + "/";
                    }

                    var config = {
                        path: uploadUrl,
                        onDone: function(fileData){
                            if (fileData.filename){
                                var url =  fileData.filename;
                                if (!ext.baseUrl && ext.uploadPath) url = uploadUrl + url;
                                input.value = url;
                                showImage(url);
                            }
                        }
                    };

                    var uploader = createUpload(config);
                    parent.appendChild(uploader);


                }




                break;

            case FORMEDITOR.CUSTOM:
                input = createHidden(name,null,value);
                parent.appendChild(input);

                var templateName = ext.editorTemplate;
                if (templateName){
                    Template.get("editor_" + templateName,function(template){

                        var div = createDiv();
                        div.innerHTML = template;
                        parent.appendChild(div);
                        var scripts = div.getElementsByTagName('script');
                        if (scripts.length){
                            window.s = scripts;
                            eval(scripts[0].innerHTML);

                            if (window[templateName + "Init"]){
                                window[templateName + "Init"](div,input);
                            }
                        }

                    });
                }
                break;
        }
    };

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
                case FORMEDITOR.IMAGE:
                    input = createInput("inputBox inlineinput " + className,name,id,value);
                    container.appendChild(input);
                    break;
            }
        }


    };

    self.removeExtendedEditors = function(){
        formContainer.find(".editor.extended").remove();
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

        // update slugs
        var formContent = $(".formcontent");
        formContent.find("[name='slug']").val(createSlug(formContent.find("[name='name']").val()));

        var input = document.getElementsByName("activelanguages");
        if (input && input.length) input = input[0];
        if (input && input.value){
            var languages = input.value.split(",");
            languages.forEach(function(lan){
                formContent.find("[name='"+lan+":slug']").val(createSlug(formContent.find("[name='"+lan+":name']").val()));
            })
        }

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
                   if (editor == "plain" || editor == "textarea"){
                       result = FORMEDITOR.TEXTAREA;
                   }
                   if (editor == "custom"){
                       result = FORMEDITOR.CUSTOM;
                   }
                   break;
               case "hidden":
                   result = FORMEDITOR.HIDDEN;
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
               case "image":
                   result = FORMEDITOR.IMAGE;
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

    self.setLanguageList = function(activeLanguages,section){
        var targetId = "#commonrecordlanguage";
        var containerId = "#languagelist";
        var addContainerId = "#addlanguagelist";

        if (section == "list") {
            targetId = "#commonmistlanguage";
            containerId = "#listlanguagelist";
            addContainerId = "#addlistlanguagelist";
        }

        $(targetId).removeClass("hidden");
        var container = $(containerId);
        var addContainer = $(addContainerId);

        container.empty();
        var lanActive = {};
        activeLanguages.forEach(function(lan){
            var lanSelect = createDiv("languageselect flag_" + lan,"languageselect_" + lan);
            lanSelect.innerHTML = Config.languageNames[lan];
            container.append(lanSelect);
            lanActive[lan] = true;
        });


        addContainer.empty().addClass('hidden');
        Config.languages.forEach(function(lan){
            if (!lanActive[lan]){
                var lanSelect = createDiv("languageselect flag_" + lan,"languageselect_" + lan);
                lanSelect.innerHTML = Config.languageNames[lan];
                addContainer.append(lanSelect);
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

    self.addListLanguage = function(lan){
        var input = document.getElementsByName("activelanguages");
        if (input && input.length) input = input[0];
        if (input){
            input.value += "," + lan;
        }

        $('#listlanguagelist').append($('#languageselect_' + lan));
        DataStore.editList(undefined,undefined,lan);


    };

    return self;
})();
