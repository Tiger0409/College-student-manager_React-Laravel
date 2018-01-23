<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Classes\Helpers\DataFormatter;
use App\Classes\Helpers\QueryHelper;
use App\Classes\Helpers\StringHelper;
use Illuminate\Support\Facades\DB;

class PayName extends Model
{
    public $timestamps = false;

    protected $table = "t_pay_name";

    protected $attributes = [
        'id' =>'',
        'name' => '',
        'description' => '',
        'branch_id' => '',
        'selected_term' => '',
        'default_time_in' => '',
        'default_time_out' => '',
    ];
    public function tableName(){
        return $this->table;
    }

    public function userTime()
    {
        return $this->belongsTo('App\\Models\\PayNameUserTime','id','pay_name_id');
    }
}
