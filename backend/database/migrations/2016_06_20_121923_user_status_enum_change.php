<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Classes\Helpers\MigrationHelper;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserStatusEnumChange extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::update('update t_user set user_status = ? where user_status != ?', ['waiting', 'active']);
        MigrationHelper::changeEnumValues(
            User::className(),
            'user_status',
            ['active', 'waiting'],
            true
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        MigrationHelper::changeEnumValues(
            User::className(),
            'user_status',
            ['active', 'waiting', 'inactive', 'suspended', 'deleted'],
            true
        );
    }
}
