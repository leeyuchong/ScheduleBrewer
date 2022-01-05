from django.db import models


class CourseInfo(models.Model):
    courseID = models.CharField(max_length=12, primary_key=True)
    title = models.CharField(max_length=50)
    units = models.DecimalField(max_digits=2, decimal_places=1)
    sp = models.IntegerField()
    requests = models.PositiveSmallIntegerField(blank=True, null=True)
    limits = models.CharField(max_length=20, blank=True, null=True)
    offered = models.BooleanField(default=True)
    max_enr = models.PositiveSmallIntegerField(db_column="Max")
    enr = models.PositiveSmallIntegerField()
    avl = models.SmallIntegerField()
    wl = models.PositiveSmallIntegerField()
    gm = models.CharField(max_length=2)
    yl = models.IntegerField()
    pr = models.IntegerField()
    fr = models.IntegerField()
    la = models.IntegerField()
    qa = models.IntegerField()
    prereq = models.BooleanField()
    format = models.CharField(db_column="Format", max_length=3)
    xlist = models.CharField(max_length=20)
    d1 = models.CharField(max_length=5)
    time1 = models.CharField(max_length=15)
    starttime1 = models.PositiveSmallIntegerField(blank=True, null=True)
    endtime1 = models.PositiveSmallIntegerField(blank=True, null=True)
    duration1 = models.PositiveSmallIntegerField(blank=True, null=True)
    d2 = models.CharField(max_length=5, blank=True, null=True)
    time2 = models.CharField(max_length=15, blank=True, null=True)
    starttime2 = models.PositiveSmallIntegerField(blank=True, null=True)
    endtime2 = models.PositiveSmallIntegerField(blank=True, null=True)
    duration2 = models.PositiveSmallIntegerField(blank=True, null=True)
    loc = models.CharField(max_length=10)
    instructor = models.CharField(max_length=30)
    description = models.TextField()

    class Meta:
        managed = False
        db_table = "CourseInfo"


class UserCourses(models.Model):
    id = models.AutoField(primary_key=True)
    userID = models.CharField(max_length=12, db_index=True)
    courseID = models.ForeignKey(
        CourseInfo, on_delete=models.CASCADE, db_column="courseID"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["userID", "courseID"], name="unique_pairing"
            )
        ]
        managed = True
        db_table = "UserCourses"
