<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\ArrayHelper;
use App\Classes\Helpers\DataFormatter;
use App\Models\Cart;
use App\Models\CourseStudent;
use App\Models\StripeTransaction;
use App\Models\StudentPayment;
use App\Models\User;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function getPaypalTransactions(Request $request)
    {
        return Cart::getPaypalCarts($request->all());
    }

    public function getStripeTransactions(Request $request)
    {
        $params = $request->all();
        $query = StripeTransaction::query();
        if (isset($params['filters'])) {
            $filters = $params['filters'];
            if (isset($filters['txnId'])) {
                $query->where('balance_transaction', 'LIKE', '%' . $filters['txnId'] . '%');
            }
        }

        $query->orderBy('created', 'desc');

        return DataFormatter::formatQueryResult($query, $params);
    }

    public function getPaypalTransaction(Request $request, $id)
    {
        $cart = Cart::find($id);
        if (!$cart) {
            return response('Transaction was not found', 404);
        }

        $result =  $cart->asArray();
        $students = CourseStudent::where([
            'invoice_id' => $cart->invoiceNo,
            'student_id' => $cart->studentId
        ])->with('course')->get();
        $result['students'] = $students;

        return ArrayHelper::underscoreKeysToCamelCase($result, true);
    }

    public function getStripeTransaction(Request $request, $id)
    {
        return DataFormatter::formatSingleModel(StripeTransaction::findOrFail($id), $request->all());
    }

    public function getPaypalCoursesRegistered($id)
    {
        /**
         * @var Cart $cart
         */
        $cart = Cart::find($id);
        $classIds = [];
        foreach ($cart->cartItems as $cartItem) {
            $classIds = $cartItem->classId;
        }

        CourseStudent::whereIn('class_id', $classIds);
    }

    public function getAll(Request $request)
    {
        $params = $request->all();
        $query = CourseStudent::query();
        if (isset($params['filters'])) {
            CourseStudent::applyFilters($query, $params['filters']);
        }

        $query->orderBy('register_date', 'desc');

        return DataFormatter::formatQueryResult($query, $params);
    }
    
    public function printData($type, $filters = '')
    {
        $output = '';
        $filters = json_decode($filters, true);

        $query = CourseStudent::query();
        if (!empty($filters)) {
            CourseStudent::applyFilters($query, $filters);
        }

        switch ($type) {
            case 'students':
                $query->with(['course', 'payments', 'courseClass', 'courseClass.term', 'user']);
                $students = ArrayHelper::underscoreKeysToCamelCase($query->get()->toArray(), true);

                $output = view(
                    'admin.transactions.students-transactions',
                    ['students' => $students]
                )->render();
                break;
            case 'cart-items':
                $query->groupBy('student_id');
                $students = $query->get();

                // grabbing all filtered user ids
                $userIds = [];
                foreach ($students as $student) {
                    $userIds[] = $student->studentId;
                }

                // getting their open carts
                $carts = Cart::where('cart_status', 'open')
                    ->whereIn('student_id', $userIds)
                    ->with('user')
                    ->has('cartItems', '>', '0')
                    ->get();

                // and preparing data to print
                $data = [];
                foreach ($carts as $cart) {
                    $user = $cart->user;
                    $profile = $user->profile;
                    $cartItemsCount = count($cart->cartItems);

                    $data[] = [
                        'userFullname'     => $user->userFullname,
                        'telephone'        => $profile ? $profile->profileTelephone : '',
                        'userEmailAddress' => $user->userEmailAddress,
                        'cartItemsCount'   => $cartItemsCount
                    ];
                }



                $output = view(
                    'admin.transactions.cart-items',
                    ['students' => $data]
                )->render();
                break;

            case 'stripe':
                $stripeQuery = StripeTransaction::query();
                $stripeQuery->leftJoin(User::tableName() . ' as u', 'u.id', '=', 'user_id');

                $stripeQuery->select([
                    'created as createdAt',
                    'u.user_fullname as studentName',
                    'amount',
                    'status',
                    'card_owner_name as cardOwnerName',
                    'balance_transaction as txnId'
                ]);

                $stripeQuery->orderBy('created', 'desc');

                $output = view(
                    'admin.transactions.stripe-transactions',
                    ['transactions' => $stripeQuery->get()]
                )->render();

                break;

            case 'paypal':
                $output = view(
                    'admin.transactions.paypal-transactions',
                    ['transactions' => Cart::getPaypalCarts()['rows']]
                )->render();

                break;
        }

        return response()->json($output);
    }
}
