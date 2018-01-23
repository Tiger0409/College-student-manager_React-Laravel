<?php

namespace App\Models;

/**
 * Class CourseClassGroup
 * @package App\Models
 * @property int $id
 * @property string $name
 * @property int $weight
 * relations
 * @property CourseClass[] $courseClasses
 */
class CourseClassGroup extends ExtendedModel
{
    protected $table = 't_class_group';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function courseClasses()
    {
        return $this->hasMany('App\\Models\\CourseGroup', 'class_group_id');
    }
}
