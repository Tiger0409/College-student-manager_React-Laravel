<?php

namespace App\Models;

/**
 * Class Branch
 * @package App\Models
 * @property int $id
 * @property string $name
 * @property string $branchName
 * @property string $createdTime
 * relations
 * @property BranchAssociated[] branchesAssociated
 * @property Website[] $websites
 */
class Branch extends ExtendedModel
{
    protected $table = 't_branches';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function branchesAssociated()
    {
        return $this->hasMany('App\\Models\\BranchAssociated', 'city_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function websites()
    {
        return $this->hasMany('App\\Models\\Website', 'city_id');
    }
}
