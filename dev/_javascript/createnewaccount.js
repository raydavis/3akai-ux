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


/*global Config, $, sdata, jcap */


var sakai = sakai || {};

sakai.newaccount = function(){
	
	
	/*global checkUserName */
	
	/////////////////////////////
	// Configuration variables //
	/////////////////////////////
	
	var defaultUserType = "default";
	
	// Links and labels
	var checkUserNameLink = "#checkUserName ";
	var buttonsContainer = ".create_account_button_bar";
	var successMessage = "#success_message";
	
	// Input fields
	var username = "username";
	var firstName = "firstname";
	var lastName = "lastname";
	var email = "email";
	var password = "password";
	var passwordRepeat = "password_repeat";
	var captcha = "uword";
	var usernameField = "#" + username;
	var firstnameField = "#" + firstName;
	var lastnameField = "#" + lastName;
	var emailField = "#" + email;
	var passwordField = "#" + password;
	var passwordRepeatField = "#" + passwordRepeat;
	var captchaField = "#" + captcha;
	
	// Error fields
	var usernameTaken = usernameField + "_taken";
	var usernameShort = usernameField + "_short";
	var usernameSpaces = usernameField + "_spaces";
	var usernameEmpty = usernameField + "_empty";
	var firstnameEmpty = firstnameField + "_empty";
	var lastnameEmpty = lastnameField + "_empty";
	var emailEmpty = emailField + "_empty";
	var emailInvalid = emailField + "_invalid";
	var passwordEmpty = emailField + "_empty";
	var passwordShort = passwordField + "_short";
	var passwordRepeatEmpty = passwordRepeatField + "_empty";
	var passwordRepeatNoMatch = passwordRepeatField + "_nomatch";
	var captchaEmpty = captchaField + "_empty";
	var captchaNoMatch = captchaField + "_nomatch";
	var errorFields = ".create_account_error_msg";
	var usernameLabel = "#username_label";
	var inputFields = ".create_account_input";
	var usernameAvailable = "#username_available";
	
	//CSS Classes
	var invalidFieldClass = "invalid";
	var formContainer = "#create_account_form";
	var inputFieldHoverClass = "input_field_hover";
	
	
	///////////////////////
	// Utility functions //
	///////////////////////
	
	/**
	 * Function that will check whether an email address is valid
	 * @param String email
	 *  The email address we want to check
	 * @return boolean
	 *  true:  the email address is valid. 
	 *  false: the email address is invalid.
	 */
	var echeck = function(email) {
		var at="@";
		var dot=".";
		var lat=email.indexOf(at);
		var lstr=email.length;
		var ldot=email.indexOf(dot);
		
		// Check whether there is an @ sign in the email address, whether the first letter
		// is an @ sign or whether the last character of the email address is an @ sign
		if (email.indexOf(at)===-1 || email.indexOf(at)===0 || email.indexOf(at)===lstr){
		   return false;
		}

		// Check whether there is a . sign in the email address, whether the first letter
		// is a . sign or whether the last character of the email address is a . sign
		if (email.indexOf(dot)===-1 || email.indexOf(dot)===0 || email.indexOf(dot)===lstr){
		    return false;
		}

		// Check whether there is only 1 @ sign
		if (email.indexOf(at,(lat+1))!==-1){
			return false;
		}

		// Check whether there is no . directly behind the @ sign
		if (email.substring(lat-1,lat)===dot || email.substring(lat+1,lat+2)===dot){
		    return false;
		}

		// Check whether there is a . sign behind the @ sign somewhere
		if (email.indexOf(dot,(lat+2))===-1){
		    return false;
		}
		
		// Check whether there are no spaces in the email address
		if (email.indexOf(" ")!==-1){
		    return false;
	 	}

 		return true;					
	};
	
	/**
	 * Function that will check whether a field is empty or contains spaces only
	 * @param String field
	 *  ID of the field we would like to check
	 * @return boolean
	 *  true:  the field is empty or contains spaces only
	 *  false: the field contains real input
	 */
	var checkEmpty = function(field){
		var value = $(field).val();
		if (!value || value.replace(/ /g,"") === ""){
			return true;
		} else {
			return false;
		}
	};
	
	/**
	 * Uses the FormBinder to get all of the values out of the form fields. This will return
	 * a JSON object where the keys are the names of all of the form fields, and the values are
	 * the values entered by the user in those fields.
	 */
	var getFormValues = function(){
		return $.FormBinder.serialize($(formContainer));
	};
	
	
	////////////////////
	// Error handling //
	////////////////////
	
	var resetErrorFields = function(){
		$("input").removeClass(invalidFieldClass);
		$(errorFields).hide();
		$(usernameAvailable).hide();
	};
	
	/**
	 * Function that will visually mark a form field as an
	 * invalid field.
	 * @param String field
	 *  JQuery selector of the input box we want to show as invalid
	 * @param String errorField
	 *  JQuery selector of the error message that needs to be shown.
	 * @param boolean noReset
	 *  Parameter that specifies whether we need to make all of the
	 *  fiels valid again first
	 */
	var setError = function(field,errorField, noReset){
		if (!noReset) {
			resetErrorFields();
		}
		$(field).addClass(invalidFieldClass);
		$(errorField).show();
	};
	
	
	///////////////////////
	// Creating the user //
	///////////////////////
	
	/*
	 * Function that will actually collect all of the values out of the form and
	 * will try to create the new user
	 */
	var doCreateUser = function(){
		
		var values = getFormValues();
		var data = {
			"firstName": values[firstName],
			"lastName": values[lastName],
			"email": values[email], 
			"pwd": values[password],
			"pwdConfirm": values[password],
			":name": values[username],
			"_charset_": "utf-8"};
		$.ajax ({
        	url : Config.URL.CREATE_USER_SERVICE,
        	type : "POST",
        	data : data,
        	success : function(data) {
				// This will hide the Create and Cancel button and offer a link back to the login page
				$(buttonsContainer).hide();
				$(successMessage).show();
			},
		error: function(xhr, textStatus, thrownError) {
				resetErrorFields();
			}
		});
		
	};
	
	/**
	 * Function that will take in a bunch of input fields and will check whether they
	 * are empty. For all of those that are empty, we'll set the appropriate visual warning
	 * @param Array fields
	 *  Array of input fields we want to check in the form of
	 *  [{id: "#field1", error: "#field1_error"},{id: "#field2", error: "#field2_error"},...]
	 */
	var checkAllFieldsForEmpty = function(fields){
		var totalEmpty = 0;
		for (var i = 0, j = fields.length; i < j; i++){
			if (checkEmpty(fields[i].id)){
				totalEmpty++;
				setError(fields[i].id,fields[i].error,true);	
			}
		}
		return totalEmpty;
	};
	
	/*
	 * Validate whether all of the fields have been filled out correctly
	 * (Empty, non matching fields, length, ...)
	 */
	var validateFields = function(){
		
		resetErrorFields();
		
		var fields = [{id: firstnameField, error: firstnameEmpty},{id: lastnameField, error: lastnameEmpty},{id: emailField, error: emailEmpty},
					  {id: usernameField, error: usernameEmpty},{id: passwordField, error: passwordEmpty},
					  {id: passwordRepeatField, error: passwordRepeatEmpty},{id: captchaField, error: captchaEmpty}];
		
		var totalEmpty = checkAllFieldsForEmpty(fields);
		// If totalEmpty is higher than 0, that means we have at least 1 field that is empty so we need to stop
		// executing the code.
		if (totalEmpty > 0){
			return false;
		}
		
		// Check whether the Captcha value entered is valid
		if (!jcap()){
			setError(captchaField, captchaNoMatch, true);
			return false;
		}
		
		// Check whether the entered email address has a valid format
		if (!echeck($(emailField).val())){
			setError(emailField, emailInvalid, true);
			return false;
		}
		
		// Check whether the length of the password is at least 4, which is the minimum expected by the backend
		var pass = $(passwordField).val();
		if (pass.length < 4){
			setError(passwordField, passwordShort, true);
			return false;
		}
		
		// Check whether the 2 entered passwords match
		var pass2 = $(passwordRepeatField).val();
		if (pass !== pass2){
			setError(passwordRepeatField, passwordRepeatNoMatch, true);
			return false;
		}
		
		// Everything is valid. Now go and check whether the username already exists in the system
		//if (!checkUserName()){
		//	return false;
		//}
		
		checkUserName();
		
		return false;
		
	};
	
	
	//////////////////////////////
	// Check username existence //
	//////////////////////////////
	
	/*
	 * Check whether the username (eid) is valid and then check
	 * whether the username already exists in the system. 
	 * checkingOnly will define whether we are just checking the existence,
	 * and don't want to do anything else afterwards if set to true. If set
	 * to false, it will start doing the actual creation of the user once
	 * the check has been completed.
	 */
	var checkUserName = function(checkingOnly){
		
		var values = getFormValues();
		var usernameEntered = values[username];
		// Check whether the username is an empty string or contains of spaces only
		if (checkEmpty(usernameField)){
			setError(usernameField,usernameEmpty);
			return false;
		}
		
		// Check whether the username contains spaces
		if (username.indexOf(" ") !== -1){
			setError(usernameField,usernameSpaces);
			return false;
		}
		
		// Check whether the length of the username is at least 3, which is the minimum length
		// required by the backend
		if (username.length < 3){
			setError(usernameField,usernameShort);
			return false;
		}
		
		// If we reach this point, we have a username in a valid format. We then go and check
		// on the server whether this eid is already taken or not. We expect a 200 if it already
		// exists and a 401 if it doesn't exist yet.
		$.ajax({
            // Replace the preliminary parameter in the service URL by the real username entered
            url: Config.URL.USER_EXISTENCE_SERVICE.replace(/__USERID__/g,values[username]),
			cache : false,
            success: function(data){
				setError(usernameField,usernameTaken);
			}, 
			error: function(xhr, textStatus, thrownError) {
				if (checkingOnly){
					resetErrorFields();
					$(usernameAvailable).show();
				} else {
					doCreateUser();
				}	
			}	
		});
		
		return false;
		
	};
	
	
	////////////////////
	// Event Handlers //
	////////////////////
	
	/*
	 * Once the user is trying to submit the form, we check whether all the fields have valid 
	 * input and try to create the new account
	 */
	//$("#save_account").bind("click", function(ev) {
	//		validateFields();
	//	});
	$("#create_account_form").submit(validateFields);
	
	
	/*
	 * If the Cancel button is clicked, we redirect them back to the login page
	 */
	$("#cancel_button").bind("click", function(ev){
		document.location = Config.URL.GATEWAY_URL;
	});
	
	$(checkUserNameLink).bind("click", function(){
		resetErrorFields();
		checkUserName(true);
	});
	
	
	// Hide error fields at start
	$(errorFields).hide();
	
	// Input field hover
	// The jQuery hover strangely has a bug in FF 3.5 - fast mouse movement doesn't fire the out event...
	//$(".create_account_input").hover(function(ev) { $(ev.target).addClass(inputFieldHoverClass); }, function(ev) { $(ev.target).removeClass(inputFieldHoverClass); });
	// so we use this for now:
	
	$(inputFields).bind("mouseover", function(ev) { $(ev.target).addClass(inputFieldHoverClass); });
	$(inputFields).bind("mouseout", function(ev) { $(ev.target).removeClass(inputFieldHoverClass); });
	
	// Hide success message
	$(successMessage).hide();
	
	// Hide username available message
	$(usernameAvailable).hide();
};

sdata.container.registerForLoad("sakai.newaccount");