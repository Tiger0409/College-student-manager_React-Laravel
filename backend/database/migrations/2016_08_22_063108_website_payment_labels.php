<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class WebsitePaymentLabels extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('websites', 'payment_heading')) {
            Schema::table('websites', function (Blueprint $table) {
                $table->string('payment_heading')->default('Choose employment');
            });
        }

        if (!Schema::hasColumn('websites', 'payment_field_1')) {
            Schema::table('websites', function (Blueprint $table) {
                $table->string('payment_field1')->default('employed');
            });
        }

        if (!Schema::hasColumn('websites', 'payment_field_2')) {
            Schema::table('websites', function (Blueprint $table) {
                $table->string('payment_field2')->default('unemployed');
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
        \App\Classes\Helpers\MigrationHelper::dropColumns('websites', [
            'payment_heading',
            'payment_field1',
            'payment_field2'
        ]);
    }
}
