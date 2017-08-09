var FileSystem = (function () {

    var self = {};
    var currentDirectory = "";

    self.addFileManager = function(rootDirectory,label,container,loadDirectories){

        var directoryList = $(container).find(".directorylist");
        if (directoryList.length == 0){
            directoryList = $(createDiv("directorylist"));
            $(container).append(directoryList);
        }

        var directory = createDiv("directory");
        $(directory).data("directory",rootDirectory);

        var labelElm = createDiv("label faw open");
        labelElm.innerHTML = label;
        var content = createDiv("content");

        directory.appendChild(labelElm);
        directory.appendChild(content);

        directoryList.append(directory);

        UI.initFileManager(loadDirectories ? directory : undefined);
    };

    self.getDirectory = function(elm){
        var directory = elm.data("directory");
        Api.get("file" + directory,function(data){
            UI.setScope(UISCOPE.FILES);
            UI.listDirectories(elm,data.directories);
            UI.listFiles(elm,data.directories,data.files);
        })
    };

    self.showFile = function(elm,forceRefresh){
        var path = $(elm).data("path");
        var apiMethod = "file";
        if (Media.isPixelImage(path)) apiMethod = "image";
        var url = apiMethod + "/info" + path;
        if (forceRefresh) url += "?r=" + new Date().getTime();
        Api.get(url,function(data){
            console.log(data);
            UI.showFile(elm,path,data,forceRefresh);
        })
    };

    self.showDirectory = function(elm){
        var path = elm.data("path");
        var apiMethod = "file";
        Api.get(apiMethod + "/info" + path,function(data){
            console.log(data);
            UI.showDirectory(elm,path,data);
        })
    };

    self.renameFile = function(path,newName,next){
        console.error("rename " + path + " to " + newName);
        var url = "file/rename/" + path + "?name=" + newName;
        Api.get(url,function(data){
            console.log(data);
            if (next) next();
        })
    };

    self.moveFile = function(path,target,next){
        console.error("moving " + path + " to " + target);
        var url = "file/move/" + path + "?to=" + target;
        Api.get(url,function(data){
            console.log(data);
            if (next) next();
        })
    };

    self.deleteFile = function(path,next){
        console.error("deleting file " + path);
        var url = "file/delete/" + path;
        Api.get(url,function(data){
            console.log(data);
            if (next) next();
        })
    };

    self.createFile = function(path,next){
        console.error("creating file " + path);
        var url = "file/create/" + path;
        Api.get(url,function(data){
            console.log(data);
            if (next) next();
        })
    };

    self.moveFiles = function(paths,target,next){
        var url = "file/movemulti/?to=" + target;
        var data = "files=" + paths.join(",");
        Api.post(url,data,function(result){
            console.log(result);
            if (next) next();
        })
    };

    self.deleteFiles = function(paths,next){
        console.error("deleting files " + paths);
        var url = "file/deletemulti/";
        var data = "files=" + paths.join(",");
        Api.post(url,data,function(result){
            console.log(result);
            if (next) next();
        })
    };

    self.createDirectory = function(path,next){
        console.error("creating directory " + path);
        var url = "file/createdirectory/" + path;
        Api.get(url,function(data){
            console.log(data);
            if (next) next();
        })
    };

    self.getFileExtention = function(path){
        var p = path.lastIndexOf(".");
        var ext = "";
        if (p>0){
            ext = path.substr(p).toLowerCase();
        }
        return ext;
    };

    self.getFileName = function(path){
        var p = path.lastIndexOf("/");
        var fileName = "";
        if (p>-1){
            fileName = path.substr(p+1);
        }
        return fileName;
    };

    self.getFilePath = function(path){
        var p = path.lastIndexOf("/");
        var filePath = "";
        if (p>-1){
            filePath = path.substr(0,p+1);
        }
        return filePath;
    };

    self.getFileType = function(path){
        var result = FILETYPE.FILE;
        var ext = self.getFileExtention(path);
        if (ext == ".txt"){
            result = FILETYPE.TEXT;
        }
        if (ext == ".html" || ext == ".htm"){
            result = FILETYPE.HTML;
        }
        if (ext == ".js" || ext == ".asp" || ext == ".php" || ext == ".vb" || ext == ".cs" || ext == ".css" || ext == ".aspx" || ext == ".jsp" || ext == ".json" || ext == ".translation"){
            result = FILETYPE.CODE;
        }
        if (ext == ".jpg" || ext == ".jpeg" || ext == ".gif" || ext == ".png" || ext == ".bmp"){
            result = FILETYPE.IMAGE;
        }
        if (ext == ".svg"){
            result = FILETYPE.VECTORIMAGE;
        }
        if (ext == ".mp4" || ext == ".m4v" || ext == ".avi" || ext == ".mov" || ext == ".mkv" || ext == ".ogv" || ext == ".3gp"){
            result = FILETYPE.VIDEO;
        }
        if (ext == ".mp3" || ext == ".wav" || ext == ".ogg"){
            result = FILETYPE.AUDIO;
        }
        return result;
    };

    self.addTag = function(tag,path,next){
        console.log("Adding tag " + tag + " to " + path);
        tag = encodeURIComponent(tag);
        var url = "annotation/tags/" + tag + "/add/file/" + path;
        Api.get(url,function(data){
            console.log(data);
            if (next) next();
        })
    };

    self.removeTag = function(tag,path,next){
        console.log("Removing tag " + tag + " to " + path);
        tag = encodeURIComponent(tag);
        var url = "annotation/tags/" + tag + "/remove/file/" + path;
        Api.get(url,function(data){
            console.log(data);
            if (next) next();
        })
    };

    self.addTagToMulti = function(tag,paths,next){
        console.log("Adding tag " + tag + " to multi ",paths);
        tag = encodeURIComponent(tag);
        var url = "annotation/tags/" + tag + "/add/files/";
        var data = "files=" + paths.join(",");
        Api.post(url,data,function(result){
            console.log(result);
            if (next) next();
        })
    };

    self.rotateImage = function(path,rotation,next){
        var url = "image/transform/silent/rotate" + rotation + "/" + path;
        Api.get(url,function(){
            if (next) next();
        })
    };

    self.convert = function(path,targetFormat,next){
        var url = "file/convert/" + targetFormat + "/" + path;
        Api.get(url,function(data){
            if (next) next(data);
        })
    };

    return self;
})();
