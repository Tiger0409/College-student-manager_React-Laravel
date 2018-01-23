<style>
    p, b {
        margin: 0;
        font-size: 14pt;
    }

    th, td {
        text-align: center;
    }

    tr {
        height: 1cm;
    }
</style>

<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <thead>
        <tr>
            <th scope="col">Fullname</th>
            <th scope="col">Email</th>
            <th scope="col">Address</th>
            <th scope="col">Telephone</th>
            <th scope="col">Mobile</th>
        </tr>
    </thead>
    @foreach ($users as $user)
        <tr>
            <td>{{ $user->fullName }}</td>
            <td>{{ $user->emailAddress }}</td>
            <td>{{ $user->profileAddress }}</td>
            <td>{{ $user->telephone }}</td>
            <td>{{ $user->mobile }}</td>
        </tr>
    @endforeach
</table>