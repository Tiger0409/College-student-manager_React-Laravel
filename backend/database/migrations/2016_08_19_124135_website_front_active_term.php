<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Models\Website;

class WebsiteFrontActiveTerm extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('t_branches_assoc_terms', 'website_id')) {
            Schema::table('t_branches_assoc_terms', function (Blueprint $table) {
                $table->integer('website_id')->default(1);
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
        if (Schema::hasColumn('t_branches_assoc_terms', 'website_id')) {
            Schema::table('t_branches_assoc_terms', function (Blueprint $table) {
                $table->dropColumn('website_id');
            });
        }
    }
}
