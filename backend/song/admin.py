from django.contrib import admin
from .models import Artist, Rating, Song

class SongAdmin(admin.ModelAdmin):
    list_display = ('id', 'title','link','views','artist')

    
class ArtistAdmin(admin.ModelAdmin):
    list_display = ('id', 'name','picture')

class RatingAdmin(admin.ModelAdmin):
    list_display = ('song','score','score_given','skipped','listened','given_on')

# Register your models here.

admin.site.register(Song, SongAdmin)
admin.site.register(Artist, ArtistAdmin)
admin.site.register(Rating, RatingAdmin)