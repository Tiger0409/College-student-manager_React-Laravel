<?php

namespace App\Models;
use Illuminate\Support\Facades\DB;

/**
 * Class Absent
 * @package App\Models
 * @property int $studentId
 * @property string $date
 * @property string $attendance
 * @property string $comment
 * @property string $late
 * relations
 * @property CourseStudent $courseStudent
 */
class Absent extends ExtendedModel
{
    protected $table = 't_absent';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function courseStudent()
    {
        return $this->belongsTo('App\\Models\\CourseStudent', 'student_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function courseStudentDeleted()
    {
        return $this->belongsTo('App\\Models\\CourseStudentDeleted', 'student_id');
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) {
            return false;
        }

        if (empty($this->__get('late'))) {
            $this->late = '0';
        }

        if (empty($this->__get('attendance'))) {
            $this->attendance = 'absent';
        }

        if (empty($this->__get('comment'))) {
            $this->comment = '';
        }

        return true;
    }


    /**
     * @param int[] $courseStudentIds
     * @return int
     */
    public static function countAbsentDays($courseStudentIds)
    {
        $count = DB::table(self::tableName() . ' AS a')
            ->leftJoin(CourseStudent::tableName() . ' AS cs', 'cs.id', '=', 'a.student_id')
            ->whereIn('cs.id', $courseStudentIds)
            ->where('a.attendance', 'absent')
            ->count();

        return $count;
    }

    /**
     * @param int[] $courseStudentIds
     * @param string $beginDate
     * @param string $endDate
     * @return int
     */
    public static function countAbsentDaysInPeriod($courseStudentIds, $beginDate, $endDate)
    {
        $count = DB::table(self::tableName() . ' AS a')
            ->leftJoin(CourseStudent::tableName() . ' AS cs', 'cs.id', '=', 'a.student_id')
            ->whereIn('cs.id', $courseStudentIds)
            ->where('a.attendance', 'absent')
            ->where('a.date', '>=', $beginDate)
            ->where('a.date', '<=', $endDate)
            ->count();

        return $count;
    }
}
