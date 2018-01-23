<ul class="nav nav-tabs nav-justified">
    <li @if (isset($inDashboard)) class="active" @endif>
        <a href="/api/dashboard">Dashboard</a>
    </li>

    <li @if (isset($inTransactions)) class="active" @endif>
        <a class="list-group-item-danger" href="">Transactions (in dev)</a>
    </li>

    <li @if (isset($inCourse)) class="active" @endif>
        <a class="list-group-item-danger" href="">Course (in dev)</a>
    </li>

    <li @if (isset($inUser)) class="active" @endif>
        <a href="/api/user/search">User</a>
    </li>

    <li @if (isset($inDonations)) class="active" @endif>
        <a class="list-group-item-danger" href="">Donations (in dev)</a>
    </li>

    <li @if (isset($inSettings)) class="active" @endif>
        <a class="list-group-item-danger" href="">Settings (in dev)</a>
    </li>

    <li @if (isset($inLogs)) class="active" @endif>
        <a class="list-group-item-danger" href="">Logs (in dev)</a>
    </li>
</ul>