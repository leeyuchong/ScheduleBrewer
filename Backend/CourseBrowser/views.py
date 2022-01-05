import logging
from os import getenv

from django.conf import settings
from django.core.cache import cache
from django.db.models import Q, query
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from dotenv import load_dotenv
from rest_framework.decorators import api_view
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from onelogin.saml2.auth import OneLogin_Saml2_Auth

# from onelogin.saml2.settings import OneLogin_Saml2_Settings
from onelogin.saml2.utils import OneLogin_Saml2_Utils

from .models import CourseInfo, UserCourses
from .serializers import CourseSerializer, SavedCoursesSerializer

logger = logging.getLogger(__file__)

# For development
load_dotenv()


def get_dept_codes():
    courses = CourseInfo.objects.all()
    dept_codes = list(sorted(set([x.courseID.split("-")[0] for x in courses])))
    if "NONE" in dept_codes:
        dept_codes.remove("NONE")
    return dept_codes


def index(request):
    context = {
        "dept_codes": cache.get_or_set("dept_codes", get_dept_codes),
        "site_title": getenv("SITE_TITLE", default="Schedule Brewer"),
    }
    return render(request, "CourseBrowser/index.html", context)


@api_view(["GET"])
def search(request):
    courseCodes = cache.get("dept_codes")
    queriedCourses = CourseInfo.objects.filter(offered__exact=True)
    # <QueryDict: {'searchTerms': ['CMPU 102']}>
    for key, value in request.GET.items():
        # Search term from the search box
        if key == "searchTerms":
            terms = request.GET[key].upper().split()
            for term in terms:
                if term in courseCodes:
                    queriedCourses = queriedCourses.filter(
                        courseID__startswith=term
                    )
                elif term == "FR":
                    queriedCourses = queriedCourses.filter(fr__exact=1)
                elif term == "NR" or term == "NRO":
                    queriedCourses = queriedCourses.filter(gm__exact="NR")
                elif term == "SU":
                    queriedCourses = queriedCourses.filter(gm__exact="SU")
                elif term == "YL":
                    queriedCourses = queriedCourses.filter(yl__exact=1)
                elif term == "QA":
                    queriedCourses = queriedCourses.filter(qa__exact=1)
                elif term == "LA":
                    queriedCourses = queriedCourses.filter(la__exact=1)
                elif term == "SP":
                    queriedCourses = queriedCourses.filter(sp__exact=1)
                elif term == "CLS":
                    queriedCourses = queriedCourses.filter(format__exact="CLS")
                elif term == "INT":
                    queriedCourses = queriedCourses.filter(format__exact="INT")
                elif term == "OTH":
                    queriedCourses = queriedCourses.filter(format__exact="OTH")
                elif term == "MON" or term == "MONDAY":
                    queriedCourses = queriedCourses.filter(
                        Q(d1__contains="M") | Q(d2__contains="M")
                    )
                elif term == "TUE" or term == "TUESDAY":
                    queriedCourses = queriedCourses.filter(
                        Q(d1__contains="T") | Q(d2__contains="T")
                    )
                elif term == "WED" or term == "WEDNESDAY":
                    queriedCourses = queriedCourses.filter(
                        Q(d1__contains="W") | Q(d2__contains="W")
                    )
                elif term == "THUR" or term == "THURS" or term == "THURSDAY":
                    queriedCourses = queriedCourses.filter(
                        Q(d1__contains="R") | Q(d2__contains="R")
                    )
                elif term == "FRI" or term == "FRIDAY":
                    queriedCourses = queriedCourses.filter(
                        Q(d1__contains="F") | Q(d2__contains="F")
                    )
                elif term == "0.5" or term == "1.0" or term == "1.5":
                    queriedCourses = queriedCourses.filter(units__exact=term)
                else:
                    if len(term) > 0 and term[0] == "0":
                        term = term[1:]
                    queriedCourses = queriedCourses.filter(
                        Q(title__icontains=term)
                        | Q(loc__icontains=term)
                        | Q(instructor__icontains=term)
                        | Q(starttime1__contains=term)
                        | Q(starttime2__contains=term)
                        | Q(description__icontains=term)
                        | Q(courseID__icontains=term)
                    )
        # Department select box
        elif key == "department":
            queriedCourses = queriedCourses.filter(courseID__startswith=value)
        # Filters:
        elif key == "writingSem":
            queriedCourses = queriedCourses.filter(fr__exact=1)
        elif key == "gradeOption":
            queriedCourses = queriedCourses.filter(gm__exact=value)
        elif key == "yearLong":
            queriedCourses = queriedCourses.filter(yl__exact=1)
        elif key == "quant":
            queriedCourses = queriedCourses.filter(qa__exact=1)
        elif key == "lang":
            queriedCourses = queriedCourses.filter(la__exact=1)
        elif key == "specialPerm":
            queriedCourses = queriedCourses.filter(sp__exact=1)
        elif key == "courseFormat":
            queriedCourses = queriedCourses.filter(format__exact=value)
        elif key == "day":
            queriedCourses = queriedCourses.filter(
                Q(d1__contains=value) | Q(d2__contains=value)
            )
        elif key == "units":
            queriedCourses = queriedCourses.filter(units__exact=value)
        elif key == "ex-ind-cel":
            queriedCourses = queriedCourses.exclude(
                Q(courseID__contains=290)
                | Q(courseID__contains=399)
                | Q(courseID__contains=298)
            )
        elif key == "time":
            time = int(value)
            queriedCourses = queriedCourses.filter(
                (Q(starttime1__gte=time) & Q(starttime1__lte=time + 100))
                | Q(starttime2__gte=time) & Q(starttime2__lte=time + 100)
            )
        elif key == "curr":
            # if (
            #     "samlUserdata" in request.session
            #     and len(request.session["samlUserdata"]) > 0
            # ):
            powerset_of_days = (
                "M",
                "T",
                "W",
                "R",
                "F",
                "M,T",
                "M,W",
                "M,R",
                "M,F",
                "T,W",
                "T,R",
                "T,F",
                "W,R",
                "W,F",
                "R,F",
                "M,T,W",
                "M,T,R",
                "M,T,F",
                "M,W,R",
                "M,W,F",
                "M,R,F",
                "T,W,R",
                "T,W,F",
                "T,R,F",
                "W,R,F",
                "M,T,W,R",
                "M,T,W,F",
                "M,T,R,F",
                "M,W,R,F",
                "T,W,R,F",
                "M,T,W,R,F",
            )

            username = "test"  # request.session["samlUserdata"]["UserName"][0]
            current_courses = CourseInfo.objects.filter(
                usercourses__userID__exact=username
            )  # ).values(
            #     "courseID",
            #     "title",
            #     "units",
            #     "format",
            #     "d1",
            #     "time1",
            #     "starttime1",
            #     "endtime1",
            #     "duration1",
            #     "d2",
            #     "time2",
            #     "starttime2",
            #     "endtime2",
            #     "duration2",
            #     "instructor",
            #     "description",
            #     "offered",
            # )
            # available_times = [(800, 2200)]
            unavailable_times_combined = set(
                (
                    getattr(course, f"starttime{i}"),
                    getattr(course, f"endtime{i}"),
                    getattr(course, f"d{i}"),
                )
                for i in range(1, 3)
                for course in current_courses
            )
            unavailable_times_by_day = {
                "M": [],
                "T": [],
                "W": [],
                "R": [],
                "F": [],
            }
            available_times_by_day = dict()
            for course in unavailable_times_combined:
                if course[2]:
                    for d in course[2]:
                        unavailable_times_by_day[d].append(
                            (course[0], course[1])
                        )
            for day, intervals in unavailable_times_by_day.items():
                merged = []
                intervals.sort(key=lambda x: x[0], reverse=True)
                while intervals:
                    pair = intervals.pop()
                    if merged and merged[-1][1] >= pair[0]:
                        merged[-1][1] = max(pair[1], merged[-1][1])
                    else:
                        merged.append(pair)
                    if len(intervals) == 0:
                        merged.append((2359, 2359))
                avail_start_time = 600
                avail_blocks = []
                print(merged)
                for block in merged:
                    avail_blocks.append((avail_start_time, block[0]))
                    avail_start_time = block[1]
                if len(avail_blocks) == 0:
                    avail_blocks.append((600, 2359))
                # avail_blocks.append((avail_blocks[-1][1], 2359))
                available_times_by_day[day] = avail_blocks

            # m_fit_avail = [CourseInfo.objects.filter(offered)]
            # MW D1
            # mon = Q()
            # for block in available_times_by_day["M"]:
            #     mon |= Q(starttime1__range=block)
            # wed = Q()
            # for block in available_times_by_day["W"]:
            #     mon |= Q(starttime1__range=block)
            # mw_fit_avail = (
            #     CourseInfo.objects.filter(
            #         Q(offered__exact=True) & Q(d1__exact="MW")
            #     )
            #     .filter(mon)
            #     .filter(wed)
            # )
            # # MW D2

            # mw_avail_d2Null = mw_fit_avail.filter(d2__isnull=True)
            # mw_avail_d2NotNull = mw_fit_avail.filter(d2__isnull=False)
            # mw_avail_d2 =

            querysets_that_fit_avail = {
                "d1_d2IsNull": [],
                "d1_d2NotNull": [],
                "d2": [],
            }
            for i in range(1, 3):
                for day_set in powerset_of_days:
                    # day_set_query_init = CourseInfo.objects.filter(
                    #     offered__exact=True
                    # ).filter(**{f"d{i}__exact": day_set})
                    qs = []
                    for day in day_set.split(","):
                        q = Q(offered__exact=True) & Q(
                            **{f"d{i}__exact": day_set}
                        )
                        # day_set_query = CourseInfo.objects.none().union(
                        #     *[
                        #         day_set_query_init.filter(
                        #             **{f"starttime{i}__range": block}
                        #         )
                        #         # & Q(**{f"endtime{i}__lt": block[1]})
                        #         for block in available_times_by_day[day]
                        #     ]
                        # )
                        for block in available_times_by_day[day]:
                            q |= Q(**{f"starttime{i}__gt": block[0]}) & Q(
                                **{f"endtime{i}__lt": block[1]}
                            )
                            # day_set_query = day_set_query_init.filter(
                            #     (
                            #         Q(**{f"starttime{i}__range": block})
                            #         & Q(**{f"endtime{i}__lt": block[1]})
                            #     )
                            # )
                        qs.append(q)
                    for index in range(len(qs)):
                        if i == 1:
                            querysets_that_fit_avail["d1_d2NotNull"].append(
                                qs[index] & Q(d2__isnull=False)
                            )
                            querysets_that_fit_avail["d1_d2IsNull"].append(
                                qs[index] & Q(d2__isnull=True)
                            )
                        else:
                            querysets_that_fit_avail["d2"].append(qs[index])

            # for day_avail, avails in available_times_by_day.items():
            #     day_query = CourseInfo.objects.filter(
            #         offered__exact=True
            #     ).filter(
            #         (Q(d1__contains=day_avail) | Q(d2__contains=day_avail))
            #     )
            #     for b in avails:
            #         day_query = day_query.filter(
            #             (Q(starttime1__gt=b[0]) & Q(endtime1__lt=b[1]))
            #             | (
            #                 Q(starttime2__isnull=False)
            #                 & Q(starttime2__gt=b[0])
            #                 & Q(endtime2__lt=b[1])
            #             )
            #         )
            #     querysets_that_fit_avail.append(day_query)
            avail_d1_d2NotNull = Q()
            for qset in querysets_that_fit_avail["d1_d2NotNull"]:
                avail_d1_d2NotNull &= qset
            course_codes_fit_avail_d1_d2NotNull = set(
                qsx.courseID
                for qsx in CourseInfo.objects.filter(avail_d1_d2NotNull)
            )
            avail_d1_d2IsNull = Q()
            for qset in querysets_that_fit_avail["d1_d2IsNull"]:
                avail_d1_d2IsNull &= qset
            course_codes_fit_avail_d1_d2IsNull = set(
                qssdd.courseID
                for qssdd in CourseInfo.objects.filter(avail_d1_d2IsNull)
            )
            avail = Q()
            for qset in querysets_that_fit_avail["d2"]:
                avail &= qset
            course_codes_fit_avail_d2 = set(
                q.courseID for q in CourseInfo.objects.filter(avail)
            )
            course_codes_fit_avail_all = (
                course_codes_fit_avail_d1_d2NotNull.intersection(
                    course_codes_fit_avail_d2
                )
            ).union(course_codes_fit_avail_d1_d2IsNull)
            queriedCourses = queriedCourses.filter(
                courseID__in=course_codes_fit_avail_all
            )
            # print(querysets_that_fit_avail[1])
            print(available_times_by_day)
            print(course_codes_fit_avail_all)
            # for course in queriedCourses:
            #     for i in range(1,3):
            #         starttime = getattr(course, f"starttime{i}")
            #         endtime = getattr(course, f"endtime{i}")
            #         day = getattr(course, f"d{i}")
            #         for index, free_block in enumerate(available_times):
            #             # starttime and endtime are in the free region -> split the free region
            #             # e.g. course: 9-1015, avail: [(800,2200)] -> [(800, 900), [1015, 2200]]
            #             if starttime > free_block[0] and endtime < free_block[1]:

            #             # startime is free but endtime is not -> make the 2nd avail start time later
            #             # e.g. course: 1015-1200, avail: [(800,900), (1100-2200)] -> [(800,900), (1200-2200)]
            #             if

            #         # starttime is not free but endtime is free -> make the 1st avail end earlier
            #         # e.g. course: 845-1015, avail: [(800,900), (1100,2200)] -> [(800,845), (1100, 2200)]

            #         # startime and endtime are not free -> do nothing

    queriedCourses = queriedCourses.order_by("courseID")
    paginator = PageNumberPagination()
    context = paginator.paginate_queryset(queriedCourses, request)
    serializer = CourseSerializer(context, many=True)
    return paginator.get_paginated_response(serializer.data)


class SavedCourses(APIView):
    attributes = False
    username = ""

    # Get the username
    def getAttributes(self, request):
        # If user is logged in
        if (
            "samlUserdata" in request.session
            and len(request.session["samlUserdata"]) > 0
        ):
            self.attributes = request.session["samlUserdata"].items()
            self.username = request.session["samlUserdata"]["UserName"][0]
        # For development, check if base url is using local host
        elif "127.0.0.1" in getenv("BASE_URL"):
            self.attributes = True
            self.username = "test"

    # Get saved courses
    def get(self, request, format=None):
        self.getAttributes(request)
        if self.attributes:
            queriedCourses = CourseInfo.objects.filter(
                usercourses__userID__exact=self.username
            ).values(
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
                "description",
                "offered",
            )
            serializer = SavedCoursesSerializer(
                queriedCourses, context={"request": request}, many=True
            )
            return Response(serializer.data)
        else:
            return HttpResponse("Unauthorised", status=401)

    # Save new course to user profile
    def post(self, request, format=None):
        self.getAttributes(request)
        if self.attributes:
            selectedCourse = request.POST
            course = CourseInfo.objects.get(
                courseID__exact=selectedCourse["course"]
            )
            UserCourses.objects.create(userID=self.username, courseID=course)
            return HttpResponse("Success")
        else:
            return HttpResponse("Unauthorised", status=401)

    # Delete course from user profile
    def delete(self, request, pk, format=None):
        self.getAttributes(request)
        if self.attributes:
            course = UserCourses.objects.filter(
                userID__exact=self.username
            ).filter(courseID__exact=pk)
            course.delete()
            return HttpResponse("Success")
        else:
            return HttpResponse("Unauthorised", status=401)


# Save a new csrf cookie to the client
@ensure_csrf_cookie
def getCSRFCookie(request):
    return JsonResponse({"Success": "CSRF Cookie set"}, status=200)


def init_saml_auth(req):
    auth = OneLogin_Saml2_Auth(req, custom_base_path=settings.SAML_FOLDER)
    return auth


# SAML code from here to end of file
def prepare_django_request(request):
    # If server is behind proxys or balancers use the HTTP_X_FORWARDED fields
    result = {
        "https": "on",
        "http_host": "schedulebrewer.vassar.edu",
        "script_name": request.META["PATH_INFO"],
        "server_port": "443",
        "get_data": request.GET.copy(),
        # Uncomment if using ADFS as IdP, https://github.com/onelogin/python-saml/pull/144
        # 'lowercase_urlencoding': True,
        "post_data": request.POST.copy(),
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

    if "sso" in req["get_data"]:
        return HttpResponseRedirect(
            auth.login(return_to="https://schedulebrewer.vassar.edu")
        )
        # If AuthNRequest ID need to be stored in order to later validate it, do instead
        # sso_built_url = auth.login()
        # request.session['AuthNRequestID'] = auth.get_last_request_id()
        # return HttpResponseRedirect(sso_built_url)
    elif "sso2" in req["get_data"]:
        return_to = OneLogin_Saml2_Utils.get_self_url(req) + reverse("attrs")
        return HttpResponseRedirect(auth.login(return_to))
    elif "slo" in req["get_data"]:
        name_id = (
            session_index
        ) = name_id_format = name_id_nq = name_id_spnq = None
        if "samlNameId" in request.session:
            name_id = request.session["samlNameId"]
        if "samlSessionIndex" in request.session:
            session_index = request.session["samlSessionIndex"]
        if "samlNameIdFormat" in request.session:
            name_id_format = request.session["samlNameIdFormat"]
        if "samlNameIdNameQualifier" in request.session:
            name_id_nq = request.session["samlNameIdNameQualifier"]
        if "samlNameIdSPNameQualifier" in request.session:
            name_id_spnq = request.session["samlNameIdSPNameQualifier"]
        return HttpResponseRedirect(
            auth.logout(
                name_id=name_id,
                session_index=session_index,
                nq=name_id_nq,
                name_id_format=name_id_format,
                spnq=name_id_spnq,
                return_to="https://schedulebrewer.vassar.edu",
            )
        )
        # If LogoutRequest ID need to be stored in order to later validate it, do instead
        # slo_built_url = auth.logout(name_id=name_id, session_index=session_index)
        # request.session['LogoutRequestID'] = auth.get_last_request_id()
        # return HttpResponseRedirect(slo_built_url)
    elif "acs" in req["get_data"]:
        request_id = None
        if "AuthNRequestID" in request.session:
            request_id = request.session["AuthNRequestID"]

        auth.process_response(request_id=request_id)
        errors = auth.get_errors()
        not_auth_warn = not auth.is_authenticated()

        if not errors:
            if "AuthNRequestID" in request.session:
                del request.session["AuthNRequestID"]
            request.session["samlUserdata"] = auth.get_attributes()
            request.session["samlNameId"] = auth.get_nameid()
            request.session["samlNameIdFormat"] = auth.get_nameid_format()
            request.session["samlNameIdNameQualifier"] = auth.get_nameid_nq()
            request.session[
                "samlNameIdSPNameQualifier"
            ] = auth.get_nameid_spnq()
            request.session["samlSessionIndex"] = auth.get_session_index()
            if "RelayState" in req["post_data"]:
                return HttpResponseRedirect(
                    auth.redirect_to(req["post_data"]["RelayState"])
                )
        elif auth.get_settings().is_debug_active():
            error_reason = auth.get_last_error_reason()
    elif "sls" in req["get_data"]:
        request_id = None
        if "LogoutRequestID" in request.session:
            request_id = request.session["LogoutRequestID"]
        dscb = lambda: request.session.flush()
        url = auth.process_slo(request_id=request_id, delete_session_cb=dscb)
        errors = auth.get_errors()
        if len(errors) == 0:
            return HttpResponseRedirect("/")
        elif auth.get_settings().is_debug_active():
            error_reason = auth.get_last_error_reason()

    if "samlUserdata" in request.session:
        paint_logout = True
        if len(request.session["samlUserdata"]) > 0:
            attributes = request.session["samlUserdata"].items()

    return render(
        request,
        "samlTemplate/index.html",
        {
            "errors": errors,
            "error_reason": error_reason,
            "not_auth_warn": not_auth_warn,
            "success_slo": success_slo,
            "attributes": attributes,
            "paint_logout": paint_logout,
        },
    )


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
