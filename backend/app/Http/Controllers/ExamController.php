<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\CourseClass;
use App\Models\CourseStudent;
use App\Models\Exam;
use App\Models\Score;
use App\Models\StudentGrade;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class ExamController extends Controller
{
    public function getByClass(Request $request, $classId)
    {
        if ($class = CourseClass::find($classId))
            return response()->json($class->exams);

        return response()->json('Class was not found', 404);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function create(Request $request)
    {
        $params = $request->all();
        if (isset($params['courseClassIds']) && isset($params['title'])) {
            $allSaved = true;
            $exams = [];
            $courseClassIds = $params['courseClassIds'];
            $title = $params['title'];
            foreach ($courseClassIds as $id) {
                $exam = new Exam();
                $exam->idCourseClass = $id;
                $exam->title = $title;
                $exam->submitted = false;
                $isSaved = $exam->save();
                if ($isSaved)
                    $exams[] = $exam;
                $allSaved &= $isSaved;
            }

            if ($allSaved)
                return response()->json($exams);
            else
                return response()->json('Wrong course id/id\'s', 400);
        }

        return response()->json('Params was not supplied', 400);
    }

    /**
     * @param Request $request
     * @param int $id
     * @return JsonResponse
     */
    public function delete(Request $request, $id)
    {
        /**
         * @var Exam $exam
         */
        if ($exam = Exam::find($id)) {
            if ($exam->delete())
                return response()->json('', 204);
            return response()->json('Exam was not deleted', 500);
        }
        return response()->json('Exam was not found', 404);
    }

    /**
     * @param Request $request
     * @param $id
     * @return JsonResponse
     */
    public function edit(Request $request, $id)
    {
        if ($exam = Exam::find($id)) {
            $exam->loadInput($request->all());
            if ($exam->save())
                return response()->json($exam->asArray());
            return response()->json('Exam was not updated', 500);
        }
        return response()->json('Exam was not found', 404);
    }

    public function populate(Request $request)
    {
        Exam::populate($request->all());
    }

    public function getExamResults($classId)
    {
        /**
         * @var CourseClass $courseClass
         */
        $courseClass = CourseClass::find($classId);
        if (!$courseClass) {
            return response()->json('Model not found', 404);
        }

        return $courseClass->getExamResults();
    }

    public function update(Request $request, $classId = null)
    {
        $input = $request->all();
        if (
            !isset($input['data']) ||
            !isset($input['data']['students'])
        ) {
            return response()->json('Data not set', 400);
        }

        $data = $input['data'];
        $errors = [];

        $studentResults = $data['students'];

        if (isset($data['examResults'])) {
            $examResults = $data['examResults'];
        }

        foreach ($studentResults as $studentResult) {
            if (
                !isset($studentResult['finalGrade']) ||
                !is_array($studentResult['finalGrade'])
            ) {
                continue;
            }

            $finalGradeInput = $studentResult['finalGrade'];
            $studentInfo = $studentResult['studentInfo'];
            $student = CourseStudent::find($studentInfo['id']);
            $student->score = $finalGradeInput['score'];
            $student->attendanceCode = $finalGradeInput['attendanceCode'];
            $student->feedback = $finalGradeInput['comment'];

            if (!$student->save()) {
                $errors[] = 'student grade not saved, input used : ' . implode(', ', $finalGradeInput);
            }
        }

        if (isset($examResults)) {
            foreach ($examResults as $examResult) {
                if (!isset($examResult['scores'])) {
                    continue;
                }

                foreach ($examResult['scores'] as $scoreInput) {
                    if (empty($scoreInput) || !is_array($scoreInput)) {
                        continue;
                    }

                    if (isset($scoreInput['id'])) {
                        $score = Score::find($scoreInput['id']);
                    } else {
                        $score = new Score();
                    }

                    $score->loadInput($scoreInput);
                    if (!$score->save()) {
                        $errors[] = 'score input not saved, input used : ' . implode(', ', $scoreInput);
                    }
                }
            }
        }

        if (!empty($errors)) {
            return response()->json($errors, 500);
        }

        return $this->getExamResults($classId);
    }
}
