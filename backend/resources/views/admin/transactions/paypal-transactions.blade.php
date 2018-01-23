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
            <th>Last Update</th>
            <th>Student Name</th>
            <th>Total Payment</th>
            <th>Total Discount</th>
            <th>Payment Status</th>
            <th>TXN ID</th>
        </tr>
    </thead>

    <tbody>
        @for ($i = 0; $i < count($transactions); $i++)
            <?php $row = $transactions[$i]; ?>
            <tr @if ($i % 2 != 0) class="odd" @endif>
                <td style="width: 10%">{{ $row->lastUpdate }}</td>
                <td style="width: 15%">{{ $row->userFullname }}</td>
                <td>{{ $row->totalPayment }}</td>
                <td>{{ $row->totalDiscount }}</td>
                <td>{{ $row->paymentStatus }}</td>
                <td>{{ $row->txnId }}</td>
            </tr>
        @endfor
    </tbody>
</table>