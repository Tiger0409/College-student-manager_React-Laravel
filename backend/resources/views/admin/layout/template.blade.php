<?php
/**
 * @var App\Models\Website $website
 */
$templatesDir = 'admin.';
$title = (isset($title) && $title) ? $title : 'Admin - Register Tayyibun';
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>{{ $title }}</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    @include('common.additionalCss')
</head>
<body>

<div class="container">
    @include($templatesDir . 'header')
    @yield('main')

    <script src="https://code.jquery.com/jquery-2.2.0.min.js"></script>
    <script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
    @include('common.additionalJs')
</div>

@include($templatesDir . 'footer')
</body>
</html>

