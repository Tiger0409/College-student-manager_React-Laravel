<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Term
 * @package App\Models
 * @property int $id
 * @property string $name
 * @property string $term
 * @property string $year
 * @property string $fullTimeDescription
 * @property string $partTimeDescription
 * @property bool $isActive
 * relations
 * @property CourseClass[] $courseClasses
 * @property DonationRecord[] $donationRecords
 * @property BranchAssociated[] $branchAssociated
 */
class Term extends ExtendedModel
{
    protected $table = 't_term';

    protected $attributes = [
        'part_time_description' => '',
        'full_time_description' => '',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function courseClasses()
    {
        return $this->hasMany('App\\Models\\CourseClass', 'course_class_term_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function donationRecords()
    {
        return $this->hasMany('App\\Models\\DonationRecord', 'donation_term_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function branchesAssociated()
    {
        return $this->belongsToMany('App\\Models\\BranchAssociated', 't_branches_assoc_term');
    }

    /**
     * @return Term|null
     */
    public static function activeTerm()
    {
        return Term::findOrFail(Website::active()->activeTermId);
    }

    public static function setActiveTerm($id)
    {
        $website = Website::active();
        return $website->update(['active_term_id' => $id]);
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) {
            return false;
        }

        /*if (empty($this->getAttribute('is_active'))) {
            $this->setAttribute('is_active', false);
        }*/

        return true;
    }
}
