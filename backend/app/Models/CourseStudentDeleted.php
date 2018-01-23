<?php

namespace App\Models;

use App\Classes\Helpers\DataFormatter;
use App\Classes\Helpers\DateHelper;
use App\Classes\Helpers\EmailHelper;
use App\Classes\Helpers\QueryHelper;
use App\Classes\Helpers\StringHelper;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Expression;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;

/**
 * Class CourseStudent
 * @package App\Models
 * @property int    $id
 * @property int    $classId
 * @property int    $courseId
 * @property int    $studentId
 * @property string $adminNotes
 * @property string $certificateFile
 * @property string $feedback
 * @property string $gradeStatus
 * @property float  $reducedAmount
 * @property string $reducedNotes
 * @property string $regPaymentMethod
 * @property string $paymentMethod
 * @property string $regPaymentStatus
 * @property string $regStatus
 * @property string $registerDate
 * @property string $score
 * @property string $studentStatus
 * @property float  $totalAmount
 * @property int    $attendanceCode
 * relations
 * @property User             $user
 * @property CourseClass      $courseClass
 * @property Absent[]         $attendance
 * @property Course           $course
 * @property StudentPayment[] $payments
 * @property StudentGrade[]   $studentGrades
 * @property Score[]          $scores
 * @property Cart             $cart
 */
class CourseStudentDeleted extends ExtendedModel
{
    protected $table = 't_course_student_deleted';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('App\\Models\\User', 'student_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function courseClass()
    {
        return $this->belongsTo('App\\Models\\CourseClass', 'class_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function course()
    {
        return $this->belongsTo('App\\Models\\Course', 'course_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function attendance()
    {
        return $this->hasMany('App\\Models\\Absent', 'student_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function payments()
    {
        return $this->hasMany('App\\Models\\StudentPayment', 'course_student_id');
    }

    public function studentAbsent()
    {
        return $this->hasMany('App\\Models\\Absent','student_id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function initalPayment()
    {
        return $this->payments->where('is_inital', '1');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function studentGrades()
    {
        return $this->hasMany('App\\Models\\StudentGrade', 'course_student_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function cart()
    {
        return $this->belongsTo('App\\Models\\Cart', 'invoice_no', 'invoice_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function scores()
    {
        return $this->hasMany('App\\Models\\Score', 'id_course_student');
    }

    /**
     * @return float
     */
    public function getInitialAmount() {
        $payment = $this->payments()->where('is_initial', '1')->first();
        return $payment ? $payment->amount : 0;
    }

    public function getInitialAmountAttribute() {
        return $this->getInitialAmount();
    }

    public function getTotalAmountAttribute() {
        return $this->getInitialAmount();
    }


    public function getTotalAmountOldAttribute() {
        return $this->getAttributeFromArray('total_amount');
    }

    public function getIsDeletableAttribute() {
        return $this->payments()->where('amount', '>', '0')->count() === 0;
    }

    /**
     * @param int $termId
     * @return float
     */
    public static function countIncomeInTerm($termId)
    {
        /** @var CourseStudent[] $students */
        $query = DB::table(CourseStudent::tableName() . ' as cs');
        $query->leftJoin(CourseClass::tableName() . ' as cc', 'cc.id', '=', 'cs.class_id');
        $query->where('cc.course_class_term_id', $termId);

        //$initialFees = $query->get([DB::raw('sum(cs.total_amount) as amount')]);

        $query->leftJoin(StudentPayment::tableName() . ' as sp', 'sp.course_student_id', '=', 'cs.id');
        $payments = $query->get([DB::raw('sum(sp.amount) as amount')]);

        $sum = floatval($payments[0]->amount);

        return $sum;
    }

    /**
     * @param int $termId
     * @return float
     */
    public static function countExpectedIncomeInTerm($termId)
    {
        /** @var CourseStudent[] $students */
        /*$students = CourseStudent::with('courseClass', 'course')->whereHas('courseClass', function ($query) use ($termId) {
            $query->where('course_class_term_id', $termId);
        })->get();

        $amount = 0;
        foreach ($students as $student) {
            $val = 0;
            switch ($student->studentStatus) {
                case 'employed':
                    $val = $student->courseClass->feeForEmployed > 0 ?
                        $student->courseClass->feeForEmployed : $student->course->feeForEmployed;
                    break;

                case 'unemployed':
                    $val = $student->courseClass->feeForUnemployed > 0 ?
                        $student->courseClass->feeForUnemployed : $student->course->feeForUnemployed;
                    break;

                case 'reduced':
                    $val = $student->reducedAmount;
                    break;
            }

            $amount += floatval($val);
        }*/

        $debtors = static::getDebtors(['filters' => ['termId' => $termId]])['rows'];

        $debtorsAmount = 0;
        foreach ($debtors as $debtor) {
            switch ($debtor->status) {
                case 'employed':
                    $debtorsAmount += floatval($debtor->feeForEmployed) - floatval($debtor->paid);
                    break;
                case 'unemployed':
                    $debtorsAmount += $debtor->feeForUnemployed - $debtor->paid;
                    break;
                case 'reduced':
                    $debtorsAmount += $debtor->reducedFee - $debtor->paid;
                    break;
            }
        }

        return $debtorsAmount + static::countIncomeInTerm($termId);
    }

    /**
     * @param string $gender
     * @return int
     */
    public static function countByGender($gender)
    {
        /*return self::whereHas('profile', function($query) use ($gender) {
            $query->where('profile_gender', $gender);
        })->count()*/;

        $query = DB::table(User::tableName() . ' as u')
            ->leftJoin(Profile::tableName() . ' AS p', 'p.user_id', '=', 'u.id')
            ->leftJoin(self::tableName() . ' as cs', 'cs.student_id', '=', 'u.id')
            ->where('p.profile_gender', $gender)
            ->groupBy('u.id');

        return count($query->get(['u.id']));
    }

    /**
     * @param int $termId
     * @param string $gender
     * @return int
     */
    public static function countInTermByGender($termId, $gender)
    {
        $query = DB::table(User::tableName() . ' as u')
            ->rightJoin(Profile::tableName() . ' AS p', 'p.user_id', '=', 'u.id')
            ->leftJoin(self::tableName() . ' as cs', 'cs.student_id', '=', 'u.id')
            ->leftJoin(CourseClass::tableName() . ' as cc', 'cc.id', '=', 'cs.class_id')
            ->where('p.profile_gender', $gender)
            ->where('cc.course_class_term_id', $termId)
            ->groupBy('u.id');

        return count($query->get(['u.id']));
    }

    public static function countContinuing($termId)
    {
        $terms = Term::all()->toArray();
        $ids = array_map(function ($term) use ($termId) {
            if ($termId != $term['id']) return $term['id'];
        }, $terms);
        $ids = array_filter($ids);

        $fromCurrTerm = DB::table(User::tableName() . ' as u')
            ->leftJoin(self::tableName() . ' as cs', 'cs.student_id', '=', 'u.id')
            ->leftJoin(CourseClass::tableName() . ' as cc', 'cc.id', '=', 'cs.class_id')
            ->rightJoin(Profile::tableName() . ' as p', 'p.user_id', '=', 'u.id')
            ->where('cc.course_class_term_id', $termId)
            ->groupBy('u.id')
            ->get(['u.id as userId']);

        $userIds = [];
        foreach ($fromCurrTerm as $user) {
            if ($user->userId) $userIds[] = $user->userId;
        }

        $query = DB::table(User::tableName() . ' as u')
            ->leftJoin(self::tableName() . ' as cs', 'cs.student_id', '=', 'u.id')
            ->leftJoin(CourseClass::tableName() . ' as cc', 'cc.id', '=', 'cs.class_id')
            ->leftJoin(Profile::tableName() . ' as p', 'p.user_id', '=', 'u.id')
            ->whereIn('cc.course_class_term_id', $ids)
            ->whereIn('u.id', $userIds)
            ->groupBy('u.id');

        return count($query->get(['u.id']));
    }

    public static function countNew($termId)
    {
        $countInCurrTerm = count(DB::table(User::tableName() . ' as u')
            ->leftJoin(self::tableName() . ' as cs', 'cs.student_id', '=', 'u.id')
            ->leftJoin(CourseClass::tableName() . ' as cc', 'cc.id', '=', 'cs.class_id')
            ->rightJoin(Profile::tableName() . ' as p', 'p.user_id', '=', 'u.id')
            ->where('cc.course_class_term_id', $termId)
            ->groupBy('u.id')
            ->get(['u.id as userId']));

        return $countInCurrTerm - self::countContinuing($termId);
    }

    public function getTransactionAttribute()
    {
        /** @var Cart $cart */
        $cart = Cart::where(['invoice_no' => $this->invoiceId, 'student_id' => $this->studentId])->first();

        if ($cart->stripeTransaction) {
            return ['method' => 'stripe', 'id' => $cart->stripeTransaction->id];
        }

        return ['method' => 'paypal', 'id' => $cart->id];
    }

    /**
     * @return float
     */
    public function getPaymentsAmount()
    {
        $result = 0;

        foreach ($this->payments as $payment) {
            $result += $payment->amount;
        }

        return floatval($result);
    }

    public function getExams()
    {
        $exams = [];

        // Final grade
        $exams[] = [
            'title' => 'Final Grade',
            'score' => intval($this->score),
            'attendanceCode' => intval($this->attendanceCode),
            'comment' => $this->feedback
        ];

        // Student grade
        foreach ($this->studentGrades as $studentGrade) {
            $exams[] = [
                'title' => $studentGrade->gradeText,
                'score' => intval($studentGrade->score),
                'attendanceCode' => intval($studentGrade->attendanceCode),
                'comment' => $studentGrade->comment
            ];
        }

        // Student scores
        foreach ($this->scores as $score) {
            $exams[] = [
                'title' => $score->exam->title,
                'score' => intval($score->score),
                'attendanceCode' => intval($score->attendanceCode),
                'comment' => $score->comment
            ];
        }

        return $exams;
    }

    public function getLessons()
    {
        $query = DB::table(Absent::tableName() . ' as a');
        $query->leftJoin($this->table . ' as cs', 'cs.id', '=', 'a.student_id');
        $query->leftJoin(CourseClass::tableName() . ' as cc', 'cc.id', '=', 'cs.class_id');
        $query->leftJoin(ClassWork::tableName() . ' as cw', 'cw.course_class_id', '=', 'cc.id');
        $query->select([
            'cw.date as date',
            'cw.done_work as doneWork',
            'cw.home_work as homeWork',
            'a.attendance as attendance',
            'a.comment as comment'
        ]);
        $query->where('a.student_id', $this->id);
        $query->orderBy('date', 'DESC');

        return $query->get();
    }

    /**
     * @return float
     */
    public function getTotalPaid()
    {
        return $this->getPaymentsAmount();
    }

    /**
     * @param Builder $query
     * @param $filters
     */
    public static function applyFilters(&$query, $filters)
    {
        $filters = array_filter($filters, function ($item) { return $item !== 'All' && !empty($item); });

        // "All" means that all values are correct, so this filter filters nothing
        foreach ($filters as $key => $value)
            if ($value === 'All') unset($filters[$key]);

        if (isset($filters['paymentMethod']))
            $query->where('reg_payment_method', $filters['paymentMethod']);

        if (isset($filters['paymentStatus']))
            $query->where('reg_payment_status', $filters['paymentStatus']);

        if (isset($filters['regStatus']))
            $query->where('reg_status', $filters['regStatus']);

        if (isset($filters['employmentType']))
            $query->where('student_status', $filters['employmentType']);

        if (isset($filters['branch'])) {
            $parts = explode('_', $filters['branch']);
            $query->whereHas('course', function ($courseQuery) use ($parts) {
                $courseQuery->whereHas('dept', function ($deptQuery) use ($parts) {
                    if ($parts[0] === 'branch')
                        $deptQuery->where('city_id', $parts[1]);
                    elseif ($parts[0] === 'branchAssoc')
                        $deptQuery->where('dept_branch_id', $parts[1]);
                });
            });
        }

        if (!empty($filters['beginDate'])) {
            $value = $filters['beginDate'];
            $query->where('register_date', '>=', DateHelper::toSqlFormat($value));
        }

        if (!empty($filters['endDate'])) {
            $value = $filters['endDate'];
            $query->where('register_date', '<=', DateHelper::toSqlFormat($value));
        }

        if (isset($filters['currTermOnly'])) {
            if (
                filter_var($filters['currTermOnly'], FILTER_VALIDATE_BOOLEAN) &&
                $activeTerm = Term::activeTerm()
            ) {
                $activeTermId = $activeTerm->id;
                $query->whereHas('courseClass', function ($classQuery) use ($activeTermId) {
                    $classQuery->where('course_class_term_id', $activeTermId);
                });
            }
        }

        if (isset($filters['paymentType'])) {
            $paymentType = $filters['paymentType'];
            $query->whereHas('payments', function ($paymentQuery) use ($paymentType) {
                $paymentQuery->where('payment_method', $paymentType);
                $paymentQuery->where('is_initial', '1');
            });
        }

        if (isset($filters['haveAdminNotes'])) {
            if (filter_var($filters['haveAdminNotes'], FILTER_VALIDATE_BOOLEAN)) {
                $query->whereNotNull('admin_notes');
                $query->where('admin_notes', '!=', '');
            }
        }

        if (isset($filters['haveReducedNotes'])) {
            if (filter_var($filters['haveReducedNotes'], FILTER_VALIDATE_BOOLEAN)) {
                $query->whereNotNull('reduced_notes');
                $query->where('reduced_notes', '!=', '');
            }
        }
    }

    public static function getDebtors($params)
    {
        $query = DB::table(self::tableName() . ' AS cs');
        $query->select(
            DB::raw('SQL_CALC_FOUND_ROWS cs.id AS id'),
            DB::raw('IF(LENGTH(u.user_fullname) > 0, u.user_fullname, CONCAT(p.profile_forname, " ", p.profile_surname)) as studentName'),

            'cc.class_time AS classTime',
            DB::raw('IFNULL(SUM(sp.amount), 0) AS paid'),
            'cs.student_status AS status',
            'cs.reduced_amount AS reducedFee',
            'cs.admin_notes AS adminNotes',
            'u.serial_number AS regStatus',
            'cs.student_id AS studentId',

            DB::raw('if(cc.fee_for_employed >= 0, cc.fee_for_employed, c.fee_for_employed) AS feeForEmployed'),
            DB::raw('if(cc.fee_for_unemployed >= 0, cc.fee_for_unemployed, c.fee_for_unemployed) AS feeForUnemployed'),

            'c.dept_id AS deptId',
            'c.course_title AS courseTitle',

            'p.profile_address as profileAddress',
            'p.profile_address2 as profileAddress2',
            'p.profile_postcode as profilePostcode',
            'p.city as city',
            'p.profile_telephone as telephone',
            'p.profile_mobile as mobile'
        );
        $query->leftJoin(User::tableName() . ' AS u', 'u.id', '=', 'cs.student_id');
        $query->leftJoin(CourseClass::tableName() . ' AS cc', 'cc.id', '=', 'cs.class_id');
        $query->leftJoin(Course::tableName() . ' AS c', 'c.id', '=', 'cc.course_id');
        $query->leftJoin(StudentPayment::tableName() . ' AS sp', 'sp.course_student_id', '=', 'cs.id');
        $query->leftJoin(Dept::tableName() . ' AS d', 'd.id', '=', 'c.dept_id');
        $query->leftJoin(Profile::tableName() . ' AS p', 'p.user_id', '=', 'cs.student_id');

        $query->groupBy('cs.id');
        $having =
            '((status = "employed" AND paid <= feeForEmployed AND feeForEmployed > 0) OR ' .
            '(status = "unemployed" AND paid <= feeForUnemployed AND feeForEmployed > 0) OR ' .
            '(status = "reduced" AND paid <= reducedFee AND feeForEmployed > 0))';
        $query->havingRaw($having);


        $query->orderBy('u.user_fullname', 'asc');
        $query->orderBy('cc.class_time', 'asc');

        if (isset($params['filters'])) {
            $filters = $params['filters'];

            foreach ($filters as $key => $value) {
                if ($value == 'All' || $value == '') unset($filters[$key]);
            }

            if (isset($filters['termId'])) {
                $query->where('cc.course_class_term_id', $filters['termId']);
            }

            if (isset($filters['userId'])) {
                $query->where('cs.student_id', $filters['userId']);
            }

            if (isset($filters['deptBranchId'])) {
                $query->where('d.dept_branch_id', $filters['deptBranchId']);
            }

            if (!empty($filters['regPaymentMethod'])) {
                $query->where('cs.reg_payment_method', $filters['regPaymentMethod']);
            }

            if (!isset($params['pastInstalmentsFee'])) {
                $params['pastInstalmentsFee'] = Instalment::getPastFee();
            }

            if ($params['pastInstalmentsFee'] > 0) {
                $pastInstalmentsFree = $params['pastInstalmentsFee'];
                $query->havingRaw("paid < {$pastInstalmentsFree}");
            }

            if (isset($filters['coursesFilter'])) {
                $query->where('cs.course_id', $filters['coursesFilter']);
            }

            $query->havings = [];

            if (isset($filters['firstInstalment'])) {
                $having .= ' AND (
                     (status = "employed" AND (feeForEmployed / 2 - paid) > 0) OR ' .
                    '(status = "unemployed" AND (feeForUnemployed / 2 - paid) > 0) OR ' .
                    '(status = "reduced" AND (reducedFee / 2 - paid) > 0))';
            }

            if (isset($filters['secondInstalment'])) {
                $having .= ' AND (
                    (status = "employed" AND (feeForEmployed - paid) > 0) OR ' .
                    '(status = "unemployed" AND (feeForUnemployed - paid) > 0) OR ' .
                    '(status = "reduced" AND (reducedFee - paid) > 0))';
            }
        }

        $query->havingRaw($having);
        $paginated = QueryHelper::paginate($query, $params, QueryHelper::SIMPLE_PAGINATION);
        $paginated['info']['pastInstalmentsFee'] = isset($pastInstalmentsFree) ? $pastInstalmentsFree : 0;
        return $paginated;
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) {
            return false;
        }

        if (is_null($this->getAttribute('invoice_id'))) {
            $this->setAttribute('invoice_id', '');
        }

        if (is_null($this->getAttribute('register_date'))) {
            $this->setAttribute('register_date', date('Y-m-d H:i:s', time()));
        }

        if (is_null($this->getAttribute('reg_payment_status'))) {
            $this->setAttribute('reg_payment_status', 'paid');
        }

        if (is_null($this->getAttribute('student_status'))) {
            $this->setAttribute('student_status', 'employed');
        }

        if (is_null($this->getAttribute('reg_status'))) {
            $this->setAttribute('reg_status', 'active');
        }

        if (is_null($this->getAttribute('total_amount'))) {
            $this->setAttribute('total_amount', 0);
        }

        if (is_null($this->getAttribute('reduced_amount'))) {
            $this->setAttribute('reduced_amount', 0);
        }

        if (is_null($this->getAttribute('score'))) {
            $this->setAttribute('score', 0);
        }

        if (is_null($this->getAttribute('reduced_notes'))) {
            $this->setAttribute('reduced_notes', '');
        }

        if (is_null($this->getAttribute('grade_status'))) {
            $this->setAttribute('grade_status', 'none');
        }

        if (is_null($this->getAttribute('certificate_file'))) {
            $this->setAttribute('certificate_file', '');
        }

        if (is_null($this->getAttribute('attendance_code'))) {
            $this->setAttribute('attendance_code', 0);
        }

        if (is_null($this->getAttribute('reg_payment_method'))) {
            $this->setAttribute('reg_payment_method', 'active');
        }

        if (!is_null($this->getAttribute('class_id'))) {
            $courseClass = CourseClass::findOrFail($this->getAttribute('class_id'));
            $this->setAttribute('course_id', $courseClass->courseId);
        }

        return true;
    }



    public function fillReceipt($template)
    {
        $data = [
            '%REG_DATE%'        => date('d M Y H:i:s', DateHelper::mysqlToUnix($this->registerDate)),
            '%PAYMENT_STATUS%'  => $this->regPaymentStatus,
            '%NAME%'            => $this->user->userFullname,
            '%SERIAL%'            => $this->user->serial_number,
            '%ADDRESS%'         => $this->user->profile->profileAddress,
            '%POSTCODE%'        => $this->user->profile->profilePostcode,
            '%EMAIL%'           => $this->user->userEmailAddress,
            '%TELEPHONE%'       => $this->user->profile->profileTelephone,
            '%COURSE_NAME%'     => $this->course->courseTitle,
            '%COURSE_TIME%'     => $this->courseClass->classTime,
            '%TOTAL_PRICE%'     => ('&pound; ' . number_format($this->getTotalPaid(), 2)),
            '%REDUCED_NOTES%'   => (
            ($this->studentStatus == 'reduced') ?
                $this->reducedNotes : ""
            )
        ];

        $payments = $this->payments;
        if ($payments && count($payments) > 0) {
            $rows = '';
            foreach ($payments as $payment) {
                $rows .= "(
                    {$payment->date},
                    &pound{$payment->amount},
                    {$payment->receivedBy},
                    {$payment->paymentMethod}
                )";
            }
            $data['%TABLE_PAYMENT_LIST%'] = "
                {$rows}
            ";
        }

        foreach ($data as $placeHolder => $input) {
            $template = str_replace($placeHolder, $input, $template);
        }

        return $template;
    }

    /**
     * @param string $template
     * @param array $studentsIds
     * @return string
     * @throws \Exception
     * @throws \Throwable
     */
    public static function fillReceiptRows($studentsIds)
    {
        /** @var CourseStudent[] $students */
        $students = CourseStudent::whereIn('id', $studentsIds)->get();
        if (count($students) === 0) return '';

        $template = '';
        foreach ($students as $student) {
            $currTemplate = $student->course->dept->branchAssociated->invoiceEmailTemplate;
            if (!empty($currTemplate)) {
                $template = $currTemplate;
                break;
            }
        }

        if ($template === '') return 'Receipt template was not found';

        $user = $students[0]->user;

        $data = [
            '%REG_DATE%'        => date('d M Y H:i:s', DateHelper::mysqlToUnix($students[0]->registerDate)),
            '%NAME%'            => $user->userFullname,
            '%ADDRESS%'         => $user->profile->profileAddress,
            '%EMAIL%'           => $user->userEmailAddress,
            '%TELEPHONE%'       => $user->profile->profileTelephone,
            '%PAYMENT_STATUS%'  => 'Completed',
            '%TOTAL_PRICE%'     => 0,
            '%ROW%'             => ''
        ];

        $rowData = [];
        foreach ($students as $student) {

            $data['%TOTAL_PRICE%'] += $student->getInitialAmount();

            $rowData[] = [
                'classTime'        => $student->courseClass->classTime,
                'courseTitle'      => $student->course->courseTitle,
                'totalAmount'      => $student->getInitialAmount(),
                'regPaymentStatus' => $student->regPaymentStatus
            ];
        }

        $data['%ROW%'] = view('common.invoice-row', ['rowData' => $rowData])->render();

        foreach ($data as $placeHolder => $input) {
            $template = str_replace($placeHolder, $input, $template);
        }

        return $template;
    }

    public static function insertFromCart(Cart $cart, $options = [])
    {
        if (!$cart) {
            return false;
        }

        $studentsIds = [];

        $regStatus = 'active';

        $cartItemsCount = count($cart->cartItems);

        $minDiscountNum = intval(GeneralSetting::getValue('min_discount_num', 3));
        $discountAmount = number_format(GeneralSetting::getValue('discount_amount', 10), 2);
        $minFreeNum = intval(GeneralSetting::getValue('min_free_num', 5));
        $freeCourseAmount = intval(GeneralSetting::getValue('free_course_amount', 1));

        $adminNotes = '';

        if ($cartItemsCount >= $minFreeNum) {
            $adminNotes = "Have $minFreeNum Courses get $freeCourseAmount free";
        } elseif ($cartItemsCount >= $minDiscountNum && $minFreeNum > $minDiscountNum) {
            $adminNotes = "$minDiscountNum Courses Discount for $discountAmount%";
        }

        $invoiceNo = $cart->invoiceNo;

        $result = true;

        if ($cartItemsCount === 0) {
            return $result;
        }

        $newStudents = [];

        foreach ($cart->cartItems as $cartItem) {
            $studentStatus = $cartItem->studentStatus;

            $relativeNote = '';

            if ($cartItem->ticketNumber > 1) {
                $relatives = $cartItem->relatives;
                $relativeNoteArray = [];
                foreach ($relatives as $relative) {
                    $relativeNoteArray[] = $relative['fullname'] . ' - ' . $relative['email'];
                }
                $relativeNote = '(' . implode(',', $relativeNoteArray) . ')';
            }

            $adminNotes =
                "$cartItem->ticketNumber Ticket" .
                ($relativeNote ? " - $relativeNote " : "") .
                ($adminNotes ? " - $adminNotes" : "");

            if ($cartItem->notes) {
                $adminNotes = ($adminNotes ? "\n" : '') . $cartItem->notes;
            }

            if (!$cartItem->courseClass || !$cartItem->courseClass->course) {
                continue;
            }

            $newStudent = new CourseStudent([
                'invoice_id'         => $invoiceNo,
                'course_id'          => $cartItem->courseClass->course->id,
                'student_id'         => $cart->studentId,
                'register_date'      => date('Y-m-d H:i:s', time()),
                'reg_status'         => $regStatus,
                'reg_payment_status' => 'paid',
                'reg_payment_method' => 'active',
                'student_status'     => $studentStatus,
                'class_id'           => $cartItem->classId,
                'admin_notes'        => $adminNotes,
                'reduced_amount'     => $studentStatus == 'reduced' ? $cartItem->calculatedPrice : 0
            ]);

            $saved = $newStudent->saveOrFail();

            $newStudent->user->addClosestBranches($newStudent);

            $studentsIds[] = $newStudent->id;

            $methodKey = isset($options['method']) ? 'method' : 'payment_method';
            $paymentMethod = !empty($options[$methodKey]) ? $options[$methodKey] : 'cash';
            $amount = in_array($paymentMethod, ['stripe', 'paypal']) ?
                $cartItem->priceWithSurcharge : $cartItem->calculatedPrice;

            $initPayment = new StudentPayment([
                'course_student_id' => $newStudent->id,
                'date'              => date('Y-m-d H:i:s', time()),
                'amount'            => $amount,
                'payment_method'    => $paymentMethod,
                'staff'             => !empty($options['staff']) ? $options['staff'] : '',
                'received_by'       => !empty($options['receivedBy']) ? $options['receivedBy'] : '',
                'is_initial'        => '1'
            ]);
            $initPayment->save();

            if ($cartItem->ticketNumber > 1) {
                $user = $cart->user;
                $studentStatus = $cartItem->studentStatus;
                $adminNotes = "Relatives of $user->userFullname - $user->userEmailAddress";
                // iterate relatives data
                $relatives = $cartItem->relatives;

                foreach ($relatives as $relative) {
                    if ($relative['age'] === "1") {
                        $newUser = User::createFromRelative($user, $relative)->id;
                        $student = new CourseStudent([
                            'invoice_no'         => $invoiceNo,
                            'course_id'          => $cartItem->courseClass->course->id,
                            'student_id'         => $newUser,
                            'register_date'      => date('Y-m-d H:i:s', time()),
                            'reg_status'         => $regStatus,
                            'reg_payment_status' => 'paid',
                            'reg_payment_method' => 'active',
                            'student_status'     => $studentStatus,
                            'class_id'           => $cartItem->classId,
                            'admin_notes'        => $adminNotes,
                            'reduced_amount'     => $studentStatus == 'reduced' ? $cartItem->calculatedPrice : 0
                        ]);

                        $saved &= $student->saveOrFail();

                        $initPayment = new StudentPayment([
                            'course_student_id' => $student->id,
                            'date'              => date('Y-m-d H:i:s', time()),
                            'amount'            => $amount,
                            'payment_method'    => $paymentMethod,
                            'staff'             => !empty($options['staff']) ? $options['staff'] : '',
                            'received_by'       => !empty($options['receivedBy']) ? $options['receivedBy'] : '',
                            'is_initial'         => '1'
                        ]);
                        $initPayment->save();
                    } else {
                        EmailHelper::sendRelativeEmail($relative, $user);
                    }
                }
            }

            if ($saved) {
                $branch = $newStudent->course->dept->branchAssociated;
                $newStudents[$branch->id][] = $newStudent;
            }
        }

        foreach ($newStudents as $students) {
            try {
                EmailHelper::sendInvoicesEmail($students, $cart->paymentStatus);
            } catch (\Exception $e) {}
        }

        return $studentsIds;
    }
}
