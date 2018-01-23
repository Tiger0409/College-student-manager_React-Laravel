<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Classes\Helpers\MigrationHelper;
use App\Models\StudentPayment;

class StudentPaymentPaypalMethod extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        MigrationHelper::changeEnumValues(
            StudentPayment::className(),
            'payment_method',
            ['cash', 'cheque', 'paypal'],
            true
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        MigrationHelper::changeEnumValues(
            StudentPayment::className(),
            'payment_method',
            ['cash', 'cheque'],
            true
        );
    }
}
