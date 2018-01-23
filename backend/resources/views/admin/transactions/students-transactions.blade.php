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
            <th>Registration Time</th>
            <th>Course Title</th>
            <th>Class Time</th>
            <th>Class Term</th>
            <th>Student Name</th>
            <th>Payment</th>
            <th>Notes</th>
        </tr>
    </thead>

    <tbody>
        @for ($i = 0; $i < count($students); $i++)
            <?php
                $row = $students[$i];
                $totalPaid = array_reduce($row['payments'], function ($sum, $p) { return $sum + $p['amount']; }, 0);
            ?>
            <tr @if ($i % 2 != 0) class="odd" @endif>
                <td style="width: 10%">{{ $row['registerDate'] }}</td>
                <td style="width: 15%">{{ $row['course']['courseTitle'] }}</td>
                <td>{{ $row['courseClass']['classTime'] }}</td>
                <td>{{ $row['courseClass']['term']['name'] }}</td>
                <td>{{ $row['user']['userFullname'] }}</td>
                <td>
                    <?php echo "£ {$totalPaid} / {$row['regPaymentStatus']} / {$row['regStatus']}" ?>
                </td>
                <td style="width: 30%"><?php echo $row['adminNotes'] ?></td>
            </tr>
        @endfor
    </tbody>
</table>