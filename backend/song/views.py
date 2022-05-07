from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import ArtistSerializer, RatingSerializer, SongSerializer
from .models import Artist, Rating, Song

# Create your views here.

class SongView(viewsets.ModelViewSet):
    serializer_class = SongSerializer
    queryset = Song.objects.all()

    @action(detail=False, methods=["get"])
    def notlistenedyet(self, request):
        listened_song_ids = Rating.objects.all().filter(listened=True).values_list('song', flat=True)

        songs = self.get_queryset()
        not_listened_songs = [song for song in songs if song.id not in listened_song_ids]
        not_listened_songs.sort(key=lambda x: x.views, reverse=True)

        serializer = self.get_serializer(not_listened_songs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ArtistView(viewsets.ModelViewSet):
    serializer_class = ArtistSerializer
    queryset = Artist.objects.all()

class RatingView(viewsets.ModelViewSet):
    serializer_class = RatingSerializer
    queryset = Rating.objects.all()

    def get_queryset(self):  # new
        song_id = self.request.GET.get("song", None)
        if(song_id) :
            return Rating.objects.filter(song=song_id)
        return Rating.objects.all()