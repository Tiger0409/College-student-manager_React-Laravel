<?php

namespace App\Models;

/**
 * Class ComplaintType
 * @package App\Models
 * @property int    $id
 * @property string $name
 * relations
 * @property Complaint[] $complaints
 */
class ComplaintType extends ExtendedModel
{
    protected $table = 'complaint_types';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function complaints()
    {
        return $this->belongsToMany('App\\Models\\Complaint', 'complaints_types', 'type_id', 'complaint_id');
    }
}
