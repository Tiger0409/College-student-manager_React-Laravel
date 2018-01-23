<ul class="nav nav-tabs nav-justified">
    <li @if ($role == 'students') class="active" @endif><a href="/user/students/list">Student list</a></li>
    <li @if ($role == 'teachers') class="active" @endif><a href="/user/teachers/list">Teacher list</a></li>
</ul>