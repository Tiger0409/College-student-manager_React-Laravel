<?php

namespace App\Models;

/**
 * Class PaypalTransaction
 * @package App\Models
 * relations
 * @property DonationRecord $donationRecord
 */
class PaypalTransaction extends ExtendedModel
{
    protected $table = 'paypal_transactions';

    protected $attributes = [
        'mc_gross' => 0,
        'mc_currency' => '',
        'payment_date' => '',
        'payment_status' => '',
        'pending_reason' => '',
        'payment_type' => '',
        'verify_sign' => '',
        'txn_id' => '',
        'payer_email' => '',
        'payer_id' => '',
        'payer_status' => '',
        'receiver_email' => '',
        'receiver_id' => ''
    ];

    public function __construct($donationRecordId)
    {
        $donationRecordId = intval($donationRecordId);
        parent::__construct([
            'donation_record_id'  => $donationRecordId,
            'invoice_no'          => "donation_" . date('YmdHis') . "_" . $donationRecordId,
            'invoice_date'        => date('Y-m-d H:i:s'),
        ]);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function donationRecord()
    {
        return $this->belongsTo('App\\Models\\DonationRecord', 'donationRecord_id');
    }

    public function getFullDetailsAttribute()
    {
        return unserialize($this->attributes['full_details']);
    }

    public function setFullDetailsAttribute($value)
    {
        $this->attributes['full_details'] = serialize($value);
    }

    public function processPaypalMethod($paypalData)
    {
        $result = false;
        $isReceived = 0;

        if (isset($paypalData['invoice']) && $this->invoiceNo == $paypalData['invoice'] ) {
            //default paypal fields
            $attr = [
                'mc_currency'     => $paypalData['mc_currency'],
                'payer_email'     => $paypalData['payer_email'],
                'payer_id'        => $paypalData['payer_id'],
                'payer_status'    => $paypalData['payer_status'],
                'receiver_email'  => $paypalData['receiver_email'],
                'full_details'    => serialize($paypalData),
            ];
            
            if (isset($paypalData['txn_type'])) {
                if ($paypalData['txn_type'] == 'subscr_signup') {
                    //regular payment signup
                    $this->loadInput($attr);
                    $result = $this->save();
                    $donationRecord = $this->donationRecord;
                    //update donation record
                    $donationRecord->loadInput([
                        'recurring_payment_id'  => $paypalData['subscr_id']
                    ]);
                    $donationRecord->save();
                } elseif (in_array($paypalData['txn_type'], ['web_accept', 'subscr_payment'])) {
                    //payment ipn
                    $attr = array_merge($attr, [
                        'mc_gross'        => $paypalData['mc_gross'],
                        'payment_date'    => $paypalData['payment_date'],
                        'payment_status'  => $paypalData['payment_status'],
                        'pending_reason'  => isset($paypalData['pending_reason']) ? $paypalData['pending_reason'] : NULL,
                        'payment_type'    => $paypalData['payment_type'],
                        'verify_sign'     => $paypalData['verify_sign'],
                        'txn_id'          => $paypalData['txn_id'],
                        'receiver_id'     => $paypalData['receiver_id'],
                    ]);

                    if (preg_match('/Completed/i', $paypalData['payment_status'])) {
                        $isReceived = 1;
                    }

                    $this->loadInput($attr);
                    $result = $this->save();

                    $donationRecord = $this->donationRecord;
                    //update donation record
                    $donationRecord->loadInput([
                        'is_received' => 1,
                    ]);
                    $donationRecord->save();
                }
            }
        }

        return $result;
    }
}