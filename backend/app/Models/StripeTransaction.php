<?php

namespace App\Models;

/**
 * Class StripeTransaction
 * @package App\Models
 * @property int    $userId
 * @property float  $amount
 * @property string $balanceTransaction
 * @property string $currency
 * @property string $customer
 * @property string $description
 * @property array  $fullDetails
 * @property string $cardOwnerName
 * relations
 * @property User           $user
 * @property Cart           $cart
 * @property DonationRecord $donationRecord
 */
class StripeTransaction extends ExtendedModel
{
    protected $table = 'stripe_transactions';

    public function __construct(array $input = [], array $attributes = [])
    {
        parent::__construct($input, $attributes);
        $this->fullDetails = $input;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('App\\Models\\User', 'user_id');
    }

    public function getFullDetailsAttribute()
    {
        return unserialize($this->attributes['full_details']);
    }

    public function setFullDetailsAttribute($value)
    {
        $this->attributes['full_details'] = serialize($value);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function cart()
    {
        return $this->belongsTo('App\\Models\\Cart', 'cart_id');
    }

    public function donationRecord()
    {
        return $this->belongsTo('App\\Models\\DonationRecord', 'donation_record_id');
    }
}
