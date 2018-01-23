<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCourseStudentDeletedTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable("t_course_student_deleted")){
            Schema::create('t_course_student_deleted', function (Blueprint $table) {
                $table->integer('id');
                $table->string('invoice_id');
                $table->integer('course_id');
                $table->integer('student_id');
                $table->dateTime('register_date');
                $table->string('admin_notes')->nullable();
                $table->enum('reg_payment_status',['paid','unpaid']);
                $table->enum('student_status',['employed','unemployed','reduced']);
                $table->integer('class_id');
                $table->enum('reg_status',['pending','active','waiting_list']);
                $table->decimal('reduced_amount')->default(0.00);
                $table->string('score');
                $table->string('reduced_notes');
                $table->enum('grade_status',['none','pass','fail','retake']);
                $table->text('feedback')->nullable();
                $table->string('certificate_file');
                $table->integer('attendance_code');
                $table->enum('reg_payment_method',['active','payment_agreement','instalment','no_response','withdrawn']);
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
        Schema::drop('t_course_student_deleted');
    }
}
