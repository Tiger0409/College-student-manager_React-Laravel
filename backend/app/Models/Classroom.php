<?php

namespace App\Models;

/**
 * Class Classroom
 * @package App\Models
 * @property int $id
 * @property int $branchId
 * @property string $branchName
 * @property string $classroomName
 * @property string $createdAt
 * @property string $updatedAt
 * relations
 * @property CourseClasses[] $courseClasses
 * @property BranchAssociated $branch
 */
class Classroom extends ExtendedModel
{
    protected $table = 'classrooms';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function courseClasses()
    {
        return $this->hasMany('App\\Models\\CourseClass', 'classroom_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function branch()
    {
        return $this->belongsTo('App\\Models\\BranchAssociated', 'branch_id');
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) return false;

        $branch = BranchAssociated::find($this->branchId);
        if (!$branch) return false;
        $this->branchName = $branch->branchName;

        return true;
    }
}
