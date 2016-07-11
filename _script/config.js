var Config = (function(){

    var self = {};

    // default config
    var settings={
        title: "Spark CMS",
        version: "2.1.24",
        apiUrl: "/api/",
        useProfileTags: false,
        useDatastoreTags: true,
        profiles:[
            {title: "Pages", profile: "pages"},
            {title: "Articles", profile: "articles"}
        ],
        sections:[
            {title: "Files", profile: "filemanager"}
        ],
        filemanagerFolders:[
            {title: "Pictures", path: "/_img/"}
        ],
        adminProfiles:[

        ],
        adminSections:[
            {title: "Menus", profile: "menu"},
            {title: "Forms", profile: "form"}
        ],
        adminFilemanagerFolders:[
            {title: "Script", path: "/_script/"},
            {title: "Style", path: "/_style/"},
            {title: "ROOT", path: "/"}
        ],
        systemAdminProfiles:[
            {title: "Users", profile: "users"}
        ],
        systemAdminFilemanagerFolders:[
            {title: "Translations", path: "/_translation/"},
            {title: "System", path: "/system/"}
        ]
    };

    var settings_localhost = {
        title: "Laozi CMS",
        apiUrl: "/laozi/"
        //apiUrl: "/www/Instant-API-PHP/"

    };

    var settings_DHGOHG = {
        title: "DHGOHG CMS",
        filemanagerFolders:[
            {title: "Pictures", path: "/_img/"},
            {title: "Documents", path: "/documents/"}
        ]
    };

    var settings_Zespri = {
        title: "Zespri CMS",
        apiUrl: "/laozi/",
        css: "custom/_style/zespri.css"
    };

    var settings_steffest = {
        title: "Steffest CMS",
        apiUrl: "/laozi/",
        adminFilemanagerFolders:[
            {title: "Camera", path: "/box/"},
            {title: "Foto Library", path: "/foto/"},
            {title: "DropBox", path: "/drop/"},
            {title: "Elpees", path: "/elpees/"},
            {title: "ROOT", path: "/"}
        ],
        adminProfiles:[
            {title: "Users", profile: "users"},
            {title: "Elpees", profile: "elpees"},
            {title: "Pockets", profile: "pockets"}
        ]
    };

    self.defaultLanguage = "en";
    self.languages = ["en","nl","benl","befr","fr","it","es","de","se","no","gr"];
    self.languageNames = {
        en: "English",
        nl: "Nederlands",
        benl: "België Nederlands",
        befr: "Belgique Français",
        fr: "Français",
        it: "Italiano",
        es: "Español",
        de: "Deutsch",
        se: "Svenska",
        no: "Norsk",
        gr: "ελληνικά"
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

        if (window.location.href.indexOf("zespri")>=0){
            newSettings=settings_Zespri;
        }

        if (newSettings){
            for (var key in newSettings){
                if (newSettings.hasOwnProperty(key)){
                    settings[key] = newSettings[key];
                }
            }

            if (newSettings.css){
                loadStyleSheet(newSettings.css);
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