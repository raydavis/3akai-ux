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

/*global $, Config, sdata, History, mainSearch, sakai */


sakai.search = function() {


	//////////////////////////
	//	Config variables	//
	//////////////////////////
	
	var resultsToDisplay = 10;
	var searchterm = "";
	var currentpage = 0;
	
	
	// CSS IDs
	var search = "#search";
	
	var searchConfig = {
		search : "#search",
		global : {
			button : search + "_button",
			text  :search + '_text',
			numberFound : search + '_numberFound',
			searchTerm : search + "_mysearchterm",
			searchBarSelectedClass : "search_bar_selected",
			pagerClass : ".jq_pager"
		},
		filters : {
			filter : search + "_filter",
			sites : {
				filterSites : search + "_filter_my_sites",
				filterSitesTemplate : "search_filter_my_sites_template",
				ids : { 
					entireCommunity : '#search_filter_community',
					allMySites : '#search_filter_all_my_sites',
					specificSite : '#search_filter_my_sites_'
				},
				values : {
					entireCommunity :'entire_community',
					allMySites : "all_my_sites"
				}
			}
		},
		tabs : {
			all : "#tab_search_all",
			content : "#tab_search_content",
			people : "#tab_search_people",
			sites : "#tab_search_sites"
		},
		results : {
			container : search + '_results_container',
			header : search + '_results_header',
			template : 'search_results_template'
		}
	};	


	///////////////
	// Functions //
	///////////////
	
	/**
	 * This method will show all the appropriate elements for when a search is executed.
	 */
	var showSearchContent = function() {
		$(searchConfig.global.searchTerm).text(searchterm);
		$(searchConfig.global.numberFound).text("0");
		$(searchConfig.results.header).show();
	};
		
	
	//////////////////////////
	// Search Functionality	//
	//////////////////////////
	
	/**
	 * Used to do a search. This will add the page and the searchterm to the url and add 
	 * it too the history without reloading the page. This way the user can navigate
	 * using the back and forward button.
	 * @param {Integer} page The page you are on (optional / default = 1.)
	 * @param {String} searchquery The searchterm you want to look for (optional / default = input box value.)
	 * @param {String} searchwhere The subset of sites you want to search in
	 */
	var doHSearch = function(page, searchquery, searchwhere) {
		if (!page) {
			page = 1;
		}
		if (!searchquery) {
			searchquery = $(searchConfig.global.text).val().toLowerCase();
		}
		if (!searchwhere) {
			searchwhere = mainSearch.getSearchWhereSites();
		}
		
		currentpage = page;
		// This will invoke the sakai._search.doSearch function and change the url.
		History.addBEvent("" + page + "|" + encodeURIComponent(searchquery) + "|" + searchwhere);
	};	
	
	/**
	 * When the pager gets clicked.
	 * @param {integer} pageclickednumber The page you want to go to.
	 */
	var pager_click_handler = function(pageclickednumber) {
		currentpage = pageclickednumber;

		// Redo the search
		doHSearch(currentpage, searchterm);
	};

	/**
	 * This will render all the results we have found.
	 * @param {Object} results The json object containing all the result info.
	 * @param {Boolean} success
	 */
	var renderResults = function(results, success) {
		var finaljson = {};
		finaljson.items = [];
			if (success) {

			// Adjust the number of sites we have found.
			$(searchConfig.global.numberFound).text(results.total);
			
			// Reset the pager.
			$(searchConfig.global.pagerClass).pager({
				pagenumber: currentpage,
				pagecount: Math.ceil(results.total / resultsToDisplay),
				buttonClickCallback: pager_click_handler
			});
			
			// If we have results we add them to the object.
			if (results && results.results) {
				finaljson.items = results.results;
				
				// If result is page content set up page path
				for (var i=0, j=finaljson.items.length; i<j; i++ ) {
					var full_path = finaljson.items[i]["path"];
					var site_path = finaljson.items[i]["site"]["path"];
					var page_path = site_path;
					if (finaljson.items[i]["type"] === "sakai/pagecontent") {
						page_path = site_path + "#" + full_path.substring((full_path.indexOf("/_pages/") + 8),full_path.lastIndexOf("/content"));
						
					}
					finaljson.items[i]["pagepath"] = page_path;
				}
			}
						
			// If we don't have any results or they are less then the number we should display 
			// we hide the pager
			if (results.size < resultsToDisplay) {
				$(searchConfig.global.pagerClass).hide();
			}
			else {
				$(searchConfig.global.pagerClass).show();
			}
		}
		else {
			$(searchConfig.global.pagerClass).hide();
		}

		// Render the results.
		$(searchConfig.results.container).html($.Template.render(searchConfig.results.template, finaljson));
		$(".search_results_container").show();
	};

	
	///////////////////////
	// _search Functions //
	///////////////////////
	
	/*
	 * These are functions that are defined in search_history.js .
	 * We override these with our own implementation.
	 */
	
	
	/**
	 * This function gets called everytime the page loads and a new searchterm is entered.
	 * It gets called by search_history.js
	 * @param {Integer} page The page you are on.
	 * @param {String} searchquery The searchterm you want to search trough.
	 * @param {string} searchwhere The subset of sites you want to search in.
	 *  * = entire community
	 *  mysites = the site the user is registered on
	 *  /a-site-of-mine = specific site from the user
	 */
	sakai._search.doSearch = function(page, searchquery, searchwhere) {
		
		currentpage = parseInt(page,  10);
		
		// Set all the input fields and paging correct.	
		mainSearch.fillInElements(page, searchquery, searchwhere);
		
		// Get the search term out of the input box.
		// If we were redirected to this page it will be added previously already.
		searchterm = $(searchConfig.global.text).val().toLowerCase();
		
		// Rebind everything
		mainSearch.addEventListeners(searchterm, searchwhere);
		
		if (searchterm) {

			// Show and hide the correct elements.
			showSearchContent();
			
			// Set off the AJAX request
			
			// sites Search
			var searchWhere = mainSearch.getSearchWhereSites();
			
			var urlsearchterm = "";
			var splitted = searchterm.split(" ");
			for (var i = 0; i < splitted.length; i++) {
				urlsearchterm += splitted[i] + "~" + " " + splitted[i] + "*" + " ";
			}
			
			$.ajax({
				url: Config.URL.SEARCH_CONTENT_COMPREHENSIVE + "?page=" + (currentpage - 1) + "&items=" + resultsToDisplay + "&q=" + urlsearchterm + "&sites=" + searchWhere,
				cache: false,
				success: function(data) {
					var json = $.evalJSON(data);
					renderResults(json, true);
				},
				onFail: function(status) {
					var json = {};
					renderResults(json, false);
				}
			});
			
		}
		else {
			sakai._search.reset();
		}
	};
	
	/**
	 * Will reset the view to standard.
	 */
	sakai._search.reset = function() {
		$(searchConfig.results.header).hide();
	};
	
	
	///////////////////
	// Init Function //
	///////////////////
	
	/**
	 * Will fetch the sites and add a new item to the history list.
	 */
	var doInit = function() {
		// Make sure that we are still logged in.
		if (mainSearch.isLoggedIn()) {
			// Get my sites
			mainSearch.getMySites();
			// Add the bindings
			mainSearch.addEventListeners();
		}
	};
	
	
	var thisFunctionality = {
		"doHSearch" : doHSearch
	};
	
	var mainSearch = sakai._search(searchConfig, thisFunctionality);
	
	doInit();
	
};

sdata.container.registerForLoad("sakai.search");