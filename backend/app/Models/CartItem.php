<?php

namespace App\Models;
use Prophecy\Doubler\ClassPatch\ReflectionClassNewInstancePatch;

/**
 * Class CartItem
 * @package App\Models
 * @property float  $calculatedPrice
 * @property int    $cartId
 * @property int    $classId
 * @property string $className
 * @property string $coursePrise
 * @property string $createdAt
 * @property string $updatedAt
 * @property string $isFree
 * @property string $priceWithSurcharge
 * @property array  $relatives
 * @property string $studentStatus
 * @property int    $ticketNumber
 * @property string $notes
 * relations
 * @property Cart        $cart
 * @property CourseClass $courseClass
 */
class CartItem extends ExtendedModel
{
    protected $table = 'cart_item';

    protected $attributes = [
        'is_free'       => 0,
        'ticket_number' => 1,
        'notes'         => ''
    ];

    protected $primaryKeys = ['cart_id', 'class_id'];

    protected $guarded = [];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function cart()
    {
        return $this->belongsTo('App\\Models\\Cart', 'cart_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function courseClass()
    {
        return $this->belongsTo('App\\Models\\CourseClass', 'class_id');
    }

    public function getCalculatedPriceAttribute()
    {
        return floatval($this->attributes['calculated_price']);
    }

    public function getRelativesAttribute()
    {
        return unserialize($this->attributes['relatives']);
    }

    public function setRelativesAttribute(array $value)
    {
        $this->attributes['relatives'] = serialize($value);
    }

    public function getTicketNumberAttribute()
    {
        return intval($this->attributes['ticket_number']);
    }

    public function getIdAttribute()
    {
        return $this->cartId . '|' . $this->classId;
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) {
            return false;
        }

        if (empty($this->attributes['created_at'])) {
            $this->attributes['created_at'] = date("Y-m-d H:i:s");
        }

        $this->attributes['updated_at'] = date("Y-m-d H:i:s");

        return true;
    }
}
