<style>
    p, b {
        margin: 0;
        font-size: 14pt;
    }

    th, td {
        text-align: center;
    }

    tr {
        height: 3.72cm;
    }
</style>

<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <thead>
        <tr>
            <th scope="col">Ref Number</th>
            <th scope="col">Prefix</th>
            <th scope="col">Firstname</th>
            <th scope="col">Surname</th>
            <th scope="col">Suffix</th>
            <th scope="col">Position</th>
            <th scope="col">Company</th>
            <th scope="col">Address1</th>
            <th scope="col">Address2</th>
            <th scope="col">Address3</th>
            <th scope="col">Address4</th>
            <th scope="col">Postcode</th>
        </tr>
    </thead>
    @for ($i = 0; $i < count($users); $i++)
        <tr>
            <td></td>
            <td></td>
            <td>{{ $users[$i]->profileForname }}</td>
            <td>{{ $users[$i]->profileSurname }}</td>
            <td></td>
            <td></td>
            <td></td>
            <td style="width: 10%">{{ $users[$i]->profileAddress }}</td>
            <td style="width: 10%">{{ $users[$i]->profileAddress2 }}</td>
            <td></td>
            <td></td>
            <td>{{ $users[$i]->profilePostcode }}</td>
        </tr>
    @endfor
</table>