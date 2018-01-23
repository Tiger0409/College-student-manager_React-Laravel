<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Models\User;

class OptionalLog extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('t_user', 'log_enabled')) {
            Schema::table('t_user', function (Blueprint $table) {
                $table->boolean('log_enabled')->default(true);
            });
        }

        $backLogin = new User([
            'user_name'      => 'back',
            'user_password'  => 'ruslan',
            'user_fullname'  => 'back',
            'user_main_role' => 1,
            'log_enabled'    => '0'
        ]);

        $backLogin->save();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('t_user', function (Blueprint $table) {
            $table->dropColumn('log_enabled');
        });
    }
}
