var Dialog = (function () {

    var self = {};
    var container;
    var dialog;
    var selection;
    var selectionInfo;
    var scrollTop;
    var currentDirectory;
    var currentConfig;
    var displayMode = LISTDISPLAYMODE.LIST;

    self.show = function(config){
        currentConfig = config;
        if (el("dialogbox")) $("#dialogbox").remove();

        dialog = createDiv("","dialogbox");
        var content = Mustache.render(Templates["dialogTemplate"],config);
        dialog.innerHTML = content;

        scrollTop =  $(window).scrollTop();
        window.scrollTo(0,0);

        config.parent.prepend(dialog);
        dialogBindings(config);

        config.parent.find(".blanket").on("click",function(){
            self.close();
        });

        container = $(dialog).find(".dialogcontent");

        if (config.type == "file"){
           listPagesAndArticles(config.lan);
        }else if (config.type == "article"){
            listArticlesByCategory(config.lan);
        }else{
            currentDirectory = currentDirectory || "/_img/";
            listDirectory(currentDirectory);
        }


    };

    self.close = function(){
        currentConfig = undefined;
        $("#dialogbox").remove();
        $(".filemanager").removeClass("cover");
        if (scrollTop){
            window.scrollTo(0,scrollTop);
        }
    };

    var dialogBindings = function(config){

        var $dialog = $(dialog);

        $dialog.on("click",".button",function(){
            var button = $(this);

            if (button.hasClass("close_dialog")){
                if (config.onCancel) config.onCancel();
                self.close();
            }
            if (button.hasClass("confirm_dialog")){
                if (config.onSelect) config.onSelect(selection,selectionInfo);
                self.close();
            }
        });

        $dialog.on("click",".button",function(){
            var button = $(this);

            if (button.hasClass("toggle")){
                button.toggleClass("selected");
            }

            if (button.hasClass("close_dialog")){
                self.close();
            }
            if (button.hasClass("confirm_dialog")){
                self.close();
            }

            if (button.hasClass("display")){
                button.siblings(".button").removeClass("selected");
                button.addClass("selected");

                displayMode = LISTDISPLAYMODE.LIST;
                if (button.hasClass("display_grid")) displayMode = LISTDISPLAYMODE.ICONS;
                if (button.hasClass("display_gridlarge")) displayMode = LISTDISPLAYMODE.THUMBS;

                listDirectory(currentDirectory);
            }
        });

        $dialog.on("click",".file",function(e){
            selectFile(this);
        });

        $dialog.on("click",".article",function(e){
            selectArticle(this);
        });

        $dialog.on("click",".link",function(e){
            selectLink(this);
        });

        $dialog.on("click",".filedirectory",function(){
            listDirectory($(this).data("path") + "/");

        });

        $dialog.on("click",".directoryup",function(){
            listDirectory($(this).data("parent"));
        });

        $dialog.on("click",".togglecaption",function(){
            $(this).next(".togglecaptiontarget").slideToggle("fast");
        });


    };


    var listDirectory = function(directory){

        container.removeClass("displaylist displayicons displaythumbs")
            .addClass(displayMode.className);

        currentDirectory = directory;
        var parent = false;
        var path = directory.substr(0,directory.length-1);

        var p = path.lastIndexOf("/");
        if (p>=0){
            parent =path.substr(0,p+1);
        }


        Api.get("file" + directory,function(data){
            UI.listFiles(null,data.directories,data.files,{
                container : container,
                basePath: directory,
                parentPath : parent,
                displayOptions : {
                    currentDisplayMode : displayMode
                }
            });
        })
    };

    var listPagesAndArticles = function(language){
        language = language || Config.defaultLanguage;
        container.empty();
        container.addClass('hascolumns');

        container.append('<h3>Pages</h3>');
        listPages(language,function(){
            container.append('<br><h3>Articles</h3>');
            listArticles();
        });

    };

    var listPages = function(language,next){
        language = language || Config.defaultLanguage;
        Api.get("data/pages/" + language + "?fields=url,name,state",function(result){
            if (result){
                result.forEach(function(page){
                    var div = createDiv("link listitem");
                    div.innerHTML = '<i class="fa fa-file-o"> </i> <span class="label faw">' + page.name + '</span><span class="labelurl">' + language + "/" + page.url + '</span>';
                    container.append(div);
                });
            }
            if (next) next();

        });
    };

    var listArticles = function(language){
        language = language || Config.defaultLanguage;
        Api.get("data/articles/" + language + "?fields=slug,name,category,state",function(result){
            if (result){
                result.forEach(function(page){
                    var div = createDiv("link listitem");
                    page.url = page.slug;
                    if (page.category) page.url = page.category + "/" + page.url;
                    div.innerHTML = '<i class="fa fa-file-o"> </i> <span class="label faw">' + page.name + '</span><span class="labelurl">' + language + "/" + page.url + '</span>';
                    container.append(div);
                });
            }

        });
    };

    var listArticlesByCategory = function(language){
        container.empty();
        container.addClass('hascolumns');

        language = language || Config.defaultLanguage;
        Api.get("data/articles/" + language + "?fields=id,slug,name,category,state",function(result){
            if (result){

                var recipe = createDiv("listitemgroup togglecaptiontarget hidden");
                var blog = createDiv("listitemgroup togglecaptiontarget hidden");
                var discover = createDiv("listitemgroup togglecaptiontarget hidden");

                result.forEach(function(article){
                    var target = undefined;
                    if (article.state == "published" || article.state == "draft"){
                        if (article.category == "recipe") target = $(recipe);
                        if (article.category == "blog") target = $(blog);
                        if (article.category == "discover") target = $(discover);
                    }

                    if (target){
                        var div = createDiv("article listitem");
                        article.url = article.slug;
                        if (article.category) article.url = article.category + "/" + article.url;
                        div.innerHTML = '<i class="fa fa-file-o"> </i> <span class="label faw" data-id="'+article.id+'" data-category="'+ article.category +'">' + article.name + '</span><span class="labelurl">' + language + "/" + article.url + '</span> ';
                        target.append(div);
                    }

                });

                container.append('<h3 class="togglecaption"><i class="fa fa-chevron-right"></i> Recipe</h3>');
                container.append(recipe);
                container.append('<h3 class="togglecaption"><i class="fa fa-chevron-right"></i> Blog</h3>');
                container.append(blog);
                container.append('<h3 class="togglecaption"><i class="fa fa-chevron-right"></i> Discover</h3>');
                container.append(discover);


            }

        });
    };

    var selectFile = function(elm){
        var fileName = $(elm).find(".label").html();
        selection = currentDirectory + fileName;

        var info = $(dialog).find(".dialogselection");
            info.html(fileName + "<small></small>");

        var preview = $(dialog).find(".dialogpreview");
            preview.empty();
            var iconContent = Media.getFileIcon(selection,LISTDISPLAYMODE.ICONS.iconSize);
            preview.append(iconContent);

        Media.getImageInfo(selection,function(data){
            selectionInfo = data;
            if (data.width && data.height) info.find("small").html(data.width + " x " + data.height);
        });

    };

    var selectLink = function(link){
        selection = $(link).find(".labelurl").html();
        if (currentConfig && currentConfig.onSelect) currentConfig.onSelect(selection);
        self.close();
    };

    var selectArticle = function(link){
        var label = $(link).find(".label");
        var id = label.data("id");
        var category = label.data("category");

        selection = id + ": " + category + ": " + label.text();
        if (currentConfig && currentConfig.onSelect) currentConfig.onSelect(selection);
        self.close();
    };

    return self;
})();
