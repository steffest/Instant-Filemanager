var App = (function () {

    var self = {};
    var currentUser = undefined;

    var canRoleLogin = {
        "system admin" : true,
        "admin" : true,
        "content manager" : true,
        "editor" : true
    };

    self.login = function(next){


        if (Config.isLocalHost()){
			currentUser = {
				userRole: "system admin"
            };
            next(true);
            return;
        }


        Api.get("user",function(result){
            if (result && result.userId && result.userRole && canRoleLogin[result.userRole]){
                currentUser = result;

                if (typeof currentUser.languages == "string"){
                    Config.languages  = currentUser.languages.split(",");

                    if (Config.defaultLanguage){
                        if (Config.languages.indexOf(Config.defaultLanguage)<0){
                            Config.defaultLanguage  = Config.languages.length ? Config.languages[0] : "en";
                        }
                    }

                    if (Config.displayLanguage){
                        if (Config.languages.indexOf(Config.displayLanguage)<0){
                            Config.displayLanguage  = Config.defaultLanguage;
                        }
                    }

                }
                if (next) next(true);
            }else{
                next(false);
            }
        });
    };

    self.logout = function(){
        Api.get("logout",function(){
            window.location.reload();
        });
    };

    self.getCurrentUser = function(){
        return currentUser || {};
    };

    self.isAdmin = function(){
        return (currentUser && currentUser.userRole && currentUser.userRole.indexOf("admin")>=0);
    };

    self.isSystemAdmin = function(){
        return (currentUser && currentUser.userRole && currentUser.userRole.indexOf("system admin")>=0);
    };

    self.isContentManager = function(){
        return (currentUser && currentUser.userRole && currentUser.userRole.indexOf("content manager")>=0);
    };


    self.canRoleLogin = function(role){
        return canRoleLogin[role];
    };

    self.setRoleCanLogin = function(role,canLogin){
        canRoleLogin[role] = canLogin;
    };


    return self;
})();