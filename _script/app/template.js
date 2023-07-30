var Template = (function () {

    var self = {};
    var templateCache = {};

    self.get = function(name,next){
        var result = templateCache[name];
        if (typeof result == "undefined"){
            var url = Api.getBaseUrl() + "template/get/" + name;
            if (name === "editor_imagelist"){
                url = "_template/editor/" + name + ".html";

                $.get(url,function(response){
					if (next) next(response);
				});

			}else{
				$.get(url,function(response){
					if(response.status != "ok"){
						console.error("Api Error: ", response);
					}
					templateCache[name] = response.result;
					if (next) next(response.result);
				});
            }

        }else{
            next(result);
        }
    };


    return self;
})();
