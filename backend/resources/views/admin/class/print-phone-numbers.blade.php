@foreach ($students as $student)
    @if ($student->user->profile->profileTelephone)
        <p>{{ $student->user->profile->profileTelephone }}</p>
    @endif

    @if ($student->user->profile->profileMobile)
        <p>{{ $student->user->profile->profileMobile }}</p>
    @endif
@endforeach
