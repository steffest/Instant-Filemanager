var DataStore = (function () {

    var self = {};

    var profileListElm;
    var editorContainer;
    var currentProfile;
    var currentProfileId;

    self.addProfile = function(label,profile){
        if (!profileListElm){
            var container = $(UI.getNavigationPane(NAVIGATIONPANE.FOLDERS));
            container.append(Templates["profileListTemplate"]);
            profileListElm = container.find(".profilelist");
        }

        var item = $(createDiv("profile fa"));
        item.data("profile",profile);
        item.html(label);

        profileListElm.append(item);

        UI.initProfileManager();

    };

    self.addSection = function(label,section){
        var container = $(UI.getNavigationPane(NAVIGATIONPANE.FOLDERS));

        var item = $(createDiv("section fa"));
        item.data("section",section);
        item.html(label);

        container.append(item);

    };

    self.initSection = function(sender,section){
        switch(section){
            case "menu":
                var submenu = $(sender).next();
                if (submenu.hasClass("sectionsubmenu")) {
                    submenu.show();
                }else {
                    Api.get("data/menu/?fields=id,name" ,function(data){
                        if (data){
                            submenu = createDiv("sectionsubmenu");

                            for (var i = 0, len = data.length; i<len; i++){
                                var elm = createDiv("menu fa");
                                elm.innerHTML = data[i].name;
                                $(elm).data("id",data[i].id);
                                submenu.appendChild(elm);
                            }

                            $(submenu).insertAfter(sender);
                        }
                    })
                }
                break;
        }
    };

    self.listProfile = function(profile,sender,category){
        var container = UI.getNavigationPane(NAVIGATIONPANE.FILES);
        container.empty();
        UI.setScope(UISCOPE.PROFILES);

        var url = "data/" + profile + "/select/id,name";
        if (category) url = "data/" + profile + "/category/" + category + "?fields=id,name";

        Api.get(url,function(data){
            console.log(data);

            if (data){
                for (var i = 0, len = data.length; i<len; i++){
                    var item = data[i];

                    var elm = createDiv("record");

                    var label = createDiv("label fa");
                    label.innerHTML = item.name;

                    elm.appendChild(label);

                    $(elm).data("profile",profile);
                    $(elm).data("id",item.id);
                    container.append(elm);
                }
            }


            if (sender){
                var submenu = $(sender).next();
                if (submenu.hasClass("profilecategories")) {
                    // categories already loaded
                    submenu.show();
                }else {
                    Api.get("data/" + profile + "/structure" ,function(data){
                        if (data && data!= "generic" && data.categories){
                            var categories = data.categories;
                            submenu = createDiv("profilecategories");

                            for (var i = 0, len = categories.length; i<len; i++){
                                var elm = createDiv("category fa");
                                elm.innerHTML = categories[i];
                                submenu.appendChild(elm);
                            }

                            $(submenu).insertAfter(sender);

                        }
                    })
                }
            }
        })
    };

    self.listProfileCategory = function(profile,category){
        console.log("list profile category ",category);
        self.listProfile(profile,null,category);
    };

    self.editProfile = function(profile,id){
        currentProfile = profile;
        currentProfileId = id;

        var container = UI.getNavigationPane(NAVIGATIONPANE.FILES);
        container.empty();
        UI.setScope(UISCOPE.PROFILEEDITOR);

        container.append(Templates["formEditorTemplate"]);
        editorContainer = container.find("form");

        // get structure of profile
        // TODO: Cache this ?
        Api.get("data/" + profile + "/structure" ,function(data){
            console.log(data);

            if (data && data!= "generic" && data.fields){
                var fields = data.fields;
                renderProfileForm(profile,id,fields,data)

            }else{
                // profile without structure definition
                renderGenericForm(profile,id);
            }
        })
    };

    function renderProfileForm(profile,id,fields,ext){
        Api.get("data/" + profile + "/" + id,function(data){
            if (id==0){
                data={id: 0}
            }
            console.log(data);
            if (data){
                FormBuilder.setContainerElm(editorContainer.find(".formcontent"));
                FormBuilder.setCommonEditors(ext);

                var processedItems = {};

                if (ext.editor){
                    console.log("get editor " + ext.editor);
                    Template.get(ext.editor,function(template){
                        FormBuilder.addEditorFromTemplate(template,data);

                        // execute init function if any
                        var initelm= el("initfunction");
                        if (initelm) window[initelm.value]();
                    });

                }else{
                    for (var i = 0, len = fields.length; i< len; i++){
                        var field  = fields[i];
                        var key = field.name;

                        var editor = FormBuilder.getEditorTypeForField(field);

                        var value = data[key];
                        if (typeof value == "undefined") value = "";


                        FormBuilder.addEditor(editor,key,value,field);
                        processedItems[key] = true;
                    }

                    // add values not present in template if needed
                    console.error(ext.includeAll)
                    if (ext.includeAll){
                        for (var key in data){
                            if (data.hasOwnProperty(key) && !processedItems[key]){
                                FormBuilder.addEditor(FORMEDITOR.TEXT,key,data[key]);
                            }
                        }
                    }
                }

                FormBuilder.wrap();
            }
        })
    }

    function renderGenericForm(profile,id){
        Api.get("data/" + profile + "/" + id,function(data){
            console.log(data);

            if (data){
                FormBuilder.setContainerElm(editorContainer.find(".formcontent"));
                for (var key in data){
                    if (data.hasOwnProperty(key)){
                        FormBuilder.addEditor(FORMEDITOR.TEXT,key,data[key]);
                    }
                }
            }
        })
    }

    self.cancelEditProfile = function(){
        self.listProfile(currentProfile);
    };

    self.updateProfile = function(){

        FormBuilder.prepareSubmit();

        var data = editorContainer.serialize();
        console.log(data);
        Api.post("data/" + currentProfile + "/" + currentProfileId + "/update",data,function(resultdata){
            self.listProfile(currentProfile);
        })

    };

    self.deleteProfile = function(){
        Api.get("data/" + currentProfile + "/" + currentProfileId + "/delete",function(resultdata){
            self.listProfile(currentProfile);
        })

    };

    self.editList = function(id){
        Api.get("data/lists/" + id,function(list){
            var container = UI.getNavigationPane(NAVIGATIONPANE.FILES);
            container.empty();
            UI.setScope(UISCOPE.PROFILES);

            var items = list.items;
            var fields = list.fields;

            var caption = createDiv("caption");
            caption.innerHTML = "menu";

            var sortable = createDiv("sortable");

            for (var i = 0, len = items.length; i<len; i++){
                var item = items[i];

                var elm = createDiv("inlineformrow");

                var input = createInput("inlineinput","","",item.name);

                elm.appendChild(input);

                sortable.appendChild(elm);
            }

            container.append(caption);
            container.append(sortable);

            $(sortable).sortable();


        })
    };

    return self;
})();
