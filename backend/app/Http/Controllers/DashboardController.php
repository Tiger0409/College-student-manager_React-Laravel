<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseClass;
use App\Models\CourseStudent;
use App\Models\Role;
use App\Http\Requests;
use App\Models\Term;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        if (!Auth::check())
            return response('Not authorized', 401);

        $user = Auth::user();
        $data = ['website' => $this->website];

        $term = null;

        if ($request && $request->has('term'))
            $term = Term::find($request->input('term'));

        if ($term == null)
            $term = Term::activeTerm();

        if (in_array($user->userMainRole, [Role::SUPER_ADMIN, Role::ADMIN])) {
            $data['info'] = [
                'Total System Students'               =>
                    CourseStudent::countByGender('male') .
                    ' Male ' .
                    CourseStudent::countByGender('female') .
                    ' Female',

                'Active courses this term' =>
                    Course::countInTerm($term->id) . '/' . Course::count(),

                'Active classes this term' =>
                    CourseClass::where('course_class_term_id', $term->id)->count(),

                'Students this term' =>
                    CourseStudent::countInTermByGender($term->id, 'male') .
                    ' Male ' .
                    CourseStudent::countInTermByGender($term->id, 'female') .
                    ' Female',

                'Students' =>
                    CourseStudent::countContinuing($term->id) .
                    ' Continuing ' .
                    CourseStudent::countNew($term->id) .
                    ' New'
            ];

            if ($user->userMainRole == Role::SUPER_ADMIN) {
                $data['info']['Total income this term'] =
                    '£' . CourseStudent::countIncomeInTerm($term->id) . '/£' . CourseStudent::countExpectedIncomeInTerm($term->id);
            }
        } else if ($user->userMainRole == Role::REGISTRAR) {
            $data['info'] = [
                'Classes'  => CourseClass::count(),
                'Students' => CourseStudent::count()
            ];
        }

        if ($request->ajax())
            return response()->json($data['info']);

        return view($this->getViewPath(__FUNCTION__), $data);
    }
}
