var FileSystem = (function () {

    var self = {};
    var currentDirectory = "";

    var FILETYPE = {
        TEXT:{name: "text file", textEditor: true},
        HTML:{name: "html file", textEditor: true, htmlEditor: true},
        IMAGE: {name: "image"},
        CODE: {name: "code file" , textEditor: true},
        CSS: {name: "stylesheet" , textEditor: true},
        FILE:{name: "file"}
    };

    self.addFileManager = function(parent,rootDirectory){
        parent.append(Templates["filemanagerTemplate"]);
        UI.init();
    };

    self.getDirectory = function(elm){
        var directory = elm.data("directory");
        Api.get("file" + directory,function(data){
            console.log(data);
            UI.listDirectories(elm,data.directories);
            UI.listFiles(elm,data.directories,data.files);
        })
    };

    self.showFile = function(elm){
        var path = elm.data("path");
        var apiMethod = "file";
        if (Image.isImage(path)) apiMethod = "image";
        Api.get(apiMethod + "/info" + path,function(data){
            console.log(data);
            UI.showFile(elm,path,data);
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

    self.getFileType = function(path){
        var result = FILETYPE.FILE;
        var ext = self.getFileExtention(path);
        if (Image.isImage(path)){
            result = FILETYPE.IMAGE;
        }else{
            if (ext == ".txt"){
                result = FILETYPE.TEXT;
            }
            if (ext == ".html" || ext == ".htm"){
                result = FILETYPE.HTML;
            }
            if (ext == ".js" || ext == ".asp" || ext == ".php" || ext == ".vb" || ext == ".cs" || ext == ".aspx" || ext == ".jsp"){
                result = FILETYPE.CODE;
            }
        }

        return result;
    };

    return self;
})();
