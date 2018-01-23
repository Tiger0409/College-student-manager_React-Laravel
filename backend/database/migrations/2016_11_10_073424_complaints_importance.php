<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ComplaintsImportance extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('complaints', 'priority')) {
            Schema::table('complaints', function (Blueprint $table) {
                $table->enum('priority', ['urgent', 'important', 'moderate', 'not urgent'])->default('not urgent');
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
        if (Schema::hasColumn('complaints', 'priority')) {
            Schema::table('complaints', function (Blueprint $table) {
                $table->dropColumn('priority');
            });
        }
    }
}
