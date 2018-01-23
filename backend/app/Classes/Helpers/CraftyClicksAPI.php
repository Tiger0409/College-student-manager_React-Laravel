<?php
/**
 * Created by PhpStorm.
 * User: dev54
 * Date: 31.05.16
 * Time: 11:55
 */

namespace App\Classes\Helpers;


use App\Models\GeneralSetting;

class CraftyClicksAPI
{
    public static function search($postcode, $responseStyle = 'data_formatted')
    {
        if (empty($postcode)) {
            return null;
        }
        
        $craftyKey = GeneralSetting::getValue('crafty_key', '');
        $craftyUrl = GeneralSetting::getValue('crafty_url', '');

        $craftyUrl = $craftyUrl.'?key='.$craftyKey.'&postcode='.$postcode.'&response='.$responseStyle;
        $craftyUrl .= '&lines=3';

        //$xmlString = file_get_contents("$craftyUrl");
        //$craftyXmlData = simplexml_load_string($xmlString);
        $craftyXmlData = simplexml_load_file($craftyUrl);

        $craftyResult = $craftyXmlData->address_data_formatted;
        if (empty($craftyResult)) {
            return null;
        }

        $craftyXmlResponse['town'] = $craftyResult->town;
        $craftyXmlResponse['postalCounty'] = $craftyResult->postal_county;
        $craftyXmlResponse['traditionalCounty'] = $craftyResult->traditional_county;
        $craftyXmlResponse['postcode'] = $craftyResult->postcode;
        foreach ($craftyResult->delivery_point as $del_point) {
            $craftyXmlResponse['line1'][] = $del_point->line_1;
            $craftyXmlResponse['line2'][] = $del_point->line_2;
        }

        return json_encode($craftyXmlResponse);
    }
}