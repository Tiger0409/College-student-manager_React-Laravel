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
        <th>#</th>
        <th>Address</th>
        <th>Post code</th>
        <th>Student</th>
        <th>Class</th>
        <th>Course fee</th>
        <th>Paid so far</th>
        <th>To pay first instalment</th>
        <th>To pay second instalment</th>
        <th>Total outstanding</th>
        <th>Telephone</th>
        <th>Payment notes</th>
        <th>Serial</th>
    </tr>
    </thead>

    <tbody>
    @for ($i = 0; $i < count($students); $i++)
        <?php $row = $students[$i]; ?>
        <tr @if ($i % 2 != 0) class="odd" @endif>

            <?php
                $fee = $row->status == 'employed' ?
                    $row->feeForEmployed : $row->feeForUnemployed;
                    if($row->status == 'reduced') {$fee = $row->reducedFee;}
            ?>

            <td><?php echo ($i + 1) . "." ?></td>
            <td>
                <?php
                        echo $row->profileAddress;
                        if (!empty($row->profileAddress2)) {echo ", ". $row->profileAddress2;}?> @if (!empty($row->city)){{ $row->city }} @endif
            </td>
            <td style="width: 15%">{{ $row->profilePostcode }}</td>
            <td>{{ $row->studentName  }}</td>
            <td>{{ $row->courseTitle }} {{ $row->classTime }}</td>
            <td>{{ $fee }}</td>
            <td>{{ $row->paid }}</td>
            <td>{{ max($fee / 2 - $row->paid, 0) }}</td>
            <td>{{ max($fee / 2 - max($row->paid - $fee / 2, 0), 0) }}</td>
            <td>{{ max($fee - $row->paid, 0) }}</td>
            <td>
                @if(!empty($row->telephone)) {{ $row->telephone }} @endif
                @if(!empty($row->mobile)) {{ $row->mobile }} @endif
            </td>
            <td><?php echo strip_tags($row->adminNotes); ?></td>
            <td>{{ $row->regStatus }}</td>
        </tr>
    @endfor
    </tbody>
</table>