var NAVIGATIONPANE = {
    FOLDERS : 1,
    FILES :2,
    DETAIL : 3,
    TEXTEDITOR : 4
};

var UISCOPE = {
    FILES: 1,
    PROFILES: 2,
    PROFILEEDITOR: 3
};

var UI = (function () {

    var self = {};

    var currentDialogConfig;
    var currentFile;
    var currentDirectory;
    var currentDirectoryElm;
    var filemanager;

    var currentProfile;
    var currentProfileElm;

    var navigationContainerElm;
    var navigationFolderElm;
    var navigationFilesElm;
    var navigationDetailElm;

    self.addNavigationPanes = function(parent){
        navigationContainerElm = parent;
        parent.append(Templates["filemanagerTemplate"]);

        navigationFolderElm = navigationContainerElm.find(".foldercontainer");
        navigationFilesElm = navigationContainerElm.find(".filelist");
        navigationDetailElm = navigationContainerElm.find(".filedetail");

        // init datepickers
        var pickerFrom = new Pikaday({
            field: el("commonpublishfrom"),
            format: 'DD/MM/YYYY'
        });
        var pickerTo = new Pikaday({
            field: el("commonpublishto"),
            format: 'DD/MM/YYYY'
        });


    };

    self.getNavigationPane = function(section){
       switch(section){
           case NAVIGATIONPANE.FOLDERS:
                return navigationFolderElm;
                break;
           case NAVIGATIONPANE.FILES:
               return navigationFilesElm;
               break;
           case NAVIGATIONPANE.DETAIL:
               return navigationDetailElm;
               break;
       }
    };

    self.addNavigationPanesTitle = function(section,title){

    };

    self.initFileManager = function(){
        fileManagerBindings();

        var elm = $("#root");
        currentDirectoryElm = elm;
        FileSystem.getDirectory(elm);

    };


    self.initProfileManager = function(){
        profileManagerBindings();
    };

    var profileManagerBindings = function(){
        var container = navigationFilesElm;
        filemanager = $(".filemanager");


        $(".profile").on("click",function(){
            currentProfileElm = this;
            currentProfile = $(this).data("profile");
            console.log("click profile",currentProfile);
            DataStore.listProfile(currentProfile,currentProfileElm);
        });

        navigationFolderElm.on("click",".category",function(){
            currentProfileElm = $(this).parent().prev(".profile");
            currentProfile = currentProfileElm.data("profile");
            var category = $(this).html();
            console.log("click profile",currentProfile);
            DataStore.listProfileCategory(currentProfile,category);
        });

        container.on("click",".record",function(){
            var elm = $(this);
            console.log("click",elm);
            var profile = elm.data("profile");
            var profileId = elm.data("id");
            DataStore.editProfile(profile,profileId);
        });

        filemanager.on("click",".action_addrecord",function(){
            DataStore.editProfile(currentProfile,0);
        });

        filemanager.on("click",".action_updateprofile",function(){
            DataStore.updateProfile();
        });

        filemanager.on("click",".action_cancelprofile",function(){
            DataStore.cancelEditProfile();
        });

        filemanager.on("click",".action_deleteprofile",function(){
            var template = Templates["inlineDialogTemplate"];
            var content = "Are you sure you want to delete this item?";
            template = template.replace("{{content}}",content);

            var baseElm = this;
            var config = {
                baseElm : baseElm,
                template: template,
                onOk: function(){
                    DataStore.deleteProfile();
                    UI.restoreInlineDialog(baseElm);
                },
                onCancel: function(){
                    UI.restoreInlineDialog(baseElm);
                }
            };
            UI.inlineDialog(config);
        });


        // other sections
        navigationFolderElm.on("click",".section",function(){
            var section = $(this).data("section");
            DataStore.initSection(this,section);
        });

        navigationFolderElm.on("click",".menu",function(){
            var id = $(this).data("id");
            DataStore.editList(id);
        });
    };

    var fileManagerBindings = function(){
        filemanager = $(".filemanager");

        $(".directory").on("click",".label",function(){
            var elm = $(this).closest(".directory");
            currentDirectoryElm = elm;
            console.log("click directory",elm);
            FileSystem.getDirectory(elm);
        });


        filemanager.on("click",".file",function(){
            var elm = $(this);
            console.log("click",elm);
            FileSystem.showFile(elm);
        });

        filemanager.on("dblclick",".filedirectory",function(){
            var name = $(this).find(".label").html();
            var elm = currentDirectoryElm.find(".directory").find(':contains("'+name+'")');
            elm.trigger("click");

        });

        filemanager.on("dblclick",".file",function(){
            var fileInfo = self.getSelectedPath();
            var path = $(this).data("path");
            // default action for file

            var fileType = FileSystem.getFileType(path);
            if (fileType.htmlEditor){
                Editor.editTextFile(fileInfo,true);
            }else if (fileType.textEditor){
                Editor.editTextFile(fileInfo,false);
            }else{
                var url = Api.getBaseUrl() + "file" + path;
                window.open(url);
            }

        });

        filemanager.on("click",".filedirectory",function(){
            var elm = $(this);
            FileSystem.showDirectory(elm);
        });

        filemanager.on("click",".directoryup",function(){
            var parent = $(this).data("parent");
            console.error(parent)
            if (parent) parent.find(".label").first().trigger("click");
            //currentDirectoryElm
        });

        filemanager.on("click",".action_filerename",function(){
            var pathInfo = self.getSelectedPath();
            var value = pathInfo.name;

            var template = Templates["inlineDialogTemplate"];
            var content = Templates["inputBox"];

            content = content.replace("{{value}}",value);
            template = template.replace("{{content}}",content);

            var baseElm = this;
            var config = {
                baseElm : baseElm,
                template: template,
                type: pathInfo.type,
                onOk: function(){
                    var filename = $(".inlineDialog").find(".inputBox").val();
                    if (filename != ""){
                        FileSystem.renameFile(pathInfo.path,filename,function(){
                            self.refreshCurrentDirectory();
                            self.refreshCurrentFileDetail();
                        });
                        self.restoreInlineDialog(baseElm);
                    }
                },
                onCancel: function(){
                    self.restoreInlineDialog(baseElm);
                }
            };
            self.inlineDialog(config);
        });

        filemanager.on("click",".action_edittext",function(){
            var fileInfo = self.getSelectedPath();
            Editor.editTextFile(fileInfo);
        });

        filemanager.on("click",".action_edithtml",function(){
            var fileInfo = self.getSelectedPath();
            Editor.editTextFile(fileInfo,true);
        });

        filemanager.on("click",".action_upload",function(){
            var path= self.getCurrentPath();
            Upload.init(path,function(){
                $(".uploadbar").hide();
                self.refreshCurrentDirectory();
            });
        });

        filemanager.on("click",".action_filecreate",function(){
            var path= self.getCurrentPath();
            console.error(path);
            var value = "new file.txt";

            var template = Templates["inlineDialogTemplate"];
            var content = Templates["inputBox"];

            content = content.replace("{{value}}",value);
            template = template.replace("{{content}}",content);

            var baseElm = this;
            var config = {
                baseElm : baseElm,
                template: template,
                type: "file",
                onOk: function(){
                    var filename = $(".inlineDialog").find(".inputBox").val();
                    if (filename != ""){
                        FileSystem.createFile(path + "/" + filename,function(){
                            self.refreshCurrentDirectory();
                        });
                        self.restoreInlineDialog(baseElm);
                    }
                },
                onCancel: function(){
                    self.restoreInlineDialog(baseElm);
                }
            };
            self.inlineDialog(config);

        });

        filemanager.on("click",".action_filedelete",function(){
            var template = Templates["inlineDialogTemplate"];
            var content = "Are you sure you want to delete this file?";
            template = template.replace("{{content}}",content);

            var baseElm = this;
            var config = {
                baseElm : baseElm,
                template: template,
                onOk: function(){
                    FileSystem.deleteFile(currentFile.path,function(){
                        self.refreshCurrentDirectory();
                    });
                    self.restoreInlineDialog(baseElm);
                },
                onCancel: function(){
                    self.restoreInlineDialog(baseElm);
                }
            };
            self.inlineDialog(config);
        });

        filemanager.on("click",".action_fileopen",function(){
            var pathInfo = self.getSelectedPath();
            var path = pathInfo.path;
            var url = Api.getBaseUrl() + "file" + path;
            window.open(url);
        });

        filemanager.on("click",".action_directorycreate",function(){
            var path= self.getCurrentPath();
            var value = "new directory";

            var template = Templates["inlineDialogTemplate"];
            var content = Templates["inputBox"];

            content = content.replace("{{value}}",value);
            template = template.replace("{{content}}",content);

            var baseElm = this;
            var config = {
                baseElm : baseElm,
                template: template,
                type: "directory",
                onOk: function(){
                    var filename = $(".inlineDialog").find(".inputBox").val();
                    if (filename != ""){
                        FileSystem.createDirectory(path + "/" + filename,function(){
                            self.refreshCurrentDirectory();
                        });
                        self.restoreInlineDialog(baseElm);
                    }
                },
                onCancel: function(){
                    self.restoreInlineDialog(baseElm);
                }
            };
            self.inlineDialog(config);

        });

        filemanager.on("click",".action_directorydelete",function(){
            var pathInfo = self.getSelectedPath();
            var path = pathInfo.path;

            var template = Templates["inlineDialogTemplate"];
            var content = "Are you sure you want to delete this directory?";
            template = template.replace("{{content}}",content);

            var baseElm = this;
            var config = {
                baseElm : baseElm,
                template: template,
                onOk: function(){
                    FileSystem.deleteFile(path,function(){
                        self.refreshCurrentDirectory();
                    });
                    self.restoreInlineDialog(baseElm);
                },
                onCancel: function(){
                    self.restoreInlineDialog(baseElm);
                }
            };
            self.inlineDialog(config);
        });

        filemanager.on("click",".action_directoryopen",function(){
            var pathInfo = self.getSelectedPath();
            var name = pathInfo.name;
            // lookup related elm in folder Tree
            var elm = currentDirectoryElm.find(".directory").find(':contains("'+name+'")');
            elm.trigger("click");
        });

        filemanager.on("click",".inlineDialog .button.positive",function(){
            if (currentDialogConfig && currentDialogConfig.onOk) currentDialogConfig.onOk(this);
        });

        filemanager.on("click",".inlineDialog .button.neutral",function(){
            if (currentDialogConfig && currentDialogConfig.onCancel) currentDialogConfig.onCancel(this);
        });
    };

    var hide = function(elm){
        $(elm).addClass("hidden");
    };
    var unHide = function(elm){
        $(elm).removeClass("hidden");
    };
    var toggleHide = function(elm){
        $(elm).toggleClass("hidden");
    };
    var setVisible = function(elm,isVisible){
       if (isVisible){
           unHide(elm);
       }else{
           hide(elm);
       }
    };

    self.listDirectories = function(senderElm,directories){
        var basePath = senderElm.data("directory");

        var container = senderElm.find(".content");
        var label = senderElm.find(".label").first();
        if (!container) container = senderElm;
        container.empty();

        console.error("list directories " + directories);

        if (directories){
            if (directories.length>0) label.addClass("open");
            for (var i = 0, len = directories.length; i<len; i++){
                var item = directories[i];

                var elm = createDiv("directory");

                var label = createDiv("label fa");
                label.innerHTML = item;

                var content = createDiv("content");

                elm.appendChild(label);
                elm.appendChild(content);

                $(elm).data("directory",basePath + item + "/");
                container.append(elm);
            }
        }
    };

    self.listFiles = function(senderElm,directories,files){
        var basePath = senderElm.data("directory");

        var container = $(".filelist");
        container.empty();

        var parent = senderElm.closest(".content").parent();


        if (parent.length>0){
            var elm = createDiv("directoryup");
            var label = createDiv("label");
            label.innerHTML = "...";
            elm.appendChild(label);
            $(elm).data("parent",parent);
            container.append(elm);

        }

        self.deselectFile();

        if (directories){
            for (var i = 0, len = directories.length; i<len; i++){
                var item = directories[i];

                var elm = createDiv("filedirectory");

                var label = createDiv("label fa");
                label.innerHTML = item;

                elm.appendChild(label);

                $(elm).data("path",basePath + item);
                container.append(elm);
            }
        }

        if (files){
            for (var i = 0, len = files.length; i<len; i++){
                var item = files[i];

                var elm = createDiv("file");

                var label = createDiv("label fa");
                label.innerHTML = item;

                elm.appendChild(label);

                $(elm).data("path",basePath + item);
                container.append(elm);
            }
        }
    };

    self.deselectFile = function(){
        var container = navigationDetailElm;
        container.find(".info").empty();
        hide(container.find(".directoryactions"));
        hide(container.find(".fileactions"));
        hide(container.find(".recordactions"));
        var icon = container.find(".icon").get(0);
        icon.className = "icon directoryicon";
        self.resetInlineDialog();
    };


    self.setScope = function(UIScope){
        switch(UIScope){
            case UISCOPE.FILES:
                self.deselectFile();
                unHide(navigationDetailElm.find(".containeractions"));
                break;
            case UISCOPE.PROFILES:
                self.deselectFile();
                hide(navigationDetailElm.find(".containeractions"));
                unHide(navigationDetailElm.find(".profileactions"));
                break;
            case UISCOPE.PROFILEEDITOR:
                self.deselectFile();
                unHide(navigationDetailElm.find(".recordactions"));
                hide($("#commonrecordstate"));
                hide($("#commonpublishdate"));
                hide($("#commonrecordcategory"));
                hide($("#commonrecordtags"));
                break;
        }
    };

    self.showFile = function(senderElm,path,data){
        self.deselectFile();

        currentDirectory = undefined;
        currentFile = data;
        currentFile.path = path;
        currentFile.senderElm = senderElm;

        var container = $(".filedetail");
        var isImage = Image.isImage(path);

        var icon = container.find(".icon").get(0);
        if (isImage){
            icon.className = "icon image";
            icon.style.backgroundImage = "url('" + Image.getThumbUrl(path,200,200) + "')"
        }else{
            icon.className = "icon fileicon"
        }

        var infoContainer = container.find(".info");
        infoContainer.empty();




        if (data){
            var fileInfo = data.file;
            if (!fileInfo) fileInfo = data;
            if (fileInfo.name) {
                var div = createDiv("action_filerename");
                div.innerHTML = fileInfo.name;
                infoContainer.append(div);
            }

            if (isImage){
                if (data.width && data.height){
                    infoContainer.append(data.width + "x" + data.height + " pixels<br>")
                }
            }

            if (fileInfo){
                if (fileInfo.size) infoContainer.append(fileInfo.size + " bytes <br>");
                if (fileInfo.created) infoContainer.append(fileInfo.created + "<br>");
            }

        }

        var fileType = FileSystem.getFileType(path);
        setVisible(".action_edittext",fileType.textEditor);
        setVisible(".action_edithtml",fileType.htmlEditor);

        hide(container.find(".directoryactions"));
        var actionContainer = container.find(".fileactions");
        unHide(actionContainer);

    };

    self.showDirectory = function(senderElm,path,data){
        currentFile = undefined;
        currentDirectory = data;
        currentDirectory.path = path;
        currentDirectory.senderElm = senderElm;

        var container = $(".filedetail");
        var icon = container.find(".icon").get(0);
        icon.className = "icon directoryicon";

        var infoContainer = container.find(".info");
        infoContainer.empty();

        if (data){
            var fileInfo = data;

            if (fileInfo.name) {
                var div = createDiv("action_directoryrename");
                div.innerHTML = fileInfo.name;
                infoContainer.append(div);
            }

            if (fileInfo.created) infoContainer.append(fileInfo.created + "<br>");

        }

        hide(container.find(".fileactions"));
        var actionContainer = container.find(".directoryactions");
        unHide(actionContainer);
    };

    self.refreshCurrentDirectory = function(){
        if (currentDirectoryElm) FileSystem.getDirectory(currentDirectoryElm);
    };

    self.refreshCurrentFileDetail = function(){
        if (currentFile && currentFile.senderElm){
            FileSystem.showFile(currentFile.senderElm);
        }

        if (currentDirectory && currentDirectory.senderElm){
            FileSystem.showDirectory(currentDirectory.senderElm);
        }
    };

    self.inlineDialog = function(config){
        self.resetInlineDialog;
        currentDialogConfig = config;
        $(config.baseElm).hide().after(config.template);
    };

    self.restoreInlineDialog = function(baseElm){
        $(baseElm).show();
        $(".inlineDialog").remove();
    };

    self.resetInlineDialog = function(){
        if (currentDialogConfig && $(".inlineDialog").length > 0){
            self.restoreInlineDialog(currentDialogConfig.baseElm);
        }
    };

    self.getSelectedPath = function(){
        var pathInfo = currentFile;
        console.error("currentDirectory",currentDirectory);

        if (!currentFile){
            if (currentDirectory){
                pathInfo = currentDirectory;
                pathInfo.type = "directory";
            }else{
                return;
            }
        }else{
            if (currentFile.file) pathInfo = currentFile.file;
            pathInfo.path = currentFile.path;
            pathInfo.type = "file";
        }

        return pathInfo;
    };

    self.getCurrentPath = function(){
        var result;
        if (currentDirectoryElm){
            result = currentDirectoryElm.data("directory");
        }
        return result;
    };

    return self;
})();
