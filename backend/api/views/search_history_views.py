from rest_framework import generics, permissions
from ..models import SearchHistory
from ..serializers import SearchHistorySerializer


class SearchHistoryListCreateView(generics.ListCreateAPIView):
    serializer_class = SearchHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return SearchHistory.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SearchHistoryDeleteView(generics.DestroyAPIView):
    queryset = SearchHistory.objects.all()
    serializer_class = SearchHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SearchHistory.objects.filter(user=self.request.user)
