<?php

namespace App\Models;

use App\Classes\Helpers\DataFormatter;
use App\Classes\Helpers\QueryHelper;
use App\Classes\Helpers\StringHelper;
use Faker\Provider\cs_CZ\DateTime;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Auth\Authenticatable;
use Illuminate\Support\Facades\DB;
use Laravel\Cashier\Billable;

/**
 * Class User
 * @package App\Models
 * @property int    $id
 * @property int    $userLastLoginIp
 * @property string $age
 * @property string $userActivationKey
 * @property string $userName
 * @property string $userPassword
 * @property string $userEmailAddress
 * @property string $userMainRole
 * @property string $userStatus
 * @property string $userUniqueId
 * @property string $userFullname
 * @property string $userCreateTime
 * @property string $allowedBranches
 * @property string $serialNumber
 * @property int    $hearPlaceId
 * @property bool   $isDeletable
 * @property string $userStatusUpdatedAt
 * relations
 * @property Role               $role
 * @property Profile            $profile
 * @property CourseStudent[]    $courseStudents
 * @property CourseClass[]      $courseClasses
 * @property Cart[]             $carts
 * @property DonationRecord[]   $donationRecords
 * @property Donation[]         $donations
 * @property TeacherPayment[]   $teacherPayments
 * @property User[]             $relatives
 * @property HearPlace          $hearPlace
 * @property BranchAssociated[] $closestBranches
 * @property Complaint[]        $complaints
 * @property int                $logEnabled
 */

class User extends ExtendedModel implements
    AuthenticatableContract,
    AuthorizableContract,
    CanResetPasswordContract
{
    use Authenticatable, Authorizable, CanResetPassword;
    use Billable {
        getStripeKey as billableGetStripeKey;
    }

    public $timestamps = false;
    /**
     * Using table
     */
    protected $table = 't_user';

    protected $attributes = [
        'user_status'         => 'waiting',
        'user_name'           => '',
        'age'                 => '',
        'allowed_branches'    => '',
        'user_last_login_ip'  => 0,
        'user_activation_key' => '',
        'user_main_role'      => Role::STUDENT,
        'user_fullname'       => '',
        'user_password'       => '0000',
        'user_email_address'  => '',
        'serial_number'       => '',
        'log_enabled'         => 1
    ];
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function role()
    {
        return $this->belongsTo('App\\Models\\Role', 'user_main_role');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function hearPlace()
    {
        return $this->belongsTo('App\\Models\\HearPlace', 'hear_place_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function profile()
    {
        return $this->hasOne('App\\Models\\Profile');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function courseStudents()
    {
        return $this->hasMany('App\\Models\\CourseStudent', 'student_id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function courseStudentsDeleted()
    {
        return $this->hasMany('App\\Models\\CourseStudentDeleted', 'student_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function courseClasses()
    {
        return $this->hasMany('App\\Models\\CourseClass', 'teacher_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function carts()
    {
        return $this->hasMany('App\\Models\\Cart', 'student_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function donationRecords()
    {
        return $this->hasMany('App\\Models\\DonationRecord');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function donations()
    {
        return $this->hasMany('App\\Models\\Donation');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function teacherPayments()
    {
        return $this->hasMany('App\\Models\\TeacherPayment', 'teacher_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function relatives()
    {
        return $this->belongsToMany('App\\Models\\User', 't_user_relative', 'first_user_id', 'second_user_id');
    }

    // TODO: fix recursion?
    public function logs()
    {
        return $this->hasMany('App\\Models\\Log', 'user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function closestBranches()
    {
        return $this->belongsToMany('App\\Models\\BranchAssociated', 't_user_closest_branches', 'user_id', 'branch_associated_id');
//        return $this->belongsToMany('App\Models\PayName', 'weekday_payname', 'week_id', 'pay_name_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function complaints()
    {
        return $this->belongsToMany('App\\Models\\Complaint', 'users_complaints', 'user_id', 'complaint_id');
    }

    public function getClosestBranchesAttribute()
    {
        $models = $this->closestBranches()->get();

        $ids = [];
        foreach ($models as $model) {
            $ids[] = $model->id;
        }
        return $ids;
    }

    public function setClosestBranchesAttribute($ids)
    {
        if (!is_array($ids)) {
            $ids = explode(',', $ids);
        }

        $this->closestBranches()->sync($ids);
    }

    public function getIsDeletableAttribute()
    {
        if ($this->userMainRole == Role::STUDENT) {
            $query = DB::table(CourseStudent::tableName() . ' as cs');
            $query->leftJoin(StudentPayment::tableName() . ' as sp', 'sp.course_student_id', '=', 'cs.id');
            $query->where('cs.student_id', $this->id);

            $query->select(
                DB::raw('ifnull(sum(sp.amount), 0) as totalAmount')
            );

            $totalAmount = 0;
            try {
                $totalAmount = $query->get()[0]->totalAmount;
            } catch (\Exception $e) {}

            return $totalAmount == 0;
        }

        return true;
    }

    /**
     * The attributes excluded from the model's JSON form.
     *
     * @var array
     */
    protected $hidden = [
        'user_password',
    ];

    public function getRememberToken()
    {
        return $this->attributes[$this->getRememberTokenName()];
    }

    public function setRememberToken($value)
    {
        $this->attributes[$this->getRememberTokenName()] = $value;
    }

    public function getRememberTokenName()
    {
        return 'remember_token';
    }

    public function setAttribute($key, $value)
    {
        $isRememberTokenAttribute = $key == $this->getRememberTokenName();
        if (!$isRememberTokenAttribute)
        {
            parent::setAttribute($key, $value);
        }
    }

    public function setUserPasswordAttribute($value)
    {
        // password was not changed
        if ($value == $this->attributes['user_password']) {
            return;
        }

        if (strlen($value) > 0) {
            $this->attributes['user_password'] = sha1($value);
        }
    }

    public function getTeacherCourseClassesAttribute()
    {
        $query = DB::table(CourseClass::tableName() . ' as cc');
        $query->select([
            'cc.id as id',
            'cc.class_time as classTime',
            'cc.course_class_term_id as termId',
            'c.course_title as courseTitle',
            'd.dept_branch_id as branchId'
        ]);
        $query->leftJoin(Course::tableName() . ' as c', 'c.id', '=', 'cc.course_id');
        $query->leftJoin(Dept::tableName() . ' as d', 'd.id', '=', 'c.dept_id');
        $query->where('teacher_id', $this->id);
        return $query->get();
    }

    public function delete()
    {
        CourseStudent::query()->where('student_id', $this->id)->delete();
        if ($profile = Profile::find($this->id)) {
            $profile->delete();
        }

        return parent::delete();
    }


    /**
     * @return Cart
     */
    public function getBasket()
    {
        return $this->carts()->where('cart_status', 'open')->first();
    }

    public function addClosestBranches(CourseStudent $student)
    {
        $branchesIds = $this->closestBranches;
        $classBranchId = $student->course->dept->branchAssociated->id;
        if (!in_array($classBranchId, $branchesIds)) {
            $branchesIds[] = $classBranchId;
            $this->closestBranches = $branchesIds;
        }
    }

    public static function getUserStatusValues()
    {
        return ['active', 'waiting'];
    }

    public static function generateUniqueId()
    {
        $numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        $id = null;
        $maxIterations = 1000000;
        $iteration = 0;
        do {
            shuffle($numbers);
            $id = substr(implode('', $numbers), 0, 6);
            $iteration++;
        } while (!static::isUniqueId($id) && $iteration < $maxIterations);

        return $id;
    }

    public static function isUniqueId($id) {
        return !User::where('user_unique_id', $id)->exists();
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) return false;

        if (!$this->userCreateTime) {
            $this->userCreateTime = date("Y-m-d H:i:s");
        }

        if (!$this->userUniqueId) {
            $this->userUniqueId = User::generateUniqueId();
        }

        if ($this->serialNumber) {
            $user = User::where('serial_number', $this->serialNumber)->first();

            if ($user && $user->id != $this->id) {
                return 'Serial number is already taken';
            }
        }

        $this->userStatusUpdatedAt = $this->getOriginal('user_status_updated_at');

        if ($this->userStatus != $this->getOriginal('user_status')) {
            $this->userStatusUpdatedAt = date("Y-m-d H:i:s");
        }

        return true;
    }

    public function createProfile()
    {
        (new Profile([
            'user_id'        => $this->id,
            'profile_gender' => 'male'
        ]))->save();
    }

    public static function getDuplicatedListCondition()
    {
        $query = DB::table(Profile::tableName() . ' as p');
        $query->select([
            'p.user_id as userId',
            'p.profile_forname as profileForname',
            'p.profile_surname as profileSurname',
            'p.profile_postcode as profilePostcode',
            DB::raw('count(*) as duplicatesCount')
        ]);
        $query->leftJoin(User::tableName() . ' as u', 'u.id', '=', 'p.user_id');
        $query->where('u.user_main_role', 3);
        $query->whereNotNull('p.profile_postcode');
        $query->where('p.profile_postcode', '!=', '');
        $query->groupBy('p.profile_forname', 'p.profile_surname', 'p.profile_postcode');
        $query->having('duplicatesCount', '>', '1');

        $options = [];
        foreach ($query->get() as $row) {
            $options[] = "('$row->profileForname', '$row->profileSurname', '$row->profilePostcode')";
        }

        if (count($options) === 0) return null;

        return '(p.profile_forname, p.profile_surname, p.profile_postcode) in (' . implode(',', $options) .')';
    }

    public static function getDuplicated($params)
    {
        $duplicatedCondition = self::getDuplicatedListCondition();

        if (is_null($duplicatedCondition)) {
            return ['rows' => [], 'info' => ['totalCount' => 0]];
        }

        $query = DB::table(User::tableName() . ' as u');
        $query->select([
            DB::raw('SQL_CALC_FOUND_ROWS u.id as id'),
            'p.profile_forname as profileForname',
            'p.profile_surname as profileSurname',
            'p.profile_address as profileAddress',
            'p.profile_postcode as profilePostcode',
            DB::raw('(select count(cs.id) from t_course_student cs where cs.student_id = u.id) as classesCount'),
            DB::raw(
                '(select ifnull(sum(sp.amount), 0) from t_student_payment as sp where course_student_id in ' .
                    '(select id from t_course_student as cs where cs.student_id = u.id)'
                .')'.
            'as totalAmount')
        ]);

        $query->leftJoin(Profile::tableName() . ' as p', 'p.user_id', '=', 'u.id');

        $query->where('u.user_main_role', 3);
        $query->whereNotNull('p.profile_postcode');
        $query->where('p.profile_postcode', '!=', '');
        $query->whereRaw($duplicatedCondition);
        $query->orderBy('profile_postcode', 'ASC');
        $query->orderBy('profile_forname', 'ASC');

        $paginated = QueryHelper::paginate($query, $params, QueryHelper::SIMPLE_PAGINATION);
        return $paginated;
    }

    /**
     * @param $resetCode
     * @param $userId
     * @return bool|string
     */
    public static function findByResetCode($resetCode, $userId)
    {
        $user = User::where([
            'id'                  => $userId,
            'reset_password_code' => $resetCode
        ])->first();

        if (!$user) return null;

        $codeIsExpired = (time() - strtotime($user->resetPasswordExpire)) > 0;

        if ($codeIsExpired) return null;

        return $user;
    }

    public static function getWaiting($params, $toJson = true)
    {
        $filter = $params['filter'];

        $activeTerm = Term::activeTerm();
        $activeTermId = $activeTerm ? $activeTerm->id : null;

        $query = User::query();
        $query->where('user_main_role', Role::STUDENT);

        if (isset($params['filters'])) {
            $filters = $params['filters'];

            if (!empty($filters['beginDate'])) {
                $value = $filters['beginDate'];
                $query->where('user_status_updated_at', '>=', DateHelper::toSqlFormat($value));
            }

            if (!empty($filters['endDate'])) {
                $value = $filters['endDate'];
                $query->where('user_status_updated_at', '<=', DateHelper::toSqlFormat($value));
            }
        }

        switch ($filter) {
            case 'noClassesThisTerm':
                if (is_null($activeTermId)) break;

                $query->whereDoesntHave('courseStudents', function (Builder $query) use ($activeTermId) {
                    $query->whereHas('courseClass', function ($query) use ($activeTermId) {
                        $query->where('course_class_term_id', $activeTermId);
                    });
                });
                break;

            case 'noClassesInAllTerms':
                $query->has('courseStudents', '=', 0);
                break;

            case 'noClassesAllAndThisTerm':
                if (is_null($activeTermId)) break;

                $query->whereDoesntHave('courseStudents', function (Builder $query) use ($activeTermId) {
                    $query->whereHas('courseClass', function (Builder $query) use ($activeTermId) {
                        $query->where('course_class_term_id', $activeTermId);
                    });
                });
                $query->orHas('courseStudents', '=', 0);
                $query->where('user_main_role', Role::STUDENT);

                break;

            case 'statusIsWaiting':
                $query->where('user_status', 'waiting');
                break;
        }

        return DataFormatter::formatQueryResult($query, $params, $toJson);
    }

    public static function getStripeKey()
    {
        $settings = function ($key) { return GeneralSetting::getValue($key, ''); };
        $stripeKey = $settings('stripe_secret_key_' . $settings('stripe_mode'));
        return !empty($stripeKey) ?
            $stripeKey : static::billableGetStripeKey();
    }

    /**
     * @param User $userProto
     * @param $relative
     * @return User
     */
    public static function createFromRelative($userProto, $relative) {
        $result = false;
        // create new user
        $user = $userProto;
        //override with relative data
        $user->id = null;
        $user->userPassword      = '';
        $user->userPassword      = $relative['fullname'];
        $user->userEmailAddress  = $relative['email'];
        $user->userCreateTime    = time();
        $user->mainUserId        = $user->id;

        $profile = $userProto ? $userProto->profile : new Profile();
        $profile->id = null;
        $profile->profileForname   = $relative['forename'];
        $profile->profileSurname   = $relative['surname'];
        $profile->profileTelephone = $relative['phone'];
        $profile->profileGender    = $relative['gender'];

        // insert new user data
        if ($user->save() && $profile->save()) {
            $profile->userId = $user->id;
            $profile->save();
        }
        // return new_user_id
        return $user;
    }
}
