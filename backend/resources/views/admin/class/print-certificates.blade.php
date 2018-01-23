<style>
    .cert-item {
    font-size: 28px;
    margin: 680px 15px 100px 15px;
    text-align: center;
    line-height: 1.2em;
    font-family: "DejaVu Serif";
    page-break-after: always;
    } 
</style>
<div>
@if (isset($all) && $all)
        @foreach ($students as $student)
            <?php $index = 0; ?>
            {{--{{dd($student['course_students'])}}--}}
            <div class="cert-item">
                @foreach($student['course_students'] as $courseStudent)
                    @if($courseStudent['score'] != "")
                        @if($index < 1 )
                            <p>{{ $student['user_fullname'] }}</p>
                            <?php $index ++ ;?>
                        @endif
                    <p>{{$student['course_students'][0]['course']['course_title']}} {{$courseStudent['course_class']['class_time']}} - {{$courseStudent['score']}}</p>
                    @endif
                @endforeach
        @endforeach
    @else
    @foreach ($students as $student)
        @if(!empty($student->score) && isset($student->score) || !empty($namesOnly) && isset($namesOnly))
        <div class="cert-item">
            @if (!empty($student->score) || $namesOnly)
                <p>{{ $student->user->userFullname }}</p>
                @if (!$namesOnly)
                    <br>
                    <p>{{ $student->course->courseTitle }} - {{ $student->score }}</p>
                    <p>Term {{ $student->courseClass->term->term }} - {{ $student->courseClass->term->year }}</p>
                @endif
            @endif
        </div>
        @else
                @continue;
        @endif
    @endforeach
    @endif
</div>
