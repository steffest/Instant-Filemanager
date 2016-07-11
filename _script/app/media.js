var Media = (function () {

    var self = {};

    var imagePreviewElm;
    var imagePreviewElmSender;

    var imageQueue = [];
    var loadedQueue = {};

    self.isImage = function(path){
        return FileSystem.getFileType(path) == FILETYPE.IMAGE;
    };

    self.getThumbUrl = function(path,width,height,forceRefresh){
        var url = Api.getBaseUrl() + "image/" + width + "x" + height + "/" + path;
        if(forceRefresh) url += "?r=" + new Date().getTime;
        return url;
    };

    self.getFileIcon = function(path,width){
        var icon = createDiv();
        var url = Media.getFileIconUrl(path,width);
        if (url){

            var preload = true;
            var queue = true; // rapid requests to the same server causes lot's of loading errors/blank icons?

            if (queue){
                self.AddImageQueue(url,icon);
            }else{
                if (preload){
                    var img = new Image();
                    img.src = url;
                    img.onload = function(){
                        icon.style.backgroundImage = "url('" + url + "')";
                    };
                    img.onerror = function(){
                        console.error("error loading image " + url);
                    }
                }else{
                    icon.style.backgroundImage = "url('" + url + "')";
                }
            }

            //
        }else{
            // default to Font Awesome Icon
            var ext = FileSystem.getFileExtention(path);
            icon.className = "fa fa-" + self.getFontAwesomeMediaClass(ext);
        }

        return icon;
    };

    self.getFolderIcon = function(path,width){
        // default to Font Awesome Icon
        // TODO: maybe based on folder content or annotation ?
        return createDiv("fa fa-folder-o");
    };

    self.getFileIconUrl = function(path,width){
        if (self.isImage(path)){
            return self.getThumbUrl(path,width,width);
        }else{
            // TODO: maybe look for thumb in sideCar file?
            return undefined;
        }
    };

    self.getImageInfo = function(path,callback){
        var url = "image/info" + path;
        url += "?r=" + new Date().getTime();
        Api.get(url,function(data){
            if (callback) callback(data);
        })
    };


    self.getVideoPlayer = function(url){
        //if (FileSystem.getFileExtention(url) == ".avi"){
        //    var videoPlayer = document.createElement("div");
        //    videoPlayer.innerHTML = '<embed type="application/x-vlc-plugin" pluginspage="http://www.videolan.org" width="200" height="300" src="'+url+'"/>';

        //}else{
            var videoPlayer = document.createElement("video");
            videoPlayer.src = url;
            videoPlayer.controls = "controls";


            videoPlayer.ondblclick = function(){
                goFullScreen(videoPlayer);
            };
        //}
        return videoPlayer;

    };

    self.getAudioPlayer = function(url){
        var audioPlayer = document.createElement("audio");
        audioPlayer.src = url;
        audioPlayer.controls = "controls";


        audioPlayer.ondblclick = function(){
            goFullScreen(audioPlayer);
        };
        return audioPlayer;
    };

    self.previewImage = function(imageElm,parent){
        if (!isDefined(parent)) parent = UI.getNavigationPane(NAVIGATIONPANE.MAIN);
        var imageViewer = Templates["imageViewerTemplate"];
        $(".mainpanelmodule").hide();
        parent.append(imageViewer);

        self.setupPreviewImageUI(parent);
        self.loadPreviewImage(imageElm);
    };

    self.loadPreviewImage = function(elm){
        imagePreviewElmSender = elm;
        var path = $(elm).data("path");
        var url = Api.getBaseUrl() + "file" + path;

        imagePreviewElm.style.backgroundImage = "url('" +url + "')";
    };

    self.closePreviewImage = function(imageElm,parent){
        UI.restoreMainPanel();
        $(".imageviewer").remove();
        $(".mainpanelmodule").show();
    };

    self.nextPreviewImage = function(){
        var img = $(imagePreviewElmSender).next(".img");
        var next;
        if (img.length>0){
            next = img.get(0);
        }else{
            img = $(imagePreviewElmSender).parent().children(".img");
            if (img.length>0){
                next = img.get(0);
            }
        }

        if (next){
            self.loadPreviewImage(next);
            FileSystem.showFile(next);
        }

    };

    self.prevPreviewImage = function(){
        var img = $(imagePreviewElmSender).prev(".img");
        var prev;
        if (img.length>0){
            prev = img.get(0);
        }else{
            img = $(imagePreviewElmSender).parent().children(".img").last();
            if (img.length>0){
                prev = img.get(0);
            }
        }

        if (prev){
            self.loadPreviewImage(prev);
            FileSystem.showFile(prev);
        }

    };

    self.setupPreviewImageUI = function(container){
        imagePreviewElm = $(container).find(".mainimage").get(0);
        $(".imageviewer_close").on("click",function(){self.closePreviewImage();});
        $(".imageviewer_next").on("click",function(){self.nextPreviewImage();});
        $(".imageviewer_prev").on("click",function(){self.prevPreviewImage();});
        $(".imageviewer_expand").on("click",function(){UI.toggleExpandMainPanel();});
        $(imagePreviewElm).on("click",function(){self.nextPreviewImage();});

        console.error("imagePreviewElm",imagePreviewElm);

    };


    function goFullScreen(elm){
        // requestFullScreen shim
        ( elm.mozRequestFullScreen && elm.mozRequestFullScreen() ) ||
        ( elm.webkitRequestFullScreen && elm.webkitRequestFullScreen() ) ||
        ( elm.msRequestFullscreen && elm.msRequestFullscreen() ) ||
        ( elm.requestFullScreen && elm.requestFullScreen() );
    }

    self.getFontAwesomeMediaClass = function(ext){
        var i = "file-o";
        switch (ext){
            case ".txt":
                i = "file-text-o";
                break;
        }
        return i;
    };

    loadNextImageInQueue = function(){
        if (imageQueue.length){
            var info = imageQueue[0];

            if (loadedQueue[info.url]){
                // already loaded
                info.parent.style.backgroundImage = "url('" + info.url + "')";
                imageQueue.shift();
                if (imageQueue.length) loadNextImageInQueue();
            }else{
                var img = new Image();
                img.src = info.url;
                img.retrycount = 0;
                img.onload = function(){
                    loadedQueue[info.url] = true;
                    info.parent.style.backgroundImage = "url('" + info.url + "')";
                };
                img.onerror = function(){
                    console.error("error loading image " + info.url);
                    if (img.retrycount < 1){
                        img.retrycount++;
                        imageQueue.push(info);
                    }
                };

                setTimeout(function(){
                    if (imageQueue.length) {
                        imageQueue.shift();
                        loadNextImageInQueue();
                    }
                },40)
            }
        }
    };

    self.AddImageQueue = function(url,parent){
        imageQueue.push({
            url: url,
            parent: parent
        });
        initImageQueue();
    };

    initImageQueue = function(){
        if (imageQueue.length==1) loadNextImageInQueue();
    };

    self.clearImageQueue = function(){
        imageQueue = [];
    };



    return self;
})();

