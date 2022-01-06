import logging
from os import getenv

from collections import namedtuple
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

load_dotenv()
HOSTNAME = getenv("HOSTNAME")


SearchParameters = namedtuple("SearchParameters", ("key", "value"))


def concatenateQObjs(qs: list, operator: str) -> Q:
    retval = Q()
    if operator == "&":
        for q in qs:
            retval &= q
    else:
        for q in qs:
            retval |= q
    return retval


def get_dept_codes():
    courses = CourseInfo.objects.all()
    dept_codes = list(sorted(set([x.courseID.split("-")[0] for x in courses])))
    if "NONE" in dept_codes:
        dept_codes.remove("NONE")
    return dept_codes


def index(request):
    context = {"host": HOSTNAME}
    if request.get_host() == HOSTNAME:
        context["dept_codes"] = cache.get_or_set("dept_codes", get_dept_codes)
        context["site_title"] = getenv("SITE_TITLE", default="Schedule Brewer")
        return render(request, "CourseBrowser/index.html", context)
    else:
        return render(request, "CourseBrowser/redirect.html", context)


@api_view(["GET"])
def search(request):
    courseCodes = cache.get("dept_codes")
    queriedCourses = CourseInfo.objects.filter(offered=True)
    searchParams = [
        SearchParameters(key, value) for key, value in request.GET.items()
    ]
    while searchParams:
        param = searchParams.pop()
        if param.key == "searchTerms":
            terms = param.value.upper().split()
            for term in terms:
                if term in courseCodes:
                    searchParams.append(SearchParameters("department", term))
                elif term == "FR":
                    searchParams.append(SearchParameters("writingSem", True))
                elif term == "NR" or term == "NRO":
                    searchParams.append(SearchParameters("gradeOption", "NR"))
                elif term == "SU":
                    searchParams.append(SearchParameters("gradeOption", "SU"))
                elif term == "YL":
                    searchParams.append(SearchParameters("yearLong", True))
                elif term == "QA":
                    searchParams.append(SearchParameters("quant", True))
                elif term == "LA":
                    searchParams.append(SearchParameters("lang", True))
                elif term == "SP":
                    searchParams.append(SearchParameters("specialPerm", True))
                elif term in ("CLS", "INT", "OTH"):
                    searchParams.append(SearchParameters("courseFormat", term))
                elif term in (
                    "MON",
                    "MONDAY",
                    "TUE",
                    "TUESDAY",
                    "WED",
                    "WEDNESDAY",
                    "THUR",
                    "THURSDAY",
                    "FRI",
                    "FRIDAY",
                ):
                    searchParams.append(
                        SearchParameters(
                            "day", term[0] if "THUR" not in term else "R"
                        )
                    )
                elif term == "0.5" or term == "1.0" or term == "1.5":
                    searchParams.append(SearchParameters("units", term))
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
        elif param.key == "department":
            queriedCourses = queriedCourses.filter(
                courseID__startswith=param.value
            )
        elif param.key == "writingSem":
            queriedCourses = queriedCourses.filter(fr=1)
        elif param.key == "gradeOption":
            queriedCourses = queriedCourses.filter(gm=param.value)
        elif param.key == "yearLong":
            queriedCourses = queriedCourses.filter(yl=1)
        elif param.key == "quant":
            queriedCourses = queriedCourses.filter(qa=1)
        elif param.key == "lang":
            queriedCourses = queriedCourses.filter(la=1)
        elif param.key == "specialPerm":
            queriedCourses = queriedCourses.filter(sp=1)
        elif param.key == "courseFormat":
            queriedCourses = queriedCourses.filter(format=param.value)
        elif param.key == "day":
            queriedCourses = queriedCourses.filter(
                Q(d1__contains=param.value) | Q(d2__contains=param.value)
            )
        elif param.key == "units":
            queriedCourses = queriedCourses.filter(units=param.value)
        elif param.key == "exIndCEL":
            queriedCourses = queriedCourses.exclude(
                Q(courseID__contains=290)
                | Q(courseID__contains=399)
                | Q(courseID__contains=298)
            )
        elif param.key == "time":
            time = int(param.value)
            queriedCourses = queriedCourses.filter(
                (Q(starttime1__gte=time) & Q(starttime1__lte=time + 100))
                | (Q(starttime2__gte=time) & Q(starttime2__lte=time + 100))
            )
        elif param.key == "courseLength":
            queriedCourses = queriedCourses(courselength=param.value)
        elif param.key == "division":
            queriedCourses = queriedCourses(division=param.value)
        elif param.key == "fitCurr":
            if (
                "samlUserdata" in request.session
                and len(request.session["samlUserdata"]) > 0
            ) or "127.0.0.1" in HOSTNAME:
                username = (
                    request.session["samlUserdata"]["UserName"][0]
                    if "127.0.0.1" not in HOSTNAME
                    else "test"
                )
                current_courses = CourseInfo.objects.filter(
                    usercourses__userID=username
                ).values(
                    "d1",
                    "starttime1",
                    "endtime1",
                    "d2",
                    "starttime2",
                    "endtime2",
                )
                # Get user's available times
                # available_times are in range of [(800, 2359)]
                unavailable_times_combined = set(
                    (
                        course[f"starttime{i}"],
                        course[f"endtime{i}"],
                        course[f"d{i}"],
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
                # merge overlapping intervals
                for day, intervals in unavailable_times_by_day.items():
                    merged = []
                    intervals.sort(key=lambda x: x[0], reverse=True)
                    while intervals:
                        interval = intervals.pop()
                        if merged and merged[-1][1] >= interval[0]:
                            merged[-1][1] = max(interval[1], merged[-1][1])
                        else:
                            merged.append(interval)
                        if len(intervals) == 0:
                            merged.append((2359, 2359))
                    avail_start_time = 600
                    avail_blocks = []
                    for block in merged:
                        avail_blocks.append((avail_start_time, block[0]))
                        avail_start_time = block[1]
                    if len(avail_blocks) == 0:
                        avail_blocks.append((600, 2359))
                    available_times_by_day[day] = avail_blocks

                powerset_of_days = (
                    "M",
                    "T",
                    "W",
                    "R",
                    "F",
                    "MT",
                    "MW",
                    "MR",
                    "MF",
                    "TW",
                    "TR",
                    "TF",
                    "WR",
                    "WF",
                    "RF",
                    "MTW",
                    "MTR",
                    "MTF",
                    "MWR",
                    "MWF",
                    "MRF",
                    "TWR",
                    "TWF",
                    "TRF",
                    "WRF",
                    "MTWR",
                    "MTWF",
                    "MTRF",
                    "MWRF",
                    "TWRF",
                    "MTWRF",
                )
                querysets_that_fit_avail = {
                    "d1_d2IsNull": [],
                    "d1_d2NotNull": [],
                    "d2": [],
                }
                for i in (1, 2):
                    for day_set in powerset_of_days:
                        qs = [
                            (
                                Q(offered=True)
                                & Q(**{f"d{i}": day_set})
                                & concatenateQObjs(
                                    (
                                        (
                                            Q(
                                                **{
                                                    f"starttime{i}__gt": block[
                                                        0
                                                    ]
                                                }
                                            )
                                            & Q(
                                                **{f"endtime{i}__lt": block[1]}
                                            )
                                        )
                                        for block in available_times_by_day[
                                            day
                                        ]
                                    ),
                                    "|",
                                )
                            )
                            for day in day_set
                        ]
                        if i == 1:
                            querysets_that_fit_avail["d1_d2NotNull"].append(
                                concatenateQObjs(qs, "&") & Q(d2__isnull=False)
                            )
                            querysets_that_fit_avail["d1_d2IsNull"].append(
                                concatenateQObjs(qs, "&") & Q(d2__isnull=True)
                            )
                        else:
                            querysets_that_fit_avail["d2"].append(
                                concatenateQObjs(qs, "&")
                            )

                avail_d1_d2NotNull = concatenateQObjs(
                    querysets_that_fit_avail["d1_d2NotNull"], "|"
                )
                course_codes_fit_avail_d1_d2NotNull = set(
                    q.courseID
                    for q in CourseInfo.objects.filter(avail_d1_d2NotNull)
                )
                avail_d1_d2IsNull = concatenateQObjs(
                    querysets_that_fit_avail["d1_d2IsNull"], "|"
                )
                avail_d2 = concatenateQObjs(
                    querysets_that_fit_avail["d2"], "|"
                )
                course_codes_fit_avail_d2 = set(
                    q.courseID for q in CourseInfo.objects.filter(avail_d2)
                )
                course_codes_fit_avail_all = (
                    course_codes_fit_avail_d1_d2NotNull.intersection(
                        course_codes_fit_avail_d2
                    )
                )
                queriedCourses = queriedCourses.filter(
                    courseID__in=course_codes_fit_avail_all
                ).union(CourseInfo.objects.filter(avail_d1_d2IsNull))

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
        elif "127.0.0.1" in HOSTNAME:
            self.attributes = True
            self.username = "test"

    # Get saved courses
    def get(self, request, format=None):
        self.getAttributes(request)
        if self.attributes:
            queriedCourses = CourseInfo.objects.filter(
                usercourses__userID=self.username
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
            course = CourseInfo.objects.get(courseID=selectedCourse["course"])
            UserCourses.objects.create(userID=self.username, courseID=course)
            return HttpResponse("Success")
        else:
            return HttpResponse("Unauthorised", status=401)

    # Delete course from user profile
    def delete(self, request, pk, format=None):
        self.getAttributes(request)
        if self.attributes:
            course = UserCourses.objects.filter(userID=self.username).filter(
                courseID=pk
            )
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
        "http_host": HOSTNAME,
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
        return HttpResponseRedirect(auth.login(return_to=f"https://{HOSTNAME}"))
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
                return_to=f"https://{HOSTNAME}",
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
