<?php
/**
 * @var App\Models\Website $website
 */
$templatesDir = 'student.Institute.front.';
$title = (isset($title) && $title) ? $title : 'Student - Register Tayyibun';
?>


<?php
if (isset($website) && $website->header):
    echo $website->header;
    ?>@include('common.additionalCss')<?php
else:
?>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?php echo $title; ?></title>
    @include('common.additionalCss')
    </head>
    <body>
<?php endif; ?>

<div>
    @include($templatesDir . 'header')
    @yield('main')
    @include('common.additionalJs')
</div>

<?php if (isset($website) && $website->footer): echo $website->footer; ?>
<?php else: ?>
    @include($templatesDir . 'footer')
    </body>
    </html>
<?php endif; ?>

