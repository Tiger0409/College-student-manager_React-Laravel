<style>
    table {
        width: 100%;
        page-break-after: always;
    }
    tr {
        height: 3.72cm;
        width: 100%;
    }
    body {
        padding: 0px 0px 0px 0px;

        margin-right: 3.75mm;
        margin-bottom: 0mm;
        margin-left: 3.75mm;
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
    @for ($i = 0; $i < count($users);)
        <tr>
            @for ($j = 0; $j < $columns; $j++)
                <td <?php if ($j === 1) echo "style='padding-left: 0.2cm'" ?> <?php if ($j === 2) echo "style='padding-left: 0.4cm'" ?>>
                    <p><?php echo substr($users[$i]->fullName,0,23) ?></p>
                    <p>{{ ucfirst(strtolower($users[$i]->profileAddress)) }}</p>
                    <p>{{ ucfirst(strtolower($users[$i]->profileAddress2)) }}</p>
                    <p>{{ $users[$i]->profilePostcode }}</p>
                    <br />
                </td>

                <?php $i++; ?>

                @if ($i >= count($users))
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