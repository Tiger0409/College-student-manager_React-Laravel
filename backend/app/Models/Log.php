<?php

namespace App\Models;
use App\Classes\Helpers\StringHelper;
use App\Classes\Libraries\IPAPI;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Class Log
 * @package App\Models
 * @property int $userId
 * @property string $action
 * @property string $module
 * @property int $moduleId
 * @property string $confirmText
 * @property string $actionTime
 * @property string $actionIp
 * @property string $createdAt
 * @property string $updatedAt
 * @property string loggingData
 * relations
 * @property User $user
 */
class Log extends ExtendedModel
{
    const ACTION_CREATE = 'create';
    const ACTION_DELETE = 'delete';
    const ACTION_LOGIN = 'login';
    const ACTION_UPDATE = 'update';

    const MODULE_CLASS = 'class';
    const MODULE_COURSE = 'course';
    const MODULE_DONATION = 'donation';
    const MODULE_DONATION_RECORD = 'donation record';
    const MODULE_STUDENT = 'student';
    const MODULE_TEACHER = 'teacher';
    const MODULE_USER = 'user';
    const MODULE_WEBSITE = 'website';
    const MODULE_BRANCH = 'branch';
    const MODULE_TERM = 'term';
    const MODULE_TEACHER_PAYMENT = 'teacher payment';
    const MODULE_COMPLAINT = 'complaint';
    const MODULE_STUDENT_PAYMENT = 'student payment';

    protected $table = 'loggings';

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo('App\\Models\\User', 'user_id');
    }

    /**
     * @return string
     */
    public function getActionIpAttribute()
    {
        return long2ip($this->attributes['action_ip']);
    }

    /**
     * @param string $value
     */
    public function setActionIpAttribute($value)
    {
        $this->attributes['action_ip'] = ip2long($value);
    }

    /**
     * @return mixed
     */
    public function getLoggingDataAttribute()
    {
        if (!empty($this->attributes['logging_data'])) {
            return unserialize($this->attributes['logging_data']);
        }

        return [];
    }

    /**
     * @param mixed $value
     */
    public function setLoggingDataAttribute($value)
    {
        if ($value !== null) {
            $this->attributes['logging_data'] = serialize($value);
        }
    }

    /**
     * @param string $action
     * @param string $module
     * @param string $moduleId
     * @param string $confirmText
     * @param null $loggingData
     * @return bool
     */
    public static function write($action = '', $module = '', $moduleId = '', $confirmText = '', $loggingData = null)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json("Invalid login data", 400);
        }

        if ($user->logEnabled != 1) return response()->json("Invalid login data", 400);

        $log = new Log([
            'userId'      => $user->id,
            'actionIp'    => request()->ip(),
            'actionTime'  => date('Y-m-d H:i:s'),
            'createdAt'   => date('Y-m-d H:i:s'),
            'updatedAt'   => date('Y-m-d H:i:s'),
            'action'      => $action,
            'module'      => $module,
            'moduleId'    => $moduleId,
            'confirmText' => $confirmText,
            'loggingData' => $loggingData
        ]);

        return $log->save();
    }

    /**
     * @param User $user
     */
    public static function writeLogin($user) {
        if ($user->logEnabled != 1) return response()->json("Invalid login data", 400);

        $ip = request()->ip();
        $query = IPAPI::query($ip);

        $data = [
            'Fullname' => $user->userFullname
        ];

        if ($query && $query->status !== 'fail') {
            $data = array_merge($data, [
                'isp'     => $query->isp,
                'ip'      => $ip,
                'city'    => $query->city,
                'country' => $query->country,
                'as'      => $query->as,
                'org'     => $query->org
            ]);
        }

        Log::write(Log::ACTION_LOGIN, Log::MODULE_USER, $user->id, '', !empty($data) ? $data : null);
    }

    /**
     * @param string $action
     * @param User   $user
     * @param string $reason
     * @return bool
     */
    public static function writeUser($action = '', $user, $reason = '')
    {
        if (!$user) return false;

        $module = '';
        switch ($user->userMainRole) {
            case Role::STUDENT:
                $module = Log::MODULE_STUDENT;
                break;
            case Role::TEACHER:
                $module = Log::MODULE_TEACHER;
                break;
        }

        $data = [
            'Fullname' => $user->userFullname,
            'Postcode' => $user->profile ? $user->profile->profilePostcode : 'None'
        ];

        return Log::write($action, $module, $user->id, $reason, $data);
    }

    public static function writeFile($fileName, $text)
    {
        $fp = fopen(base_path("logs/$fileName"),'a');
        fwrite($fp, $text);
        fclose($fp);
    }
}