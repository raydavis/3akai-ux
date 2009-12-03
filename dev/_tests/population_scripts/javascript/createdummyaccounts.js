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

var Config = Config || function(){ throw "Config file not available"; };
var $ = $ || function(){ throw "JQuery not available"; };
var sdata = sdata || function(){ throw "SData.js not available"; };
var json_parse = json_parse || function(){ throw "SData.js not available"; };
var jcap = jcap || function(){ throw "JCap (JavaScripts Captcha) is not available"; };

var sakai = sakai || {};

sakai.createdummyaccounts = function(){
	
	var userlist = [
		{"firstName": "First", "lastName": "User", "email": "first.user@sakai.com", "pwd": "test", "pwdConfirm": "test", ":name": "user1"},
		{"firstName": "Second", "lastName": "User", "email": "second.user@sakai.com", "pwd": "test", "pwdConfirm": "test", ":name": "user2"},
		{"firstName": "Third", "lastName": "User", "email": "third.user@sakai.com", "pwd": "test", "pwdConfirm": "test", ":name": "user3"},
		{"firstName": "Fourth", "lastName": "User", "email": "fourth.user@sakai.com", "pwd": "test", "pwdConfirm": "test", ":name": "user4"},
		{"firstName": "Fifth", "lastName": "User", "email": "fifth.user@sakai.com", "pwd": "test", "pwdConfirm": "test", ":name": "user5"}
	];

	var log = function(message, status){
		var cssclass = "";
		if(status){
			cssclass= "population_success";
		}else{
			cssclass = "population_error";
		}
		$("#log").append('<span class="' + cssclass+  '">' + message + "</span><br/>");
	};
	
	/**
	 * A recursive function that creates users from the userlist
	 * @param {Integer} count The current number of the user in the userlist array
	 */
	var createUsers = function(count){

		if(count !== userlist.length){
			var username = userlist[count].firstName + " " + userlist[count].lastName;
			
			$.ajax({
				url: "/system/userManager/user.create.json",
				type: "POST",
				data: userlist[count],
				success: function(data){
					log("Created " + username, true);
				},
				error: function(data){
					log("Failed to create " + username, false);
				},
				complete: function(){
					count++;
					createUsers(count);
				}
			});
		}
	};

	/**
	 * Add binding to the create dummy accounts button
	 * @param {Object} ev
	 */
	$("#create_accounts").bind("click", function(ev){
		$("#log").empty();
		
		createUsers(0);
	});
	
};

sdata.container.registerForLoad("sakai.createdummyaccounts");