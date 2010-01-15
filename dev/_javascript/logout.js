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


/*global $, Config */

var sakai = sakai || {};

sakai.logout = function(){

	/*
	 * Will do a POST request to the logout service, which will cause the
	 * session to be destroyed. After this, we will redirect again to the
	 * login page. If the request fails, this is probably because of the fact
	 * that there is no current session. We can then just redirect to the login
	 * page again without notifying the user.
	 */
	$.ajax({
		url: Config.URL.LOGOUT_SERVICE,
		type: "POST",
		success: function(data){
			window.location = Config.URL.GATEWAY_URL;
		},
		error: function(xhr, textStatus, thrownError) {
			window.location = Config.URL.GATEWAY_URL;
		},
		data: {"sakaiauth:logout":"1","_charset_":"utf-8"}
	});
	
};

sdata.container.registerForLoad("sakai.logout");