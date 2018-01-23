<style>
    table {
        width: 100%;
        page-break-after: always;
    }
    tr {
        height: 3.82cm;
        width: 100%;
    }
    body {
        padding: 0px 0px 0px 0px;
        margin-bottom: 1mm;
        margin-right: 2.35mm;
        margin-bottom: 0mm;
        margin-left: 2.35mm;
    }
    td {
        border: 0px dotted black;
        width: 33%;
        padding: 18px;
        text-align: left;
        valign: top;
    }
    p {
        margin: 0;
    }
</style>

<?php
    $columns = 3;
    $rowsPerPage = 7;
    $repeatings = 2;
    $repeated = 0;
    $currRow = 1;
?>
<?php $studentsCount = count($students); ?>
<table>
    @for ($i = 0; $i < $studentsCount;) 
        <tr>
            @for ($j = 0; $j < $columns; $j++)
                <td <?php if ($j === 1) echo "style='padding-left: 0.2cm'" ?> <?php if ($j === 2) echo "style='padding-left: 0.6cm'" ?>>
                <p><?php echo $students[$i]->studentName ?></p>
                <p>{{ $students[$i]->profileAddress }}</p>
                <p>{{ $students[$i]->profileAddress2 }}</p>
                <p>{{ $students[$i]->profilePostcode }}</p>
            </td>

            <?php $i++; ?>

            @if ($i >= $studentsCount)
                <?php return; ?>
            @endif
        @endfor
    </div>
@endfor