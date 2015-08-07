var version = "0.0.2";
var Templates = {};

$(document).on("ready",function(){

    $.get('_template/filemanager.html?' + version , function(templates) {
        $.each($(templates + " script"),function(index,template){
            Templates[template.id] = template.innerHTML;
        });

        var container = $("#container");
        UI.addNavigationPanes(container);
        DataStore.addProfile("Articles","articles");
        DataStore.addSection("Menus","menu");
        FileSystem.addFileManager("/");

    });
});