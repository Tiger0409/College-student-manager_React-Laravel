<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class RememberToken extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('t_user', 'remember_token')) {
            Schema::table('t_user', function (Blueprint $table) {
                $table->string('remember_token');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasColumn('t_user', 'remember_token')) {
            Schema::table('t_user', function (Blueprint $table) {
                $table->dropColumn('remember_token');
            });
        }
    }
}
