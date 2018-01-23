<?php

namespace App\Models;
use Illuminate\Support\Facades\Auth;

/**
 * Class Donation
 * @package App\Models
 * @property int $id
 * @property string $body
 * @property string $createdAt
 * @property string $updatedAt
 * @property string $donationBy
 * @property string $friendlyTitle
 * @property string $imageContentType
 * @property string $imageFileName
 * @property string $imageFileSize
 * @property string $imageUpdatedAt
 * @property string $notes
 * @property string $paymentMethod
 * @property string $paypalEmailAddress
 * @property string $paypalSandboxEmailAddress
 * @property string $pledgeOwnerId
 * @property string $targetAmount
 * @property string $title
 * @property string $userId
 * @property string $weight
 * @property bool $isCalled
 * @property bool $isClosed
 * @property bool $isShown
 * @property bool $isRemovable
 * @property string $totalAmountReceived
 * relations
 * @property DonationRecord[] $donationRecords
 * @property DonationType $donationType
 * @property User $user
 * @property User $pledgeOwner
 */
class Donation extends ExtendedModel
{
    protected $table = 'donations';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function donationType()
    {
        return $this->belongsTo('App\\Models\\DonationType', 'donation_type_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function donationRecords()
    {
        return $this->hasMany('App\\Models\\DonationRecord');
    }

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
    public function pledgeOwner()
    {
        return $this->belongsTo('App\\Models\\User', 'pledge_owner_id');
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) return false;

        $user = Auth::user();
        $this->userId = $user->id;

        if (in_array($user->role->id, [Role::ADMIN, Role::SUPER_ADMIN]) && $this->pledgeOwnerId == 0) {
            $this->donationBy = 'admin';
        } else {
            $this->donationBy = 'student';
        }

        if (is_null($this->isShown))
            $this->isShown = false;

        if (is_null($this->isCalled))
            $this->isCalled = false;

        if (is_null($this->isClosed))
            $this->isClosed = false;

        if (is_null($this->pledgeOwnerId))
            $this->pledgeOwnerId = 0;

        if (is_null($this->weight))
            $this->weight = 1;

        if ($this->attributes['title'] != $this->original['title'])
            $this->friendlyTitle = $this->createFriendlyTitle();

        return true;
    }

    private function createFriendlyTitle()
    {
        if ($this->title) {
            $friendlyTitle = preg_replace('/[ _]+/', '-', $this->title);
            $sameFriendlyTitles = Donation::where('friendly_title', 'like', $friendlyTitle . '%')
                ->where('id', '!=', $this->id ? $this->id : -1)
                ->count();
            if ($sameFriendlyTitles > 0) {
                $friendlyTitle .= '-' . $sameFriendlyTitles + 1;
            }

            return $friendlyTitle;
        }

        return '';
    }

    /**
     * @return array
     */
    public static function getGroupedByStatus()
    {
        $output = [];
        /**
         * @var Donation $donation
         */
        foreach (static::with('user', 'donationRecords')->get() as $donation) {
            $donationGroup = null;
            if ($donation->isClosed)
                $donationGroup = 'closed';
            else
                $donationGroup = 'open';

            if ($donationGroup == null) continue;

            $fields = [
                'id',
                'isClosed',
                'title',
                'friendlyTitle',
                'totalAmountReceived',
                'user.userFullname',
                'donationType.type',
                'paymentMethod',
                'isShown',
                'totalAmountPending',
                'totalAmountThisMonth'
            ];

            $output[$donationGroup][] = $donation->fieldsToArray($fields);
        }

        return $output;
    }

    public static function getPaymentMethodValues()
    {
        return ['Paypal Payment', 'Manual Payment'];
    }

    public function getIsCalledAttribute()
    {
        if (is_null($this->attributes['is_called'])) return null;
        return filter_var($this->attributes['is_called'], FILTER_VALIDATE_BOOLEAN);
    }

    public function setIsCalledAttribute($value)
    {
        $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
        $this->attributes['is_called'] = $value ? '1' : '0';
    }


    public function getIsClosedAttribute()
    {
        if (is_null($this->attributes['is_closed'])) return null;
        return filter_var($this->attributes['is_closed'], FILTER_VALIDATE_BOOLEAN);
    }

    public function setIsClosedAttribute($value)
    {
        $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
        $this->attributes['is_closed'] = $value ? '1' : '0';
    }

    public function getIsShownAttribute()
    {
        if (is_null($this->attributes['is_shown'])) return null;
        return filter_var($this->attributes['is_shown'], FILTER_VALIDATE_BOOLEAN);
    }

    public function setIsShownAttribute($value)
    {
        $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
        $this->attributes['is_shown'] = $value ? '1' : '0';
    }

    public function getIsRemovableAttribute()
    {
        return $this->donationRecords()->count() == 0;
    }

    /**
     * @return float
     */
    public function getTotalAmountReceivedAttribute()
    {
        return $this->getTotalAmount(true);
    }

    /**
     * @return float
     */
    public function getTotalAmountPendingAttribute()
    {
        return $this->getTotalAmount(false);
    }

    /**
     * @return float
     */
    public function getTotalAmountThisMonthAttribute()
    {
        return $this->donationRecords()
            ->whereRaw(
                'month(created_at) = ? and year(created_at) = ?',
                [date('n'), date('Y')])
            ->sum('donation_amount');
    }

    /**
     * @param bool $isReceived
     * @return float
     */
    private function getTotalAmount($isReceived)
    {
        if (isset($this->relations['donationRecords'])) {
            $sum = 0;
            foreach ($this->donationRecords as $donationRecord) {
                if ($donationRecord->isReceived == $isReceived) {
                    $sum += $donationRecord->donationAmount;
                }
            }

            return $sum;
        }

        return $this->donationRecords()->where('is_received', $isReceived)->sum('donation_amount');
    }
}
