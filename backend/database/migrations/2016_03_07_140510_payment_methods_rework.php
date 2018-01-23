<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Models\CourseStudent;
use App\Classes\Helpers\MigrationHelper;

class PaymentMethodsRework extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $desiredEnums = [
            'active',
            'payment_agreement',
            'instalment',
            'no_response',
            'withdrawn'
        ];

        MigrationHelper::changeEnumValues(CourseStudent::className(), 'reg_payment_method', $desiredEnums);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $desiredEnums = [
            'cash',
            'cheque',
            'paypal'
        ];

        MigrationHelper::changeEnumValues(CourseStudent::className(), 'reg_payment_method', $desiredEnums);
    }
}
