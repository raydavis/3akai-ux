var sakai = sakai || {};

sakai.links = function(){
    
    //alert("Testing-- Calling sakai.links function");

    // page elements
    var $suggestedSites = $(".suggested_sites"); //"original" div container for suggested sites
    var $allSites = $(".all_sites"); //"original" div container for all sites
    
    // templates
    var suggested_sites_template = "suggestedsites_links_template"; //template div container for suggested sites
    var all_sites_template = "allsites_links_template"; //template div container for all sites
    
    // data files and paths
    var userLinks = "my_links"
    var linksDataNode = "/_user" + sakai.data.me.profile.path + "/private/" + userLinks;
    
    /*
     * Sets the titles for the checkboxes' tooltips, based on
     * whether its label's class specifies that it is checked
     * or unchecked.
     */
    var setTitles = function(){
        //alert("Calling setTitles function...");
        var all_labels = document.getElementsByTagName("label");
        for (k = 0; k < all_labels.length; k++) {
            all_labels[k].setAttribute("title", "Add to myLinks.");
        }
        var selected_labels = document.getElementsByClassName("LabelSelected");
        for (i = 0; i < selected_labels.length; i++) {
            selected_labels[i].setAttribute("title", "Remove from myLinks.");
        }
    };
    
    /*
     * As checkboxes are checked or unchecked, toggles the state
     * of the custom star sprite as appropriate by changing its class.
     * then also resets the titles for the tooltips.
     */
    var setStars = function(){
        //alert("Calling setStars function...");
        $(".CheckBoxClass").change(function(){
            if ($(this).is(":checked")) {
                $(this).next("label").addClass("LabelSelected");
            }
            else {
                $(this).next("label").removeClass("LabelSelected");
            }
            setTitles();
        })
    };
    
    var createLinkList = function (data, isUserList) {
        $suggestedSites.html($.TemplateRenderer(suggested_sites_template, data));
        $allSites.html($.TemplateRenderer(all_sites_template, data));
        setTitles();
        setStars();
    };    
    
    var defaultLinks = {
        colset : [1,2,3,4], //placeholders for the number of columns on the All Links section
        featured : ["calmail", "bear_facts", "bspace"],
        links : [
            {
                id : "asuc",
                name : "ASUC",
                url : "http://www.asuc.org",
                popup_description : "UC Berkeley's student government home.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "bear_facts",
                name : "Bear Facts",
                url : "https://bearfacts.berkeley.edu/bearfacts/student/studentMain.do?bfaction=welcome",
                popup_description : "See your registration and financial info, grades, online bill, and personal data.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : true
                    }
                ]
            },
            {
                id : "atoz_sites",
                name : "Berkeley Sites (A-Z)",
                url : "http://www.berkeley.edu/a-z/a.shtml",
                popup_description : "Comprehensive list of official campus websites.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : true
                    }
                ]
            },
            {
                id : "student_services",
                name : "Student Services",
                url : "http://www.berkeley.edu/students",
                popup_description : "Several student sites grouped by function.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "bspace",
                name : "bSpace",
                url : "http://bspace.berkeley.edu",
                popup_description : "Homework assignments, lecture slides, syllabi, and class resources.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : true
                    }
                ]
            },
            {
                id : "cal1card",
                name : "Cal-1-Card",
                url : "http://services.housing.berkeley.edu/c1c/static/aboutc1c.htm",
                popup_description : "Manage and learn about your Cal 1 Card.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "caldining",
                name : "CalDining",
                url : "http://caldining.berkeley.edu",
                popup_description : "View daily menus and check your meal points.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "calmail",
                name : "CalMail",
                url : "http://calmail.berkeley.edu",
                popup_description : "Read and manage your university email.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "campus_calendar",
                name : "Campus Events Calendar",
                url : "http://events.berkeley.edu",
                popup_description : "View upcoming events on campus.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "campus_map",
                name : "Campus Map",
                url : "http://berkeley.edu/map",
                popup_description : "View campus maps and find buildings using the interactive map.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "campus_safety",
                name : "Campus Safety / Police",
                url : "http://police.berkeley.edu",
                popup_description : "Learn about UCPD services.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "campus_bookstore",
                name : "Campus Bookstore",
                url : "http://www.bkstr.com/CategoryDisplay/10001-9604-10433-1",
                popup_description : "Find and purchase textbooks by course.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },       
            {
                id : "course_catalog",
                name : "Course Catalog",
                url : "http://sis.berkeley.edu/catalog/gcc_search_menu",
                popup_description : "Detailed course descriptions.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "dars",
                name : "DARS",
                url : "https://marin.berkeley.edu/darsweb/servlet/ListAuditsServlet",
                popup_description : "Track progress toward a major.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "decal",
                name : "DeCal Courses",
                url : "http://www.decal.org",
                popup_description : "Explore student-taught courses.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "finaid",
                name : "Financial Aid",
                url : "http://students.berkeley.edu/finaid",
                popup_description : "Learn about financial aid and scholarships.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },        
            {
                id : "future_campus_calendars",
                name : "Future Campus Calendars",
                url : "http://opa.berkeley.edu/AcademicCalendar",
                popup_description : "Look at campus calendars for upcoming semesters.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "uhs",
                name : "University Health Services",
                url : "http://uhs.berkeley.edu",
                popup_description : "Health and medical services for students.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },        
            {
                id : "career_center",
                name : "Career Center",
                url : "http://career.berkeley.edu",
                popup_description : "Find jobs, internships, and learn about career paths.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "library",
                name : "Library",
                url : "http://www.lib.berkeley.edu",
                popup_description : "Search for materials in the UC library system.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },        
            {
                id : "parking",
                name : "Parking",
                url : "http://pt.berkeley.edu/park",
                popup_description : "Find and pay for parking.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },                
            {
                id : "public_service",
                name : "Public Service",
                url : "http://calcorps.berkeley.edu",
                popup_description : "Get involved in public service.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "rsf",
                name : "Recreational Sports Facility",
                url : "http://www.recsports.berkeley.edu",
                popup_description : "Explore RSF programs and intramural sports.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },        
            {
                id : "rescomp",
                name : "Residential Computing",
                url : "http://rescomp.berkeley.edu",
                popup_description : "Computing help for the residence halls.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },                                                 
            {
                id : "class_schedule",
                name : "Schedule of Classes",
                url : "http://schedule.berkeley.edu",
                popup_description : "See current and upcoming courses.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "schedule_planning",
                name : "Schedule Planning Tools",
                url : "http://asuc.org/newsite/scheduleplanning",
                popup_description : "Tools to help you plan your class schedule.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "student_groups",
                name : "Student Groups and Programs",
                url : "http://students.berkeley.edu/osl",
                popup_description : "Student organizations, leadership programs, and GenEq.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },
            {
                id : "resource_guide",
                name : "Resource Guide for Students",
                url : "http://resource.berkeley.edu",
                popup_description : "Information about campus resources.",
                featured_description : "Needs featured_description.",
                audience : [
                    {
                        name : "student",
                        required : false
                    }
                ]
            },                   
            {
                id : "tele-bears",
                "name" : "Tele-BEARS",
                url : "http://telebears.berkeley.edu",
                "popup_description" : "Register for classes.",
                featured_description : "Needs featured_description.",
                "audience" : [
                    {
                        "name" : "student",
                        required : true
                    }
                ]
            }
        ]
    };    
    
    var getDefaultList = function () {
         return defaultLinks;
    };

    var loadLinksList = function (success, data) {
        var defaultLinksList = getDefaultList();
        createLinkList(defaultLinksList, false);
    }
    
    var doInit = function(){
        //alert("Testing-- calling doInit function");
        sakai.api.Server.loadJSON(linksDataNode, loadLinksList);
    };
    
    doInit();

};

sakai.api.Widgets.Container.registerForLoad("sakai.links");

