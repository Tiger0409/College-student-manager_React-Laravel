<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Classes\Helpers\DateHelper;
use App\Classes\Helpers\EmailHelper;
use App\Classes\Helpers\PaymentHelper;
use App\Classes\Libraries\Paypal;
use App\Classes\Helpers\QueryHelper;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CourseClass;
use App\Models\CourseStudent;
use App\Models\GeneralSetting;
use App\Models\Log;
use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\EventDispatcher\Tests\GenericEventTest;

class CartItemController extends Controller
{
    public function getBasket(Request $request, $userId)
    {
        /** @var User $user */
        $user = Auth::user();
        if ($user->id != $userId && in_array($user->role->roleName, [Role::ADMIN, Role::SUPER_ADMIN])) {
            return response()->json('', 403);
        }

        /**
         * @var User $user
         * @var Cart $cart
         */
        $user = User::find($userId);
        if (!$user) {
            return null;
        }

        $cart = $user
            ->carts()
            ->where('cart_status', 'open')
            ->first();

        if (!$cart) {
            return null;
        }

        $params = $request->all();
        $cartItems = $cart->cartItems();

        $result = DataFormatter::formatQueryResult($cartItems, $params, false);

        $result['info']['paypalSurcharge'] =
            floatval(GeneralSetting::getValue('paypal_surcharge_amount', 0));

        return response()->json($result);
    }

    public function create(Request $request)
    {
        $input = $request->all();

        $studentId = !empty($input['studentId']) ?
            $input['studentId'] : Auth::user()->id;

        /** @var User $user */
        $user = User::find($studentId);

        if ((empty($input['classId']) || empty($input['studentStatus'])) &&
            empty($input['classes'])
        ) {
            return response()->json('Invalid data', 400);
        }

        $cart = Cart::where([
            'cart_status' => 'open',
            'student_id' => $studentId
        ])->first();

        if (!$cart) {
            $cart = new Cart(['studentId' => $studentId]);
            if (!$cart->save()) {
                return response()->json('Cart creation error', 500);
            }
        }

        $classes = !empty($input['classes']) ?
            $input['classes'] : [['classId' => $input['classId'], 'studentStatus' => $input['studentStatus']]];

        foreach ($classes as $class) {
            /** @var CourseClass $courseClass */
            $courseClass = CourseClass::find($class['classId']);

            if ($courseClass->classGender != 'both' && $courseClass->classGender != $user->profile->profileGender) {
                continue;
            }

            if (!$courseClass) {
                return response()->json('Course class was not found', 404);
            }

            if ($class['studentStatus'] == 'employed') {
                $calculatedPrice = $courseClass->feeForEmployed >= 0 ?
                    $courseClass->feeForEmployed : $courseClass->course->feeForEmployed;
            } else {
                $calculatedPrice = $courseClass->feeForUnemployed >= 0 ?
                    $courseClass->feeForUnemployed : $courseClass->course->feeForUnemployed;
            }

            $className = "{$courseClass->course->courseTitle} {$courseClass->classTime}";

            $cartItem = new CartItem([
                'cartId'                => $cart->id,
                'classId'               => $class['classId'],
                'studentStatus'         => $class['studentStatus'],
                'originalStudentStatus' => $class['studentStatus'],
                'calculatedPrice'       => $calculatedPrice,
                'coursePrice'           => 0,
                'priceWithSurcharge'    => 0,
                'className'             => $className
            ]);

            if (CartItem::where(['class_id' => $class['classId'], 'cart_id' => $cart->id])->first()) {
                continue;
            }

            if (!$cartItem->save() || !$cart->recalculatePrice()) {
                $cartItem->delete();
                return response()->json('Error adding cart', 500);
            }
        }

        return response()->json();
    }

    public function delete(Request $request)
    {
        $input = $request->all();

        if (empty($input['items']) && empty($input['ids'])) {
            return response('No items selected', 400);
        }

        $carts = [];

        $items = !empty($input['items']) ? $input['items'] : $input['ids'];
        foreach ($items as $item) {
            if (is_string($item)) {
                $item = explode('|', $item);
                $cartId = $item[0];
                $classId = $item[1];
            } else {
                $cartId = $item['cartId'];
                $classId = $item['classId'];
            }

            $cartItem = CartItem::where([
                'cart_id' => $cartId,
                'class_id' => $classId
            ])->first();

            if ($cartItem) {
                $cartItem->delete();
                if (!isset($carts[$cartId])) {
                    $carts[$cartId] = Cart::findOrFail($cartId);
                }

                $carts[$cartId]->recalculatePrice();
            }
        }

        return response()->json();
    }

    public function checkout(Request $request)
    {
        return PaymentHelper::processCartPayment($request->all());
    }

    public function addRelative(Request $request)
    {
        if (!$request->has('relative') || !$request->has('cartItemId')) {
            return response()->json('Relative or cart item was not set', 400);
        }

        $cartItemId = explode('|', $request->get('cartItemId'));
        $cartId = $cartItemId[0];
        $classId = $cartItemId[1];

        $user = Auth::user();
        $relative = $request->get('relative');

        if (
            isset($relative['email']) &&
            ($relative['email'] == $user->userEmailAddress ||
                User::where('user_email_address', $relative['email'])->first())
        ) {
            return response()->json('Relative email should be unique', 400);
        }

        // adding relative to cart item
        /* @var CartItem $cartItem */
        $cartItem = CartItem::where(['cart_id' => $cartId, 'class_id' => $classId])->first();
        if (!$cartItem) {
            return response()->json('Cart item was not found', 404);
        }

        $relatives = $cartItem->relatives;
        $relatives[] = $relative;

        $cartItem->fill([
            'relatives'    => $relatives,
            'ticket_number' => count($relatives) + 1,
            'updated_at'    => time()
        ]);
        $updated = $cartItem->save();

        if (!$updated) {
            return response()->json('Cart item failed to update', 500);
        }

        // recalculating price
        /* @var Cart $cart */
        $cart = Cart::find($cartId);
        if (!$cart) {
            return response()->json('Cart was not found', 404);
        }

        if (!$cart->recalculatePrice()) {
            return response()->json('Cart failed to recalculate price', 500);
        }

        $age = DateHelper::convertToAge($relative['age']);

        // sending email to admin if relative is under 14, or creating acc otherwise
        if ($relative['age'] < 14) {
            $relativeOutput = '';
            foreach ($relative as $key => $value) {
                $relativeOutput .= "<p>$key: $value</p>";
            }

            EmailHelper::sendEmail(
                GeneralSetting::getValue('website_admin_email_address', 'admin@tayyibun.com'),
                'Added new relative under 14',
                $relativeOutput
            );
        } else {
            $newUser = new User([
                'user_fullname'      => $relative['fullname'],
                'user_email_address' => $relative['email'],
                'age'                => $relative['age'],
                'user_main_role'     => Role::STUDENT
            ]);

            if (!$newUser->save()) {
                return response()->json('Failed to create user', 500);
            }

            $newUser->fresh();
            $profile = new Profile([
                'user_id'           => $newUser->id,
                'profile_forname'   => $relative['forename'],
                'profile_surname'   => $relative['surname'],
                'profile_telephone' => $relative['phone'],
                'profile_mobile'    => $relative['phone'],
                'profile_gender'    => $relative['gender']
            ]);
            if (!$profile->save()) {
                return response()->json('Failed to create user', 500);
            }
        }

        return response()->json('Relative added successfully');
    }

    public function deleteRelative(Request $request)
    {
        if (!$request->has('cartItemId') || !$request->has('relativeIndex')) {
            return response()->json('Wrong input', 400);
        }

        $cartItemId = explode('|', $request->get('cartItemId'));
        $cartId = $cartItemId[0];
        $classId = $cartItemId[1];

        $cartItem = CartItem::where(['cart_id' => $cartId, 'class_id' => $classId])->first();
        if (!$cartItem) {
            return response()->json('Cart item was not found', 404);
        }

        $removeIndex = intval($request->get('relativeIndex'));
        $relatives = $cartItem->relatives;
        if ($removeIndex < 0 || $removeIndex > count($relatives)) {
            return response()->json('Relative index is out of range', 400);
        }

        array_splice($relatives, $removeIndex, 1);

        $cartItem->fill([
            'relatives'    => $relatives,
            'ticket_number' => count($relatives) + 1,
            'updated_at'    => time()
        ]);
        $updated = $cartItem->save();

        if (!$updated) {
            return response()->json('Cart item failed to update', 500);
        }

        // recalculating price
        /* @var Cart $cart */
        $cart = Cart::find($cartId);
        if (!$cart) {
            return response()->json('Cart was not found', 404);
        }

        if (!$cart->recalculatePrice()) {
            return response()->json('Cart failed to recalculate price', 500);
        }

        return response()->json('Relative removed successfully');
    }

    public function update(Request $request, $cartId, $classId)
    {
        $user = Auth::user();
        /** @var Cart $cart */
        $cart = Cart::findOrFail($cartId);

        if (
            in_array($user->userMainRole, [Role::SUPER_ADMIN, Role::ADMIN]) ||
            $user->id == $cart->studentId
        ) {
            /** @var CartItem $cartItem */
            $cartItem = CartItem::where(['cart_id' => $cartId, 'class_id' => $classId])->firstOrFail();
            $cartItem->loadInput($request->all());
            $paypalSurchargeAmount = floatval(GeneralSetting::getValue('paypal_surcharge_amount', 3.0));
            $cartItem->priceWithSurcharge = $cartItem->calculatedPrice + $paypalSurchargeAmount;
            if ($cartItem->save() && $cart->recalculatePrice()) {
                return response()->json();
            } else {
                return response()->json('save failed', 500);
            }
        } else {
            return response()->json('Authorizarion failed', 401);
        }
    }

    public function submitItems(Request $request)
    {
        if (!$request->has('invoice')) {
            return response()->json('Invoice was not set', 400);
        }

        /** @var Cart $cart */
        $cart = Cart::where(['invoice_no' => $request->get('invoice')])->firstOrFail();
        if ($cart->cartStatus == 'open') {
            $cart->submitCartItems();
        }
    }
}
