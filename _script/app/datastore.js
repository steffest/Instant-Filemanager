var DataStore = (function () {

    var self = {};

    var profileListElm;
    var editorContainer;
    var currentProfile;
    var currentProfileData;
    var currentProfileId;
    var currentSectionItemId;
    var currentSectionCategory;


    self.addTags = function(){
        var container = UI.getNavigationPane(NAVIGATIONPANE.DETAIL).find(".taglist").get(0);

        /*
        var url = Api.getBaseUrl() + "annotation/tags";
        $.get(url,function(data){
            if (data && data.result){
                var tags = data.result.split("\n");
                for (var i = 0, len = tags.length; i< len; i++){
                    var tag = tags[i];
                    var className = "";
                    if (tag.substr(0,1) == " ") className = "indent1";
                    if (tag.substr(0,2) == "  ") className = "indent2";
                    var item = createDiv("preventDefault draggable tag " + className);
                    item.innerHTML = tag;
                    //item.draggable = true;
                    container.append(item);
                }
            }
        });
        */

        var url = Api.getBaseUrl() + "annotation/tags.json";
        // note: make sure the list is sorted on parentId

        $.get(url,function(data){
            if (data && data.result){
                var tags = data.result;
                var parentContainers = {};
                var parentHandles = {};

                parentContainers["0"] = container;
                parentHandles["0"] = container;

                for (var i = 0, len = tags.length; i< len; i++){
                    var tag = tags[i];

                    if (tag.parent == null) tag.parent = "0";
                    var parentContainer = parentContainers["" + tag.parent];
                    var parentHandle = parentHandles["" + tag.parent];

                    var tagItem = createDiv("tagitem");

                    var label = createDiv("draggable tag");
                    label.innerHTML = tag.name;
                    var handle = createDiv("handle fa");
                    var subitem = createDiv("tagtree");

                    handle.onclick = function(){
                        $(this).toggleClass("open").siblings(".tagtree").slideToggle("fast");
                    };

                    tagItem.appendChild(handle);
                    tagItem.appendChild(label);
                    tagItem.appendChild(subitem);
					if (!parentContainer){
					console.error("parentContainer not found for " + tag.name + ": " + tag.parent); 
					}
                    parentContainer.appendChild(tagItem);

                    parentHandle.classList.add('haschildren');

                    parentContainers["" + tag.id] = subitem;
                    parentHandles["" + tag.id] = handle;
                }
            }
        });

    };

    self.addProfiles = function(profiles,parent){
       if (profiles){
           profiles.forEach(function(profile){
               self.addProfile(profile.title,profile.profile,parent);
           });
       }
    };

    self.addProfile = function(label,profile,parent){

        if (!profileListElm){
            var container = $(UI.getNavigationPane(NAVIGATIONPANE.FOLDERS));
            container.append(Templates["profileListTemplate"]);
            profileListElm = container.find(".profilelist");
        }

        var thisParent = profileListElm;
        if (parent) thisParent = $(parent);

        var item = $(createDiv("profile faw profile"+profile));
        item.data("profile",profile);
        item.html(label);

        thisParent.append(item);

        UI.initProfileManager();

    };

    self.refreshListProfile = function(){
        self.listProfile(currentProfile);
    };

    self.listProfile = function(profile,sender,category){
        var container = UI.getNavigationPane(NAVIGATIONPANE.FILES);
        container.empty();
        Media.clearImageQueue();
        UI.setScope(UISCOPE.PROFILES);
        currentProfile = profile;

        var searchBox = createSearchBox("listitemsearch",null,function(){
            var value = this.value.toLowerCase();
            UI.filterListItems(container,value);
        });
        container.append(searchBox);

        var fields="id,name,state,tags,category,starred";
        var orderBy = "orderby=name";

        var getIcon = function(item){
            var icon = createDiv("fileicon");
            var div = createDiv("fa fa-file");
            icon.appendChild(div);
            return icon;
        };

        var getTitle=function(item){
          return item.name;
        };

        if (profile == "elpees" || profile == "singles" || profile == "pockets"){
            // TODO: FIXME!!
            fields="id,title as name,author,cover";
            orderBy = "orderby=author,name";

            getTitle=function(item){
                return item.author + ": " + item.name;
            };

            getIcon = function(item){
                var icon = createDiv("fileicon");
                var div = createDiv("fileiconimg");
                if (item.cover){
                    //div.innerHTML = '<img src="/laozi/image/200x200/'+profile+'/'+ item.cover + '">';
                    Media.AddImageQueue("/laozi/image/200x200/"+profile+"/"+item.cover,div);
                }else{
                    div.className = "fa file";
                }
                icon.appendChild(div);
                return icon;
            };
        }

        if (profile == "db_redirect"){
            console.log("list redirects");
            fields="id,old as name,new,language";
        }

        var url = "data/" + profile;
        if (Config.displayLanguage) url += "/" + Config.displayLanguage;

        if (category) {
            url += "/category/" + category + "?fields=" + fields;
        }else{
            url += "/select/" + fields;
        }

        var suffix = url.indexOf("?")>0 ? "&" : "?";
        url += suffix + orderBy;

        Api.get(url,function(data,status){
            if (data && status=="ok"){
                for (var i = 0, len = data.length; i<len; i++){
                    var item = data[i];

                    var elm = createDiv("record accepttag listitem");
                    var label = createDiv("label");
                    var state = undefined;
                    var tags= undefined;
                    var category = undefined;

                    if (UI.getDisplayOptions().currentDisplayMode != LISTDISPLAYMODE.LIST){
                        elm.appendChild(getIcon(item));
                    }else{
                        label.classList.add("faw");
                        if (item.starred && item.starred != "0"){
                            label.classList.add("starred");
                        }
                        if (item.state){
                            container.addClass("hascolumns");
                            state = createDiv("labelstate");
                            state.innerHTML = item.state;
                        }
                        if (UI.getDisplayOptions().showTags){
                            if (item.tags){
                                tags = createDiv("labeltags");
                                tags.innerHTML = item.tags;
                            }
                        }else{
                            if (item.category){
                                category = createDiv("labelcategory");
                                category.innerHTML = item.category;
                            }
                        }

                    }

                    label.innerHTML = getTitle(item);

                    elm.appendChild(label);

                    if (state) elm.appendChild(state);
                    if (tags) elm.appendChild(tags);
                    if (category) elm.appendChild(category);



                    $(elm).data("profile",profile);
                    $(elm).data("id",item.id);
                    container.append(elm);
                }
            }


            if (sender){
                var submenu = $(sender).next();
                if (submenu.hasClass("profilecategories")) {
                    // categories already loaded
                    submenu.toggle();
                }else {
                    Api.get("data/" + profile + "/structure" ,function(data){
                        if (data && data!= "generic" && data.categories){
                            var categories = data.categories;
                            submenu = createDiv("profilecategories");

                            for (var i = 0, len = categories.length; i<len; i++){
                                var elm = createDiv("category faw");
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

        console.log("editprofile " + profile,id);

        currentProfile = profile;
        currentProfileId = id;

        // pre handle special profiles
        if (profile == "menu" || profile == "form" || profile == "lists"){
            self.editList(id,profile);
            return;
        }

        var container = UI.getNavigationPane(NAVIGATIONPANE.FILES) || $("#cms_editor");
        container.empty();
        UI.setScope(UISCOPE.PROFILEEDITOR);

        container.append(Templates["formEditorTemplate"]);
        editorContainer = container.find("form");

        // get structure of profile
        // TODO: Cache this ?
        Api.get("data/" + profile + "/structure" ,function(data){

            if (data && data!= "generic" && data.fields){
                var fields = data.fields;

                renderProfileForm(profile,id,fields,data)

            }else{
                // profile without structure definition
                renderGenericForm(profile,id);
            }
        })
    };

    function renderProfileForm(profile,id,fields,profileStructure){
        Api.get("data/" + profile + "/" + id,function(data){
            renderProfileFormData(profile,id,fields,profileStructure,data)
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

    function renderProfileFormData(profile,id,fields,profileStructure,data){

        console.log("rendering ProfileFormData " + profile + " " + id);

        currentProfileData={
            profile: profile,
            id: id,
            fields: fields,
            profileStructure: profileStructure,
            data: data
        };



        if (id==0){
            if (data && data.multiLanguage){
                // add Empty Default Language
                // TODO: active language should be added
                data[Config.defaultLanguage] = {id: 0};
            }else{
                data={id: 0}
            }
        }



        if (data){
            var formContainer = editorContainer.find(".formcontent");
            console.log("setContainerElm");
            window.formContainer = formContainer;
            console.log(formContainer);
            FormBuilder.setContainerElm(formContainer);
            console.log("setContainerElm");
            FormBuilder.setCommonEditors(profileStructure);

            console.log("CommonEditors set");

            var processedItems = {};

            if (profileStructure.editor){
                console.log("get editor " + profileStructure.editor);
                Template.get(profileStructure.editor,function(template){
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

                    FormBuilder.addEditor(editor,key,data,field,data.multiLanguage);

                    processedItems[key] = true;
                }

                var category = self.getProfileValue(data,"category");
                if (category && profileStructure.categoryFields && profileStructure.categoryFields[category]){
                    self.renderProfileFormCategoryFields(category);
                }

                if (data.multiLanguage){
                    var activeLanguages = [];



                    Config.languages.forEach(function(lan){
                        if (data[lan]) activeLanguages.push(lan);
                    });

                    FormBuilder.setLanguageList(activeLanguages);
                    FormBuilder.addEditorElement(formContainer[0],FORMEDITOR.HIDDEN,"activelanguages",activeLanguages.join((",")));
                }

                // add values not present in template if needed
                if (profileStructure.includeAll){
                    for (var key in data){
                        if (data.hasOwnProperty(key) && !processedItems[key]){
                            FormBuilder.addEditor(FORMEDITOR.TEXT,key,data[key]);
                        }
                    }
                }
            }




            FormBuilder.wrap();
        }
    }

    self.renderProfileFormCategoryFields = function(category){

        if (!currentProfileData) return;
        var profileStructure = currentProfileData.profileStructure;
        var data = currentProfileData.data;
        FormBuilder.removeExtendedEditors();

        if (category && profileStructure.categoryFields && profileStructure.categoryFields[category]){
            var fields = profileStructure.categoryFields[category];

            for (var i = 0, len = fields.length; i< len; i++){
                var field  = fields[i];
                var key = field.name;

                var editor = FormBuilder.getEditorTypeForField(field);

                if (data.multiLanguage){
                    FormBuilder.addEditor(editor,key,data,field,true);
                }else{
                    var value = data[key];
                    if (typeof value == "undefined") value = "";
                    FormBuilder.addEditor(editor,key,value,field);
                }

            }

        }

    };

    self.cancelEditProfile = function(){
        if (typeof CMS != "undefined" && CMS.isFrontend){
            CMS.closeEditor();
        }else{
            self.listProfile(currentProfile);
        }

    };

    self.updateProfile = function(){

        var postActions = FormBuilder.prepareSubmit();

        var data = editorContainer.serialize();

        // set all unckecked checkboxes to empty, otherwise their saved value will not be overwritten.
        editorContainer.find("input.checkbox:not(:checked)").each(function(){
            if (this.name) data += "&" + this.name + "=";
        });

        //console.log(data);
        Api.post("data/" + currentProfile + "/" + currentProfileId + "/update",data,function(resultdata){

            var done = true;

            var onDone = function(){
                if (typeof CMS != "undefined" && CMS.isFrontend){
                    CMS.closeEditor();
                    window.location.reload(true);
                }else{
                    self.listProfile(currentProfile);
                }
            };

            if (postActions && postActions.length){
                var todoCount =  postActions.length;
                var doneCount = 0;
                postActions.forEach(function(postAction){
                   if (postAction.action == "slugChange"){
                       done = false;
                       var slugData = {
                           language: postAction.language,
                           old: postAction.old,
                           "new": postAction.new
                       };
                       Api.post("data/db_redirect/0/update",slugData,function(){
                           doneCount++;
                           if (doneCount == todoCount) onDone();
                       });
                   }
                });
            }

            if (done){
                onDone();
            }


        })

    };

    self.deleteProfile = function(){
        if (App.isAdmin()){
            Api.get("data/" + currentProfile + "/" + currentProfileId + "/delete",function(resultdata){
                if (typeof CMS != "undefined" && CMS.isFrontend){
                    CMS.closeEditor();
                    window.location.reload(true);
                }else{
                    self.listProfile(currentProfile);
                }
            })
        }
    };

    self.duplicateProfile = function(){
        currentProfileId = 0;
        if (currentProfileData) currentProfileData.id = 0;
        var copyOfName = function(index,value){
            return "Copy of " + value;
        };

        Config.languages.forEach(function(lan){
            editorContainer.find("input[name='"+lan+":name']").val(copyOfName);
        });
        editorContainer.find("input[name='name']").val(copyOfName);

    };

    self.deleteProfileLanguage = function(lan){
        Api.get("data/" + currentProfile + "/" + lan + "/" +  currentProfileId  + "/delete",function(resultData){
            console.log("result delete",resultData);
            $(".language_" + lan).hide();
            $("#languageselect_" + lan).hide();
        });

    };

    self.getProfileValue = function(profileData,key,language){
        if (profileData.multiLanguage){
            var lan = language || Config.defaultLanguage;
            var lanData =  profileData[lan];
            if (lanData){
                return lanData[key];
            }

        }else{
            return profileData[key];
        }
    };

    self.editList = function(id,category,language){

        if (typeof id == "undefined") id = currentSectionItemId;
        if (typeof category == "undefined") category = currentSectionCategory;

        currentSectionItemId = id;
        currentSectionCategory = category;

        var newList = false;

        var url = "data/lists/" + id;
        Api.get(url,function(list){
            var container = UI.getNavigationPane(NAVIGATIONPANE.FILES);
            container.empty();
            UI.setScope(UISCOPE.LISTEDITOR);

            var hasMultipleLanguages = list && list.multiLanguage;
            if (hasMultipleLanguages){
                language = language || Config.defaultLanguage;
                var activeLanguages = [];
                Config.languages.forEach(function(lan){
                   if (list[lan]) activeLanguages.push(lan);
                });
                if (activeLanguages.indexOf(language) < 0)  activeLanguages.push(language);
                FormBuilder.setLanguageList(activeLanguages,"list");
            }

            if (id == 0){
                list = createEmptyList(category);
                newList = true;

                //TODO:  should new lists be multilanguiage by default?
                language = language || Config.defaultLanguage;
            }else{
                category = list.category || category;

                if (hasMultipleLanguages){
                    // keep same name accross languages
                    var listName;
                    if (list[Config.defaultLanguage] && list[Config.defaultLanguage].name) listName=list[Config.defaultLanguage].name;

                    list = list[language];
                    if (!list){
                        list = createEmptyList(category);
                        newList = true;
                    }
                    if (listName) list.name = listName;
                }
            }

            var items = list.items;
            var fields = list.fields;

            list.properties = list.properties || {};

            var caption = createInput("itemcaption",null,"listname" + id,list.name);

            var properties;

            if (category == "form"){
                properties = Mustache.to_html(Templates["formEditorProperties"],list.properties);
            }

            if (language){
                var languageCaption = createDiv("languagecaption languageeditor flag_" + language);
                languageCaption.innerHTML = Config.languageNames[language];
                var languageInput = createHidden("listlanguage" + id,"listlanguage" + id,language);
                languageCaption.appendChild(languageInput);
            }

            var header = createSortableListFormHeader(fields);

            var sortableList = createDiv("sortable sortablelist","list" + id);

            for (var i = 0, len = items.length; i<len; i++){
                var item = items[i];

                var elm = createSortableListFormRow(item,fields);
                sortableList.appendChild(elm);
            }

            container.append(caption);
            if (languageCaption) container.append(languageCaption);
            if (properties) container.append(properties);
            container.append(header);
            container.append(sortableList);

            if (newList){
                // populate initial fields for insert
                container.append(createHidden("","initialcategory",category));
                container.append(createHidden("","initialfields",JSON.stringify(list.fields)));
            }

            // set selectbox values
            container.find("select").each(function(){
               var name = this.name;
                if (name){
                    var elm = document.getElementById(name + "value");
                    if (elm) {
                        $(this).val(elm.value);
                        $(this).trigger("change");
                    }
                }
            });

            $(sortableList).data("fields",fields);

            $(sortableList).sortable({
                handle: '.handle'
            });

        })
    };


    var createEmptyList = function(category){
        // TODO: where do we define default menu and form structure?
        var list = {};
        list.items = [{}];
        list.name = "new_" + category;
        list.category = category;

        list.fields =  [
            {
                name: "name",
                type: "text"
            },
            {
                name: "label",
                type: "text"
            },
            {
                name: "type",
                type: "enum",
                values: "text,textarea,date,email,title"
            },
            {
                name: "mandatory",
                type: "checkbox"
            }
        ];

        if (category == "menu"){
            list.fields= [
                {
                    name: "name",
                    type: "text"
                },
                {
                    name: "url",
                    type: "text"
                },
                {
                    name: "target",
                    type: "enum",
                    values: ",_self,_blank"
                },
                {
                    name: "image",
                    type: "image"
                }
            ]
        }
        return list;
    };

    var createSortableListFormHeader = function(fields){
        var elm = createDiv("inlineformheader nowrap");

        elm.appendChild(createDiv("buttons"));

        for (var i = 0, len = fields.length; i<len; i++){
            var field = fields[i];
            var value = field.name;
            if (typeof value == "undefined") value = "";


            var editorType = FormBuilder.getEditorTypeForField(field);

            var header = createDiv();
            header.innerHTML = value;
            header.className = editorType.inlineStyle;

            elm.appendChild(header);

        }

        return elm;
    };

    var createSortableListFormRow = function(data,fields){
        var elm = createDiv("inlineformrow nowrap");
        var form = createDiv("inlineform","inlineform" + data.id);

        if (data.index){
            var indent = data.index.split(".").length-1;
            elm.className += " indent" + indent;
            $(elm).data("indent",indent);
        }

        form.appendChild(createDiv("fa handle"));
        form.appendChild(createDiv("fa fa-angle-double-left indentleft onhover"));
        form.appendChild(createDiv("fa fa-angle-double-right indentright onhover"));

        FormBuilder.renderInlineForm(form,data,fields);

        form.appendChild(createDiv("fa fa-times action_removelistitem onhover"));
        form.appendChild(createDiv("clear"));

        elm.appendChild(form);
        return elm;
    };

    self.addListItem = function(){
        var listElm = $("#list" +  currentSectionItemId);
        var fields =  listElm.data("fields");
        var item = {
            id: 0
        };

        var elm = createSortableListFormRow(item,fields);

        listElm.append(elm);
        $(listElm).sortable({
            handle: '.handle'
        });
    };

    self.updateList = function(next){

        var listElm = $("#list" +  currentSectionItemId);
        var dataObj = [];
        var properties = {};

        var name = $("#listname" +  currentSectionItemId).val();
        var language;
        if (el("listlanguage"+currentSectionItemId)) language = $("#listlanguage" +  currentSectionItemId).val();

        $(".propertyvalue").each(function(){
            if (this.name) properties[this.name] = $(this).val();
        });

        var indexarray = [0,0,0,0];

        listElm.find(".inlineform").each(function(index){
            var listItem = $(this);
            var dataItem = {};
            listItem.find(".inlineinput").each(function(index){
                var value = $(this).val();
                if (this.type && this.type == "checkbox"){
                    value = this.checked;
                }
                var name = this.name;
                dataItem[name] = value;
            });

            var indent = listItem.closest(".inlineformrow").data("indent") || 0;
            indexarray[indent]++;
            for (var i = indent+1, len = indexarray.length; i<len; i++){
                indexarray[i] = 0;
            }

            // remove trailing 0
            var thisIndex = indexarray.slice();
            while(thisIndex.length>0 && thisIndex[thisIndex.length-1] == 0){
                thisIndex.pop();
            }
            dataItem.index = thisIndex.join(".");
            dataObj.push(dataItem);
        });

        var data = "name=" + name + "&json_items=" + JSON.stringify(dataObj) + "&json_properties=" + JSON.stringify(properties);

        if (el("initialcategory") && el("initialfields")){
            data = "tree=true&category=" + $("#initialcategory").val() + "&json_fields=" + $("#initialfields").val() + "&" + data;
        }
        if (language) data += "&activeLanguage=" + language;

        console.log(data);
        Api.post("data/lists/" + currentSectionItemId + "/update",data,function(resultdata){
            if (next) next();
        });

    };

    self.deleteList = function(){
        Api.get("data/lists/" + currentSectionItemId + "/delete",function(resultdata){
            UI.refreshSection();
        })

    };

    self.getRecordFormFile = function(tag,file){

    };

    self.addTag = function(tag,profile,id){
        console.log("Adding tag " + tag + " to " + profile + " " + id);
        tag = encodeURIComponent(tag);
        var url = "annotation/tags/" + tag + "/add/" + profile + "/" + id;
        Api.get(url,function(data){
            console.log(data);
        })
    };

    self.listTag = function(tag){
        UI.setScope(UISCOPE.TAGS);
        var url = "annotation/tags/" + tag;
        Api.get(url,function(data){
            UI.listObjects(data,tag);
        })
    };

    return self;
})();
