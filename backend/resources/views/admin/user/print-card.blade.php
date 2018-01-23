<?php
    use App\Classes\Helpers\DateHelper;
?>

<?php
    $codeToName = [
        'MQ' => 'Quran',
        'MA' => 'Arabic',
        'MI' => 'Islamic Studies'
    ];

    $codeToWeight = [
        'MQ' => 3,
        'MA' => 2,
        'MI' => 1
    ];

    $getFirstLetter = function ($item) {
        if (empty($item)) return '';
        preg_match('/[A-Za-z]{1}/', $item, $matches);
        if (empty($matches)) return '';

        return $matches[0];
    };

    $groupedUsers = [];
    foreach ($users as $user) {
        $id = $user->profileId;

        $courseData = [
            'classId'       => $user->classId,
            'courseTitle'   => $user->courseTitle,
            'classTime'     => $user->classTime,
            'teacherName'   => $user->teacherName,
            'classroomName' => $user->classroomName,
            'courseCode'    => $getFirstLetter($user->courseTitle) . $getFirstLetter($user->classTime)
        ];

        if (!isset($groupedUsers[$id])) {
            $groupedUsers[$id] = [
                'userData'   => [
                    'fullName'     => $user->fullName,
                    'age'          => DateHelper::convertToAge($user->birthDate),
                    'telephone'    => $user->telephone,
                    'mobile'       => $user->mobile,
                    'emergency_contact_1_contact'       => $user->emergency_contact_1_contact,
                    'emergency_contact_2_contact'       => $user->emergency_contact_2_contact,                                      
                    'address'      => $user->address,
                    'postcode'     => isset($user->postcode) ? $user->postcode : '',
                    'studentNotes' => $user->studentNotes,
                    'teacherNotes' => $user->teacherNotes
                ],
                'courseData' => []
            ];
        }

        $groupedUsers[$id]['courseData'][] = $courseData;
    }

    // sort courses by codes
    foreach ($groupedUsers as $id => $user) {
        usort($groupedUsers[$id]['courseData'], function ($a, $b) use ($codeToWeight) {
            $courseCodeA = $a['courseCode'];
            $courseCodeB = $b['courseCode'];
            $weightA = isset($codeToWeight[$courseCodeA]) ? $codeToWeight[$courseCodeA] : 0;
            $weightB = isset($codeToWeight[$courseCodeB]) ? $codeToWeight[$courseCodeB] : 0;

            if ($weightA > $weightB) return -1;

            return 1;
        });
    }
?>

<?php $ids = array_keys($groupedUsers); ?>

@if ($asTable)
    <style>
        table {
            font-size: 10px;
        }

        div.row {
            margin-left: 20px;
            margin-top: 50px;
        }

        p, b {
            margin: 0;
        }

        tr {
            height: 1cm;
        }

        th {
            font-weight: normal;
        }

        td {
            padding: 0px 5px 0px 5px;
        }

        .odd {
            background-color: #ECECEC
        }

        a {
            display: block;
        }
    </style>

    <table width="100%" border="0" cellspacing="0" cellpadding="0" class="table-stripped">
        <thead>
        <tr>
            <th scope="col">Name (age)</th>
            <th scope="col">Course</th>
            <th scope="col">Telephone</th>
            <th scope="col">Address</th>
            <th scope="col">Notes</th>
            <th scope="col">Teacher Notes</th>
        </tr>
        </thead>
        @for ($i = 0; $i < count($ids); $i++)
            <tr @if ($i % 2 != 0) class="odd" @endif>
                <?php
                    $user = $groupedUsers[$ids[$i]];
                    $userData = $user['userData'];
                    $courseData = $user['courseData'];
                ?>
                <td><?php echo $userData['fullName'] ?> ({{ $userData['age'] }})</td>
                <td>

                    @foreach ($courseData as $course)
                        <?php $courseCode = $course['courseCode']; ?>

                         <a>
                            {{ $courseCode }} -
                            @if (!empty($course['teacherName'])) {{ $course['teacherName'] }} @endif
                            @if (!empty($course['classroomName'])) {{ $course['classroomName'] }} @endif
                         </a>
                    @endforeach
                </td>
                <td>
                    <p>
                        <?php
                            $numbers = [];
                            if (!empty($userData['telephone'])) {
                                $numbers[] = $userData['telephone'];
                            }

                            if (!empty($userData['mobile'])) {
                                $numbers[] = $userData['mobile'];

                            }                            
                             if (!empty($userData['emergency_contact_1_contact'])) {
                                $numbers[] = $userData['emergency_contact_1_contact'];
                            }
                            if (!empty($userData['emergency_contact_2_contact'])) {
                                $numbers[] = $userData['emergency_contact_2_contact'];

                            }
                        ?>

                        {{ implode(' / ', $numbers) }}
                    </p>
                </td>
                <td>{{ $userData['address'] }} {{ $userData['postcode'] }}</td>
                <td style="width: 12.5%"><?php echo $userData['studentNotes']; ?></td>
                <td style="width: 12.5%"><?php echo $userData['teacherNotes']; ?></td>
            </tr>
        @endfor
    </table>
@else
    <style>
        table {
            margin-top: 1cm;
            margin-left: 0%;
            width: 100%;

            page-break-after: always;
        }
        tr {
            height: 3.7cm;
            width: 100%;
        }
        body {
            padding: 0px 0px 0px 0px;
        }
        td {
            border: 0px dotted black;
            width: 33%;
            margin-left: 15%;
            padding: 18px 1px 18px 1px;
            text-align: left;
        }
        p {
            margin: 0px;
        }
        a {
            display: block;
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
        @for ($i = 0; $i < count($ids);)
            <tr>
                @for ($j = 0; $j < $columns; $j++)
                    <?php
                        $user = $groupedUsers[$ids[$i]];
                        $userData = $user['userData'];
                        $courseData = $user['courseData'];
                    ?>


                        <td <?php if ($j === 1) echo "style='padding-left: 0.2cm'" ?> <?php if ($j === 2) echo "style='padding-left: 0.4cm'" ?>>
                        <b><?php echo substr($userData['fullName'],0,22); ?> ({{ $userData['age'] }})</b>
                        @foreach ($courseData as $course)
                            <?php
                                $courseCode = $course['courseCode'];
                                if (isset($codeToName[$courseCode])) {
                                    $courseCode = $codeToName[$courseCode];
                                }
                                $classroomName = !empty($course['classroomName']) ? $course['classroomName'] : 'None';
                            ?>

                            <p>
                                {{ $courseCode }} - {{ $classroomName }}
                            </p>
                        @endforeach
                        <p>
                            <?php
                                $numbers = [];
                                if (!empty($userData['telephone'])) {
                                    $numbers[] = $userData['telephone'];
                                }

                                if (!empty($userData['mobile'])) {
                                    $numbers[] = $userData['mobile'];
                                }
                            ?>

                            {{ implode(' / ', $numbers) }}
                        </p>
                    </td>

                    <?php
                        $repeated++;
                        if ($repeated === $repeatings) {
                            $repeated = 0;
                            $i++;
                        }
                    ?>

                    @if ($i >= count($ids))
                        <?php return; ?>
                    @endif
                @endfor

                @if ($currRow % $rowsPerPage === 0)
                    </table>
                    <table>
                @endif

                <?php
                    $currRow++;
                ?>
            </tr>
        @endfor
    </table>
@endif