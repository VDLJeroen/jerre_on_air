from statistics import mode
from unicodedata import name
from django.db import models

class Artist(models.Model):
    name = models.CharField(max_length=32)
    picture = models.CharField(max_length=256, null = True)

    def __str__(self):
        return self.name

class Song(models.Model):
    title = models.CharField(max_length=64)
    link = models.CharField(max_length=256)
    views = models.PositiveIntegerField()
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

class Rating(models.Model):
    song = models.ForeignKey(Song, on_delete=models.CASCADE)
    score = models.PositiveIntegerField(null = True)
    score_given = models.BooleanField()
    skipped = models.BooleanField()
    listened = models.BooleanField()
    given_on = models.DateTimeField(auto_now_add=True)