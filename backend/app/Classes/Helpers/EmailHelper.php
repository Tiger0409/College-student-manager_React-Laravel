<?php

namespace App\Classes\Helpers;

use App\Models\CourseStudent;
use App\Models\GeneralSetting;
use App\Models\User;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Mail;

class EmailHelper
{
    /**
     * @param string $toAddress
     * @param string $subject
     * @param string $content
     * @return bool
     */
    public static function sendEmail($toAddress, $subject, $content)
    {
        return Mail::send('common.email', ['content' => $content],
            function (Message $message) use ($toAddress, $subject) {
                $fromAddress = GeneralSetting::getValue(
                    'website_admin_email_address',
                    'admin@tayyibunonline.com'
                );
                $fromName = GeneralSetting::getValue(
                    'website_admin_name',
                    'Administrator'
                );
                $message->from($fromAddress, $fromName);
                $message->to($toAddress);
                $message->subject($subject);
            }
        );
    }

    /**
     * @param CourseStudent $student
     * @return bool
     */
    public static function sendInvoiceEmail(CourseStudent $student)
    {
        if ($student->user->user_main_role!=3) {


            $data = [
                '%REG_DATE%'        => date('d M Y H:i:s', DateHelper::mysqlToUnix($student->registerDate)),
                '%PAYMENT_STATUS%'  => $student->regPaymentStatus,
                '%NAME%'            => $student->user->userFullname,
                '%ADDRESS%'         => $student->user->profile->profileAddress,
                '%EMAIL%'           => $student->user->userEmailAddress,
                '%TELEPHONE%'       => $student->user->profile->profileTelephone,
                '%COURSE_NAME%'     => $student->course->courseTitle,
                '%COURSE_TIME%'     => $student->courseClass->classTime,
                '%TOTAL_PRICE%'     => ('&pound; ' . number_format($student->getInitialAmount(), 2)), //fail
                '%REDUCED_NOTES%'   => (($student->studentStatus === 'reduced') ? $student->reducedNotes : 'n/a' ),
                '%ROW%'             => ''
            ];
        }
        else{
            $data = [
                '%REG_DATE%'        => date('d M Y H:i:s', DateHelper::mysqlToUnix($student->registerDate)),
                '%PAYMENT_STATUS%'  => $student->regPaymentStatus,
                '%NAME%'            => $student->user->userFullname,
                '%ADDRESS%'         => $student->user->profile->profileAddress,
                '%EMAIL%'           => $student->user->userEmailAddress,
                '%TELEPHONE%'       => $student->user->profile->profileTelephone,
                '%COURSE_NAME%'     => $student->course->courseTitle,
                '%COURSE_TIME%'     => $student->courseClass->classTime,
                '%TOTAL_PRICE%'     => ('&pound; ' . number_format($student->getTotalPaid(), 2)),
                '%REDUCED_NOTES%'   => (($student->studentStatus === 'reduced') ? $student->reducedNotes : 'n/a' ),
                '%ROW%'             => ''
            ];
        }
        if (!empty($student->courseClass->receiptEmailBody)) {
            $template = $student->courseClass->receiptEmailBody;
            $subject = $student->courseClass->receiptEmailSubject;
        } else {
            $template = $student->course->dept->branchAssociated->invoiceEmailTemplate;
            $subject = 'Course Registration invoice';
        }

        if (!$template) {
            return false;
        }

        foreach ($data as $placeHolder => $input) {
            $template = str_replace($placeHolder, $input, $template);
        }

        return static::sendEmail($student->user->userEmailAddress, $subject, $template);
    }

    /**
     * @param CourseStudent[] $students
     * @param string $cartPaymentStatus
     * @return bool
     * @throws \Exception
     * @throws \Throwable
     */
    public static function sendInvoicesEmail($students, $cartPaymentStatus)
    {
        $studentsCount = count($students);

        if ($studentsCount == 0) {
            return true;
        }

        if ($studentsCount == 1) {
            return self::sendInvoiceEmail($students[0]);
        }

        $user = $students[0]->user;
        $branch = $students[0]->course->dept->branchAssociated;

        if (!$branch->invoiceEmailTemplate) return false;

        $data = [
            '%REG_DATE%'        => date('d M Y H:i:s', DateHelper::mysqlToUnix($students[0]->registerDate)),
            '%NAME%'            => $user->userFullname,
            '%ADDRESS%'         => $user->profile->profileAddress,
            '%EMAIL%'           => $user->userEmailAddress,
            '%TELEPHONE%'       => $user->profile->profileTelephone,
            '%PAYMENT_STATUS%'  => $cartPaymentStatus,
            '%TOTAL_PRICE%'     => 0,
            '%ROW%'             => ''
        ];

        $rowData = [];
        foreach ($students as $student) {
            if (!empty($student->courseClass->receiptEmailBody)) {
                self::sendInvoiceEmail($student);
                continue;
            }

            $data['%TOTAL_PRICE%'] += $student->getInitialAmount();

            $rowData[] = [
                'classTime'        => $student->courseClass->classTime,
                'courseTitle'      => $student->course->courseTitle,
                'totalAmount'      => $student->getInitialAmount(),
                'regPaymentStatus' => $student->regPaymentStatus
            ];
        }

        $data['%ROW%'] = view('common.invoice-row', ['rowData' => $rowData])->render();

        $template = $branch->invoiceEmailTemplate;

        foreach ($data as $placeHolder => $input) {
            $template = str_replace($placeHolder, $input, $template);
        }

        return static::sendEmail(
            $user->userEmailAddress,
            'Course Registration invoice',
            $template
        );
    }

    public static function sendRelativeEmail($relative, $student)
    {
        if (empty($relative)) {
            return false;
        }

        $adminEmailAddress = GeneralSetting::getValue('website_admin_email_address', 'admin@tayyibun.com');
        $subject = "Relative with age, under 14";
        //$content = $this->load->view("email/relative.php", array('relative' => $relative, 'student' => $student), true);

        return self::sendEmail($adminEmailAddress, $subject, 'in dev');
    }

    public static function sendResetPasswordEmail(User $user, $resetLink, $expireTimeMsg)
    {
        $subject = GeneralSetting::getValue('forgot_password_email_subject', 'Recover forgotten password at Tayyibun');

        $content = view('common.reset-password', [
            'userFullname'  => $user->userFullname,
            'resetLink'     => $resetLink,
            'expireTimeMsg' => $expireTimeMsg
        ])->render();

        self::sendEmail($user->userEmailAddress, $subject, $content);
    }
}