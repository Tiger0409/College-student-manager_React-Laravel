<?php

namespace App\Models;
use App\Classes\Helpers\ArrayHelper;
use App\Classes\Helpers\EmailHelper;
use Doctrine\DBAL\Driver\AbstractDriverException;
use Illuminate\Support\Facades\DB;

/**
 * Class Cart
 * @package App\Models
 * @property int    $id
 * @property int    $studentId
 * @property string $cartStatus
 * @property string $paymentStatus
 * @property float  $totalCalculatedPrice
 * @property strig  $invoiceNo
 * relations
 * @property User              $user
 * @property CartItem[]        $cartItems
 * @property CourseStudent[]   $students
 * @property StripeTransaction $stripeTransaction
 */
class Cart extends ExtendedModel
{
    protected $table = 'cart';

    protected $attributes = [
        'cart_status'            => 'open',
        'total_calculated_price' => 0,
        'total_discount'         => 0,
        'total_payment'          => 0,
        'invoice_no'             => '',
        'mc_gross'               => 0,
        'mc_currency'            => '',
        'payment_date'           => '',
        'payment_status'         => '',
        'pending_reason'         => '',
        'payment_type'           => '',
        'verify_sign'            => '',
        'txn_id'                 => '',
        'payer_email'            => '',
        'payer_id'               => '',
        'payer_status'           => '',
        'receiver_id'            => '6SLGG67SEBFNE',
        'current_offer'          => 'none',
        'total_with_surcharge'   => 0
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('App\\Models\\User', 'student_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function cartItems()
    {
        return $this->hasMany('App\\Models\\CartItem');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function stripeTransaction()
    {
        return $this->hasOne('App\\Models\\StripeTransaction');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function students()
    {
        return $this->hasMany('App\\Models\\CourseStudent', 'invoice_id', 'invoice_no');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function studentsDeleted()
    {
        return $this->hasMany('App\\Models\\CourseStudentDeleted', 'invoice_id', 'invoice_no');
    }

    public function getStudentNameAttribute()
    {
        return $this->user->userFullname;
    }

    public function getFullDetailsAttribute()
    {
        return ArrayHelper::underscoreKeysToCamelCase(unserialize($this->attributes['full_details']));
    }

    public function setFullDetailsAttribute($value)
    {
        if (!is_string($value)) {
            $value = serialize($value);
        }

        $this->attributes['full_details'] = $value;
    }

    public function getTotalCalculatedPriceAttribute()
    {
        return floatval($this->attributes['total_calculated_price']);
    }

    public function beforeSave()
    {
        if (!parent::beforeSave()) {
            return false;
        }

        if (empty($this->attributes['last_update'])) {
            $this->attributes['last_update'] = date('Y-m-d H:i:s', time());
        }

        if (empty($this->attributes['receiver_email'])) {
            $this->attributes['receiver_email'] = GeneralSetting::getValue(
                'paypal_email_address',
                'summerdawrah@tayyibun.com'
            );
        }

        return true;
    }

    public function submitCartItems($options = null, $paypal = null)
    {
        $notificationEmail = GeneralSetting::getValue('paypal_ipn_notification', 'itdawah@gmail.com');
        $notificationSubject = 'Instant Payment Notification - Recieved Payment for Register Tayyibun Online';

        $updateCartResult = false;
        $insertResult = false;
        if ($this->cartStatus == 'open') {
            //update status
            $data = [];

            if ($paypal) {
                $data = $paypal->ipn_data;
                if (isset($paypal->ipn_data['payer_email'])) {
                    $options['receivedBy'] = $paypal->ipn_data['payer_email'];
                }

                $data['full_details'] = serialize($paypal->ipn_data);
            }

            $data['cart_status'] = 'processed';
            $data['payment_status'] = 'Completed';

            $this->loadInput($data);
            $updateCartResult = $this->save();
            if ($updateCartResult) {
                $insertResult = CourseStudent::insertFromCart($this, $options);
            }
        }

        $subject = $notificationSubject;
        $to = $notificationEmail;
        $body  =  "An instant payment notification was successfully recieved\n";
        if ($paypal) {
            $body .= "from ".$paypal->ipn_data['payer_email']." on ".date('m/d/Y');
            $body .= " at " . date('g:i A')."\n\nDetails:\n";

            foreach ($paypal->ipn_data as $key => $value) {
                $body .= "\n$key: $value";
            }
        }
        $body .= " Updating data in the cart table result = ".($updateCartResult?'Success':'Failed')."\n";
        $body .= " Insert data into course student table result = ".($insertResult?'Success':'Failed')."\n";

        try {
            EmailHelper::sendEmail($to, $subject, $body);
        } catch (\Exception $e) {}

        return $insertResult;
    }

    public function recalculatePrice()
    {
        if ($this->cartStatus !== 'open') {
            return false;
        }

        $data = [
            'totalCalculatedPrice' => 0,
            'totalWithSurcharge'   => 0,
            'totalDiscount'        => 0,
            'currentOffer'         => 'none',
            'lastUpdate'           => time()
        ];


        $updatePrices = function ($calculatedPrice, $priceWithSurcharge, $isFree, $cartItem) use (&$data) {
            $cartItem->isFree = $isFree;

            if ($isFree || $cartItem->originalStudentStatus != 'reduced') {
                $cartItem->calculatedPrice = $calculatedPrice;
                $cartItem->priceWithSurcharge = $priceWithSurcharge;
            }

            if ($isFree) {
                $cartItem->studentStatus = 'reduced';
            } else {
                $cartItem->studentStatus = $cartItem->originalStudentStatus;
            }

            $cartItem->save();

            $data['totalCalculatedPrice'] += $calculatedPrice * $cartItem->ticketNumber;
            $data['totalWithSurcharge'] += $priceWithSurcharge * $cartItem->ticketNumber;
        };
        $cartItems = $this->cartItems;
        $cartItemsCount = count($cartItems);

        $paypalSurchargeAmount = floatval(GeneralSetting::getValue('paypal_surcharge_amount', 3.0));
        $minDiscountNum = intval(GeneralSetting::getValue('min_discount_num', 3));
        $discountAmount = floatval(GeneralSetting::getValue('discount_amount', 10));
        $minFreeNum = intval(GeneralSetting::getValue('min_free_num', 5));
        //$freeCourseAmount = intval(GeneralSetting::getValue('free_course_amount', 1));

        $pricesUpdatePool = [];
        if ($cartItemsCount >= $minFreeNum) {
            $cheapestCourseId = 0;
            $cheapestPrice = PHP_INT_MAX;

            foreach ($cartItems as $index => $cartItem) {
                if ($cartItem->calculatedPrice < $cheapestPrice) {
                    $cheapestPrice = $cartItem->calculatedPrice;
                    $cheapestCourseId = $index;
                }

                $price = $cartItem->calculatedPrice;
                if ($price > 0) $price += $paypalSurchargeAmount;

                $pricesUpdatePool[$index] = [$cartItem->calculatedPrice, $price, 0, $cartItem];
            }

            $pricesUpdatePool[$cheapestCourseId] = [0, 0, 1, $cartItems[$cheapestCourseId]];

            foreach ($pricesUpdatePool as $args) {
                $updatePrices(...$args);
            }

            $data['currentOffer'] = 'free_course';
        } elseif ($cartItemsCount < $minFreeNum && $cartItemsCount >= $minDiscountNum) {
            foreach ($cartItems as $cartItem) {
                $calculatedPrice = $cartItem->calculatedPrice;

                $discount = $calculatedPrice * $discountAmount / 100.0;
                $data['total_discount'] += $discount;
                $calculatedPrice -= $discount;
                $priceWithSurcharge = $calculatedPrice > 0 ?
                    $calculatedPrice + $paypalSurchargeAmount : 0;

                $updatePrices($calculatedPrice, $priceWithSurcharge, 0, $cartItem);
            }

            $data['currentOffer'] = 'discount';
        } else {
            foreach ($cartItems as $cartItem) {
                $studentStatus = $cartItem->originalStudentStatus;
                if (empty($studentStatus)) {
                    $studentStatus->originalStudentStatus = 'employed';
                }

                if ($studentStatus == 'employed') {
                    $calculatedPrice = $cartItem->courseClass->feeForEmployed >= 0 ?
                        $cartItem->courseClass->feeForEmployed : $cartItem->courseClass->course->feeForEmployed;
                } else {
                    $calculatedPrice = $cartItem->courseClass->feeForUnemployed >= 0 ?
                        $cartItem->courseClass->feeForUnemployed : $cartItem->courseClass->course->feeForUnemployed;
                }

                $priceWithSurcharge = $calculatedPrice > 0 ?
                    $calculatedPrice + $paypalSurchargeAmount : 0;

                $updatePrices($calculatedPrice, $priceWithSurcharge, 0, $cartItem);
            }
        }

        if ($data['totalCalculatedPrice'] < 0) {
            $data['totalCalculatedPrice'] = 0;
        }
        if ($data['totalWithSurcharge'] < 0) {
            $data['totalWithSurcharge'] = 0;
        }

        $this->loadInput($data);
        return $this->save();
    }

    public static function getPaypalCarts($params = [])
    {
        $query = DB::table(Cart::tableName() . ' as c');
        $query->leftJoin(CourseStudent::tableName() . ' as cs', 'cs.invoice_id', '=', 'c.invoice_no');
        $query->leftJoin(StudentPayment::tableName() . ' as sp', 'sp.course_student_id', '=', 'cs.id');
        $query->leftJoin(User::tableName() . ' as u', 'u.id', '=', 'c.student_id');

        $fields = [
            DB::raw('SQL_CALC_FOUND_ROWS c.id as id'),
            'c.last_update as lastUpdate',
            'u.id as userId',
            'u.user_fullname as userFullname',
            'c.total_calculated_price as totalCalculatedPrice',
            'c.total_payment as totalPayment',
            'c.total_discount as totalDiscount',
            'c.payment_status as paymentStatus',
            'c.txn_id as txnId',
            'c.full_details as fullDetails'
        ];

        $query->where('sp.payment_method', 'paypal');
        $query->where('c.cart_status', 'processed');

        if (isset($params['filters'])) {
            $filters = $params['filters'];
            if (isset($filters['txnId'])) {
                $query->where('c.txn_id', 'LIKE', '%' . $filters['txnId'] . '%');
            }
        }

        $query->orderBy('last_update', 'desc');
        $query->groupBy('id');

        $limit = isset($params['rowsPerPage']) ? $params['rowsPerPage'] : null;

        if (!is_null($limit)) {
            if (isset($filters['page']))
                $rows = $query->skip((intval($filters['page']) - 1) * $limit)->take($limit)->get($fields);
            else
                $rows = $query->take($limit)->get($fields);
        } else {
            $rows = $query->get($fields);
        }

        return [
            'rows' => $rows,
            'info' => DB::select(DB::raw('SELECT FOUND_ROWS() as totalCount;'))[0]
        ];
    }
}
