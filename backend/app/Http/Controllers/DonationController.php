<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\DataFormatter;
use App\Classes\Helpers\PaymentHelper;
use App\Classes\Libraries\Paypal;
use App\Models\Donation;
use App\Models\DonationRecord;
use App\Models\GeneralSetting;
use App\Models\PaypalTransaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests;
use App\Http\Controllers\Controller;

class DonationController extends Controller
{
    public function index(Request $request)
    {
        return DataFormatter::formatQueryResult(
            Donation::with('donationRecords'),
            $request->all()
        );
    }

    public function get(Request $request, $id)
    {
        return DataFormatter::formatSingleModel(Donation::find($id), $request->all());
    }

    public function getByUser(Request $request, $userId)
    {
        /**
         * @var User $user
         */
        if ($user = User::find($userId)) {
            $params = $request->all();
            $query = $user->donations();
            if (isset($params['created']) && $params['created'] === '1') {
                $query = $query->where('pledge_owner_id', $user->id);
            }

            return DataFormatter::formatQueryResult($query, $params);
        }

        return response()->json('', 404);
    }

    public function delete(Request $request)
    {
        $params = $request->all();
        if (isset($params['ids'])) {
            Donation::whereIn('id', $params['ids'])->delete();
            return response()->json('', 204);
        }

        return response()->json('None of id was selected', 400);
    }

    public function edit(Request $request, $donationId)
    {
        /**
         * @var Donation $donation
         */
        $donation = Donation::find($donationId);
        if ($donation) {
            $donation->loadInput($request->all());
            $donation->save();
            return response()->json('ok', 200);
        }

        return response()->json('', 404);
    }

    public function create(Request $request)
    {
        $donation = new Donation($request->all());
        if (!$donation->save()) {
            return response()->json('', 500);
        }

        return response()->json($donation->asArray());
    }

    public function getPaymentMethods()
    {
        return DataFormatter::formatEnumValues(Donation::getEnumValues('payment-method-enum'));
    }

    public function checkout(Request $request)
    {
        return PaymentHelper::processDonation($request->all());
    }
}
