<?php

use App\Models\GeneralSetting;
use App\Models\Term;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ActiveTermSettingRework extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $activeSemester = GeneralSetting::getValue('active_semester');
        $activeYear = GeneralSetting::getValue('active_year');
        $activeTerm = null;
        if ($activeSemester && $activeYear) {
            $semesterNumber = str_replace('term ', '', $activeSemester);
            $activeTerm = Term::where(['year' => $activeYear, 'term' => $semesterNumber])->first();
        }

        GeneralSetting::whereIn('setting_key', ['active_semester', 'active_year'])->delete();

        Schema::table('t_term', function (Blueprint $table) {
            $table->boolean('is_active')->default(false);
        });

        if ($activeTerm) {
            $activeTerm->fresh();
            $activeTerm->setAttribute('is_active', true);
            $activeTerm->save();
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        /*if (Schema::hasColumn('t_term', 'is_active')) {
            Schema::table('t_term', function (Blueprint $table) {
                $table->dropColumn('is_active');
            });
        }*/
    }
}
