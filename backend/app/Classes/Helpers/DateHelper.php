<?php
/**
 * Created by PhpStorm.
 * User: dev54
 * Date: 27.04.16
 * Time: 11:26
 */

namespace App\Classes\Helpers;


class DateHelper
{
    /**
     * @param array $map
     * @param string $subject
     * @return int[]|null
     */
    public static function stringToNumbers($map, $subject)
    {
        $mapKeys = array_keys($map);
        $pattern = '/(' . implode('|', $mapKeys) . ')\w*/i';

        $matches = [];
        preg_match_all($pattern, $subject, $matches);

        if (count($matches) < 2) {
            return null;
        }

        $numbers = [];
        foreach ($matches[1] as $foundKey) {
            $numbers[] = $map[strtolower($foundKey)];
        }

        return $numbers;
    }

    /**
     * @param string $subject
     * @return int[]|null
     */
    public static function extractMonths($subject)
    {
        $monthToNumber = [
            'jan' => 1,
            'feb' => 2,
            'mar' => 3,
            'apr' => 4,
            'may' => 5,
            'jun' => 6,
            'jul' => 7,
            'aug' => 8,
            'sep' => 9,
            'oct' => 10,
            'nov' => 11,
            'dec' => 12
        ];

        return DateHelper::stringToNumbers($monthToNumber, $subject);
    }

    /**
     * @param $subject
     * @return int[]|null
     */
    public static function extractDays($subject)
    {
        $dayToNumber = [
            'mon' => 1,
            'tue' => 2,
            'wed' => 3,
            'thu' => 4,
            'fri' => 5,
            'sat' => 6,
            'sun' => 7
        ];

        return DateHelper::stringToNumbers($dayToNumber, $subject);
    }

    /**
     * @param string $subject
     * @return array|null
     */
    public static function extractYears($subject)
    {
        preg_match_all('/[0-9]{4}/', $subject, $matches);

        if (count($matches) === 0) {
            return null;
        }

        $years = [];
        foreach ($matches[0] as $year) {
            $years[] = $year;
        }

        return $years;
    }

    public static function mysqlToUnix($time = '')
    {
        // We'll remove certain characters for backward compatibility
        // since the formatting changed with MySQL 4.1
        // YYYY-MM-DD HH:MM:SS

        $time = str_replace('-', '', $time);
        $time = str_replace(':', '', $time);
        $time = str_replace(' ', '', $time);

        // YYYYMMDDHHMMSS
        return  mktime(
            substr($time, 8, 2),
            substr($time, 10, 2),
            substr($time, 12, 2),
            substr($time, 4, 2),
            substr($time, 6, 2),
            substr($time, 0, 4)
        );
    }

    public static function convertToAge($birthDate)
    {
        $birthDate = preg_replace('/[^0-9]+/', '-', $birthDate);
        if (!strtotime($birthDate)) return $birthDate;

        $date = new \DateTime($birthDate);
        $now = new \DateTime();

        return $now->diff($date)->y;
    }

    /**
     * @param string $date
     * @param string $format
     * @return string
     */
    public static function toSqlFormat($date, $format = 'd/m/Y')
    {
        $date = \DateTime::createFromFormat($format, $date);
        return $date->format('Y-m-d');
    }

    public static function dateConvertor($date,$convertTo,$format = 'd-m-Y')
    {
        $return = null;
        switch ($convertTo){
            case 'toMysql':
                $date = \DateTime::createFromFormat($format, $date);
                $return =  $date->format('Y-m-d');
                break;
            case 'toDate':
                $date = \DateTime::createFromFormat($format, $date);
                $return =  $date->format('d-m-Y');
                break;
        }
        return $return;
    }
}