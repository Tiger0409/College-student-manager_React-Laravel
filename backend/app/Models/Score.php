<?php

namespace App\Models;

/**
 * Class Score
 * @package App\Models
 * @property int $id
 * @property int $score
 * @property int $attendanceCode
 * @property string $comment
 * relations
 * @property Exam $exam
 * @property CourseStudent $courseStudent
 */
class Score extends ExtendedModel
{
    protected $table = 't_additional_score';
    protected $fillable = ['id_additional_exam', 'id_course_student', 'score', 'attendance_code', 'comment'];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function exam()
    {
        return $this->belongsTo('App\\Models\\Exam', 'id_additional_exam');
    }

    public function getExamTitleAttribute()
    {
        if (!$this->exam) {
            return '';
        }

        return $this->exam->title;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function courseStudent()
    {
        return $this->belongsTo('App\\Models\\CourseStudent', 'id_course_student');
    }

    public function courseStudentDeleted()
    {
        return $this->belongsTo('App\\Models\\CourseStudentDeleted', 'id_course_student');
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) return false;

        if (empty($this->__get('score'))) {
            $this->score = 0;
        }

        if (empty($this->__get('attendanceCode'))) {
            $this->attendanceCode = -1;
        }

        if (empty($this->__get('comment'))) {
            $this->comment = '';
        }

        return true;
    }
}
