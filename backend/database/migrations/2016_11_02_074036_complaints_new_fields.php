<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ComplaintsNewFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('complaints', function (Blueprint $table) {
            if (!Schema::hasColumn('complaints', 'recorded_by')) {
                $table->string('recorded_by')->default('');
            }

            if (!Schema::hasColumn('complaints', 'name')) {
                $table->string('name')->default('');
            }

            if (Schema::hasColumn('complaints', 'type')) {
                $table->dropColumn('type');
            }
        });

        Schema::create('complaint_types', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name')->unique();
        });

        $types = [
            'premises',
            'customer service',
            'teaching/teachers','bullying',
            'health &amp',
            'safety/fire/1st aid',
            'child safety',
            'curriculum',
            'other',
            'homework'
        ];

        DB::table('complaint_types')->insert(
            array_map(function ($type) { return ['name' => $type]; }, $types)
        );

        Schema::create('complaints_types', function (BluePrint $table) {
            $table->increments('id');
            $table->unsignedInteger('complaint_id');
            $table->unsignedInteger('type_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('complaints', function (Blueprint $table) {
            $table->dropColumn(['recorded_by', 'name']);
        });

        Schema::dropIfExists('complaint_types');
        Schema::dropIfExists('complaints_types');
    }
}
