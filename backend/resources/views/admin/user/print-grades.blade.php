<style>
    .item {
        font-size: 26px;
        margin: 710px 15px 100px 15px;
        text-align: center;
        line-height: 1.2em;
        font-family: "DejaVu Serif";
    }
</style>

<div>
    @foreach ($users as $user)
        @if($user->gradeStatus != 'fail' && !empty($user->feedback))
            <div class="item">
                <p>{{ $user->fullName }}</p>
                <br>
                <p>{{ $user->courseTitle }} - {{ $user->feedback }}</p>
            </div>
        @endif
    @endforeach
</div>
