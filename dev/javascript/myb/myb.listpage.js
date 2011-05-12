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

/* global $, Config, opensocial */

require(["jquery","sakai/sakai.api.core", "myb/myb.api.core",
    "/dev/lib/myb/jquery/jquery-ui-tabs-min.js", "/dev/javascript/myb/myb.securepage.js"], function($, sakai, myb) {
	sakai_global.listpage = function(){
	    
	    
	    /*-------------------------------- Roman ------------------------------------------*/
	    /////////////////////////////
        // Configuration variables //
        /////////////////////////////
        
        /**
		 * Array of all the lists
		 */
		var allLists = {};
		
        /**
         * Dynamic list prefix
         */
        var DYNAMIC_LIST_PREFIX = "dl-";

		/**
		 * Whether the loaded trimpath template includes undergraduate students data
		 */
		var boolTemplateHasUndergradsData = false;
		
		/**
		 * Whether the loaded trimpath template includes graduate students data
		 */
		var boolTemplateHasGradsData = false;
		
		/**
		 * Flag that indicates whether we are editing an existing list or creation a new one
		 */
		var editExisting = false;
		
		/**
		 * Id of currently selected list (needed only for saving)
		 */
		var currentListIdForEditing;				
		
		/**
		 * Dynamic lists base URL (parent node in Sparse), delete this node to remove all dynamic lists for current user
		 */		
		var dynamicListsBaseUrl;
		
		/**
		 * Url for counting number of people targeted by a filter
		 */
		var dynamicListsPeopleCountingUrl = "/var/myberkeley/dynamiclists/g-ced-students.json";
		
		/**
		 * Needed to prevent unnecessary people counting requests when editing a new list
		 */
		var lastUsedFilterString = "";
				
		
		//////////////////////
        // jQuery selectors //
        //////////////////////
                		
		/**
		 * Section C wrapper DIV
		 */		
		var $sectionC = $("#section_c");
		
		/**
		 * Section C cohort staus wrapper DIV
		 */
		var $cohortStatus = $(".cohort_status", $sectionC);
		
		/**
		 * Designate term year from section C cohort status
		 */
		var $designateTermYear = $("#designate_term_year", $cohortStatus);
		
		/**
		 * Undergraduate students wrapper DIV (template must be loaded before using this variable)
		 */
		var $undergradsGroup;
		
		/**
		 * Graduate students wrapper DIV (template must be loaded before using this variable)
		 */
		var $gradsGroup;
		
		/**
		 * 'Include undergraduate students' checkbox (or hidden input when checkbox is not displayed)
		 */
		var $includeUndergradsCheckbox;

		/**
		 * 'Include graduate students' checkbox (or hidden input when checkbox is not displayed)
		 */
		var $includeGradsCheckbox;
        
        /**
         * Dynamic list 'Edit' button
         */
		var $dynListsEditButton = $("#dyn_lists_edit_button");
	  	
	  	/**
         * Dynamic list 'Copy' button
         */
	  	var $dynListsCopyButton = $("#dyn_lists_copy_button");
	  	
	  	/**
         * Dynamic list 'delete' button
         */
	  	var $dynListsDeleteButton = $("#dyn_lists_delete_button");
	  		  	
	  	/**
         * Dynamic list 'Back to Group Notification Manager' button
         */
	  	var $dynListsBackToNotifManagerButton = $("#dyn_lists_back_to_group_notification_manager_button");	 
	  	
	  	/**
         * Dynamic list 'Save' button
         */
	  	var $dynListsSaveButton = $("#dyn_lists_save_button");
	  		  	
	  	/**
         * Dynamic list 'Cancel' button (cancels editing and switches withe my to list mode)
         */
	  	var $dynListsCancelEditingButton = $("#dyn_lists_cancel_button");
	  	
	  	/**
	  	 * Dynamic list 'Create' button
	  	 */
	  	var $dynListsCreateButton = $("#dynamic_lists_create_new");
	  	
	  	/**
	  	 * Show more/less button in section C (template must be loaded before using this variable)
	  	 */
	  	var $showMoreOrLess;
	  	
	  	/**
	  	 * HTML div to diplay the number of users targeted by the current list
	  	 */
	  	var $studentsTargetedByCurrentList;
	  	
	    
	    //////////////////////////////////////////////////////////
        // Functions for manipulating boolean condition objects //
        //////////////////////////////////////////////////////////		
		
		/**
		 * Checks if the condition object can be converted from OR form to AND form.
		 * 
		 * @return {boolean}true if the condition object can be safely converted from OR form to AND form; otherwise returns {boolean}false. 
		 */
		var canConvertORtoAND = function(obj) {
			if(!obj.hasOwnProperty("OR")) return false;
			var len = obj.OR.length;
			return len === 1 || len === 0;
		}
		
		/**
		 * Checks if the condition object can be converted from AND form to OR form.
		 * 
		 * @return {boolean}true if the condition object can be safely converted from AND form to OR form; otherwise returns {boolean}false. 
		 */
		var canConvertANDtoOR = function(obj) {
			if(!obj.hasOwnProperty("AND")) return false;
			var len = obj.AND.length
			return len === 1 || len === 0;
		}
		
		/**
		 * Converts the condition object from OR form to AND form.
		 * The function doesn't do any checks before conversion.
		 * 
		 * @param {Object}	obj	object to convert
		 */
		var convertORtoAND = function(obj) {
			obj.AND = obj.OR;
			delete obj.OR;
		}
		
		/**
		 * Converts the condition object from AND form to OR form.
		 * The function doesn't do any checks before conversion.
		 * 
		 * @param {Object}	obj	object to convert
		 */
		var convertANDtoOR = function(obj) {
			obj.OR = obj.AND;
			delete obj.AND;
		}
		
		/**
		 * Checks if the condition object is empty, i.e. doesn't have AND or OR properties, or one of these properties contains an empty array
		 * 
		 * @return {boolean}true if the condition object is empty; otherwise returns {boolean}false. 
		 */
		var isConditionObjectEmpty = function(obj) {
			var objHasOwnPropertyAND = obj.hasOwnProperty("AND");
			var objHasOwnPropertyOR = obj.hasOwnProperty("OR");
			return (objHasOwnPropertyAND && obj.AND.length === 0) || (objHasOwnPropertyOR && obj.OR.length === 0) || (!objHasOwnPropertyAND && !objHasOwnPropertyOR);
		};
		
		/**
		 * Joins two condition objects by AND condition.
		 * This function tries to optimeze the output object to avoid excessive object wrapping.
		 * To avoid object clonning the function operates on its arguments, there is no guarantee that the arguments will remain unchanged.
		 * 
		 * @param {Object}	a	first condition object to join (must contain either AND or OR field)
		 * @param {Object}	b	second condition object to join (must contain either AND or OR field)
		 * 
		 * @return {Object} an object containing the first condition object joined by AND with the second condition object. 
		 */
		var joinTwoConditionsByAND = function(a, b) {
			
			var isAEmpty = isConditionObjectEmpty(a);
			var isBEmpty = isConditionObjectEmpty(b); 									
			
			if(isAEmpty && isBEmpty) {
				var emptyObj = {};
				return emptyObj;
			}
			
			if(isAEmpty) {
				// trying to join empty object 'a' with 'b', just return 'b' in this case
				return b;
			}
			
			if(isBEmpty) {
				// trying to join empty object 'b' with 'a', just return 'a' in this case
				return a;
			}
						
			
			if(canConvertORtoAND(a)) {
				convertORtoAND(a);
			} 
			
			if(canConvertORtoAND(b)){
				convertORtoAND(b);
			} 
			
			var aHasOwnPropertyAND = a.hasOwnProperty("AND");
			var aHasOwnPropertyOR = a.hasOwnProperty("OR");
			
			var bHasOwnPropertyAND = b.hasOwnProperty("AND");
			var bHasOwnPropertyOR = b.hasOwnProperty("OR");
			
			if(aHasOwnPropertyAND && bHasOwnPropertyAND) {
				// simple array merge will do
				a.AND = a.AND.concat(b.AND);
				return a;
			}
			
			if(aHasOwnPropertyAND && bHasOwnPropertyOR) {
				// add b as array element to a.AND array
				a.AND.push(b);
				return a;
			}
			
			if(aHasOwnPropertyOR && bHasOwnPropertyAND) {
				// add a as array element to b.AND array
				b.AND.unshift(a);
				return b;
			}
			
			if(aHasOwnPropertyOR && bHasOwnPropertyOR) {
				// Need to wrap everything into a new object here				
				var result = {AND: [a, b]};
				return result;
			}
			
			return a; //default, we shouldn't be here
		};
		
		/**
		 * Joins two condition objects by OR condition.
		 * This function tries to optimeze the output object to avoid excessive object wrapping.
		 * To avoid object clonning the function operates on its arguments, there is no guarantee that the arguments will remain unchanged.
		 * 
		 * @param {Object}	a	first condition object to join (must contain either AND or OR field)
		 * @param {Object}	b	second condition object to join (must contain either AND or OR field)
		 * 
		 * @return {Object} an object containing the first condition object joined by OR with the second condition object. 
		 */
		var joinTwoConditionsByOR = function(a, b) {
			
			var isAEmpty = isConditionObjectEmpty(a);
			var isBEmpty = isConditionObjectEmpty(b); 						
						
			if(isAEmpty && isBEmpty) {
				var emptyObj = {};
				return emptyObj;
			}
			
			if(isAEmpty) {
				// trying to join empty object 'a' with 'b', just return 'b' in this case
				return b;
			}
			
			if(isBEmpty) {
				// trying to join empty object 'b' with 'a', just return 'a' in this case
				return a;
			}
			
			
			if(canConvertANDtoOR(a)) {
				convertANDtoOR(a);
			}
			
			if(canConvertANDtoOR(b)){
				convertANDtoOR(b);
			}
			
			var aHasOwnPropertyAND = a.hasOwnProperty("AND");
			var aHasOwnPropertyOR = a.hasOwnProperty("OR");
			
			var bHasOwnPropertyAND = b.hasOwnProperty("AND");
			var bHasOwnPropertyOR = b.hasOwnProperty("OR");
			
			if(aHasOwnPropertyOR && bHasOwnPropertyOR) {
				// simple array merge will do
				a.OR = a.OR.concat(b.OR);
				return a;
			}
			
			if(aHasOwnPropertyOR && bHasOwnPropertyAND) {
				// add b as array element to a.OR array
				a.OR.push(b);
				return a;
			}
			
			if(aHasOwnPropertyAND && bHasOwnPropertyOR) {
				// add a as array element to b.OR array
				b.OR.unshift(a);
				return b;
			}
			
			if(aHasOwnPropertyAND && bHasOwnPropertyAND) {
				// Need to wrap everything into a new object here				
				var result = {OR: [a, b]};
				return result;
			}
			
			return a; //default, we shouldn't be here
			
		};
		
		
		
		
		////////////////////////////////////////////////////////////////////////
        // Functions for gathering the information about the selected options //
        ////////////////////////////////////////////////////////////////////////		
		
		/**
		 * Gathers all selected options in the selected element group and returns them as an OR condition object.
		 * 
		 * @param {JQuery}	$allItemsOption	an option that represents all items, can be null if there is no such option
		 * @param {JQuery}	$rootGroup	element group in which to search for selected options
		 * 
		 * @return {Object} an OR condition object containing all selected options in the selected element group.
		 */
		var buildSelectedOptionsObjectAsOR = function($allItemsOption, $rootGroup) {

			var selectedOptions = {OR: []};
						
			if ($allItemsOption !== null && $allItemsOption.is(':checked')) {
				
				var allItemsOptionValue = $allItemsOption.val();
				if (allItemsOptionValue !== "") {
					selectedOptions.OR.push(allItemsOptionValue);
				}
				
			} else {
			
				var $selectedOptions = $("input:checkbox:checked", $rootGroup);

				$selectedOptions.each(function(i, curOption) {
						selectedOptions.OR.push(curOption.value);
				});
			}
			
			return selectedOptions;
		};
			
		/**
		 * Gathers infomation about the cohort status and returns it as an object.
		 * Returned information includes: semester, year and cohort.
		 * 
		 * @return {Object} A condition object containing the information about the cohort status in the AND field. Return value can be null if nothing is selected. 
		 */
		var buildCohortStatusObject = function() {
			
			var result = {};
			
        	if ($("#cohort_status_specified_students", $sectionC).is(':checked')) {
        		var semester = $("#designate_term_semester", $cohortStatus).val();
        		var year = $("#designate_term_year", $cohortStatus).val();
        		var cohort = $("input[name=cohort_status_terms]:checked", $cohortStatus).val();
        		
        		result = {
					AND: [semester, "designate_term_year_" + year, cohort]
				};				
        	}
        	
        	return result;        	
		};
		
		/**
		 * Gathers infomation about the registration status and returns it as an object.
		 *  
		 * @return {Object} A condition object containing the information about the registration status.  
		 */
		var buildRegistrationStatusObject = function() {
			
			var registrationStatus = {};
			
			if($("#reg_status_only_designated_statuses", $sectionC).is(':checked')) {						
				
				var selectedRegisteredOR = buildSelectedOptionsObjectAsOR(null, $(".reg_status .sub_group", $sectionC));
				var selectedCurrencyOR = buildSelectedOptionsObjectAsOR(null, $(".current_or_not .sub_group", $sectionC));
				var selectedWithdrawnOR = buildSelectedOptionsObjectAsOR(null, $(".student_reg_status .sub_group", $sectionC));
				
				registrationStatus = joinTwoConditionsByAND(registrationStatus, selectedRegisteredOR);
				registrationStatus = joinTwoConditionsByAND(registrationStatus, selectedCurrencyOR);
				registrationStatus = joinTwoConditionsByAND(registrationStatus, selectedWithdrawnOR);
			}	
			
			return registrationStatus;			
		};
		
		/**
		 * Gathers all undergraduates related information and returns it as an object.
		 * Returned information includes: undergraduate majors, levels, 'admitted as' status and 'declared' status. 
		 * 
		 * @return {Object} A condition object containing all undergraduates related information in the AND field.
		 */
		var buildUndergradsObjectAsAND = function() {

			var undergrads = {};
			
			var selectedUndergradMajorsOR = buildSelectedOptionsObjectAsOR(null, $(".majors"));
			var selectedLevelsOR = buildSelectedOptionsObjectAsOR(null, $(".levels"));
			var selectedAdmittedAsOR = buildSelectedOptionsObjectAsOR(null, $(".admittedAs"));
			var selectedDeclaredOR = buildSelectedOptionsObjectAsOR(null, $(".declared"));

			undergrads = joinTwoConditionsByAND(undergrads, selectedUndergradMajorsOR);											
			undergrads = joinTwoConditionsByAND(undergrads, selectedLevelsOR);
			undergrads = joinTwoConditionsByAND(undergrads, selectedAdmittedAsOR);
			undergrads = joinTwoConditionsByAND(undergrads, selectedDeclaredOR);						
			
			return undergrads;	
		};
		
		/**
		 * Gathers all graduate students related information and returns it as an object.
		 * Returned information includes: graduate programs, certificates, emphases, degrees. 
		 * 
		 * @return {Object} A condition object containing all graduate students related information in the AND field.
		 */
		var buildGradsObjectAsAND = function() {

			var grads = {};
			
			var selectedGradProgramsOR = buildSelectedOptionsObjectAsOR(null, $(".programs"));
			var selectedCertificatesOR = buildSelectedOptionsObjectAsOR(null, $(".certificates"));
			var selectedEmphasesOR = buildSelectedOptionsObjectAsOR(null, $(".emphases"));
			var selectedDegreesOR = buildSelectedOptionsObjectAsOR(null, $(".degrees"));
						
			grads = joinTwoConditionsByAND(grads, selectedGradProgramsOR);
			grads = joinTwoConditionsByAND(grads, selectedCertificatesOR);			
			grads = joinTwoConditionsByAND(grads, selectedEmphasesOR);
			grads = joinTwoConditionsByAND(grads, selectedDegreesOR);
						
			return grads;	
		};
		
		
		/**
		 * Gathers all selected options for both undergraduate and graduate students (if available).
		 * Returns these options as an appropriate condition object.
		 * 
		 * @return {Object} a condition object containing all selected options for undergraduate and graduate students.
		 */		
		var buildUndergraduatesAndGraduatesResultingObject = function (){
			
			var boolIncludeUndergrads = false;
			var boolIncludeGrads = false;  
			
			if(boolTemplateHasUndergradsData && boolTemplateHasGradsData) {
				// If the both checkboxes are available, need to check their statuses
				boolIncludeUndergrads = $includeUndergradsCheckbox.length > 0 && $includeUndergradsCheckbox.is(":checked");
				boolIncludeGrads = $includeGradsCheckbox.length > 0 && $includeGradsCheckbox.is(":checked");
								
			} else {
				if(boolTemplateHasUndergradsData) {
					// Only undergrads are available, no checkbox
					boolIncludeUndergrads = true;
				} else if(boolTemplateHasGradsData) {
					// Only grads are available, no checkbox
					boolIncludeGrads = true;
				}
			}
			
			
			// For undergrads
			var undergrads = {};			
			
			if (boolIncludeUndergrads) {
				undergrads = buildUndergradsObjectAsAND();
				if(isConditionObjectEmpty(undergrads)) {
					undergrads ={OR: [$includeUndergradsCheckbox.val()]};
				}				
			}
			
			
			// For grads
			var grads = {};
			
			if (boolIncludeGrads) {
				grads = buildGradsObjectAsAND();
				if(isConditionObjectEmpty(grads)) {
					grads ={OR: [$includeGradsCheckbox.val()]};
				}
								
			}
			
			var result = {};
									
			if (boolIncludeUndergrads && boolIncludeGrads) {
				
				result = joinTwoConditionsByOR(undergrads, grads);
																								
			} else if (boolIncludeUndergrads) {
				
				result = undergrads;								
				
			} else if (boolIncludeGrads) {
				
				result = grads;												
			}
			
			return result;
		};
		
		//////////////////////////
		// UI related functions //
		//////////////////////////
		
		/**
		 * Enables all graduate students section of the form programmatically.
		 * Must be called AFTER loading template.
		 */		
		var enableGradsSection = function() {
			$includeGradsCheckbox.attr("checked", "checked");
			$("input", $gradsGroup).removeAttr("disabled");						
			$gradsGroup.removeClass("disabled");
		};
		
		/**
		 * Enables all undergraduate students section of the form programmatically.
		 * Must be called AFTER loading template.
		 */		
		var enableUndergradsSection = function() {
			$includeUndergradsCheckbox.attr("checked", "checked");
			$("input", $undergradsGroup).removeAttr("disabled");						
			$undergradsGroup.removeClass("disabled");
		};
		
		/**
		 * Populates designate term Year listbox in the section C with the last 5 year numbers.
		 * Current year becomes the default choice. 
		 */
		var populateDesignateTermYear = function() {
			
			var d = new Date();
			var curr_year = d.getFullYear();
			var yearsArr = [];
			for(var i = curr_year-4;i <= curr_year; i++) {
				if (i != curr_year) {
					yearsArr.push("<option value='" + i + "'>" + i + "</option>");
				}
				else {
					yearsArr.push("<option value='" + i + "' selected='selected'>" + i + "</option>");
				}				
			}
			$designateTermYear.append(yearsArr.join(''));
		};
	    
	    var hideSectionC = function() {
	    	$showMoreOrLess.text("Show Less");
	    	$sectionC.hide();
	    };
	    
	    var toggleSectionC = function () {
				
			if($sectionC.is(":visible")) {
				hideSectionC();					
			} else {
				$showMoreOrLess.text("Show Less");
				$sectionC.show();					
			}						
		};
	    
	    
		
		
	    /**
	     * Resets the editing form UI (checkboxes and CSS styles)
	     * Must be called AFTER loading template.
	     */
	    var resetListEditingFormCheckboxesAndStyles = function() {
	    	
	    	
	    	lastUsedFilterString = "";
	    	$studentsTargetedByCurrentList.text("0");
	    		    	
	    	hideSectionC();
	    	
	    	// reset all checkboxes
	    	$("input:checkbox:checked", $("#create_new_list")).removeAttr("checked");
	    	
	    	$("#list_name").val("");
	    	$("#description").val("");
	    	$undergradsGroup.addClass("disabled");
			$gradsGroup.addClass("disabled");
								
			$("input", $gradsGroup).attr("disabled", "disabled");				
			$("input", $undergradsGroup).attr("disabled", "disabled");
			
			// section c
			$("#reg_status_include_all", $sectionC).attr("checked", "checked");
			$("#cohort_status_all_students", $sectionC).attr("checked", "checked");
			$("#cohort_status_term_before", $sectionC).attr("checked", "checked");

			$("#designate_term_semester option:first", $sectionC).attr("selected", "selected");
			$("#designate_term_year option:last", $sectionC).attr("selected", "selected");
			


			$("#special_program_all_students", $sectionC).attr("checked", "checked");
			$("#student_status_all_students", $sectionC).attr("checked", "checked");
			$("#residency_status_all_students", $sectionC).attr("checked", "checked");
			
	    };
		
		var getNumberOfPeopleSelectedByFilter = function(filterString) {
			
			if(lastUsedFilterString === filterString) {
				 return;
			}
			
			lastUsedFilterString = filterString;
				
			var parameters = {criteria: filterString};
	        sakai.api.Server.loadJSON(dynamicListsPeopleCountingUrl, function(success, data){	            	            
	            if (success) {	               
	                $studentsTargetedByCurrentList.text(data.count);
	                //alert("Success: "+data.count);
	                renderLists(data.lists);
	            } else {
	                $studentsTargetedByCurrentList.text("N/A");
	            }
	        }, parameters);
	    
			
			//curl -g -u admin:admin "http://localhost:8080/var/myberkeley/dynamiclists/g-ced-students.json?criteria="
		};
		
		///////////////////////////////////////////////////////////////
        // Functions for loading the information from a dynamic list //
        ///////////////////////////////////////////////////////////////		

		var dumpOptionIDs = function(filterObj, idArray) {
			
			if(filterObj === null || idArray === null) {
				return;
			}
			
			var conditionArray;
			if (filterObj.hasOwnProperty("AND")) {
				conditionArray = filterObj.AND;
			} else if (filterObj.hasOwnProperty("OR")) {
				conditionArray = filterObj.OR;
			} else {
				// empty object
				return;
			}
			
			
			for (var i=0; i < conditionArray.length; i++) {
				var arrayElement = conditionArray[i];
				if(jQuery.type(arrayElement) === "string") {
					idArray.push(conditionArray[i]);
				} else {
					// assuming the object is a container
					dumpOptionIDs(arrayElement, idArray);
				}
			};
						
		};
				
		var getNumberOfOptionsInGroup = function($groupRoot) {
			 return $("input:checkbox", $groupRoot).length;
		};
		
		var getNumberOfSelectedOptionsInGroup = function($groupRoot) {
			 return $("input:checkbox:checked", $groupRoot).length;
		};
		
		var isSomethingSelectedInUndergradsSection = function () {			
			return getNumberOfSelectedOptionsInGroup($undergradsGroup) > 0;
		};
		
		var isSomethingSelectedInGradsSection = function () {
			return getNumberOfSelectedOptionsInGroup($gradsGroup) > 0;			
		};
				
		var isSomethingSelectedInRegistrationStatusSection = function () {
			var totalOptionsSelected = getNumberOfSelectedOptionsInGroup($(".reg_status .sub_group", $sectionC)) +
			getNumberOfSelectedOptionsInGroup($(".current_or_not .sub_group", $sectionC)) +
			getNumberOfSelectedOptionsInGroup($(".student_reg_status .sub_group", $sectionC));

			return totalOptionsSelected	> 0;			
		};
		
		var isSomethingSelectedInSpecialProgramsSection = function () {
			return getNumberOfSelectedOptionsInGroup($(".special_programs .sub_group", $sectionC)) > 0; 
		};
		
		var isSomethingSelectedInStudentStatusSection = function () {
			return getNumberOfSelectedOptionsInGroup($(".student_and_residency_status_col_left .sub_group", $sectionC)) > 0; 
		};
		
		var isSomethingSelectedInResidencyStatusSection = function () {
			return getNumberOfSelectedOptionsInGroup($(".student_and_residency_status_col_right .sub_group", $sectionC)) > 0; 
		};
				
		var areAllOptionsInGroupSelected = function ($groupRoot) {
			 var numberOfOptions = getNumberOfOptionsInGroup($groupRoot);
			 var numeberOfSelectedOptions = getNumberOfSelectedOptionsInGroup($groupRoot);
			 
			 return numeberOfSelectedOptions > 0 && numberOfOptions === numeberOfSelectedOptions;    
		};
		
		
	    /*-------------------------------- Roman ------------------------------------------*/
	    
	    



	
	
	    /**
	     *
	     * CSS IDs
	     *
	     */
	    var inboxID = "#inbox";
	    var inboxClass = ".inbox";
	    var inbox = "inbox";
	    var inboxArrow = inboxClass + "_arrow";
	    var inboxTable = inboxID + "_table";
	    var inboxTablePreloader = inboxTable + "_preloader";
	    var inboxGeneralMessage = inboxID + "_general_message";
	    var inboxMessageError = inbox + "_error_message";
	
	    /**
	     * This will show the preloader.
	     */
	    var showLoader = function(){
	        $(inboxTable).append(sakai.api.Util.TemplateRenderer(inboxTablePreloader.substring(1), {}));
	    };
	    
	    /**
	     * Shows a general message on the top screen
	     * @param {String} msg    the message you want to display
	     * @param {Boolean} isError    true for error (red block)/false for normal message(green block)
	     */
	    var showGeneralMessage = function(msg, isError){
	    
	        // Check whether to show an error type message or an information one
	        var type = isError ? sakai.api.Util.notification.type.ERROR : sakai.api.Util.notification.type.INFORMATION;
	        
	        // Show the message to the user
	        sakai.api.Util.notification.show("", msg, type);
	        
	    };
	    	    
	    var getNumberOfSelectedLists = function() {
	   	 return $(".inbox_inbox_check_list:checked").length;
	   	};
	  
	  	var updateEditCopyDeleteButtonsStatus = function() {
	  		var num = getNumberOfSelectedLists();
	  		if(num === 0) {
		  		$dynListsEditButton.attr('disabled', 'disabled');
	  			$dynListsCopyButton.attr('disabled', 'disabled');
	  			$dynListsDeleteButton.attr('disabled', 'disabled');	  			
	  		} else if(num === 1){
		  		$dynListsEditButton.removeAttr('disabled');
	  			$dynListsCopyButton.removeAttr('disabled');
	  			$dynListsDeleteButton.removeAttr('disabled');	  			
	  		} else if(num > 1){
		  		$dynListsEditButton.attr('disabled', 'disabled');
	  			$dynListsCopyButton.attr('disabled', 'disabled');
	  			$dynListsDeleteButton.removeAttr('disabled');
	  		}
	  	};
	    
	    
	    /**
	     * Check or uncheck all messages depending on the top checkbox.
	     */
	    var tickMessages = function(){
	        $(".inbox_inbox_check_list").attr("checked", ($("#inbox_inbox_checkAll").is(":checked") ? "checked" : ''));
	        updateEditCopyDeleteButtonsStatus();
	    };
	    
	    
	    var buildFilterStringFromListEditingForm = function() {
			var dynamicListFilter = buildUndergraduatesAndGraduatesResultingObject();
			
			// Section C

			var registrationStatus = buildRegistrationStatusObject();
			dynamicListFilter = joinTwoConditionsByAND(dynamicListFilter, registrationStatus);
			

			var cohortStatus = buildCohortStatusObject();						
			dynamicListFilter = joinTwoConditionsByAND(dynamicListFilter, cohortStatus);
			
			
			var specialPrograms = buildSelectedOptionsObjectAsOR($("#special_program_all_students", $sectionC), $(".special_programs", $sectionC));			
			dynamicListFilter = joinTwoConditionsByAND(dynamicListFilter, specialPrograms);
			
			var studentStatus = buildSelectedOptionsObjectAsOR($("#student_status_all_students", $sectionC), $(".student_and_residency_status_col_left .sub_group", $sectionC));			
			dynamicListFilter = joinTwoConditionsByAND(dynamicListFilter, studentStatus);
			
			var residencyStatus = buildSelectedOptionsObjectAsOR($("#residency_status_all_students", $sectionC), $(".student_and_residency_status_col_right .sub_group", $sectionC));			
			dynamicListFilter = joinTwoConditionsByAND(dynamicListFilter, residencyStatus);
			
	        return $.toJSON(dynamicListFilter);	    	
	    };
	    
	    var getDataFromInput = function() {
	        var result = {};
			
			result.context = "g-ced-students";
	        result.listName = $.trim($("#list_name").val());
			if(result.listName === null || result.listName === "") {
				$("#invalid_name").show();
				return -1;
			}
	        result.desc = $.trim($("#description").val());
	        
	        // NOT SUPPORTED FOR POC
	        // result.size = $("#list_size").val();
	        
			// Gathering the data on standing
			//TODO: check for errors
			/*if($("#undergrad:checked").val() === null && $("#grad:checked").val() === null) {
				$("#invalid_major").show();
					return -1;
			}*/
									
	        result.filter = buildFilterStringFromListEditingForm();
	        
	        return result;
	    }
	    
	    // NOT SUPPORTED FOR POC
	    /**
	     * Updates the input field that displays the current size of the list being created
	     */
	    sakai_global.listpage.updateListSize = function(){
	        var data = getDataFromInput();
			if(data < 0) {
				alert("Error");
			}
	        
	        // STILL NEEDS TO BE IMPLEMENTED
	        // var size = query(selectedContext, selectedMajor, selectedStanding);
	        // document.createListForm.list_size.value = size;
	    };
	    	    
	    /**
	     * Removes all the messages out of the DOM.
	     * It will also remove the preloader in the table.
	     */
	    var removeAllListsOutDOM = function(){
	        $(".inbox_list").remove();
	    };
	    
	    //TODO: remove this
	    var removeSparseSpecialProperties = function(obj) {
	    	for (var key in obj) {
				if(obj.hasOwnProperty(key) && key.match(/^_/)) {
					delete obj[key];
				}
			}
	    };
	    
	    var renderLists = function(response){
	        
	        if(response == null) {
	        	return;
	        }
	        
	        allLists = response;
	        
	        var filterStrings = [];
	        // removing special _properties
	        for (var key in allLists) {
				if(allLists.hasOwnProperty(key) && key.match(/^_/)) {
					delete allLists[key];
				} else if(allLists[key].hasOwnProperty("query") && allLists[key].query.hasOwnProperty("filter")) {
					filterStrings.push(allLists[key].query.filter);	
				}									
			}
			
			if(filterStrings.length>0){
				batchGetNumberOfPeopleTargetedByLists(filterStrings);
			}
	        //removeSparseSpecialProperties(allLists);
	        
	        var data = {
	            "links": allLists,
	            sakai: sakai
	        }
	        
	        
	        
	        // remove previous lists
	        removeAllListsOutDOM();
	        
	        // Add them to the DOM
	        $(inboxTable).children("tbody").append(sakai.api.Util.TemplateRenderer("#inbox_inbox_lists_template", data));
	        
	        // do checkboxes
	        tickMessages();
	    }
	    	    
	    
	    /**
	     * Displays only the list with that id.
	     * @param {String} id    The id of a list
	     * @param {Boolean} copyMode	When set to true string "Copy of " is prepended to the name of the disolayed list and description is cleared
	     */
	    var displayList = function(id, copyMode){
	        // Display edit list tab
	        $.bbq.pushState({"tab": "new"},2);

			
			resetListEditingFormCheckboxesAndStyles();
	        
	        if(!allLists.hasOwnProperty(id) || allLists[id] == null) {
	        	return;
	        }
	        var list = allLists[id];
	        
	        // Fill in input fields with list data
	        if(copyMode) {
	        	$("#list_name").val("Copy of " + list["sakai:name"]);	        	
	        } else {
	        	$("#list_name").val(list["sakai:name"]);
	        	$("#description").val(list["sakai:description"]);	        	
	        }
	        
	        var idArray = [];
	        var filterAsObject = $.parseJSON(list.query.filter);
	        dumpOptionIDs(filterAsObject, idArray);
	        var includeAllGradsId = $includeGradsCheckbox.val();
	        var includeAllUndergradsId = $includeUndergradsCheckbox.val();
	        
	        	        
	        for (var i=0; i < idArray.length; i++) {
				var currentId = idArray[i];
				
				// cohort status - designate term - year
				if(currentId.match(/^designate_term_year_/)){
					
					var year = currentId.substring(20); // 20 is the length of 'designate_term_year_'
					$("option[value='" + year +"']", $cohortStatus).attr("selected","selected");
					
					// we need to select 'Only include students in designated cohort(s)' option if we got here,
					// because we can have the year option only if this option is selected 
					$("#cohort_status_specified_students", $cohortStatus).attr("checked","checked");
					
					continue;
				}
				
				
				switch(currentId) {
					case includeAllGradsId:
						enableGradsSection();						
						break;
					case includeAllUndergradsId:
						enableUndergradsSection();
						break;
					case "designate_term_semester_spring":
					case "designate_term_semester_fall":
						// fall-through is intentional here
						$("option[value='" + currentId +"']", $sectionC).attr("selected","selected");
						break;
					default:
						$("input[value='" + currentId +"']").attr("checked","checked");	
						break;
				}
					
			}
			
			if(isSomethingSelectedInUndergradsSection()) {
				enableUndergradsSection();
			}
			
			if(isSomethingSelectedInGradsSection()) {
				enableGradsSection();
			}
			
			// registration status radio buttons (section c)
			if(isSomethingSelectedInRegistrationStatusSection()) {
				$("#reg_status_only_designated_statuses", $sectionC).attr("checked", "checked");
			}
			
			
			
			
			
			// processing 'select all' checkboxes (section c)
			if(areAllOptionsInGroupSelected($(".reg_status .sub_group", $sectionC))) {
				$('#reg_status_select_all_in_group', $sectionC).attr("checked", "checked");
			}
			
			if(areAllOptionsInGroupSelected($(".current_or_not .sub_group", $sectionC))) {
				$('#currency_status_select_all_in_group', $sectionC).attr("checked", "checked");
			}
			
			if(areAllOptionsInGroupSelected($(".student_reg_status .sub_group", $sectionC))) {
				$('#student_reg_status_select_all_in_group', $sectionC).attr("checked", "checked");
			}
	        
	        
	        
	        
			// special programs radio buttons (section c)
			if(isSomethingSelectedInSpecialProgramsSection()) {
				$("#special_program_specified_students", $sectionC).attr("checked", "checked");
			}
			
			// Student status radio buttons (section c)
			if(isSomethingSelectedInStudentStatusSection()) {
				$("#student_status_specified_students", $sectionC).attr("checked", "checked");
			}
			
			// Residency status radio buttons (section c)
			if(isSomethingSelectedInResidencyStatusSection()) {
				$("#residency_status_specified_students", $sectionC).attr("checked", "checked");
			}
	        
	        
	        // NOT SUPPORTED FOR POC
	        // document.createListForm.list_size.value = list["sakai:size"];
	        
	        getNumberOfPeopleSelectedByFilter(list.query.filter);
	        
	    }
	
	    // Check all messages
	    $("#inbox_inbox_checkAll").change(function(){
	        tickMessages();
	    });
	    
	    // Sorters for the inbox.
	    
	    //var sortBy = "name";
	    //var sortOrder = "descending";
	    /* Commented out for the myBerkeley POC since sorting is broken - eli
	    $(".inbox_inbox_table_header_sort").bind("mouseenter", function() {
	        if (sortOrder === 'descending') {
	            $(this).append(sakai.api.Security.saneHTML($(inboxInboxSortUp).html()));
	        }
	        else {
	            $(this).append(sakai.api.Security.saneHTML($(inboxInboxSortDown).html()));
	        }
	    });
	    
	    $(".inbox_inbox_table_header_sort").bind("mouseout", function() {
	        $(inboxTable + " " + inboxArrow).remove();
	    });
	    
	    $(".inbox_inbox_table_header_sort").bind("click", function() {
	        sortBy = $(this).attr("id").replace(/inbox_table_header_/gi, "");
	        sortOrder = (sortOrder === "descending") ? "ascending" : "descending";
	
	        getAllMessages(); // no such function defined, but the function should sort the data and re-populate the inbox
	    });
	    */
	    
	    /**
         * This will do a DELETE request to the specified paths and delete each list.
         * @param {String[]} paths The array of dynamic lists that you want to delete.         
         */
	    var batchDeleteLists = function(paths) {
	    	var requests = [];
            $(paths).each(function(i,val) {
                var req = {
                    "url": val,
                    "method": "POST",
                    "parameters": {
                        ":operation": "delete"
                    }
                };
                requests.push(req);
            });
            $.ajax({
                url: sakai.config.URL.BATCH,
                traditional: true,
                type: "POST",
                data: {
                    requests: $.toJSON(requests)
                },
                success: function(data) {
                     //showGeneralMessage("Lists successfully deleted.");
                },
                error: function(xhr, textStatus, thrownError) {
                   showGeneralMessage("Error deleting lists.");
                }
            });
	    };
	    
	    
	    var batchGetNumberOfPeopleTargetedByLists = function(filterStrings) {
	    	var requests = [];
            $(filterStrings).each(function(i,val) {
                var req = {
                    "url": dynamicListsPeopleCountingUrl,
                    "method": "GET",
                    "parameters": {
                        "criteria": val
                    }
                };
                requests.push(req);
            });
            $.ajax({
                url: sakai.config.URL.BATCH,
                traditional: true,
                type: "POST",
                data: {
                    requests: $.toJSON(requests)
                },
                success: function(data) {
                     //showGeneralMessage("Lists successfully deleted.");
                     console.log(data);
                },
                error: function(xhr, textStatus, thrownError) {
                   //showGeneralMessage("Error deleting lists.");
                }
            });
	    };
	    
	    
	    var getNumberOfExistingLists = function() {
	    	
	    	var numberOfItems = 0;
	    	var pattern = '^' + DYNAMIC_LIST_PREFIX;
	    	var re = new RegExp(pattern, '');
	    		    	
	    	for (var key in allLists) {
				if(allLists.hasOwnProperty(key) && re.test(key)) {
					numberOfItems++;
				}
			}
			
			return numberOfItems;
	    };
	    
	    var deleteLists = function(listIds) {

	        var paths = []; // paths to nodes to delete
	        for (var i = 0, j = listIds.length; i < j; i++) {
	            
	            var currentId = listIds[i];
	            
	            if(allLists.hasOwnProperty(currentId)) {
	            
	                $("#inbox_table_list_" + currentId).empty();
	                $("#inbox_table_list_" + currentId).remove();
	                
	                // store path to delete
	                paths.push(dynamicListsBaseUrl + "/lists/" + currentId);	                	                
	                
	                // delete list from memory
	                delete allLists[currentId];	                    	                
	            } else {
	                alert("Error: list \"" + currentId + "\" not found");
	            }
	        }
	        
	        if(getNumberOfExistingLists() === 0) {
	        	// delete whole parent node
	        	sakai.api.Server.removeJSON(dynamicListsBaseUrl, loadData);
	        } else {
	        	// batch delete nodes selected for deletion
	        	batchDeleteLists(paths);
	        }
	        
	    };
	    
		/**
	     * Returns a value indicating whether the specified list object already exists.
	     *
	     * @param {Object} listToCheck The list to seek 
	     * @return {Boolean} true if the value parameter occurs within the existing lists; otherwise, false
	     */
		var listAlreadyExists = function(listToCheck) {
			
			for (var i = 0, j = allLists.length; i < j; i++) {
				var exsistingList = allLists[i];
				var exsistingListObj = {
					"context" : exsistingList.query.context, 
					"listName": exsistingList["sakai:name"],
					"desc": exsistingList["sakai:description"],
					"filter": exsistingList.query.filter				
				} 
				
				if(listEquals(exsistingListObj, listToCheck)) return true;
			}
			
			return false;				
		};
		
		/**
	     * Compares two specified list objects.
	     *
	     * @param {Object} list1 The first list
	     * @param {Object} list2 The The second list
	     * @return {Boolean} true if the lists are equal; otherwise false
	     */
		var listEquals = function(list1, list2) {
			
			return false;
			//TODO: debug
					
			
			
			return true;
		}
	    	    
	    
	    var generateId = function() {
	        var id = DYNAMIC_LIST_PREFIX + sakai.data.me.user.userid + "-" + new Date().getTime();
	        return id;
	    }
	    
	    var saveList = function(data, listId) {        
	        if (listAlreadyExists(data)) {
	            showGeneralMessage($("#inbox_generalmessages_already_exists").text());
	            return;
	        }
	        	        
	        var id = listId; // list id used for saving
	        if(listId === null){
	        	// creating a new list
	        	id = generateId();
	        }
	        
	        var list = {
                  "sling:resourceType":"myberkeley/dynamiclist",
	                "sakai:id": id,
	                "sakai:name": data.listName,
	                "sakai:description": data.desc,	                
	                "query": {
	                    "context": data.context,
	                    "filter": data.filter
	                }
	              };
	        
	        sakai.api.Server.saveJSON(dynamicListsBaseUrl + "/lists/" + id, list, function() {
	        	$.bbq.pushState({"tab": "existing"},2);
	        	loadData();
	        });
	    };
	    
	        
		// List creation events
	   
	   
	   
	  
	  
	  	$(".inbox_inbox_check_list").live("click", function(){
	  		updateEditCopyDeleteButtonsStatus();
	  	});
	  	  
	    // Button click events
	    $dynListsDeleteButton.live("click", function(){
	        var listId = [];
	        $(".inbox_inbox_check_list:checked").each(function(){
	            var id = $(this).val();
	            listId.push(id);
	        });
	        
	        $("#inbox_inbox_checkAll").removeAttr("checked");
	        tickMessages();
	
	        if (listId.length < 1) {
	            showGeneralMessage($("#inbox_generalmessages_none_selected").text());
	        } else {
	            deleteLists(listId);
	        }
	    });
	    
	    $dynListsCopyButton.live("click", function(){
	        var listIds = [];
	        $(".inbox_inbox_check_list:checked").each(function(){
	            var id = $(this).val();
	            listIds.push(id);
	        });
	        
	        if (listIds.length == 0) {
	        	return;
	        }
	        
	        $("#inbox_inbox_checkAll").removeAttr("checked");
	        tickMessages();
	
	
			editExisting = false;	        
	        currentListIdForEditing = null;
	        displayList(listIds[0], true);
	        
	        
	       /*if (listId.length < 1) {
	            showGeneralMessage($("#inbox_generalmessages_none_selected").text());
	        } else if (listId.length > 1) {
	            showGeneralMessage($("#inbox_generalmessages_duplicate_multiple").text());
	        } else {
	            displayList(listId[0]);
	        }*/
	    });
	    
	    $dynListsEditButton.live("click", function(evt){   
	        	        
	        var listIds = [];
	        $(".inbox_inbox_check_list:checked").each(function(){
	            var id = $(this).val();
	            listIds.push(id);
	        });
	        
	        if (listIds.length == 0) {
	        	return;
	        }
	        
	        editExisting = true;	        
	        currentListIdForEditing = listIds[0];
	        displayList(currentListIdForEditing, false);
	    });
	    
	    
	    $(".editLink").live("click", function(evt){   
	        editExisting = true;
	        var id = evt.target.id;
	        currentListIdForEditing = id;
	        displayList(id, false);
	    });
	    
	    $dynListsBackToNotifManagerButton.live("click", function(){
	        window.location = "/dev/inboxnotifier.html";
	    });
	    
	    $dynListsCancelEditingButton.live("click", function(){
	        editExisting = false;
	        //clearInputFields();
	        $.bbq.pushState({"tab": "existing"},2);
	    });
	    
	    $dynListsSaveButton.live("click", function(){
	        $("#invalid_name").hide();
	        $("#invalid_major").hide();
	        // NOT SUPPORTED FOR POC
	        //$("#invalid_size").hide();
			
	        var data = getDataFromInput();
			if(data < 0) {
				return;
			}
	        
	        // NOT SUPPORTED FOR POC
	        // var size = $("#list_size").val();
	        
			// In IE browser jQuery.trim() function doesn't work this way $('#selector').text().trim()
			// It should be called like this $.trim($('#selector').text())
			// See http://bit.ly/d8mDx2
	        if (editExisting) {
	            saveList(data, currentListIdForEditing);
				editExisting = false;
	        } else {
	            saveList(data, null);
	        }
	    });
	    
	    
	    
	    var switchToEditMode = function() {
	    	
	    	// Set headers and tab styling
	    	$("h1.title").text("Dynamic List Editor");
	    	
	    	$("#existing_lists").hide();	    	
	    	$("#create_new_list").show();
	      
	        
	        // Show/hide appropriate buttons
	        
	        $dynListsCreateButton.hide();
	        
	        $dynListsDeleteButton.hide();
	        $dynListsCopyButton.hide();
	        $dynListsEditButton.hide();
	        $dynListsBackToNotifManagerButton.hide();
	        
	        $dynListsCancelEditingButton.show();
	        $dynListsSaveButton.show();
	    };
	    
	    var switchToListMode = function() {
	    	
	    	// Set headers and tab styling
	    	
	    	$("h1.title").text("Dynamic List Manager");
	        $("#create_new_list").hide();
	        $("#existing_lists").show();
	        
	        
	        // Show/hide appropriate buttons
	        
	        
	        $dynListsCreateButton.show();
	        
	        $dynListsDeleteButton.show();
	        $dynListsCopyButton.show();
	        $dynListsEditButton.show();	        
	        $dynListsBackToNotifManagerButton.show();
	        
	        $dynListsCancelEditingButton.hide();
	        $dynListsSaveButton.hide();
	    };
	    
	    
	    /*-------------------------------- Roman ------------------------------------------*/
	    $dynListsCreateButton.click(function() {
	        $.bbq.pushState({"tab": "new"},2);
	        resetListEditingFormCheckboxesAndStyles();
	        
	        
	        
	        // NOT SUPPORTED FOR POC
	        // sakai_global.listpage.updateListSize();
	        

	    });
	    /*-------------------------------- Roman ------------------------------------------*/
	    
	    
	    
	    var setTabState = function(){
	        var tab = $.bbq.getState("tab");
	        if (tab) {
	            switch (tab) {
	                case "existing":
	                    switchToListMode();
	                    break;
	                case "new":
	                    switchToEditMode();
	                    break;
	            }
	        }
	    };
	    
	    $(window).bind('hashchange', function(e) {
	        setTabState();
	    });
	    
	    var createDefaultList = function() {
	        allLists = [];
	        var emptyData = {
	            "links": []
	        }
	        
	        $(inboxTable).children("tbody").append(sakai.api.Util.TemplateRenderer("#inbox_inbox_lists_template", emptyData));
	    }
	    

	    var loadData = function() {
	        sakai.api.Server.loadJSON(dynamicListsBaseUrl, function(success, data){
	            setTabState();	            
	            if (success) {	               
	                renderLists(data.lists);
	            } else {
	                createDefaultList();
	            }
	        });
	    }

		
	    /////////////////////////////
        // Initialization function //
        /////////////////////////////

        /**
         * Initialization function that is run when the widget is loaded. Determines
         * which mode the widget is in (settings or main), loads the necessary data
         * and shows the correct view.
         */
	    var doInit = function() {
			var security = sakai.api.Security;		       
	        
	        // if the user is not a member of the advisors group then bail
	        if (!myb.api.security.isUserAnAdvisor()) {
	            security.send403();
	            return;
	        }
	        
	        
	        
	        
	        
	        
	        
	        /*-------------------------------- Roman ------------------------------------------*/
	        
	       
        	// Trimpath template for sections A and B of the list editing form (section C is static and doesn't require a templete)
        	var $listEditFormTemplate = $("#list_edit_form_template");
                	
        	// View to render the template for sections A and B
			var $view = $("#view");
	        
	        // Loading template
            var template;
			$.ajax({
                    url: "nauth_ced.json", // TODO: put this into sakai config
                    type: "GET",
                    "async":false,
                    "cache":false,
                    "dataType":"json",
                    success: function(data){
                        if (data) {
                           template = data;
                        }
                    },
					 error: function(xhr, textStatus, thrownError) {
                        sakai.api.Util.notification.show(errorText,"",sakai.api.Util.notification.type.ERROR);
                    }
            });
			
			boolTemplateHasUndergradsData = typeof(template.undergraduates) !== 'undefined' && template.undergraduates !== null;
			boolTemplateHasGradsData = typeof(template.graduates) !== 'undefined' && template.graduates !== null; 
			
			$view.html(sakai.api.Util.TemplateRenderer($listEditFormTemplate, template));
			
			$includeUndergradsCheckbox = $("#include_undergrads");
			$includeGradsCheckbox = $("#include_grads");
			
			// Define undergrad and grad groups AFTER template has been rendered
			$undergradsGroup = $(".undergrads_group");
			$gradsGroup = $(".grads_group");
			
			//Disabling all graduate and undergraduate controls
			if (boolTemplateHasUndergradsData && boolTemplateHasGradsData) {
														
				$includeGradsCheckbox.click(function(event){
						if($includeGradsCheckbox.is(':checked')){
							$("input", $gradsGroup).removeAttr("disabled");						
							$gradsGroup.removeClass("disabled");
						} else {
							$("input", $gradsGroup).attr("disabled", "disabled");
							$gradsGroup.addClass("disabled");
						}
											
				});
								
				$includeUndergradsCheckbox.click(function(){
						if($includeUndergradsCheckbox.is(':checked')){
							$("input", $undergradsGroup ).removeAttr("disabled");							
							$undergradsGroup.removeClass("disabled");						
						} else {
							$("input", $undergradsGroup ).attr("disabled", "disabled");							
							$undergradsGroup.addClass("disabled");						
						}
											
				}); 
			}
			
			// Click handlers
			$('input[id^="undergrad_major_"]').click(function(){
					$("#undergrad_majors_selected_majors").click();
				});
				
			$('input[id^="grad_program_"]').click(function(){
					$("#grad_programs_selected_programs").click();
				});
            
            var $regStatusSelectAllInGroup = $('#reg_status_select_all_in_group', $sectionC);
			$regStatusSelectAllInGroup.click(function(){
				if($regStatusSelectAllInGroup.is(':checked')) {
					$(".reg_status .sub_group input", $sectionC).attr("checked", "checked");
				} else {
					$(".reg_status .sub_group input", $sectionC).removeAttr("checked");
				}
			});
			
			
			var $currencyStatusSelectAllInGroup = $('#currency_status_select_all_in_group', $sectionC);
			$currencyStatusSelectAllInGroup.click(function(){
				if($currencyStatusSelectAllInGroup.is(':checked')) {
					$(".current_or_not .sub_group input", $sectionC).attr("checked", "checked");
				} else {
					$(".current_or_not .sub_group input", $sectionC).removeAttr("checked");
				}
			});
			
			var $studentRegStatusSelectAllInGroup = $('#student_reg_status_select_all_in_group', $sectionC);
			$studentRegStatusSelectAllInGroup.click(function(){
				if($studentRegStatusSelectAllInGroup.is(':checked')) {
					$(".student_reg_status .sub_group input", $sectionC).attr("checked", "checked");
				} else {
					$(".student_reg_status .sub_group input", $sectionC).removeAttr("checked");
				}
			});
			
			
			populateDesignateTermYear();	
			
			$studentsTargetedByCurrentList = $(".students_targeted_by_list_container .readonly_textbox");
			
			
			// iteractive number of users
			var $listEditingDiv = $("#create_new_list");
			$("input:checkbox, input:radio", $listEditingDiv).click(function() {
				var filterString = buildFilterStringFromListEditingForm();
				getNumberOfPeopleSelectedByFilter(filterString);
			});
			$("select", $listEditingDiv).change(function() {
				var filterString = buildFilterStringFromListEditingForm();
				getNumberOfPeopleSelectedByFilter(filterString);
			});
			
	  	  	//Show more/less button in section C
	  		$showMoreOrLess = $("#show_more_or_less");
			// section C toggle button
			$showMoreOrLess.click(toggleSectionC);

			
	        
	        // his is needed for the situation when we reload this page with #tab=new
	        resetListEditingFormCheckboxesAndStyles();
	        
	        /*-------------------------------- Roman ------------------------------------------*/
	        
	        
	        
	        
	        dynamicListsBaseUrl = "/~" + sakai.data.me.user.userid + "/private/dynamic_lists";

			loadData();
	    };
	
	    doInit();
    };

    sakai.api.Widgets.Container.registerForLoad("listpage");
});
