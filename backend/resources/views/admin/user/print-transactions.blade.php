<style>
    p, b {
        margin: 0;
        font-size: 14pt;
    }

    tr {
        height: 1cm;
    }

    td {
        padding: 0px 5px 0px 5px;
    }

    .odd {
        background-color: #ECECEC
    }
</style>

<table width="100%" border="0" cellspacing="0" cellpadding="0" class="table-stripped">
    <thead>
        <tr>
            <th scope="col">Fullname</th>
            <th scope="col">Course Title</th>
            <th scope="col">Class Term</th>
            <th scope="col">Payment</th>
            <th scope="col">Notes</th>
            <th scope="col">Register Date</th>
            <th scope="col">Grade</th>
        </tr>
    </thead>
    @for ($i = 0; $i < count($users); $i++)
        <tr @if ($i % 2 != 0) class="odd" @endif>
            <td style="width: 8%">{{ $users[$i]->fullName }}</td>
            <td style="width: 15%">{{ $users[$i]->courseTitle }}</td>
            <td style="width: 10%">Term {{ $users[$i]->termNumber}} / {{ $users[$i]->year }}</td>
            <td style="width: 10%">
                {{ $users[$i]->paymentStatus }} / {{ $users[$i]->regStatus }} / {{ $users[$i]->paymentsTotal }}
            </td>
            <td style="width: 40%"><?php echo $users[$i]->adminNotes ?></td>
            <td>{{ $users[$i]->registerDate }}</td>
            @if (!empty($users[$i]->grade))
                <td>{{ $users[$i]->grade }}</td>
            @else
                <td>-</td>
            @endif
        </tr>
    @endfor
</table>