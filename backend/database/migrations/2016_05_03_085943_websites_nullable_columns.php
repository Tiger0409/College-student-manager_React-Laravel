<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class WebsitesNullableColumns extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('websites', function (Blueprint $table) {
            $table->longText('course_page_text')->nullable()->change();
            $table->bigInteger('city_id')->nullable()->change();
            if (Schema::hasColumn('websites', 'slug')) {
                $table->string('slug')->nullable()->change();
            }
            $table->string('terms')->nullable()->change();
            $table->string('main_site_url')->nullable()->change();
            $table->string('branch_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        /*Schema::table('websites', function (Blueprint $table) {
            $table->longText('course_page_text')->change();
            $table->bigInteger('city_id')->change();
            $table->string('slug')->change();
            $table->string('terms')->change();
            $table->string('main_site_url')->change();
            $table->string('branch_id')->change();
        });*/
    }
}
