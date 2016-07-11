var Editor = (function () {

    var self = {};
    var currentFileInfo;
    var isHtml = false;
    var isCode = false;
    var codeEditor;

    self.editTextFile = function(fileInfo,html){
        console.error("Edit",fileInfo);
        self.destroyTextEditor();
        var path = fileInfo.path;
        isCode = false;
        if (!fileInfo.name) fileInfo.name = fileInfo.path.split("/").pop();

        var url = Api.getBaseUrl() + "file/" + path;
        $.get(url,function(data){
            fileInfo.content = data;
            var container = UI.getNavigationPane(NAVIGATIONPANE.MAIN);
            self.createTextEditor(container,fileInfo,html);
            setupInterface();
        });
    };

    self.editCodeFile = function(fileInfo){
        console.error("Edit code",fileInfo);
        self.destroyTextEditor();
        var path = fileInfo.path;
        isHtml = false;
        isCode = true;
        if (!fileInfo.name) fileInfo.name = fileInfo.path.split("/").pop();

        var url = Api.getBaseUrl() + "file/" + path;
        $.get(url,function(data){
            fileInfo.content = data;
            var container = UI.getNavigationPane(NAVIGATIONPANE.MAIN);
            self.createCodeEditor(container,fileInfo);
            setupInterface();
        });
    };

    self.updateFile = function(){
        if (currentFileInfo){
            if (isHtml){
                HTMLEDITOR.updateElement();
            }
            if (isCode){
                $("#editorcontent").val(codeEditor.getSession().getValue());
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

    self.createCodeEditor = function(parent,fileInfo){
        currentFileInfo = fileInfo;
        var editor = Templates["codeEditorTemplate"];

        editor = editor.replace("{{name}}",fileInfo.name);
        editor = editor.replace("{{content}}",fileInfo.content);

        var ext = "";
        var p = fileInfo.name.lastIndexOf(".");
        if (p>0) ext = fileInfo.name.substr(p);

        var mode = "text";
        switch (ext){
            case ".json":
                mode = "json"; break;
            case ".js":
                mode = "javascript"; break;
            case ".html":
                mode = "html"; break;
            case ".css":
                mode = "css"; break;
            case ".cs":
                mode = "csharp"; break;
            case ".svg":
                mode = "svg"; break;
        }

        parent.append(editor);

        //$(".fullscreenmodule").hide();
        $(".mainpanelmodule").hide();
        $(".texteditor").show();

        codeEditor = ace.edit("codecontent");
        codeEditor.getSession().setValue($("#editorcontent").val());

        codeEditor.setOption("showInvisibles", false);
        codeEditor.setOption("scrollPastEnd", true);


        //codeEditor.setTheme("ace/theme/twilight");
        //codeEditor.session.setMode("ace/mode/javascript");
        codeEditor.session.setMode("ace/mode/" + mode);
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
