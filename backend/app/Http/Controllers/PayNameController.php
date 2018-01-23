<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests;
use App\Models\PayName;
use App\Models\PayNameUserTime;
use App\Models\Week;
use App\Models\User;
use App\Models\Role;
use App\Models\CourseClass;
use App\Classes\Helpers\DataFormatter;



class PayNameController extends Controller
{
    public function getPayNameList(Request $request)
    {
        $lists = PayName::select('t_pay_name.id as payNameId','t_branches_associated.id as branchId','t_pay_name.description','t_term.name as termName','t_pay_name.name as payName','default_time_in','default_time_out','branch_name')
                ->where('selected_term',$request->input('selected_term'))
                ->join('t_term','t_term.id','=','t_pay_name.selected_term')
                ->join('t_branches_associated','t_branches_associated.id','=','t_pay_name.branch_id')
                ->orderBy('t_pay_name.id','ASC');
        if ($request->has('branchId') && !empty($request->input('branchId'))){
            $lists->where('branch_id',$request->input('branch_id'));
        }
        $lists = $lists->get();
        if ($request->ajax()) {
            $payList = [];
            foreach ($lists as $list) {
                $payList[] = [
                    'label' => $list->payName,
                    'value' => $list->payNameId,
                    'termName'=>$list->termName,
                    'timeIn'=>$list->default_time_in,
                    'timeOut'=>$list->default_time_out,
                    'branchName'=>$list->branch_name,
                    'branchId'=>$list->branchId,
                    'description' => $list->description
                ];
            }
        }
        return response()->json($payList);
    }

    public function getPayName(Request $request)
    {
        $userId =(int)$request->input('userId');
        $id = PayNameUserTime::select('user_id')
            ->where('user_id',$userId)
            ->where('pay_name_id',$request->input('id'))
            ->first();
        $return = (object)array('rows'=>[]);
        for ($i=1;$i<=4;$i++){
            $weekTotal = 0;
            if (!empty($id)){
                $query = Week::with(['pay_name'=> function ($query) use ($request,$i,$userId)  {
                    $query->leftjoin('t_payname_time',function ($q){
                        $q->on('t_payname_time.week_day_id','=','weekday_payname.week_id');
                        $q->on('t_payname_time.pay_name_id','=','weekday_payname.pay_name_id');
                    });
                    $query->leftjoin('t_payname_user_time','t_payname_user_time.pay_name_id','=','t_pay_name.id');
//                    if ($request->has("branchId") && !empty($request->input('branchId'))){
//                        $query->where('t_pay_name.branch_id',$request->input('branchId'));
//                    }
                    $query->where('t_payname_user_time.user_id',$userId);
                    $query->where('t_pay_name.id',$request->input('id'));
                    $query->where('t_payname_time.week',$i);
                    $query->select('*');
                }]);
            }else{
                $query = Week::with(['pay_name'=> function ($query) use ($request,$i,$userId)  {
                    $query->leftjoin('t_payname_time',function ($q){
                        $q->on('t_payname_time.week_day_id','=','weekday_payname.week_id');
                        $q->on('t_payname_time.pay_name_id','=','weekday_payname.pay_name_id');
                    });
                    $query->leftjoin('t_payname_user_time','t_payname_user_time.pay_name_id','=','t_pay_name.id');
//                    if ($request->has("branchId") && !empty($request->input('branchId'))){
//                        $query->where('t_pay_name.branch_id',$request->input('branchId'));
//                    }
                    $query->where('t_pay_name.id',$request->input('id'));
                    $query->where('t_payname_time.week',$i);
                    $query->select('*');
                }]);
            }
            $rows = DataFormatter::formatQueryResult($query,$request->all())->getData();
            $obj = (object)array('info'=>$rows->info);
            $rows = $rows->rows;

            $obj->rows = [];
            $totalLate =0;
            foreach ($rows as $row){
                $weekLate = 0;
                $x = [];
                $x['day']=$row->day;
                $x['weekId']=$row->id;
                if (count($row->payName)>0) {
                    if (isset($row->payName[0]->userId) && $row->payName[0]->userId === $userId){
                        $default_in = strtotime($row->payName[0]->userDefaultTimeIn);
                        $default_out = strtotime($row->payName[0]->userDefaultTimeOut);
                    }else{
                        $default_in = strtotime($row->payName[0]->defaultTimeIn);
                        $default_out = strtotime($row->payName[0]->defaultTimeOut);
                    }
                    if ($row->payName[0]->timeIn != "00:00:00" || $row->payName[0]->timeOut !="00:00:00"){
                        $lateIn = ($default_in - strtotime($row->payName[0]->timeIn)) / 60;
                        $lateOut = ($default_out - strtotime($row->payName[0]->timeOut)) / 60;

                        if ($lateIn <= 0) {
                            $totalLate += abs((int)($lateIn));
                            $weekLate+=abs((int)($lateIn));
                        }
                        if ($lateOut >= 0) {
                            $totalLate += abs((int)($lateOut));
                            $weekLate += abs((int)($lateOut));
                        }
                    }else{
                        $totalLate+=0;
                    }
                    if ($weekLate >= 60) {
                        $hours = (int)($weekLate / 60);
                        $mins = $weekLate % 60;
                        if ($mins > 0){
                            $weekLate = (string)$hours.'h'.(string)$mins."m" ;
                        }else{
                            $weekLate = (string)$hours.'h';
                        }
                    }
                    $payname = $row->payName[0]->name;
                    $x['id'] = $row->payName[0]->id;
                    $x['description']=$row->payName[0]->description;
                    $x['payname'] =$row->payName[0]->name;
                    $x['lateCount']=(string)$row->payName[0]->lateCount;
                    $x['totalHours']=$row->payName[0]->totalHours;
                    $x['lateTime']=$row->payName[0]->lateTime;
                    $x['timeIn']=date('G:i', strtotime($row->payName[0]->timeIn));
                    $x['timeOut']=date('G:i', strtotime($row->payName[0]->timeOut));
                    $x['week']= $row->payName[0]->week;
                    $x['weekLate'] = $weekLate;
                    if ($x['timeIn'] == "0:00" && $x['timeOut'] == "0:00"){
                        $x['timeIn'] = "";
                        $x['timeOut'] = "";
                    }
                    $weekTotal += (strtotime($row->payName[0]->timeOut) - strtotime($row->payName[0]->timeIn))/60;
                }else{
                    $x['id'] = '';
                    $x['description']='';
                    $x['payname'] ='';
                    $x['lateCount']='';
                    $x['totalHours']='';
                    $x['lateTime']='';
                    $x['timeIn']='';
                    $x['timeOut']='';
                    $x['week']= '';
                    $x['weekLate'] = '';
                }
                array_push($obj->rows,(object)$x);
            }

            if ($weekTotal >= 60){
                $hour = (int)($weekTotal/60);
                $min = $weekTotal%60;
                if ($min > 0){
                    $obj->weekTotal = "Week $i Total : ".(string)$hour.'h'.(string)$min."m" ;
                }else{
                    $obj->weekTotal = "Week $i Total : ".(string)$hour.'h';
                }
            }
                $username =User::select('user_fullname')
                                ->where('id',$request->input('userId'))->first()->user_fullname;

            $obj->userFullName = $username;
//            dd($payname);
//            if (empty($payname)){
//                $return->error = true;
//                return response()->json($return);
//            }
//            $obj->payName = $payname;
            $obj->defaultTimeIn =date('G:i', strtotime($rows[0]->payName[0]->defaultTimeIn));
            $obj->defaultTimeOut =date('G:i', strtotime($rows[0]->payName[0]->defaultTimeOut));
            if (isset($rows[0]->payName[0]->userId) && $rows[0]->payName[0]->userId === $userId){
                $obj->defaultTimeIn =date('G:i', strtotime($rows[0]->payName[0]->userDefaultTimeIn));
                $obj->defaultTimeOut =date('G:i', strtotime($rows[0]->payName[0]->userDefaultTimeOut));
            }
//            $obj->totalWeekLate = $totalLate;
            $obj->totalWeek = $weekTotal;
            if ($totalLate >= 60) {
                $hours = (int)($totalLate / 60);
                $mins = $totalLate % 60;
                if ($mins > 0){
                    $totalLate = "Week $i Total : ".(string)$hours.'h'.(string)$mins."m" ;
                }else{
                    $totalLate = "Week $i Total : ".(string)$hours.'h';
                }
                $obj->totalWeekLate = $totalLate;
            }
            array_push($return->rows,$obj);
        }
        $return->error = false;
        return response()->json($return);
    }
    public function updatePayName(Request $request)
    {
        if (!empty($request->input('user_id'))){
            $userTime = PayNameUserTime::where('user_id',$request->input('user_id'))->first();
            $id = PayName::select('id')
                ->where('name',$request->input('weekdays')['w1'][0]['payname'])
                ->where('description',$request->input('weekdays')['w1'][0]['description'])
                ->first();
            if (!isset($userTime) && empty($userTime)){
                $new = [
                    'pay_name_id'=>$id->id,
                    'user_id'=>(int)$request->input('user_id'),
                    'user_default_time_in'=>$request->input('defaultTimeIn'),
                    'user_default_time_out'=>$request->input('defaultTimeOut')
                ];
                PayNameUserTime::insert($new);
            }else{
                PayNameUserTime::where('pay_name_id',$id->id)
                        ->where('user_id',(int)$request->input('user_id'))
                        ->update([
                            'user_default_time_in'=>$request->input('defaultTimeIn'),
                            'user_default_time_out'=>$request->input('defaultTimeOut')
                        ]);
            }
        }
        $defaultTimeIn = strtotime($request->input('defaultTimeIn'));
        $defaultTimeOut = strtotime($request->input('defaultTimeOut'));
        $data = $request->input('weekdays');
        foreach ($data as $data) {
            foreach ($data as $data) {
                $inTime = strtotime((string)$data['timeIn']);
                $outTime = strtotime((string)$data['timeOut']);

                $totalHour = ($outTime - $inTime) / 60;

                $weekTotal = 0;
                $weekTotal += $totalHour;
                if($totalHour==0 && !$inTime && !$outTime){
                    $totalHour="----";
                }elseif($totalHour >= 60) {
                    $hour = (int)($totalHour / 60);
                    $min = $totalHour % 60;
                    $totalHour = (string)$hour . 'h' . (string)$min . 'm';
                } else {
                    $min = $totalHour % 60;
                    $totalHour = (string)$min . 'm';
                }
                $lateIn = $defaultTimeIn - $inTime;
                $lateOut = $defaultTimeOut - $outTime;
                if ($lateIn >= 0) {
                    if (!$inTime) {
                        $lateIn = "----";
                    }else{
                        $lateIn = abs((int)$lateIn / 60);
                        $lateIn = "0 min";
                    }
                } else {
                    if (!$inTime){
                        $lateIn="----";
                    }else{
                        $lateIn = abs((int)$lateIn / 60);
                        $lateIn = (string)$lateIn . 'm';
                        if ($lateIn > 60) {
                            $hour = (int)($lateIn / 60);
                            $minute = $lateIn % 60;
                            $lateIn = $hour . 'h' . (string)$minute . 'm';
                        }
                    }
                }
                if ($lateOut <= 0) {
                    $lateOut = abs((int)$lateOut / 60);
                    $lateOut = "0 min";
                } else {
                    if ($outTime==""){
                        $lateOut="------";
                    }else{
                        $lateOut = abs((int)$lateOut / 60);
                        $lateOut = (string)$lateOut . 'm';
                        if ($lateOut > 60) {
                            $hour = (int)($lateOut / 60);
                            $minute = $lateOut % 60;
                            $lateOut = $hour . 'h' . (string)$minute . 'm';
                        }
                    }
                }
                if (empty($data['id'])) {
                    $id = PayName::select('id')
                        ->where('name', $data['payname'])
                        ->where('description', $data['description'])
                        ->first();
                    for ($i = 1; $i <= 4; $i++) {
                        DB::table('t_payname_time')
                            ->insert(array(
                                'week_day_id' => $data['weekId'],
                                'time_in' => $data['timeIn'],
                                'late_count' => $lateIn,
                                'time_out' => $data['timeOut'],
                                'total_hours' => $totalHour,
                                'late_time' => $lateOut,
                                'week' => $i,
                                'pay_name_id' => $id->id
                            ));
                    }
                } else {
                    $id = PayName::select('id')
                        ->where('name', $data['payname'])
                        ->where('description', $data['description'])
                        ->first();
                    for ($i = 1; $i <= 4; $i++) {
                        DB::table('t_payname_time')
                            ->where('id', $data['id'])
                            ->where('week', $i)
                            ->update([
                                'week_day_id' => $data['weekId'],
                                'time_in' => $data['timeIn'],
                                'late_count' => $lateIn,
                                'time_out' => $data['timeOut'],
                                'total_hours' => $totalHour,
                                'late_time' => $lateOut,
                                'pay_name_id' => $id->id
                            ]);
                    }
                }
            }
        }
    }
    public function addNew(Request $request)
    {
        if (empty($request->input('time_out')) && empty($request->input('time_in'))){

            $insert = array(
                'name'=>$request->input('name'),
                'description'=>$request->input('description'),
                'branch_id'=>$request->input('branch_id'),
                'selected_term'=>$request->input('selected_term'),
                'default_time_in'=>'',
                'default_time_out'=>''
            );
        }elseif (empty($request->input('time_out'))){
            $insert = array(
                'name'=>$request->input('name'),
                'description'=>$request->input('description'),
                'branch_id'=>$request->input('branch_id'),
                'selected_term'=>$request->input('selected_term'),
                'default_time_in'=>$request->input('time_in')
            );
        }elseif (empty($request->input('time_in'))){
            $insert = array(
                'name'=>$request->input('name'),
                'description'=>$request->input('description'),
                'branch_id'=>$request->input('branch_id'),
                'selected_term'=>$request->input('selected_term'),
                'default_time_out'=>$request->input('time_out')

            );
        }
        else{
            $insert = array(
                'name'=>$request->input('name'),
                'description'=>$request->input('description'),
                'branch_id'=>$request->input('branch_id'),
                'selected_term'=>$request->input('selected_term'),
                'default_time_in'=>$request->input('time_in'),
                'default_time_out'=>$request->input('time_out')
            );
        }
        $id =  PayName::insertGetId($insert);
        for($i=1; $i<=4; $i++ ){
            for ($j=1;$j<=7;$j++){
                DB::table('t_payname_time')->insert([
                    'week_day_id' => $j,
                    'pay_name_id'=>$id,
                    'week'=>$i
                ]);
            }
        }
        for ($i=1; $i<=7; $i++ ){
            DB::table('weekday_payname')->insert(
                ['week_id' => $i,'pay_name_id'=>$id]
            );
        }

        return $this->getPayNameList($request);

    }

    public function printPayname(Request $request,$id,$branchId)
    {
        $payName = PayName::where('id',$id)
                    ->first();
        $branch_id = $branchId;

        if ($branch_id == 0){
            $branch_id = $payName->branch_id;
        }
        $term_id = $payName->selected_term;
        $query = CourseClass::query()->with(['course', 'course.dept'])
            ->select('teacher_id')
            ->distinct();
        $filters = $term_id;

        if (!empty($filters)) {
            $termId = $filters == 'active' ? Website::active()->activeTermId : $filters;
            $query->where('course_class_term_id', $termId);
        }
        $rows = $query->get();
        $x = [];
        foreach ($rows as $row){
            if ($row->teacher_id != 0){
                array_push($x,$row->teacher_id);
            }
        }
        $list = $this->getTotalList($request,null,null,$term_id,$branch_id)->getData();
        $query = User::whereIn("t_user.id",$x)
            ->select('t_user.id','t_user.user_status','t_user.user_fullname','t_branches_associated.branch_name','t_profile.teacher_hourly_rate')
            ->distinct()
            ->leftjoin('t_profile','t_profile.user_id','=','t_user.id')
            ->leftjoin('t_course_class','t_course_class.teacher_id','=','t_user.id')
            ->leftjoin('t_course','t_course.id','=','t_course_class.course_id')
            ->leftjoin('t_dept','t_dept.id','=','t_course.dept_id')
            ->leftjoin('t_branches_associated','t_branches_associated.id','=','t_dept.dept_branch_id')
            ->where("user_main_role",4)
            ->orderBy('t_profile.profile_gender','asc');
        if (!empty($branch_id)){
            $query->where('t_branches_associated.id',$branch_id);
        }
        $rows =  DataFormatter::formatQueryResult($query,$request->all())->getData();
        $rows->info = array('totalCount'=>count($rows->rows));
        $print = array();
        foreach ($rows->rows as $row){
            $classes = $row->teacherCourseClasses;
            $class = [];
            for($i=0;$i<count($classes);$i++){
                if($classes[$i]->termId === $term_id){
                    array_push($class,$classes[$i]);
                }
            }
            $x =[];
            $x['teacherHourlyRate'] = $row->teacherHourlyRate;
            $x['totalPayName'] = $row->totalPayName=(array)$list;
            $x['userName'] =  $row->userFullname;
            $x['branchName'] = $row->branchName;
            $x['classes'] = 'Classes('.(string)count($class).')';
            array_push($print,$x);
        }
            $description =[];
            $description['name'] = $payName->name;
            $description['description'] = $payName->description;
            $description['timeIn'] = $payName->default_time_in;
            $description['timeOut'] = $payName->default_time_out;
            $description['termName'] = DB::table('t_term')->select('name')->where('id',$term_id)->first()->name;
            $description['branchName'] = $print[0]['branchName'];
            $output = view(
            'admin.user.print-teacher-payname',
            [
                'payname' => $print,
                'description' =>$description
            ]
        )->render();

        return response()->json($output);
    }
    public static function getTotalList(Request $request,$timeIn = null,$timeOut = null,$termId = null,$brnachId = null)
    {
        $payname = PayName::with('userTime');
        $payname->select('t_pay_name.*');
        if (!empty($termId) && isset($termId)) {
            $payname->where('selected_term', $termId);

            if (!empty($brnachId) && isset($brnachId)) {
                $payname->where('branch_id', $brnachId);
            }
        } else {
            $payname->where('selected_term', $request->input('termId'));

            if ($request->has('branchId') && !empty($request->input('branchId'))) {
                $payname->where('branch_id', $request->input('branchId'));
            }
        }
        $payname = $payname->first();
        if (empty($payname->id)) {
            return response()->json(array('404' => 'nothing found'));
        }
        $allTotal = 0;
        $lateTimeAll = 0;
        $weekArr = array();
        if (isset($timeIn) && !empty($timeIn) && isset($timeOut) && !empty($timeOut)){
            $defaultTimeIn = strtotime($timeIn);
            $defaultTimeOut = strtotime($timeOut);
        }else{
            $defaultTimeIn = strtotime($payname->default_time_in);
            $defaultTimeOut = strtotime($payname->default_time_out);
        }
        for ($i = 1; $i <= 4; $i++) {
            $weekTotal = 0;
            $weekLate = 0;
            $times = DB::table('t_payname_time')
                ->select('time_in', 'time_out')
                ->where('pay_name_id', $payname->id)
                ->where('week', $i)
                ->get();
            foreach ($times as $time) {
                $weekTotal += ((strtotime($time->time_out) - strtotime($time->time_in)) / 60);

                $lateIn = (($defaultTimeIn - strtotime($time->time_in)) / 60);
                $lateOut = (($defaultTimeOut - strtotime($time->time_out)) / 60);
                if ($lateIn <= 0 ) {
                    $weekLate += abs((int)($lateIn));
                }
                if ($lateOut <= 0) {
                    $weekLate += abs((int)($lateOut));
                }
            }
            $lateTimeAll += $weekLate;
            $allTotal += $weekTotal;
            if ($weekLate > 60) {
                $hour = (int)($weekLate / 60);
                $min = $weekLate % 60;
                if ($min > 0) {
                    $weekLate = (string)$hour . 'h' . (string)$min . "m";
                } else {
                    $weekLate = (string)$hour . 'h';
                }
            } else {
                $weekLate = (string)$weekLate % 60 . "m";
            }
            if ($weekTotal > 60) {
                $hour = (int)($weekTotal / 60);
                $min = $weekTotal % 60;
                if ($min > 0) {
                    $weekTotal = (string)$hour . 'h' . (string)$min . "m";
                } else {
                    $weekTotal = (string)$hour . 'h';
                }
            } else {
                $weekTotal = (string)$weekTotal % 60 . "m";
            }
            $weekArr['week' . $i] = $weekTotal;
            $weekArr['weekLate' . $i] = $weekLate;
        }
        if ($lateTimeAll > 60) {
            $hour = (int)($lateTimeAll / 60);
            $min = $lateTimeAll % 60;
            if ($min > 0) {
                $lateTimeAll = (string)$hour . 'h' . (string)$min . "m";
            } else {
                $lateTimeAll = (string)$hour . 'h';
            }
        } else {
            $lateTimeAll = (string)$lateTimeAll % 60 . "m";
        }
        $rateHours = $allTotal;
        if ($allTotal > 60) {
            $hour = (int)($allTotal / 60);
            $min = $allTotal % 60;
            if ($min > 0) {
                $allTotal = (string)$hour . 'h' . (string)$min . "m";
            } else {
                $allTotal = (string)$hour . 'h';
            }
        } else {
            $allTotal = (string)$weekTotal % 60 . "m";
        }
        $weekArr['Total'] = $allTotal;
        $weekArr['totalLate'] = $lateTimeAll;
        $weekArr['rateHours'] = $rateHours;
        return response()->json($weekArr);
    }

    public function get($id)
    {
        $payname = PayName::where('id',$id)->first();
        $obj = array(
            'id' => $payname->id,
            'name'=>$payname->name,
            'description'=>$payname->description,
            'branch_id'=>$payname->branch_id,
            'selected_term'=>$payname->selected_term
        );
        $timeIn = explode(':',$payname->default_time_in);
        $timeIn = $timeIn[0].":".$timeIn[1];
        $timeOut = explode(':',$payname->default_time_out);
        $timeOut = $timeOut[0].":".$timeOut[1];
        $obj['time_in'] = $timeIn;
        $obj['time_out'] = $timeOut;

        return response()->json($obj);
    }
    public function update(Request $request,$id)
    {
        PayName::where('id',$id)
                    ->update(array(
                        'name'=>$request->input('name'),
                        'description'=>$request->input('description'),
                        'branch_id'=>$request->input('branch_id'),
                        'selected_term'=>$request->input('selected_term'),
                        'default_time_in'=>$request->input('time_in'),
                        'default_time_out'=>$request->input('time_out')
                    ));
    }
}
