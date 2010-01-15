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

/*global $, Config, sakai, sdata, History, opensocial, Widgets */

/**
 * This is a widget that can be placed in other pages and widgets.
 * It shows an Add to contacts dialog.
 * All you have to do is provide a user object that contains:
 *  - first name
 *  - last name
 *  - uuid of the person you wish to add.
 *
 *  You can also set the personal note by using the setPersonalNote() method
 *  and select the type by using the setTypes().
 */
sakai.addtocontacts = function(tuid, placement, showSettings) {


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////

	// Help variables
	var me = sdata.me;
	var friend = false;
	var callbackWhenDone = false;
	var fadeOutTime = 1000; // The amount of time it takes to fade out the message and hide the layover.

	// CSS selectors
	var addToContacts = "#addtocontacts";
	var addToContactsClass = ".addtocontacts";
	
	var addToContactsAdd = addToContacts + "_add";
	var addToContactsDialog = addToContacts + "_dialog";
	var addToContactsDone = addToContacts + "_done";
	var addToContactsDoneContainer = addToContacts + "_done_container";
	
	// Form elements
	var addToContactsForm = addToContacts + "_form";
	var addToContactsFormButtonInvite = addToContactsForm + "_invite";
	var addToContactsFormPersonalNote = addToContactsForm + "_personalnote";
	var addToContactsFormPersonalNoteTemplate = addToContactsFormPersonalNote + "_template";
	var addToContactsFormType = addToContactsForm + "_type";
	var addToContactsFormTypeTemplate = addToContactsFormType + "_template";
	// Profile info
	var addToContactsInfoProfilePicture = addToContacts + "_profilepicture";
	var addToContactsInfoTypes = addToContacts + "_types";
	var addToContactsInfoDisplayName = addToContactsClass + "_displayname";
	
	// Error messages
	var addToContactsError = addToContacts + "_error";
	var addToContactsErrorMessage= addToContactsError + "_message";
	var addToContactsErrorRequest = addToContactsError + "_request";
	var addToContactsErrorNoTypeSelected = addToContactsError + "_noTypeSelected";
	
	var addToContactsResponse = addToContacts + "_response";
	
	///////////////////
	// Functionality //
	///////////////////
	
	/**
	 * Render the templates that are needed for the add contacts widget.
	 * It renders the contacts types and the personal note
	 */
	var renderTemplates = function() {
		$.Template.render(addToContactsFormTypeTemplate.replace(/#/gi, ''), Widgets, $(addToContactsInfoTypes));
		var json = {
			me: me
		};
		$.Template.render(addToContactsFormPersonalNoteTemplate.replace(/#/gi, ''), json, $(addToContactsFormPersonalNote));
	};
	
	/**
	 * This method will fill in the info for the user.
	 * @param {Object} user The JSON object containing the user info. This follows the /rest/me format.
	 */
	var fillInUserInfo = function(user) {
		if (user) {
			$(addToContactsInfoDisplayName).text(user.firstName);
			
			// Check for picture
			if (user.picture && $.evalJSON(user.picture).name) {
				$(addToContactsInfoProfilePicture).attr('src', "/_user/public/" + user.uuid + "/" + $.evalJSON(user.picture).name);
			}
			else {
				$(addToContactsInfoProfilePicture).attr('src', Config.URL.PERSON_ICON_URL);
			}
		}
	};
		
	/**
	 * When the user has been invited and a message has been sent. This function gets called
	 * This will show a message to the user and fadeout the overlay.
	 */
	var contactAdded = function() {
		$(addToContactsAdd).hide();
		$(addToContactsDoneContainer).show();
		$(addToContactsDone).fadeOut(fadeOutTime, function() {
			// We hide the layover first.
			// If the callback contains a function the layover won't be in the way and the user will be able to navigate to another page..
			$(addToContactsDialog).jqmHide();
			// If there is a callback function we execute it.
			if (callbackWhenDone) {
				callbackWhenDone(friend);
			}
		});
	};
	
	/**
	 * This will send a message to the specified user that he has received an invitation.
	 * @param {string} userid The userid to send the message to.
	 * @param {string} toSend The message that needs to be send to the friend.
	 */
	var sendMessage = function(userid, message, title) {
		var toSend = {
			"sakai:type": "internal",
			"sakai:sendstate": "pending",
			"sakai:messagebox": "outbox",
			"sakai:to": userid,
			"sakai:from": sdata.me.user.userid,
			"sakai:subject": title,
			"sakai:body":message,
			"sakai:category":"invitation",
			"_charset_":"utf-8"
		};
			
		$.ajax({
			url: "/_user/message.create.html",
			type: "POST",
			success: function(data) {
				//var json = $.evalJSON(data);
				//if (json.response === "OK") {
					// Everything went OK
					contactAdded();
				//}
				//else {
				//	$(addToContactsResponse).text($(addToContactsErrorMessage).text());
				//}
			},
			error: function(xhr, textStatus, thrownError) {
				
			},
			data: toSend
		});
	};
	
	
	/**
	 * This function looks up and retrieves relationship information from a set of pre-defined relationships
	 * @param {String} relationshipName
	 */
	var getDefinedRelationship = function(relationshipName) {
		for (var i = 0, j = Widgets.relationships.length; i<j; i++) {
			var definedRelationship = Widgets.relationships[i];
			if (definedRelationship.name === relationshipName) {
				return definedRelationship;
			}
		}
		return null;
	}
	
	/**
	 * Does the invitation stuff. Will send a request for an invitation and a message to the user.
	 * @param {String} userid
	 */
	var doInvite = function(userid) {
		var formValues = $.FormBinder.serialize($(addToContactsForm));
		var types = formValues[addToContactsFormType.replace(/#/gi, '')];
		$(addToContactsResponse).text("");
		if (types.length) {
			var fromRelationships = [];
			var toRelationships = [];
			for (var i = 0; i < types.length; i++) {
				var type = types[i];
				fromRelationships.push(type);
				var definedRelationship = getDefinedRelationship(type);
				if (definedRelationship && definedRelationship.inverse) {
					toRelationships.push(definedRelationship.inverse);
				} else {
					toRelationships.push(type);
				}
			}
			var toSend = {
				"fromRelationships" : fromRelationships,
				"toRelationships" : toRelationships,
				"_charset_":"utf-8"
			}
			var personalnote = formValues[addToContactsFormPersonalNote.replace(/#/gi, '')];
			
			// send message to other person
			var userstring = me.profile.firstName + " " + me.profile.lastName;
			
			var title = Config.Connections.Invitation.title.replace(/\$\{user\}/gi, userstring);
			var message = Config.Connections.Invitation.body.replace(/\$\{user\}/gi, userstring).replace(/\$\{comment\}/gi, personalnote);
			
			// Do the invite.
			$.ajax({
				url: "/_user/contacts/" + userid + ".invite.html",
				type: "POST",
				success: function(data) {
					sendMessage(userid, message, title);
				},
				error: function(xhr, textStatus, thrownError) {
					$(addToContactsResponse).text($(addToContactsErrorRequest).text());
				},
				data: toSend
			});
			
		}
		else {
			$(addToContactsResponse).text($(addToContactsErrorNoTypeSelected).text());
		}
	};
	
	///////////////////////
	// jqModal functions //
	///////////////////////
	
	/**
	 * This will load the overlay to add a new contact.
	 * This method will fill in all the user info.
	 * @param {Object} hash The layover object we get from jqModal
	 */
	var loadDialog = function(hash) {
		// Show the form
		$(addToContactsDoneContainer).hide();
		$(addToContactsAdd).show();
		
		hash.w.show();
	};	
	
	////////////////////
	// Public methods //
	////////////////////
	
	/**
	 * Set a personal note.
	 * @param {string} note The text you wish to display in the note.
	 */
	var setPersonalNote = function(note) {
		$(addToContactsFormPersonalNote).val(note);
	};
	
	
	/////////////////////////
	// Initialise function //
	/////////////////////////
	
	/**
	 * People should call this function if they want to initiate the widget
	 * @param {Object} user The userid or the /rest/me info for this user.
	 * @param {Function} user The callback function that will be executed after the request.
	 */
	sakai.addtocontacts.initialise = function(user, callback) {
		callbackWhenDone = callback;
		// Check if we have a JSON object or a userid String.
		if (!user.preferences) {
			// This is a uuid. Fetch the info from /rest/me
			$.ajax({
				url: "/_user/public/" + user + "/authprofile.json",
				success: function(data) {
					friend = $.evalJSON(data);
					friend.uuid = user;
					// Doing a rewrite of the me object, because Sling wraps arrays around
					// the different fields in the profile object
					if (typeof friend.firstName === "object"){
						friend.firstName = friend.firstName[0];
					}
					if (typeof sdata.me.profile.lastName === "object"){
						friend.lastName = friend.lastName[0];
					}
					if (typeof sdata.me.profile.email === "object"){
						friend.email = friend.email[0];
					}
					// We have the data, render it.
					fillInUserInfo(friend);
				}
			});
		}
		else {
			friend = user;
			friend.uuid = user.preferences.uuid;
			fillInUserInfo(friend);
		}
		
		// Render the templates
		renderTemplates();
		
		// Show the layover
		$(addToContactsDialog).jqmShow();
		
		// Give the user options to manipulate this widget.
		return {
			'setPersonalNote': setPersonalNote
		};
	};
	
	/////////////////////
	// Event listeners //
	/////////////////////
	
	// Bind the invite button
	$(addToContactsFormButtonInvite).bind('click', function() {
		// Invite this person.
		doInvite(friend.uuid);
	});
	
	// Bind the jqModal
	$(addToContactsDialog).jqm({
		modal: true,
		overlay: 20,
		toTop: true,
		onShow: loadDialog
	});
};

sdata.widgets.WidgetLoader.informOnLoad("addtocontacts");