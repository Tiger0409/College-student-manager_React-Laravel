@foreach ($users as $user)
    @if (!empty($user->telephone))
        <p>{{ $user->telephone }}</p>
    @endif

    @if (!empty($user->mobile))
        <p>{{ $user->mobile }}</p>
    @endif
@endforeach