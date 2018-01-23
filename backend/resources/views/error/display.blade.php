<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Error</title>
    @if (session('errorMessage'))
    <h1>
        {{ session('errorMessage') }}
    </h1>
    @endif
</head>
<body>

</body>
</html>