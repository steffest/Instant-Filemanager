var ImageEditor = (function () {

var selectionInfo = {};
var canvasScale;

var canvas;
var ctx;
var selection;

var imageFormat;
var imageName;


$(document).on("ready",function(){

    Config.init();
    Api.init();
    init();

    $(window).on("resize",function(){
       scaleCanvas();
    });

    Touch.add("#dragselection",{
        defaultDrag : true,
        snapBack : false,
        clone: true,
        onDown : function(){
            selectionInfo.startWidth = selectionInfo.target.width();
            selectionInfo.startHeight = selectionInfo.target.height();


        },
        onDrag : function(touchEvents){
            if (typeof selectionInfo.startWidth == "undefined"){
                selectionInfo.startWidth = selectionInfo.target.width();
                selectionInfo.startHeight = selectionInfo.target.height();
            }
            var w = selectionInfo.startWidth + touchEvents.deltaX;
            var h = selectionInfo.startHeight + touchEvents.deltaY;

            setSelection(w,h);

        },
        onTouchEnd: function(){
            selectionInfo.startWidth = undefined;
            selectionInfo.startHeight = undefined;
        }
    });

    Touch.add("#selection",{
        defaultDrag : true,
        onDrag : function(touchEvents){

        }
    });

    Touch.add("#ok",{
        onTap : function(touchEvents){
            if (selectionInfo.action == "crop"){
                crop();
            }
            if (selectionInfo.action == "resize"){
                resize();
            }
        }
    });

    Touch.add("#cancel",{
        onTap : function(touchEvents){
            showMainControls();
        }
    });

    Touch.add("#crop",{
        onTap : function(touchEvents){
            selectionInfo.action = "crop";
            $("#controls").hide();
            $("#controls_ok").show();
            $("#selection").show();
            setSelection(150,100);
        }
    });

    Touch.add("#resize",{
        onTap : function(touchEvents){
            selectionInfo.action = "resize";
            $("#controls").hide();
            $("#controls_ok").show();
            $("#dialog_resize").show();

            var size=Math.max(canvas.width,canvas.height);
            setResize(size,size);
        }
    });

    Touch.add("#rotate",{
        onTap : function(touchEvents){
            rotate();
        }
    });


    Touch.add("#save",{
        onTap : function(touchEvents){
            saveImage(true)
        }
    });

    Touch.add("#saveas",{
        onTap : function(touchEvents){
            saveImage(false)
        }
    });

    Touch.add(".preset",{
        onTap : function(){
            var size = this.originalElm.innerHTML;
            if (size=="100%"){
                size=Math.max(canvas.width,canvas.height);
            }
            if (size=="50%"){
                size=Math.max(canvas.width/2,canvas.height/2);
            }
            setResize(size,size);
        }
    });
});

function init(){

    var file = getUrlParameter("f");
    var baseUrl = Api.getBaseUrl() + "file/";

    selection = $("#selection");
    var label = selection.find(".label");

    selectionInfo.target = selection;
    selectionInfo.label = label;



    if (file){

        var dot = file.lastIndexOf(".");
        imageFormat = file.substr(dot+1).toLowerCase();

        imageName = file.substr(0,dot);

        var img = new Image();
        img.onload = function(){

            canvas = document.getElementById('canvas');
            ctx = canvas.getContext('2d');

            canvas.width = this.width;
            canvas.height = this.height;

            ctx.drawImage(img, 0, 0);
            scaleCanvas();
            //ctx.fillStyle = "rgba(200, 0, 0, 0.5)";
            //ctx.fillRect(50, 50, 500, 500);


        };
        img.src = baseUrl + file;
    }




}

    function showMainControls(){
        $("#controls").show();
        $("#controls_ok").hide();
        $("#selection").hide();
        $("#dialog_resize").hide();
    }

function setSelection(w,h){
    selectionInfo.target.width(w  + "px");
    selectionInfo.target.height(h  + "px");

    selectionInfo.trueWidth = Math.round(w/canvasScale);
    selectionInfo.trueHeight = Math.round(h/canvasScale);
    selectionInfo.label.html(selectionInfo.trueWidth + " x " + selectionInfo.trueHeight);

}

    function setResize(width,height){

        var w = canvas.width;
        var h = canvas.height;

        var ratio = width/w;

        if (ratio*h>height) ratio = height/h;

        var w2 = Math.round(w * ratio);
        var h2 = Math.round(h * ratio);

        $("#width").val(w2);
        $("#height").val(h2);
    }

function scaleCanvas(){

    if (canvas){
        canvasScale = $(window).width() / canvas.width;
        canvasScale = Math.min($(window).height() / canvas.height,canvasScale);

        canvas.style.width = (canvas.width * canvasScale) + "px";
        canvas.style.height = (canvas.height * canvasScale) + "px";
    }
}

function crop(){
    var pos = $("#selection").position();

    var left = pos.left/canvasScale;
    var top = pos.top/canvasScale;
    var width = selectionInfo.trueWidth;
    var height = selectionInfo.trueHeight;

    var newCanvas = document.createElement("canvas");
    newCanvas.width = width;
    newCanvas.height = height;
    var destCtx = newCanvas.getContext('2d');

    destCtx.drawImage(canvas, left, top,width,height,0,0,width,height);

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(newCanvas, 0, 0);
    scaleCanvas();

    showMainControls();
}

function rotate(){
    var w = canvas.width;
    var h = canvas.height;

    var newCanvas = document.createElement("canvas");
    newCanvas.width = h;
    newCanvas.height = w;
    var destCtx = newCanvas.getContext('2d');

    destCtx.save();
    destCtx.translate(h/2,w/2);
    destCtx.rotate(90*Math.PI/180);
    destCtx.drawImage(canvas,-w/2,-h/2);
    destCtx.restore();

    canvas.width = h;
    canvas.height = w;
    ctx.drawImage(newCanvas, 0, 0);
    scaleCanvas();
}




    function resize(){
        var w =  $("#width").val();
        var h =  $("#height").val();

        if (w && h){
            var newCanvas = document.createElement("canvas");
            newCanvas.width = w;
            newCanvas.height = h;
            var destCtx = newCanvas.getContext('2d');

            destCtx.drawImage(canvas, 0, 0,canvas.width,canvas.height,0,0,w,h);

            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(newCanvas, 0, 0);
            scaleCanvas();
        }

        showMainControls();
    }


function saveImage(overwrite){

    var fileName = imageName + "."+ imageFormat;
    if (!overwrite) fileName = imageName + "_" + new Date().getTime() + "." + imageFormat;

    var format = imageFormat;
    if (format == "jpeg") format="jpg";

    var imageData;
    if (format == "png"){
        imageData = encodeURIComponent(canvas.toDataURL("image/png"));
    }else{
        var quality = 0.8; //(0.0 to 1.0)
        imageData = encodeURIComponent( canvas.toDataURL("image/jpeg",quality));
    }

    var data = "img=" + imageData;
    Api.post("image/save/" + fileName,data,function(result){
        console.log("result post");
        console.log(result);
        if (result.status == "ok"){
            if (opener && opener.onImageEditorUpdate){
                opener.onImageEditorUpdate();
            }
            window.close();
        }else{
            alert(result.status);
        }
    });
}

})();

