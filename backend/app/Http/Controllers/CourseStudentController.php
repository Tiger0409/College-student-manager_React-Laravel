<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Classes\Helpers\EmailHelper;
use App\Classes\Helpers\QueryHelper;
use App\Classes\Helpers\StringHelper;
use App\Models\BranchAssociated;
use App\Models\Course;
use App\Models\CourseClass;
use App\Models\Instalment;
use App\Models\Log;
use App\Models\Lookup;
use App\Models\StudentPayment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\CourseStudent;
use App\Models\CourseStudentDeleted;
use Illuminate\Support\Facades\DB;

class CourseStudentController extends Controller
{
    /**
     * @param string $enumType
     * @return array|null
     */
    public function getEnumValues($enumType)
    {
        return DataFormatter::formatEnumValues(CourseStudent::getEnumValues($enumType));
    }

    public function create(Request $request)
    {
        $input = $request->all();

        if (empty($input['studentId']) || empty($input['classId'])) {
            return response()->json('', 400);
        }

        $input['courseId'] = CourseClass::find($input['classId'])->courseId;
        $student = new CourseStudent($input);
        if (!$student->save()) {
            return response()->json('Student was not saved', 500);
        }

        $student->user->addClosestBranches($student);

        return response()->json($student->asArray());
    }

    /**
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function get(Request $request, $id)
    {
        return DataFormatter::formatSingleModel(CourseStudent::find($id), $request->all());
    }

    /**
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function edit(Request $request, $id)
    {
        $model = CourseStudent::find($id);
        if (!$model) {
            return response()-json('Student was not found', 404);
        }

        $input = $request->all();
        $model->loadInput($input);
        $model->save(['saveRelations' => true]);
        Log::write(Log::ACTION_UPDATE, Log::MODULE_STUDENT, $id);
        return response()->json($model->fieldsToArray(array_keys($input)));
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function delete(Request $request) {
        $params = $request->all();
        if (isset($params['ids'])) {
            $reason = !empty($params['reason']) ? $params['reason'] : '';

            foreach ($params['ids'] as $id) {
                Log::write(Log::ACTION_DELETE, Log::MODULE_STUDENT, $id, $reason, [
                    'Fullname' => CourseStudent::find($id)->user->userFullname
                ]);
            }

            CourseStudent::whereIn('id', $params['ids'])->delete();
            return response()->json('', 204);
        }
    }


    /**
     * @param Request $request
     * @param int $userId
     * @return JsonResponse|null
     */
    public function getByUser(Request $request, $userId)
    {
        /**
         * @var User $user
         */
        if ($user = User::find($userId)) {
            $params = $request->all();
            $query = $user->courseStudents()->where('reg_status', $params['regStatus']);

            $query->with(['payments']);
            $query->orderBy('register_date', 'desc');
            $payment = $query->get()->toArray();
            $query = DataFormatter::formatQueryResult($query, $params)->getData();
            for($i = 0;$i<count($query->rows);$i++){
                $row = $query->rows[$i];
                $query->rows[$i]->payments = [];
                for ($j = 0;$j<count($payment[$i]['payments']);$j++){
                    if ($row->id === $payment[$i]['payments'][$j]['course_student_id']){
                        array_push($query->rows[$i]->payments,$payment[$i]['payments'][$j]);
                    }
                }
            }
            return response()->json($query);
        }

        return null;
    }

    public function getDeletedClassesByUser(Request $request, $userId)
    {
        if ($user = User::find($userId)) {
            $params = $request->all();
            $query = $user->courseStudentsDeleted()->where('reg_status', $params['regStatus']);
            $query->with(['payments']);
            $query->orderBy('register_date', 'desc');
            $payment = $query->get()->toArray();
            $query = DataFormatter::formatQueryResult($query, $params)->getData();
            for($i = 0;$i<count($query->rows);$i++){
                $row = $query->rows[$i];
                $query->rows[$i]->payments = [];
                for ($j = 0;$j<count($payment[$i]['payments']);$j++){
                    if ($row->id === $payment[$i]['payments'][$j]['course_student_id']){
                        array_push($query->rows[$i]->payments,$payment[$i]['payments'][$j]);
                    }
                }
            }
            return response()->json($query);
        }

        return null;
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function debtors(Request $request)
    {
        $params = $request->all();
        return response()->json(CourseStudent::getDebtors($params));
    }
    
    public function printDebtors($type, $filters = '')
    {
        $filters = json_decode($filters, true);
        $students = CourseStudent::getDebtors(['filters' => $filters])['rows'];

        $output = '';

        switch ($type) {
            case 'addresses':
                $output = view(
                    'admin.user.print-debtors-addresses',
                    ['students' => $students]
                )->render();
                break;

            case 'list':
                $output = view(
                    'admin.user.print-debtors-list',
                    ['students' => $students]
                )->render();
                break;
        }

        return response()->json($output);
    }

    /**
     * @param Request $request
     * @param $userId
     * @return JsonResponse
     */
    public function deleteByUser(Request $request, $userId)
    {
        /**
         * @var User $user
         */
        $user = User::find($userId);
        if (!$user) {
            return response()->Json('Wrong user');
        }

        $params = $request->all();
        if (!isset($params['ids'])) {
            return response()->json('None of id was selected', 400);
        }

        try {
            $courseNames =
                '(' .
                implode(',  ', array_map(function ($studentId) {
                    $student = CourseStudent::where('id', $studentId)->first();
                    if (!$student) return '';
                    return
                        $student->course->courseTitle . ' ' .
                        $student->courseClass->classTime . ' ' .
                        '(course student id : ' . $student->id . ')';
                }, $params['ids'])) .
                ')';

            foreach ($params['ids'] as $id) {
                Log::write(Log::ACTION_DELETE, Log::MODULE_STUDENT, $userId, $params['reason'] . ' ' . $courseNames, [
                    'Fullname' => CourseStudent::find($id)->user->userFullname
                ]);
            }
        } catch (\Exception $e) {
            return response()->json($e->getMessage(), 500);
        }
        $course = CourseStudent::whereIn('id', $params['ids'])->get()->toArray();
        foreach ($course as $course){
            if (!empty($params['reason']))
            {
                $course['reason']=$params['reason'];
            }

            CourseStudentDeleted::insert($course);
        }
        CourseStudent::whereIn('id', $params['ids'])->delete();
        return response()->json('', 204);
    }

    public function deleteDeletedByUser(Request $request, $userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->Json('Wrong user');
        }

        $params = $request->all();
        if (!isset($params['ids'])) {
            return response()->json('None of id was selected', 400);
        }
        try {
            $courseNames =
                '(' .
                implode(',  ', array_map(function ($studentId) {
                    $student = CourseStudentDeleted::where('id', $studentId)->first();
                    if (!$student) return '';
                    return
                        $student->course->courseTitle . ' ' .
                        $student->courseClass->classTime . ' ' .
                        '(course student id : ' . $student->id . ')';
                }, $params['ids'])) .
                ')';

            foreach ($params['ids'] as $id) {
                Log::write(Log::ACTION_DELETE, Log::MODULE_STUDENT, $userId, $params['reason'] . ' ' . $courseNames, [
                    'Fullname' => CourseStudentDeleted::find($id)->user->userFullname
                ]);
            }
        } catch (\Exception $e) {
            return response()->json($e->getMessage(), 500);
        }
        CourseStudentDeleted::whereIn('id', $params['ids'])->delete();
        return response()->json('', 204);
    }

    /**
     * @param int $id
     * @return JsonResponse
     */
    public function getFormData($id)
    {
        /**
         * @var CourseStudent $model
         */
        if (!$model = CourseStudent::find($id)) {
            return response()->json('Student was not found', 404);
        }

        $classes = DB::table(CourseClass::tableName())
            ->where('course_class_term_id', $model->courseClass->courseClassTermId)
            ->whereIn('class_gender', ['both', $model->courseClass->classGender])
            ->where('course_id', $model->courseId)
            ->get(['id', 'class_time AS classTime', 'class_gender AS classGender']);

        $feeEmployed = $model->courseClass->feeForEmployed >= 0 ?
            $model->courseClass->feeForEmployed  : $model->course->feeForEmployed;

        $feeUnemployed = $model->courseClass->feeForUnemployed >= 0 ?
            $model->courseClass->feeForUnemployed : $model->course->feeForUnemployed;
        return response()->json([
            'student' => $model->fieldsToArray([
                'course.courseTitle',
                'course.feeForEmployed',
                'course.feeForUnemployed',
                'courseClass.feeForEmployed',
                'courseClass.feeForUnemployed',
                'courseClass.term.name',
                'courseClass.classTime',
                'courseClass.classGender',
                'courseClass.classroom.classroomName',
                'courseClass.teacher.userFullname',
                'courseClass.teacher.id',
                'id',
                'studentId',
                'user.userFullname',
                'user.profile.profileGender',
                'user.id',
                'classId',
                'registerDate',
                'regStatus',
                'regPaymentStatus',
                'regPaymentMethod',
                'paymentMethod',
                'studentStatus',
                'adminNotes',
                'reducedNotes',
                'reducedAmount',
                'scores',
                'gradeStatus',
                'feedback',
                'attendanceCode',
                'score',
                'invoiceId'
            ]),
            'studentPayments' => DataFormatter::modelsToArrays($model->payments()->orderBy('date', 'desc')->get()),
            'studentOptions' => [
                'regPaymentMethod' => CourseStudent::getEnumValues('reg-payment-method'),
                'gradeStatus' => CourseStudent::getEnumValues('grade-status'),
                'studentStatus'    => [
                    'employed'    => $this->website->paymentField1 . ' (Fee: £ ' . $feeEmployed . ')',
                    'unemployed' => $this->website->paymentField2 . ' (Fee: £ ' . $feeUnemployed . ')',
                    'reduced'     => 'reduced'
                ],
            ],
            'classOptions' => $classes
        ]);
    }
    public function getFormDates(Request $request)
    {
        $ids = $request->ids;
        if (!$ids) {
            return response()->json('Student was not found', 404);
        }
        if (!$model = CourseStudent::whereIn('id', $ids)->get()) {
            return response()->json('Student was not found', 404);
        }
        $dates = [];
        foreach ($model as $model) {
            $classes = DB::table(CourseClass::tableName())
                ->where('course_class_term_id', $model->courseClass->courseClassTermId)
                ->whereIn('class_gender', ['both', $model->courseClass->classGender])
                ->where('course_id', $model->courseId)
                ->get(['id', 'class_time AS classTime', 'class_gender AS classGender']);
            $feeEmployed = $model->courseClass->feeForEmployed >= 0 ?
                $model->courseClass->feeForEmployed : $model->course->feeForEmployed;

            $feeUnemployed = $model->courseClass->feeForUnemployed >= 0 ?
                $model->courseClass->feeForUnemployed : $model->course->feeForUnemployed;
            array_push($dates,[
                'student' => $model->fieldsToArray([
                    'course.courseTitle',
                    'course.feeForEmployed',
                    'course.feeForUnemployed',
                    'courseClass.feeForEmployed',
                    'courseClass.feeForUnemployed',
                    'courseClass.term.name',
                    'courseClass.classTime',
                    'courseClass.classGender',
                    'courseClass.classroom.classroomName',
                    'courseClass.teacher.userFullname',
                    'courseClass.teacher.id',
                    'id',
                    'studentId',
                    'user.userFullname',
                    'user.profile.profileGender',
                    'user.id',
                    'classId',
                    'registerDate',
                    'regStatus',
                    'regPaymentStatus',
                    'regPaymentMethod',
                    'paymentMethod',
                    'studentStatus',
                    'adminNotes',
                    'reducedNotes',
                    'reducedAmount',
                    'scores',
                    'gradeStatus',
                    'feedback',
                    'attendanceCode',
                    'score',
                    'invoiceId'
                ]),
                'studentPayments' => DataFormatter::modelsToArrays($model->payments()->orderBy('date', 'desc')->get()),
            ]);
        }
        return response()->json($dates);
    }
    /**
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function submitFormData(Request $request, $id)
    {
        $model = CourseStudent::find($id);
        if (!$model)
            return response()->json('Student was not found', 404);

        $data = $request->all();

        $user = isset($data['student'], $data['student']['studentId']) ?
            User::find($data['student']['studentId']) : null;

        if (empty($user)) {
            return response()->json('incorrect user id', 500);
        }

        if (isset($data['student'])) {
            $model->loadInput($data['student']);
            $model->save(['saveRelations' => true]);
        }
        if (isset($data['studentPayments'])) {
            StudentPayment::updateCollection($data['studentPayments']);
        }

        return $this->getFormData($id);
    }
    public function updateStudentPayments(Request $request)
    {
        $data = $request->all();

        StudentPayment::updateCollection($data['studentPayments']);
    }
    public function printReceipt($id, $branchId)
    {
        $student = CourseStudent::find($id);
        if (is_null($student)) {
            return response()->json('Student was not found', 404);
        }

        $branch = BranchAssociated::find($branchId);
        if (!$branch || !$branch->printReceiptTemplate) {
            return response()->json('Receipt template was not found for this branch', 404);
        }

        return response()->json($student->fillReceipt($branch->printReceiptTemplate));
    }

    public function printReceiptRows(Request $request)
    {
        $input = $request->all();
        if (empty($input['studentsIds'])) {
            return response()->json('Wrong input', 400);
        }

        return response()->json(CourseStudent::fillReceiptRows($input['studentsIds']));
    }

    public function exportStudentData($id)
    {
        /**
         * @var CourseStudent $student
         */
        $student = CourseStudent::find($id);
        if (is_null($student)) {
            return response()->json('Student was not found', 404);
        }

        $studentData = $student->fieldsToArray([
            'user.userFullname',
            'course.courseTitle',
            'course.feeForEmployed',
            'course.feeForUnemployed',
            'courseClass.teacher.userFullname',
            'courseClass.term',
            'courseClass.classKeyCode',
            'courseClass.classTime',
            'user.profile.profileGender',
            'registerDate',
            'regStatus',
            'regPaymentStatus',
            'regPaymentMethod',
            'studentStatus',
            'totalAmount',
            'gradeStatus',
            'adminNotes',
            'attendance',
            'gradeStatus',
            'score',
            'reducedNotes'
        ]);
        $studentData['exams']      = $student->getExams();
        $studentData['lessons']    = $student->getLessons();

        return [
            'student'            => $studentData,
            'attendances'        => Lookup::getItems(Lookup::TYPE_ATTENDANCE_LEVEL),
            'gradeStatusOptions' => CourseStudent::getEnumValues('grade-status-enum')
        ];
    }

    public function sendInvoice($id, $branchId)
    {
        $student = CourseStudent::find($id);
        if (is_null($student)) {
            return response()->json('Student was not found', 404);
        }

        $emailAddress = $student->user->userEmailAddress;
        if (empty($emailAddress)) {
            return response()->json('No student email', 400);
        }

        $branch = BranchAssociated::find($branchId);
        $invoiceTemplate = $branch->invoiceEmailTemplate;
        if (!$branch || empty($invoiceTemplate)) {
            return response()->json('Template for this branch was not found', 404);
        }

        if (!EmailHelper::sendInvoiceEmail($student)) {
            return response()->json('', 500);
        }

        return response()->json('', 200);
    }
}
