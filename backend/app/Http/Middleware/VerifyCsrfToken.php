<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as BaseVerifier;

class VerifyCsrfToken extends BaseVerifier
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        '/login',
        '/auth/login',
        '/auth/logout',
        '/dashboard',
        '/users/search*',
        '/users/*/classesInfo',
        '/users/*/basket',
        '/users*',
        '/users/*',
        '/courses',
        '/courses/*',
        '/classes',
        '/classes/*',
        '/exams',
        '/exams/*',
        '/depts',
        '/depts/*',
        '/classrooms',
        '/classrooms/*',
        '/students*',
        '/donations*',
        '/donation-records*',
        '/settings*',
        '/instalments*',
        '/website*',
        '/pages*',
        '/branches*',
        '/bank*',
        '/terms*',
        '/cart*',
        '/teacher-payments*',
        '/student-payments*',
        '/hear-places*',
        '/payment*',
        '/complaints*',
        '/payname*',
        '/addpayname',
        '/updatePayName',
        '/update/studentpayment'
    ];
}
