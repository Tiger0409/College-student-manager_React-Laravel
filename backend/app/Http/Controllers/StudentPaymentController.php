<?php

namespace App\Http\Controllers;


use App\Classes\Helpers\DataFormatter;
use App\Classes\Helpers\PaymentHelper;
use App\Models\CourseClass;
use App\Models\CourseStudent;
use App\Models\StudentPayment;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StudentPaymentController extends Controller
{
    public function getEnumValues($enumType)
    {
        return DataFormatter::formatEnumValues(StudentPayment::getEnumValues($enumType));
    }
    
    public function index(Request $request)
    {
        $params = $request->all();

        $query = StudentPayment::query();

        if (isset($params['filters'])) {
            $filters = $params['filters'];

            if (isset($filters['paymentMethod'])) {
                $query->where('payment_method', $filters['paymentMethod']);
            }
        }

        return DataFormatter::formatQueryResult($query, $params);
    }
    public function getById($id)
    {
        $model = StudentPayment::find($id);
        if (empty($model)){
            return response()->json('Payment not found',404);
        }
        return response()->json($model);
    }

    public function checkout(Request $request,$amount,$id)
    {
        $user = Auth::user();
        if (!$user){
            return response()->json('Not Authorized',400);
        }
        return PaymentHelper::studentPaymentCheckout($amount,$id);
    }

    public function total(Request $request) {
        $params = $request->all();

        $query = DB::table(StudentPayment::tableName() . ' as sp');
        $query->select([
            DB::raw('SUM(sp.amount) as amount'),
            'sp.payment_method as paymentMethod'
        ]);

        if (isset($params['filters'])) {
            $filters = $params['filters'];

            if (isset($filters['term'])) {
                $query->leftJoin(CourseStudent::tableName() . ' as s', 's.id', '=', 'sp.course_student_id');
                $query->leftJoin(CourseClass::tableName() . ' as cc', 'cc.id', '=', 's.class_id');
                $query->where('course_class_term_id', $filters['term']);
            }
        }

        $query->groupBy('sp.payment_method');

        return response()->json($query->get());
    }

    public function create(Request $request)
    {
        foreach (['token', 'amount', 'studentId'] as $field) {
            if (!$request->has($field)) {
                return response()->json("$field was not set!", 400);
            }
        }

        $studentId = $request->get('studentId');
        $amount = $request->get('amount');
        $cardHolderName = $request->has('cardHolderName') ? $request->get('cardHolderName') : '';

        /** @var CourseStudent $student */
        $student = CourseStudent::findOrFail($studentId);
        $user = Auth::user();
        $description =
            $user->userFullname . '; ' .
            $student->user->userFullname . '; ' .
            $student->user->profile->profilePostcode . '; ' .
            $student->course->courseTitle . ' (' . $student->courseClass->classTime . ')';

        $paymentOptions = [
            'token'          => $request->get('token'),
            'amount'         => $amount,
            'cardHolderName' => $cardHolderName,
            'userId'         => $student->studentId,
            'description'    => $description
        ];
        return PaymentHelper::processStripePayment($paymentOptions,
            function () use ($studentId, $amount, $user, &$request) {
                $payment = new StudentPayment([
                    'received_by'       => $request->has('cardHolderName') ? $request->get("cardHolderName") : $user->userFullname,
                    'course_student_id' => $studentId,
                    'amount'            => $amount,
                    'payment_method'    => 'stripe',
                    'date'              => date("Y-m-d H:i:s")
                ]);

                $payment->save();
                return response()->json();
            },
            function ($msg) {
                return response()->json($msg, 500);
            }
        );
    }

    public function updateStudent(Request $request)
    {
        $model = StudentPayment::find($request->id);
        if (!$model){
            return response()->json('Payment not found',404);
        }
        $model->update(['amount'=>$request->amount]);

        return response()->json();

    }
}