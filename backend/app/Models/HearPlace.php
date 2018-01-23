<?php

namespace App\Models;

/**
 * Class HearPlace
 * @package App\Models
 * @property string $placeName
 * @property bool   $isVisible
 * relations
 * @property User   $user
 */
class HearPlace extends ExtendedModel
{
    protected $table = 'hear_places';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function users()
    {
        return $this->hasMany('App\\Models\\User');
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) {
            return false;
        }

        $this->attributes['is_visible'] = filter_var($this->attributes['is_visible'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;

        return true;
    }



}