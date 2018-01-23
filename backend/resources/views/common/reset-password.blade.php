
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Recover forgotten password</title>
</head>
<body>
<p>Assalamu Alaykum {{ $userFullname }},</p>
<p>
    We have received a request for resetting your password
</p>
<p>Please click this link in order to reset your password: <a href="{{ $resetLink }}">Reset your password</a></p>
<p>If you cannot click the link above, copy the url below into your browser's address bar:</p>
<p>{{ $resetLink }}</p>
<p>The link above will only work for the next {{ $expireTimeMsg }}.</p>
<p>If you have recieved this email in error please ignore this email and your password will remain unchanged.</p>
<p>If you have any queries regarding your account please contact by email: info@tayyibun.com</p>
<p>Jazakum Allah khair,</p>
<p>&nbsp;</p>
<p>&nbsp;</p>
<p>Tayyibun</p>
</body>
</html>
