var Config = (function(){

    var self = {};

    // default config
    var settings={
        title: "Spark CMS",
        version: "2.1.24",
        apiUrl: "/api/",
        profiles:[
            {title: "Pages", profile: "pages"},
            {title: "Articles", profile: "articles"}
        ],
        sections:[
            {title: "Files", profile: "filemanager"}
        ],
        filemanagerFolders:[
            {title: "Pictures", path: "/_img/"},
            {title: "Documents", path: "/documents/"}
        ],
        adminProfiles:[
            {title: "Users", profile: "users"}
        ],
        adminSections:[
            {title: "Menus", profile: "menu"},
            {title: "Forms", profile: "form"}
        ],
        adminFilemanagerFolders:[
            {title: "Script", path: "/_script/"},
            {title: "Style", path: "/_style/"},
            {title: "ROOT", path: "/"}
        ]
    };

    var settings_localhost = {
        title: "Laozi CMS",
        apiUrl: "/laozi/"
    };

    var settings_DHGOHG = {
        title: "DHGOHG CMS"
    };

    var settings_steffest = {
        title: "Steffest CMS",
        apiUrl: "/laozi/",
        adminFilemanagerFolders:[
            {title: "Camera", path: "/box/"},
            {title: "Foto Library", path: "/foto/"},
            {title: "DropBox", path: "/drop/"},
            {title: "ROOT", path: "/"}
        ],
        adminProfiles:[
            {title: "Users", profile: "users"},
            {title: "Elpees", profile: "elpees"},
            {title: "Pockets", profile: "pockets"}
        ]
    };

    self.defaultLanguage = "en";
    self.languages = ["en","nl","benl","befr","fr"];
    self.languageNames = {
        en: "English",
        nl: "Nederlands",
        benl: "België Nederlands",
        befr: "Belgique Français",
        fr: "Français"
    };

    var isLocalHost = function(){
        return  window.location.href.indexOf("localhost")>=0 || window.location.href.indexOf("192.168")>=0;
    };
    
    var isDevBox = function(){
        return  window.location.href.indexOf("box.stef.be")>=0 ;
    };

    self.isLocalHost = function(){
        return isLocalHost();
    };

    self.init = function(){
        var newSettings;
        if (isLocalHost()) newSettings=settings_localhost;
        if (isDevBox()) newSettings=settings_steffest;

        if (window.location.href.indexOf("dhgohg.be")>=0){
            newSettings=settings_DHGOHG;
        }

        if (newSettings){
            for (var key in newSettings){
                if (newSettings.hasOwnProperty(key)){
                    settings[key] = newSettings[key];
                }
            }
        }
    };

    self.title = function(){
        return settings.title;
    };

    self.getApiUrl = function(){
        return settings.apiUrl;
    };

    self.get = function(key){
        if (settings.hasOwnProperty(key)){
            return settings[key];
        }
        return undefined;
    };
    
    return self;

})();