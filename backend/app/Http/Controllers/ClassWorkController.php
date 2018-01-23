<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\ClassWork;

class ClassWorkController extends Controller
{
    public function getByClass($classId)
    {
        return DataFormatter::formatQueryResult(ClassWork::where('course_class_id', $classId));
    }
}