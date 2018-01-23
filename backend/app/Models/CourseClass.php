<?php

namespace App\Models;

use App\Classes\Helpers\DataFormatter;
use App\Classes\Helpers\QueryHelper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * Class CourseClass
 * @package App\Models
 * @property int    $id
 * @property int    $courseId
 * @property int    $teacherId
 * @property string $courseClassTerm deprecated
 * @property string $courseClassYear deprecated
 * @property int    $courseClassTermId
 * @property string $classTime
 * @property string $classGender
 * @property string $receiptEmailSubject
 * @property string $receiptEmailBody
 * @property float  $feeForEmployed
 * @property float  $feeForUnemployed
 * relations
 * @property Term             $term
 * @property Course           $course
 * @property CourseStudent[]  $courseStudents
 * @property CourseClassGroup $courseClassGroup
 * @property Exam[]           $exams
 * @property Classroom        $classroom
 * @property ClassWork[]      $classWorks
 * @property User             $teacher
 */
class CourseClass extends ExtendedModel
{
    public $timestamps = false;
    protected $table = 't_course_class';
    protected $fillable = ['submitted'];
    protected $attributes = [
        'submitted'                      => 0,
        'teacher_id'                     => 0,
        'class_weight'                   => 0,
        'course_class_capacity'          => 0,
        'course_class_registration_open' => 'no',
        'classroom_id'                   => 0,
        'class_key'                      => '',
        'class_description'              => '',
        'submitted'                      => 0,
        'class_group_id'                 => 0,
        'receipt_email_body'             => '',
        'fee_for_employed'               => -1,
        'fee_for_unemployed'             => -1,
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function course()
    {
        return $this->belongsTo('App\\Models\\Course', 'course_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function term()
    {
        return $this->belongsTo('App\\Models\\Term', 'course_class_term_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function courseStudents()
    {
        return $this->hasMany('App\\Models\\CourseStudent', 'class_id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function courseStudentsDeleted()
    {
        return $this->hasMany('App\\Models\\CourseStudentDeleted', 'class_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function teacher()
    {
        return $this->belongsTo('App\\Models\\User', 'teacher_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function courseClassGroup()
    {
        return $this->belongsTo('App\\Models\\CourseClassGroup', 'class_group_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function exams()
    {
        return $this->hasMany('App\\Models\\Exam', 'id_course_class');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function classroom()
    {
        return $this->belongsTo('App\\Models\\Classroom', 'classroom_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function classWorks()
    {
        return $this->hasMany('App\\Models\\ClassWork', 'course_class_id');
    }

    public function getStudentsAttendanceAttribute()
    {
        return DataFormatter::modelsFieldsToArray($this->courseStudents, [
            'id',
            'user.userFullname',
            'attendance'
        ]);
    }

    public function getStudentsCountAttribute()
    {
        return $this->courseStudents()->count();
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) {
            return false;
        }

        if (empty($this->attributes['course_class_term_id'])) {
            $activeTerm = Term::activeTerm();
            if (!is_null($activeTerm)) {
                $this->attributes['course_class_term_id'] = $activeTerm->id;
            } else {
                $this->attributes['course_class_term_id'] = 0;
            }
        }

        if (empty($this->attributes['class_key_code'])) {
            $this->attributes['class_key_code'] = mt_rand(100000, 999999);
        }

        return true;
    }

    public function afterSave(array $options = [])
    {
        parent::afterSave($options);
        CourseStudent::query()->where(['class_id' => $this->id])->update(['course_id' => $this->courseId]);
    }


    public function getExamResults()
    {
        $students = [];
        foreach ($this->courseStudents as $student) {
            $students[] = [
                'studentInfo' => [
                    'name' => $student->user->userFullname,
                    'id' => $student->id
                ],
                'finalGrade' => [
                    'score'          => $student->score,
                    'attendanceCode' => $student->attendanceCode,
                    'comment'        => $student->feedback
                ]
            ];
        }

        $examResults = [];
        foreach ($this->exams as $exam) {
            $examResults[] = [
                'exam' => $exam->fieldsToArray(['title', 'id']),
                'scores' => DataFormatter::modelsToArrays($exam->scores)
            ];
        }

        return [
            'students' => $students,
            'examResults' => $examResults
        ];
    }

    /**
     * @return int
     */
    public static function countInWebsite()
    {
        $website = Website::active();
        if (!$website) return 0;

        $branchesIds = [];
        foreach ($website->branchesAssociated as $branch) {
            $branchesIds[] = $branch->id;
        }

        return DB::table(self::tableName() . ' AS cc')
            ->leftJoin(Course::tableName() . ' AS c', 'c.id', '=', 'cc.course_id')
            ->leftJoin(Dept::tableName() . ' AS d', 'd.id', '=', 'c.dept_id')
            ->whereIn('d.dept_branch_id', $branchesIds)
            ->count();
    }

    /**
     * @param int $termId
     * @param string $gender
     * @return int
     */
    public static function countInTermByGender($termId, $gender)
    {
        return self::where(['class_gender' => $gender, 'course_class_term_id' => $termId])
            ->count();
    }

    /**
     * @param array $params
     * @return string
     */
    public static function getGrouped($params)
    {
        if (isset($params['filters']))
            $filters = $params['filters'];

        //$websiteId = config('website.id');

        $query = DB::table(self::tableName() . ' as cc');
        $query->select([
            'cc.id AS id',
            'cc.class_time AS classTime',
            'c.course_title AS courseTitle',
            'c.weight as courseWeight',
            'c.id as courseId',
            DB::raw('CONCAT("(term ", t.term, " ", t.year, ")") AS branch'),
            DB::raw('(SELECT COUNT(cs.id) from ' . CourseStudent::tableName() . ' AS cs ' .
                'LEFT JOIN t_profile AS p on p.user_id = cs.student_id ' .
                'WHERE cs.class_id = cc.id AND p.profile_gender = "male") AS maleStudents'),
            DB::raw('(SELECT COUNT(cs.id) from ' . CourseStudent::tableName() . ' AS cs ' .
                'LEFT JOIN t_profile AS p on p.user_id = cs.student_id ' .
                'WHERE cs.class_id = cc.id AND p.profile_gender = "female") AS femaleStudents'),
            'cc.class_gender AS gender',
            'cc.course_class_registration_open AS regOpen',
            'cc.class_weight AS weight',
            'ccg.name AS classGroupName',
            'ccg.id AS classGroupId',
            'ccg.weight AS classGroupWeight',
            'cc.class_weight AS classWeight',
            'd.dept_name AS DeptName'
        ]);
        $query->leftJoin(Term::tableName() . ' AS t', 't.id', '=', 'cc.course_class_term_id');
        $query->leftJoin(Course::tableName() . ' AS c', 'c.id', '=', 'cc.course_id');
        $query->leftJoin(Dept::tableName() . ' AS d', 'd.id', '=', 'c.dept_id');
        $query->leftJoin(CourseClassGroup::tableName() . ' AS ccg', 'ccg.id', '=', 'cc.class_group_id');

        $query->orderBy('d.weight','ASC');
        $query->orderBy('c.weight','ASC');
        $query->orderBy('cc.class_weight','ASC');

        $query->orderBy('d.dept_name','ASC');
        $query->orderBy('c.course_title','ASC');
        //$query->orderBy('cc.class_weight', 'ASC');
        //$query->where('d.dept_branch_id', $websiteId);

        if (isset($filters)) {
            foreach ($filters as $key => $value)
                if ($value == 'All' || empty($value)) unset($filters[$key]);

            if (!empty($filters['courseSelect'])) {
                $query->where('c.id', $filters['courseSelect']);
            }

            if (!empty($filters['classTime'])) {
                $query->where('cc.class_time', 'LIKE', '%' . $filters['classTime'] . '%');
            }

            if (!empty($filters['termId'])) {
                $query->where('t.id', '=', $filters['termId']);
            }

            if (!empty($filters['branchId'])) {
                $query->where('d.dept_branch_id', $filters['branchId']);
            }
        }

        $paginated = QueryHelper::paginate($query, $params);
        return [
            'rows' => $paginated['items'],
            'info' => ['totalCount' => $paginated['count']]
        ];
    }

    public function getStudentsCountInfo()
    {
        $maleCount = 0;
        $femaleCount = 0;

        $query = DB::table(CourseStudent::tableName() . ' as cs');
        $query->leftJoin(Profile::tableName() . ' as p', 'p.user_id', '=', 'cs.student_id');
        $query->where('cs.class_id', $this->id);
        $students = $query->get(['cs.id as id', 'p.profile_gender as gender']);

        foreach ($students as $student) {
            if ($student->gender == 'male') {
                $maleCount++;
            } else {
                $femaleCount++;
            }
        }

        return ['maleCount' => $maleCount, 'femaleCount' => $femaleCount];
    }
}
