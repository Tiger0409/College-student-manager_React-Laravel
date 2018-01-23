<?php
    function optionCodeToLabel($options, $code) {
        foreach ($options as $option) {
            if ($option['value'] == $code) {
                return $option['label'];
            }
        }

        if (!$code !== '0') {
            return optionCodeToLabel($options, '0');
        }

        return 'none';
    }
?>

<style>
    th {
        text-align: center;
    }

    td {
        padding: 5px;
    }
</style>

<h1><b>{{ $courseClass->course->courseTitle }}: {{ $courseClass->classTime }}</b></h1>
<h1>
    @if (!empty($courseClass->teacher))
        <b>Teacher: {{ $courseClass->teacher->userFullname }}</b>
    @endif
</h1>
<table border="1" cellpadding="0" cellspacing="0" width="100%">
    <thead>
        <tr>
            <th>Student</th>
            <th>Exam</th>
            <th>Score</th>
            <th>Attendance</th>
            <th>Comment</th>
        </tr>
    </thead>

    <tbody>
        @foreach ($students as $student)
            <tr>
                <td>{{ $student['studentInfo']['name'] }}</td>
                <td>Final Grade</td>
                <td>{{ $student['finalGrade']['score'] }}</td>
                <td>
                    <?php echo optionCodeToLabel($attendanceOptions, $student['finalGrade']['attendanceCode']); ?>
                </td>
                <td>{{ $student['finalGrade']['comment'] }}</td>
            </tr>
        @endforeach

        @foreach ($examResults as $examResultsRecord)
            @foreach ($students as $student)
                <tr>
                    <td>{{ $student['studentInfo']['name'] }}</td>
                    <td>{{ $examResultsRecord['exam']['title'] }}</td>

                    <?php $scoreFound = false ?>

                    @foreach ($examResultsRecord['scores'] as $score)
                        @if ($score['idCourseStudent'] == $student['studentInfo']['id'] && !$scoreFound)
                            <td>{{ $score['score'] }}</td>
                            <td>
                                <?php echo optionCodeToLabel($attendanceOptions, $score['attendanceCode']); ?>
                            </td>
                            <td>{{ $score['comment'] }}</td>
                            <?php
                                $scoreFound = true;
                            ?>
                        @endif
                    @endforeach

                    @if (!$scoreFound)
                        <td>0</td>
                        <td><?php echo optionCodeToLabel($attendanceOptions, '0'); ?></td>
                        <td></td>
                    @endif
                </tr>
            @endforeach
        @endforeach
    </tbody>
</table>