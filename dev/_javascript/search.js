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

/*global $, Config, sdata, History, Widgets */

var sakai = sakai || {};
sakai.search = function() {


	/////////////////
	// CONFIG VARS //
	/////////////////

	var mainSearch = false;
	var contactclicked = false;
	
	var peopleToSearch = 5;
	var cmToSearch = 5;
	var nrOfCharactersAroundTerm = 300;
	var sitesToSearch = 5;
	
	var foundPeople = false;
	var searchterm = "";


	/////////////
	// CSS IDs //
	/////////////
	
	var search = "#search";
	var searchConfig = {
		search : "#search",
		global : {
			resultTemp : search + "_result_temp",
			introductionText: "#introduction_text",
			button : search + "_button",
			text : ".search_content_main " + search + '_text',
			numberFound : search + '_numberFound',
			searchTerm : search + "_mysearchterm",
			searchBarSelectedClass : "search_bar_selected",
			pagerClass : ".jq_pager",
			messageClass : ".search_result_person_link_message",
			messageID : "search_result_person_link_message_",
			addToContactsLink : ".link_add_to_contacts",
			addToContactsDialog : '#add_to_contacts_dialog',
			sendmessageContainer : "#sendmessagecontainer",
			resultTitle : "#search_result_title"
		},
		people : {
			displayMore : "#display_more_people",
			displayMoreNumber : "#display_more_people_number",
			searchResult : "#people_search_result",
			searchResultTemplate : "people_search_result_template",
			header : "#people_header"
		},
		sites : {
			displayMore : "#display_more_sites",
			displayMoreNumber : "#display_more_sites_number",
			searchResult : "#sites_search_result",
			searchResultTemplate : "sites_search_result_template",
			header : "#sites_header"
		},
		cm : {
			displayMore : "#display_more_cm",
			displayMoreNumber : "#display_more_cm_number",
			searchResult : "#cm_search_result",
			searchResultTemplate : "cm_search_result_template",
			header : "#cm_header"
		},
		addFriend : {
			types : '#add_friend_types',
			typesList : 'add_friends_list_type',
			typesTemplate : "add_friend_types_template",
			displayNameClass : ".add_friend_displayname",
			profilePicture : "#add_friend_profilepicture",
			personalNote : "#add_friend_personal_note",
			personalNoteTemplate : "add_friend_personal_note_template",
			doInvite : "#add_friends_do_invite",
			form : "#add_friends_form",
			response: "#add_to_contacts_response",
			addToContacts : "#link_add_to_contacts_{USERID}",
			addToContactsDivider : "#link_add_to_contacts_{USERID}_divider",
			errors : {
				request : "#add_to_contacts_error_request",
				message : "#add_to_contacts_error_message",
				noTypeSelected : "#add_to_contacts_error_noTypeSelected"
			}
			
		},
		tabs : {
			all : "#tab_search_all",
			content : "#tab_search_content",
			people : "#tab_search_people",
			sites : "#tab_search_sites"
		}
	};


	///////////////
	// Functions //
	///////////////

	sakai._search.reset = function() {
		// Hide the blocks
		$(searchConfig.cm.header).hide();
		$(searchConfig.people.header).hide();
		$(searchConfig.sites.header).hide();
		$(searchConfig.global.resultTitle).hide();
		$(searchConfig.global.introductionText).show();
	};
	
	
	var showSearchContent = function() {
		// Set searching messages		
		$(searchConfig.global.searchTerm).text(searchterm);
		$(searchConfig.global.numberFound).text("0");
		
		$(searchConfig.cm.displayMoreNumber).text("0");
		$(searchConfig.people.displayMoreNumber).text("0");
		$(searchConfig.sites.displayMoreNumber).text("0");
		
		$(searchConfig.cm.searchResult).html($(searchConfig.global.resultTemp).html());
		$(searchConfig.people.searchResult).html($(searchConfig.global.resultTemp).html());
		$(searchConfig.sites.searchResult).html($(searchConfig.global.resultTemp).html());
		
		// show the blocks	
		$(searchConfig.cm.header).show();
		$(searchConfig.people.header).show();
		$(searchConfig.sites.header).show();
		
		$(searchConfig.global.introductionText).hide();
		$(searchConfig.cm.displayMore).hide();
		$(searchConfig.sites.displayMore).hide();
		$(searchConfig.people.displayMore).hide();
		
		$(searchConfig.global.resultTitle).show();
	};
	
	
	/**
	 * Adds a "historical event". This way the searchterm will be added in the url bar and the user can use his back and forward button.
	 * @param {Object} page Page you are on (for search_b this is always 1)
	 * @param {Object} searchquery The searchterm
	 */
	var doHSearch = function(page, searchquery) {
		History.addBEvent("1|" + encodeURIComponent($(searchConfig.global.text).val()));
	};
	
	
	/**
	 * This will render the results for the found content and media. It will add the nr of results to the total
	 * If nessecary it will show the link to dispolay more.
	 * @param {Object} results Response from the REST service.
	 */
	var renderCM = function(foundCM) {
		var finaljson = {};
		finaljson.items = [];
		
		var currentTotal = parseInt($(searchConfig.global.numberFound).text(), 10);
		currentTotal += foundCM.total;
		$(searchConfig.global.numberFound).text(currentTotal);
		
		if (foundCM.total > cmToSearch) {
			$(searchConfig.cm.displayMore).show();
			$(searchConfig.cm.displayMore).attr("href", "search_content.html#1|" + searchterm);
			$(searchConfig.cm.displayMoreNumber).text(foundCM.total);
		}
		
		if (foundCM && foundCM.results) {
			finaljson = mainSearch.prepareCMforRendering(foundCM.results, finaljson);
		}
		$(searchConfig.cm.searchResult).html($.Template.render(searchConfig.cm.searchResultTemplate, finaljson));
	};
	
	/**
	 * This will render the results for the found sites. It will add the nr of results to the total
	 * If nessecary it will show the link to dispolay more.
	 * @param {Object} results Response from the REST service.
	 */
	var renderSites = function(foundSites) {
	
		var finaljson = {};
		finaljson.items = [];
		
		var currentTotal = parseInt($(searchConfig.global.numberFound).text(), 10);
		currentTotal += foundSites.total;
		$(searchConfig.global.numberFound).text(currentTotal);
		
		if (foundSites.total > sitesToSearch) {
			$(searchConfig.sites.displayMore).show();
			$(searchConfig.sites.displayMore).attr("href", "search_sites.html#1|" + searchterm);
			$(searchConfig.sites.displayMoreNumber).text(foundSites.total);
		}
		
		if (foundSites && foundSites.results) {
			finaljson.items = foundSites.results;
		}
		
		$(searchConfig.sites.searchResult).html($.Template.render(searchConfig.sites.searchResultTemplate, finaljson));
	};
	
	
	/**
	 * This will render the results for the people. It will add the nr of results to the total
	 * If nessecary it will show the link to dispolay more.
	 * @param {Object} results Response from the REST service.
	 */
	var renderPeople = function(results) {
	
		var finaljson = {};
		finaljson.items = [];
		
		var currentTotal = parseInt($(searchConfig.global.numberFound).text(), 10);
		currentTotal += results.total;
		$(searchConfig.global.numberFound).text(currentTotal);
		
		if (results.total > peopleToSearch) {
			$(searchConfig.people.displayMore).show();
			$(searchConfig.people.displayMore).attr("href", "search_people.html#1|" + searchterm);
			$(searchConfig.people.displayMoreNumber).text(results.total);
		}
		
		if (results && results.results) {
			// Prepare the finaljson object for rendering
			finaljson = mainSearch.preparePeopleForRender(results.results, finaljson);
		}
		
		foundPeople = finaljson.items;
		
		$(searchConfig.people.searchResult).html($.Template.render(searchConfig.people.searchResultTemplate, finaljson));
	};
	
	
	
	 /**
	 * This function gets called everytime the page loads and a new searchterm is entered.
	 * It gets called by search_history.js
	 * @param {Integer} page The page you are on.
	 * @param {String} searchquery The searchterm you want to search trough.
	 */
	sakai._search.doSearch = function(page, searchquery) {
	
		// Check if the searchquery is empty
		if(searchquery === ""){
			
			// If there is nothing in the search query, remove the html and hide some divs
			$(".search_results_container").hide();
			$(searchConfig.global.resultTitle).hide();
			$(searchConfig.global.pagerClass).hide();
			return;
		}
		
		mainSearch.fillInElements(page, searchquery);
	
		// Get the search term out of the input box.
		// If we were redirected to this page it will be added previously already.
		searchterm = $(searchConfig.global.text).val().toLowerCase();
		
		// Rebind everything
		mainSearch.addEventListeners(searchterm);
		
		if (searchterm) {
			// Show and hide the correct elements.
			showSearchContent();

			// Convert spaces etc.
			
			var urlsearchterm = mainSearch.prepSearchTermForURL(searchterm);
			
			// Set off the 3 AJAX requests
			
			// Content & Media Search
			$.ajax({
				url: Config.URL.SEARCH_ALL_FILES,
				data: {
					"search" : urlsearchterm,
					"items" : cmToSearch
				},
				cache: false,
				success: function(data) {
					renderCM($.evalJSON(data));
				},
				error: function(status) {
					renderCM({});
				}
			});
			
			// People Search
			$.ajax({
				cache: false,
				url: Config.URL.SEARCH_SERVICE + "?page=0&items=" + peopleToSearch + "&username=" + urlsearchterm + "&s=sakai:firstName&s=sakai:lastName",
				cache: false,
				success: function(data) {
					renderPeople($.evalJSON(data));
				},
				error: function(status) {
					renderPeople({});
				}
			});
			
			// Sites search
			$.ajax({
				cache: false,
				url: "/var/search/sites?page=0&items=5&q=" + urlsearchterm,
				success: function(data) {
					var foundSites = $.evalJSON(data);
					renderSites(foundSites);
				},
				error: function(status) {
					renderSites({});
				}
			});
		}
		else {
			// There was no search term provided.
			// Reset the whole thing
			sakai._search.reset();			
		}
	};
	
	
	/**
	 * Will search for a user in the list of results we got from the server.
	 * @param {String} userid
	 * @return Will return the user object if something is found, false if nothing is found.
	 */
	var searchPerson = function(userid) {
		var person = false;
		for (var i = 0; i < foundPeople.length; i++) {
			if (foundPeople[i].userid[0] === userid) {
				person = foundPeople[i];
				break;
			}
		}
		return person;
	};
	
	
	////////////
	// EVENTS //
	////////////

	/** When a user wants to message another  user */
	$(searchConfig.global.messageClass).live("click", function() {
		var reg = new RegExp(searchConfig.global.messageID, "gi");
		var contactclicked = $(this).attr("id").replace(reg,"");
		var person = searchPerson(contactclicked);
		if (contactclicked) {
			$(searchConfig.global.sendmessageContainer).show();
			if (!person.uuid) {
				person.uuid = person.userid[0];
			}
			if (!person.hasOwnProperty("firstName") && !person.hasOwnProperty("lastName")) {
				person.firstName = person.uuid;
				person.lastName = "";
			}
			sakai.sendmessage.initialise(person, true);
		}
	});
	
	/** A user want to make a new friend */
	$(searchConfig.global.addToContactsLink).live("click", function(ev) {
		contactclicked = this.id.split("_")[4];
		sakai.addtocontacts.initialise(contactclicked, mainSearch.removeAddContactLinks);
	});


	/////////////////////////
	// Initialise Function //
	/////////////////////////

	var thisFunctionality = {
		"doHSearch" : doHSearch
	};
	
	var doInit = function() {	 
		mainSearch = sakai._search(searchConfig, thisFunctionality);
		// Make sure that we are still logged in.
		if (mainSearch.isLoggedIn()) {
			// Get my friends
			mainSearch.fetchMyFriends();
			// add the bindings
			mainSearch.addEventListeners();
		}		
	};
	doInit();	
};
sdata.container.registerForLoad("sakai.search");