<?php

namespace App\Http\Controllers;

use App\Models\DonationType;
use Illuminate\Http\JsonResponse;

class DonationTypeController extends Controller
{
    /**
     * @return JsonResponse
     */
    public function getList()
    {
        $donationTypes = DonationType::get(['id', 'type']);
        $output = [];
        foreach ($donationTypes as $item) {
            $output[] = [
                'value' => $item->id,
                'label' => $item->type
            ];
        }

        return response()->json($output);
    }
}