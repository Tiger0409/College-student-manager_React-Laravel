<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Website;

/**
 * Class GeneralSettings
 * @package App\Models
 * @property string $settingKey
 * @property string $settingGroup
 * @property string $settingLabel
 * @property string $settingType
 * @property mixed $settingValue
 * @property mixed $settingOptions
 * @property int $settingWeight
 */
class GeneralSetting extends ExtendedModel
{
    protected $table = 'general_settings';
    protected $primaryKey = 'setting_key';
    public $timestamps = false;

    public function getSettingValueAttribute()
    {
        if ($this->attributes['setting_type'] == 'password')
            return $this->attributes['setting_value'];
        else
            return unserialize($this->attributes['setting_value']);
    }

    public function setSettingValueAttribute($value)
    {
        if (!isset($value)) return;

        if ($this->attributes['setting_type'] == 'password')
            $this->attributes['setting_value'] = md5($value);
        else
            $this->attributes['setting_value'] = serialize($value);
    }

    public function getSettingOptionsAttribute()
    {
        return unserialize($this->attributes['setting_options']);
    }

    public function setSettingOptionsAttribute($value)
    {
        if (!isset($value)) return;
        $this->attributes['setting_options'] = serialize($value);
    }

    public static function getValue($key, $defaultValue = null)
    {

        $website = Website::active();
        $model = GeneralSetting::where('setting_key', $key)->first();

        $paypalEmailAddress = $website->payPal;

        if (!$model) {
            return $defaultValue;
        }

        if ($paypalEmailAddress != null && $key=="website_admin_email_address" && $key=="website_admin_name")
        {
            return $model->settingValue;
        }
        elseif ($key=="is_paypal_online")
        {
            return $model->settingValue;
        }
        elseif ($key=="paypal_email_address")
        {
            return  $paypalEmailAddress;
        }
        else{
            return $model->settingValue;
        }

    }

    public static function initCraftyClicksApiSettings()
    {
        if (!GeneralSetting::find('crafty_key')) {
            (new GeneralSetting([
                'setting_key' => 'crafty_key',
                'setting_group' => 'postcodeApi',
                'setting_label' => 'Crafty key',
                'setting_type' => 'text',
                'setting_value' => '503de-11b39-52260-01095',
                'setting_options' => 'false',
                'setting_weight' => '1'
            ]))->save();
        }

        if (!GeneralSetting::find('crafty_url')) {
            (new GeneralSetting([
                'setting_key' => 'crafty_url',
                'setting_group' => 'postcodeApi',
                'setting_label' => 'Crafty url',
                'setting_type' => 'text',
                'setting_value' => 'http://pcls1.craftyclicks.co.uk/xml/rapidaddress',
                'setting_options' => 'false',
                'setting_weight' => '0'
            ]))->save();
        }
    }
}
