// Variables of HTML file contents. Generated by html-preprocess.js
htmlFiles = {"customer-edit.html":"<div class=\"secondary-header\">\r\n\t<div class=\"icon customer-edit-icon\"></div>\r\n\t<h2>Edit Customer Information</h2>\r\n</div>\r\n<div id=\"customer-edit-div\">\r\n\t<div class=\"customer-edit-row\">\r\n\t\t<div class=\"customer-edit-column\">\r\n\t\t\t<label for=\"customer-edit-id\">\r\n\t\t\t\tCustomer ID\r\n\t\t\t</label>\r\n\t\t\t<div>\r\n\t\t\t\t<input type=\"number\" id=\"customer-edit-id\" />\r\n\t\t\t\t<input type=\"button\" value=\"Check\" class=\"button\" onclick=\"cmCheckID()\" />\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n\t<div class=\"customer-edit-row\">\r\n\t\t<div class=\"customer-edit-column\">\r\n\t\t\t<label for=\"customer-edit-full-name\">\r\n\t\t\t\tFull Name\r\n\t\t\t</label>\r\n\t\t\t<input type=\"text\" id=\"customer-edit-full-name\" list=\"customer-names\" />\r\n\t\t</div>\r\n\t\t<div class=\"customer-edit-column\">\r\n\t\t\t<label for=\"customer-edit-date\">\r\n\t\t\t\tDate Registered\r\n\t\t\t</label>\r\n\t\t\t<input type=\"date\" id=\"customer-edit-date\" disabled />\r\n\t\t</div>\r\n\t</div>\r\n\t<div class=\"customer-edit-row\">\r\n\t\t<div class=\"customer-edit-column\">\r\n\t\t\t<label for=\"customer-edit-contact\">\r\n\t\t\t\tContact Number\r\n\t\t\t</label>\r\n\t\t\t<input type=\"text\" id=\"customer-edit-contact\" />\r\n\t\t</div>\r\n\t\t<div class=\"customer-edit-column\">\r\n\t\t\t<label for=\"customer-edit-preferred-staff\">\r\n\t\t\t\tPreferred Staff\r\n\t\t\t</label>\r\n\t\t\t<select id=\"customer-edit-preferred-staff\"></select>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n<div class=\"secondary-buttons\">\r\n\t<input type=\"button\" value=\"Cancel\" class=\"button2\" onclick=\"cmCancelEdit()\" />\r\n\t<input type=\"button\" value=\"Submit\" class=\"button\" onclick=\"cmSubmitEdit()\" />\r\n</div>","customer-management.html":"<div id=\"module-div\">\r\n\t<div id=\"module-title\">\r\n\t\t<h2>Customer Management</h2>\r\n\t\t<div type=\"button\" class=\"button5\" onclick=\"cmRegisterCustomer()\">\r\n\t\t\t<div class=\"icon add-icon\"></div>\r\n\t\t\tRegister Customer\r\n\t\t</div>\r\n\t</div>\r\n\t<div id=\"module-content\">\r\n\t\t<div id=\"customer-table\" class=\"table-div\">\r\n\t\t</div>\r\n\t\t<div id=\"module-bottom\">\r\n\t\t\t<div class=\"button\" onclick=\"cmSearchCustomer()\">\r\n\t\t\t\t<div class=\"icon search-icon\"></div>\r\n\t\t\t\tSearch\r\n\t\t\t</div>\r\n\t\t\t<div class=\"button\" onclick=\"cmEditCustomer()\">\r\n\t\t\t\t<div class=\"icon edit-icon\"></div>\r\n\t\t\t\tEdit Customer\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n</div>","customer-registration.html":"<div class=\"secondary-header\">\r\n\t<div class=\"icon customer-registration-icon\"></div>\r\n\t<h2>Customer Registration</h2>\r\n</div>\r\n<div id=\"customer-registration-div\">\r\n\t<div class=\"customer-registration-row\">\r\n\t\t<div class=\"customer-registration-column\">\r\n\t\t\t<label for=\"customer-registration-full-name\">\r\n\t\t\t\tFull Name (required)\r\n\t\t\t</label>\r\n\t\t\t<input type=\"text\" id=\"customer-registration-full-name\" list=\"customer-registration-customer-names\" />\r\n\t\t</div>\r\n\t\t<div class=\"customer-registration-column\">\r\n\t\t\t<label for=\"customer-registration-date\">\r\n\t\t\t\tDate Registered\r\n\t\t\t</label>\r\n\t\t\t<input type=\"date\" id=\"customer-registration-date\" disabled />\r\n\t\t</div>\r\n\t</div>\r\n\t<div class=\"customer-registration-row\">\r\n\t\t<div class=\"customer-registration-column\">\r\n\t\t\t<label for=\"customer-registration-contact\">\r\n\t\t\t\tContact Number\r\n\t\t\t</label>\r\n\t\t\t<input type=\"text\" id=\"customer-registration-contact\" />\r\n\t\t</div>\r\n\t\t<div class=\"customer-registration-column\">\r\n\t\t\t<label for=\"customer-registration-preferred-staff\">\r\n\t\t\t\tPreferred Staff\r\n\t\t\t</label>\r\n\t\t\t<select id=\"customer-registration-preferred-staff\"></select>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n<div class=\"secondary-buttons\">\r\n\t<input type=\"button\" value=\"Cancel\" class=\"button2\" onclick=\"cmCancelRegistration()\" />\r\n\t<input type=\"button\" value=\"Submit\" class=\"button\" onclick=\"cmSubmitRegistration()\" />\r\n</div>","customer-search.html":"<div class=\"secondary-header\">\r\n\t<div class=\"icon search-icon\"></div>\r\n\t<h2>Customer Search</h2>\r\n</div>\r\n<div id=\"customer-search-div\">\r\n\t<div id=\"customer-search-top\">\r\n\t\t<div id=\"customer-search-fields\">\r\n\t\t\t<div class=\"customer-search-field\">\r\n\t\t\t\t<label for=\"customer-search-id\">Customer ID</label>\r\n\t\t\t\t<input type=\"number\" id=\"customer-search-id\" />\r\n\t\t\t</div>\r\n\t\t\t<div class=\"customer-search-field\">\r\n\t\t\t\t<label for=\"customer-search-full-name\">Full Name</label>\r\n\t\t\t\t<input type=\"text\" id=\"customer-search-full-name\" list=\"customer-search-customer-names\" />\r\n\t\t\t</div>\r\n\t\t\t<div class=\"customer-search-field\">\r\n\t\t\t\t<label for=\"customer-search-contact\">Contact</label>\r\n\t\t\t\t<input type=\"text\" id=\"customer-search-contact\" />\r\n\t\t\t</div>\r\n\t\t\t<div class=\"customer-search-field\">\r\n\t\t\t\t<label for=\"customer-search-preferred-staff\">Preferred Staff</label>\r\n\t\t\t\t<select id=\"customer-search-preferred-staff\"></select>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"customer-search-field\">\r\n\t\t\t\t<label for=\"customer-search-date-registered-from\">Date Registered</label>\r\n\t\t\t\t<div>\r\n\t\t\t\t\t<label for=\"customer-search-date-registered-from\">From</label>\r\n\t\t\t\t\t<input type=\"date\" id=\"customer-search-date-registered-from\" />\r\n\t\t\t\t\t<label for=\"customer-search-date-registered-to\">To</label>\r\n\t\t\t\t\t<input type=\"date\" id=\"customer-search-date-registered-to\" />\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"customer-search-field\">\r\n\t\t\t\t<label for=\"customer-search-last-service-from\">Date of Last Service</label>\r\n\t\t\t\t<div>\r\n\t\t\t\t\t<label for=\"customer-search-last-service-from\">From</label>\r\n\t\t\t\t\t<input type=\"date\" id=\"customer-search-last-service-from\" />\r\n\t\t\t\t\t<label for=\"customer-search-last-service-to\">To</label>\r\n\t\t\t\t\t<input type=\"date\" id=\"customer-search-last-service-to\" />\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<div class=\"button5\" onclick=\"cmSubmitSearch()\">\r\n\t\t\t<div class=\"icon search-icon\"></div>\r\n\t\t\tSearch\r\n\t\t</div>\r\n\t</div>\r\n\t<div id=\"customer-search-table\" class=\"table-div\">\r\n\t</div>\r\n</div>\r\n<div class=\"secondary-buttons\">\r\n\t<input type=\"button\" value=\"Done\" class=\"button2\" onclick=\"cmCloseSearch()\"></input>\r\n\t<input type=\"button\" value=\"Edit Customer\" class=\"button\" onclick=\"cmEditSearchedCustomer()\"></input>\r\n</div>","customer-services.html":"<div class=\"secondary-header\">\r\n\t<div class=\"icon customer-services-icon\"></div>\r\n\t<h2>Customer-Related Services</h2>\r\n</div>\r\n<div id=\"customer-services-div\">\r\n\t<div>Services offered to:</div>\r\n\t<h2 id=\"customer-services-full-name\"></h2>\r\n\t<div id=\"customer-services-table\" class=\"table-div\"></div>\r\n</div>\r\n<div class=\"secondary-buttons\">\r\n\t<input type=\"button\" value=\"Close\" class=\"button\" onclick=\"cmCloseServices()\"></input>\r\n</div>","forgot-password-answer.html":"<div class=\"secondary-header\">\r\n\t<div class=\"icon forgot-password-icon\"></div>\r\n\t<h2>Forgot Password</h2>\r\n</div>\r\n<div id=\"forgot-password-div\">\r\n\t<div class=\"forgot-password-row\">\r\n\t\t<label for=\"forgot-password-username\" class='icon username-icon'></label>\r\n\t\t<div>\r\n\t\t\t<label for=\"forgot-password-username\">\r\n\t\t\t\tUsername\r\n\t\t\t</label>\r\n\t\t\t<label for=\"forgot-password-username\" class='forgot-password-label'>\r\n\t\t\t\t<div class='icon check-icon'></div>\r\n\t\t\t\tUsername exists\r\n\t\t\t</label>\r\n\t\t\t<input type=\"text\" id=\"forgot-password-username\" disabled></input>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n<div class=\"secondary-buttons\">\r\n\t<input type=\"button\" value=\"Cancel\" class=\"button2\" onclick=\"fpCancel()\"></input>\r\n\t<input type=\"button\" value=\"Submit\" class=\"button\" onclick=\"fpSubmitAnswer()\"></input>\r\n</div>","forgot-password-new-password.html":"<div class=\"secondary-header\">\r\n\t<div class=\"icon forgot-password-icon\"></div>\r\n\t<h2>Forgot Password</h2>\r\n</div>\r\n<div id=\"forgot-password-div\">\r\n\t<div class=\"forgot-password-row\">\r\n\t\t<label for=\"forgot-password-new-password\" class='icon password-icon'></label>\r\n\t\t<div>\r\n\t\t\t<label for=\"forgot-password-new-password\">\r\n\t\t\t\tNew Password\r\n\t\t\t</label>\r\n\t\t\t<input type=\"password\" id=\"forgot-password-new-password\"></input>\r\n\t\t</div>\r\n\t</div>\r\n\t<div class=\"forgot-password-row\">\r\n\t\t<label for=\"forgot-password-confirm-password\" class='icon confirm-password-icon'></label>\r\n\t\t<div>\r\n\t\t\t<label for=\"forgot-password-confirm-password\">\r\n\t\t\t\tConfirm Password\r\n\t\t\t</label>\r\n\t\t\t<input type=\"password\" id=\"forgot-password-confirm-password\"></input>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n<div class=\"secondary-buttons\">\r\n\t<input type=\"button\" value=\"Cancel\" class=\"button2\" onclick=\"fpCancel()\"></input>\r\n\t<input type=\"button\" value=\"Submit\" class=\"button\" onclick=\"fpSubmitNewPassword()\"></input>\r\n</div>","forgot-password-username.html":"<div class=\"secondary-header\">\r\n\t<div class=\"icon forgot-password-icon\"></div>\r\n\t<h2>Forgot Password</h2>\r\n</div>\r\n<div id=\"forgot-password-div\">\r\n\t<div class=\"forgot-password-row\">\r\n\t\t<label for=\"forgot-password-username\" class='icon username-icon'></label>\r\n\t\t<div>\r\n\t\t\t<label for=\"forgot-password-username\">\r\n\t\t\t\tUsername\r\n\t\t\t</label>\r\n\t\t\t<input type=\"text\" id=\"forgot-password-username\"></input>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n<div class=\"secondary-buttons\">\r\n\t<input type=\"button\" value=\"Cancel\" class=\"button2\" onclick=\"fpCancel()\"></input>\r\n\t<input type=\"button\" value=\"Submit\" class=\"button\" onclick=\"fpSubmitUsername()\"></input>\r\n</div>","inventory-item-records.html":"<div class=\"secondary-header\">\r\n\t<div class=\"icon inventory-item-records-icon\"></div>\r\n\t<h2>Inventory Item-Related Records</h2>\r\n</div>\r\n<div id=\"inventory-item-records-div\">\r\n\t<div>Inventory Records Referring to:</div>\r\n\t<h2 id=\"inventory-item-records-item\"></h2>\r\n\t<div id=\"inventory-item-records-table\" class=\"table-div\"></div>\r\n</div>\r\n<div class=\"secondary-buttons\">\r\n\t<input type=\"button\" value=\"Close\" class=\"button\" onclick=\"imCloseItemRecords()\"></input>\r\n</div>","inventory-management.html":"<div id=\"module-div\">\r\n\t<div id=\"module-title\">\r\n\t\t<h2>Inventory Management</h2>\r\n\t\t<div type=\"button\" class=\"button5\" onclick=\"imCreateInventoryRecord()\">\r\n\t\t\t<div class=\"icon add-icon\"></div>\r\n\t\t\tCreate Inventory Record\r\n\t\t</div>\r\n\t</div>\r\n\t<div id=\"module-content\">\r\n\t\t<div id=\"inventory-management-table-switch\">\r\n\t\t\t<h3>View:</h3>\r\n\t\t\t<div>\r\n\t\t\t\t<input type=\"radio\" name=\"inventory-management-table-switch-radio\" id=\"inventory-management-table-switch-records\" checked />\r\n\t\t\t\t<label for=\"inventory-management-table-switch-records\">\r\n\t\t\t\t\tRecords\r\n\t\t\t\t</label>\r\n\t\t\t</div>\r\n\t\t\t<div>\r\n\t\t\t\t<input type=\"radio\" name=\"inventory-management-table-switch-radio\" id=\"inventory-management-table-switch-items\" />\r\n\t\t\t\t<label for=\"inventory-management-table-switch-items\">\r\n\t\t\t\t\tItems\r\n\t\t\t\t</label>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<div id=\"inventory-management-table\" class=\"table-div\">\r\n\t\t</div>\r\n\t</div>\r\n</div>","login.html":"<div id=\"login-banner\">\r\n</div>\r\n<div id=\"login-column\">\r\n\t<h2>HAIRLINERS SALON METROLANE COMPLEX</h2>\r\n\t<form>\r\n\t\t<div class=\"login-row\">\r\n\t\t\t<label for=\"username\">Username</label>\r\n\t\t\t<input type=\"text\" id=\"username\"></input>\r\n\t\t</div>\r\n\t\t<div class=\"login-row\">\r\n\t\t\t<label for=\"password\">Password</label>\r\n\t\t\t<input type=\"password\" id=\"password\"></input>\r\n\t\t</div>\r\n\t\t<div class=\"link\" onclick=\"forgotPassword()\">Forgot Password?</div>\r\n\t\t<input type=\"button\" value=\"Login\" class=\"button\" onclick=\"login()\"></input>\r\n\t</form>\r\n</div>","page-selector-admin.html":"<div id=\"page-selector\">\r\n\t<div class=\"icon company-logo-icon\"></div>\r\n\t<div class=\"page-button\" onclick=\"setPage('customer-management')\">\r\n\t\t<div class=\"page-title\">Customer</div>\r\n\t\t<div class=\"icon customer-icon\"></div>\r\n\t</div>\r\n\t<div class=\"page-button\" onclick=\"setPage('point-of-sales')\">\r\n\t\t<div class=\"page-title\">Point of Sales</div>\r\n\t\t<div class=\"icon point-of-sales-icon\"></div>\r\n\t</div>\r\n\t<div class=\"page-button\" onclick=\"setPage('inventory-management')\">\r\n\t\t<div class=\"page-title\">Inventory</div>\r\n\t\t<div class=\"icon inventory-icon\"></div>\r\n\t</div>\r\n\t<div class=\"page-button\" onclick=\"setPage('user')\">\r\n\t\t<div class=\"page-title\">User</div>\r\n\t\t<div class=\"icon user-icon\"></div>\r\n\t</div>\r\n\t<div class=\"page-button\" onclick=\"setPage('report')\">\r\n\t\t<div class=\"page-title\">Report</div>\r\n\t\t<div class=\"icon report-icon\"></div>\r\n\t</div>\r\n\t<div class=\"page-button\" onclick=\"setPage('backup')\">\r\n\t\t<div class=\"page-title\">Backup</div>\r\n\t\t<div class=\"icon backup-icon\"></div>\r\n\t</div>\r\n\t<div class=\"page-button\" onclick=\"setPage('help')\">\r\n\t\t<div class=\"page-title\">Help</div>\r\n\t\t<div class=\"icon help-icon\"></div>\r\n\t</div>\r\n\t<div class=\"page-button\" onclick=\"setPage('about')\">\r\n\t\t<div class=\"page-title\">About</div>\r\n\t\t<div class=\"icon about-icon\"></div>\r\n\t</div>\r\n\t<div class=\"page-button\" onclick=\"logout()\">\r\n\t\t<div class=\"page-title\">Logout</div>\r\n\t\t<div class=\"icon logout-icon\"></div>\r\n\t</div>\r\n</div>","page-selector-staff.html":"<div id=\"page-selector\">\r\n\t<div class=\"icon company-logo-icon\"></div>\r\n\t<div class=\"page-button\" onclick=\"setPage('customer-management')\">\r\n\t\t<div class=\"page-title\">Customer</div>\r\n\t\t<div class=\"icon customer-icon\"></div>\r\n\t</div>\r\n\t<div class=\"page-button\" onclick=\"setPage('point-of-sales')\">\r\n\t\t<div class=\"page-title\">Point of Sales</div>\r\n\t\t<div class=\"icon point-of-sales-icon\"></div>\r\n\t</div>\r\n\t<div class=\"page-button\" onclick=\"setPage('inventory-management')\">\r\n\t\t<div class=\"page-title\">Inventory</div>\r\n\t\t<div class=\"icon inventory-icon\"></div>\r\n\t</div>\r\n\t<div class=\"page-button\" onclick=\"setPage('help')\">\r\n\t\t<div class=\"page-title\">Help</div>\r\n\t\t<div class=\"icon help-icon\"></div>\r\n\t</div>\r\n\t<div class=\"page-button\" onclick=\"setPage('about')\">\r\n\t\t<div class=\"page-title\">About</div>\r\n\t\t<div class=\"icon about-icon\"></div>\r\n\t</div>\r\n\t<div class=\"page-button\" onclick=\"logout()\">\r\n\t\t<div class=\"page-title\">Logout</div>\r\n\t\t<div class=\"icon logout-icon\"></div>\r\n\t</div>\r\n</div>","point-of-sales-admin.html":"<div id=\"module-div\">\r\n\t<div id=\"module-title\">\r\n\t\t<h2>Point of Sales</h2>\r\n\t\t<div type=\"button\" class=\"button5\" onclick=\"posCreateSalesRecord()\">\r\n\t\t\t<div class=\"icon add-icon\"></div>\r\n\t\t\tCreate Sales Record\r\n\t\t</div>\r\n\t</div>\r\n\t<div id=\"module-content\">\r\n\t\t<div id=\"sales-record-table\" class=\"table-div\">\r\n\t\t</div>\r\n\t\t<div id=\"module-bottom\">\r\n\t\t\t<div class=\"button\" onclick=\"posEditSalesRecord(posSalesRecordTable.selected)\">\r\n\t\t\t\t<div class=\"icon edit-icon\"></div>\r\n\t\t\t\tEdit Sales Record\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n</div>\t","point-of-sales-staff.html":"<div id=\"module-div\">\r\n\t<div id=\"module-title\">\r\n\t\t<h2>Point of Sales</h2>\r\n\t\t<div type=\"button\" class=\"button5\" onclick=\"posCreateSalesRecord()\">\r\n\t\t\t<div class=\"icon add-icon\"></div>\r\n\t\t\tCreate Sales Record\r\n\t\t</div>\r\n\t</div>\r\n\t<div id=\"module-content\">\r\n\t\t<div id=\"sales-record-table\" class=\"table-div\">\r\n\t\t</div>\r\n\t</div>\r\n</div>\t","sales-record-creation.html":"<div class=\"secondary-header\">\r\n\t<div class=\"icon sales-record-creation-icon\"></div>\r\n\t<h2>Sales Record Creation</h2>\r\n</div>\r\n<div id=\"sales-record-creation-div\">\r\n\t<div>\r\n\t\t<div class=\"sales-record-creation-field\">\r\n\t\t\t<label for=\"sales-record-creation-customer\">\r\n\t\t\t\tCustomer\r\n\t\t\t</label>\r\n\t\t\t<input type=\"text\" id=\"sales-record-creation-customer\" list=\"sales-record-creation-customers\" />\r\n\t\t</div>\r\n\t\t<div class=\"sales-record-creation-field\">\r\n\t\t\t<label for=\"sales-record-creation-servicing-staff\">\r\n\t\t\t\tServicing Staff\r\n\t\t\t</label>\r\n\t\t\t<select id=\"sales-record-creation-servicing-staff\" disabled></select>\r\n\t\t</div>\r\n\t\t<div class=\"sales-record-creation-field\">\r\n\t\t\t<label for=\"sales-record-creation-date\">\r\n\t\t\t\tTransaction Date\r\n\t\t\t</label>\r\n\t\t\t<input type=\"date\" id=\"sales-record-creation-date\" disabled />\r\n\t\t</div>\r\n\t</div>\r\n\t<div>\r\n\t\tOffered Services\r\n\t\t<div id=\"sales-record-creation-services-table\">\r\n\t\t\t<div class=\"table-container\">\r\n\t\t\t\t<table>\r\n\t\t\t\t\t<tfoot>\r\n\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t\t<th colspan=\"2\">\r\n\t\t\t\t\t\t\t\tTotal Price\r\n\t\t\t\t\t\t\t</th>\r\n\t\t\t\t\t\t\t<td>\r\n\t\t\t\t\t\t\t\t<input type=\"number\" id=\"sales-record-creation-total-price\" disabled />\r\n\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t\t\t<th colspan=\"2\">\r\n\t\t\t\t\t\t\t\tPayment\r\n\t\t\t\t\t\t\t</th>\r\n\t\t\t\t\t\t\t<td>\r\n\t\t\t\t\t\t\t\t<input type=\"number\" id=\"sales-record-creation-payment\" />\r\n\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t\t<th colspan=\"2\">\r\n\t\t\t\t\t\t\t\tChange\r\n\t\t\t\t\t\t\t</th>\r\n\t\t\t\t\t\t\t<td>\r\n\t\t\t\t\t\t\t\t<input type=\"number\" id=\"sales-record-creation-change\" disabled />\r\n\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t</tfoot>\r\n\t\t\t\t</table>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n<div class=\"secondary-buttons\">\r\n\t<input type=\"button\" value=\"Cancel\" class=\"button2\" onclick=\"posCancelCreation()\"></input>\r\n\t<input type=\"button\" value=\"Submit\" class=\"button\" onclick=\"posSubmitCreation()\"></input>\r\n</div>","sales-record-edit.html":"<div class=\"secondary-header\">\r\n\t<div class=\"icon sales-record-edit-icon\"></div>\r\n\t<h2>Edit Sales Record Information</h2>\r\n</div>\r\n<div id=\"sales-record-edit-div\">\r\n\t<div>\r\n\t\t<div class=\"sales-record-edit-field\">\r\n\t\t\t<label for=\"sales-record-edit-id\">\r\n\t\t\t\tSales Record ID\r\n\t\t\t</label>\r\n\t\t\t<div>\r\n\t\t\t\t<input type=\"number\" id=\"sales-record-edit-id\" />\r\n\t\t\t\t<input type=\"button\" value=\"Check\" class=\"button\" onclick=\"posCheckID()\" />\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<div class=\"sales-record-edit-field\">\r\n\t\t\t<label for=\"sales-record-edit-customer\">\r\n\t\t\t\tCustomer\r\n\t\t\t</label>\r\n\t\t\t<input type=\"text\" id=\"sales-record-edit-customer\" list=\"sales-record-edit-customers\" />\r\n\t\t</div>\r\n\t\t<div class=\"sales-record-edit-field\">\r\n\t\t\t<label for=\"sales-record-edit-servicing-staff\">\r\n\t\t\t\tServicing Staff\r\n\t\t\t</label>\r\n\t\t\t<select id=\"sales-record-edit-servicing-staff\"></select>\r\n\t\t</div>\r\n\t\t<div class=\"sales-record-edit-field\">\r\n\t\t\t<label for=\"sales-record-edit-date\">\r\n\t\t\t\tTransaction Date\r\n\t\t\t</label>\r\n\t\t\t<input type=\"date\" id=\"sales-record-edit-date\" disabled />\r\n\t\t</div>\r\n\t</div>\r\n\t<div>\r\n\t\tOffered Services\r\n\t\t<div id=\"sales-record-edit-services-table\">\r\n\t\t\t<div class=\"table-container\">\r\n\t\t\t\t<table>\r\n\t\t\t\t\t<tfoot>\r\n\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t\t<th colspan=\"2\">\r\n\t\t\t\t\t\t\t\tTotal Price\r\n\t\t\t\t\t\t\t</th>\r\n\t\t\t\t\t\t\t<td>\r\n\t\t\t\t\t\t\t\t<input type=\"number\" id=\"sales-record-edit-total-price\" disabled />\r\n\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t\t\t<th colspan=\"2\">\r\n\t\t\t\t\t\t\t\tPayment\r\n\t\t\t\t\t\t\t</th>\r\n\t\t\t\t\t\t\t<td>\r\n\t\t\t\t\t\t\t\t<input type=\"number\" id=\"sales-record-edit-payment\" />\r\n\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t\t<th colspan=\"2\">\r\n\t\t\t\t\t\t\t\tChange\r\n\t\t\t\t\t\t\t</th>\r\n\t\t\t\t\t\t\t<td>\r\n\t\t\t\t\t\t\t\t<input type=\"number\" id=\"sales-record-edit-change\" disabled />\r\n\t\t\t\t\t\t\t</td>\r\n\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t</tfoot>\r\n\t\t\t\t</table>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n<div class=\"secondary-buttons\">\r\n\t<input type=\"button\" value=\"Cancel\" class=\"button2\" onclick=\"posCancelEdit()\"></input>\r\n\t<input type=\"button\" value=\"Submit\" class=\"button\" onclick=\"posSubmitEdit()\"></input>\r\n</div>","sales-record-services.html":"<div class=\"secondary-header\">\r\n\t<div class=\"icon sales-record-services-icon\"></div>\r\n\t<h2>Sales Record-Related Services</h2>\r\n</div>\r\n<div id=\"sales-record-services-column\">\r\n\t<div id=\"sales-record-services-div\">\r\n\t\t<div>\r\n\t\t\t<div class=\"sales-record-services-field\">\r\n\t\t\t\t<div>Sales Record ID</div>\r\n\t\t\t\t<h4 id=\"sales-record-services-id\"></h4>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"sales-record-services-field\">\r\n\t\t\t\t<div>Customer</div>\r\n\t\t\t\t<h4 id=\"sales-record-services-customer\"></h4>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"sales-record-services-field\">\r\n\t\t\t\t<div>Servicing Staff</div>\r\n\t\t\t\t<h4 id=\"sales-record-services-servicing-staff\"></h4>\r\n\t\t\t</div>\r\n\t\t\t<div class=\"sales-record-services-field\">\r\n\t\t\t\t<div>Transaction Date</div>\r\n\t\t\t\t<h4 id=\"sales-record-services-date\"></h4>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t\t<div>\r\n\t\t\tOffered Services\r\n\t\t\t<div id=\"sales-record-services-services-table\">\r\n\t\t\t\t<div class=\"table-container\">\r\n\t\t\t\t\t<table>\r\n\t\t\t\t\t\t<tfoot>\r\n\t\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t\t\t<th>Total Price</th>\r\n\t\t\t\t\t\t\t\t<td id=\"sales-record-services-total-price\"></td>\r\n\t\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t\t\t\t<th>Payment</th>\r\n\t\t\t\t\t\t\t\t<td id=\"sales-record-services-payment\"></td>\r\n\t\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t\t\t<tr>\r\n\t\t\t\t\t\t\t\t<th>Change</th>\r\n\t\t\t\t\t\t\t\t<td id=\"sales-record-services-change\"></td>\r\n\t\t\t\t\t\t\t</tr>\r\n\t\t\t\t\t\t</tfoot>\r\n\t\t\t\t\t</table>\r\n\t\t\t\t</div>\r\n\t\t\t</div>\r\n\t\t</div>\r\n\t</div>\r\n</div>\r\n<div class=\"secondary-buttons\">\r\n\t<input type=\"button\" value=\"Close\" class=\"button\" onclick=\"posCloseServices()\"></input>\r\n</div>"}