<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UserStatusTimestamp extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('t_user', function (Blueprint $table) {
            if (!Schema::hasColumn('t_user', 'user_status_updated_at')) {
                $table->timestamp('user_status_updated_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('t_user', function (Blueprint $table) {
            if (!Schema::hasColumn('t_user', 'user_status_updated_at')) {
                $table->dropColumn('user_status_updated_at');
            }
        });
    }
}
