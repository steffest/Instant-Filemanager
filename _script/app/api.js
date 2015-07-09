var Api = (function () {

    var self = {};
    var baseUrl = "/pict2/";

    self.get = function(url,next){
        url = baseUrl + url;
        $.get(url,function(response){
            if(response.status != "ok"){
               console.error("Api Error: ", response);
            }
            if (next) next(response.result,response.status);
        });
    };

    self.getBaseUrl = function(){
        return baseUrl;
    };

    return self;
})();