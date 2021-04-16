"""ScheduleBrewer URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path
from CourseBrowser import views

urlpatterns = [
    path('', views.index),
    path('admin/', admin.site.urls),
    path('api/search/', views.search),
    path('api/get-saved-courses', views.getSavedCourses),
    path('api/save-course', views.saveCourse),
    re_path(r'^api/delete-course/(?P<pk>[a-zA-Z]+-[0-9]+-[0-9]+)/$', views.delCourse),
    path('getCSRF/', views.getCSRFCookie),
]