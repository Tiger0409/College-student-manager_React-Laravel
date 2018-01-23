<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Validator;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $input = $request->all();
        if (empty($input['userName']) || empty($input['password'])) {
            return response()->json("Invalid login data", 400);
        }

        $userName = $input['userName'];
        $password = $input['password'];

        /**
         * @var User $user
         */
        $user = User::where('user_name', $userName)->orWhere('user_email_address', $userName)->first();

        if (!$user) {
            return response()->json("User with such name or email doesn't exists", 404);
        }

        if (sha1($password, null) != $user->userPassword) {
            return response()->json("Invalid login data", 400);
        }

        Auth::login($user, true);
        Log::writeLogin($user);

        return response()->json();
    }

    public function logout(Request $request)
    {
        Auth::logout();
        if ($request->ajax())
            return response()->json('ok');
    }

    public function getCurrentUser(Request $request)
    {
        $user = Auth::user();

        if (is_null($user)) {
            return response()->json('Not authorized', 401);
        }

        return response()->json($user->asArray(null, true));
    }

    public function checkUsername(Request $request)
    {
        $username = $request->get('username');
        $fields = $request->get('fields');

        $user = User::where(
            function ($query) use ($username, $fields) {
                if (empty($fields) || in_array('username', $fields)) {
                    $query->orWhere('user_name', $username);
                }

                if (empty($fields) || in_array('userEmailAddress', $fields)) {
                    $query->orWhere('user_email_address', $username);
                }
            }
        )->first();

        if (!$user) {
            return response()->json('User was not found', 404);
        }

        return response()->json();
    }
}
