<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class TBranchesAssociatedNullableColumns extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('t_branches_associated', function (Blueprint $table) {
            $table->bigInteger('city_id')->nullable()->change();
            $table->longText('term_info')->nullable()->change();
            $table->longText('invoice_email_template')->nullable()->change();
            $table->longText('student_register_template')->nullable()->change();
            $table->longText('print_receipt_template')->nullable()->change();
            $table->longText('image_url')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        /*Schema::table('t_branches_associated', function (Blueprint $table) {
            $table->bigInteger('city_id')->change();
            $table->longText('term_info')->change();
            $table->longText('invoice_email_template')->change();
            $table->longText('student_register_template')->change();
            $table->longText('print_receipt_template')->change();
            $table->longText('image_url')->change();
        });*/
    }
}
