<?php

namespace App\Http\Controllers;

use App\Classes\Helpers\ArrayHelper;
use App\Classes\Helpers\DataFormatter;
use App\Classes\Helpers\MigrationHelper;
use App\Classes\Helpers\StringHelper;
use App\Classes\QueryFilters;
use App\Http\Requests;
use App\Models\Bank;
use App\Models\BranchAssociated;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Course;
use App\Models\CourseClass;
use App\Models\CourseStudent;
use App\Models\Donation;
use App\Models\DonationRecord;
use App\Models\ExtendedModel;
use App\Models\GeneralSetting;
use App\Models\Instalment;
use App\Models\Log;
use App\Models\Loggings;
use App\Models\Profile;
use App\Models\Role;
use App\Models\TeacherPayment;
use App\Models\Term;
use App\Models\User;
use App\Models\Website;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Database\Migrations\Migration;

class TestController extends Controller
{
    const MODULE_Website = 'test';

    public function run(Request $request)
    {
        /** @var Cart[] $wrongCarts */
        /*$wrongCarts = Cart::where('full_details', 'like', 's%')->get();

        foreach ($wrongCarts as $cart) {
            $fullDetails = $wrongCarts[0]->getAttributes()['full_details'];
            preg_match('/a:\d+:{.*}/', $fullDetails, $matches);

            if (count($matches) === 0 || $matches[0] == '') {
                continue;
            }

            $array_str = $matches[0];
            $array_str = str_replace("\\", '', $array_str);
            $cart->fullDetails = unserialize($array_str);
            $cart->save();
        }

        print_r('done');*/



        //print_r(substr($array_str, 850, 200));


        //print_r(unserialize(unserialize($fullDetails)));



        /*$query = DB::table('t_course_student');
        $query->select([
            'id',
            'student_id as st_id',
            DB::raw('count(student_id) samples')
        ]);
        $query->whereMonth('register_date', '>=', '7');
        $query->groupBy(['student_id', 'class_id']);
        $query->having('samples', '>', '1');
        $records = $query->get();

        $studentIds = array_map(function ($record) { return $record->id; },  $records);
        DB::table('t_course_student')->whereIn('id', $studentIds)->delete();

        return count($query->get());*/

        /*$carts = Cart::where(['cart_status' => 'open'])
            ->whereMonth('last_update', '>=', '7')
            ->whereYear('last_update', '=', '2016')
            ->get();*/

        /** @var Cart $cart */
        /*foreach ($carts as $cart) {
            $cart->submitCartItems();
        }*/
    }

    public function emptyAction() {
        return response()->json();
    }

    public static function printAssocArray($assocArray, $indent = 0)
    {
        $output = '';
        $tabs = str_repeat('&nbsp', $indent * 4);
        foreach ($assocArray as $key => $value) {
            if (is_array($value)) {
                $output .= $tabs . $key . ' => <br/>' . TestController::printAssocArray($value, $indent + 2) . '<br/>';
            } else {
                $output .= $tabs . $key . ' => ' . $value . '<br/>';
            }
        }

        return $output;
    }
}
