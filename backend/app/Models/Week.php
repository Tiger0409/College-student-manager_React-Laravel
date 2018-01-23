<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Week extends Model
{
    protected $table = 't_week_day';

    public function pay_name()
    {
       return $this->belongsToMany('App\Models\PayName', 'weekday_payname', 'week_id', 'pay_name_id');
    }
}
