<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UserSerialNumber extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('t_user', 'serial_number')) {
            Schema::table('t_user', function (Blueprint $table) {
                $table->string('serial_number')->nullable();
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
        if (Schema::hasColumn('t_user', 'serial_number')) {
            Schema::table('t_user', function (Blueprint $table) {
                $table->dropColumn('serial_number');
            });
        }
    }
}
