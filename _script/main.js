var version = "0.0.16";
var Templates = {};

$(document).on("ready",function(){

    var _template = getUrlParameter("template" ) || "filemanager";

    Config.init(_template);
    Api.init();
    document.title = Config.title();

    var onInit = Config.get("onInit");
    if (onInit) onInit();

    $.get('_template/' + _template + '.html?' + version , function(templates) {
        $.each($(templates + " script"),function(index,template){
            Templates[template.id] = template.innerHTML;
        });

        var container = $("#container");
        container.empty();

        console.log("logging in");

        App.login(function(isLoggedIn){
            if (isLoggedIn){
                UI.init(container);
            }else{
                var template = Mustache.render(Templates["loginTemplate"],{title: Config.title(), version: Config.get("version")});
                container.append(template);
                $("#loginSubmit").on("click touch",function(){
                    var data = $("#loginform").serialize();

                    /*

                     Api.post("login",data,function(result){
                     if (result && result.result){
                     window.location.reload();
                     }else{
                     $("#loginform").find(".error").slideDown();
                     }

                     })

                     */

                    var url = "login/?u=" + encodeURIComponent($("input[name='u']").val()) + "&p=" + encodeURIComponent($("input[name='p']").val());
                    Api.get(url,function(result){
                        var loginForm = $("#loginform");
                        loginForm.find(".error").hide();
                        if (result && result.userId>0){
                            if (result.userRole && App.canRoleLogin(result.userRole)){
                                window.location.reload();
                            }else{
                                loginForm.find(".noaccess").slideDown();
                            }
                        }else{
                            loginForm.find(".badlogin").slideDown();
                        }
                    })

                });
            }
        });


    });
});