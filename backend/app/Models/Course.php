<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Illuminate\Support\Facades\DB;

/**
 * Class Course
 * @package App\Models
 * @property int $id
 * @property int $courseGroupId
 * @property string $courseTitle
 * @property string $courseSubtitle
 * @property string $courseDescription
 * @property string $courseStructure
 * @property string $courseCode
 * @propetry int    $weight
 * @property float  $feeForEmployed
 * @property float  $feeForUnemployed
 * @property bool   $isFullTime
 * relations
 * @property Dept            $dept
 * @property CourseClass[]   $courseClasses
 * @property CourseStudent[] $courseStudents
 * @property CourseGroup     $courseGroup
 */
class Course extends ExtendedModel
{
    protected $table = 't_course';

    protected $attributes = [
        'course_subtitle'    => '',
        'course_group_id'    => 0,
        'course_code'        => '',
        'weight'             => 0,
        'fee_for_employed'   => 0,
        'fee_for_unemployed' => 0
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function dept()
    {
        return $this->belongsTo('App\\Models\\Dept', 'dept_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function courseClasses()
    {
        return $this->hasMany('App\\Models\\CourseClass');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function courseStudents()
    {
        return $this->hasMany('App\\Models\\CourseStudent');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function courseStudentsDeleted()
    {
        return $this->hasMany('App\\Models\\CourseStudentDeleted');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function courseGroup()
    {
        return $this->belongsTo('App\\Models\\CourseGroup', 'course_group_id');
    }

    /**
     * @return int
     */
    public static function countInWebsite()
    {
        /**
         * @var Website $website
         */
        $website = Website::find(config('website.id'));
        if (!$website) return 0;

        $branchesIds = [];
        foreach ($website->branchesAssociated as $branch) {
            $branchesIds[] = $branch->id;
        }

        return DB::table(self::tableName() . ' as c')
            ->leftJoin(Dept::tableName() . ' as d', 'd.id', '=', 'c.dept_id')
            ->whereIn('d.dept_branch_id', $branchesIds)
            ->count();
    }

    /**
     * @param int $termId
     * @return int
     */
    public static function countInTerm($termId)
    {
        return DB::table(self::tableName() . ' as c')
            ->leftJoin(CourseClass::tableName() . ' as cc', 'cc.course_id', '=', 'c.id')
            ->where('cc.course_class_term_id', $termId)
            ->distinct('c.id')
            ->count('c.id');
    }

    /**
     * @return int
     */
    public function getClassesCountAttribute()
    {
        return $this->courseClasses()->count();
    }

    /**
     * @return int
     */
    public function getStudentsCountAttribute()
    {
        return $this->courseStudents()->count();
    }

    public function setCourseSubtitlePdfAttribute(UploadedFile $value)
    {
        if ($value->getClientMimeType() !== 'application/pdf') {
            return;
        }

        $value->move(public_path() . '/pdf', $value->getClientOriginalName());
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) {
            return false;
        }

        if (empty($this->attributes['is_full_time'])) {
            $this->attributes['is_full_time'] = false;
        }

        return true;
    }


    public static function getStudentsCountInfo(array $courseIds)
    {
        $activeTerm = Term::activeTerm();

        $query = DB::table(CourseStudent::tableName() . ' as cs');
        $query->leftJoin(Profile::tableName() . ' as p', 'p.user_id', '=', 'cs.student_id');
        $query->leftJoin(CourseClass::tableName() . ' as cc', 'cc.id', '=', 'cs.class_id');
        $query->whereIn('cs.course_id', $courseIds);
        if (!empty($activeTerm)) $query->where('cc.course_class_term_id', $activeTerm->id);
        $students = $query->get([
            'cs.id as id',
            'p.profile_gender as gender',
            'cc.id as classId',
            'cs.course_id as courseId'
        ]);

        $coursesInfo = [];
        foreach ($students as $student) {
            if (empty($student->courseId)) continue;

            if (!isset($coursesInfo[$student->courseId])) {
                $coursesInfo[$student->courseId] = [
                    'id'          => $student->courseId,
                    'maleCount'   => 0,
                    'femaleCount' => 0,
                    'classesInfo' => []
                ];
            }

            $courseInfo = &$coursesInfo[$student->courseId];

            if ($student->gender == 'male') {
                $toIncrement = 'maleCount';
            } else {
                $toIncrement = 'femaleCount';
            }

            $courseInfo[$toIncrement]++;

            $classesInfo = &$courseInfo['classesInfo'];

            if (!empty($student->classId)) {
                if (!isset($classesInfo[$student->classId])) {
                    $classesInfo[$student->classId] = [
                        'id' => $student->classId,
                        'maleCount' => 0,
                        'femaleCount' => 0
                    ];
                }

                $classesInfo[$student->classId][$toIncrement]++;
            }
        }

        return $coursesInfo;
    }

    /**
     * @param array $params
     * @return array
     */
    public static function getGrouped($params)
    {
        $fields = [
            'c.id as id',
            'c.course_title as courseTitle',
            'c.weight as courseWeight',
            'c.fee_for_employed as feeForEmployed',
            'c.fee_for_unemployed as feeForUnemployed',
            'd.dept_name as deptName',
            'd.weight as deptWeight',
            'cg.name as courseGroup',
            'cg.id as courseGroupId',
            'cg.weight as courseGroupWeight',
            'cc.class_time as classTime',
            'cc.class_gender as classGender',
            'cc.class_weight as classWeight',
            'cc.id as classId',
            'cc.course_class_registration_open as classRegOpen',
            'cc.course_class_term_id as classTermId'
        ];

        $query = DB::table(self::tableName() . ' as c');
        $query->leftJoin(Dept::tableName() . ' as d', 'd.id', '=', 'c.dept_id');
        $query->leftJoin(CourseClass::tableName() . ' as cc', 'cc.course_id', '=', 'c.id');
        $query->leftJoin(CourseGroup::tableName() . ' as cg', 'cg.id', '=', 'c.course_group_id');

        if (isset($params['deptId']) && is_numeric($params['deptId'])) {
            $query->where('c.dept_id', $params['deptId']);
        }

        if (isset($params['branchId']) && is_numeric($params['branchId']) && $params['branchId']!=0) {
            $query->where('d.dept_branch_id', $params['branchId']);
        }
        $query->groupBy('id', 'courseTitle', 'classTime', 'classGender', 'classId');
        $query->orderBy('courseTitle');

        $rows = $query->get($fields);
        $activeTerm = Term::activeTerm();
        $output = [];

        $coursesIds = [];
        $iterationsExecTime = [];
        for ($i = 0; $i < count($rows); $i++) {
            $start = microtime(true);
            $row = $rows[$i];
            $rowArray = get_object_vars($row);

            $coursesIds[] = $rowArray['id'];

            $courseGroup = $rowArray['courseGroup'];
            $courseGroupId = $rowArray['courseGroupId'];
            $courseGroupWeight = $rowArray['courseGroupWeight'];

            $course['id'] = $rowArray['id'];
            $course['courseTitle'] = $rowArray['courseTitle'];
            $course['deptName'] = $rowArray['deptName'];
            $course['deptWeight'] = $rowArray['deptWeight'];
            $course['weight'] = $rowArray['courseWeight'];
            $course['feeForEmployed'] = $rowArray['feeForEmployed'];
            $course['feeForUnemployed'] = $rowArray['feeForUnemployed'];
            $course['classes'] = [];
            if (isset($rowArray['classId'])) {

                if ($activeTerm && $rowArray['classTermId'] == $activeTerm->id) {
                    $course['classes'][] = [
                        'classTime'    => $rowArray['classTime'],
                        'classGender'  => $rowArray['classGender'],
                        'classId'      => $rowArray['classId'],
                        'classWeight'  => $rowArray['classWeight'],
                        'classRegOpen' => $rowArray['classRegOpen'],
                    ];
                }
            }

            if (!isset($courseGroup))
                $courseGroup = 'Other';
            $output[$courseGroup]['id'] = $courseGroupId;
            $output[$courseGroup]['weight'] = $courseGroupWeight;

            $courseFound = false;

            if (isset($output[$courseGroup]['courses'])) {
                foreach ($output[$courseGroup]['courses'] as &$existingCourse) {
                   if ($existingCourse['id'] == $course['id']) {
                       $existingCourse['classes'] = array_merge($existingCourse['classes'], $course['classes']);
                       $courseFound = true;
                       break;
                   }
                }
            }

            if (!$courseFound) {
                /*$courseModel = Course::find($course['id']);
                $countInfo = $courseModel->getStudentsCountInfo();
                $course['maleCount'] = $countInfo['maleCount'];
                $course['femaleCount'] = $countInfo['femaleCount'];*/
                $output[$courseGroup]['courses'][] = $course;
            }

            $iterationsExecTime[] = microtime(true) - $start;
        }

        $totalExecTime = 0;
        $avg = 0;
        $max = 0;
        $min = 99999;
        foreach ($iterationsExecTime as $iterExecTime) {
            $totalExecTime += $iterExecTime;
            if ($iterExecTime > $max) $max = $iterExecTime;
            if ($iterExecTime < $min) $min = $iterExecTime;
        }

        $avg = $totalExecTime / count($iterationsExecTime);

        $courseToCountInfo = Course::getStudentsCountInfo($coursesIds);

        foreach ($output as $groupName => &$group) {
            $courses = &$group['courses'];
            foreach ($courses as &$course) {
                if (isset($courseToCountInfo[$course['id']])) {
                    $courseCountInfo = $courseToCountInfo[$course['id']];
                    $course['maleCount'] = $courseCountInfo['maleCount'];
                    $course['femaleCount'] = $courseCountInfo['femaleCount'];
                    $course['studentsCount'] = $courseCountInfo['maleCount'] + $courseCountInfo['femaleCount'];

                    $classesInfo = $courseCountInfo['classesInfo'];
                    $courseClasses = &$course['classes'];
                    foreach ($courseClasses as &$courseClass) {
                        if (isset($classesInfo[$courseClass['classId']])) {
                            $classCountInfo = $classesInfo[$courseClass['classId']];
                            $courseClass['maleCount'] = $classCountInfo['maleCount'];
                            $courseClass['femaleCount'] = $classCountInfo['femaleCount'];
                        }
                    }
                }
            }
        }


        return $output;
    }

    /**
     * @param Course $courseA
     * @param Course $courseB
     * @return bool
     */
    public static function swap($courseA, $courseB)
    {
        if (is_null($courseA) || is_null($courseB)) return false;

        $termGroupId = $courseA->courseGroupId;
        $courseA->courseGroupId = $courseB->courseGroupId;
        $courseB->courseGroupId = $termGroupId;
        $termWeight = $courseA->weight;
        $courseA->weight = $courseB->weight;
        $courseB->weight = $termWeight;
        return $courseA->save() && $courseB->save();
    }
}
