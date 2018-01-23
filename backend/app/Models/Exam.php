<?php

namespace App\Models;
use Illuminate\Support\Facades\DB;

/**
 * Class Exam
 * @package App\Models
 * @property int $id
 * @property int $idCourseClass
 * @property string $title
 * @property bool submitted
 * @property string $aubmitted_at
 * relations
 * @property CourseClass $courseClass
 * @property Score[] $scores
 */
class Exam extends ExtendedModel
{
    protected $table = 't_additional_exam';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function courseClass()
    {
        return $this->belongsTo('App\\Models\\CourseClass', 'id_course_class');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function scores()
    {
        return $this->hasMany('App\\Models\\Score', 'id_additional_exam');
    }

    public function afterSave(array $options = [])
    {
        parent::afterSave($options);
        $this->createScores();
    }

    public static function populate($params)
    {
        // select all exams in current term or only for class, if it's id set
        /**
         * @var Exam[] $exams
         */
        $exams = [];
        if (isset($params['classId'])) {
            $exams = Exam::where('id_course_class', $params['classId'])->with('scores')->get();
        } else {
            $term = Term::activeTerm();
            if ($term) {
                $exams = Exam::whereHas('courseClass', function ($query) use ($term) {
                    $query->where('course_class_term_id', $term->id);
                })->with('scores')->get();
            } else {
                return response()->json('Active term is not set', 500);
            }
        }

        if (isset($params['feedbackCode']) && isset($params['overwrite'])) {
            // get all comments with feedback code
            $feedbackCode = $params['feedbackCode'];
            $overwrite = filter_var($params['overwrite'], FILTER_VALIDATE_BOOLEAN);

            $comments = DB::table(Bank::tableName())
                ->where('feedback_code', $feedbackCode)
                ->get(['feedback_description']);
            $comments = array_map(function ($comment) { return $comment->feedback_description; }, $comments);


            if (count($comments) == 0) return;

            // populate comments
            foreach ($exams as $exam) {
                foreach ($exam->scores as $score) {
                    $randomComment = $comments[array_rand($comments)];
                    if ($overwrite) {
                        $score->comment = $randomComment;
                    } else {
                        if (!$score->comment || strlen($score->comment) == 0)
                            $score->comment = $randomComment;
                    }
                    $score->save();
                }
            }

            return response()->json($exams);
        } else {
            return response()->json('Missed required params "feedbackCode" or "overwrite"', 400);
        }
    }

    private function createScores()
    {
        foreach ($this->courseClass->courseStudents as $student) {
            $score = new Score([
                'id_additional_exam' => $this->id,
                'id_course_student' => $student->id,
                'score' => 0,
                'attendance_code' => Lookup::ATTENDANCE_CODE_PERFECT,
                'comment' => ''
            ]);
            $score->save();
        }
    }
}
