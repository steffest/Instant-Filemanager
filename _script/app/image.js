var Image = (function () {

    var self = {};

    self.isImage = function(path){
        var result = false;
        var ext = FileSystem.getFileExtention(path);
        if (ext == ".jpg" || ext == ".jpeg" || ext == ".gif" || ext == ".png" || ext == ".bmp"){
            result = true;
        }
        return result;
    };

    self.getThumbUrl = function(path,width,height){
          return Api.getBaseUrl() + "image/" + width + "x" + height + "/" + path;
    };

    return self;
})();

