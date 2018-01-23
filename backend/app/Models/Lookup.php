<?php

namespace App\Models;

/**
 * Class Lookup
 * @package App\Models
 * @property string $name
 * @property int $code
 * @property string $type
 * @property int weight
 */
class Lookup extends ExtendedModel
{
    protected $table = 't_lookup';

    const TYPE_ATTENDANCE_LEVEL = 'AttendanceLevel';
    const TYPE_FEEDBACK_LEVEL = 'FeedbackLevel';
    const TYPE_TEACHER_STATUS = 'TeacherStatus';

    const ATTENDANCE_CODE_PERFECT = 1;
    const ATTENDANCE_CODE_MEDIUM = 2;
    const ATTENDANCE_CODE_POOR = 3;

    /**
     * @param string $type
     * @return array
     */
    public static function getItems($type)
    {
        $type = str_replace('-', '', ucwords($type, '-'));

        $data = [];
        $models = Lookup::where('type', $type)->get();
        foreach ($models as $model)
            $data[] = ['label' => lcfirst($model->name), 'value' => $model->code];
        return $data;
    }
}
