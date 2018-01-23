<?php

// TODO: make some rules for route naming
Route::group(['middleware' => ['web']], function() {
    Route::get('/', 'SiteController@homePage');

    Route::match(['get', 'post'], '/dashboard', [
        'middleware' => ['allowedRoles:super_admin,Admin,Registrar,Teacher'],
        'uses' => 'DashboardController@index'
    ]);

    // Auth
    Route::match(['get', 'post'], '/login', 'AuthController@login');
    Route::match(['get', 'post'], '/auth/login', 'AuthController@login');
    Route::match(['get', 'post'], '/logout', 'AuthController@logout');
    Route::match(['get', 'post'], '/auth/logout','AuthController@logout');

    Route::get('/auth/user', 'AuthController@getCurrentUser');

    Route::get('/auth/check-username', 'AuthController@checkUsername');

    Route::get('/error', ['as' => 'error', function() {
        return view('error.display');
    }]);

    // Pay Names

    Route::get('/payname/totallist','PayNameController@getTotalList');

    Route::get('payname/get/{id}','PayNameController@get');

    Route::get('/PayName/list','PayNameController@getPayNameList');

    Route::get('payname/{id}/{branchId}',"PayNameController@printPayname");

    Route::get('/PayName','PayNameController@getPayName');

    Route::post('/payname/update/{id}','PayNameController@update');

    Route::post('/addpayname','PayNameController@addNew');

    Route::post('/updatePayName','PayNameController@updatePayName');

    // Users

    Route::get('users/getbypayname/{PayName_id}','UserController@getByPayName');

    Route::get('/users', 'UserController@getUsers');

    Route::get('/users/get-postcode-data', 'UserController@getPostcodeData');

    Route::get('/users/get-{enumType}', 'UserController@getEnumValues')
        ->where('enumType', '[-a-z]+-enum');

    Route::get('/users/find-relatives', 'UserController@findRelatives');

    Route::get('/users/quick-search', 'UserController@quickSearch');

    Route::get('/users/reconcile', 'UserController@getReconcile');

    Route::post('/users/forgot-password', 'UserController@forgotPassword');

    Route::post('users/merge-branches', 'UserController@mergeBranches')
        ->middleware('allowedRoles:super_admin');

    Route::get('/users/reset-password/{resetCode}/{userId}', 'UserController@checkResetCode');

    Route::post('/users/reset-password', 'UserController@resetPassword');

    Route::get('/users/waiting', 'UserController@getWaiting');

    Route::get('/users/{role}/list', 'UserController@getNamesList');

    Route::get('/users/{role}/print/{type}/filters/{filters}', 'UserController@printData')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::match(['get', 'post'], '/users/search/{role?}/{option?}', [
        'middleware' => ['allowedRoles:super_admin,Admin,Registrar,Teacher'],
        'uses' => 'UserController@index'
    ]);

    Route::get('/users/{role}', 'UserController@getByRole')
        ->where('role', '[-a-zA-Z]+');
    
    Route::get('/users/{role}/{branchID}', 'UserController@getByRole')
        ->where('role', '[-a-zA-Z]+');

    Route::get('/users/{userId}', 'UserController@get')
        ->where('userId', '[0-9]+')
        ->middleware('auth');

    Route::put('/users/{userId}', 'UserController@edit')
        ->where('userId', '[0-9]+')
        ->middleware('auth');

    Route::post('/users/{userId}/add-relative/{relativeId}', 'UserController@addRelative')
        ->where(['userId' => '[0-9]+', 'relativeId' => '[0-9]+'])
        ->middleware('auth');

    Route::delete('/users/{userId}/remove-relative/{relativeId}', 'UserController@removeRelative')
        ->where(['userId' => '[0-9]+', 'relativeId' => '[0-9]+'])
        ->middleware('auth');

    Route::delete('/users/{userId}', 'UserController@delete')
        ->where('userId', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::post('/users/{userId}/copy', 'UserController@copy')
        ->where('userId', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::post('/users', 'UserController@create');

    Route::put('/users', 'UserController@update')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/users/{userId}/classes', 'CourseStudentController@getByUser')
        ->where('userId', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/users/{userId}/classes/deleted', 'CourseStudentController@getDeletedClassesByUser')
        ->where('userId', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');
    
    Route::delete('/users/{userId}/classes/deleted', [
        'uses' => 'CourseStudentController@deleteDeletedByUser',
        'as' => 'deleteCourseStudents'
    ])->where('userId', '[0-9]+')->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::delete('/users/{userId}/classes', [
        'uses' => 'CourseStudentController@deleteByUser',
        'as' => 'deleteCourseStudents'
    ])->where('userId', '[0-9]+')->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/users/{userId}/donationRecords', [
        'uses' => 'DonationRecordController@getByUser',
        'as' => 'getUserDonationRecords'
    ])->where('userId', '[0-9]+');

    Route::get('/users/{userId}/donations', 'DonationController@getByUser')
        ->where('userId', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::delete('/users/{userId}/donations', 'DonationController@delete')
        ->where('userId', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::put('/users/{userId}/donations/{donationId}', 'DonationController@edit')
        ->where(['userId' => '[0-9]+', 'donationId' => '[0-9]+'])
        ->middleware('allowedRoles:super_admin,Admin');

    // Transactions
    Route::get('/transactions/paypal', 'TransactionController@getPaypalTransactions')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/transactions/stripe', 'TransactionController@getStripeTransactions')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/transactions/stripe/{id}', 'TransactionController@getStripeTransaction')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/transactions/paypal/{id}', 'TransactionController@getPaypalTransaction')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/transactions/all', 'TransactionController@getAll')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/transactions/print/{type}/filters/{filters?}', 'TransactionController@printData')
        ->middleware('allowedRoles:super_admin,Admin');

    // Profile
    Route::get('/profiles/get-{enumType}', 'ProfileController@getEnumValues')
        ->where('enumType', '[-a-z]+-enum');

    // Courses
    Route::get('/courses/list', 'CourseController@getList');

    Route::post('/courses', 'CourseController@create')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/courses/{id}', 'CourseController@get')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::post('/courses/{id}', 'CourseController@edit')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::delete('/courses', 'CourseController@delete')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/courses/grouped-list', 'CourseController@getGroupedList')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::put('/courses/swap', 'CourseController@swapCourses')
        ->middleware('allowedRoles:super_admin,Admin');

    // Courses groups
    Route::get('/courses/groups', 'CourseGroupController@index');

    Route::put('/courses/groups', 'CourseGroupController@update')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/courses/groups/list', 'CourseGroupController@getList')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::put('/courses/groups/swap', 'CourseGroupController@swapGroups')
        ->middleware('allowedRoles:super_admin,Admin');

    // Logs
    Route::get('/logs', 'LogController@index')
        ->middleware('allowedRoles:super_admin');

    Route::get('/logs/{id}', 'LogController@get')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin');

    Route::get('/logs/payments', 'LogController@getPaymentsLog')
        ->middleware('allowedRoles:super_admin');

    Route::get('/logs/log-actions', 'LogController@logActions');

    // Cities
    Route::get('/branches', 'BranchController@index');

    Route::delete('/branches', 'BranchController@delete')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/branches/list-with-associated', 'BranchController@getWithAssociated')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/branches/list', 'BranchController@getList')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/branches/grouped-list', 'BranchController@getGroupedList')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/dept-branches/list', 'DeptBranchController@getList')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    // CourseClasses
    Route::get('/classes', 'CourseClassController@index');

    Route::get('/classes/list', 'CourseClassController@getList');

    Route::get('/classes/available', 'CourseClassController@getAvailable');

    Route::get('/classes/my', 'CourseClassController@getUserClasses')
        ->middleware('allowedRoles:Student');

    Route::post('/classes', 'CourseClassController@create')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/classes/{id}', 'CourseClassController@get')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::put('/classes/{id}', 'CourseClassController@edit')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/classes/{id}/print/{type}', 'CourseClassController@printData')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

//    Route::get('/classes/{courseId}/{classId}/print/{type}', 'CourseClassController@preparePrintAll')
//        ->where('id', '[0-9]+')
//        ->middleware('allowedRoles:super_admin,Admin,Registrar');
    Route::post('/classes/print/{type}', 'CourseClassController@printMultipleData')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::post('/classes/print/{term}/{type}', 'CourseClassController@printMultipleDataAll')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::post('/classes/{id}/send-email', 'CourseClassController@sendEmailToStudents')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::delete('/classes', 'CourseClassController@delete')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/classes/grouped-list', 'CourseClassController@getGroupedList')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/classes/{id}/students', 'CourseClassController@getStudents')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::put('/classes/swap', 'CourseClassController@swapClasses')
        ->middleware('allowedRoles:super_admin,Admin');

    // CourseClass groups
    Route::get('/classes/groups/list', 'ClassGroupController@getList');

    Route::get('/classes/groups', 'ClassGroupController@index');

    Route::put('/classes/groups', 'ClassGroupController@update')
        ->middleware('allowedRoles:super_admin,Admin');

    // Classrooms
    Route::get('/classrooms', 'ClassroomController@index');

    Route::post('/classrooms', 'ClassroomController@create')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/classrooms/{id}', 'ClassroomController@get')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::put('/classrooms/{id}', 'ClassroomController@edit')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::delete('/classrooms', 'ClassroomController@delete')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/classrooms/list', 'ClassroomController@getList');

    // Exams
    Route::get('/classes/{classId}/exams', 'ExamController@getByClass')
        ->where('classId', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/classes/{classId}/exam-results', 'ExamController@getExamResults')
        ->where('classId', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::put('/exams', 'ExamController@update')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::put('/classes/{classId}/exam-results', 'ExamController@update')
        ->where('classId', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::post('/exams', 'ExamController@create')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::put('/exams/{id}', 'ExamController@edit')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::delete('/exams/{id}', 'ExamController@delete')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::post('/exams/populate', 'ExamController@populate')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    // Depts
    Route::get('/depts', 'DeptController@index');

    Route::get('/depts/{id}', 'DeptController@get')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::put('/depts/{id}', 'DeptController@edit')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::post('/depts', 'DeptController@create')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::delete('/depts', 'DeptController@delete')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/depts/list', 'DeptController@getList');

    // CourseStudents
    Route::get('/students/get-{enumType}', 'CourseStudentController@getEnumValues')
        ->where('enumType', '[-a-z]+-enum')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/students/debtors', 'CourseStudentController@debtors')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/students/{id}', 'CourseStudentController@get')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/students/{id}/print-receipt/{branchId}', 'CourseStudentController@printReceipt')
        ->where(['id' => '[0-9]+', 'branchId' => '[0-9]+'])
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/students/print-receipt-rows', 'CourseStudentController@printReceiptRows')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/students/{id}/export-student-data', 'CourseStudentController@exportStudentData')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/students/print/debtors/{type}/{filters}', 'CourseStudentController@printDebtors')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/students/{id}/send-invoice/{branchId}', 'CourseStudentController@sendInvoice')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/students/form-dates', 'CourseStudentController@getFormDates')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/students/{id}/form-data', 'CourseStudentController@getFormData')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::post('/students/{id}/submit-form-data', 'CourseStudentController@submitFormData')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');
    Route::post('/students/updateStudentPayments','CourseStudentController@updateStudentPayments')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');
    Route::put('/students/{id}', 'CourseStudentController@edit')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::delete('/students', 'CourseStudentController@delete')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::post('/students', 'CourseStudentController@create')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/lookup/get-{itemType}', 'LookupController@getItems')
        ->middleware('allowedRoles:super_admin,Admin,Teacher,Registrar');

    // Donations
    Route::get('/donations', 'DonationController@index');

    Route::post('/donations', 'DonationController@create');

    Route::post('/donations/checkout', 'DonationController@checkout');

    Route::delete('/donations', 'DonationController@delete')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/donations/{id}', 'DonationController@get')
        ->where('id', '[0-9]+')
        ->middleware('auth');

    Route::put('/donations/{id}', 'DonationController@edit')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/donations/payment-methods', 'DonationController@getPaymentMethods');

    Route::get('/donations/types', 'DonationTypeController@getList');

    // Donation records
    Route::get('/donation-records/{id}', 'DonationRecordController@get')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/donation-records/get-{enumType}', 'DonationRecordController@getEnumValues');

    Route::delete('/donation-records', 'DonationRecordController@delete')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::post('/donation-records', 'DonationRecordController@create');

    Route::put('/donation-records/{id}', 'DonationRecordController@edit')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    // Websites
    Route::get('/websites', 'WebsiteController@index')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::post('/websites', 'WebsiteController@create')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::delete('/websites', 'WebsiteController@delete')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::delete('/websites/{id}/branches/{branchId}', 'WebsiteController@detachBranch')
        ->where(['id' => '[0-9]+', 'branchId' => '[0-9]+'])
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/websites/{id}', 'WebsiteController@get')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::put('/websites/{id}', 'WebsiteController@edit')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/website', 'WebsiteController@getCurrent');

    Route::get('/website/header', 'WebsiteController@getHeader');

    Route::get('/website/footer', 'WebsiteController@getFooter');

    Route::get('/website/folder', 'WebsiteController@getFolder');

    Route::get('/website/toc', 'WebsiteController@getToc');

    Route::get('/websites/list', 'WebsiteController@getList')
        ->middleware('allowedRoles:super_admin,Admin');

    // Terms
    Route::get('/terms', 'TermController@index');

    Route::get('/terms/{id}', 'TermController@get')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/terms/frontend', 'TermController@getFrontendActiveTerms')
        ->middleware('auth');

    Route::put('/terms/{id}', 'TermController@edit')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::post('/terms', 'TermController@create')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::delete('/terms', 'TermController@delete')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/terms/list', 'TermController@getList');

    Route::get('/terms/active', 'TermController@getActive');

    Route::put('/terms/set-active', 'TermController@setActive')
        ->middleware('allowedRoles:super_admin,Admin');

    // Settings
    Route::get('/settings/stripe-key', 'SettingsController@getStripePublicKey');

    Route::get('/settings/get-allowed-payment-methods', 'SettingsController@getAllowedPaymentMethods');

    Route::get('/settings/{group}', 'SettingsController@getSettingsByGroup')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/settings', 'SettingsController@getSettings')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::put('/settings', 'SettingsController@editSettings')
        ->middleware('allowedRoles:super_admin,Admin');

    // Instalments
    Route::get('/instalments', 'InstalmentsController@index')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::put('/instalments', 'InstalmentsController@update')
        ->middleware('allowedRoles:super_admin,Admin');

    // Bank
    Route::get('/bank', 'BankController@index')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::put('/bank', 'BankController@update')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    // Attendance
    Route::get('/users/{userId}/attendance', 'AttendanceController@getUserAttendance')
        ->where('userId', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/classes/{classId}/attendance', 'AttendanceController@getClassAttendance')
        ->where('classId', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    // Branches associated
    Route::get('/branches-associated', 'BranchesAssociatedController@index');

    Route::get('/branches-associated/frontend', 'BranchesAssociatedController@frontendList');

    Route::get('/branches-associated/{id}', 'BranchesAssociatedController@get')
        ->where('id', '[0-9]+');

    Route::get('/branches-associated/list', 'BranchesAssociatedController@getList');

    Route::put('/branches-associated/{id}', 'BranchesAssociatedController@edit')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::delete('/branches-associated', 'BranchesAssociatedController@delete')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::post('/branches-associated', 'BranchesAssociatedController@create')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::put('/branches-associated', 'BranchesAssociatedController@update')
        ->middleware('allowedRoles:super_admin,Admin');

    // Class work
    Route::get('/class-work/{classId}', 'ClassWorkController@getByClass')
        ->where('classId', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    // Cart items
    Route::get('/users/{userId}/basket', 'CartItemController@getBasket')
        ->where('userId', '[0-9]+')
        ->middleware('auth');

    Route::put('/cart/{cartId}/{classId}', 'CartItemController@update')
        ->where(['cartId' => '[0-9]+', 'classId' => '[0-9]+'])
        ->middleware('auth');

    Route::post('/cart/add', 'CartItemController@create');

    Route::get('/cart/checkout', 'CartItemController@checkout')
        ->middleware('auth');

    /*Route::post('/cart/submit-items', 'CartItemController@submitItems')
        ->middleware('auth');*/

    Route::delete('/cart/delete', 'CartItemController@delete')
        ->middleware('auth');

    Route::post('/cart/add-relative', 'CartItemController@addRelative')
        ->middleware('auth');

    Route::delete('/cart/delete-relative', 'CartItemController@deleteRelative')
        ->middleware('auth');

    // Payments handling
    Route::get('payment/success/{invoiceNo}', 'PaymentController@success');

    Route::get('payment/cancel', 'PaymentController@cancel');

    Route::any('payment/ipn', 'PaymentController@ipn');

    Route::any('payment/donation-ipn', 'PaymentController@donationIpn');

    Route::any('payment/studentIpn/{courseStudentId}','PaymentController@studentIpn');

    // Teacher Payments
    Route::post('/teacher-payments', 'TeacherPaymentController@create')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::delete('/teacher-payments', 'TeacherPaymentController@delete')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::put('/teacher-payments/{id}', 'TeacherPaymentController@edit')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin');

    // Hear places
    Route::get('/hear-places', 'HearPlaceController@index');

    Route::get('/hear-places/list', 'HearPlaceController@getList');

    Route::get('/hear-places/info', 'HearPlaceController@getInfo');

    Route::put('/hear-places/update', 'HearPlaceController@update')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    // Student Payments
    Route::get('/get-payment-student/{id}','StudentPaymentController@getById')
        ->middleware('auth');
    Route::get('student-payment-checkout/{amount}/{id}','StudentPaymentController@checkout')
        ->middleware('auth');

    Route::get('/student-payments/', 'StudentPaymentController@index')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/student-payments/get-{enumType}', 'StudentPaymentController@getEnumValues')
        ->where('enumType', '[-a-z]+-enum');

    Route::post('/student-payments/create', 'StudentPaymentController@create')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/student-payments/total', 'StudentPaymentController@total')
        ->middleware('allowedRoles:super_admin,Admin');
    
    Route::put('/update/studentpayment','StudentPaymentController@updateStudent');

    // Complaints
    Route::get('/complaints', 'ComplaintController@index')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::post('/complaints', 'ComplaintController@create')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::delete('/complaints', 'ComplaintController@delete')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/complaints/{id}', 'ComplaintController@get')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::put('/complaints/{id}', 'ComplaintController@edit')
        ->where('id', '[0-9]+')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/complaints/types', 'ComplaintController@getTypes')
        ->middleware('allowedRoles:super_admin,Admin,Registrar');

    Route::get('/complaints/priorities', 'ComplaintController@getPriorities');

    // Testing
    Route::get('/test', 'TestController@run')
        ->middleware('allowedRoles:super_admin,Admin');

    Route::get('/test/connection', 'TestController@emptyAction');
});
