<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class BranchAssociated
 * @package App\Models
 * @property int    $id
 * @property string $branchName
 * @property int    $branchWeight
 * @property string $createdTime
 * @property string $invoiceEmailTemplate
 * @property string $printReceiptTemplate
 * @property string $isListed
 * relations
 * @property Dept[]    $depts
 * @property Branch    $branch
 * @property Term[]    $terms
 * @property Website[] $websites
 * @property User[]    $closestUsers
 */
class BranchAssociated extends ExtendedModel
{
    protected $table = 't_branches_associated';

    protected $attributes = ['branch_weight' => 0];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function depts()
    {
        return $this->hasMany('App\\Models\\Dept', 'dept_branch_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function branch()
    {
        return $this->belongsTo('App\\Models\\Branch', 'city_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function terms()
    {
        return $this->belongsToMany('App\\Models\\Term', 't_branches_assoc_terms')
            ->wherePivot('website_id', Website::active()->id);
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function closestUsers()
    {
        return $this->belongsToMany('App\Models\User', 't_user_closest_branches', 'branch_associated_id', 'user_id');
    }

    public function getWebsitesAttribute()
    {
        $relatedWebsites = [];

        foreach (Website::all() as $website) {
            $branchIds = explode('_', $website->branchId);
            if (in_array($this->id, $branchIds)) {
                $relatedWebsites[] = $website;
            }
        }

        return $relatedWebsites;
    }

    public function setTermsAttribute($value)
    {
        return true;
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) {
            return false;
        }

        if (!$this->__get('created_time')) {
            $this->setAttribute('created_time', date('Y-m-d H:i:s', time()));
        }

        $this->attributes['is_listed'] = filter_var($this->attributes['is_listed'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;

        return true;
    }
}
