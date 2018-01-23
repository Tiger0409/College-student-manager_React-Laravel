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
            <th>Created At</th>
            <th>Student Name</th>
            <th>Total Amount</th>
            <th>Payment Status</th>
            <th>Card Owner Name</th>
            <th>TXN ID</th>
        </tr>
    </thead>

    <tbody>
        @for ($i = 0; $i < count($transactions); $i++)
            <?php $row = $transactions[$i]; ?>
            <tr @if ($i % 2 != 0) class="odd" @endif>
                <td style="width: 10%">{{ $row['createdAt'] }}</td>
                <td style="width: 15%">{{ $row['studentName'] }}</td>
                <td>{{ $row['amount'] }}</td>
                <td>{{ $row['status'] }}</td>
                <td>{{ $row['cardOwnerName'] }}</td>
                <td>{{ $row['txnId'] }}</td>
            </tr>
        @endfor
    </tbody>
</table>