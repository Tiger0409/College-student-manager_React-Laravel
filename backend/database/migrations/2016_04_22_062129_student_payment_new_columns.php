<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Models\StudentPayment;

class StudentPaymentNewColumns extends Migration
{
    protected $tableName = 't_student_payment';

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table($this->tableName, function ($table) {
            if (!Schema::hasColumn($this->tableName, 'received_by')) {
                $table->string('received_by', 100);
            }

            if (!Schema::hasColumn($this->tableName, 'payment_method')) {
                $table->enum('payment_method', ['cash', 'cheque']);
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (
            Schema::hasColumn($this->tableName, 'received_by') &&
            Schema::hasColumn($this->tableName. 'payment_method')
        ) {
            Schema::table(StudentPayment::tableName(), function (BluePrint $table) {
                $table->dropColumn(['received_by', 'payment_method']);
            });
        }
    }
}
