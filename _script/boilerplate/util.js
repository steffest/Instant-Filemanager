function createDiv(className,id){
    var result = document.createElement("div");
    if (className) result.className = className;
    if (id) result.id = id;
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

function numeric(s){
    return  s.replace(/\D/g,'');
}

function el(id){
    return document.getElementById(id);
}



String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};