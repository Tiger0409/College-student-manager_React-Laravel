<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Models\CourseStudent;
use App\Models\StudentPayment;

class StudInitPayments extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('t_student_payment', 'is_initial')) {
            Schema::table('t_student_payment', function (Blueprint $table) {
                $table->boolean('is_initial')->default(false);
            });
        }

        $students = CourseStudent::where('total_amount', '>', '0')->get();
        foreach ($students as $student) {
            $model = new StudentPayment([
                'course_student_id' => $student->id,
                'payment_method'    => 'cash',
                'amount'            => $student->totalAmountOld,
                'is_initial'        => true
            ]);
            $model->save();
        }

        if (Schema::hasColumn('t_course_student', 'total_amount')) {
            Schema::table('t_course_student', function (Blueprint $table) {
               $table->dropColumn('total_amount');
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
        if (!Schema::hasColumn('t_course_student', 'total_amount')) {
            Schema::table('t_course_student', function (Blueprint $table) {
                $table->decimal('total_amount')->default(0);
            });
        }

        foreach (StudentPayment::where('is_initial', '1')->get() as $payment) {
            $student = CourseStudent::find($payment->courseStudentId);
            if ($student) {
                $student->totalAmount = $payment->amount;
                $student->save();
            }
        }

        StudentPayment::where('is_initial', '1')->delete();

        if (Schema::hasColumn('t_student_payment', 'is_initial')) {
            Schema::table('t_student_payment', function (Blueprint $table) {
                $table->dropColumn('is_initial');
            });
        }
    }
}
