<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Classes\Helpers\DateHelper;
use App\Classes\Helpers\StringHelper;
use App\Models\Absent;
use App\Models\CourseClass;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class AttendanceController extends Controller
{
    /**
     * @param int $userId
     * @return JsonResponse|null
     */
    public function getUserAttendance($userId)
    {
        /**
         * @var User $user
         */
        $user = User::find($userId);
        if (!$user) {
            return response()->json('User not found', 404);
        }

        $courseStudentIds = $user->courseStudents()->lists('id')->toArray();
        // TODO: count attended
        $result = [
            'attended' => 0,
            'absentDays' => Absent::countAbsentDays($courseStudentIds),
            'absentDaysInTwoWeeks' => Absent::countAbsentDaysInPeriod(
                $courseStudentIds,
                date('Y-m-d', strtotime('2 weeks ago')),
                date('Y-m-d'))
        ];

        return response()->json($result);
    }

    /**
     * @param int $classId
     * @return JsonResponse
     */
    public function getClassAttendance($classId)
    {
        /**
         * @var CourseClass $courseClass
         */
        $courseClass = CourseClass::find($classId);
        if (!$courseClass) {
            return response()->json('Class was not found', 404);
        }
        $output = [];
//        dd($courseClass->courseStudents);
        foreach ($courseClass->courseStudents as $student) {
            $output[$student->user->userFullname] = DataFormatter::modelsToArrays($student->attendance);
        }
        return response()->json($output);

        /*$output = ['attendance' => [], 'classDays' => []];
        foreach ($courseClass->courseStudents as $student) {
            $studentInfo = $student->fieldsToArray(['user.userFullname', 'id']);
            $attendance = Absent::where('student_id', $student->id)->get();
            $present = [];
            $absent = [];
            foreach ($attendance as $record) {
                $attendanceInfo = $record->fieldsToArray(['date', 'comment', 'late']);
                if (isset($attendanceInfo['date'])) {
                    $attendanceInfo['date'] = date('d/m/Y', strtotime($attendanceInfo['date']));
                }
                switch ($record->attendance) {
                    case 'present':
                        $present[] = $attendanceInfo;
                        break;

                    case 'absent':
                        $absent[] = $attendanceInfo;
                        break;
                }
            }

            $output['attendance'][] = [
                'student' => $studentInfo,
                'present' => $present,
                'absent' => $absent
            ];
        }

        $months = DateHelper::extractMonths($courseClass->term->name);
        $days = DateHelper::extractDays($courseClass->classTime);
        $years = DateHelper::extractYears($courseClass->term->name);
        if (count($months) > 0 && count($days) > 0) {
            $month = $months[0];
            $day = $days[0];
            $year = count($years) > 1 ? $years[0] : $courseClass->term->year;

            $date = new \DateTime('@' . strtotime("$month/$day/$year"));

            $monthsPassed = 0;
            $maxMonths = 3;

            while($monthsPassed < $maxMonths) {
                $output['classDays'][] = $date->format('d/m/Y');
                $oldMonth = $date->format('m');
                $date->add(new \DateInterval('P1W'));
                $newMonth = $date->format('m');
                if ($oldMonth !== $newMonth) {
                    $monthsPassed++;
                }
            }
        }

        return response()->json($output);*/
    }
}
