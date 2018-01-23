<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\GeneralSetting;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class SettingsController extends Controller
{
    public function getSettingsByGroup($group)
    {
        return response()->json(
            DataFormatter::modelsToArrays(GeneralSetting::where('setting_group', $group)->get())
        );
    }

    public function getSettings(Request $request)
    {
        $params = $request->all();
        $groups = $params['groups'];
        $models = GeneralSetting::whereIn('setting_group', $groups)->get();

        return response()->json(DataFormatter::modelsToArrays($models));
    }

    public function getStripePublicKey()
    {
        $settings = function ($key) { return GeneralSetting::getValue($key, ''); };
        return $settings('stripe_public_key_' . $settings('stripe_mode'));
    }

    public function editSettings(Request $request)
    {
        $params = $request->all();

        if (!isset($params['settingsInputs'])) {
            return response()->json('No settings inputs sended', 400);
        }

        $settingsInputs = $params['settingsInputs'];

        $errors = [];
        $models = [];
        foreach ($settingsInputs as $input) {
            $settingModel = GeneralSetting::where('setting_key', $input['settingKey'])->first();
            if ($settingModel) {
                $settingModel->loadInput($input);
                $models[] = $settingModel;
            } else {
                $errors[] = 'Uknown setting with key ' . $input['settingKey'];
                continue;
            }
        }

        if (!empty($errors)) {
            return response()->json($errors, 404);
        }

        foreach ($models as $model) {
            $model->save();
        }

        return response()->json();
    }

    public function getAllowedPaymentMethods()
    {
        return response()->json(GeneralSetting::query()
            ->whereIn('setting_key', ['is_stripe_online', 'is_paypal_online'])
            ->where('setting_value', serialize('yes'))
            ->get()
            ->map(function (GeneralSetting $setting) { return $setting->settingGroup; })
        );
    }
}
