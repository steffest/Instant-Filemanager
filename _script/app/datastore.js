var DataStore = (function () {

    var self = {};

    var profileListElm;
    var editorContainer;
    var currentProfile;
    var currentProfileId;
    var currentSectionItemId;


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

    self.addProfile = function(label,profile){
        if (!profileListElm){
            var container = $(UI.getNavigationPane(NAVIGATIONPANE.FOLDERS));
            container.append(Templates["profileListTemplate"]);
            profileListElm = container.find(".profilelist");
        }

        var item = $(createDiv("profile fa profile"+profile));
        item.data("profile",profile);
        item.html(label);

        profileListElm.append(item);

        UI.initProfileManager();

    };

    self.listProfile = function(profile,sender,category){
        var container = UI.getNavigationPane(NAVIGATIONPANE.FILES);
        container.empty();
        UI.setScope(UISCOPE.PROFILES);

        var fields="id,name";
        if (profile == "elpees") fields="id,title as name"; // TODO: FIXME!!
        if (profile == "pockets") fields="id,title as name"; // TODO: FIXME!!

        var url = "data/" + profile + "/select/" + fields;
        if (category) url = "data/" + profile + "/category/" + category + "?fields=" + fields;

        var orderBy = "orderby=name";
        var suffix = url.indexOf("?")>0 ? "&" : "?";
        url += suffix + orderBy;

        Api.get(url,function(data,status){
            if (data && status=="ok"){
                for (var i = 0, len = data.length; i<len; i++){
                    var item = data[i];

                    var elm = createDiv("record accepttag listitem");

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

        console.log("editprofile " + profile,id);

        currentProfile = profile;
        currentProfileId = id;

        // pre handle special profiles
        if (profile == "menu" || profile == "form" || profile == "lists"){
            self.editList(id,profile);
            return;
        }

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
                if (data.multiLanguage){
                    // add Empty Default Language
                    // TODO: active language should be added
                    data[Config.defaultLanguage] = {id: 0};
                }else{
                    data={id: 0}
                }
            }

            //if (data.multiLanguage && data.en) data = data.en;
            console.log(data);
            if (data){
                var formContainer = editorContainer.find(".formcontent");
                FormBuilder.setContainerElm(formContainer);
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

                        if (data.multiLanguage){
                            FormBuilder.addEditor(editor,key,data,field,true);
                        }else{
                            var value = data[key];
                            if (typeof value == "undefined") value = "";
                            FormBuilder.addEditor(editor,key,value,field);
                        }

                        processedItems[key] = true;
                    }

                    if (data.multiLanguage){
                        var activeLanguages = [];
                        Config.languages.forEach(function(lan){
                            if (data[lan]) activeLanguages.push(lan);
                        });
                        FormBuilder.addEditorElement(formContainer[0],FORMEDITOR.HIDDEN,"activelanguages",activeLanguages.join((",")));
                    }

                    // add values not present in template if needed
                    console.error(ext.includeAll);
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

    self.editList = function(id,category){
        currentSectionItemId = id;
        Api.get("data/lists/" + id,function(list){
            var container = UI.getNavigationPane(NAVIGATIONPANE.FILES);
            container.empty();
            UI.setScope(UISCOPE.LISTEDITOR);

            if (id == 0){
                // TODO: where do we define default menu and form structure?
                list = {};
                list.items = [{}];
                list.name = "new_" + category;

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
                        }
                    ]
                }
            }else{
                category = list.category;
            }

            var items = list.items;
            var fields = list.fields;
            list.properties = list.properties || {};

            var caption = createInput("itemcaption",null,"listname" + id,list.name);

            var properties;

            if (category == "form"){
                properties = Mustache.to_html(Templates["formEditorProperties"],list.properties);
            }

            var header = createSortableListFormHeader(fields);

            var sortableList = createDiv("sortable sortablelist","list" + id);

            for (var i = 0, len = items.length; i<len; i++){
                var item = items[i];

                var elm = createSortableListFormRow(item,fields);
                sortableList.appendChild(elm);
            }

            container.append(caption);
            if (properties) container.append(properties);
            container.append(header);
            container.append(sortableList);

            if (id == 0){
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

    var createSortableListFormHeader = function(fields){
        var elm = createDiv("inlineformheader");

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
        var elm = createDiv("inlineformrow");
        var form = createDiv("inlineform","inlineform" + data.id);

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
        console.error(listElm);
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

        if (currentSectionItemId == 0){
            data = "tree=true&category=" + $("#initialcategory").val() + "&json_fields=" + $("#initialfields").val() + "&" + data;
        }

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
