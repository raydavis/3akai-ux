/*
 * global jQuery, fluid, picker , myPicker 
 * myPicker used primarily for debug, should be pulled from global namespace
 */

var peoplePicker;

var sakai = sakai || {};

(function ($) {
    
    /**
     * Initializes the Infusion Uploader for the AddImages page.
     */
    var initPeoplePicker = function () {
        $("#picker").load("/apps/gnr3/ppkr/sakai-people-picker.html #sakai-people-picker-dialog", null, function () {
            peoplePicker = sakai.peoplePicker("#sakai-people-picker", {
                pickerDialog: {
                    type: "sakai.sakaiDialog",
                    options: {
                        autoOpen: true,
                        width: 560
                    }
                },
                dataURL:"/sites/" + sakai.site.currentsite.id + ".gnr3.groups.json",
                autoOpen: true,
                actions: {
                    postData: function (that) {
                        var groupName = that.locate("groupName").val();
                        var data = {
                            "members": that.currentSelection,
                            "name": groupName,
                            "sling:resourceType": "gnr3/group"
                        };
                        $.post("/sites/" + sakai.site.currentsite.id + ".gnr3.groups/", data, function(){
                            that.close();
                        });
                    }              
                }                           
            });  
        });
    };
    
    var initViewGroups = function () {
        $("#veiwer").load("/apps/gnr3/ppkr/group-viewer.html #group-viewer", null, function () {
            myGroupViewer = sakai.groupViewer("#group-viewer");
        });
    };
    
    var openPeoplePicker = function () {
        if (peoplePicker) {
            //myPicker.refreshData();
            peoplePicker.open();
            
        } else {
            initPeoplePicker();
        }
    }
    
    var openGroupViewer = function () {
        if (peoplePicker) {
            //myPicker.refreshData();
            myGroupViewer.open();
            
        } else {
            initViewGroups();
        }
    }

    sakai.peoplePicker.init = function () {
        $("#create_group").click(function () {
            openPeoplePicker();
        });
        
        $("#view_groups").click(function () {
            openGroupViewer();
        });
     };
    
    
})(jQuery);
