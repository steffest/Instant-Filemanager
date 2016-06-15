var UI_DRAG_DROP = (function () {

    var self = {};

    self.init = function(){
        // init touch events
        Touch.add(".tag",{
            defaultDrag : true,
            snapBack : true,
            clone: true,
            dropZones: [".accepttag"],
            onDrop : function(touchEvents){
                if (touchEvents.dropZone) handleTagDrop(touchEvents);
            },
            onTap : function(me){
                FormBuilder.handeTagClick(me);
            }
        });

        Touch.add(".file",{
            defaultDrag : true,
            snapBack : true,
            clone: true,
            dropZones: [".filedirectory",".directory"],
            onDrag : function(touchEvents){
                var config = UI.getCurrentListViewConfig();
                if (config.selection && config.selection.length>1){
                    touchEvents.cloneElement.innerHTML = config.selection.length + " items";
                }
            },
            onDrop : function(touchEvents){
                console.error("file dropped");
                if (touchEvents.dropZone) handleFileDrop(touchEvents);
            }
        });

        Touch.add(".filedirectory",{
            defaultDrag : true,
            snapBack : true,
            clone: true,
            dropZones: [".filedirectory",".directory"],
            onDrop : function(touchEvents){
                console.error("directory dropped");
                if (touchEvents.dropZone) handleDirectoryDrop(touchEvents);
            }
        });
    };

    var handleTagDrop = function(touchEvents){
        var dragItem = touchEvents.originalElement || touchEvents.srcElement;
        var dragTarget = touchEvents.dropZone;

        //console.error(dragItem);

        if (dragItem && dragTarget){
            // tag was dropped
            var tag = dragItem.innerHTML.trim();
            if (dragTarget.classList.contains("file")){
                var config = UI.getCurrentListViewConfig();
                if (config.selection.length>1){
                    // tag was dropped on multiple files
                    FileSystem.addTagToMulti(tag,config.selection,function(){
                        if (UI.getDisplayOptions().showTags){
                            UI.refreshFileTags();
                        }
                    });
                }else{
                    // tag was dropped on file
                    var path = $(dragTarget).data("path");
                    FileSystem.addTag(tag,path,function(){
                        var currentFile = UI.getCurrentFile();
                        var displayOptions = UI.getDisplayOptions();
                        if (currentFile && currentFile.senderElm && currentFile.senderElm == dragTarget) UI.refreshCurrentFileDetail();
                        if (displayOptions.showTags){
                            // TODO: only update this single file ?
                            UI.refreshFileTags();
                        }
                    });
                }

            }
            if (dragTarget.classList.contains("record")){
                // tag was dropped on record
                var id = $(dragTarget).data("id");
                DataStore.addTag(tag,currentProfile,id)
            }
        }
    };

    var handleFileDrop = function(touchEvents){
        var dragItem = touchEvents.originalElement || touchEvents.srcElement;
        var dragTarget = touchEvents.dropZone;

        if (dragItem && dragTarget){
            // file was dropped
            var filepath = $(dragItem).data("path");
            var directorypath = $(dragTarget).data("path") || $(dragTarget).data("directory");

            var targetPath  = directorypath + FileSystem.getFileName(filepath);
            if (directorypath && filepath != targetPath){
                var config = UI.getCurrentListViewConfig();
                if (config.selection.length>1){
                    console.error("move " + config.selection.length + " files to " + directorypath);
                    FileSystem.moveFiles(config.selection,directorypath,function(){
                        UI.deselectFile();
                        UI.refreshCurrentDirectory();
                    });
                }else{
                    console.error("move " + filepath + " to " + targetPath);
                    FileSystem.moveFile(filepath,directorypath,function(){
                        UI.deselectFile();
                        UI.refreshCurrentDirectory();
                    });
                }

            }
        }
    };

    var handleDirectoryDrop = function(touchEvents){
        var dragItem = touchEvents.originalElement || touchEvents.srcElement;
        var dragTarget = touchEvents.dropZone;

        if (dragItem && dragTarget){
            // directory was dropped
            var filepath = $(dragItem).data("path");
            var directorypath = $(dragTarget).data("path") || $(dragTarget).data("directory");
            var targetPath  = directorypath + FileSystem.getFileName(filepath);

            if (filepath != directorypath && filepath != targetPath){
                console.error("move directory " + filepath + " to " + targetPath);
                FileSystem.moveFile(filepath,directorypath,function(){
                    UI.deselectFile();
                    UI.refreshCurrentDirectory();
                });
            }
        }
    };

    return self;
})();
