<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayNameUserTime extends Model
{
    public $timestamps = false;

    protected $table = "t_payname_user_time";

    protected $attributes = [
        'pay_name_id'=>'',
        'user_id'=>'',
        'user_default_time_in' =>'',
        'user_default_time_out' =>''
    ];


}
