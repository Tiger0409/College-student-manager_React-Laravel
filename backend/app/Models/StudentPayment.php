<?php

namespace App\Models;

/**
 * Class StudentPayment
 * @package App\Models
 * @property int $id
 * @property int $courseStudentId
 * @property int $instalmentId
 * @property string $date
 * @property int $amount
 * @property string $staff
 * relations
 * @property CourseStudent $student
 * @property Instalment $instalment
 */
class StudentPayment extends ExtendedModel
{
    protected $table = 't_student_payment';
    protected $attributes = [
        'instalment_id'  => 0,
        'staff'          => '',
        'received_by'    => '',
        'payment_method' => 'cash',
        'is_initial'     => 0
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function student()
    {
        return $this->belongsTo('App\\Models\\CourseStudent', 'course_student_id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function studentDeleted()
    {
        return $this->belongsTo('App\\Models\\CourseStudentDeleted', 'course_student_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function instalment()
    {
        return $this->belongsTo('App\\Models\\Instalment', 'instalment_id');
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) return false;

        if (empty($this->date)) {
            $this->date = date("Y-m-d H:i:s");
        }

        $updated = count($this->getDirty()) > 0 || !$this->id;

        if ($updated) {
            Log::write(
                $this->id ? Log::ACTION_UPDATE : Log::ACTION_CREATE,
                Log::MODULE_STUDENT_PAYMENT,
                $this->id ? $this->id : 'new',
                '', [
                'staff' => $this->staff,
                'received by' => $this->receivedBy,
                'amount' => $this->amount,
                'payment method' => $this->paymentMethod,
                'student' => $this->student ? $this->student->user->userFullname : '',
                'studentId' => $this->student->id,
                'userId' => $this->student->studentId
            ]);
        }

        return true;
    }

    public function delete()
    {
        Log::write(
            Log::ACTION_DELETE,
            Log::MODULE_STUDENT_PAYMENT,
            $this->id,
            '', [
            'staff' => $this->staff,
            'received by' => $this->receivedBy,
            'amount' => $this->amount,
            'payment method' => $this->paymentMethod,
            'student' => $this->student ? $this->student->user->userFullname : '',
            'studentId' => $this->student->id,
            'userId' => $this->student->studentId
        ]);

        return parent::delete();
    }


}
