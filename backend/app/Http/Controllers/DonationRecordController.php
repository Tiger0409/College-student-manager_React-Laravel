<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\DonationRecord;
use App\Models\ExtendedModel;
use App\Models\Log;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;

class DonationRecordController extends Controller
{
    public function getByUser(Request $request, $userId)
    {
        /**
         * @var User $user
         */
        if ($user = User::find($userId)) {
            $params = $request->all();
            $isReceived = 0;
            if (isset($params['isReceived']) && is_numeric($params['isReceived']))
                $isReceived = $params['isReceived'];

            $query = $user
                ->donationRecords()
                ->where('is_received', $isReceived);

            return DataFormatter::formatQueryResult($query, $params);
        }

        return null;
    }

    public function get(Request $request, $id)
    {
        return DataFormatter::formatSingleModel(DonationRecord::find($id), $request->all());
    }

    public function delete(Request $request)
    {
        $params = $request->all();
        if (isset($params['ids'])) {
            DonationRecord::whereIn('id', $params['ids'])->delete();
            return response()->json('', 204);
        }

        return response()->json('None of id was selected', 400);
    }

    public function edit(Request $request, $id)
    {
        if ($model = DonationRecord::find($id)) {
            $model->loadInput($request->all());
            $model->save();
            return response()->json('', 200);
        }

        return response()->json('Model was not found', 404);
    }

    /**
     * @param string $enumType
     * @return array|null
     */
    public function getEnumValues($enumType)
    {
        return DataFormatter::formatEnumValues(DonationRecord::getEnumValues($enumType));
    }

    public function create(Request $request)
    {
        $afterCreate = function (ExtendedModel $model) {
            Log::write(Log::ACTION_CREATE, Log::MODULE_DONATION, $model->getKey());
        };

        return $this->createModel(DonationRecord::className(), $request->all(), $afterCreate);
    }
}
