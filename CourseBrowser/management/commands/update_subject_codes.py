from django.core.cache import cache
from django.core.management.base import BaseCommand

from CourseBrowser.models import CourseInfo


class Command(BaseCommand):
    def update_subject_codes(self):
        courses = CourseInfo.objects.all()
        course_codes = list(sorted(set([x.courseID.split("-")[0] for x in courses])))
        course_codes.remove("NONE")
        cache.set("course_codes", course_codes)

    def handle(self, *args, **options):
        self.update_subject_codes()
