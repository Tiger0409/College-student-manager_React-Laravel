<?php

namespace App\Models;

/**
 * Class ClassWork
 * @package App\Models
 * @property string $date
 * @property string $doneWork
 * @property string $homeWork
 * relations
 * @property CourseClass $courseClass
 */
class ClassWork extends ExtendedModel
{
    protected $table = 't_class_work';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function courseClass()
    {
        return $this->belongsTo('App\\Models\\CourseClass', 'course_class_id');
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) {
            return false;
        }

        if (empty($this->__get('doneWork'))) {
            $this->doneWork = '';
        }

        if (empty($this->__get('homeWork'))) {
            $this->homeWork = '';
        }

        return true;
    }


}