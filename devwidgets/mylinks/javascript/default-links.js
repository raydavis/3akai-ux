define(function() {
    return {
        "userSectionIndex" : 3,
        "sections" : [
            {
                "label" : "Academic",
                "selected" : true,
                "links" : [
                    {
                        "id"   : "bspace",
                        "name" : "bSpace",
                        "url" : "http://bspace.berkeley.edu",
                        "popup_description": "Homework assignments, lecture slides, syllabi, and class resources.",
                        "custom"  : false,
                        "hidden" : false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id"   : "campus_bookstore",
                        "name" : "Campus Bookstore",
                        "url"  : "http://www.bkstr.com/webapp/wcs/stores/servlet/StoreCatalogDisplay?storeId=10433",
                        "popup_description": "Find and purchase textbooks by course.",
                        "custom"  : false,
                        "hidden" : false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "course_catalog",
                        "name": "Course Catalog",
                        "url": "http://sis.berkeley.edu/catalog/gcc_search_menu",
                        "popup_description": "Detailed course descriptions.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id"   : "dars",
                        "name" : "DARS",
                        "url"  : "https://marin.berkeley.edu/darsweb/servlet/ListAuditsServlet",
                        "popup_description": "Track progress toward a major.",
                        "custom"  : false,
                        "hidden" : false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "decal",
                        "name": "DeCal Courses",
                        "url": "http://www.decal.org",
                        "popup_description": "Explore student-taught courses.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "future_campus_calendars",
                        "name": "Future Campus Calendars",
                        "url": "http://opa.berkeley.edu/AcademicCalendar",
                        "popup_description": "Look at campus calendars for upcoming semesters.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "library",
                        "name": "Library",
                        "url": "http://www.lib.berkeley.edu",
                        "popup_description": "Search for materials in the UC library system.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "class_schedule",
                        "name": "Schedule of Classes",
                        "url": "http://schedule.berkeley.edu",
                        "popup_description": "See current and upcoming courses.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },

                    {
                        "id": "schedule_planning",
                        "name": "Schedule Planning Tools",
                        "url": "http://asuc.org/newsite2010/student-services/schedule-planning-tools/",
                        "popup_description": "Tools to help you plan your class schedule.",
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "tele_bears",
                        "name": "Tele-BEARS",
                        "url": "http://telebears.berkeley.edu",
                        "popup_description": "Register for classes.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": true
                            }
                        ]
                    }
                ]
            },
            {
                "label" : "Administrative",
                "selected" : false,
                "links" : [
                    {
                        "id": "bear_facts",
                        "name": "Bear Facts",
                        "url": "https://bearfacts.berkeley.edu/bearfacts/student/studentMain.do?bfaction=welcome",
                        "popup_description": "See your registration and financial info, grades, online bill, and personal data.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "calmail",
                        "name": "CalMail",
                        "url": "http://calmail.berkeley.edu",
                        "popup_description": "Read and manage your university email.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "campus_calendar",
                        "name": "Campus Events Calendar",
                        "url": "http://events.berkeley.edu",
                        "popup_description": "View upcoming events on campus.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "career_center",
                        "name": "Career Center",
                        "url": "http://career.berkeley.edu",
                        "popup_description": "Find jobs, internships, and learn about career paths.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "finaid",
                        "name": "Financial Aid",
                        "url": "http://students.berkeley.edu/finaid",
                        "popup_description": "Learn about financial aid and scholarships.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    }
                ]
            },
            {
                "label" : "Campus Life",
                "selected" : false,
                "links" : [
                    {
                        "id": "asuc",
                        "name": "ASUC",
                        "url": "http://www.asuc.org",
                        "popup_description": "UC Berkeley's student government home.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "atoz_sites",
                        "name": "Berkeley Sites (A-Z)",
                        "url": "http://www.berkeley.edu/a-z/a.shtml",
                        "popup_description": "Comprehensive list of official campus websites.",
                        "featured_description": "N/A",
                        "audience": [
                            {
                                "name": "student",
                                "required": true
                            }
                        ]
                    },
                    {
                        "id": "cal1card",
                        "name": "Cal-1-Card",
                        "url": "http://services.housing.berkeley.edu/c1c/static/aboutc1c.htm",
                        "popup_description": "Manage and learn about your Cal 1 Card.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "caldining",
                        "name": "CalDining",
                        "url": "http://caldining.berkeley.edu",
                        "popup_description": "View daily menus and check your meal points.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "campus_map",
                        "name": "Campus Map",
                        "url": "http://berkeley.edu/map",
                        "popup_description": "View campus maps and find buildings using the interactive map.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "campus_safety",
                        "name": "Campus Safety / Police",
                        "url": "http://police.berkeley.edu",
                        "popup_description": "Learn about UCPD services.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "parking_and_transportation",
                        "name": "Parking & Transportation",
                        "url": "http://pt.berkeley.edu/park",
                        "popup_description": "Find and pay for parking.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "public_service",
                        "name": "Public Service",
                        "url": "http://calcorps.berkeley.edu",
                        "popup_description": "Get involved in public service.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "rsf",
                        "name": "Recreational Sports Facility",
                        "url": "http://www.recsports.berkeley.edu",
                        "popup_description": "Explore RSF programs and intramural sports.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "rescomp",
                        "name": "Residential Computing",
                        "url": "http://rescomp.berkeley.edu",
                        "popup_description": "Computing help for the residence halls.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "resource_guide",
                        "name": "Resource Guide for Students",
                        "url": "http://resource.berkeley.edu",
                        "popup_description": "Information about campus resources.",
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },

                    {
                        "id": "student_groups",
                        "name": "Student Groups and Programs",
                        "url": "http://students.berkeley.edu/osl",
                        "popup_description": "Student organizations, leadership programs, and GenEq.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },

                    {
                        "id": "student_services",
                        "name": "Student Services",
                        "url": "http://www.berkeley.edu/students",
                        "popup_description": "Several student sites grouped by function.",
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    },
                    {
                        "id": "uhs",
                        "name": "UHS - Tang Center",
                        "url": "http://uhs.berkeley.edu",
                        "popup_description": "Health and medical services for students.",
                        "custom": false,
                        "hidden": false,
                        "audience": [
                            {
                                "name": "student",
                                "required": false
                            }
                        ]
                    }
                ]
            },
            {
                "label" : "My Links",
                "selected" : false,
                "links" : [
                ]
            }
        ]
    };
});
