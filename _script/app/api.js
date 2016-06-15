var Api = (function () {

    var self = {};

    var baseUrl = Config.getApiUrl();

    self.init = function(){
        baseUrl = Config.getApiUrl();
    };

    self.get = function(url,next){
        url = baseUrl + url;
        $.get(url,function(response){
            if(response.status != "ok"){
                console.error("Api Error: ", response);
            }
            if (next) next(response.result,response.status);
        });
    };

    self.post = function(url,data,next){
        url = baseUrl + url;

        var type = "json";
        if (url.indexOf('http') == 0) type = "jsonp";


        $.post(url, data,function(data) {
            if(next){
                next(data);
            }else{
                if(data.result != "ok"){
                    alert("Error: " + data.result + ":" + data.error);
                }
            }
        },type).error(function() { alert("error (post failed)"); });
    };

    self.getBaseUrl = function(){
        return baseUrl;
    };

    return self;
})();