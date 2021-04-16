from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from django.http import HttpResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from .models import CourseInfo, UserCourses
from .serializers import *

def index(request):
  return render(request, 'CourseBrowser/index.html')

@api_view(['GET'])
def search(request):
    courseCodes = ("AFRS", "AMCL", "AMST", "ANSO", "ANTH", "AFRS", "ART", "ARTH", "ARTS", "ASIA", "ASL", "ASTR", "BIOC", "BIOL", "BIPS", "CHEM", "CHIN", "CHJA", "CLAN", "CLAS", "CLGR", "CLLA", "CLCS", "CMPU", "COGS", "CREO", "DANC", "DRAM", "ECON", "EDUC", "ENGL", "ENST", "ENVI", "ESCI", "ESSC", "FFS", "FILM", "FREN", "GEAN", "GEOG", "GEOL", "GERM", "GREK", "GRST", "HEBR", "HIND", "HISP", "HIST", "INDP", "INTD", "INTL", "IRSH", "ITAL", "JAPA", "JWST", "ASIA", "LALS", "LAST", "LATI", "MATH", "MEDS", "MRST", "MSDP", "MUSI", "NEUR", "PERS", "PHED", "PHIL", "PHYS", "POLI", "PORT", "PSYC", "PSYC", "RELI", "RUSS", "SOCI", "STS", "SWAH", "SWED", "TURK", "URBS", "VICT", "WMST", "YIDD")    

    # Check to see if user made a search. Add or delete course will get to the search page without a search query
    # if request.method == 'GET':
    # print(request.GET)
    # Searching the database for the query. Create MySQL query manually to search all columns for the keyword
    
    # if request.GET.items() == []:
    #     queriedCourses = CourseInfo.objects.none()
    # else:
    #     queriedCourses = CourseInfo.objects.all()
    queriedCourses = CourseInfo.objects.all()
    # <QueryDict: {'searchTerm': ['CMPU 102']}>
    for key, value in request.GET.items():
        if key == "searchTerms":
            terms = request.GET[key].upper().split()
            for term in terms:
                # print(term)
                if term in courseCodes: 
                    queriedCourses = queriedCourses.filter(courseID__startswith=term)
                elif term == "FR": queriedCourses = queriedCourses.filter(fr__exact=1)
                elif term == "NR" or term == "NRO": queriedCourses = queriedCourses.filter(gm__exact="NR")
                elif term == "SU": queriedCourses = queriedCourses.filter(gm__exact="SU")
                elif term == "YL": queriedCourses = queriedCourses.filter(yl__exact=1)
                elif term == "QA": queriedCourses = queriedCourses.filter(qa__exact=1)
                elif term == "LA": queriedCourses = queriedCourses.filter(la__exact=1)
                elif term == "SP": queriedCourses = queriedCourses.filter(sp__exact=1)
                elif term == "CLS": queriedCourses = queriedCourses.filter(format__exact="CLS")
                elif term == "INT": queriedCourses = queriedCourses.filter(format__exact="INT")
                elif term == "OTH": queriedCourses = queriedCourses.filter(format__exact="OTH")
                elif term == "MON" or term == "MONDAY":
                    queriedCourses = queriedCourses.filter(Q(d1__contains="M") | Q(d2__contains="M"))
                elif term == "TUE" or term == "TUESDAY":
                    queriedCourses = queriedCourses.filter(Q(d1__contains="T") | Q(d2__contains="T"))
                elif term == "WED" or term == "WEDNESDAY":
                    queriedCourses = queriedCourses.filter(Q(d1__contains="W") | Q(d2__contains="W"))
                elif term == "THUR" or term == "THURS" or term == "THURSDAY":
                    queriedCourses = queriedCourses.filter(Q(d1__contains="R") | Q(d2__contains="R"))
                elif term == "FRI" or term == "FRIDAY":
                    queriedCourses = queriedCourses.filter(Q(d1__contains="F") | Q(d2__contains="F"))
                elif term == "0.5" or term == "1.0" or term == "1.5":
                    queriedCourses = queriedCourses.filter(units__exact=term)
                else:
                    if len(term)>0 and term[0]=="0":
                        term=term[1:]
                    queriedCourses = queriedCourses.filter(
                        Q(title__contains=term) | 
                        Q(loc__contains=term) | 
                        Q(instructor__contains=term) | 
                        Q(starttime1__contains=term) | 
                        Q(starttime2__contains=term) |
                        Q(description__contains=term)
                    )
        elif key=="department":
            queriedCourses = queriedCourses.filter(courseID__startswith=value)
        elif key == "writingSem": queriedCourses = queriedCourses.filter(fr__exact=1)
        elif key == "gradeOption": queriedCourses = queriedCourses.filter(gm__exact=value)
        elif key == "yearLong": queriedCourses = queriedCourses.filter(yl__exact=1)
        elif key == "quant": queriedCourses = queriedCourses.filter(qa__exact=1)
        elif key == "lang": queriedCourses = queriedCourses.filter(la__exact=1)
        elif key == "specialPerm": queriedCourses = queriedCourses.filter(sp__exact=1)
        elif key == "courseFormat": queriedCourses = queriedCourses.filter(format__exact=value)
        elif key == "day":
            queriedCourses = queriedCourses.filter(Q(d1__contains=value) | Q(d2__contains=value))
        elif key == "units":
            queriedCourses = queriedCourses.filter(units__exact=value)
    queriedCourses=queriedCourses.order_by('courseID')
    # print(queriedCourses)
    # serializer = CourseSerializer(queriedCourses, context={'request': request}, many=True)

    # paginator = Paginator(queriedCourses, 20)
    # page = request.QUERY_PARAMS.get('page')
    # try:
    #     courses = paginator.page(page)
    # except PageNotAnInteger:
    #     # If page is not an integer, deliver first page.
    #     courses = paginator.page(1)
    # except EmptyPage:
    #     # If page is out of range (e.g. 9999),
    #     # deliver last page of results.
    #     courses = paginator.page(paginator.num_pages)

    # serializer_context = {'request': request}
    # serializer = PaginatedUserSerializer(courses,
    #                                     context=serializer_context)
    paginator = PageNumberPagination()
    context = paginator.paginate_queryset(queriedCourses, request)
    serializer = CourseSerializer(context, many=True)
    return paginator.get_paginated_response(serializer.data)
    # return Response(serializer.data)

@api_view(['GET'])
def getSavedCourses(request):
    # print("Request.GET", request.headers)
    queriedCourses = CourseInfo.objects.filter(usercourses__userID__exact=request.headers["Authorization"]).values(
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
    # print(queriedCourses)
    serializer = SavedCoursesSerializer(queriedCourses, context={'request': request}, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def saveCourse(request):
    print(request)
    if request.method=="POST":
        # print("A", request.body.decode("utf-8"))
        # print("B", request.headers["Authorization"])
        # print("C", type(request.headers))
        selectedCourse = request.POST
        # print(selectedCourse["course"])
        course=CourseInfo.objects.get(courseID__exact=selectedCourse["course"])
        # newCourse = UserCourses.objects.create(userID=selectedCourse["token"])
        newPair = UserCourses.objects.create(userID=request.headers["Authorization"], courseID=course)
        #         print("A", course)
        # newCourse.savedCourse.set(course)

    return HttpResponse("Success")

@api_view(['DELETE'])
def delCourse(request, pk):
    # print(request)
    if request.method=="DELETE":
        # print(request.body.decode("utf-8"))
        # selectedCourse = request.POST
        # print(selectedCourse["course"])
        course=UserCourses.objects.filter(userID__exact=request.headers["Authorization"]).filter(courseID__exact=pk)
        course.delete()
    return HttpResponse("Success")

@ensure_csrf_cookie
def getCSRFCookie(request):
    return JsonResponse({'Success': 'CSRF Cookie set'}, status=200)

