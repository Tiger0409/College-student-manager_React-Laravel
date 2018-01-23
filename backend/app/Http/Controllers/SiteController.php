<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SiteController extends Controller
{
    public function homePage(Request $request)
    {
        $urlToRedirect = "login";

        if (Auth::check()) {
            /**
             * @var User $user
             */
            $user = Auth::user();
            if ($user) {
                switch ($user->userMainRole) {
                    case Role::SUPER_ADMIN:
                    case Role::ADMIN:
                    case Role::REGISTRAR:
                    case Role::TEACHER:
                        $urlToRedirect = "dashboard";
                        break;
                    case Role::STUDENT:
                        $urlToRedirect = "courses";
                        break;
                }
            }
        }

        return redirect($urlToRedirect);
    }

    public function test()
    {
        return response()->json('Test');
    }
}
