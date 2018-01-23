<?php
/**
 * Created by PhpStorm.
 * User: dev54
 * Date: 28.07.16
 * Time: 11:27
 */

namespace App\Classes\Helpers;


use App\Classes\Libraries\Paypal;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CourseStudent;
use App\Models\DonationRecord;
use App\Models\GeneralSetting;
use App\Models\PaypalTransaction;
use App\Models\Role;
use App\Models\StripeTransaction;
use App\Models\User;
use App\Models\StudentPayment;
use Faker\Provider\zh_CN\DateTime;
use Illuminate\Support\Facades\Auth;

class PaymentHelper
{
    const PAYPAL_METHOD   = 'paypal';
    const STRIPE_METHOD   = 'stripe';
    const CASH_METHOD     = 'cash';
    const CHEQUE_METHOD   = 'cheque';
    const TRANSFER_METHOD = 'transfer';

    /**
     * @param array   $options
     * @param \Closure $onSuccess
     * @param \Closure $onError
     * @return mixed
     * @throws \Exception
     */
    public static function processStripePayment($options, $onSuccess, $onError)
    {
        if (!isset($options['token'], $options['amount'], $options['userId'])) {
            throw new \Exception('token, amount or user id was not set');
        }

        $token = $options['token'];
        $amount = floatval($options['amount']) * 100;
        $description = isset($options['description']) ? $options['description'] : null;
        $userId = $options['userId'];

        /** @var User $user */
        $user = Auth::user();
        $user->createAsStripeCustomer($token['id']);
        $result = $user->charge($amount, ['description' => $description]);

        $cardHolderName = !empty($options['cardHolderName']) ?
            $options['cardHolderName'] : $result->source->name;

        $log = new StripeTransaction([
            'user_id'             => $userId,
            'cart_id'             => isset($options['cart_id']) ? $options['cart_id'] : '',
            'created'             => (new \DateTime)->setTimestamp($result->created),
            'status'              => $result->status,
            'amount'              => floatval($result->amount) / 100,
            'amount_refunded'     => floatval($result->amount_refunded) / 100,
            'application_fee'     => floatval($result->application_fee) / 100,
            'balance_transaction' => $result->balance_transaction,
            'currency'            => $result->currency,
            'customer'            => $result->customer,
            'description'         => $result->description,
            'failure_code'        => $result->failure_code,
            'failure_message'     => $result->failure_message,
            'source'              => $result->source->object,
            'card_owner_name'     => $cardHolderName,
            'address_city'        => $result->source->address_city,
            'address_country'     => $result->source->address_country,
            'address_line1'       => $result->source->address_line1,
            'address_line1_check' => $result->source->address_line1_check,
            'address_line2'       => $result->source->address_line1,
            'address_state'       => $result->source->address_state,
            'address_zip'         => $result->source->address_zip,
            'address_zip_check'   => $result->source->address_zip_check,
            'brand'               => $result->source->brand,
            'country'             => $result->source->country,
            'cvc_check'           => $result->source->cvc_check,
            'exp_month'           => $result->source->exp_month,
            'exp_year'            => $result->source->exp_year,
            'fingerprint'         => $result->source->fingerprint,
            'funding'             => $result->source->funding,
        ]);
        $log->save();

        if ($result->status == 'succeeded') {
            return $onSuccess($log);
        } else {
            return $onError($result->status . ' ' . $result->failure_message);
        }
    }
    public static function studentPaymentCheckout($amount,$id)
    {
        $user = Auth::user();
        if (empty($user)){
            return response()->json("Not Authorized");
        }
        $isPaypalOnline = GeneralSetting::getValue('is_paypal_online', 'no') == "yes" ? true : false;
        $paypal = new Paypal();
        if ($isPaypalOnline) {

            $paypalEmailAddress = GeneralSetting::getValue(
                'paypal_email_address',
                'itdawah@gmail.com'
            );

        } else {
            $paypalEmailAddress = GeneralSetting::getValue(
                'paypal_sandbox_email_address',
                'donnyk_1220237257_biz@gmail.com'
            );
            $paypal->paypal_url = 'https://www.sandbox.paypal.com/cgi-bin/webscr';   // testing paypal url
        }

        $siteUrl = function ($path) {
            return str_replace('backend/public/', '', url($path));
        };
        $paypal->add_field('business', $paypalEmailAddress);
        $paypal->add_field('return', $siteUrl("api/payment/studentIpn/$id"));
        $paypal->add_field('cancel_return', $siteUrl('payment/cancel'));
        $paypal->add_field('notify_url', $siteUrl('api/payment/ipn'));
        $paypal->add_field('upload', '1');
        $paypal->add_field('currency_code', 'GBP');
        $paypal->add_field('test_ipn', ($isPaypalOnline ? "0" : "1"));
        $paypal->add_field("item_name", "Total tickets");
        $paypal->add_field("quantity", 1);
        $paypal->add_field("amount", ($amount));

        $paypalForm = $paypal->get_submit_paypal_post();

        $output['paypalForm'] = view('common.paypal-form', ['paypalForm' => $paypalForm])->render();
        
        return response()->json($output);
    }
    public static function processCartPayment(array $params) {
        /** @var User $user */
        $user = !empty($params['userId']) ? User::findOrFail($params['userId']) : Auth::user();

        /** @var Cart $cart */
        $cart = $user->carts()->where('cart_status', 'open')->with(['cartItems'])->first();
        if (!$cart || count($cart->cartItems) === 0) {
            return response()->json('No items to checkout', 400);
        }

        $invoiceNo = 'cart' . date('YmdHis') . $cart->id;

        $cart->loadInput([
            'invoice_no'   => $invoiceNo,
            'invoice_date' => date('Y-m-d H:i:s')
        ]);

        if (!$cart->save()) {
            return response()->json("Can't update cart data. Please try again or contact administrator", 500);
        }

        if ($cart->totalCalculatedPrice == 0.0) {
            $cart->loadInput([
                'cart_status' => 'processed',
                'mc_gross' => 0.0,
                'payment_status' => 'Completed',
                'payment_type' => 'bypass'
            ]);

            if (!$cart->save()) {
                return response()->json("Can't update cart data. Please try again or contact administrator", 500);
            }

            $inserted = CourseStudent::insertFromCart($cart);
            if ($inserted) {
                $output['successMessage'] = 'Purchase successed!';
            } else {
                $output['errorMessage'] = 'Cannot save purchased courses. Please try again!';
            }

            return response()->json($output);
        }

        if (!isset($params['method'])) {
            return response()->json('Payment method was not set', 400);
        }

        switch ($params['method']) {
            case PaymentHelper::PAYPAL_METHOD:
                return PaymentHelper::processPaypalCartPayment($cart);

            case PaymentHelper::STRIPE_METHOD:
                return PaymentHelper::processStripeCartPayment($cart, $params);
                break;

            case PaymentHelper::CASH_METHOD:
            case PaymentHelper::CHEQUE_METHOD:
            case PaymentHelper::TRANSFER_METHOD:
                return PaymentHelper::processOtherCartPayment($cart, $params);
                break;

            default:
                return response()->json('This payment method is not supported', 400);
        }
    }

    public static function processDonation(array $params) {
        if (!isset($params['method'])) {
            return response()->json('Payment method was not set', 400);
        }

        $donationId = $params['donationId'];
        if (!$donationId) return response('Donation was not sent', 401);
        /** @var DonationRecord $donationRecord */
        $donationRecord = DonationRecord::find($donationId);
        if (!$donationRecord) return response('Donation was not found', 404);

        switch ($params['method']) {
            case PaymentHelper::PAYPAL_METHOD:
                return PaymentHelper::processPaypalDonation($donationRecord);

            case PaymentHelper::STRIPE_METHOD:
                return PaymentHelper::processStripeDonation($donationRecord, $params);
                break;

            default:
                return response()->json('This payment method is not supported', 400);
        }
    }

    /**
     * @param  Cart $cart
     * @return \Illuminate\Http\JsonResponse
     * @throws \Exception
     * @throws \Throwable
     */
    public static function processPaypalCartPayment(Cart $cart) {
        $isPaypalOnline = GeneralSetting::getValue('is_paypal_online', 'no') == "yes" ? true : false;
        $paypal = new Paypal();

        if ($isPaypalOnline) {
            $paypalEmailAddress = GeneralSetting::getValue(
                'paypal_email_address',
                'itdawah@gmail.com'
            );
        } else {
            $paypalEmailAddress = GeneralSetting::getValue(
                'paypal_sandbox_email_address',
                'donnyk_1220237257_biz@gmail.com'
            );
            $paypal->paypal_url = 'https://www.sandbox.paypal.com/cgi-bin/webscr';   // testing paypal url
        }

        $siteUrl = function ($path) {
            return str_replace('backend/public/', '', url($path));
        };

        $paypal->add_field('business', $paypalEmailAddress);
        $paypal->add_field('return', $siteUrl("/payment/success/paypal/{$cart->invoiceNo}"));
        $paypal->add_field('cancel_return', $siteUrl('payment/cancel'));
        $paypal->add_field('notify_url', $siteUrl('api/payment/ipn'));
        $paypal->add_field('invoice', $cart->invoiceNo);
        $paypal->add_field('cmd', '_cart');
        $paypal->add_field('upload', '1');
        $paypal->add_field('currency_code', 'GBP');
        $paypal->add_field('test_ipn', ($isPaypalOnline ? "0" : "1"));

        for ($i = 0; $i < count($cart->cartItems); $i++) {
            $item = $cart->cartItems[$i];

            $num = $i + 1;

            $paypal->add_field("item_name_$num", "{$item->className} - {$item->ticketNumber} tickets");
            $paypal->add_field("quantity_$num", 1);
            $paypal->add_field("amount_$num", ($item->priceWithSurcharge * $item->ticketNumber));
        }

        $paypalForm = $paypal->get_submit_paypal_post();
        $output['paypalForm'] = view('common.paypal-form', ['paypalForm' => $paypalForm])->render();

        return response()->json($output);
    }

    /**
     * @param Cart $cart
     * @param array $params
     * @return \Illuminate\Http\JsonResponse
     */
    public static function processStripeCartPayment(Cart $cart, array $params)
    {
        if (!isset($params['token'])) {
            return response()->json('Token was not set', 400);
        }

        $amount = 0;
        foreach ($cart->cartItems as $item) {
            $amount += $item->priceWithSurcharge * $item->ticketNumber;
        }

        /** @var User $user */
        $user = !empty($params['userId']) ? User::findOrFail($params['userId']) : Auth::user();

        $classesInfo = $cart->cartItems
            ->map(function (CartItem $cartItem) {
                return $cartItem->courseClass->course->courseTitle .
                ' (' . $cartItem->courseClass->classTime . ')';
            })
            ->implode('; ');

        $description = implode('; ', [
            $user->userFullname,
            $user->profile->profilePostcode,
            $classesInfo
        ]);

        $paymentOptions = [
            'amount'         => $amount,
            'token'          => $params['token'],
            'userId'         => $cart->studentId,
            'description'    => $description,
            'cardHolderName' => isset($params['cardHolderName']) ? $params['cardHolderName'] : null,
            'cart_id'        => $cart->id
        ];

        $params['receivedBy'] = isset($params['cardHolderName']) ? $params['cardHolderName'] : 'stripe';
        $params['staff'] = 'stripe';

        return self::processStripePayment($paymentOptions,
            function () use ($cart, $params) {
                return response()->json($cart->submitCartItems($params), 200);
            },
            function () {
                return response()->json('Payment failed', 500);
            }
        );
    }

    /**
     * @param Cart $cart
     * @param string $params
     * @return \Illuminate\Http\JsonResponse
     */
    public static function processOtherCartPayment(Cart $cart, $params)
    {
        /** @var User $user */
        $user = Auth::user();
        if (!in_array($user->userMainRole, [Role::ADMIN, Role::REGISTRAR, Role::SUPER_ADMIN])) {
            return response()->json('Permission denied', 403);
        }

        return response()->json($cart->submitCartItems($params), 200);
    }

    /**
     * @param DonationRecord $donationRecord
     * @return \Illuminate\Http\JsonResponse
     * @throws \Exception
     * @throws \Throwable
     */
    public static function processPaypalDonation(DonationRecord $donationRecord)
    {
        /** @var PaypalTransaction $paypalTransaction */
        $paypalTransaction = new PaypalTransaction($donationRecord->id);
        if (!$paypalTransaction) return response('Cannot create paypal transaction', 500);

        $donationRecord->paymentMethod = 'paypal';
        $donationRecord->setAttribute('is_received', 1);
        $donationRecord->save();

        $isPaypalOnline = GeneralSetting::getValue('is_paypal_online', 'no');
        $paypal = new Paypal();
        $website = Website::all()->first();
        if(isset($website->payPal) && !empty($website->payPal))
        {
            $paypalEmailAddress =$website->payPal;
        }
        elseif ($isPaypalOnline == 'yes') {
            $paypalEmailAddress = GeneralSetting::getValue(
                'paypal_email_address',
                'itdawah@gmail.com'
            );
        } else {
            $paypalEmailAddress = GeneralSetting::getValue(
                'paypal_sandbox_email_address',
                'donnyk_1220237257_biz@gmail.com'
            );
            $paypal->paypal_url = 'https://www.sandbox.paypal.com/cgi-bin/webscr';   // testing paypal url
        }

        $siteUrl = function ($path) {
            return str_replace('backend/public/', '', url($path));
        };

        $paypal->add_field('business',      $paypalEmailAddress);
        $paypal->add_field('notify_url',    $siteUrl('api/payment/donation-ipn'));
        $paypal->add_field('invoice',       $paypalTransaction->invoiceNo);
        $paypal->add_field('rm',            '2');
        $paypal->add_field('currency_code', 'GBP');
        $paypal->add_field('item_name',     $donationRecord->donation->title);
        $paypal->add_field('cmd',           '_donations');
        $paypal->add_field('quantity',      1);
        $paypal->add_field('amount',        $donationRecord->donationAmount);

        $paypalTransaction->save();

        $paypalForm = $paypal->get_submit_paypal_post();
        $output['paypalForm'] = view('common.paypal-form', ['paypalForm' => $paypalForm])->render();

        return response()->json($output);
    }

    /**
     * @param DonationRecord $donationRecord
     * @param array $params
     * @return \Illuminate\Http\JsonResponse
     */
    public static function processStripeDonation(DonationRecord $donationRecord, array $params)
    {
        if (!isset($params['token'])) {
            return response()->json('Token was not set', 400);
        }

        /** @var User $user */
        $user = Auth::user();

        $paymentOptions = [
            'token'       => $params['token'],
            'amount'      => $donationRecord->donationAmount,
            'userId'      => $donationRecord->userId,
            'description' => implode('; ', ['donation', $user->userFullname, $user->profile->profilePostcode])
        ];

        $donationRecord->paymentMethod = 'stripe';
        $donationRecord->save();

        return self::processStripePayment($paymentOptions,
            function (StripeTransaction &$transaction) use ($donationRecord) {
                $transaction->donationRecordId =  $donationRecord->id;
                $transaction->save();
                $donationRecord->isReceived = true;
                $donationRecord->save();
                return response()->json('ok', 200);
            },
            function () {
                return response()->json('Payment failed', 500);
            }
        );
    }
}