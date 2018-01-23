<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

/**
 * Class Instalment
 * @package App\Models
 * relations
 * @property StudentPayment[] $studentPayments
 */
class Instalment extends ExtendedModel
{
    protected $table = 't_instalment';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function studentPayments()
    {
        return $this->hasMany('App\\Models\\StudentPayment', 'instalment_id');
    }

    /**
     * @return int
     */
    public static function getPastFee()
    {
        return DB::Table(self::tableName())->whereRaw('duedate > curdate()')->sum('amount');
    }
}
