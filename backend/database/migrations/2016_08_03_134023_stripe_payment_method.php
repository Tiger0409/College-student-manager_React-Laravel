<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Classes\Helpers\MigrationHelper;
use App\Models\StudentPayment;

class StripePaymentMethod extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $enums = ['cash', 'cheque', 'paypal', 'stripe'];
        MigrationHelper::changeEnumValues(StudentPayment::className(), 'payment_method', $enums, true);
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
            ['cash', 'cheque', 'paypal'],
            true
        );
    }
}
