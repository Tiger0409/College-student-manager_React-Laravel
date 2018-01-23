<?php

namespace App\Models;

use App\Classes\Helpers\DataFormatter;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Website
 * @package App\Models
 * @property int $id
 * @property string $name
 * @property int $cityId
 * @property string $slug
 * @property string $folder
 * @property string $header
 * @property string $footer
 * @property string $toc
 * @property string $coursePrintoutTemplate
 * @property string branchId
 * @property int    $activeTermId
 * @property string $paymentHeading
 * @property string $paymentField1
 * @property string $paymentField2
 * @property string $payPal
 * relations
 * @property BranchAssociated[] $branchesAssociated
 */
class Website extends ExtendedModel
{
    protected $table = 'websites';
    protected $fillable = ['active_term_id'];

    public function getBranchesAssociatedAttribute()
    {
        $ids = explode('_', $this->attributes['branch_id']);
        $models = BranchAssociated::find($ids);
        return $models;
    }

    public function setBranchesAssociatedAttribute(array $value)
    {
        $keys = array_keys($value);
        $ids = [];
        for ($i = 0; $i < count($keys); $i++) {
            $item = $value[$keys[$i]];
            if (is_array($item)) {
                if (isset($item['id'])) {
                    $ids[] = $item['id'];
                }
            } else {
                $ids[] = $item;
            }
        }

        $this->setAttribute('branch_id', implode('_', $ids));
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function city()
    {
        return $this->belongsTo('App\\Models\\Branch', 'city_id');
    }

    public function getTermsAttribute()
    {
        $ids = explode('_', $this->attributes['terms']);
        $models = Term::find($ids);
        return DataFormatter::modelsToArrays($models);
    }

    /**
     * @return self
     */
    public static function active()
    {
        return Website::findOrFail(config('website.id'));
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) return false;

        if (empty($this->attributes['active_term_id'])) {
            $this->activeTermId = Term::query()->firstOrFail()->id;
        }

        return true;
    }


}