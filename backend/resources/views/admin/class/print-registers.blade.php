<?php
    use App\Classes\Helpers\DateHelper;
?>

<style>
    td {
        padding-left: 5px;
    }

    .dotted {
        border-bottom: 1px dotted #000000;
        margin-top: 17px;
    }

    table { width: 100% }
table.record {  display: block;
    page-break-after: always;
   
    position: relative;  }
   @media print
{
  table { page-break-after:auto }
  tr    { page-break-inside:avoid; page-break-after:auto }
  td    { page-break-inside:avoid; page-break-after:auto }
  thead { display:table-header-group;}
  tfoot { display:table-footer-group }
}
 

</style>


    @foreach ($data as $record)
        <?php $courseClass = $record['courseClass'] ?>
        <?php $students    = $record['students'] ?>
       <table class="record">


   
       
        <tr ><td>
        
            <table>               
                <tbody>
                    <tr>
                        <td width="33%">
                            <span>Dept: {{ $courseClass->course->dept->deptName }} </span>
                            <span>Class Key: {{ $courseClass->classKeyCode }}</span>

                            @if (!is_null($courseClass->teacher))
                                <br/>
                                <span>Teacher: {{ $courseClass->teacher->userFullname }}</span>
                            @endif
                        </td>

                        <td width="33%">
                            <span><b>Dept: {{ $courseClass->course->courseTitle }} </b></span>
                            <span>(term {{ $courseClass->term->term }} {{ $courseClass->term->year }})</span>
                            <br/>
                            <span>Time: <b>{{ $courseClass->classTime }}</b></span>
                        </td>

                        <td width="33%">
                            @if (!is_null($courseClass->classroom))
                                <span>Classroom: {{ $courseClass->classroom->classroomName }}</span>
                            @endif
                        </td>
                    </tr>
                </tbody>
            </table>

         
         <h4><b>Active ({{ $students->count() }})</b></h4>
                    <table> <tr><td>
                    <table border="1">
                        
                            <tr>
                                <td height="42"># </td>
                                <td width="735">Name</td>

                                @if ($type == 'adults')
                                    @for ($i = 0; $i < 11; $i++)
                                        <td>Wk{{ $i + 1 }}</td>
                                    @endfor

                                @elseif ($type == 'weekend-registers')
                                    @for ($i = 0; $i < 36; $i++)
                                        <td>{{ $i + 1 }}</td>
                                    @endfor

                                @elseif ($type == 'weekday-registers')
                                    @for ($i = 0, $j = 0; $i < 36; $i++, $j++)
                                        @if ($j > 3)
                                            <?php $j = 0; ?>
                                        @endif

                                        <td>{{ $j + 1 }}</td>
                                    @endfor
                                @endif
                            </tr>
                        
                            @for ($i = 0; $i < $students->count(); $i++)
                                <tr>
                                    <td width="25" height="25">{{ $i + 1 }}</td>
                                    <td>{{ $students[$i]->user->userFullname }} ({{ DateHelper::convertToAge($students[$i]->user->age) }})</td>

                                    @if ($type == 'adults')
                                        @for ($j = 0; $j < 11; $j++)
                                            <td width="90" height="26"></td>
                                        @endfor
                                    @else
                                        @for ($j = 0; $j < 36; $j++)
                                            @if ($type == 'weekday-registers' && ($j + 1) % 4 == 0)
                                                <td bgcolor="#CCCCCC" width="26" height="26"></td>
                                            @else
                                                <td width="26" height="26"></td>
                                            @endif
                                        @endfor
                                    @endif
                                </tr>
                            @endfor
                       
                    </table>
                 </tr></td>    </table> 

            <table>
                <tr><td>
                    <p class="dotted">Notes</p>
                    <p class="dotted"></p>
                    <p class="dotted"></p>
                    <p class="dotted"></p>
                </tr></td>
             </table>


            @if ($type !== 'adults')
                
                        <h4><b>Active ({{ $students->count() }})</b></h4>
              

               
                        <table border="1"  cellpadding="0" cellspacing="0" width="100%">
                          
                            <tbody>
                                @foreach ($students as $student)
                                    <tr>
                                        <td style="width: 50%">
                                            {{ $student->user->userFullname }} ({{ DateHelper::convertToAge($student->user->age) }})
                                        </td>
                                        <td style="width: 50%">
                                            {{ $student->user->profile->teacherNotes }}
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                
            @endif
    </td></tr>
        
</table>
    @endforeach
