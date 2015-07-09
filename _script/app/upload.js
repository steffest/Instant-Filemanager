var Upload = (function () {

    var self = {};

    self.init = function (directory,next){
        console.log("init upload for to " + directory);

        var progressBar = $("#progress").find(".bar");
        progressBar.css('width', '0%');
        $(".uploadbar").show();

        var url = Api.getBaseUrl() + "upload/";
        if (directory != "/" && directory != ""){
            url += directory
        }

        $('#fileupload').fileupload({
            url: url,
            dataType: 'json',
            done: function (e, data) {
                console.error("callback upload" , data);
                /*
                $.each(data.result.files, function (index, file) {
                    console.error(file);
                    var fileName = file;
                    if (fileName.indexOf("_")>1){
                        fileName = fileName.substr(fileName.indexOf("_")+1,1000);
                    }
                    file = encodeURIComponent(file)
                });
                */

                if (next) next();
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




