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

/*global $, Config, sdata */

var sakai = sakai || {};

/**
 * Initialize the helloworld widget
 * @param {String} tuid Unique id of the widget
 * @param {String} placement The place of the widget - usualy the location of the site
 * @param {Boolean} showSettings Show the settings of the widget or not
 */
sakai.helloworld = function(tuid,placement,showSettings){


    /////////////////////////////
    // Configuration variables //
    /////////////////////////////
	
	var defaultColor = "#000000";
	var saveLocation = "color.txt";
	
	// Dom identifiers	
	var rootel = $("#" + tuid);
	var settingsContainer = "#helloworld_settings";
	var viewContainer = "#helloworld_main";
	var colorPicker = "#helloworld_color";
	var usernameContainer = "#helloworld_username";
	var seaveHelloworld = "#helloworld_save";
		
	
    ////////////////////
    // Main functions //
    ////////////////////
	
	/**
	 * Shows the Hello world string in the right color
	 * @param {Object} color
	 */
	var showHelloWorld = function(color){
		$(viewContainer + " p", rootel).css("color",color);
		$(viewContainer, rootel).show();
	};


    ////////////////////////
    // Settings functions //
    ////////////////////////
	
	/**
	 * Selects the current color form the combobox
	 * @param {Object} color
	 */
	var selectCurrentColor = function(color){
		var select = $(colorPicker,rootel).get(0);
		var toSelect = 0;
		for (var i = 0; i < select.options.length; i++){
			var option = select.options[i];
			toSelect = option.value === color ? i : 0;
		}
		select.selectedIndex = toSelect;
	};
	
	
    ////////////////////
    // Event Handlers //
    ////////////////////
	
	/** Binds the helloworld save button*/
	$(seaveHelloworld).bind("click", function(ev){
		var select = $(colorPicker, rootel).get(0);
		var selected = select.options[select.selectedIndex].value;
		var saveUrl = Config.URL.SDATA_FETCH_BASIC_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid);
		sdata.widgets.WidgetPreference.save(saveUrl, saveLocation, selected, function(){
			sdata.container.informFinish(tuid, "helloworld");
		});
	});
	
	
    /////////////////////////////
    // Initialisation function //
    /////////////////////////////
	
	/**
	 * Retrieves the prefered color from JCR
	 * @param {Object} callback
	 */
	var getPreferedColor = function(callback){
		var url = Config.URL.SDATA_FETCH_URL.replace(/__PLACEMENT__/, placement).replace(/__TUID__/, tuid).replace(/__NAME__/, saveLocation);
		$.ajax({
			cache: false,
			url: url,
			success: function(data){
				callback(data);
			},
			error: function(xhr, textStatus, thrownError) {
				callback(defaultColor);
			}
		});
	};
	
	var doInit = function(){
		if (showSettings) {
			getPreferedColor(selectCurrentColor);
			$(settingsContainer, rootel).show();
		} else {
			var me = sdata.me;
			$(usernameContainer, rootel).text(me.profile.firstName);
			getPreferedColor(showHelloWorld);
		}
	};
	doInit();

};

sdata.widgets.WidgetLoader.informOnLoad("helloworld");