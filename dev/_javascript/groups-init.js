/*
 * global jQuery, fluid, picker , myPicker 
 * myPicker used primarily for debug, should be pulled from global namespace
 */

var peoplePicker, myGroupViewer;

var sakai = sakai || {};

(function ($) {
    
    var initPeoplePicker = function () {
        $("#picker").load("/apps/gnr3/ppkr/sakai-people-picker.html #sakai-group-management", null, function () {
            peoplePicker = sakai.peoplePicker("#sakai-people-picker", {
                pickerDialog: {
                    type: "sakai.sakaiDialog",
                    options: {
                        autoOpen: false,
                        width: 580
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
            myGroupViewer = sakai.groupViewer("#group-viewer", {
                dataURL: "/sites/" + sakai.site.currentsite.id + ".gnr3.groups.json",
                dialog: {
                    type: "sakai.sakaiDialog",
                    options: {
                        title: "View All Groups",
                        autoOpen: false,
                        width: 300
                    }
                }
            }); 
        });
    };    
    

    sakai.peoplePicker.init = function () {
        initPeoplePicker();
        $("#create_group").click(function () {
            peoplePicker.open();
        });
        
        $("#view_groups").click(function () {
            //myPicker.refreshData();
            myGroupViewer.open();
        });
        
     };
    
    
})(jQuery);
