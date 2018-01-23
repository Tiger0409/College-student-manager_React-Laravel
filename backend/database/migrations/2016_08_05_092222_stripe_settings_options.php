<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use App\Models\GeneralSetting;

class StripeSettingsOptions extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $settingsConfig = [
            [
                'settingKey'     => 'stripe_mode',
                'settingGroup'   => 'stripe',
                'settingLabel'   => 'Stripe Mode',
                'settingType'    => 'radio',
                'settingValue'   => 'test',
                'settingOptions' => ['live', 'test'],
                'settingWeight'  => 1
            ],
            [
                'settingKey'     => 'stripe_secret_key_live',
                'settingGroup'   => 'stripe',
                'settingLabel'   => 'Stripe Secret Key Live',
                'settingType'    => 'text',
                'settingValue'   => 'sk_live_RdC0Ips3re7rF26BYYpToFWm',
                'settingOptions' => false,
                'settingWeight'  => 2
            ],
            [
                'settingKey'     => 'stripe_secret_key_test',
                'settingGroup'   => 'stripe',
                'settingLabel'   => 'Stripe Secret Key Test',
                'settingType'    => 'text',
                'settingValue'   => 'sk_test_kJyd6x7inNLYcmCbi45CPGzd',
                'settingOptions' => false,
                'settingWeight'  => 3
            ],
            [
                'settingKey'     => 'stripe_public_key_live',
                'settingGroup'   => 'stripe',
                'settingLabel'   => 'Stripe Public Key Live',
                'settingType'    => 'text',
                'settingValue'   => 'pk_live_8oQT74wZDh4wMT0ByXJCLCcA',
                'settingOptions' => false,
                'settingWeight'  => 4
            ],
            [
                'settingKey'     => 'stripe_public_key_test',
                'settingGroup'   => 'stripe',
                'settingLabel'   => 'Stripe Secret Key Test',
                'settingType'    => 'text',
                'settingValue'   => 'pk_test_hBwrF4bmq7Aw41s5aMWRQEwr',
                'settingOptions' => false,
                'settingWeight'  => 5
            ],
        ];

        $saved = [];
        foreach ($settingsConfig as $config) {
            $setting = new GeneralSetting($config);
            if ($setting->save()) {
                $saved[] = $setting;
            } else {
                foreach ($saved as $model) {
                    $model->delete();
                }

                ob_start();
                print_r($config);
                $configStr = ob_get_clean();

                throw new Exception("Failed to create setting. config used : \n $configStr");
                break;
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        GeneralSetting::whereIn('setting_key', [
            'stripe_mode',
            'stripe_secret_key_live',
            'stripe_secret_key_test',
            'stripe_public_key_live',
            'stripe_public_key_test'
        ])->delete();
    }
}
