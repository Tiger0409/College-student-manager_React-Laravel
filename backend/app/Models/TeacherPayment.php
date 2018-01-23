<?php

namespace App\Models;

/**
 * Class TeacherPayment
 * @package App\Models
 * @property int $id
 * @property int $teacherId
 * @property string $payName
 * @property string $payDate
 * @property string $paidBy
 * @property float $workedHours
 * @property float $paidAmount
 * @property bool $submitted
 * relations
 * @property User $teacher
 */
class TeacherPayment extends ExtendedModel
{
    public $isDeleted = false;
    protected $table = 't_teacher_payment';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function teacher()
    {
        return $this->belongsTo('App\\Models\\User', 'teacher_id');
    }

    public function setSubmittedAttribute($value)
    {
        $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
        $this->attributes['submitted'] = $value;
    }
}
