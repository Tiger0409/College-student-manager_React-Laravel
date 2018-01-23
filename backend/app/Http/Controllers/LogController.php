<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\ArrayHelper;
use App\Classes\Helpers\DataFormatter;
use App\Models\CourseStudent;
use App\Models\Log;
use App\Models\Role;
use App\Models\StudentPayment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class LogController extends Controller
{
    /**
     * @param Request $request
     * @return array|JsonResponse
     */
    public function index(Request $request)
    {
        $params = $request->all();

        $filters = $request->has('filters') ? $request->get('filters') : null;

        $query = Log::query();
        $query->orderBy('id', 'desc');
        $query->whereHas('user', function ($query) use (&$filters) {
            $query->whereIn('user_main_role', [Role::ADMIN, Role::SUPER_ADMIN, Role::REGISTRAR]);
            if (isset($filters['userFullname'])) {
                $query->where('user_fullname', 'like', '%' . $filters['userFullname'] . '%');
            }
        });

        if (isset($filters['createdAtStart']) && !empty($filters['createdAtStart'])) {
            $query->where('created_at', '>=', $filters['createdAtStart']);
        }

        if (isset($filters['createdAtEnd']) && !empty($filters['createdAtEnd'])) {
            $query->where('created_at', '<=', $filters['createdAtEnd']);
        }

        if (!empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (!empty($filters['userId'])) {
            $query->where('module_id', $filters['userId']);
            $query->whereIn('module', [Log::MODULE_USER, Log::MODULE_STUDENT]);
        }

        return DataFormatter::formatQueryResult($query, $params);
    }
    public function getPaymentsLog(Request $request) {
        $logQuery = Log::query();
        $logQuery->where('module', Log::MODULE_STUDENT_PAYMENT);
        $params = $request->get('params');

        $payments = [];
        if (!empty($params['studentId'])) {
            $query = DB::table(StudentPayment::tableName());

            $query->where('course_student_id', $params['studentId']);

            $payments = $query->get();

            $logQuery->where('logging_data', 'like', '%"studentId";i:' . $params['studentId'] .';%');

        } else if (!empty($params['userId'])) {
            $query = DB::table(CourseStudent::tableName());
            $query->where('student_id', $params['userId']);
            $students = $query->get();

            $query = DB::table(StudentPayment::tableName());
            $query->whereIn('course_student_id', array_map(function ($s) { return $s->id; }, $students));
            $payments = $query->get();

            $logQuery->where('logging_data', 'like', '%"userId";i:' . $params['userId'] .';%');
        }

        $logQuery->orWhereIn('module_id', array_map(function ($payment) { return $payment->id; }, $payments));
        $logQuery->orderBy('created_at', 'desc');
        return DataFormatter::modelsFieldsToArray($logQuery->get(), $request->get('fields'));
    }

    /*public function getPaymentsLog(Request $request) {
        $logQuery = Log::query();
        $logQuery->where('module', Log::MODULE_STUDENT_PAYMENT);

        $params = $request->get('params');

        $payments = [];
        if (!empty($params['studentId'])) {
            $query = DB::table(StudentPayment::tableName());
            $query->where('course_student_id', $params['studentId']);

            $payments = $query->get();
        } else if (!empty($params['userId'])) {
            $query = DB::table(CourseStudent::tableName());
            $query->where('student_id', $params['userId']);
            $students = $query->get();

            $query = DB::table(StudentPayment::tableName());
            $query->whereIn('course_student_id', array_map(function ($s) { return $s->id; }, $students));
            $payments = $query->get();
        }

        $logQuery->whereIn('module_id', array_map(function ($payment) { return $payment->id; }, $payments));
        $logQuery->orderBy('created_at', 'desc');

        return DataFormatter::modelsFieldsToArray($logQuery->get(), $request->get('fields'));
    }*/

    /**
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function get(Request $request, $id) {
        return DataFormatter::formatSingleModel(Log::find($id), $request->all());
    }

    public function logActions() {
        return response()->json([
            ['label' => 'Create', 'value' => Log::ACTION_CREATE],
            ['label' => 'Update', 'value' => Log::ACTION_UPDATE],
            ['label' => 'Delete', 'value' => Log::ACTION_DELETE],
            ['label' => 'Login',  'value' => Log::ACTION_LOGIN],
        ]);
    }
}
