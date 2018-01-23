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

<table>
    @for ($i = 0; $i < count($students);)
        <tr>
            @for ($j = 0; $j < $columns; $j++)
                <td <?php if ($j === 1) echo "style='padding-left: 0.2cm'" ?> <?php if ($j === 2) echo "style='padding-left: 0.6cm'" ?>>

                    <p>{{ $students[$i]->user->userFullname }}</p>
                    <p>{{ $students[$i]->user->profile->profileAddress }}</p>
                    <p>{{ $students[$i]->user->profile->profileAddress2 }}</p>
                    <p>{{ $students[$i]->user->profile->profilePostcode }}</p>
                </td>

        <?php $i++; ?>

        @if ($i >= count($students))
            <?php return; ?>
        @endif


    @endfor

    @if ($currRow % $rowsPerPage === 0)
</table>
<table>
    @endif

    <?php $currRow++; ?>
    </tr>
    @endfor
</table>