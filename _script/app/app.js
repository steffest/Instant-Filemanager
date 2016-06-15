var App = (function () {

    var self = {};
    var currentUser = undefined;

    var canRoleLogin = {
        "system admin" : true,
        "admin" : true,
        "editor" : true
    };

    self.login = function(next){
        Api.get("user",function(result){
            if (result && result.userId && result.userRole && canRoleLogin[result.userRole]){
                currentUser = result;
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


    self.canRoleLogin = function(role){
        return canRoleLogin[role];
    };


    return self;
})();