<?php

namespace App\Models;

/**
 * Class StudentGrade
 * @package App\Models
 * @property int $id
 * @property int $courseStudentId
 * @property string $gradeText
 * @property string $score
 * @property int $attendanceCode
 * @property string $comment
 * @property bool $submitted
 * @property string $submittedAt
 * relations
 * @property CourseStudent $courseStudent
 */
class StudentGrade extends ExtendedModel
{
    protected $table = 't_student_grade';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function courseStudent()
    {
        return $this->belongsTo('App\\Models\\CourseStudent', 'course_student_id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function courseStudentDeleted()
    {
        return $this->belongsTo('App\\Models\\CourseStudentDeleted', 'course_student_id');
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) return false;

        if (empty($this->__get('gradeText'))) {
            $this->gradeText = '';
        }

        if (empty($this->__get('score'))) {
            $this->score = '0';
        }

        if (empty($this->__get('attendanceCode'))) {
            $this->attendanceCode = -1;
        }

        if (empty($this->__get('comment'))) {
            $this->comment = '';
        }

        if (empty($this->__get('submitted'))) {
            $this->submitted = false;
        }

        if (empty($this->__get('submittedAt'))) {
            $this->submittedAt = date('Y-m-d H:i:s', 0);
        }

        return true;
    }
}
