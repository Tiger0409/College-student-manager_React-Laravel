<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Models\HearPlace;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HearPlaceController extends Controller
{
    public function index()
    {
        return response()->json(DataFormatter::modelsToArrays(HearPlace::all()));
    }

    public function getList()
    {
        $output = [];

        foreach (HearPlace::all() as $item) {
            $output[] = [
                'label'     => $item->placeName,
                'value'     => $item->id,
                'isVisible' => boolval($item->isVisible)
            ];
        }

        $output[] = [
            'label'     => 'Other',
            'value'     => -1,
            'isVisible' => true
        ];

        return $output;
    }

    public function update(Request $request)
    {
        $params = $request->all();
        if (HearPlace::updateCollection($params['data'])) {
            return response()->json('', 200);
        }

        return response()->json('Model update error', 500);
    }

    public function getInfo(Request $request)
    {
        $query = DB::table('t_user as u');
        $query->leftJoin('hear_places as hp', 'hp.id', '=', 'u.hear_place_id');

        if ($request->has('beginDate') && $request->has('endDate')) {
            $beginDate = $request->get('beginDate');
            $endDate = $request->get('endDate');
            $query->where('u.user_create_time', '>', $beginDate);
            $query->where('u.user_create_time', '<', $endDate);
        }

        $query->whereNotNull('u.hear_place_id');
        $query->groupBy('hp.id');

        $query->select([DB::Raw('count(u.id) as count'), 'hp.place_name as placeName']);

        return response()->json($query->get());
    }
}