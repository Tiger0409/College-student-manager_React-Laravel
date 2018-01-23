<?php

namespace App\Models;

/**
 * Class DonationType
 * @package App\Models
 * @property string $id
 * @property string $type
 * @property string isSubscription
 * @property string isPledge
 * @property string createdAt
 * @property string updatedAt
 * relations
 * @property Donation[] $donations
 */
class DonationType extends ExtendedModel
{
    protected $table = 'donation_types';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function donations()
    {
        return $this->hasMany('App\\Models\\Donation');
    }
}
