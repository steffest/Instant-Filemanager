var version = "0.0.2";
var Templates = {};

$(document).on("ready",function(){

    $.get('_template/filemanager.html?' + version , function(templates) {
        $.each($(templates + " script"),function(index,template){
            Templates[template.id] = template.innerHTML;
        });

        var container = $("#container");
        FileSystem.addFileManager(container,"/");
    });
});