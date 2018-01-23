<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Dept
 * @package App\Models
 * @property int $id
 * @property string $deptName
 * @property int $deptBranchId
 * @property int $weight
 * @property string $branchIdAssociate
 * relations
 * @property Course[] $courses
 * @property BranchAssociated $branchAssociated
 */
class Dept extends ExtendedModel
{
    protected $table = 't_dept';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function courses()
    {
        return $this->hasMany('App\\Models\\Course');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function branchAssociated()
    {
        return $this->belongsTo('App\\Models\\BranchAssociated', 'dept_branch_id');
    }

    /**
     * @return int
     */
    public function getCoursesCountAttribute()
    {
        return $this->courses()->count();
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) return false;

        $deptBranch = BranchAssociated::find($this->deptBranchId);
        if (!$deptBranch) return false;
        $this->branchIdAssociate = $deptBranch->branchName;

        return true;
    }
}
