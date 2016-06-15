var Editor = (function () {

    var self = {};
    var currentFileInfo;
    var isHtml = false;

    self.editTextFile = function(fileInfo,html){
        console.error("Edit",fileInfo);
        var path = fileInfo.path;

        var url = Api.getBaseUrl() + "file/" + path;
        $.get(url,function(data){
            fileInfo.content = data;
            var container = UI.getNavigationPane(NAVIGATIONPANE.MAIN);
            self.createTextEditor(container,fileInfo,html);
            setupInterface();
        });
    };

    self.updateFile = function(){
        if (currentFileInfo){
            if (isHtml){
                HTMLEDITOR.updateElement();
            }
            var data = $("#texteditform").serialize();

            //data = "editorcontent=blabla";


            var url = Api.getBaseUrl() + "file/update" + currentFileInfo.path;
            $.post(url,data,function(result){
                console.error(result);
                self.destroyTextEditor();
            });
        }

    };

    self.createTextEditor = function(parent,fileInfo,html){
        currentFileInfo = fileInfo;
        var editor = Templates["textEditorTemplate"];

        editor = editor.replace("{{name}}",fileInfo.name);
        editor = editor.replace("{{content}}",fileInfo.content);


        parent.append(editor);

        //$(".fullscreenmodule").hide();
        $(".mainpanelmodule").hide();
        $(".texteditor").show();
        isHtml = html;

        if (html){
            HTMLEDITOR.init("editorcontent");
        }
    };

    self.destroyTextEditor = function(parent){
        $(".texteditor").remove();
        $(".mainpanelmodule").show();
        //$(".fullscreenmodule").show();
    };

    var setupInterface = function(){
        editor = $(".texteditor");
        editor.on("click",".action_update",function(){
            self.updateFile();
        });
        editor.on("click",".action_cancel",function(){
            self.destroyTextEditor();
        });
    };

    return self;
})();
