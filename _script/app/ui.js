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

var UI = (function () {

    var self = {};

    var currentDialogConfig;
    var currentFile;
    var currentDirectory;
    var currentDirectoryElm;
    var filemanager;

    var currentProfile;
    var currentProfileElm;

    var currentListViewConfig = {};

    var navigationContainerElm;
    var navigationFolderElm;
    var navigationFilesElm;
    var navigationDetailElm;
    var mainpanelElm;
    var tagListContainer;

    var displayOptions = {
        currentDisplayMode: LISTDISPLAYMODE.LIST,
        showTags: false
    };

    var currentUIScope;

    var initDone = {};

    self.getCurrentProfile = function(){
        return currentProfile;
    };

    self.getCurrentFile = function(){
        return currentFile;
    };

    self.addNavigationPanes = function(parent){
        navigationContainerElm = parent;
        parent.append(Templates["filemanagerTemplate"]);

        navigationFolderElm = navigationContainerElm.find(".foldercontainer");
        navigationFilesElm = navigationContainerElm.find(".filelist");
        navigationDetailElm = navigationContainerElm.find(".filedetail");
        tagListContainer = navigationContainerElm.find(".taglistactions");
        mainpanelElm = navigationContainerElm.find(".mainpanel");

        commonBindings();

        // init datepickers
        var pickerFrom = new Pikaday({
            field: el("commonpublishfrom"),
            format: 'DD/MM/YYYY'
        });
        var pickerTo = new Pikaday({
            field: el("commonpublishto"),
            format: 'DD/MM/YYYY'
        });

        UI_DRAG_DROP.init();
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
           case NAVIGATIONPANE.TAGLIST:
               return tagListContainer;
               break;
           case NAVIGATIONPANE.MAIN:
               return mainpanelElm;
               break;
       }
    };

    self.setNavigationPanesTitle = function(section,title){
        switch (section){
            case "username":
                mainpanelElm.find(".username").html(title);
                break;
        }
    };

    self.initFileManager = function(startElm){
        if (startElm){
            currentDirectoryElm = $(startElm);
            FileSystem.getDirectory(currentDirectoryElm);
        }

        if (initDone["filemanager"]) return;
        fileManagerBindings();
        initDone["filemanager"] = true;

    };


    self.initProfileManager = function(){
        if (initDone["profilemanager"]) return;
        profileManagerBindings();
        initDone["profilemanager"] = true;
    };

    var commonBindings = function(){
        filemanager = $(".filemanager");
        filemanager.on("click",".inlineDialog .button.positive",function(){
            if (currentDialogConfig && currentDialogConfig.onOk) currentDialogConfig.onOk(this);
        });

        filemanager.on("click",".inlineDialog .button.neutral",function(){
            if (currentDialogConfig && currentDialogConfig.onCancel) currentDialogConfig.onCancel(this);
        });

        var filemanagerCaption = filemanager.find(".caption");
        filemanagerCaption.on("click",".button",function(){
            handleCaptionButtonClick(this);
        });

        filemanager.find(".actionbar").on("click",".button",function(){
            handleCaptionButtonClick(this);
        });

        $(".tagsearch").on("keyup search",function(){
            filterTagList(this.value);
        });



    };

    var profileManagerBindings = function(){
        var container = navigationFilesElm;
        filemanager = $(".filemanager");


        navigationFolderElm.on("click",".profile",function(){
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
                dialogType : DIALOGTYPE.WARNING,
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

        listManagerBindings();

    };

    var listManagerBindings = function(){
        // other sections
        navigationFolderElm.on("click",".section",function(){
            var section = $(this).data("section");
            self.initSection(this,section);
        });

        navigationFolderElm.on("click",".menu",function(){
            var id = $(this).data("id");
            DataStore.editList(id);
        });

        navigationFolderElm.on("click",".form",function(){
            var id = $(this).data("id");
            DataStore.editList(id);
        });

        navigationDetailElm.on("click",".action_closelist",function(){
            self.refreshSection();
        });

        navigationDetailElm.on("click",".action_updatelist",function(){
            var button = $(this).find("i");
            button.addClass("fa-spin");
            DataStore.updateList(function(){
                button.removeClass("fa-spin");
                self.refreshSection();
            });
        });

        navigationDetailElm.on("click",".action_deletelist",function(){
            var template = Templates["inlineDialogTemplate"];
            var content = "Are you sure you want to delete this list?";
            template = template.replace("{{content}}",content);

            var baseElm = this;
            var config = {
                baseElm : baseElm,
                template: template,
                dialogType : DIALOGTYPE.WARNING,
                onOk: function(){
                    DataStore.deleteList();
                    UI.restoreInlineDialog(baseElm);
                },
                onCancel: function(){
                    UI.restoreInlineDialog(baseElm);
                }
            };
            UI.inlineDialog(config);
        });

        navigationDetailElm.on("click",".action_addlistitem",function(){
            DataStore.addListItem();
        });

        navigationFilesElm.on("click",".indentright",function(){
            var listitem = $(this).closest(".inlineformrow");
            changeIndent(listitem,1);
        });

        navigationFilesElm.on("click",".indentleft",function(){
            var listitem = $(this).closest(".inlineformrow");
            changeIndent(listitem,-1);
        });

        navigationFilesElm.on("click",".action_removelistitem",function(){
            var listitem = $(this).closest(".inlineformrow");
            listitem.slideUp("fast",function(){
                listitem.remove();
            })
        });
    };

    var fileManagerBindings = function(){
        filemanager = $(".filemanager");

        navigationFolderElm.on("click",".directory .label",function(){
            var elm = $(this).closest(".directory");
            currentDirectoryElm = elm;
            console.log("click directory",elm);
            FileSystem.getDirectory(elm);
        });

        filemanager.on("click",".file",function(e){
            var elm = this;
            var addToSelection = (e.shiftKey || e.metaKey || e.ctrlKey);
            UI.selectFile(elm,addToSelection,e.shiftKey);
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
            }else if (fileType == FILETYPE.IMAGE) {
                Media.previewImage(this);
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

        filemanager.on("click",".exif",function(){
            var exif = $(this).data("exif");
            console.error(exif);
            var config = {
                title: "Exif",
                data: exif
            };
            self.popupDialog(config);

        });

        filemanager.on("click",".location",function(){
            var location = $(this).data("location");
            if (location.GPSLatitude && location.GPSLongitude ){
                var c = location.GPSLatitude;
                c.push(location.GPSLatitudeRef);
                var lat = convertDMSToDD(c[0],c[1],c[2],c[3]);
                c = location.GPSLongitude;
                c.push(location.GPSLongitudeRef);
                var long = convertDMSToDD(c[0],c[1],c[2],c[3]);
                var url = "http://www.google.com/maps/place/" + lat + "," + long;
                window.open(url);
            }else{
                alert("invalid GPS location");
                console.error(location);
            }



        });

        filemanager.on("click",".action_rotateleft",function(){
            var pathInfo = self.getSelectedPath();
            FileSystem.rotateImage(pathInfo.path,-90,function(){
                self.refreshCurrentDirectory();
                self.refreshCurrentFileDetail(true);
            });
        });

        filemanager.on("click",".action_converttomp4",function(){
            var pathInfo = self.getSelectedPath();
            $(this).html("queued").removeClass("action_converttomp4");
            FileSystem.convert(pathInfo.path,"mp4",function(data){
                console.error(data);
            });
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
            console.error(path);
            Upload.init(undefined,path,function(){
                $(".uploadbar").hide();
                self.refreshCurrentDirectory();
            });
        });

        filemanager.on("click",".action_filecreate",function(){
            var path= self.getCurrentPath();
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
            var ismulti = false;

            if (currentListViewConfig.selection && currentListViewConfig.selection.length>1){
                ismulti = true;
                content = "Are you sure you want to delete " + currentListViewConfig.selection.length + " files?";
            }
            template = template.replace("{{content}}",content);

            var baseElm = this;
            var config = {
                baseElm : baseElm,
                template: template,
                dialogType : DIALOGTYPE.WARNING,
                onOk: function(){
                    if (ismulti){
                        FileSystem.deleteFiles(currentListViewConfig.selection,function(){
                            self.refreshCurrentDirectory();
                        });
                    }else{
                        FileSystem.deleteFile(currentFile.path,function(){
                            self.refreshCurrentDirectory();
                        });
                    }
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
    };

    var changeIndent = function(elm,amount){
        var indent = elm.data("indent") || 0;
        indent = indent + amount;
        indent = Math.min(Math.max(0,indent),3);
        elm.data("indent",indent)
            .removeClass("indent1 indent2 indent3")
            .addClass("indent" + indent);
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

    self.addSection = function(label,section){
        var container = $(navigationFolderElm);

        var parent = $(createDiv("sectionlist"));

        var item = $(createDiv("section fa section" + section));
        item.data("section",section);
        item.html(label);

        parent.append(item);

        container.append(parent);

    };


    self.refreshSection = function(){
        self.initSection(currentProfileElm,currentProfile);
    };

    self.initSection = function(sender,section){
        console.log("init section " + section,sender);
        var submenu = $(sender).next();

        currentProfile = section;
        currentProfileElm = sender;

        switch(section){
            case "menu":
                if (submenu.hasClass("sectionsubmenu")) {
                    submenu.empty();
                }else {
                    submenu = $(createDiv("sectionsubmenu"));
                    submenu.insertAfter(sender);
                }
                var url = "data/menu/?fields=id,name";
                self.listSectionContent(url,"menu",submenu);
                break;
                break;
            case "form":
                if (submenu.hasClass("sectionsubmenu")) {
                    submenu.empty();
                }else {
                    submenu = $(createDiv("sectionsubmenu"));
                    submenu.insertAfter(sender);
                }
                var url = "data/form/?fields=id,name";
                self.listSectionContent(url,"form",submenu);
                break;
            case "filemanager":
                if (submenu.hasClass("sectionsubmenu")) {
                    submenu.show();
                }else {
                    submenu = createDiv("sectionsubmenu");
                    $(submenu).insertAfter(sender);
                    FileSystem.addFileManager("/_img/","Pictures",submenu,true);
                    FileSystem.addFileManager("/documents/","Documents",submenu);
                    if (App.isAdmin()){

                    }

                    if (App.isSystemAdmin()){
                        FileSystem.addFileManager("/_script/","Script",submenu);
                        FileSystem.addFileManager("/_style/","Style",submenu);
                        FileSystem.addFileManager("/","ROOT",submenu);
                    }
                    //FileSystem.addFileManager("/box/","Camera",submenu);
                    //FileSystem.addFileManager("/foto/","Foto Library",submenu);
                    //FileSystem.addFileManager("/drop/","DropBox",submenu);
                }
                break;
        }
    };

    self.listSectionContent = function(url,profile,container){
        Api.get(url ,function(data,result){
            if (data && result=="ok"){
                var listContainer = navigationFilesElm;
                listContainer.empty();
                UI.setScope(UISCOPE.PROFILES);

                for (var i = 0, len = data.length; i<len; i++){
                    var item = data[i];

                    var elm = createDiv(profile + " fa");
                    elm.innerHTML = item.name;
                    $(elm).data("id",item.id);
                    container.append(elm);


                    var listElm = createDiv("record listitem accepttag");
                    var label = createDiv("label fa");
                    label.innerHTML = item.name;

                    listElm.appendChild(label);

                    $(listElm).data("profile",profile);
                    $(listElm).data("id",item.id);
                    listContainer.append(listElm);

                }
            }
        })
    };

    self.listDirectories = function(senderElm,directories){
        var basePath = senderElm.data("directory");

        var container = senderElm.find(".content");
        var label = senderElm.find(".label").first();
        if (!container) container = senderElm;
        container.empty();

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

                var elm = createDiv("filedirectory listitem");

                var label = createDiv("label");
                label.innerHTML = item;

                if (displayOptions.currentDisplayMode != LISTDISPLAYMODE.LIST){
                    var icon = createDiv("fileicon");
                    var iconContent = Media.getFolderIcon(item.path,displayOptions.currentDisplayMode.iconSize);
                    icon.appendChild(iconContent);
                    elm.appendChild(icon);
                }else{
                    label.classList.add("fa");
                }

                elm.appendChild(label);

                $(elm).data("path",basePath + item);
                container.append(elm);
            }
        }

        if (files){
            for (var i = 0, len = files.length; i<len; i++){
                container.append(createFileItem(basePath,files[i]));
            }
        }

        if (displayOptions.showTags){
            self.refreshFileTags();
        }
    };

    self.listObjects = function(data,filterData){
        var container = $(".filelist");
        container.empty();

        if (currentUIScope == UISCOPE.TAGS){
            currentListViewConfig.tag = filterData;
        }

        if (data.files){
            for (var i = 0, len=data.files.length; i<len; i++){
                var path = data.files[i];
                var filename = FileSystem.getFileName(path);
                var filePath = FileSystem.getFilePath(path);
                if (filePath.substr(0,1) != "/") filePath = "/" + filePath;
                container.append(createFileItem(filePath,filename));
            }
        }
    };

    function createFileItem(basePath,item){
        var fileType = FileSystem.getFileType(item);
        var path = basePath + item;

        var classNames = "file listitem accepttag";
        if (fileType.iconClass) classNames+= " " + fileType.iconClass;

        var elm = createDiv(classNames);

        var label = createDiv("label");
        label.innerHTML = item;

        if (displayOptions.currentDisplayMode != LISTDISPLAYMODE.LIST){
            var icon = createDiv("fileicon");
            var iconContent = Media.getFileIcon(path,displayOptions.currentDisplayMode.iconSize);
            icon.appendChild(iconContent);
            elm.appendChild(icon);
        }else{
            label.classList.add("fa");
        }

        elm.appendChild(label);

        if (displayOptions.showTags){
            var tags = createDiv("tags");
            elm.appendChild(tags);
        }

        $(elm).data("path",path);

        return elm;
    }

    self.deselectFile = function(){
        currentFile = undefined;
        var container = navigationDetailElm;
        container.find(".info").empty();
        hide(container.find(".directoryactions"));
        hide(container.find(".fileactions"));
        hide(container.find(".recordactions"));
        var preview = container.find(".preview").empty().get(0);
        preview.className = "preview directoryicon";
        self.resetInlineDialog();
        FormBuilder.clearTagEditor();
        navigationFilesElm.find(".selected").removeClass("selected");
        currentListViewConfig.selection = [];
    };


    self.setScope = function(UIScope){

        // clear UI;
        self.deselectFile();
        hide(navigationDetailElm.find(".containeractions"));
        hide(navigationDetailElm.find(".profileactions"));
        hide(navigationDetailElm.find(".listactions"));
        hide($("#commontagsinput"));
        hide(tagListContainer);
        tagListContainer.removeClass("editor");
        currentListViewConfig = {};

        switch(UIScope){
            case UISCOPE.FILES:
                unHide(navigationDetailElm.find(".containeractions"));
                unHide(tagListContainer);
                break;
            case UISCOPE.PROFILES:
                unHide(navigationDetailElm.find(".profileactions"));
                unHide(tagListContainer);
                break;
            case UISCOPE.PROFILEEDITOR:
                unHide(navigationDetailElm.find(".recordactions"));
                hide($("#commonrecordstate"));
                hide($("#commonpublishdate"));
                hide($("#commonrecordcategory"));
                hide($("#commonrecordaccess"));
                hide($("#commonrecordtags"));
                break;
            case UISCOPE.LISTEDITOR:
                unHide(navigationDetailElm.find(".listactions"));
                break;
            case UISCOPE.TAGS:
                unHide(tagListContainer);
                break;
        }

        currentUIScope = UIScope;
    };

    self.showFile = function(senderElm,path,data,forceRefresh){
        unHide(".action_fileopen");
        unHide(".action_filerename");

        currentListViewConfig.selection = [path];

        console.error(senderElm,path,data,forceRefresh);

        currentDirectory = undefined;
        currentFile = data;
        currentFile.path = path;
        currentFile.senderElm = senderElm;
        senderElm.classList.add("selected");


        var container = $(".filedetail");
        var hasPreview = false;
        var isImage = Media.isImage(path);
        var fileType = FileSystem.getFileType(path);

        var preview = container.find(".preview").empty().get(0);

        if (isImage){
            hasPreview = true;
            preview.className = "preview image";
            preview.style.backgroundImage = "url('" + Media.getThumbUrl(path,200,200,forceRefresh) + "')"
        }
        if (fileType == FILETYPE.VIDEO){
            hasPreview = true;
            preview.className = "preview video";
            preview.style.backgroundImage = "none";
            var url = Api.getBaseUrl() + "file" + path;
            preview.appendChild(Media.getVideoPlayer(url))
        }
        if (fileType == FILETYPE.AUDIO){
            hasPreview = true;
            preview.className = "preview audio";
            preview.style.backgroundImage = "none";
            var url = Api.getBaseUrl() + "file" + path;
            preview.appendChild(Media.getAudioPlayer(url))
        }

        if (!hasPreview){
            preview.className = "preview fileicon"
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
                if (data.exif){
                    var isempty = true;
                    var hasLocation = false;
                    var locationData = {};
                    for (var item in data.exif){
                        if (data.exif.hasOwnProperty(item)){
                            isempty = false;
                            if (item.indexOf("GPS")>=0){
                                locationData[item] = data.exif[item];
                                hasLocation = true;
                            }
                        }
                    }
                    if (!isempty){
                        var exif = createDiv("exif action");
                        $(exif).data("exif",data.exif);
                        exif.innerHTML = "Exif";
                        infoContainer.append(exif);

                        if (hasLocation){
                            var location = createDiv("location action");
                            $(location).data("location",locationData);
                            location.innerHTML = "Show on map";
                            infoContainer.append(location);
                        }
                    }
                }

                var rotateleft = createDiv("action action_rotateleft");
                rotateleft.innerHTML = "Rotate left";
                infoContainer.append(rotateleft);

                var rotateright = createDiv("action action_rotateright");
                rotateright.innerHTML = "Rotate right";
                infoContainer.append(rotateright);
            }

            if (fileType == FILETYPE.VIDEO){
                var convert = createDiv("action action_converttomp4");
                convert.innerHTML = "Convert to MP4";
                infoContainer.append(convert);
            }

            if (fileInfo){
                if (fileInfo.size) infoContainer.append(formatSize(fileInfo.size) + " <br>");
                if (fileInfo.created) infoContainer.append(formatDate(fileInfo.created) + "<br>");
            }

            // tageditor
            data.annotations = data.annotations || {};
            data.annotations.tags = data.annotations.tags || [];
            FormBuilder.initTagEditor(data.annotations.tags,
                function(me){
                    if (currentFile){
                        var tag = me.innerHTML;
                        var path = $(currentFile.senderElm).data("path");
                        FileSystem.addTag(tag,path,function(){
                            // TODO: only update this single file ?
                            UI.refreshFileTags();
                        });
                    }
                },
                function(me){
                    if (currentFile){
                        var tag = me.innerHTML;
                        var path = $(currentFile.senderElm).data("path");
                        FileSystem.removeTag(tag,path,function(){
                            // TODO: only update this single file ?
                            UI.refreshFileTags();
                        });
                    }
                })
        }

        setVisible(".action_edittext",fileType.textEditor);
        setVisible(".action_edithtml",fileType.htmlEditor);

        hide(container.find(".directoryactions"));
        var actionContainer = container.find(".fileactions");
        unHide(actionContainer);

    };

    self.showSelection = function(){

        var container = $(".filedetail");

        hide(navigationDetailElm.find(".containeractions"));
        hide(".action_edittext");
        hide(".action_edithtml");
        hide(".action_fileopen");
        hide(".action_filerename");
        hide(".preview");

        var infoContainer = container.find(".info");
        infoContainer.empty();

        infoContainer.html(currentListViewConfig.selection.length + " files selected");
    };

    self.selectFile = function(elm,addToSelection,allBetween){

        if (!addToSelection){
            self.deselectFile();
            currentListViewConfig.selection = [];
        }

        if (allBetween && currentListViewConfig.selection.length>0){
            var first = navigationFilesElm.find(".selected").first();
            var last = $(elm);
            if (first.index() > last.index()){
                last = first;
                first = $(elm);
            }

            currentListViewConfig.selection = [];
            first.nextUntil(last).add(first).add(last).each(function(){
                $(this).addClass("selected");
                currentListViewConfig.selection.push($(this).data("path"));
            });
        }else{
            var path = $(elm).data("path");



            if (elm.classList.contains("selected")){
                elm.classList.remove("selected");
                var index = currentListViewConfig.selection.indexOf(path);
                if (index > -1) {
                    currentListViewConfig.selection.splice(index, 1);
                }
                if (currentListViewConfig.selection.length == 1){
                    elm = navigationFilesElm.find(".selected").get(0);
                }
            }else{
                currentListViewConfig.selection.push(path);
                elm.classList.add("selected");
            }
        }

        var fileCount = currentListViewConfig.selection.length;
        if (fileCount == 0){
            self.deselectFile();
        }else if (fileCount == 1){
            FileSystem.showFile(elm);
        }else if (fileCount > 1){
            self.showSelection();
        }
    };

    self.showDirectory = function(senderElm,path,data){
        self.deselectFile();
        currentDirectory = data;
        currentDirectory.path = path;
        currentDirectory.senderElm = senderElm;

        var container = $(".filedetail");
        var preview = container.find(".preview").empty().get(0);
        preview.innerHTML = "";
        preview.className = "preview directoryicon";

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

    self.refreshListView = function(){
        if (currentUIScope == UISCOPE.FILES){
            self.refreshCurrentDirectory();
        }
        if (currentUIScope == UISCOPE.TAGS && currentListViewConfig.tag){
            DataStore.listTag(currentListViewConfig.tag);
        }
    };

    self.refreshCurrentDirectory = function(){
        if (currentDirectoryElm) FileSystem.getDirectory(currentDirectoryElm);
    };

    self.refreshFileTags = function(){
        var basePath = currentDirectoryElm.data("directory");
        var url = "annotation/tags/path" + basePath;
        Api.get(url,function(data){
            if (data.files){

                navigationFilesElm.find(".file").each(function() {
                    var file = $(this);
                    var fileName = file.find(".label").html().toLowerCase();
                    var tags = file.find(".tags");

                    for (var i = 0, len = data.files.length; i<len;i++){
                        var thisfile = data.files[i];
                        var thisfileName = thisfile.filename.toLowerCase();

                        if (thisfileName == fileName){
                            tags.html(thisfile.tags.join(", "));
                        }
                    }
                });
            }
        });
    };

    self.refreshCurrentFileDetail = function(){
        if (currentFile && currentFile.senderElm){
            FileSystem.showFile(currentFile.senderElm,true);
        }

        if (currentDirectory && currentDirectory.senderElm){
            FileSystem.showDirectory(currentDirectory.senderElm);
        }
    };

    self.inlineDialog = function(config){
        self.resetInlineDialog();
        currentDialogConfig = config;
        $(config.baseElm).hide().after(config.template);
        if (config.dialogType){
            $(".inlineDialog").addClass(config.dialogType.className)
        }
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

    self.popupDialog = function(config){
        var blanket = createDiv("blanket");
        var container = createDiv("popup");
        var table = document.createElement("table");
        for (var item in config.data){
            if (config.data.hasOwnProperty(item)){
                var row = document.createElement("tr");
                var cel1 = document.createElement("th");
                var cel2 = document.createElement("td");
                cel1.innerHTML = item;
                cel2.innerHTML = config.data[item];
                row.appendChild(cel1);
                row.appendChild(cel2);
                table.appendChild(row);
            }
        }
        container.appendChild(table);

        blanket.onclick = function(){
            self.closePopup();
        };

        document.body.appendChild(blanket);
        document.body.appendChild(container);
    };

    self.closePopup = function(config){
        $(".popup").remove();
        $(".blanket").remove();
    };

    self.getSelectedPath = function(){
        var pathInfo = currentFile;
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

    self.getCurrentListViewConfig = function(){
        return currentListViewConfig;
    };

    function handleCaptionButtonClick(button){
        if (button.classList.contains("toggle")){
            button.classList.toggle("selected");
        }

        if (button.classList.contains("display")){
            $(button).siblings(".button").removeClass("selected");
            $(button).addClass("selected");

            var displayMode = LISTDISPLAYMODE.LIST;
            if (button.classList.contains("display_grid")) displayMode = LISTDISPLAYMODE.ICONS;
            if (button.classList.contains("display_gridlarge")) displayMode = LISTDISPLAYMODE.THUMBS;

            self.setDisplayOptions(displayMode);
        }

        if (button.classList.contains("display_tags")){
            self.setDisplayOptions(undefined,button.classList.contains("selected"));
        }

        if (button.classList.contains("tags_toggle")){
            var searchbox = tagListContainer.find(".tagsearch");
            if (searchbox.val() != ""){
                searchbox.val("");
                filterTagList("");
            }
            if (button.classList.contains("down")){
                tagListContainer.find(".tagtree").show();
                tagListContainer.find(".handle").addClass("open");
            }else{
                tagListContainer.find(".tagtree").hide();
                tagListContainer.find(".handle").removeClass("open");
            }
            button.classList.toggle("down");
        }

        if (button.classList.contains("settings")){
            $(button).closest(".caption").find(".settingsmenu").toggle();
        }

        if (button.classList.contains("action_logout")){
            App.logout();
        }


    }

    self.setDisplayOptions = function(displayMode,showTags){
        if (isDefined(displayMode)) displayOptions.currentDisplayMode = displayMode;
        if (isDefined(showTags)) displayOptions.showTags = showTags;

        var container = $(".filelist");
        container.removeClass("displaylist displayicons displaythumbs displaytags")
            .addClass(displayOptions.currentDisplayMode.className)
            .addClass(displayOptions.showTags ?  "displaytags" : "");

        self.refreshListView();
    };

    self.getDisplayOptions = function(){
        return displayOptions;
    };


    self.toggleExpandMainPanel = function(){
        var panes = navigationContainerElm.find(".panes");
        panes.toggleClass("mainpanelfocus");
    };

    self.restoreMainPanel = function(){
        var panes = navigationContainerElm.find(".panes");
        if (panes.hasClass("mainpanelfocus")){
            self.toggleExpandMainPanel();
        }
    };

    self.showHidePanelByValue = function(source,target,value){
        if (source && $(source).val() == value){
            $(target).show();
        }else{
            $(target).hide();
        }
    };

    function filterTagList(s){
        tagListContainer.find(".tagtree").show();
        tagListContainer.find(".handle").addClass("open").hide();

        if (s == ""){
            tagListContainer.find(".tag").show();
            tagListContainer.find(".handle").show();
        }else{
            s = s.toLowerCase();
            tagListContainer.find(".tag").each(function(){
                $(this).toggle(this.innerHTML.toLowerCase().indexOf(s)>=0);
            });
        }

    };

    return self;
})();
