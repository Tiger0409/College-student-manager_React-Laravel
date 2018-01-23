<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\BranchAssociated;
use App\Models\Course;
use App\Models\CourseClass;
use App\Models\CourseGroup;
use App\Models\CourseStudent;
use App\Models\Dept;
use App\Models\Log;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function getList(Request $request)
    {
        $input = $request->all();

        $query = DB::table(Course::tableName() . ' AS c');
        $query->leftJoin(Dept::tableName() . ' AS d', 'd.id', '=', 'c.dept_id');
        $query->leftJoin(BranchAssociated::tableName() . ' AS br', 'br.id', '=', 'd.dept_branch_id');
        $query->select(['c.id AS id', 'c.course_title AS courseTitle', 'br.branch_name AS branchName']);

        if (!empty($input['branchId'])) {
            $query->where('d.dept_branch_id', $input['branchId']);
        }

        if (!empty($input['withClassesInTerm'])) {
            $termId = $input['withClassesInTerm'];
            $query->leftJoin(CourseClass::tableName() . ' as cc', 'cc.course_id', '=', 'c.id');
            $query->where('cc.course_class_term_id', $termId);
            $query->addSelect(DB::raw('COUNT(cc.id) as classesCount'));
            $query->groupBy('c.id');
            $query->havingRaw('classesCount > 0');
        }

        /** @var User $user */
        $user = Auth::user();
        if ($user && $user->userMainRole == Role::REGISTRAR) {
            $allowedBranches = $user->allowedBranches;

            $query->whereIn('d.dept_branch_id', explode('_', $allowedBranches));
        }

        $courses = $query->get();

        $output = [];
        foreach ($courses as $course) {
            $title = $course->courseTitle;
            if ($course->branchName)
                $title .= ' (' . $course->branchName . ')';

            $item = [
                'value' => $course->id,
                'label' => $title
            ];

            if (!empty($input['countStudents'])) {
                $studentsQuery = DB::table(CourseStudent::tableName() . ' as cs');
                $studentsQuery->where('cs.course_id', $course->id);

                if (!empty($input['termId'])) {
                    $studentsQuery->leftJoin(CourseClass::tableName() . ' as cc', 'cc.id', '=', 'cs.class_id');
                    $studentsQuery->where('cc.course_class_term_id', '=', $input['termId']);
                }

                $item['studentsCount'] = $studentsQuery->count();
                if ($item['studentsCount'] === 0) {
                    continue;
                }
            }

            $output[] = $item;
        }
        return response()->json($output);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function getGroupedList(Request $request)
    {
        return response()->json(Course::getGrouped($request->all()));
    }

    /**
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function get(Request $request, $id)
    {
        return DataFormatter::formatSingleModel(Course::find($id), $request->all());
    }

    /**
     * @param Request $request
     * @param string $id
     * @return array
     */
    public function edit(Request $request, $id)
    {
        $afterEdit = function ($model) {
            Log::write(Log::ACTION_UPDATE, Log::MODULE_COURSE, $model->id);
        };

        return $this->editModel(Course::className(), $request->all(), $id, ['saveRelations' => false], $afterEdit);
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function create(Request $request)
    {
        $model = new Course();
        $model->loadInput($request->all());
        $model->save();
        Log::write(Log::ACTION_CREATE, Log::MODULE_COURSE, $model->id);
        return response()->json($model->asArray());
    }

    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function delete(Request $request)
    {
        $params = $request->all();
        if (isset($params['ids'])) {

            $courses = Course::whereIn('id', $params['ids'])->get();
            foreach ($courses as $course) {
                if (count($course->courseClasses) > 0) {
                    return response()->json('Error. Some of the courses has classes', 400);
                }
            }


            Course::whereIn('id', $params['ids'])->delete();

            $reason = !empty($params['reason']) ? $params['reason'] : '';

            foreach ($params['ids'] as $id) {
                Log::write(Log::ACTION_DELETE, Log::MODULE_COURSE, $id, $reason);
            }
            return response()->json('', 204);
        }
    }

    public function swapCourses(Request $request)
    {
        list($courseDataA, $courseDataB) = array_values($request->all());
        $courseA = Course::find($courseDataA['id']);
        $courseB = Course::find($courseDataB['id']);

        if (Course::swap($courseA, $courseB))
            return response()->json();
        else
            return response()->json('Invalid id/id\'s', 400);
    }
}
