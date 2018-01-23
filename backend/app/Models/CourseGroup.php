<?php

namespace App\Models;

/**
 * Class CourseGroup
 * @package App\Models
 * @property int $id
 * @property string $name
 * @property int $weight
 * relations
 * @property Course[] $courses
 */
class CourseGroup extends ExtendedModel
{
    protected $table = 't_course_group';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function courses()
    {
        return $this->hasMany('App\\Models\\Course', 'course_group_id');
    }

    /**
     * @param CourseGroup $groupA
     * @param CourseGroup $groupB
     * @return bool
     */
    public static function swap($groupA, $groupB)
    {
        if ($groupA === null || $groupB === null) return false;

        $tempWeight = $groupA->weight;
        $groupA->weight = $groupB->weight;
        $groupB->weight = $tempWeight;
        return $groupA->save() && $groupB->save();
    }
}
