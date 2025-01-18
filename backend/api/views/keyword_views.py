from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from ..models import Keyword
from ..serializers import KeywordSerializer


class KeywordListView(generics.ListAPIView):
    serializer_class = KeywordSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None
    queryset = Keyword.objects.all()
