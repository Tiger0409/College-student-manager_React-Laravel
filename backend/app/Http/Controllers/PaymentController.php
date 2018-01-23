<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\EmailHelper;
use App\Classes\Libraries\Paypal;
use App\Models\Cart;
use App\Models\CourseStudent;
use App\Models\GeneralSetting;
use App\Models\Log;
use App\Models\PaypalTransaction;
use App\Models\StudentPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    /**
     * @var Paypal $paypal
     */
    protected $paypal;

    public function __construct()
    {
        $this->paypal = new Paypal();
    }


    public function success($invoiceNo)
    {
    }

    public function cancel()
    {

    }
    public function studentIpn(Request $request,$id)
    {
        $isPaypalOnline = GeneralSetting::getValue('is_paypal_online', 'no');
        if ($isPaypalOnline == 'no') {
            $this->paypal->paypal_url = 'https://www.sandbox.paypal.com/cgi-bin/webscr';
        }
        if (!$this->paypal->validate_ipn()) {
            return redirect()->to('https://qurbani.tayyibun.com/payment/cancel');
        }else{

            StudentPayment::insert([
                'course_student_id'=>$id,
                'staff'=>'paypal',
                'date'=>date('Y-m-d'),
                'received_by'=>$request->payer_email,
                'amount'=>(int)$request->payment_gross,
                'payment_method'=>'paypal',
            ]);
            return redirect()->to('https://qurbani.tayyibun.com/payment/success/paypal/success');
        }
    }
    public function ipn()
    {
        $isPaypalOnline = GeneralSetting::getValue('is_paypal_online', 'no');
        if ($isPaypalOnline == 'no') {
            $this->paypal->paypal_url = 'https://www.sandbox.paypal.com/cgi-bin/webscr';
        }

        if (!$this->paypal->validate_ipn()){
            return;
        }
        $invoice = $this->paypal->ipn_data['invoice'];
            /** @var Cart $cart */
            $cart = Cart::where('invoice_no', $invoice)->firstOrFail();
            $cart->submitCartItems(['payment_method' => 'paypal', 'receivedBy' => 'paypal', 'staff' => 'paypal'], $this->paypal);

    }
    public function donationIpn(Request $request)
    {
        $isPaypalOnline = GeneralSetting::getValue('is_paypal_online', 'no');
        if ($isPaypalOnline == 'no') {
            $this->paypal->paypal_url = 'https://www.sandbox.paypal.com/cgi-bin/webscr';
        }

        if (!$this->paypal->validate_ipn()) {
            return;
        }

        $invoiceNo = isset($this->paypal->ipn_data['invoice']) ? $this->paypal->ipn_data['invoice'] : '';
        /** @var PaypalTransaction $paypalTransaction */
        $paypalTransaction = PaypalTransaction::where(['invoice_no' => $invoiceNo])->first();
        if (!$paypalTransaction) return;

        $donationRecord = $paypalTransaction->donationRecord;
        if ($donationRecord) {
            $donationRecord->setAttribute('is_received', 1);
            $donationRecord->save();
        }

        $paypalTransaction->processPaypalMethod($this->paypal->ipn_data);
    }
}