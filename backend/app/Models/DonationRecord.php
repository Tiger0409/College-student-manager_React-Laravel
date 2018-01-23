<?php

namespace App\Models;

/**
 * Class DonationRecord
 * @package App\Models
 * @property int $id
 * @property string $anotes
 * @property float $donationAmount
 * @property string $createdAt
 * @property string $updatedAt
 * @property string $moneySource
 * @property string $name
 * @property string $notes
 * @property string $paymentMethod
 * @property string $phoneNumber
 * @property string $recurringPaymentId
 * @property string $userId
 * @property bool $isCalled
 * @property bool $isNotGettingTicket
 * @property bool $isReceived
 * @property bool $isUkTaxpayer
 * relations
 * @property User $user
 * @property Donation $donation
 * @property Term $term
 * @property PaypalTransaction $paypalTransaction
 * @property StripeTransaction $stripeTransaction
 * delegated fields
 * @property string $title
 * @property float $targetAmount
 */
class DonationRecord extends ExtendedModel
{
    protected $table = 'donation_records';

    protected $attributes = [
        'money_source'          => 'my money',
        'donation_amount'       => 0,
        'donation_id'           => 1,
        'is_uk_taxpayer'        => 0,
        'is_not_getting_ticket' => 0,
        'is_called'             => 0,
        'is_received'           => 1,
        'payment_method'        => 'paypal'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('App\\Models\\User', 'user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function donation()
    {
        return $this->belongsTo('App\\Models\\Donation', 'donation_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function paypalTransaction()
    {
        return $this->hasOne('App\\Models\\PaypalTransaction', 'donation_record_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function stripeTransaction()
    {
        return $this->hasOne('App\\Models\\StripeTransaction', 'donation_record_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function term()
    {
        return $this->belongsTo('App\\Models\\Term', 'donation_term_id');
    }

    public function getIsCalledAttribute()
    {
        return $this->attributes['is_called'] == '1' ? true : false;
    }

    public function getIsNotGettingTicketAttribute()
    {
        return $this->attributes['is_not_getting_ticket'] == '1' ? true : false;
    }

    public function getIsReceivedAttribute()
    {
        return $this->attributes['is_received'] == '1' ? true : false;
    }

    public function getIsUkTaxpayerAttribute()
    {
        return $this->attributes['is_uk_taxpayer'] == '1' ? true : false;
    }

    public function getUserEmailAddressAttribute()
    {
        if ($this->user) {
            return $this->user->userEmailAddress;
        }

        return null;
    }

    public static function getPaymentMethodValues()
    {
        return ['cash', 'cheque', 'paypal', 'stripe'];
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) {
            return false;
        }

        if (empty($this->getAttribute('donation_term_id'))) {
            $activeTerm = Term::activeTerm();
            if ($activeTerm) {
                $this->setAttribute('donation_term_id', $activeTerm->getKey());
            }
        }

        $this->attributes['is_received'] = filter_var($this->attributes['is_received'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;

        return true;
    }
}
