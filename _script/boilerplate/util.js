function createDiv(className,id){
    var result = document.createElement("div");
    if (className) result.className = className;
    if (id) result.id = id;
    return result;
}

function createLink(className,href,target,innerHTML){
    var result = document.createElement("a");
    if (className) result.className = className;
    if (href) result.href = href;
    if (target) result.target = target;
    if (innerHTML) result.innerHTML = innerHTML;

    return result;
}

function createInput(className,name,id,value){
    var result = document.createElement("input");
    if (className) result.className = className;
    if (id) result.id = id;
    if (name) result.name = name;
    result.type = "text";
    result.value = value;
    return result;
}

function createHidden(name,id,value){
    var result = document.createElement("input");
    result.type = "hidden";
    if (id) result.id = id;
    if (name) result.name = name;
    result.value = value;
    return result;
}

function createTextarea(className,name,id,value){
    var result = document.createElement("textarea");
    if (className) result.className = className;
    if (id) result.id = id;
    if (name) result.name = name;
    result.type = "text";
    result.value = value;
    return result;
}

function createFaIcon(name,className){
    var result = document.createElement("i");
    result.className = "fa fa-" + name;
    if (className) result.className += ' ' + className;
    return result;
}


function createUpload(name,id,value,path){
    var result = createDiv("fileupload");

    var input = createTextarea('hidden',name,null,value);
    var listView = createDiv('listView');

    var addFile = function(fileData){
        if (fileData){
            input.value += fileData.name + '|' + fileData.filename + '|' + fileData.size + '\n';
            updateListView(input.value);
        }
    };

    var removeFile = function(fileData){
        if (fileData && input.value){
            input.value = input.value.replace(fileData,'');
            input.value = input.value.replace('\n\n','\n');
            updateListView(input.value);
        }
    };

    var updateListView = function(value){
        listView.innerHTML = '';
        if (value){
            var files = value.split('\n');
            for (var i = 0, len = files.length; i<len; i++){
                if (files[i].indexOf('|')>0){
                    var fileData = files[i];
                    var fileInfo = fileData.split('|');
                    var file = createDiv('attachmentfile');

                    var link = createLink('',Api.getBaseUrl() + "file/get/u/" + path + "/" + fileInfo[1],"_blank",'<i class="fa fa-file-o"></i> ' + fileInfo[0]);
                    var deleteButton = createFaIcon('remove','delete');
                    $(deleteButton).data('file',fileData);

                    deleteButton.onclick = function(){
                        removeFile($(this).data('file'));
                    };

                    file.appendChild(deleteButton);
                    file.appendChild(link);

                    listView.appendChild(file);
                }
            }
        }
    };

    if (value && value != ''){
        updateListView(value);
    }

    var init = createDiv("textlink action add");
    init.innerHTML = '<i class="fa fa-upload"></i> Add File';
    init.onclick = function(){
        Upload.init(this,path,function(result){
            if (result){
                if (result.status == "ok"){
                    addFile(result.result);
                }else{
                    alert("Error: " + result.result);
                }
            }
        });
    };

    var bar = createDiv("bar");

    var buttonContainer = createDiv("uploadbutton");
    buttonContainer.style.height = 0;
    buttonContainer.style.width= 0;
    buttonContainer.style.overflow= 'hidden';

    var button = document.createElement("input");
    button.type = "file";
    button.id = "fileupload";
    button.name="files[]";
    button.multiple="false";
    button.capture = "camera";

    buttonContainer.appendChild(button);

    result.appendChild(init);
    result.appendChild(bar);
    result.appendChild(buttonContainer);

    result.appendChild(listView);
    result.appendChild(input);

    return result;
}

function replaceAll(s, r1, r2) {
    var result = s;
    if(s){
        result =  s.replace(new RegExp(r1, 'g'),r2);
    }
    return result;
}

function isInt(s)
{
    if (isNaN(s)) return false;
    return Math.ceil(s) == Math.floor(s);
}

function isDefined(o){
    return typeof o != "undefined";
}

function numeric(s){
    return  s.replace(/\D/g,'');
}

function el(id){
    return document.getElementById(id);
}

function formatDate(s){
    if (s && s.indexOf("Date")>0){
        var d = new Date(parseInt(numeric(s)));
        s = d.getDate() + "/" + (d.getMonth()+1) + "/" + d.getFullYear();
    }
    return s;
}

function formatSize(b){
    var values = ["bytes","kb","Mb","Gb","Tb"];
    var index = 0;
    while (b>1000 && index<5){
        b = (b/1000).toFixed(2);
        index++;
    }
    return b + " " + values[index];
}

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

function convertDMSToDD(degrees, minutes, seconds, direction) {
    var dd = degrees + minutes/60 + seconds/(60*60);

    if (direction == "S" || direction == "W") {
        dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
}


