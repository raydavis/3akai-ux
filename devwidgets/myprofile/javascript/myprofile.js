/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
/*global $, Config, jQuery, sakai, sdata */

var sakai = sakai || {};

sakai.myprofile = function (tuid, placement, showSettings) {


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////

	var rootel = $("#" + tuid);
	var me = sdata.me;
	var json = me.profile;

	
	//	IDs
	var myprofileId = "#myprofile";
	var myprofileClass = ".myprofile";
	
	var profileNameID = myprofileId + "_name";
	var profilePictureID = myprofileId + "_pic";
	var profileDepartementID = myprofileId + "_dept";
	
	var profileChatStatusID = myprofileId + "_chat_status_";
	var profileChatStatus = "chat_available_status_";
	var profileStatusContainer = myprofileId + "_status";
	var profileChatStatusClass = myprofileClass + "_chat_status";
	var profileChatStatusDropDownLink = myprofileClass + "_chat_status_dropdown_link";
	var profileChatStatusPicker = myprofileClass + "_chat_status_picker";
	var profileWidget = myprofileClass + "_widget";
	
	var availableStatus = "chat_available_status_";
	var availableStatus_online = availableStatus + "online";
	var availableStatus_busy = availableStatus + "busy";
	var availableStatus_offline = availableStatus + "offline";

	var headerChatUserId = "#userid";		//	The username in the chat bar.


	/////////////////
	// Chat status //
	/////////////////

	/**
	 * Add the right status css class on an element.
	 * @param {Object} element the jquery element you wish to add the class to
	 * @param {Object} status the status
	 */
	var updateChatStatusElement = function (element, status) {
		if (element){
			element.removeClass(availableStatus_online);
			element.removeClass(availableStatus_busy);
			element.removeClass(availableStatus_offline);
			element.addClass(availableStatus + status);	
		}
	};
	
	/**
	 * Update the chat statuses all across the page.
	 * @param {Object} status
	 */
	var updateChatStatus = function (status) {
		$(profileChatStatusClass).hide();
		$(profileChatStatusID + status).show();
		
		// Update the userid in the chat
		updateChatStatusElement($(headerChatUserId), status);
		updateChatStatusElement($(profileNameID), status);
		updateChatStatusElement($(".chat_available_name"), status);
	};
	
	/**
	 * Change the status of the currently logged in user.
	 * @param {Object} status
	 */
	var changeStatus = function (status) {
		$(profileStatusContainer).toggle();
		sdata.me.profile.chatstatus = status;
		
		var tosend = {
			"chatstatus" : status,
			"_charset_":"utf-8"
		};
		
		var url = "/system/userManager/user/" + sdata.me.user.userid + ".update.html";
		$.ajax({
	      	url : url,
        	type : "POST",
		data : tosend,
		success : function (data) {
				updateChatStatus(status);
			}
		});
	};
	
	
	//////////////////////////////
	// Initialisation Functions	//
	//////////////////////////////

	var doInit = function () {

		// Check if we have a first and last name
		if (json.firstName && json.lastName) {
			$(profileNameID, rootel).text(json.firstName + " " + json.lastName);
		} 
		else {
			$(profileNameID, rootel).text(me.user.userid);
		}
		
		// Do we have a picture
		if (json.picture) {
			var pict = $.evalJSON(json.picture);
			if (pict.name) {
				$(profilePictureID, rootel).attr('src', "/_user/public/" + sdata.me.user.userid + "/" + pict.name );
			}
		}
		
		// Any extra information we may have.
		var extra = "";
		if (json.basic) {
			var basic = $.evalJSON(json.basic);
			if (json.unirole) {
				extra = json.unirole;
			}
			else if (json.unicollege) {
				extra = json.unicollege;
			}
			else if (json.unidepartment) {
				extra = json.unidepartment;
			}
			$(profileDepartementID, rootel).html(extra);
		}

		// Get the user his chatstatus
		var chatstatus = "online";
		if (me.profile.chatstatus) {
			chatstatus = me.profile.chatstatus;
		}
		
		// Set the status in front of the user his name/
		$(profileNameID).addClass(profileChatStatus + chatstatus);
		$(profileChatStatusID + chatstatus).show();
		
		// Show the widget after everything is loaded
		$(profileWidget).show();
	};
	
	/**
	 * Update the position of the status box which is position:absolute
	 */
	var updateStatusContainerPosition = function(){
		$(profileStatusContainer).css("left", $(".profile_chat_status_dropdown_link").offset().left + 65 + "px");
		$(profileStatusContainer).css("top", $(".profile_chat_status_dropdown_link").offset().top + 30 + "px");
	};
	
	/**
	 * Hide the status pop-up
	 */
	var hideStatusContainer = function(){
		$(profileStatusContainer).hide();
	};
	
	/**
	 * Toggle the status pop-up
	 */
	var toggleStatusContainer = function(){
		updateStatusContainerPosition();
		$(profileStatusContainer).toggle();
	};


	////////////////////
	// Event Handlers //
	////////////////////

	// Toggle
	$(profileChatStatusDropDownLink).bind("click", function (ev) {
		toggleStatusContainer();
	});
	$(profileChatStatusClass).bind("click", function (ev) {
		toggleStatusContainer();
	});
	
	/**
	 * Bind the document on click event and check if it if you didn't click on the profile chatstatus link
	 */
	$(document).click(function(e){
		var $clicked = $(e.target);
		
		// Check if one of the parents is the chatstatuscontainer
		if(!$clicked.parents().is("#profile_chat_status")){
			hideStatusContainer();
		}
		
	});
	
	/**
	 * Bind the resize event
	 */
	$(window).resize(function(){
  		
		// If the box is visible, update the position of it
		if($(profileStatusContainer).is(":visible")){
			updateStatusContainerPosition();
		}
	});
	
	// A user selects his status
	$(profileChatStatusPicker).live("click", function (ev) {
		var statusChosen = this.id.split("_")[this.id.split("_").length - 1];
		changeStatus(statusChosen);
	});

	doInit();
};

sdata.widgets.WidgetLoader.informOnLoad("myprofile");