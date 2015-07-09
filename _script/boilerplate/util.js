function createDiv(className,id){
    var result = document.createElement("div");
    if (className) result.className = className;
    if (id) result.id = id;
    return result;
}