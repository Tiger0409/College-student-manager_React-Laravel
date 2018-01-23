<?php

namespace App\Http\Controllers;

use App\Models\Log;
use App\Models\TeacherPayment;
use Illuminate\Http\Request;

class TeacherPaymentController extends Controller
{
    public function create(Request $request)
    {
        $afterCreate = function ($model) {
            Log::write(Log::ACTION_CREATE, Log::MODULE_TEACHER_PAYMENT, $model->id);
        };

        return $this->createModel(TeacherPayment::className(), $request->all(), $afterCreate);
    }
    
    public function delete(Request $request)
    {
        $this->deleteModels(TeacherPayment::className(), $request->all());
    }
    
    public function edit(Request $request, $id)
    {
        $afterEdit = function ($model) {
            Log::write(Log::ACTION_UPDATE, Log::MODULE_TEACHER_PAYMENT, $model->id);
        };

        return $this->editModel(
            TeacherPayment::className(),
            $request->all(),
            $id,
            ['saveRelations' => false],
            $afterEdit
        );
    }
}