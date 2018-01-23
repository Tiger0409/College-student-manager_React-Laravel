<style>
    .odd {
        background-color: #ECECEC
    }

    td {
        height: 50px;
    }
</style>

<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <thead>
    <tr>
        <th>Full name</th>
        <th>Telephone</th>
        <th>Email</th>
        <th>Cart items count</th>
    </tr>
    </thead>

    <tbody>
    @for ($i = 0; $i < count($students); $i++)
        <?php $row = $students[$i]; ?>
        <tr @if ($i % 2 != 0) class="odd" @endif>
            <td>{{ $row['userFullname'] }}</td>
            <td>{{ $row['telephone'] }}</td>
            <td>{{ $row['userEmailAddress'] }}</td>
            <td>{{ $row['cartItemsCount'] }}</td>
        </tr>
    @endfor
    </tbody>
</table>