<?php

namespace App\Models;

use App\Classes\Helpers\DateHelper;
use App\Classes\QueryFiltersProcessing\FilterProcessor;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use App\Models\Role;
use Carbon\Carbon;
use App\Classes\QueryFiltersProcessing\FiltersIncludeCondition;

/**
 * Class Profile
 * @package App\Models
 * @property int    $userId
 * @property string $age
 * @property string $allowedBranches
 * @property string $profileTitle
 * @property string $profileTeacherTitle
 * @property string $profileForname
 * @property string $profileSurname
 * @property string $profileAddress
 * @property string $profileAddress2
 * @property string $profilePostcode
 * @property string $profileTelephone
 * @property string $profileMobile
 * @property string $profileGender
 * @property string $profileImage
 * @property string $emergencyContact1Name
 * @property string $emergencyContact1Address
 * @property string $emergencyContact1Contact
 * @property string $emergencyContact2Name
 * @property string $emergencyContact2Address
 * @property string $emergencyContact2Contact
 * @property string studentNotes
 * @property bool   $teacherCrb
 * @property int    $teacherStatusCode
 * @property int    $teacherHourlyRate
 * relations
 * @property User $user
 *
 */
class Profile extends ExtendedModel
{
    protected $table = 't_profile';
    protected $primaryKey = 'user_id';

    protected $attributes = [
        'profile_teacher_title' => 'ustadh',
        'profile_gender'        => 'male',
        'profile_postcode'      => '',
        'profile_mobile'        => '',
        'profile_telephone'     => '',
        'profile_address'       => '',
        'profile_surname'       => '',
        'profile_forname'       => '',
        'city'                  => ''
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('App\\Models\\User', 'user_id');
    }

    public static function getByFilters(
        $filters,
        $limit = 250,
        $role = Role::STUDENT,
        $additionalFields = null,
        $uniqueUsers = false
    ) {
        /**
         * @var Builder $query
         */
        $query = DB::table(self::tableName() . ' AS p');
        $query->leftJoin(User::tableName() . ' AS u', 'u.id', '=', 'p.user_id');
        $query->where('u.user_main_role', $role);
        $joinedTables = ['u'];
        $fields = [
            DB::raw('SQL_CALC_FOUND_ROWS p.user_id AS profileId'),
            DB::raw('TRIM(CONCAT(p.profile_forname, " ", p.profile_surname)) AS fullName'),
            'u.user_email_address AS emailAddress',
            'u.user_status_updated_at AS userStatusUpdatedAt'
        ];

        if (!empty($additionalFields)) {
            $fields = array_merge($fields, $additionalFields);
        }

        if (!empty($filters)) {
            if (
                isset($filters['advancedSearch']) && $filters['advancedSearch'] == 'true' ||
                isset($filters['countOnly']) && $filters['countOnly'] == 'true'
            ) {
                $query->leftJoin(CourseStudent::tableName() . ' AS cs', 'cs.student_id', '=', 'p.user_id');
                $query->leftJoin(Course::tableName() . ' AS c', 'c.id', '=', 'cs.course_id');
                $query->leftJoin(CourseClass::tableName() . ' AS cc', 'cc.id', '=', 'cs.class_id');
                $query->leftJoin(User::tableName() . ' AS teacher', 'teacher.id', '=', 'cc.teacher_id');
                $query->leftJoin(Classroom::tableName() . ' AS cr', 'cr.id', '=', 'cc.classroom_id');
                $query->leftJoin(Term::tableName() . ' AS t', 't.id', '=', 'cc.course_class_term_id');
                $query->leftJoin(StudentGrade::tableName() . ' AS sg', 'sg.course_student_id', '=', 'p.user_id');

                if (!$uniqueUsers && empty($filters['countOnly'])) {
                    $query->groupBy('c.id');
                }

                $joinedTables += [
                    't_course'         => true,
                    't_course_student' => true,
                    't_course_class'   => true,
                    't_term'           => true,
                    't_student_grade'  => true
                ];

                $fields = array_merge($fields, [
                    'c.course_title AS courseTitle',
                    't.name AS term',
                    'cs.register_date AS registerDate'
                ]);

                if (
                    isset($filters['fromTerm']) &&
                    strlen($filters['fromTerm']) &&
                    $filters['fromTerm'] !== 'All'
                ) {
                    $query->where('t.id', $filters['fromTerm']);
                }
                if (isset($filters['departmentsSelect']) && count($filters['departmentsSelect'])) {
                    if (!isset($joinedTables['t_dept'])) {
                        $query->leftJoin(Dept::tableName() . ' AS d', 'd.id', '=', 'c.dept_id');
                        $joinedTables['t_dept'] = true;
                    }

                    if (isset($filters['departmentsMode']) && $filters['departmentsMode'] == 'include')
                        $query->whereIn('d.id', $filters['departmentsSelect']);
                    else
                        $query->whereNotIn('d.id', $filters['departmentsSelect']);
                }

                if (isset($filters['invoiceId']) && strlen($filters['invoiceId']))
                    $query->where('cs.invoice_id', $filters['invoiceId']);

                if (isset($filters['transactionBetweenStart']) && strlen($filters['transactionBetweenStart']))
                    $query->where('cs.register_date', '>=', DateHelper::toSqlFormat($filters['transactionBetweenStart']));

                if (isset($filters['transactionBetweenEnd']) && strlen($filters['transactionBetweenEnd']))
                    $query->where('cs.register_date', '<=', DateHelper::toSqlFormat($filters['transactionBetweenEnd']));

                if (isset($filters['gradeBetweenStart']) && strlen($filters['gradeBetweenStart']))
                    $query->where('sg.score', '>=', $filters['gradeBetweenStart']);

                if (isset($filters['gradeBetweenEnd']) && strlen($filters['gradeBetweenEnd']))
                    $query->where('sg.score', '<=', $filters['gradeBetweenEnd']);

                if (!empty($filters['beginDate'])) {
                    $value = $filters['beginDate'];
                    $query->where('u.user_status_updated_at', '>=', DateHelper::toSqlFormat($value));
                }

                if (!empty($filters['endDate'])) {
                    $value = $filters['endDate'];
                    $query->where('u.user_status_updated_at', '<=', DateHelper::toSqlFormat($value));
                }

                if (
                    isset($filters['courseSelect']) &&
                    strlen($filters['courseSelect']) &&
                    $filters['courseSelect'] !== 'All'
                ) {
                    $query->where('c.id', $filters['courseSelect']);
                }

                if (
                    isset($filters['courseClassSelect']) &&
                    strlen($filters['courseClassSelect']) &&
                    $filters['courseClassSelect'] !== 'All'
                ) {
                    $query->where('cc.id', $filters['courseClassSelect']);
                }

                if (
                    (isset($filters['currentTermActivePaid']) && $filters['currentTermActivePaid'] == 'true') ||
                    (isset($filters['notCurrentTermActivePaid']) && $filters['notCurrentTermActivePaid'] == 'true')
                ) {
//                    $activeTerm = Term::activeTerm();
//                    if ($activeTerm) {
//                        if ($filters['currentTermActivePaid'] == 'true')
//                            $query->where('cc.course_class_term_id', $activeTerm->id);
//                        else
//                            $query->where('cc.course_class_term_id', '!=', $activeTerm->id);
//
//                        $query->where('cs.reg_payment_status', 'paid');
//                        $query->where('cs.reg_status', 'active');
//                    }
                    if ($filters['branches']) {
                        if ($filters['currentTermActivePaid'] == 'true')
                        {
                            $query->where('p.allowed_branches', '%like%', explode(',', $filters['branches']));
                        }

                        else
                        {
                            $query->where('p.allowed_branches', '!%like%', explode(',', $filters['branches']));
                        }

                        $query->where('cs.reg_payment_status', 'paid');
                        $query->where('cs.reg_status', 'active');
                    }
                } else {
                    if (
                        isset($filters['paymentMethodSelect']) &&
                        strlen($filters['paymentMethodSelect']) &&
                        $filters['paymentMethodSelect'] !== 'All'
                    ) {
                        $query->where('cs.reg_payment_method', $filters['paymentMethodSelect']);
                    }

                    if (
                        isset($filters['paymentStatusSelect']) &&
                        strlen($filters['paymentStatusSelect']) &&
                        $filters['paymentStatusSelect'] !== 'All'
                    ) {
                        $query->where('cs.reg_payment_status', $filters['paymentStatusSelect']);
                    }

                    if (
                        isset($filters['regStatusSelect']) &&
                        strlen($filters['regStatusSelect']) &&
                        $filters['regStatusSelect'] !== 'All'
                    ) {
                        $query->where('cs.reg_status', $filters['regStatusSelect']);
                    }

                    if (
                        isset($filters['employmentTypeSelect']) &&
                        strlen($filters['employmentTypeSelect']) &&
                        $filters['employmentTypeSelect'] !== 'All'
                    ) {
                        $query->where('cs.student_status', $filters['employmentTypeSelect']);
                    }
                }

                if (isset($filters['amountBetweenStart']) && strlen($filters['amountBetweenStart']))
                    $query->where('cs.total_amount', '>=', $filters['amountBetweenStart']);

                if (isset($filters['amountBetweenEnd']) && strlen($filters['amountBetweenEnd']))
                    $query->where('cs.total_amount', '<=', $filters['amountBetweenEnd']);
            }

            if (!empty($filters['linkedBranches'])) {
                $query->leftJoin('t_user_closest_branches as cb', 'cb.user_id', '=', 'u.id');
                $query->whereIn('cb.branch_associated_id', $filters['linkedBranches']);
            }

            if (
                isset($filters['genderSelect']) &&
                strlen($filters['genderSelect']) &&
                $filters['genderSelect'] !== 'All'
            ) {
                $query->where('p.profile_gender', strtolower($filters['genderSelect']));
            }

            if (isset($filters['postcodeBeginning']) && strlen($filters['postcodeBeginning']))
                $query->where('p.profile_postcode', 'like', $filters['postcodeBeginning'] . '%');

            if (isset($filters['city']) && strlen($filters['city'])) {
                $query->where('p.city', 'like', $filters['city'] . '%');
            }

            if (isset($filters['coursesCount']) && strlen($filters['coursesCount']) && ($filters['coursesCount'] !== 'All')) {
                if (!isset($joinedTables['t_course_student'])) {
                    $query->leftJoin(CourseStudent::tableName() . ' AS cs', 'cs.student_id', '=', 'p.user_id');
                    $joinedTables['t_course_student'] = true;
                }

                if (isset($filters['fromTerm'])) {
                    $query->whereRaw('
                    (SELECT COUNT(DISTINCT cs.course_id) FROM t_course_student AS cs
                    left join t_course_class cc on cc.id = cs.class_id
                    WHERE cs.student_id = user_id and cc.course_class_term_id = ' . $filters['fromTerm'] . ') = ' .
                        $filters['coursesCount']
                    );
                } else {
                    $query->whereRaw('
                    (SELECT COUNT(DISTINCT cs.course_id) FROM t_course_student AS cs
                    WHERE cs.student_id = user_id) = ' .
                    $filters['coursesCount']
                    );
                }

                $query->groupBy(['cs.course_id', 'cs.class_id', 'u.id']);
            }

            if (isset($filters['withCartItems']) && $filters['withCartItems'] == 'true') {
                $query->whereRaw('u.id in (select student_id from cart where cart_status = "open" having (select count(*) from cart_item where cart_item.cart_id = cart.id) > 0)');
            }

            if (!empty($filters['branches'])) {
                if (!isset($joinedTables[Dept::tableName()])) {
                    $query->leftJoin(Dept::tableName() . ' AS d', 'd.id', '=', 'c.dept_id');
                    $joinedTables[Dept::tableName()] = true;
                }

                $query->whereIn('d.dept_branch_id', explode(',', $filters['branches']));
            }

            if (!empty($filters['waitingFilter'])) {
                $waitingFilter = $filters['waitingFilter'];
                switch ($waitingFilter) {
                    case 'noClassesThisTerm':
                        if ($term = Term::activeTerm()) {
                            $query->whereRaw(
                                "(SELECT COUNT(DISTINCT cc2.id) FROM t_course_class AS cc2
                                WHERE cc2.id = cc.id and cc.course_class_term_id = $term->id) = 0"
                            );
                        }
                        break;

                    case 'noClassesInAllTerms':
                        $query->whereRaw(
                            "(SELECT COUNT(DISTINCT cc2.id) FROM t_course_class AS cc2
                                WHERE cc2.id = cc.id) = 0"
                        );
                        break;

                    case 'noClassesAllAndThisTerm':
                        if ($term = Term::activeTerm()) {
                            $query->whereRaw(
                                "(SELECT COUNT(DISTINCT cc2.id) FROM t_course_class AS cc2
                                WHERE cc2.id = cc.id) = 0"
                            )->orWhereRaw(
                                "(SELECT COUNT(DISTINCT cc2.id) FROM t_course_class AS cc2
                                WHERE cc2.id = cc.id and cc.course_class_term_id = $term->id) = 0"
                            );
                        }

                        break;

                    case 'statusIsWaiting':
                        $query->where('u.user_status', 'waiting');
                        break;
                }
            }
        }
        if (
            isset($filters['ageFrom']) && strlen($filters['ageFrom']) &&
            isset($filters['ageTo']) && strlen($filters['ageTo'])
        ){
            $query->whereBetween(DB::raw('TIMESTAMPDIFF(YEAR,u.age,CURDATE())'),array((int)$filters['ageFrom'],(int)$filters['ageTo']));
        }
        if (!empty($filters['countOnly']) && filter_var($filters['countOnly'], FILTER_VALIDATE_BOOLEAN)) {
            $query->groupBy('p.user_id');
            return count($query->get(['p.user_id']));
        }

        if (empty($filters['noGroup']) || !$filters['noGroup']) {
            $query->groupBy('profileId');
        }

        if (!empty($filters['waitingFilter'])) {
            $query->orderBy('userStatusUpdatedAt', 'desc');
        }

        $query->orderBy('fullName');
        $query->havingRaw('LENGTH(fullName) > 0');

        if (!is_null($limit)) {
            if (isset($filters['page']))
                $rows = $query->skip((intval($filters['page']) - 1) * $limit)->take($limit)->get($fields);
            else
                $rows = $query->take($limit)->get($fields);
        } else {
            $rows = $query->get($fields);
        }
        return [
            'rows' => $rows,
            'info' => DB::select(DB::raw('SELECT FOUND_ROWS() as totalCount;'))[0]
        ];
    }

    public static function getEmploymentFieldValues()
    {
        return [
            'Doctor',
            'Teacher',
            'Student (College)',
            'Student (University)',
            'Student(Secondary)',
            'Solicitor',
            'Financial Service',
            'Unemployed',
            'Self Employed',
            'Businessman',
            'Retail',
            'Teaching Industry',
            'Health Service Employee',
            'Govt Employee',
            'Student',
            'Transport Services',
            'IT',
            'Retired',
            'Admin',
            'Other'
        ];
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) return false;

        if (!$this->allowedBranches) {
            $this->allowedBranches = '';
        }

        if ($this->teacherCrb == null) {
            $this->teacherCrb = false;
        }

        if ($this->teacherStatusCode == null) {
            $this->teacherStatusCode = 0;
        }

        if ($this->teacherHourlyRate == null) {
            $this->teacherHourlyRate = 0;
        }

        if (!$this->profileAddress) {
            $this->profileAddress = '';
        }

        if (!$this->profileAddress2) {
            $this->profileAddress2 = '';
        }

        if (!$this->profileImage) {
            $this->profileImage = '';
        }

        switch ($this->profileGender) {
            case 'male':
                $this->profileTitle = 'mr';
                break;
            case 'female':
                $this->profileTitle = 'mrs';
                break;
        }

        return true;
    }
}
