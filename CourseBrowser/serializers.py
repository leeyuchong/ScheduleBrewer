from rest_framework import serializers
from rest_framework import pagination
from .models import CourseInfo

class CourseSerializer(serializers.ModelSerializer):

    class Meta:
        model = CourseInfo
        fields = (
            "courseID",
            "title",
            "units",
            "sp",
            "max",
            "enr",
            "avl",
            "wl",
            "gm",
            "yl",
            "pr",
            "fr",
            "la",
            "qa",
            "format",
            "xlist",
            "d1",
            "time1",
            "starttime1",
            "endtime1",
            "duration1",
            "d2",
            "time2",
            "starttime2",
            "endtime2",
            "duration2",
            "loc",
            "instructor",
            "description",
            "limits",
            "requests",
        )

class SavedCoursesSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseInfo
        fields = (
            "courseID", 
            "title", 
            "units", 
            "format", 
            "d1",
            "time1",
            "starttime1",
            "endtime1", 
            "duration1",
            "d2",
            "time2",
            "starttime2",
            "endtime2",
            "duration2",
            "instructor",
            "description"
        )


# class PaginatedCourseSerializer(pagination.PaginationSerializer):
#     class Meta:
#         object_serializer_class=CourseSerializer