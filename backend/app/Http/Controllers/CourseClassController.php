<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\ArrayHelper;
use App\Classes\Helpers\DataFormatter;
use App\Classes\Helpers\EmailHelper;
use App\Models\BranchAssociated;
use App\Models\Course;
use App\Models\CourseClass;
use App\Models\CourseClassGroup;
use App\Models\CourseStudent;
use App\Models\Dept;
use App\Models\Log;
use App\Models\Lookup;
use App\Models\Role;
use App\Models\Term;
use App\Models\User;
use App\Models\Website;
use App\Models\GeneralSetting;
use common\models\Student;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Query\Builder;

class CourseClassController extends Controller
{

    public function index(Request $request)
    {
        $query = CourseClass::query()->with(['course', 'course.dept']);
        $input = $request->all();

        if (!empty($input['filters'])) {
            $filters = $input['filters'];

            if (!empty($filters['term'])) {
                $termId = $filters['term'] == 'active' ? Website::active()->activeTermId : $filters['term'];
                $query->where('course_class_term_id', $termId);
            }

            if (!empty($filters['course'])) {
                $query->where('course_id', $filters['course']);
            }


            if (!empty($filters['regIsOpen'])) {
                $query->where('course_class_registration_open', $filters['regIsOpen']);
            }

            if (!empty($filters['limit'])) {
                $query->take($filters['limit']);
            }

            /** @var User $targetUser */
            if (!empty($filters['targetUser']) && $targetUser = User::find($filters['targetUser'])) {
                $excludedClasses = [];

                foreach ($targetUser->courseStudents as $courseStudent) {
                    $excludedClasses[] = $courseStudent->classId;
                }

                $basket = $targetUser->getBasket();
                if ($basket) {
                    foreach ($basket->cartItems as $cartItem) {
                        $excludedClasses[] = $cartItem->classId;
                    }
                }

                $query->whereIn('class_gender', [$targetUser->profile->profileGender, 'both']);
                $query->whereNotIn('id', $excludedClasses);
            }

            if (!empty($filters['userIds'])) {
                foreach ($filters['userIds'] as $userId) {
                    if ($user = User::find($userId)) {
                        foreach ($user->courseStudents as $courseStudent) {
                            $classIds[] = $courseStudent->classId;
                        }

                        $query->whereIn('id', $classIds);
                    }
                }
            }

            if (!empty($filters['branchId'])) {
                $branchId = $filters['branchId'];
                $query->whereHas('course.dept', function ($query) use ($branchId) {
                    $query->where('dept_branch_id', $branchId);
                });
            }
        }

        /** @var User $user */
        $user = Auth::user();
        if ($user->userMainRole == Role::REGISTRAR) {
            $allowedBranches = explode('_', $user->allowedBranches);

            $query->where('course_class_term_id', Website::active()->activeTermId);

            $query->whereHas('course.dept.branchAssociated', function ($query) use ($allowedBranches) {
                $query->whereIn('id', $allowedBranches);
            });
        }
        return DataFormatter::formatQueryResult($query, $input);
    }

    /**
     * @param Request $request
     * @return array
     */
    public function getList(Request $request)
    {
        $params = $request->all();
        $query = DB::table(CourseClass::tableName() . ' as cc');
        $query->leftJoin(Course::tableName() . ' as c', 'c.id', '=', 'cc.course_id');
        $query->leftJoin(Term::tableName() . ' as t', 't.id', '=', 'cc.course_class_term_id');
        $query->leftJoin(Dept::tableName() . ' as d', 'd.id', '=', 'c.dept_id');

        $query->orderBy('cc.id', 'desc');

        $query->select([
            'cc.id as id',
            'cc.class_time as classTime',
            'cc.class_gender as classGender',
            'c.course_title as courseTitle',
            't.term as term',
            't.year as year',
        ]);

        foreach ($params as $key => $value) {
            if ($value === 'All') {
                unset($params[$key]);
            }
        }

        if (!empty($params['courseId'])) {
            $query->where('c.id', $params['courseId']);
        }

        if (!empty($params['branchId'])) {
            $query->where('d.dept_branch_id', $params['branchId']);
        }

        if (isset($params['termId'])) {
            $termId = $params['termId'];

            if ($termId === 'active') {
                $activeTerm = Term::activeTerm();
                if ($activeTerm) {
                    $termId = $activeTerm->id;
                }
            }

            $query->where('cc.course_class_term_id', $termId);
        }

        if (isset($params['classGender'])) {
            $query->where('cc.class_gender', $params['classGender']);
        }

        //$query->orderBy('c.courseTitle');

        $courseClasses = $query->get();

        $classesList = [];
        foreach ($courseClasses as $courseClass) {
            $title = $courseClass->courseTitle . ' - ' . $courseClass->classTime;
            if (!empty($courseClass->term) && !empty($courseClass->year)) {
                $title .= ' (' . $courseClass->year .
                    ', term ' . $courseClass->term .
                    ', ' . $courseClass->classGender . ')';
            }

            $classesList[] = [
                'value' => $courseClass->id,
                'label' => $title
            ];
        }

        return $classesList;
    }

    /**
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function get(Request $request, $id) {
        return DataFormatter::formatSingleModel(CourseClass::find($id), $request->all());
    }

    /**
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getGroupedList(Request $request)
    {
       // var_dump(CourseClass::getGrouped($request->all()));exit;
        return response()->json(CourseClass::getGrouped($request->all()));
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function delete(Request $request)
    {
        $params = $request->all();
        if (isset($params['ids'])) {
            $reason = !empty($params['reason']) ? $params['reason'] : '';

            foreach ($params['ids'] as $id) {
                $courseClass = CourseClass::with('course')->find($id);

                Log::write(Log::ACTION_DELETE, Log::MODULE_CLASS, $id, $reason, [
                    'classTime'   => $courseClass->classTime,
                    'courseTitle' => $courseClass->course->courseTitle
                ]);
            }

            CourseClass::whereIn('id', $params['ids'])
                ->has('courseStudents', '=', 0)
                ->delete();

            return response()->json('', 204);
        }
    }

    /**
     * @param Request $request
     * @param string $id
     * @return array
     */
    public function edit(Request $request, $id)
    {
        $model = CourseClass::find($id);
        if (!$model) {
            return response()->json('Course class was not found', 404);
        }
        $input = $request->all();

        $model->loadInput($input);
        $model->save(['saveRelations' => true]);

        $logData = [
            'classTime'   => $model->classTime,
            'courseTitle' => $model->course->courseTitle,
        ];

        $logData = array_merge($logData, $input);
        unset($logData['requestFields']);

        Log::write(Log::ACTION_UPDATE, Log::MODULE_CLASS, $model->id, '', $logData);

        $model->fresh();

        if (!empty($input['requestFields'])) {
            $fields = $input['requestFields'];
        } else {
            $fields = array_keys($input);
        }

        return response()->json($model->fieldsToArray($fields));
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function create(Request $request)
    {
        $model = new CourseClass();
        $model->loadInput($request->all());
        $model->save();

        Log::write(Log::ACTION_CREATE, Log::MODULE_CLASS, $model->id, '', [
            'classTime'   => $model->classTime,
            'courseTitle' => $model->course->courseTitle
        ]);

        return response()->json($model->asArray());
    }

    /**
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function getStudents(Request $request, $id)
    {
        /** @var CourseClass $model */
        if ($model = CourseClass::find($id)) {
            $students = $model->courseStudents();
            $params = $request->all();
            return DataFormatter::formatQueryResult($students, $params);
        }
        return response()->json('Course class was not found', 404);
    }

    public function printMultipleData(Request $request, $type) {

        if (!$request->has('classIds')) {
            throw new \BadMethodCallException('Classes was not selected');
        }
        $ids = $request->get('classIds');
        return response()->json($this->preparePrint(CourseClass::whereIn('id', $ids)->get()->all(), $type));
    }
    public function printMultipleDataAll(Request $request,$term, $type)
    {
        if (!$request->has('classIds')) {
            throw new \BadMethodCallException('Classes was not selected');
        }
        $ids = $request->get('classIds');
        return response()->json($this->preparePrint(CourseClass::whereIn('id', $ids)->get()->all(), $type, $term));
    }
    public function printData($id, $type)
    {
        $courseClass = CourseClass::where('id', $id)->with(['course.dept'])->first();
        if (!$courseClass) {
            throw new ModelNotFoundException('Class with id ' . $id . ' was not found');
        }
        return response()->json($this->preparePrint([$courseClass], $type));
    }
    private function preparePrint($courseClasses, $type, $term = null)
    {

        $data = array_map(function (CourseClass $courseClass) {
            $students = CourseStudent::where(['class_id' => $courseClass->id, 'reg_status' => 'active'])
                ->has('user')
                ->get()
                ->sortBy(function ($student, $key) {
                    return trim($student->user->userFullname);
                })
                ->values();

            return [
                'courseClass' => $courseClass,
                'students'    => $students
            ];
        }, $courseClasses);

        switch ($type) {
            case 'weekday-registers':
            case 'weekend-registers':
            case 'adults':
                $view = view(
                    'admin.class.print-registers',
                    [
                        'data' => $data,
                        'type' => $type
                    ]
                )->render();

                break;
            case 'certificates-all':
                $studentsIds = [];
                $activeTerm = $term;
                $courseId = $courseClasses[0]->course_id;
                foreach ($courseClasses as $data){
                    foreach ($data->courseStudents as $st){
                        array_push($studentsIds,$st->student_id);
                    }
                }
                $students = User::whereIn('id',$studentsIds)
                    ->with(['courseStudents'=>function ($query) use($courseId){
                        $query->where('t_course_student.course_id',$courseId);
                    },'courseStudents.courseClass'=>function ($query) use($courseId,$activeTerm){
                        $query->where('t_course_class.course_id',$courseId);
                        $query->where('t_course_class.course_class_term_id',$activeTerm);
                    },
                        'courseStudents.course'=>function($query) use ($courseId){
                            $query->where('t_course.id',$courseId)->orderBy('weight');
                        }])

                    ->get()
                    ->toArray();

                    
                $view = view(
                    'admin.class.print-certificates',
                    ['students' => $students, 'namesOnly' => false,'all'=>true]
                )->render();
                break;
            // TODO: make support for multiple classes printing for other print types
            case 'address-labels':
                $view = view(
                    'admin.class.print-address-labels',
                    ['students' => $data[0]['students']]
                )->render();

                break;

            case 'address-labels-plus':
                $view = view(
                    'admin.class.print-address-labels-plus',
                    ['students' => $data[0]['students']]
                )->render();
                break;

            case 'phone-numbers':
                $view = view(
                    'admin.class.print-phone-numbers',
                    ['students' => $courseClasses[0]->courseStudents]
                )->render();

                break;

            case 'report':
                $attendanceOptions = Lookup::getItems(Lookup::TYPE_ATTENDANCE_LEVEL);
                $attendanceOptions[] = ['label' => 'custom', 'value' => '0'];

                $data = $courseClasses[0]->getExamResults();

                $view = view(
                    'admin.class.print-report',
                    [
                        'courseClass'       => $courseClasses[0],
                        'students'          => $data['students'],
                        'examResults'       => $data['examResults'],
                        'attendanceOptions' => $attendanceOptions
                    ]
                )->render();

                break;

            case 'certificates':
                $view = view(
                    'admin.class.print-certificates',
                    ['students' => $courseClasses[0]->courseStudents->sortBy(function ($student, $key) {
                        return trim($student->user->userFullname);
                    }), 'namesOnly' => false]
                )->render();
                break;
            case 'certificates-names-only':
                $view = view(
                    'admin.class.print-certificates',
                    ['students' => $courseClasses[0]->courseStudents->sortBy(function ($student, $key) {
                        return trim($student->user->userFullname);
                    }), 'namesOnly' => true]
                )->render();

                break;
        }

        if ($this->website && $this->website->coursePrintoutTemplate) {
            $template = $this->website->coursePrintoutTemplate;
            $printData = str_replace('%DATA%', $view, $template);
        } else {
            $printData = $view;
        }

        return $printData;
    }

    public function sendEmailToStudents(Request $request, $classId)
    {
        $courseClass = CourseClass::find($classId);
        if (!$courseClass) {
            return response()->json('Course class was not found', 404);
        }

        $input = $request->all();

        $errors = [];
        $requiredVars = ['subject', 'messageContent'];
        foreach ($requiredVars as $var) {
            if (empty($input[$var])) {
                $errors[] = "$var was not set";
            }
        }

        if (!empty($errors)) {
            return response()->json($errors, 400);
        }

        $subject = $input['subject'];
        $messageContent = $input['messageContent'];

        $students = $courseClass->courseStudents;

        $result = true;
        foreach ($students as $student) {
            if (!empty($student->user->userEmailAddress)) {
                $result &= EmailHelper::sendEmail($student->user->userEmailAddress, $subject, $messageContent);
            }
        }

        if (!$result) {
            return response('Not all messages was sent', 500);
        }

        return response()->json();
    }


    public function swapClasses(Request $request)
    {

        $input = $request->all();

        if (empty($input['sourceClass']) || empty($input['targetClass'])) {
            return response()->json('Not all classes supplied', 400);
        }

        $classes = CourseClass::whereIn('id', [$input['sourceClass']['id'], $input['targetClass']['id']])->get();

        if (count($classes) !== 2) {
            return response()->json('Wrong classes sent', 404);
        }

        $classes[0]->classWeight += $classes[1]->classWeight;
        $classes[1]->classWeight = $classes[0]->classWeight - $classes[1]->classWeight;
        $classes[0]->classWeight -= $classes[1]->classWeight;

        $classes[0]->save();
        $classes[1]->save();

        return response()->json();
    }

    public function getAvailable(Request $request)
    {
        $allClasses = null;
        $isEarlyBirdOn = GeneralSetting::getValue('early_bird_on', 'no');
        /** @var Builder $query */
        $query = DB::table(CourseClass::tableName() . ' as cc');
        $query->leftJoin(Course::tableName() . ' as c', 'c.id', '=', 'cc.course_id');
        $query->leftJoin(Dept::tableName() . ' as d', 'd.id', '=', 'c.dept_id');
        $query->leftJoin(BranchAssociated::tableName() . ' as b', 'b.id', '=', 'd.dept_branch_id');
        $query->leftJoin(Term::tableName() . ' as t', 't.id', '=', 'cc.course_class_term_id');
        $query->select([
            'cc.id as id',
            'cc.class_time as classTime',
            'cc.class_gender as classGender',
            'cc.class_weight as classWeight',
            'cc.class_description as classDescription',
            'cc.fee_for_employed as feeForEmployed',
            'cc.fee_for_unemployed as feeForUnemployed',

            't.id as term.id',
            't.name as term.name',
            't.term as term.term',
            't.year as term.year',
            't.part_time_description as term.partTimeDescription',
            't.full_time_description as term.fullTimeDescription',

            'c.id as course.id',
            'c.course_title as course.courseTitle',
            'c.course_description as course.courseDescription',
            'c.fee_for_employed as course.feeForEmployed',
            'c.fee_for_unemployed as course.feeForUnemployed',
            'c.course_subtitle as course.courseSubtitle',
	    'c.course_structure as course.courseStructure',
            'c.is_full_time as course.isFullTime',
            'c.weight as course.weight',
            DB::raw("'{$isEarlyBirdOn}' as `course.isEarlyBirdOn`"),

            'd.id as course.dept.id',
            'd.dept_name as course.dept.deptName',
            'd.weight as course.dept.weight',

            'b.id as course.dept.branchAssociated.id',
            'b.branch_name as course.dept.branchAssociated.branchName',
            'b.branch_weight as course.dept.branchAssociated.branchWeight',
        ]);

        $query->where('cc.course_class_registration_open', 'yes');

        if (!empty($request->get('userId')) && empty($request->get('allClasses'))) {
            $user = User::find($request->get('userId'));
            if ($user) {
                $userStudents = CourseStudent::where('student_id', $user->id)->get(['class_id']);
                $alreadyTakenClasses = [];
                foreach ($userStudents as $student) {
                    if (!in_array($student->classId, $alreadyTakenClasses)) {
                        $alreadyTakenClasses[] = $student->classId;
                    }
                }

                $query->whereNotIn('cc.id', $alreadyTakenClasses);
                if ($user->profile) {
                    $query->whereIn('cc.class_gender', [$user->profile->profileGender, 'both']);
                }
            }
        }

        $activeTermIds = [];
        foreach ($this->website->branchesAssociated as $branch) {
            foreach ($branch->terms as $term) {
                $activeTermIds[] = $term->id;
            }
        }

        $query->whereIn('cc.course_class_term_id', $activeTermIds);
        $query->whereIn('d.dept_branch_id', explode('_', $this->website->branchId));

        $records = $query->get();
        for ($i = 0; $i < count($records); $i++) {
            $records[$i] = get_object_vars($records[$i]);
            foreach ($records[$i] as $prop => $value) {
                if (strpos($prop, '.') !== false) {
                    $path = explode('.', $prop);
                    $nestedValue = DataFormatter::createObjByPath($path, $value);

                    $records[$i] = array_merge_recursive($records[$i], $nestedValue);
                    unset($records[$i][$prop]);
                }
            }
        }

        return response()->json($records);
    }

    // older and slower version of getAvailable
    public function getAvailable2(Request $request)
    {
        $classQuery = CourseClass::query();
        $input = $request->all();

        $classQuery->with(['course', 'course.dept', 'course.dept.branchAssociated', 'term']);
        $classQuery->where('course_class_registration_open', 'yes');

        if (!empty($input['userId'])) {
            $user = User::find($input['userId']);
            if ($user) {
                $userStudents = CourseStudent::where('student_id', $user->id)->get(['course_id']);
                $alreadyTakenCourses = [];
                foreach ($userStudents as $student) {
                    if (!in_array($student->courseId, $alreadyTakenCourses)) {
                        $alreadyTakenCourses[] = $student->courseId;
                    }
                }

                $classQuery->whereNotIn('course_id', $alreadyTakenCourses);
                $classQuery->where('class_gender', $user->profile->profileGender);
            }
        }

        $activeTermIds = [];
        foreach ($this->website->branchesAssociated as $branch) {
            foreach ($branch->terms as $term) {
                $activeTermIds[] = $term->id;
            }
        }

        $classQuery->whereIn('course_class_term_id', $activeTermIds);

        $classQuery->whereHas('course.dept', function ($query) {
            $query->whereIn('dept_branch_id', explode('_', $this->website->branchId));
        });

        $courseClasses = $classQuery->get()->toArray();
        $result = ArrayHelper::underscoreKeysToCamelCase($courseClasses, true);

        return response()->json($result);
    }

    public function getUserClasses(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json('Authentication required', 403);
        }
        $query = $user->courseStudents();
//        $query = CourseStudent::where('student_id',50307);
//        dd($query->payments()->orderBy('date', 'desc')->get());
        $ids = [];
        foreach ($query->get() as $q){
            array_push($ids,$q->id);
        }
//        dd($ids);

        $query->with([
            'courseClass.exams.scores'=>function($query) use ($ids){
                $query->whereIn('t_additional_score.id_course_student',$ids);
            },
            'courseClass.classWorks'=>function($query){
            $query->orderBy('t_class_work.date','ASC');
        },
            'studentAbsent'=>function($query){
            $query->orderBy('t_absent.date','ASC');
        },'payments']);

//        $rows = DataFormatter::formatQueryResult($query, $request->all())->getData();
//        dd($rows);
        return DataFormatter::formatQueryResult($query, $request->all());
    }
}
