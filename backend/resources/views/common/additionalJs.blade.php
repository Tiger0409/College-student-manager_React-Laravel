@if (isset($additionalJs) && is_array($additionalJs))
    @foreach ($additionalJs as $js)
        <script type="text/javascript" src="{{ $js }}"></script>
    @endforeach
@endif
