@if (count($rowData) === 0)
    <p>
        <label class="labeltab">No course registration data in this transaction</label>
    </p>
    <?php return; ?>
@endif

<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <thead>
        <tr>
            <th scope="col" align="left"><label class="labeltab">Class Time</label></th>
            <th scope="col" align="left">Course Title</th>
            <th scope="col" align="left">Fee</th>
            <th scope="col" align="left">Payment Status</th>
        </tr>
    </thead>

    <tbody>
    @foreach ($rowData as $row)
        <tr>
            <td>
                <label class="labeltab">{{ $row['classTime'] }}</label>
            </td>
            <td>{{ $row['courseTitle'] }}</td>
            <td>{{ $row['totalAmount'] }}</td>
            <td>{{ $row['regPaymentStatus'] }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
<br/>