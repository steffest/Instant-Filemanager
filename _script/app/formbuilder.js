var FORMEDITOR = {
    TEXT : 1,
    TEXTAREA : 2,
    HTML : 3,
    SELECT : 4,
    DATE: 5
};

var FormBuilder = (function () {

    var self = {};
    var formContainer;
    var postProccessing;
    var hasHTML;

    self.setContainerElm = function(elm){
        formContainer = elm;
        postProccessing = [];
        hasHTML = false;


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
    };

    //hide($("#commonrecordstatus"));
    //hide($("#commonpublishdate"));
    //hide($("#commonrecordcategory"));
    //hide($("#commonrecordtags"));

    self.addEditor = function(type,name,value,ext){
        var editor = createDiv("editor");

        var handled = false;
        var input;

        // prehandle common record fields
        switch (name){
            case "id":
                //ignore - should never be updated
                handled = true;
                break;
            case "state":
                input = createHidden(name,name + "_value",value);
                editor.appendChild(input);

                $("#commonstate").val(value);
                $("#commonrecordstate").removeClass("hidden");
                handled = true;
                break;

            case "publishfrom":
                input = createHidden(name,name + "_value",value);
                editor.appendChild(input);

                $("#commonpublishfrom").val(value);
                $("#commonpublishdate").removeClass("hidden");
                handled = true;
                break;

            case "publishto":
                input = createHidden(name,name + "_value",value);
                editor.appendChild(input);

                $("#commonpublishto").val(value);
                handled = true;
                break;

            case "category":
                input = createHidden(name,name + "_value",value);
                editor.appendChild(input);

                $("#commoncategory").val(value);
                $("#commonrecordcategory").removeClass("hidden");
                handled = true;
                break;
        }

        if (!handled){
            var label = createDiv("itemcaption");
            label.innerHTML = name;

            switch (type){
                case FORMEDITOR.TEXT:
                    input = createInput("inputBox",name,null,value);

                    editor.appendChild(label);
                    editor.appendChild(input);
                    break;

                case FORMEDITOR.TEXTAREA:
                    input = createTextarea(null,name,null,value);

                    editor.appendChild(label);
                    editor.appendChild(input);
                    break;

                case FORMEDITOR.HTML:
                    input = createTextarea("htmltextarea",name,null,value);

                    editor.appendChild(label);
                    editor.appendChild(input);
                    hasHTML = true;

                    postProccessing.push(function(){
                        CKEDITOR.replace(name);
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


                    editor.appendChild(label);
                    editor.appendChild(input);
                    break;
                case FORMEDITOR.DATE:
                    input = createInput("inputBox",name,null,value);

                    editor.appendChild(label);
                    editor.appendChild(input);

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
            }
        }

        formContainer.append(editor);
    };

    self.addEditorFromTemplate = function(template,data){
        var editor = Mustache.render(template,data);
        console.log(editor);
        formContainer.append(editor);
    };

    self.wrap = function(){
        if (postProccessing.length > 0){
            for (var i = 0, len = postProccessing.length; i<len;i++){
                var f = postProccessing[i];
                f();
            }
        }
    };

    self.prepareSubmit = function(){
        if (hasHTML){
            for (var editor in CKEDITOR.instances){
                if (CKEDITOR.instances.hasOwnProperty(editor)){
                    CKEDITOR.instances[editor].updateElement();
                }

            }
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
                   break;
               case "date":
                   result = FORMEDITOR.DATE;
                   break;
               case "enum":
                   result = FORMEDITOR.SELECT;
                   break;
           }
        }

        return result;
    }

    return self;
})();
