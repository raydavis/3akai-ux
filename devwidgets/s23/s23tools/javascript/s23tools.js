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

sakai.s23tools = function(tuid,placement,showSettings){


	/////////////////////////////
	// Configuration variables //
	/////////////////////////////

	var rootel = $("#" + tuid);

	// IDs
	var s23tools = "#s23tools";
	var s23toolsError = s23tools + "_error";
	var s23toolsErrorNotLoggedIn = $(s23toolsError + "_notloggedin");
	var s23toolsErrorNotools = $(s23toolsError + "_notools");
	var s23toolsErrorBadrequest = $(s23toolsError + "_badrequest");
	var s23toolsContainer = $(s23tools + "_container");

	// Templates
	var s23toolsContainerTemplate = "s23tools_container_template";


	///////////////////////
	// Utility functions //
	///////////////////////
	
	/**
	 * Takes a set of JSON and renders the sites.
	 * @param {Object} newjson
	 */
	var doRender = function(newjson){
		if (newjson === 403) {
			$(s23toolsContainer, rootel).html($(s23toolsErrorNotLoggedIn).html());
		}
		else if(!newjson || newjson === 404){
			$(s23toolsContainer, rootel).html($(s23toolsErrorNotools).html());
		}
		else if (!newjson.site || !newjson.site.pages || newjson.site.pages.length === 0){
			$(s23toolsContainer, rootel).html($(s23toolsErrorNotools).html());
		}
		else {
			$(s23toolsContainer, rootel).html($.Template.render(s23toolsContainerTemplate, newjson.site));
		}
	};

	/**
	 * Get the tools for a sakai2 site
	 * @param {String} siteId The id of the site you want to get content from
	 */
	var gets23tools = function(siteId) {
		$.ajax({
			url: Config.URL.SAKAI2_TOOLS_SERVICE.replace(/__SITEID__/, siteId),
			cache: false,
			success: function(data){
				doRender($.evalJSON(data));
			},
			error: function(status){
				doRender(status);
			}
		});
	};
	
	/**
	 * Log in or out of Sakai2
	 */
	var logSakai2 = function(inout){
		$.ajax({
			url: "/portal/"+inout,
			cache: false,
			success: function(data){
				location.reload(true);
			}
		});
	};
	
	/**
	 * Initialization
	 */
	var doInit = function() {
		gets23tools("62d2dada-9022-45bc-9438-b0548e08b1ec");
		
		$("#s23tools_login").live("click", function(e){
			e.preventDefault();
			logSakai2("login");
		});
		
		$("#s23tools_logout").live("click", function(e){
			e.preventDefault();
			logSakai2("logout");
		});
	};
	
	doInit();
};
sdata.widgets.WidgetLoader.informOnLoad("s23tools");