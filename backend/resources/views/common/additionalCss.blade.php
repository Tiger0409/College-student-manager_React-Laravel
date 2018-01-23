@if (isset($additionalCss) && is_array($additionalCss))
    @foreach ($additionalCss as $css)
        <link rel="stylesheet" type="text/css" href="{{ $css }}" />
    @endforeach
@endif