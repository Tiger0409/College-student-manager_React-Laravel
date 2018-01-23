<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Models\Term;

class WebsiteBackActiveTerm extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('websites', 'active_term')) {
            $term = Term::where('is_active', 1)->first();
            if (!$term) $term = Term::query()->first();

            Schema::table('websites', function (Blueprint $table) use ($term) {
                $table->integer('active_term_id')->default($term ? $term->id : 1);
            });
        }

        if (Schema::hasColumn('t_term', 'is_active')) {
            Schema::table('t_term', function (Blueprint $table) {
                $table->dropColumn('is_active');
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
        if (Schema::hasColumn('websites', 'active_term')) {
            Schema::table('websites', function (Blueprint $table) {
                $table->dropColumn('active_term_id');
            });
        }

        if (!Schema::hasColumn('t_term', 'is_active')) {
            Schema::table('t_term', function (Blueprint $table) {
                $table->boolean('is_active');
            });
        }
    }
}
