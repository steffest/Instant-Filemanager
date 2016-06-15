var version = "0.0.3";
var Templates = {};

$(document).on("ready",function(){

    $.get('_template/filemanager.html?' + version , function(templates) {
        $.each($(templates + " script"),function(index,template){
            Templates[template.id] = template.innerHTML;
        });

        var container = $("#container");

        console.log("logging in");

        App.login(function(isLoggedIn){
           if (isLoggedIn){
               UI.addNavigationPanes(container);
               UI.setNavigationPanesTitle("username",App.getCurrentUser().userName);
               DataStore.addTags();
               DataStore.addProfile("Pages","pages");
               DataStore.addProfile("Articles","articles");
               //DataStore.addProfile("Elpees","elpees");

               if (App.isSystemAdmin()){

               }

               if (App.isAdmin()){
                   DataStore.addProfile("Users","users");
                   UI.addSection("Menus","menu");
                   UI.addSection("Forms","form");
               }

               UI.addSection("Files","filemanager");

               //FileSystem.addFileManager("/");
           }else{
               container.append(Templates["loginTemplate"]);
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