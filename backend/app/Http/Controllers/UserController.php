<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\CraftyClicksAPI;
use App\Classes\Helpers\DataFormatter;
use App\Classes\Helpers\EmailHelper;
use App\Models\Branch;
use App\Http\Controllers\PayNameController;
use App\Models\BranchAssociated;
use App\Models\CourseStudent;
use App\Models\ExtendedModel;
use App\Models\HearPlace;
use App\Models\Log;
use App\Models\LogAction;
use App\Models\PayName;
use App\Models\LogModule;
use App\Models\Profile;
use App\Models\CourseClass;
use App\Models\Role;
use App\Models\Term;
use App\Models\User;
use App\Models\Absent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\Routing\Tests\Fixtures\RedirectableUrlMatcher;


class UserController extends Controller
{
    /**
     * @param Request $request
     * @param string $role
     * @param string $option
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function index(Request $request, $role = 'students', $option = 'list')
    {
        // sending some data based on post array
        if ($request->ajax()) {
            return $this->search($role, $request->all());
        }
    }

    public function getUsers(Request $request)
    {
        $params = $request->all();

        $query = User::query();
        if (isset($params['roles'])) {
            $roleIds = [];
            foreach ($params['roles'] as $role) {
                $roleIds[] = Role::roleNameToId($role);
            }

            $query->whereIn('user_main_role', $roleIds);
        }

        $query->where('log_enabled', 1);

        return DataFormatter::formatQueryResult($query, $params);
    }

    /**
     * @param $role
     * @return JsonResponse
     */
    public function getNamesList(Request $request, $role)
    {
        $query = DB::table(User::tableName() . ' AS u');
        $query->select(['u.id AS id', 'u.user_fullname AS name']);
        $query->leftJoin(Role::tableName() . ' AS r', 'r.id', '=', 'u.user_main_role');
        $query->leftJoin(Profile::tableName() . ' AS p', 'p.user_id', '=', 'u.id');
        $query->where('r.role_name', $role);

        if ($request->has('gender') && $request->get('gender') != 'both') {
            $query->where('p.profile_gender', $request->get('gender'));
        }

        $query->orderBy('name');
        $users = $query->get();

        $output = [];
        foreach ($users as $user) {
            $output[] = [
                'value' => $user->id,
                'label' => $user->name
            ];
        }

        return response()->json($output);
    }

    /**
     * @param Request $request
     * @param string $role
     * @return array|JsonResponse
     */
    public function getByRole(Request $request, $role)
    {
        $input = $request->all();
        if ($request->has('termId') && gettype($request->input("branchId")) != 'array' && !empty($request->input('termId')))
        {
            $query = CourseClass::query()->with(['course', 'course.dept'])
                    ->select('teacher_id')
                    ->distinct();
            $filters = $input['termId'];

            if (!empty($filters)) {
                $termId = $filters == 'active' ? Website::active()->activeTermId : $filters;
                $query->where('course_class_term_id', $termId);
            }
            $rows = $query->get();
            $x = [];
            foreach ($rows as $row){
                if ($row->teacher_id != 0){
                    array_push($x,$row->teacher_id);
                }
            }
            $query = User::whereIn("t_user.id",$x)
                ->select('t_user.id','t_user.user_status','t_user.user_fullname','t_branches_associated.id as branchId','t_branches_associated.branch_name','t_profile.teacher_hourly_rate','t_payname_user_time.user_default_time_in','t_payname_user_time.user_default_time_out')
                ->distinct()
                ->leftjoin('t_profile','t_profile.user_id','=','t_user.id')
                ->leftjoin('t_course_class','t_course_class.teacher_id','=','t_user.id')
                ->leftjoin('t_course','t_course.id','=','t_course_class.course_id')
                ->leftjoin('t_dept','t_dept.id','=','t_course.dept_id')
                ->leftjoin('t_branches_associated','t_branches_associated.id','=','t_dept.dept_branch_id')
                ->leftjoin('t_payname_user_time','t_payname_user_time.user_id','=','t_user.id')
                ->where("user_main_role",Role::roleNameToId($role))
                ->orderBy('t_profile.profile_gender','asc');
            if (!empty($request->input('branchId'))){
                $query->where('t_branches_associated.id',$request->input('branchId'));
            }
            $count = count($query->get());
            $rows =  DataFormatter::formatQueryResult($query,$request->all())->getData();
            $rows->info = array('totalCount'=>$count);
            foreach ($rows->rows as $row){
                if (isset($row->userDefaultTimeOut) && isset($row->userDefaultTimeIn))
                {
                    $list = PayNameController::getTotalList($request,$row->userDefaultTimeIn,$row->userDefaultTimeOut)->getData();
                }
                else{
                    $list = PayNameController::getTotalList($request)->getData();
                }
                $row->totalPayName=(array)$list;
            }
            return response()->json($rows);
        }elseif (isset($request->input("branchId")['branchId']) && !empty($request->input("branchId")['branchId'])){
            $x = DB::table("t_user_closest_branches")
                ->where('branch_associated_id',$request->input("branchId")['branchId'])
                ->select('user_id')
                ->get();
            $y = [];
            foreach ($x as $x){
                array_push($y,$x->user_id);
            }
            $query = User::whereIn("t_user.id",$y)
                ->where("user_main_role",Role::roleNameToId($role))
                ->leftjoin('t_user_closest_branches','t_user.id','=','user_id')
                ->leftjoin('t_branches_associated','t_user_closest_branches.branch_associated_id','=','t_branches_associated.id')
                ->select('t_user.id','t_user.user_status','t_user.user_fullname','t_branches_associated.branch_name');
            return DataFormatter::formatQueryResult($query,$request->all());
        }
        else {
            $query = User::where('user_main_role', Role::roleNameToId($role))
                ->leftjoin('t_user_closest_branches','t_user.id','=','user_id')
                ->leftjoin('t_branches_associated','t_user_closest_branches.branch_associated_id','=','t_branches_associated.id')
                ->select('t_user.id','t_user.user_status','t_user.user_fullname','t_branches_associated.branch_name');
            return DataFormatter::formatQueryResult($query,$request->all());
        }
    }
    public function getByBranchID(Request $request,$role,$branchID)
    {
        dd($branchID);
    }
    public function getByPayName(Request $request,$PayNameId)
    {
        if($PayNameId == 'Select Pay name'){
            return response()->json([
                'info'=>['totalCount'=>0],
                'rows'=>[]
            ]);
        }
        $row = PayName::select('selected_term','branch_id')
                        ->where('id',$PayNameId)
                        ->first();
        $term_id = $row->selected_term;
        $branch_id = $row->branch_id;
        $query = CourseClass::query()->with(['course', 'course.dept'])
            ->select('teacher_id')
            ->distinct();
        $termId = $term_id == 'active' ? Website::active()->activeTermId : $term_id;
        $query->where('course_class_term_id', $termId);
        $rows = $query->get();
        $x = [];
        foreach ($rows as $row){
            if ($row->teacher_id != 0){
                array_push($x,$row->teacher_id);
            }
        }
        $query = User::whereIn("t_user.id",$x)
            ->select('t_user.id','t_user.user_status','t_user.user_fullname','t_branches_associated.id as branchId','t_branches_associated.branch_name','t_profile.teacher_hourly_rate','t_payname_user_time.user_default_time_in','t_payname_user_time.user_default_time_out')
            ->distinct()
            ->leftjoin('t_profile','t_profile.user_id','=','t_user.id')
            ->leftjoin('t_course_class','t_course_class.teacher_id','=','t_user.id')
            ->leftjoin('t_course','t_course.id','=','t_course_class.course_id')
            ->leftjoin('t_dept','t_dept.id','=','t_course.dept_id')
            ->leftjoin('t_branches_associated','t_branches_associated.id','=','t_dept.dept_branch_id')
            ->leftjoin('t_payname_user_time','t_payname_user_time.user_id','=','t_user.id')
            ->where("user_main_role",'4')
            ->orderBy('t_profile.profile_gender','asc');
            $query->where('t_branches_associated.id',$branch_id);
            $rows =  DataFormatter::formatQueryResult($query,$request->all())->getData();
            $rows->info = array('totalCount'=>count($rows->rows));
        foreach ($rows->rows as $row){
            if (isset($row->userDefaultTimeOut) && isset($row->userDefaultTimeIn))
            {
                $list = PayNameController::getTotalList($request,$row->userDefaultTimeIn,$row->userDefaultTimeOut,$term_id,$branch_id)->getData();
//                echo '<pre>';
//                var_dump($list);
            }
            else{
                $list = PayNameController::getTotalList($request,null,null,$term_id,$branch_id)->getData();
            }
            $row->totalPayName=(array)$list;
        }
//        die;
        return response()->json($rows);
    }
    public function getWaiting(Request $request)
    {
        return User::getWaiting($request->all());
    }

    /**
     * @param string $role
     * @param array $filters
     * @return array
     * Searches profiles based on role and filters
     */
    public function search($role, $filters)
    {
        switch ($role) {
            case 'students':
                try {
                    $profiles = Profile::getByFilters($filters);
                    if (is_array($profiles)) {
                        foreach ($profiles['rows'] as &$profile) {
                            $profile->closestBranches = User::find($profile->profileId)->closestBranches()->get()->map(
                                function (BranchAssociated $branch) {
                                    return $branch->branchName;
                                }
                            );
                        }
                    }

                    return $profiles;
                }
                catch (\Exception $exception) {
                    return $exception->getMessage();
                }
        }

        return 'error';
    }

    /**
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     */
    public function get(Request $request, $userId)
    {
        $user = User::find($userId);
        if (!$user) {
            return response()->json("User with id $userId was not found", 404);
        }

        if (!$user->profile) {
            $user->createProfile();
        }

        /**
         * @var User $user
         */
        $params = $request->all();
        if (isset($params['fields'])) {
            return DataFormatter::formatSingleModel($user, $params);
        }

        if ($user) {

            //            dd($user->asArray(['carts'], false));
            return response()->json($user->asArray(['carts'], false));
        }

        return null;
    }

    /**
     * @param Request $request
     * @param int $userId
     * @return JsonResponse
     */
    public function edit(Request $request, $userId)
    {
        /** @var User $user */
        $user = Auth::user();
        if (
            $user->id != $userId &&
            in_array($user->role->roleName, [Role::ADMIN, Role::SUPER_ADMIN, Role::REGISTRAR])
        ) {
            return response()->json('', 403);
        }

        $afterEdit = function ($model) {
            Log::writeUser(Log::ACTION_UPDATE, $model);
        };

        $input = $request->all();
        if (isset($input['data'])) $input = $input['data'];
        if (isset($input['hearPlaceId']) && $input['hearPlaceId'] == -1) {
            if (!empty($input['otherHearPlace'])) {
                $hearPlace = HearPlace::findOrCreate([
                    'place_name' => $input['otherHearPlace'],
                    'is_visible' => false
                ]);
                $input['hearPlaceId'] = $hearPlace->id;
            } else {
                unset($input['hearPlaceId']);
            }
        }

        // TODO: relatives ops are handled via actions addRelative/removeRelative, needs refactoring
        unset($input['relatives']);
        unset($input['hearPlace']);
        if(isset($input['age']) && !empty($input['age'])){
            $time = strtotime($input['age']);
            $input['age'] = date('Y-m-d',$time);
        }
        $input['fields'] = array_merge(array_keys($input), ['relatives']);
        return $this->editModel(User::className(), $input, $userId, ['saveRelations' => true], $afterEdit);
    }

    public function create(Request $request)
    {
        $input = $request->all();
        $user = new User();

        if (isset($input['hearPlaceId']) && $input['hearPlaceId'] == -1) {
            if (!empty($input['otherHearPlace'])) {
                $hearPlace = HearPlace::findOrCreate([
                    'place_name' => $input['otherHearPlace'],
                    'is_visible' => false
                ]);
                $input['hearPlaceId'] = $hearPlace->id;
            } else {
                unset($input['hearPlaceId']);
            }
        }

        if (!$user->createWithRelated($input)) {
            return response()->json('User was not created', 500);
        }

        Log::writeUser(Log::ACTION_CREATE, $user);
        return response()->json($user->asArray());
    }

    public function delete(Request $request, $userId)
    {
        /** @var User $model */
        $model = User::find($userId);
        if (!$model) {
            return response()->json('Model was not found', 404);
        }

        if (!$model->isDeletable) {
            return response()->json('Cannot delete user with classes', 500);
        }

        Log::writeUser(Log::ACTION_DELETE, $model, $request->get('reason'));
        $model->delete();
        return response()->json('', 204);
    }

    /**
     * @param string $enumType
     * @return JsonResponse|null
     */
    public function getEnumValues($enumType)
    {
        return DataFormatter::formatEnumValues(User::getEnumValues($enumType));
    }

    public function update(Request $request)
    {
        // TODO: optimize code for updating collections from relations
        $params = $request->all();
        if (User::updateCollection($params['data'], ['saveRelations' => true])) {
            return response()->json('', 200);
        }

        return response()->json('Model update error', 500);
    }

    public function getReconcile(Request $request)
    {
        return response()->json(User::getDuplicated($request->all()));
    }

    public function quickSearch(Request $request)
    {
        $searchFields = [
            'u.user_fullname'      => '%VALUE%',
            'u.user_name'          => '%VALUE%',
            'u.user_email_address' => '%VALUE%',
            'u.serial_number'      => '%VALUE%',
            'p.profile_postcode'   => '%VALUE%',
            'p.profile_telephone'  => 'VALUE%',
            'p.profile_mobile'     => 'VALUE%',
            'p.profile_address'    => '%VALUE%'
        ];

        /**
         * @var \Illuminate\Database\Query\Builder $query
         */
        $query = DB::table(User::tableName() . ' as u');
        $query->leftJoin(Profile::tableName() . ' as p', 'p.user_id', '=', 'u.id');
        $query->select([
            'u.id as id',
            DB::raw('
                IFNULL(
                    concat(u.user_fullname, " ", u.user_email_address, " ", p.profile_postcode, " ", p.profile_address, " ", IFNULL(u.serial_number, "")),
                    concat(u.user_fullname, " ", u.user_email_address, " ", IFNULL(u.serial_number, ""))
                ) as userData
            ')
            //DB::raw('concat(' . implode(', " ", ', $searchFields) . ') as searchKey')
        ]);
        //$query->whereIn('u.user_main_role', [Role::STUDENT, Role::TEACHER]);

        $searchQuery = $request->get('query', '');

        $searchQuery = join(' ', explode(' ', $searchQuery));

        //$query->having('searchKey', 'like', "%$searchQuery%");
        $query->where(function ($query) use ($searchFields, $searchQuery) {
            $count = count($searchFields);
            if ($count === 0) return;

            $fieldNames = array_keys($searchFields);

            $query->whereRaw("REPLACE(" . $fieldNames[0] .", ' ', '') like REPLACE(?, ' ', '')", [
                str_replace('VALUE', $searchQuery, $searchFields[$fieldNames[0]])
            ]);


            for ($i = 1; $i < $count; $i++) {
                $fieldName = $fieldNames[$i];
                $pattern = $searchFields[$fieldName];
                $query->orWhereRaw("REPLACE(" . $fieldName . ", ' ', '') like REPLACE(?, ' ', '')", [
                    str_replace('VALUE', $searchQuery, $pattern)
                ]);
            }
        });

        return response()->json($query->get());
    }

    public function printData($role, $type, $filters = '')
    {
        $filters = json_decode($filters, true);
        // if advancedSearch == true, joins additional tables like course student, course, course term etc
        $getUsers = function($fields = null, $additionalFilters = null) use ($filters, $role) {
            if ($additionalFilters) {
                $filters = array_merge($filters, $additionalFilters);
            }

            if (!empty($filters['waitingFilter'])) {
                $filters['advancedSearch'] = true;
            }

            return Profile::getByFilters($filters, null, Role::roleNameToId($role), $fields, true)['rows'];
        };
        switch ($type) {
            case 'addresses':
                $users = $getUsers([
                    'p.profile_address as profileAddress',
                    'p.profile_address2 as profileAddress2',
                    'p.profile_postcode as profilePostcode'
                ]);

                $view = view('admin.user.print-addresses', ['users' => $users])->render();

                break;

            case 'addresses-xls':
                $users = $getUsers([
                    'p.profile_forname as profileForname',
                    'p.profile_surname as profileSurname',
                    'p.profile_address as profileAddress',
                    'p.profile_address2 as profileAddress2',
                    'p.profile_postcode as profilePostcode'
                ]);

                $view = view('admin.user.print-addresses-xls', ['users' => $users])->render();

                break;

            case 'numbers':
                $users = $getUsers([
                    'p.profile_telephone as telephone',
                    'p.profile_mobile as mobile'
                ]);

                $view = view('admin.user.print-numbers', ['users' => $users])->render();

                break;

            case 'emails':
                $users = $getUsers();

                $view = view('admin.user.print-emails', ['users' => $users])->render();

                break;

            case 'grades-table':
                $users = $getUsers([
                    't.term as termNumber',
                    't.year as year',
                    'c.course_title as courseTitle',
                    'cs.score as grade',
                    'cs.feedback as feedback'
                ], ['advancedSearch' => true]);

                $view = view('admin.user.print-grades-table', ['users' => $users])->render();

                break;

            case 'grades':
                $users = $getUsers([
                    't.term as termNumber',
                    't.year as year',
                    'c.course_title as courseTitle',
                    'cs.score as grade',
                    'cs.grade_status as gradeStatus',
                    'cs.feedback as feedback'
                ], ['advancedSearch' => true]);

                $view = view('admin.user.print-grades', ['users' => $users])->render();

                break;

            case 'details':
                $users = $getUsers([
                    'p.profile_address as profileAddress',
                    'p.profile_telephone as telephone',
                    'p.profile_mobile as mobile',
                ]);
                $view = view('admin.user.print-details', ['users' => $users])->render();

                break;

            case 'transactions':
                $users = $getUsers([
                    'c.course_title as courseTitle',
                    't.term as termNumber',
                    't.year as year',
                    'cs.reg_payment_status as paymentStatus',
                    'cs.reg_status as regStatus',
                    'cs.admin_notes as adminNotes',
                    'cs.register_date as registerDate',
                    'cs.score as grade',
                    DB::raw('(select sum(sp.amount) from t_student_payment sp where course_student_id = cs.id ) as paymentsTotal')
                ], ['advancedSearch' => true]);

                $view = view('admin.user.print-transactions', ['users' => $users])->render();

                break;

            case 'card':
                $users = $getUsers([
                    'u.age as birthDate',
                    'c.course_title as courseTitle',
                    'cc.id as classId',
                    'cc.class_time as classTime',
                    'teacher.user_fullname as teacherName',
                    'cr.classroom_name as classroomName',
                    'p.profile_telephone as telephone',
                    'p.profile_mobile as mobile',
                    'p.emergency_contact_1_contact as emergency_contact_1_contact',
                    'p.emergency_contact_2_contact as emergency_contact_2_contact', 
                    'p.profile_address as address',
                    'cs.admin_notes as studentNotes',
                    'p.teacher_notes as teacherNotes'
                ], ['advancedSearch' => true, 'noGroup' => true]);

/*                $users = 0;

                $users = array_reduce($users, function ($prev, $item), {
                    return $users->profileId == '349' ? $prev + 1 : $prev; }, 0 );*/

                $view = view('admin.user.print-card', ['users' => $users, 'asTable' => false])->render();

                break;

            case 'class-details':
                $users = $getUsers([
                    'u.age as birthDate',
                    'c.course_title as courseTitle',
                    'cc.class_time as classTime',
                    'cc.id as classId',
                    'teacher.user_fullname as teacherName',
                    'cr.classroom_name as classroomName',
                    'p.profile_telephone as telephone',
                    'p.profile_mobile as mobile',
                    'p.emergency_contact_1_contact as emergency_contact_1_contact',
                    'p.emergency_contact_2_contact as emergency_contact_2_contact', 
                    'p.profile_address as address',
                    'p.profile_postcode as postcode',
                    'p.student_notes as studentNotes',
                    'p.teacher_notes as teacherNotes'
                ], ['advancedSearch' => true, 'noGroup' => true, 'coursesCount' => 'All']);

                $view = view('admin.user.print-card', ['users' => $users, 'asTable' => true])->render();

                break;

            default:
                $view = '';
        }

        if ($this->website && $this->website->coursePrintoutTemplate) {
            $template = $this->website->coursePrintoutTemplate;
            $output = str_replace('%DATA%', $view, $template);
        } else {
            $output = $view;
        }

        return response()->json($output);
    }

    public function findRelatives(Request $request)
    {
        $input = $request->all();

        $query = DB::table(User::tableName() . ' as u');
        $query->leftJoin(Profile::tableName() . ' as p', 'p.user_id', '=', 'u.id');
        $query->select([
            'u.id as id',
            DB::raw('
                concat(u.user_fullname, " ", u.user_email_address, " ", p.profile_postcode) as userData
            ')
        ]);

        $query->whereIn('u.user_main_role', [Role::STUDENT, Role::TEACHER]);

        if (!empty($input['postcode'])) {
            $query->where('p.profile_postcode', $input['postcode']);
        }

        if (!empty($input['excludeUserId'])) {
            $query->where('u.id', '!=', $input['excludeUserId']);
        }

        if (!empty($input['query'])) {
            $query->having('userData', 'like', '%' . $input['query'] . '%');
        }

        return response()->json($query->get());
    }

    public function getPostcodeData(Request $request)
    {
        $input = $request->all();
        if (empty($input['postcode'])) {
            return response()->json();
        }

        return response()->json(CraftyClicksAPI::search($input['postcode']));
    }

    public function forgotPassword(Request $request)
    {
        $input = $request->all();

        $user = null;

        if (!empty($input['userEmailAddress'])) {
            $user = User::where('user_email_address', $input['userEmailAddress'])->first();

            if (!$user) {
                return response()->json('User with such email address was not found', 404);
            }
        } else {
            $user = User::whereHas('profile', function ($query) use (&$input) {
                $query->where('profile_forname', $input['profileForname']);
                $query->where('profile_surname', $input['profileSurname']);
                $query->where('profile_postcode', $input['profilePostcode']);
            })->first();

            if (!$user) {
                return response()->json('User with such inputs was not found', 404);
            }
        }

        $resetCode = md5(uniqid(mt_rand()));

        $expireDate = new \DateTime();
        $expireDate->setTimestamp(time() + (2 * 60 * 60));

        $user->loadInput([
            'reset_password_code'   => $resetCode,
            'reset_password_expire' => $expireDate
        ]);
        $user->save();

        $siteUrl = function ($path) { return str_replace('backend/public/', '', url($path)); };

        EmailHelper::sendResetPasswordEmail(
            $user,
            $siteUrl("/reset-password/$resetCode/$user->id"),
            'the next 2 hours'
        );

        return response()->json('');
    }

    public function checkResetCode($resetCode, $userId)
    {
        $user = User::findByResetCode($resetCode, $userId);

        if (!$user) {
            return response()->json('Wrong reset code or reset code already expired', 400);
        }

        return response()->json('');
    }

    public function resetPassword(Request $request)
    {
        $input = $request->all();

        if (
            empty($input['resetCode']) ||
            empty($input['userId']) ||
            empty($input['newPassword']) ||
            empty($input['newPasswordConfirm'])
        ) {
            return response()->json('Wrong data', 400);
        }

        $user = User::findByResetCode($input['resetCode'], $input['userId']);
        if (!$user) {
            return response()->json('Wrong reset code or reset code already expired', 400);
        }

        if ($input['newPassword'] != $input['newPasswordConfirm']) {
            return response()->json('Passwords doesn\'t match', 400);
        }

        $user->userPassword = $input['newPassword'];
        $user->save();
        return response()->json('');
    }

    public function modifyRelative($userId, $relativeId, $action)
    {
        $user = Auth::user();
        if (
            $user->id != $userId &&
            in_array($user->role->roleName, [Role::ADMIN, Role::SUPER_ADMIN, Role::REGISTRAR])
        ) {
            return response()->json('', 403);
        }

        // TODO: refactor
        /** @var User $userA */
        /** @var User $userB */
        $userA = $user->id == $userId ? $user : User::find($userId);
        $userB = User::find($relativeId);
        if (!$userA || !$userB) return response()->json('User or users was not found', 404);

        foreach ($userA->relatives as $relativeA) {
            if ($action == 'detach' || !$relativeA->relatives->contains($relativeId)) {
                $relativeA->relatives()->{$action}($relativeId);
                $userB->relatives()->{$action}($relativeA->id);
            }
        }

        foreach ($userB->relatives as $relativeB) {
            if ($action == 'detach' || !$relativeB->relatives->contains($userA->id)) {
                $relativeB->relatives()->{$action}($userA->id);
                $userA->relatives()->{$action}($relativeB->id);
            }
        }

        if ($action == 'detach' || !$userA->relatives->contains($relativeId)) {
            $userA->relatives()->{$action}($relativeId);
        }

        if ($action == 'detach' || !$userB->relatives->contains($userA->id)) {
            $userB->relatives()->{$action}($userA->id);
        }
    }


    public function addRelative($userId, $relativeId)
    {
        return $this->modifyRelative($userId, $relativeId, 'attach');
    }

    public function removeRelative($userId, $relativeId)
    {
        return $this->modifyRelative($userId, $relativeId, 'detach');
    }

    public function copy(Request $request, $userId)
    {
        $input = $request->all();

        if (!$request->has('firstName', 'lastName', 'gender', 'birthDate')) {
            throw new \BadMethodCallException('Not all required fields filled');
        }

        /** @var User $originUser */
        $originUser = User::findOrFail($userId);
        $originProfile = $originUser->profile;

        $attrs = $originUser->getAttributes();
        unset($attrs['id']);
        unset($attrs['user_unique_id']);
        unset($attrs['serial_number']);

        $copiedUser = new User($attrs);
        $copiedUser->loadInput([
            'age'           => $input['birthDate'],
            'user_fullname' => $input['firstName'] . ' ' . $input['lastName']
        ]);

        $saved = $copiedUser->save();

        if ($saved !== true) {
            throw new \LogicException($saved);
        }

        $copiedProfile = new Profile($originProfile->getAttributes());
        $copiedProfile->fill([
            'user_id'         => $copiedUser->id,
            'age'             => $input['birthDate'],
            'profile_forname' => $input['firstName'],
            'profile_surname' => $input['lastName'],
            'profile_gender'  => $input['gender']
        ]);
        $copiedProfile->save();

        $this->addRelative($originUser->id, $copiedUser->id);

        return $copiedUser->id;
    }

    public function mergeBranches(Request $request)
    {
        $filters = $request->get('filters');

        /** @var \stdClass[] $records */
        $records = Profile::getByFilters($filters, PHP_INT_MAX, Role::STUDENT, null, true)['rows'];
        $branches = $request->get('branches');


        $data = [];
        foreach ($records as $record) {
            foreach ($branches as $branch) {
                $data[] = ['user_id' => $record->profileId, 'branch_associated_id' => $branch];
            }
        }

        ExtendedModel::insertIgnore($data, 't_user_closest_branches');
        //DB::table('t_user_closest_branches')->insert($data);
    }
}