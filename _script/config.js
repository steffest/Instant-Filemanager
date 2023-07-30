var Config = (function(){

    var self = {};
    var timestamp = new Date().getTime();

    // default config
    var settings={
        title: "Spark CMS",
        version: "2.1.27",
        apiUrl: "/api/",
        useProfileTags: false,
        useDatastoreTags: true,
        useFileTags: false,
        showHelp: false,
        profiles:[],
        sections:[
            {title: "Files", profile: "filemanager"}
        ],
        filemanagerFolders:[
            {title: "Images", path: "/_img/"}
        ],
        adminProfiles:[
            {title: "HealthToolkit", profile: "h_articles"},
            {title: "Redirects", profile: "db_redirect"}
        ],
        adminSections:[
            {title: "Menus", profile: "menu"},
            {title: "Forms", profile: "form"}
        ],
		contentManagerSections:[
            {title: "Menus", profile: "menu"}
        ],
        adminFilemanagerFolders:[
            {title: "Script", path: "/_script/"},
            {title: "Style", path: "/_style/"},
            {title: "ROOT", path: "/"}
        ],
        systemAdminSections:[
            {title: "Admin", profile: "admin"}
        ],
        systemAdminProfiles:[
            {title: "Users", profile: "users"}
        ],
        systemAdminFilemanagerFolders:[
            {title: "Translations", path: "/_translation/"},
            {title: "System", path: "/system/"}
        ],
        tinyMCEConfig:{

        },
        imageQueueLoadDelay: 0, // depending on the backend, loading large amounts of (dynamicly scaled) image can clog up the server
        imageQueueMaxRetry: 2
    };

    var settings_localhost = {
        title: "Laozi CMS",
        apiUrl: "http://box.stef.be/laozi/",
        isMultiLanguage: true
        //apiUrl: "/www/Instant-API-PHP/"

    };

    var settings_DHGOHG = {
        title: "DHGOHG CMS",
        profiles:[
            {title: "Pages", profile: "pages"},
            {title: "Articles", profile: "articles"}
        ],
        filemanagerFolders:[
            {title: "Pictures", path: "/_img/"},
            {title: "Documents", path: "/documents/"}
        ],
        tinyMCEConfig:{
            document_base_url : "//www.dhgohg.be/",
            style_formats:{title:"DHGOHG",items:[
                { title: 'Titel Uitklap sectie', block: 'h2', classes: 'titel_uitklapbaar'},
                { title: 'Uitklap sectie', block: 'div', classes: 'uitklapbaar'}
            ]},
            content_css: [
                '//dhgohg.be/_style/main.css?v7',
                '//dhgohg.be/_style/editor.css?v7'
            ]
        },
        systemAdminFilemanagerFolders: [],
        adminProfiles:[],
        isMultiLanguage: false,
        useProfileTags: false,
        useDatastoreTags: false,
        useFileTags: false
    };

    var settings_DHGOHG_light = {
        title: "RVB Bestanden",
        filemanagerFolders:[
            {title: "Documenten", path: "/RVB/"}
        ],
        profiles:[],
        adminFilemanagerFolders:[],
        systemAdminFilemanagerFolders: [],
        adminProfiles:[],
        adminSections:[],
        systemAdminSections:[],
        contentManagerSections:[],
        isMultiLanguage: false,
        useProfileTags: false,
        useDatastoreTags: false,
        useFileTags: false,
        css: "custom/_style/light.css",
        onInit: function(){
          App.setRoleCanLogin("rvb",true);
        },
        onLoad: function(){
            $(".sectionfilemanager").click();
        }
    };

    var settings_Zespri = {
        title: "Zespri DEV CMS",
        apiUrl: "/laozi/",
        css: "custom/_style/zespri.css",
        isMultiLanguage: true,
        showHelp: true,
        profiles:[
            {title: "Pages", profile: "pages"},
            {title: "Articles", profile: "articles"}
        ],
        filemanagerFolders:[
            {title: "Images", path: "/_img/"},
            {title: "Includes", path: "/_include/"}
        ],
        tinyMCEConfig:{
            document_base_url : "//www.zespri.eu/",
            style_formats:{title:"Zespri",items:[
                { title: 'Zespri Green', inline: 'span', classes: 'zesprigreenbright'},
                { title: 'Zespri Green dark', inline: 'span', classes: 'zesprigreendark'},
                { title: 'Zespri Red', inline: 'span', classes: 'zesprired'},
                { title: 'Zespri Yellow', inline: 'span', classes: 'zespriyellow'},
                { title: 'Quote', block: 'q', classes: ''}
            ]},
            image_formats:{title:"Image",items:[
                { title: 'Image Width 75%', selector: 'img', classes: 'imgwidth75'},
                { title: 'Image Width 67%', selector: 'img', classes: 'imgwidth67'},
                { title: 'Image Width 60%', selector: 'img', classes: 'imgwidth60'},
                { title: 'Image Width 50%', selector: 'img', classes: 'imgwidth50'},
                { title: 'Image Width 50% - align left', selector: 'img', classes: 'imgwidth50_left'},
                { title: 'Image Width 50% - align right', selector: 'img', classes: 'imgwidth50_right'},
                { title: 'Image Width 40% - align left', selector: 'img', classes: 'imgwidth40_left'},
                { title: 'Image Width 40% - align right', selector: 'img', classes: 'imgwidth40_right'},
                { title: 'Image Width 30% - align left', selector: 'img', classes: 'imgwidth30_left'},
                { title: 'Image Width 30% - align right', selector: 'img', classes: 'imgwidth30_right'}
            ]},
            content_css: [
                'http://www.zespri.eu/_style/zespri.css?' + timestamp,
                'http://www.zespri.eu/_style/editor.css?' + timestamp,
                'http://www.zespri.eu/_font/bree.css?' + timestamp,
                'http://www.zespri.eu/_font/custom/icons.css?' + timestamp,
                'https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700,900'
            ]
        }
    };

    var settings_steffest = {
        title: "Steffest CMS",
        apiUrl: "/laozi/",
        useProfileTags: true,
        useFileTags: true,
        useDatastoreTags: true,
        isMultiLanguage: false,
        profiles:[
            {title: "Blog", profile: "file_blog"}
        ],
        adminFilemanagerFolders:[
            {title: "Camera", path: "/box/"},
            {title: "Foto Library", path: "/foto/"},
            {title: "DropBox", path: "/drop/"},
            {title: "Elpees", path: "/elpees/"},
			{title: "Singles", path: "/singles/"},
			{title: "KissCatalog", path: "/drop/Dropbox/Emulation/Amiga/collection/"},
            {title: "ROOT", path: "/"}
        ],
        adminProfiles:[
            {title: "Users", profile: "users"},
            {title: "Elpees", profile: "elpees"},
            {title: "Singles", profile: "singles"},
            {title: "Pockets", profile: "pockets"}
        ]
    };
	
	var settings_IPIS = {
        title: "IPIS MapBuilder",
        apiUrl: "/laozi/",
        useProfileTags: false,
        useFileTags: false,
        useDatastoreTags: false,
        isMultiLanguage: false,
		showHelp: true,
        profiles:[],
		contentManagerSections:[],
		adminSections:[],
		filemanagerFolders:[
            {title: "ROOT", path: "/"},
            {title: "Documentation", path: "/_docs/"}
        ],
        adminProfiles:[
            
        ]
    };


    self.defaultLanguage = "en";
    self.languages = ["en","fr","it","es","de","nl","benl","befr","lufr","se","no","gr","pt"];
    self.languageNames = {
        en: "English",
        nl: "Nederlands",
        benl: "België Nederlands",
        befr: "Belgique Français",
        lufr: "Luxembourg Français",
        fr: "Français",
        it: "Italiano",
        es: "Español",
        de: "Deutsch",
        se: "Svenska",
        no: "Norsk",
        gr: "ελληνικά",
		pt: "Português"
    };
    self.displayLanguage = self.defaultLanguage;

    var isLocalHost = function(){
        return  window.location.href.indexOf("localhost")>=0 || window.location.href.indexOf("192.168")>=0;
    };
    
    var isDevBox = function(){
        return  window.location.href.indexOf("box.stef.be")>=0 ;
    };

    self.isLocalHost = function(){
        return isLocalHost();
    };

    self.useTags = function(){
        return (settings.useDatastoreTags || settings.useFileTags || settings.useProfileTags);
    };

    self.init = function(template){
        var newSettings;
        if (isLocalHost()) {
            newSettings=settings_localhost;
            newSettings=settings_Zespri;
            newSettings.apiUrl = "https://www.zespri.eu/laozi/"
		}
        if (isDevBox()) newSettings=settings_steffest;

        if (window.location.href.indexOf("dhgohg.be")>=0){
            if (template == "light"){
                newSettings=settings_DHGOHG_light;
            }else{
                newSettings=settings_DHGOHG;
            }

        }

        if (window.location.href.indexOf("zespri")>=0){
            newSettings=settings_Zespri;
        }
		
		if (window.location.href.indexOf("annexmap")>=0){
            newSettings=settings_IPIS;
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

            if (typeof settings.isMultiLanguage == "boolean" && !settings.isMultiLanguage){
                self.defaultLanguage = "";
                self.displayLanguage = "";
            }
        }

        // load local storage:
        var localValue;

        localValue = localStorage.getItem("cms_displayLanguage");
        if (localValue) {
            self.displayLanguage = localValue;
            self.defaultLanguage = localValue;
        }

    };

    self.title = function(){
        return settings.title;
    };

    self.getApiUrl = function(){
        return settings.apiUrl;
    };

    self.get = function(key,defaultValue){
        if (settings.hasOwnProperty(key)){
            return settings[key];
        }else{
            return defaultValue;
        }
    };

    self.persist = function(name,value){
        localStorage.setItem("cms_" + name,value);
    };
    
    return self;

})();