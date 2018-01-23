<style>
    p, b {
        margin: 0;
        font-size: 14pt;
    }

    th, td {
        text-align: center;
    }
</style>

<table width="100%" border="0" cellspacing="0" cellpadding="0">
    <thead>
        <tr>
            <th scope="col">Fullname</th>
            <th scope="col">Course Title</th>
            <th scope="col">Class Term</th>
            <th scope="col">Class Year</th>
            <th scope="col">Grade</th>
            <th scope="col">Feedback</th>
        </tr>
    </thead>
    @for ($i = 0; $i < count($users); $i++)
        <tr>
            <td>{{ $users[$i]->fullName }}</td>
            <td>{{ $users[$i]->courseTitle }}</td>
            <td>{{ $users[$i]->termNumber }}</td>
            <td>{{ $users[$i]->year }}</td>

            @if (!empty($users[$i]->grade))
                <td>{{ $users[$i]->grade }}</td>
            @else
                <td><span> - </span></td>
            @endif

            @if (!empty($users[$i]->feedback))
                <td style="width: 10%">{{ $users[$i]->feedback }}</td>
            @else
                <td style="width: 10%"><span> - </span></td>
            @endif
        </tr>
    @endfor
</table>