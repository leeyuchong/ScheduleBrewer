from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import CourseInfo, UserCourses
from .serializers import *
from django.conf import settings
from django.urls import reverse
from django.http import (HttpResponse, HttpResponseRedirect,
                         HttpResponseServerError, JsonResponse)
from onelogin.saml2.auth import OneLogin_Saml2_Auth
from onelogin.saml2.settings import OneLogin_Saml2_Settings
from onelogin.saml2.utils import OneLogin_Saml2_Utils
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
import logging

logger = logging.getLogger(__file__)

@csrf_exempt
def index(request):
  return render(request, 'CourseBrowser/index.html')

@csrf_exempt
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

class SavedCourses(APIView):
    attributes = False
    username=""
    def getAttributes(self, request):
        if 'samlUserdata' in request.session:
            logger.info("A")
            if len(request.session['samlUserdata']) > 0:
                self.attributes = request.session['samlUserdata'].items()
                self.username=request.session['samlUserdata']['UserName'][0]
    def get(self, request, format=None):
        self.getAttributes(request)
        logger.info("GET")
        logger.info(self.attributes)
        if(self.attributes):
            queriedCourses = CourseInfo.objects.filter(usercourses__userID__exact=self.username).values(
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
        else:
            return HttpResponse('Unauthorised', status=401)

    def post(self, request, format=None):
        self.getAttributes(request)
        logger.info("POST")
        logger.info(self.attributes)
        if(self.attributes):
            if request.method=="POST":
                selectedCourse = request.POST
                # print(selectedCourse["course"])
                course=CourseInfo.objects.get(courseID__exact=selectedCourse["course"])
                # newCourse = UserCourses.objects.create(userID=selectedCourse["token"])
                newPair = UserCourses.objects.create(userID=self.username, courseID=course)
                return HttpResponse("Success")
        else:
            return HttpResponse('Unauthorised', status=401)

    def delete(self, request, pk, format=None):
        self.getAttributes(request)
        if(self.attributes):
            if request.method=="DELETE":
                # print(request.body.decode("utf-8"))
                # selectedCourse = request.POST
                # print(selectedCourse["course"])
                course=UserCourses.objects.filter(userID__exact=self.username).filter(courseID__exact=pk)
                course.delete()
                return HttpResponse("Success")
        else:
            return HttpResponse('Unauthorised', status=401)

# @api_view(['GET'])
# def getSavedCourses(request):
#     # print("Request.GET", request.headers)
#     queriedCourses = CourseInfo.objects.filter(usercourses__userID__exact=request.headers["Authorization"]).values(
#         "courseID", 
#         "title", 
#         "units", 
#         "format", 
#         "d1",
#         "time1",
#         "starttime1",
#         "endtime1",
#         "duration1",
#         "d2",
#         "time2",
#         "starttime2",
#         "endtime2",
#         "duration2",
#         "instructor",
#         "description"
#         )
#     # print(queriedCourses)
#     serializer = SavedCoursesSerializer(queriedCourses, context={'request': request}, many=True)
#     return Response(serializer.data)

# @api_view(['POST'])
# def saveCourse(request):
#     print(request)
#     if request.method=="POST":
#         selectedCourse = request.POST
#         # print(selectedCourse["course"])
#         course=CourseInfo.objects.get(courseID__exact=selectedCourse["course"])
#         # newCourse = UserCourses.objects.create(userID=selectedCourse["token"])
#         newPair = UserCourses.objects.create(userID=request.headers["Authorization"], courseID=course)
#         #         print("A", course)
#         # newCourse.savedCourse.set(course)

#     return HttpResponse("Success")

# @api_view(['DELETE'])
# def delCourse(request, pk):
#     # print(request)
#     if request.method=="DELETE":
#         # print(request.body.decode("utf-8"))
#         # selectedCourse = request.POST
#         # print(selectedCourse["course"])
#         course=UserCourses.objects.filter(userID__exact=request.headers["Authorization"]).filter(courseID__exact=pk)
#         course.delete()
#     return HttpResponse("Success")

@csrf_exempt
@ensure_csrf_cookie
def getCSRFCookie(request):
    return JsonResponse({'Success': 'CSRF Cookie set'}, status=200)

def init_saml_auth(req):
    auth = OneLogin_Saml2_Auth(req, custom_base_path=settings.SAML_FOLDER)
    return auth

def prepare_django_request(request):
    # If server is behind proxys or balancers use the HTTP_X_FORWARDED fields
    result = {
        'https': 'on',
        'http_host': 'schedulebrewer.ml',
        'script_name': request.META['PATH_INFO'],
        'server_port': '443',
        'get_data': request.GET.copy(),
        # Uncomment if using ADFS as IdP, https://github.com/onelogin/python-saml/pull/144
        # 'lowercase_urlencoding': True,
        'post_data': request.POST.copy()
    }
    return result

@csrf_exempt
def saml_index(request):
    req = prepare_django_request(request)
    auth = init_saml_auth(req)
    errors = []
    error_reason = None
    not_auth_warn = False
    success_slo = False
    attributes = False
    paint_logout = False

    if 'sso' in req['get_data']:
        return HttpResponseRedirect(auth.login(return_to='https://schedulebrewer.ml'))
        # If AuthNRequest ID need to be stored in order to later validate it, do instead
        # sso_built_url = auth.login()
        # request.session['AuthNRequestID'] = auth.get_last_request_id()
        # return HttpResponseRedirect(sso_built_url)
    elif 'sso2' in req['get_data']:
        return_to = OneLogin_Saml2_Utils.get_self_url(req) + reverse('attrs')
        return HttpResponseRedirect(auth.login(return_to))
    elif 'slo' in req['get_data']:
        name_id = session_index = name_id_format = name_id_nq = name_id_spnq = None
        if 'samlNameId' in request.session:
            name_id = request.session['samlNameId']
        if 'samlSessionIndex' in request.session:
            session_index = request.session['samlSessionIndex']
        if 'samlNameIdFormat' in request.session:
            name_id_format = request.session['samlNameIdFormat']
        if 'samlNameIdNameQualifier' in request.session:
            name_id_nq = request.session['samlNameIdNameQualifier']
        if 'samlNameIdSPNameQualifier' in request.session:
            name_id_spnq = request.session['samlNameIdSPNameQualifier']

        return HttpResponseRedirect(auth.logout(name_id=name_id, session_index=session_index, nq=name_id_nq, name_id_format=name_id_format, spnq=name_id_spnq, return_to='https://schedulebrewer.ml'))
        # If LogoutRequest ID need to be stored in order to later validate it, do instead
        # slo_built_url = auth.logout(name_id=name_id, session_index=session_index)
        # request.session['LogoutRequestID'] = auth.get_last_request_id()
        # return HttpResponseRedirect(slo_built_url)
    elif 'acs' in req['get_data']:
        request_id = None
        if 'AuthNRequestID' in request.session:
            request_id = request.session['AuthNRequestID']

        auth.process_response(request_id=request_id)
        errors = auth.get_errors()
        not_auth_warn = not auth.is_authenticated()

        if not errors:
            if 'AuthNRequestID' in request.session:
                del request.session['AuthNRequestID']
            request.session['samlUserdata'] = auth.get_attributes()
            request.session['samlNameId'] = auth.get_nameid()
            request.session['samlNameIdFormat'] = auth.get_nameid_format()
            request.session['samlNameIdNameQualifier'] = auth.get_nameid_nq()
            request.session['samlNameIdSPNameQualifier'] = auth.get_nameid_spnq()
            request.session['samlSessionIndex'] = auth.get_session_index()
            if 'RelayState' in req['post_data']:
                return HttpResponseRedirect(auth.redirect_to(req['post_data']['RelayState']))
        elif auth.get_settings().is_debug_active():
            error_reason = auth.get_last_error_reason()
    elif 'sls' in req['get_data']:
        request_id = None
        if 'LogoutRequestID' in request.session:
            request_id = request.session['LogoutRequestID']
        dscb = lambda: request.session.flush()
        url = auth.process_slo(request_id=request_id, delete_session_cb=dscb)
        errors = auth.get_errors()
        if len(errors) == 0:
            return HttpResponseRedirect('/')
        elif auth.get_settings().is_debug_active():
            error_reason = auth.get_last_error_reason()

    if 'samlUserdata' in request.session:
        paint_logout = True
        if len(request.session['samlUserdata']) > 0:
            attributes = request.session['samlUserdata'].items()

    return render(request, 'samlTemplate/index.html', {'errors': errors, 'error_reason': error_reason, 'not_auth_warn': not_auth_warn, 'success_slo': success_slo, 'attributes': attributes, 'paint_logout': paint_logout})

# def attrs(request):
#     paint_logout = False
#     attributes = False

#     if 'samlUserdata' in request.session:
#         paint_logout = True
#         if len(request.session['samlUserdata']) > 0:
#             attributes = request.session['samlUserdata'].items()
#     return render(request, 'samlTemplate/attrs.html',
#                   {'paint_logout': paint_logout,
#                    'attributes': attributes})


# def metadata(request):
#     # req = prepare_django_request(request)
#     # auth = init_saml_auth(req)
#     # saml_settings = auth.get_settings()
#     saml_settings = OneLogin_Saml2_Settings(settings=None, custom_base_path=settings.SAML_FOLDER, sp_validation_only=True)
#     metadata = saml_settings.get_sp_metadata()
#     errors = saml_settings.validate_metadata(metadata)

#     if len(errors) == 0:
#         resp = HttpResponse(content=metadata, content_type='text/xml')
#     else:
#         resp = HttpResponseServerError(content=', '.join(errors))
#     return resp
