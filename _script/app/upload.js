var Upload = (function () {

    var self = {};

    self.init = function (elm,directory,next){
        console.log("init upload  to " + directory);

        var progressBar;
        var uploadBar;
        var endPoint = "upload";

        if (elm){
            progressBar = $(elm).find(".bar");
        }else{
            // upload for filesystem
            // only allow (on backend) when user is logged in and has access
            progressBar = $("#progress").find(".bar");
            endPoint = "uploadfile";
        }

        progressBar.css('width', '0%');
        $(".uploadbar").show();

        var url = Api.getBaseUrl() + "file/"+endPoint+"/";
        if (directory != "/" && directory != ""){
            url += directory;
            url = replaceAll(url,"//","/");
        }

        console.error(url);

        $('#fileupload').fileupload({
            url: url,
            dataType: 'json',
            done: function (e, data) {
                //console.error("callback upload" , data);
                $(".uploadbar").hide();
                if (next) next(data.result);
            },
            progressall: function (e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                progressBar.css('width', progress + '%');
            }
        });

        document.getElementById("fileupload").click();
    };




    return self;
})();




