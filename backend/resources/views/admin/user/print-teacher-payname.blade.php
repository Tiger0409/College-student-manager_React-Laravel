<style>
    table{
        margin-top: 30px;
    }
    table,
    thead tr th{
        text-align: center;
    }
    thead tr th {
        margin-bottom: 10px;
    }
    .odd {
        background-color: #ECECEC
    }

    td {
        height: 50px;
    }
    h3{
        text-align: center;
        margin-top: 20px;
    }
    p.red{
        color:red;
    }
    @media print {
        p.red{
            color:red !important;
        }
    }
</style>
<h3>
    {{$description['name']}} Term {{$description['termName']}} ( Hours {{$description['timeIn']}} - {{$description['timeOut']}} )
    {{$description['branchName']}} This Month Includes week so and so {{$description['description']}}
</h3>
<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <thead>
    <tr>
        <th>Name</th>
        <th>Branch</th>
        <th>Classes</th>
        <th>Week 1</th>
        <th>Week 2</th>
        <th>Week 3</th>
        <th>Week 4</th>
        <th>Total</th>
        <th>Pay</th>
    </tr>
    </thead>

    <tbody>
    @for ($i = 0; $i < count($payname); $i++)
        <?php $row = $payname[$i]; ?>
        <tr @if ($i % 2 != 0) class="odd" @endif>
            <td>{{ $row['userName'] }}</td>
            <td>{{ $row['branchName'] }}</td>
            <td>{{ $row['classes'] }}</td>
            @for($j =1 ; $j<5 ; $j++)
                <td>
                    <p>{{$row['totalPayName']['week'.$j]}}</p>
                    <p class="red">{{$row['totalPayName']['weekLate'.$j]}}</p><br>
                </td>
            @endfor
            <td>
                <p>{{$row['totalPayName']['Total']}}</p>
                <p class="red">{{$row['totalPayName']['totalLate']}}</p><br>
            </td>
            <td>
                {{$row['teacherHourlyRate']*(int)($row['totalPayName']['rateHours']/60)}} &pound;
            </td>
        </tr>
    @endfor
    </tbody>
</table>